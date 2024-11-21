export interface Episode {
    number: number;
    status: 'watched' | 'started' | 'unwatched' | 'short-watched';
    lastWatched?: Date;
    duration?: number;
    href?: string;
}

export interface Season {
    number: number;
    episodes: Episode[];
}

export interface Anime {
    title: string;
    seasons: Season[];
    lastUpdated: Date;
    href?: string;
}

export interface AnimeStore {
    animeList: Anime[];
    normalSeries: Anime[];
    shortWatchedSeries: Anime[];
    isScanning: boolean;
    startScanning: () => void;
    stopScanning: () => void;
    addAnime: (anime: Anime) => void;
    updateEpisodeStatus: (animeTitle: string, seasonNumber: number, episodeNumber: number, status: 'watched' | 'started' | 'unwatched' | 'short-watched') => void;
    totalSeries: number;
    totalEpisodes: number;
    setTotalSeries: (count: number) => void;
    setTotalEpisodes: (count: number) => void;
    newSeriesCount: number;
    newEpisodesCount: number;
    setNewSeriesCount: (count: number) => void;
    setNewEpisodesCount: (count: number) => void;
    initialSeries: number;
    initialEpisodes: number;
    initializeCounts: () => void;
    loadAnimeList: () => void;
    categorizeAnimeList: () => void;
    resetAnimeList: () => void;
}

export interface EpisodeGridProps {
    episodes: Episode[];
}

export interface HistoryItem {
    seriesTitle: string;
    episodeTitle: string;
    episodeNumber: number; // This now supports decimal numbers
    season?: number;
    isWatched: boolean;
    timeLeft?: string;
    date: string;
    isMovie?: boolean;
    episodeHref: string;
    seriesHref: string;
}