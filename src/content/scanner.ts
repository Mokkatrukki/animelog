import { Anime, Episode, HistoryItem } from '../utils/types';

export class Scanner {
    private isScanning = false;
    private processedItems = new Set<string>();
    private lastScannedPosition = 0;
    private noNewItemsCount = 0;
    private readonly SCROLL_INCREMENT = 1500;  // Reduced from 2000
    private readonly SCROLL_DELAY = 1250;      // Increased from 1000
    private readonly MAX_NO_NEW_ATTEMPTS = 3;
    private readonly ROW_HEIGHT = 279; // Height of each content row
    private readonly MAX_WAIT_TIME = 5000; // Maximum time to wait for new elements (ms)
    private readonly WAIT_INTERVAL = 500;  // Check interval for new elements (ms)
    private lastElementCount = 0;

    async startScanning(): Promise<void> {
        if (this.isScanning) return;
        this.isScanning = true;
        this.processedItems.clear();
        this.lastScannedPosition = 0;
        this.noNewItemsCount = 0;
        
        console.log('Scanning started');
        chrome.runtime.sendMessage({ type: 'SCAN_STARTED' });
        
        await this.scanProgressively();
    }

    async startQuickScan(): Promise<void> {
        if (this.isScanning) return;
        this.isScanning = true;
        this.processedItems.clear();
        
        console.log('Quick scan started');
        chrome.runtime.sendMessage({ type: 'SCAN_STARTED' });

        while (this.isScanning) {
            const items = await this.scanCurrentView();
            if (items.length > 0) {
                const animeData = this.convertToAnimeData(items);
                chrome.runtime.sendMessage({ 
                    type: 'SCAN_RESULTS', 
                    data: animeData 
                });
            }
            await new Promise(resolve => setTimeout(resolve, 2000)); // Scan every 2 seconds
        }
    }

    stopScanning(): void {
        this.isScanning = false;
        this.processedItems.clear();
        this.lastScannedPosition = 0;
        this.noNewItemsCount = 0;
        console.log('Scanning stopped');
        chrome.runtime.sendMessage({ type: 'SCAN_STOPPED' });
    }

    private async scanProgressively(): Promise<void> {
        while (this.isScanning) {
            const newItems = await this.scanCurrentView();
            
            if (newItems.length === 0) {
                this.noNewItemsCount++;
                if (this.noNewItemsCount >= this.MAX_NO_NEW_ATTEMPTS) {
                    console.log('No new items found after multiple attempts, stopping scan');
                    break;
                }
            } else {
                this.noNewItemsCount = 0;
                const animeData = this.convertToAnimeData(newItems);
                chrome.runtime.sendMessage({ 
                    type: 'SCAN_RESULTS', 
                    data: animeData
                });
            }

            await this.scrollAndWait();
        }

        this.stopScanning();
    }

    private async scanCurrentView(): Promise<HistoryItem[]> {
        const results: HistoryItem[] = [];
        let items = document.querySelectorAll('.erc-my-lists-item');
        
        // Wait for new elements if we're at the bottom and count hasn't changed
        if (items.length === this.lastElementCount && this.isNearBottom()) {
            const newElementsLoaded = await this.waitForNewElements(items.length);
            if (!newElementsLoaded) {
                console.log('No new elements loaded after waiting');
                return results;
            }
            items = document.querySelectorAll('.erc-my-lists-item');
        }

        this.lastElementCount = items.length;

        // Log all found items for debugging
        console.log('Found items details:', {
            totalItems: items.length,
            visibleItems: Array.from(items).filter(item => {
                const rect = item.getBoundingClientRect();
                return rect.top >= 0 && rect.bottom <= window.innerHeight;
            }).length,
            viewport: `${window.innerHeight}px`,
            processedCount: this.processedItems.size
        });

        for (const item of items) {
            const itemKey = this.getItemKey(item);
            
            // Debug log for skipped items
            if (this.processedItems.has(itemKey)) {
                console.debug('Skipping duplicate:', {
                    key: itemKey,
                    position: item.getBoundingClientRect().top
                });
                continue;
            }

            const historyItem = this.parseHistoryItem(item);
            if (historyItem) {
                // Log successful item parse
                console.debug('Successfully parsed item:', {
                    title: historyItem.seriesTitle,
                    episode: historyItem.episodeNumber,
                    season: historyItem.season
                });
                results.push(historyItem);
                this.processedItems.add(itemKey);
            } else {
                // Log failed parse attempts
                console.warn('Failed to parse item:', {
                    key: itemKey,
                    element: item.innerHTML.substring(0, 100) + '...'
                });
            }
        }

        // Summary log
        console.log('Scan summary:', {
            newItems: results.length,
            totalProcessed: this.processedItems.size,
            position: this.lastScannedPosition,
            heightReached: Math.max(...Array.from(items).map(item => item.getBoundingClientRect().bottom))
        });

        return results;
    }

