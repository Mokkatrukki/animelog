import { Anime } from '../utils/types';

class StorageService {
    private storageKey = 'animeLog';

    saveAnimeList(animeList: Anime[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(animeList));
    }

    // Helper to preserve href fields during JSON parse
    private parseAnimeList(data: string): Anime[] {
        const list = JSON.parse(data);
        return list.map((anime: Anime) => ({
            ...anime,
            lastUpdated: new Date(anime.lastUpdated),
            seasons: anime.seasons.map(season => ({
                ...season,
                episodes: season.episodes.map(episode => ({
                    ...episode,
                    lastWatched: episode.lastWatched ? new Date(episode.lastWatched) : undefined
                }))
            }))
        }));
    }

    getAnimeList(): Anime[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? this.parseAnimeList(data) : [];
    }

    updateEpisodeStatus(animeTitle: string, seasonNumber: number, episodeNumber: number, status: 'watched' | 'started' | 'unwatched' | 'short-watched'): void {
        const animeList = this.getAnimeList();
        const updatedList = animeList.map(anime => 
            anime.title === animeTitle ? {
                ...anime,
                seasons: anime.seasons.map(season => 
                    season.number === seasonNumber ? {
                        ...season,
                        episodes: season.episodes.map(episode => 
                            episode.number === episodeNumber ? { ...episode, status } : episode
                        )
                    } : season
                )
            } : anime
        );
        this.saveAnimeList(updatedList);
    }
}

export const storageService = new StorageService();