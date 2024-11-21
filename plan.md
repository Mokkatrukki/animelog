# AnimeLog Extension Development Plan - Version 1

## 1. Data Model Implementation [DONE]
- [x] Create Anime interface
- [x] Create Episode interface
- [x] Create Season interface
- [x] Implement data type definitions in utils/types.ts

## 2. Storage Service [DONE]
- [x] Implement LocalStorage wrapper
- [x] Add methods for saving/retrieving anime data
- [x] Add methods for updating episode status
- [x] Add error handling for storage operations

## 3. Scanning Service [DONE]
- [x] Create service structure
- [x] Implement Crunchyroll history page selector logic
- [x] Add scroll event listener for infinity scroll
- [x] Add parsing logic for anime titles and episodes
- [x] Add parsing logic for episode status (watched/started)
- [x] Implement metadata extraction (dates, duration)
- [x] Add error handling for scanning failures

## 4. UI Components [DONE]
- [x] Create main side panel layout
- [x] Implement scan control button
- [x] Update dark theme styling
- [x] Implement episode grid layout
- [x] Add episode status colors
- [x] Add episode hover effects
- [x] Optimize layout for side panel
- [x] Implement responsive grid
- [x] Add loading indicator during scanning
- [x] Add error messages display
- [x] Improve episode grid layout for many episodes
- [x] Add collapsible seasons
- [x] Add scroll position tracking
- [x] Add anime filtering and search
- [x] Implement episode details popup
- [x] Add bulk status update functionality

## 5. State Management with Zustand [DONE]
- [x] Basic store setup
- [x] Add loading states
- [x] Add error handling states
- [x] Add scroll position tracking
- [x] Persist state between extension reloads
- [x] Add filtering and search state

## 6. Chrome Extension Setup [DONE]
- [x] Basic manifest setup
- [x] Add content script for page scanning
- [x] Setup communication between content script and side panel
- [x] Add extension icon and popup
- [x] Add proper error handling for Chrome APIs
- [x] Add extension settings page
- [x] Implement auto-update mechanism

## 7. Enhanced Scanning Features [DONE]
- [x] Implement Quick Scan feature
- [x] Implement Full Scan feature
- [x] Track new series and episodes during scanning
- [x] Display scanning status for both Quick Scan and Full Scan
- [x] Reset counts when starting a new scan
- [x] Ensure consistent behavior for both scan modes

## Current Status Summary
1. ✅ Core Data Models & Interfaces
2. ✅ Basic Extension Structure
3. ✅ Storage Service Implementation
4. ✅ Scanning Service Implementation
5. ✅ Enhanced UI Features
6. ✅ Extension Settings
7. ✅ Enhanced Scanning Features

## Immediate Next Task
Enhance UI functionality:
1. Implement search and filtering
2. Add episode details popup
3. Add bulk status updates
4. Create settings page

## Current Blockers
- Performance optimization needed for large datasets
- UI responsiveness during scanning
- Settings persistence implementation

## Next Steps (In Priority Order)
1. **Implement Enhanced UI Features**
   - Add search and filtering functionality
   - Create episode details popup
   - Implement bulk status updates
   - Add settings page UI

2. **Optimize Performance**
   - Implement virtual scrolling for large lists
   - Optimize state updates
   - Add data caching

3. **Add Settings Management**
   - Create settings storage service
   - Implement settings UI
   - Add import/export functionality

4. **Testing Required**
   - Test search and filtering
   - Test bulk updates
   - Test settings persistence
   - Performance testing with large datasets

## Dependencies
- Zustand for state management
- React for UI components
- Chrome Extension APIs
- Local Storage API

## Known Issues
- No error handling for failed scans
- No progress indication during scanning
- No persistence between extension reloads