    private async waitForNewElements(currentCount: number): Promise<boolean> {
        const startTime = Date.now();
        
        while (Date.now() - startTime < this.MAX_WAIT_TIME) {
            await new Promise(resolve => setTimeout(resolve, this.WAIT_INTERVAL));
            const newCount = document.querySelectorAll('.erc-my-lists-item').length;
            
            if (newCount > currentCount) {
                console.log(`New elements loaded: ${newCount - currentCount}`);
                return true;
            }
        }
        
        return false;
    }

    private isNearBottom(): boolean {
        return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
    }

    private getItemKey(item: Element): string {
        const titleEl = item.querySelector('.history-playable-card__show-title--Ufpz3');
        const episodeEl = item.querySelector('.history-playable-card__title-link--vSAJy');
        const position = item.getBoundingClientRect().top;
        // Add position to key to handle duplicate episodes
        return `${titleEl?.textContent}-${episodeEl?.textContent}-${Math.floor(position)}`.replace(/\s+/g, '');
    }

    private parseHistoryItem(item: Element): HistoryItem | null {
        try {
            const titleElement = item.querySelector('.history-playable-card__show-title--Ufpz3');
            const episodeElement = item.querySelector('.history-playable-card__title-link--vSAJy');
            const episodeText = episodeElement?.textContent?.trim() || '';
            
            // If no separate series title exists, use the episode title as series title
            let seriesTitle = titleElement?.textContent?.trim() || '';
            if (!seriesTitle && episodeText) {
                seriesTitle = episodeText;
            }
            
            if (!seriesTitle) return null;

            const episodeInfo = this.parseEpisodeInfo(episodeText);
            const isMovie = episodeInfo.episode === -1;

            const statusElement = item.querySelector('.playable-thumbnail__duration--p-Ldq');
            const isWatched = statusElement?.textContent?.trim() === 'Watched';
            const timeLeft = !isWatched ? statusElement?.textContent?.trim() : undefined;

            const dateElement = item.querySelector('.history-playable-card__footer-meta--mE2XC');
            const date = dateElement?.textContent?.trim() || new Date().toISOString();

            const episodeLink = item.querySelector('.history-playable-card__title-link--vSAJy');
            const seriesLink = item.querySelector('.history-playable-card__show-link--fe0Xz');
            
            return {
                seriesTitle,
                episodeTitle: isMovie ? seriesTitle : episodeText, // Use series title for movies
                episodeNumber: episodeInfo.episode,
                season: episodeInfo.season,
                isWatched,
                timeLeft,
                date,
                isMovie,
                episodeHref: episodeLink?.getAttribute('href') || '',
                seriesHref: seriesLink?.getAttribute('href') || ''
            };
        } catch (error) {
            console.error('Error parsing history item:', error);
            return null;
        }
    }

    private parseEpisodeInfo(title: string): { episode: number; season?: number } {
        // Handle "S2 E0" pattern
        const seasonMatch = title.match(/S(\d+)\s*E(\d+(?:\.\d+)?)/i);
        if (seasonMatch) {
            return {
                season: parseInt(seasonMatch[1]),
                episode: parseFloat(seasonMatch[2])
            };
        }

        // Handle "E15.5" pattern
        const episodeMatch = title.match(/E(\d+(?:\.\d+)?)/i);
        if (episodeMatch) {
            return {
                episode: parseFloat(episodeMatch[1])
            };
        }

        // Handle "Episode 15.5" pattern
        const numberMatch = title.match(/Episode\s+(\d+(?:\.\d+)?)/i);
        if (numberMatch) {
            return {
                episode: parseFloat(numberMatch[1])
            };
        }

        // If no episode number pattern is found, treat as movie
        return { episode: -1 };
    }

