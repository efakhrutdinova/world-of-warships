# World of Warships Home Task


## Features

✨ **Complete Ship Database**
- Browse all available ships from World of Warships API
- View detailed ship information (name, nation, type, tier)
- Lazy-loaded ship images for optimal performance

🔍 **Advanced Filtering**
- Filter by ship nation (USA, USSR, Germany, Japan, Britain, France, etc.)
- Filter by ship type (Battleship, Cruiser, Destroyer, etc.)
- Filter by tier level (1-10)
- Multiple selection support for each filter category
- Quick reset button to clear all filters

🔎 **Powerful Search**
- Real-time search by ship name
- Search by nation or ship type
- Instant results as you type
- Clear button for quick reset

📱 **Responsive Design**
- Mobile-first approach
- Works seamlessly on desktop, tablet, and mobile devices
- Optimized grid layouts for all screen sizes
- Touch-friendly interface

⚡ **Performance Optimized**
- Lazy image loading for better initial load time
- Data caching to minimize API calls (30-minute cache duration)
- Virtual scrolling ready for large datasets
- Efficient filtering and search algorithms

🎮 **Game-like UI**
- Dark theme inspired by World of Warships aesthetic
- Gradient overlays and modern styling
- Smooth animations and transitions
- Color-coded elements (premium badge, nation indicators)

🛡️ **Error Handling**
- Graceful error messages
- Retry mechanism for failed API calls
- Timeout handling for API requests
- User-friendly feedback

## Tech Stack

- **Frontend Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Testing**: Vitest, Testing Library
- **Styling**: Scoped CSS with CSS Grid/Flexbox

## Project Structure

```
src/
├── components/          # Vue components
│   ├── ShipCard.vue    # Individual ship card with hover effects
│   ├── ShipList.vue    # Main grid container with loading/error states
│   ├── SearchBar.vue   # Search input with clear functionality
│   └── FilterPanel.vue # Sticky filter sidebar
├── services/           # API and data management
│   └── wowsApi.ts      # WOWS API client with caching
├── types/              # TypeScript interfaces
│   └── ships.ts        # Type definitions for ships, nations, types
├── composables/        # Vue 3 composables (reusable logic)
│   ├── useShipFilters.ts
│   └── useShipSearch.ts
├── __tests__/          # Unit tests
│   ├── services/
│   └── composables/
├── App.vue             # Main application component
├── main.ts             # Application entry point
└── style.css           # Global styles
```

## Installation

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Type check
npm run lint
```

## Development

### Running the Dev Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## API Data Sources

The application fetches data from the following World of Warships API endpoints:

- **Vehicles**: `https://vortex.worldofwarships.eu/api/encyclopedia/en/vehicles/`
- **Nations**: `https://vortex.worldofwarships.eu/api/encyclopedia/en/nations/`
- **Ship Types**: `https://vortex.worldofwarships.eu/api/encyclopedia/en/vehicle_types_common/`
- **Media Path**: `https://vortex.worldofwarships.eu/api/encyclopedia/en/media_path/`

All API responses are cached for 30 minutes to reduce network requests and improve performance.

## Testing

The project includes comprehensive unit tests for:
- Data parsing and API client functionality
- Filter composable logic
- Search functionality

```bash
# Run all tests
npm run test

# Run tests in watch mode (default in dev)
npm run test

# Open test UI dashboard
npm run test:ui
```

## Features Implementation Details

### Filtering System
The filtering system uses Vue 3's Composition API composables for clean, reusable logic:
- `useShipFilters`: Manages filter state and computed filtered results
- Supports multi-select for each filter category
- Efficient filtering algorithms for large datasets

### Search
Real-time search across ship names, nations, and types:
- Case-insensitive matching
- Works in combination with filters
- Instant feedback

### Error Handling
- Network errors are caught and displayed with user-friendly messages
- Retry button allows users to attempt API calls again
- Timeouts are set to 10 seconds per request

### Performance Optimizations
1. **API Caching**: Results cached for 30 minutes in memory
2. **Lazy Image Loading**: `loading="lazy"` attribute on all images
3. **CSS Grid**: Responsive grid that adapts to screen size
4. **Computed Properties**: Vue's reactivity system ensures efficient re-renders

