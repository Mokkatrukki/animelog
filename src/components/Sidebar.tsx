import React from 'react';
import { scanningService } from '../services/ScanningService';
import { storageService } from '../services/StorageService';
import { useAnimeStore } from '../store/animeStore';
import { mergeAnimeList } from '../utils/animeUtils';
import { Anime } from '../utils/types';
import { AnimeCard } from './AnimeCard';
import { ScanningStatus } from './ScanningStatus';
import { ScanSummary } from './ScanSummary';

const Sidebar: React.FC = () => {
    const [isScanning, setIsScanning] = React.useState(false);
    const [isQuickScanning, setIsQuickScanning] = React.useState(false);
    const [showDropped, setShowDropped] = React.useState(false);
    const { 
        loadAnimeList,
        normalSeries,
        shortWatchedSeries,
        setTotalSeries,
        setTotalEpisodes,
        setNewSeriesCount,
        setNewEpisodesCount,
        initializeCounts,
        initialSeries,
        initialEpisodes,
        resetAnimeList
    } = useAnimeStore();

    React.useEffect(() => {
        loadAnimeList();
    }, []);

    React.useEffect(() => {
        const handleMessage = (message: any) => {
            if (message.type === 'SCAN_RESULTS') {
                const store = useAnimeStore.getState();
                const newList = mergeAnimeList(store.animeList, message.data as Anime[]); // Add type assertion
                
                const currentSeriesCount = newList.length;
                const currentEpisodesCount = newList.reduce((acc, anime) => 
                    acc + anime.seasons.reduce((sAcc, season) => 
                        sAcc + season.episodes.length, 0), 0);

                setTotalSeries(currentSeriesCount);
                setTotalEpisodes(currentEpisodesCount);
                setNewSeriesCount(currentSeriesCount - initialSeries);
                setNewEpisodesCount(currentEpisodesCount - initialEpisodes);
                
                storageService.saveAnimeList(newList);
                store.loadAnimeList();
            } else if (message.type === 'SCAN_STOPPED') {
                setIsScanning(false);
                setIsQuickScanning(false);
                setNewSeriesCount(0);
                setNewEpisodesCount(0);
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }, [initialSeries, initialEpisodes]);

    const handleQuickScan = () => {
        if (isQuickScanning) {
            scanningService.stopScanning();
        } else {
            // Reset counts before starting new scan
            setNewSeriesCount(0);
            setNewEpisodesCount(0);
            initializeCounts(); // Reset initial counts to current state
            scanningService.startQuickScan();
        }
        setIsQuickScanning(!isQuickScanning);
    };

    const handleFullScan = () => {
        if (isScanning) {
            scanningService.stopScanning();
        } else {
            // Reset counts before starting new scan
            setNewSeriesCount(0);
            setNewEpisodesCount(0);
            initializeCounts(); // Reset initial counts to current state
            scanningService.startScanning();
        }
        setIsScanning(!isScanning);
    };

    return (
        <div className="h-full flex flex-col bg-[#1a1a1a] p-3">
            <button 
                onClick={handleQuickScan}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mb-3 ${
                    isQuickScanning ? 'bg-red-600 hover:bg-red-700' : 'bg-[#f47521] hover:bg-[#e36512]'
                } text-white text-lg`}
            >
                {isQuickScanning ? 'Stop Quick Scan' : 'Start Quick Scan'}
            </button>
            
            <button 
                onClick={handleFullScan}
                className={`w-full py-2 px-3 rounded-lg font-medium transition-colors mb-4 ${
                    isScanning ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                } text-white`}
            >
                {isScanning ? 'Stop Full Scan' : 'Start Full Scan'}
            </button>
            
            {isQuickScanning && <ScanningStatus type="quick" />}
            {isScanning && <ScanningStatus type="full" />}
            <ScanSummary />
            <div className="overflow-y-auto flex-1 space-y-4">
                {/* Normal series section */}
                <div className="space-y-3">
                    {normalSeries.map(anime => (
                        <AnimeCard key={anime.title} anime={anime} />
                    ))}
                </div>

                {/* Short-watched series section */}
                {shortWatchedSeries.length > 0 && (
                    <div>
                        <button
                            onClick={() => setShowDropped(!showDropped)}
                            className="w-full flex items-center justify-between text-left border-t border-gray-600 pt-4 pb-2"
                        >
                            <span className="text-[#FF5722] font-medium">
                                Dropped or Short Watched Series ({shortWatchedSeries.length})
                            </span>
                            <span className={`text-gray-400 transition-transform ${showDropped ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </button>
                        {showDropped && (
                            <div className="space-y-3 mt-2">
                                {shortWatchedSeries.map(anime => (
                                    <AnimeCard key={anime.title} anime={anime} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <button 
                onClick={resetAnimeList}
                className="w-full py-2 px-3 rounded-lg font-medium transition-colors mt-4 bg-gray-600 hover:bg-gray-700 text-white"
            >
                Reset All Data
            </button>
        </div>
    );
};

export default Sidebar;