import React from 'react';
import { Anime } from '../utils/types';
import { EpisodeGrid } from './EpisodeGrid';

interface AnimeCardProps {
    anime: Anime;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
    return (
        <div className="bg-[#2a2a2a] rounded-lg p-3 shadow-md">
            <a 
                href={anime.href ? `https://crunchyroll.com${anime.href}` : undefined}
                target="_blank"
                rel="noopener"
                className={`block text-base font-medium text-white mb-2 no-underline 
                    ${anime.href ? 'hover:text-[#f47521]' : 'pointer-events-none'}`}
            >
                {anime.title}
            </a>
            {anime.seasons.map(season => (
                <div key={season.number} className="mb-3 last:mb-0">
                    <h4 className="text-xs font-medium text-gray-300 mb-1.5">
                        Season {season.number}
                    </h4>
                    <EpisodeGrid episodes={season.episodes} />
                </div>
            ))}
        </div>
    );
};