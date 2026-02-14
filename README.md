# MySolat - Waktu Solat Malaysia

A prayer times application for Malaysia, built with Ruby on Rails. Integrates with [JAKIM's e-Solat API](https://www.e-solat.gov.my) to display prayer times across 60+ Malaysian zones.

**Live:** [solat.my](https://solat.my)

## Features

- **Prayer Times** - Daily, monthly, and yearly schedules with real-time countdown
- **Fasting Times** - Imsak and berbuka puasa schedules
- **Auto-Detect Zone** - GPS-based zone detection using JAKIM boundary data (GeoJSON point-in-polygon)
- **Islamic Calendar** - Upcoming Islamic events with Hijri dates
- **Qiblah Compass** - Prayer direction finder
- **Interactive Maps** - Masjid, surau locations and JAKIM zone boundaries
- **Offline Support** - PWA with service worker and IndexedDB caching
- **12/24 Hour Format** - User-selectable time display
- **Theming** - Multiple DaisyUI themes

## Tech Stack

- **Backend:** Ruby 4.0.1, Rails 8.1, SQLite3
- **Frontend:** Hotwire (Turbo + Stimulus), Tailwind CSS v4, DaisyUI
- **API Client:** Flexirest (JAKIM e-Solat API)
- **Maps:** Leaflet + CARTO
- **Build:** esbuild, PostCSS
- **PWA:** Workbox

## Getting Started

### Prerequisites

- Ruby 4.0.1
- Node 24+
- Yarn 4

### Setup

```bash
bin/setup
```

This installs dependencies, prepares the database, and starts the server.

### Development

```bash
bin/dev
```

Starts three processes via Foreman:
- `web` - Rails server
- `js` - esbuild (watch mode)
- `css` - Tailwind CSS (watch mode)

## Architecture

This app is **data-driven without database persistence** for core data:

- **Location/zone data** is hardcoded in `app/models/location.rb` (60+ zones with codes and coordinates)
- **Prayer times** are fetched live from JAKIM API via `Jakim::ApiResource`
- **Client-side caching** stores yearly prayer data in IndexedDB for offline access
- **Zone codes** are uppercase identifiers (e.g., `SGR01`, `JHR01`, `WLY01`)

### JAKIM API Integration

The API client (`app/resources/jakim/api_resource.rb`) wraps JAKIM's e-Solat endpoints with intelligent cache expiry:

| Endpoint | Cache Expiry |
|----------|-------------|
| Daily prayer times | End of day |
| Monthly prayer times | End of month |
| Yearly prayer times | End of year |
| Islamic events | End of year |

```

## API

JSON endpoints available at `/api`:

```
GET /api/locations            # All zones/locations
GET /api/daily/:zone          # Daily prayer times
GET /api/monthly/:zone/:month # Monthly prayer times
GET /api/yearly/:zone/:year   # Yearly prayer times
```

Example:

```bash
curl https://solat.my/api/daily/SGR01
curl https://solat.my/api/monthly/WLY01/3
curl https://solat.my/api/yearly/JHR01/2026
```

## Testing

```bash
bin/rails test            # Unit & integration tests
bin/rails test:system     # System tests (Capybara/Selenium)
```

## Linting & Security

```bash
bin/rubocop               # Ruby linting
bin/brakeman              # Security scan
```

## Deployment

### Docker

```bash
docker build -t mysolat .
docker run -d -p 8080:8080 -e RAILS_MASTER_KEY=<your-master-key> mysolat
```

The app will be available at `http://localhost:8080`.

## License

All rights reserved.
