# AnimeLog

A Chrome extension for tracking anime series and episodes from Crunchyroll. Scans your watch history and maintains an organized list with watch status tracking.

## Features

### Dual Scanning Modes
- **Quick Scan**: Scans currently visible history items
- **Full Scan**: Complete history scan with auto-scrolling

### Watch Status Tracking
- **Watched** (Green)
- **Started** (Yellow)
- **Unwatched** (Grey)

### Series Organization
- Automatic season detection
- Episode grid layout
- Progress tracking per series

### Statistics
- Total series count
- Total episodes count
- New content indicators

## Development Status

### ✅ Completed:
- Core scanning functionality
- Local storage integration
- Watch status tracking
- Basic UI components
- Dark theme implementation

### 🚧 In Progress:
- Search and filtering
- Episode details popup
- Bulk status updates
- Settings management

## Project Structure

## Technical Stack
- React 18
- TypeScript
- Zustand (State Management)
- Tailwind CSS
- Chrome Extension APIs

## Build Instructions
The built extension will be available in the `dist` directory.
## SAM Configuration
1. Copy `samconfig.template.toml` to `samconfig.toml`
2. Update with your MAL API credentials