    private async scrollAndWait(): Promise<void> {
        return new Promise(resolve => {
            const previousPosition = this.lastScannedPosition;
            this.lastScannedPosition += this.SCROLL_INCREMENT;
            
            console.log(`Scroll increment:`, {
                from: previousPosition,
                to: this.lastScannedPosition,
                rowsScanned: Math.floor(this.lastScannedPosition / this.ROW_HEIGHT),
                approximateProgress: `${Math.floor((this.lastScannedPosition / 108528) * 100)}%`,
                isNearBottom: this.isNearBottom()
            });

            window.scrollTo({
                top: this.lastScannedPosition,
                behavior: 'smooth'
            });
            setTimeout(resolve, this.SCROLL_DELAY);
        });
    }

    private parseDurationToMinutes(duration: string): number {
        const hours = duration.match(/(\d+)h/);
        const minutes = duration.match(/(\d+)m/);
        
        let totalMinutes = 0;
        if (hours) totalMinutes += parseInt(hours[1]) * 60;
        if (minutes) totalMinutes += parseInt(minutes[1]);
        
        return totalMinutes;
    }

    private determineWatchStatus(isWatched: boolean, timeLeft: string | undefined, isMovie: boolean): 'watched' | 'started' | 'short-watched' {
        console.log('Determining watch status:', { isWatched, timeLeft, isMovie });
        
        if (!timeLeft) return 'watched';
        
        const minutesLeft = this.parseDurationToMinutes(timeLeft);
        const threshold = isMovie ? 70 : 20;
        
        return minutesLeft > threshold ? 'short-watched' : 'started';
    }

    private convertToAnimeData(items: HistoryItem[]): Anime[] {
        const animeMap = new Map<string, Map<number, Map<number, Episode[]>>>();

        // Group episodes by series, season, and episode number
        items.forEach(item => {
            if (!animeMap.has(item.seriesTitle)) {
                animeMap.set(item.seriesTitle, new Map());
            }
            
            const seasonMap = animeMap.get(item.seriesTitle)!;
            const seasonNum = item.season || 1;
            
            if (!seasonMap.has(seasonNum)) {
                seasonMap.set(seasonNum, new Map());
            }

            const episodeMap = seasonMap.get(seasonNum)!;
            if (!episodeMap.has(item.episodeNumber)) {
                episodeMap.set(item.episodeNumber, []);
            }

            const episodeStates = episodeMap.get(item.episodeNumber)!;
            episodeStates.push({
                number: item.episodeNumber,
                status: this.determineWatchStatus(item.isWatched, item.timeLeft, !!item.isMovie),
                lastWatched: new Date(item.date),
                duration: item.timeLeft ? this.parseDurationToMinutes(item.timeLeft) : undefined,
                href: item.episodeHref
            });
        });

        // Convert to Anime array with resolved watch states
        return Array.from(animeMap.entries()).map(([title, seasonMap]) => ({
            title,
            seasons: Array.from(seasonMap.entries()).map(([number, episodeMap]) => ({
                number,
                episodes: Array.from(episodeMap.entries()).map(([number, states]) => {
                    // Get the most complete watch state and use episode number from the map key
                    const finalState = this.resolveFinalWatchState(states);
                    return {
                        ...finalState,
                        number // Use the episode number from the map key
                    };
                }).sort((a, b) => a.number - b.number)
            })).sort((a, b) => a.number - b.number),
            lastUpdated: new Date(),
            href: items.find(item => item.seriesTitle === title)?.seriesHref
        }));
    }

    private resolveFinalWatchState(states: Episode[]): Episode {
        // Sort by date to get the most recent state, with null check
        states.sort((a, b) => {
            const timeA = a.lastWatched?.getTime() ?? 0;
            const timeB = b.lastWatched?.getTime() ?? 0;
            return timeB - timeA;
        });

        // If any state is 'watched', use that
        const watchedState = states.find(s => s.status === 'watched');
        if (watchedState) return watchedState;

        // If no 'watched' state, prefer 'started' over 'short-watched'
        const startedState = states.find(s => s.status === 'started');
        if (startedState) return startedState;

        // Default to the most recent state if no better status is found
        return states[0];
    }
}

// Initialize scanner
const scanner = new Scanner();

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    console.log('Received message in content script:', message);
    switch (message.type) {
        case 'START_SCAN':
            scanner.startScanning();
            sendResponse({ success: true });
            break;
        case 'QUICK_SCAN':
            scanner.startQuickScan();
            sendResponse({ success: true });
            break;
        case 'STOP_SCAN':
            scanner.stopScanning();
            sendResponse({ success: true });
            break;
    }
    return true;
});