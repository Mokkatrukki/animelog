import React from 'react';
import { EpisodeGridProps } from '../utils/types';

export const EpisodeGrid: React.FC<EpisodeGridProps> = ({ episodes }) => {
    return (
        <div className="grid grid-cols-6 gap-1">
            {episodes.map(episode => (
                <a 
                    key={episode.number}
                    href={episode.href ? `https://crunchyroll.com${episode.href}` : undefined}
                    target="_blank"
                    rel="noopener"
                    className={`text-center py-1 text-xs rounded transition-colors no-underline 
                        ${!episode.href ? 'pointer-events-none' : 'hover:opacity-80'} ${
                        episode.status === 'watched'
                            ? 'bg-[#4CAF50] text-white'
                            : episode.status === 'started'
                            ? 'bg-[#FFC107] text-black'
                            : episode.status === 'short-watched'
                            ? 'bg-[#FF5722] text-white'
                            : 'bg-[#7e7e7e] text-white'
                    }`}
                >
                    {episode.number === -1 ? 'movie' : episode.number}
                </a>
            ))}
        </div>
    );
};