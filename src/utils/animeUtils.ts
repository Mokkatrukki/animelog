import { Anime } from './types';

export const mergeAnimeList = (existing: Anime[], newItems: Anime[]): Anime[] => {
    const merged = new Map(existing.map(anime => [anime.title, anime]));
    
    newItems.forEach(newAnime => {
        const existingAnime = merged.get(newAnime.title);
        if (existingAnime) {
            newAnime.seasons.forEach(newSeason => {
                const existingSeason = existingAnime.seasons.find(s => s.number === newSeason.number);
                if (existingSeason) {
                    newSeason.episodes.forEach(newEp => {
                        if (!existingSeason.episodes.find(e => e.number === newEp.number)) {
                            existingSeason.episodes.push(newEp);
                        }
                    });
                    existingSeason.episodes.sort((a, b) => a.number - b.number);
                } else {
                    existingAnime.seasons.push(newSeason);
                }
            });
            existingAnime.lastUpdated = new Date();
        } else {
            merged.set(newAnime.title, newAnime);
        }
    });

    return Array.from(merged.values());
};

export const countNewEpisodes = (existing: Anime[], newItems: Anime[]): number => {
    let count = 0;
    newItems.forEach(newAnime => {
        const existingAnime = existing.find(e => e.title === newAnime.title);
        if (!existingAnime) {
            count += newAnime.seasons.reduce((acc, season) => acc + season.episodes.length, 0);
        } else {
            newAnime.seasons.forEach(newSeason => {
                const existingSeason = existingAnime.seasons.find(s => s.number === newSeason.number);
                if (!existingSeason) {
                    count += newSeason.episodes.length;
                } else {
                    newSeason.episodes.forEach(newEp => {
                        if (!existingSeason.episodes.find(e => e.number === newEp.number)) {
                            count++;
                        }
                    });
                }
            });
        }
    });
    return count;
};