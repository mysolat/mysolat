# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MySolat is a Ruby on Rails 8.0 application providing Islamic prayer times (Waktu Solat) for Malaysia. It integrates with JAKIM's e-Solat API to display prayer times and imsak/berbuka puasa schedules across Malaysian zones.

## Commands

```bash
# Development
bin/dev                    # Start dev server (Foreman: web, js, css)
bin/setup                  # Full setup: install deps, prepare DB, start server

# Testing
bin/rails test             # Run unit/integration tests
bin/rails test:system      # Run system tests (Capybara/Selenium)

# Linting & Security
bin/rubocop                # Ruby linting (Omakase style)
bin/brakeman               # Security vulnerability scan

# Assets
yarn build                 # Bundle JavaScript (esbuild)
yarn build:css             # Compile Tailwind CSS
```

## Architecture

**Stack:** Rails 8.0, Ruby 3.3.4, SQLite3, Hotwire (Turbo + Stimulus), Tailwind CSS v4, DaisyUI

### Key Directories

- `app/resources/jakim/` - Flexirest API client for JAKIM e-Solat API
- `app/models/location.rb` - Static module containing all Malaysian zone data (60+ zones with codes, coordinates)
- `app/controllers/api/` - RESTful JSON API endpoints
- `app/views/` - Slim templates (`.slim` files)

### Data Pattern

This app is **data-driven without database persistence** for core data:
- Location/zone data is hardcoded in `Location` module
- Prayer times are fetched live from JAKIM API via `Jakim::ApiResource`
- Zone codes are uppercase (e.g., SGR01, JHR01, KTN01)

### API Integration

`Jakim::ApiResource` (in `app/resources/jakim/api_resource.rb`):
- Base URL: `https://www.e-solat.gov.my/index.php`
- Includes before/after hooks for zone uppercasing and intelligent cache expiry
- Cache expiry varies by endpoint: daily, monthly, or yearly

### Frontend

- Hotwire for SPA-like navigation without JS frameworks
- Stimulus controllers in `app/javascript/controllers/`
- PWA support with Workbox service worker
- Mapbox GL for map display

## Configuration

- **Locale:** Malay (`:ms`) - see `config/locales/`
- **Timezone:** Kuala Lumpur
- **Credentials:** Encrypted in `config/credentials.yml.enc`

## Deployment

- Docker-based (see `Dockerfile`)
- Fly.io configured (`fly.toml`)
- Kamal option available (`.kamal/`)
- Production uses separate SQLite databases for cache, queue, and cable