## Color Scheme [IMPLEMENTED]
- Primary: Orange (#f47521) - Main actions, highlights
- Background: Dark (#1a1a1a) - Main background
- Container: Dark Gray (#2a2a2a) - Card backgrounds
- Watched: Green (#4CAF50) - Completed episodes
- Started: Yellow (#FFC107) - In-progress episodes
- Unwatched: Grey (#7e7e7e) - Not started episodes
- Text: White (#ffffff) - Primary text
- Text Secondary: Grey (#9ca3af) - Secondary text

## Design Guidelines [NEW]
- Use shadows sparingly for depth (shadow-md)
- Maintain consistent spacing (p-3, gap-1.5)
- Use smaller text for better space efficiency
- Grid layout: 6 columns for episodes
- Hover effects: opacity-80 for interactive elements
- Animations: Use for status indicators only
- Border radius: rounded-lg for containers, rounded for elements

## Data Structure
```typescript
interface Episode {
    number: number;
    status: 'watched' | 'started' | 'unwatched';
    lastWatched?: Date;
    duration?: string;
}

interface Season {
    number: number;
    episodes: Episode[];
}

interface Anime {
    title: string;
    seasons: Season[];
    lastUpdated: Date;
}
```

## Project Structure
```
src/ 
├── background.ts 
├── components/ │ 
├── AnimeCard.tsx │ 
├── EpisodeGrid.tsx │ 
├── ScanningStatus.tsx 
│ └── Sidebar.tsx 
├── content/ │
└── scanner.ts 
├── services/ 
│ ├── StorageService.ts 
│ └── ScanningService.ts 
├── store/ 
│ └── animeStore.ts 
└── utils/ 
  ├── types.ts 
  └── animeUtils.ts
```


## Project Structure

### Files and Responsibilities

- **background.ts**: Chrome extension background script for side panel setup
- **manifest.json**: Chrome extension configuration and permissions
- **components/**: React UI components
   - **AnimeCard.tsx**: Displays individual anime with its seasons and episodes
   - **EpisodeGrid.tsx**: Renders episode grid with status colors and interactions
   - **ScanningStatus.tsx**: Shows scanning progress and new episodes count
   - **Sidebar.tsx**: Main layout component handling scanning and anime list display
- **content/**: Chrome extension content scripts
   - **scanner.ts**: Scans Crunchyroll history page and extracts anime data
- **services/**: Business logic and data handling
   - **StorageService.ts**: Manages local storage operations for anime data
   - **ScanningService.ts**: Controls content script scanning operations
- **store/**: State management
   - **animeStore.ts**: Zustand store for managing global application state
- **utils/**: Helper functions and types
   - **types.ts**: TypeScript interfaces and types definitions
   - **animeUtils.ts**: Utility functions for merging and counting episodes

### Future Enhancements (Version 2)

- MyAnimeList integration
- Infinity scroll implementation
- Manual episode status editing
- Data export/import functionality

### Plan for Future Rework

#### Scanned Episodes Feature

**Current Status**
- The scanned episodes feature has been removed from the codebase to simplify the current implementation and avoid confusion.

**Future Work**
- Reintroduce the scanned episodes feature with a clear definition and purpose.
- Ensure that the feature accurately tracks the number of episodes scanned during a session.
- Update the UI to reflect the scanned episodes count in a meaningful way.

**Steps to Reintroduce**
1. Define the purpose and scope of the scanned episodes feature.
2. Update the AnimeStore to include `scannedEpisodes` and related methods.
3. Modify the Sidebar component to handle scanned episodes correctly.
4. Ensure that the ScanSummary component displays the scanned episodes count.
5. Test the implementation thoroughly to ensure accuracy and usability.

**Notes**
- Consider user feedback to determine the best way to present scanned episodes information.
- Ensure that the feature does not introduce performance issues or bugs.

### Quick Scan Feature Implementation [DONE]

**Changes Made**
- Added new Quick Scan feature as an alternative to Full Scan.
- Quick Scan scans only currently visible items without auto-scrolling.
- Both scan modes are now toggleable with stop functionality.
- Quick Scan repeats every 2 seconds while active.
- UI updated to show both scan options with distinct styling.
   - Quick Scan: Primary orange color, larger button.
   - Full Scan: Secondary gray color, standard button.

**Technical Details**
- Added `startQuickScan` methods to Scanner and ScanningService.
- Updated message handling to support `QUICK_SCAN` type.
- Added `isQuickScanning` state to Sidebar component.
- Both scan modes share the same stop functionality.
- Both scan modes update anime list continuously while active.

**Future Improvements Needed**
- Add separate progress indicators for each scan mode.
- Consider adding scan statistics per mode.
- Add user preferences for scan intervals.
- Consider adding auto-stop timer for Quick Scan.
