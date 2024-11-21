import React from 'react';
import { useAnimeStore } from '../store/animeStore';

export const ScanSummary: React.FC = () => {
    const { totalSeries, totalEpisodes, newSeriesCount, newEpisodesCount } = useAnimeStore();
    
    return (
        <div className="mb-4 p-2 bg-[#2a2a2a] rounded-lg text-xs text-white">
            <div className="flex justify-between mb-1">
                <span>Total Series:</span>
                <span>
                    {totalSeries}
                    {newSeriesCount > 0 && (
                        <span className="ml-1 text-green-400">(+{newSeriesCount})</span>
                    )}
                </span>
            </div>
            <div className="flex justify-between mb-1">
                <span>Total Episodes:</span>
                <span>
                    {totalEpisodes}
                    {newEpisodesCount > 0 && (
                        <span className="ml-1 text-green-400">(+{newEpisodesCount})</span>
                    )}
                </span>
            </div>
        </div>
    );
};