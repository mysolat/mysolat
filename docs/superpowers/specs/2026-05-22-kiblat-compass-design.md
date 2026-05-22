# Kiblat Compass Redesign

**Date:** 2026-05-22
**Status:** Approved

## Goal

Replace the current div-based compass on the `/kiblat` page with a modern minimalist SVG compass. Same functionality, significantly better visual quality.

## Design Decisions

### Style: Modern Minimalist
- Clean lines, subtle shadows, proper SVG rendering
- No skeuomorphic metallic effects
- DaisyUI-aware theming (works in light/dark)

### Qibla Indicator
- Slim triangular arrow from center, fixed (doesn't rotate with dial)
- Kaaba icon (simplified SVG) at needle tip
- Alignment glow (±10° tolerance) via CSS animation on outer ring

### Compass Detail Level
- Cardinal labels: U, S, B, T (Utara, Selatan, Barat, Timur)
- Intercardinal labels: TL, BD, BD, BL (Timur Laut, Barat Daya, Barat Laut, Timur Daya)
- 36 minor tick marks (every 10°)
- 4 major ticks at cardinal points
- 4 medium ticks at intercardinal points
- Smooth rotation via SVG group transform

### SVG Structure (3 layers)

1. **Outer ring** — thin border circle with subtle drop shadow
2. **Tick marks group** — minor/medium/major ticks + directional labels, rotates with device heading
3. **Qibla needle** — fixed triangle arrow + Kaaba SVG icon, stays pointing at calculated bearing

### Info Panel
- Bearing degree display
- Location text + coordinates
- Permission button for device orientation (iOS)
- Graceful degradation: static compass on desktop (no DeviceOrientation API)

## Files Changed

| File | Change |
|------|--------|
| `app/views/pages/kiblat.html.erb` | Replace div-based compass with inline SVG |
| `app/assets/javascripts/controllers/qibla_controller.js` | Update targets to manipulate SVG transform attribute |

No new files. No new gems. No new dependencies.

## Behavior Preserved

- Geolocation for precise qibla calculation
- Zone coordinate fallback
- DeviceOrientation API with permission handling
- ±10° alignment tolerance with visual feedback
- All existing text (Malay locale)
