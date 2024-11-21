import { create } from 'zustand';
import { storageService } from '../services/StorageService';
import { Anime, AnimeStore } from '../utils/types';

export const useAnimeStore = create<AnimeStore>()((set, get) => ({
    animeList: [],
    normalSeries: [],
    shortWatchedSeries: [],
    isScanning: false,
    startScanning: () => set({ isScanning: true }),
    stopScanning: () => set({ isScanning: false }),
    addAnime: (anime) => set((state) => ({ animeList: [...state.animeList, anime] })),
    updateEpisodeStatus: (animeTitle, seasonNumber, episodeNumber, status) => set((state) => {
        const newList = state.animeList.map(anime => 
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
        storageService.saveAnimeList(newList);
        return { animeList: newList };
    }),
    totalSeries: 0,
    totalEpisodes: 0,
    setTotalSeries: (count) => set({ totalSeries: count }),
    setTotalEpisodes: (count) => set({ totalEpisodes: count }),
    newSeriesCount: 0,
    newEpisodesCount: 0,
    setNewSeriesCount: (count) => set({ newSeriesCount: count }),
    setNewEpisodesCount: (count) => set({ newEpisodesCount: count }),
    initialSeries: 0,
    initialEpisodes: 0,
    initializeCounts: () => {
        const storedList = storageService.getAnimeList();
        const seriesCount = storedList.length;
        const episodesCount = storedList.reduce((acc, anime) => 
            acc + anime.seasons.reduce((sAcc, season) => 
                sAcc + season.episodes.length, 0), 0);
        
        set({ 
            initialSeries: seriesCount,
            initialEpisodes: episodesCount,
            totalSeries: seriesCount,
            totalEpisodes: episodesCount,
            newSeriesCount: 0,
            newEpisodesCount: 0
        });
    },
    loadAnimeList: () => {
        const list = storageService.getAnimeList();
        set({ animeList: list });
        get().categorizeAnimeList();
        get().initializeCounts();
    },
    categorizeAnimeList: () => {
        const { animeList } = get();
        const categorized = animeList.reduce((acc, anime) => {
            const isOnlyShortWatched = anime.seasons.every(season =>
                season.episodes.every(ep => ep.status === 'short-watched')
            );
            
            if (isOnlyShortWatched) {
                acc.shortWatchedSeries.push(anime);
            } else {
                acc.normalSeries.push(anime);
            }
            
            return acc;
        }, {
            normalSeries: [] as Anime[],
            shortWatchedSeries: [] as Anime[]
        });

        set({
            normalSeries: categorized.normalSeries,
            shortWatchedSeries: categorized.shortWatchedSeries
        });
    },
    resetAnimeList: () => {
        storageService.saveAnimeList([]);
        set({ 
            animeList: [],
            normalSeries: [],
            shortWatchedSeries: [],
            totalSeries: 0,
            totalEpisodes: 0,
            newSeriesCount: 0,
            newEpisodesCount: 0
        });
    }
}));