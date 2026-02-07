let geojsonCache = null

async function loadGeoJSON () {
  if (geojsonCache) return geojsonCache
  const response = await fetch('/jakim.geojson')
  geojsonCache = await response.json()
  return geojsonCache
}

// Ray-casting algorithm for point-in-polygon
// ring is an array of [lng, lat] pairs (GeoJSON coordinate order)
function pointInPolygon (lat, lng, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1]
    const xj = ring[j][0], yj = ring[j][1]

    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

function pointInMultiPolygon (lat, lng, multiPolygon) {
  for (const polygon of multiPolygon) {
    const exteriorRing = polygon[0]
    if (pointInPolygon(lat, lng, exteriorRing)) {
      // Check if point is inside a hole
      let inHole = false
      for (let h = 1; h < polygon.length; h++) {
        if (pointInPolygon(lat, lng, polygon[h])) {
          inHole = true
          break
        }
      }
      if (!inHole) return true
    }
  }
  return false
}

export async function detectZone (latitude, longitude) {
  const geojson = await loadGeoJSON()

  for (const feature of geojson.features) {
    if (pointInMultiPolygon(latitude, longitude, feature.geometry.coordinates)) {
      return {
        code: feature.properties.jakim_code,
        name: feature.properties.name,
        state: feature.properties.state
      }
    }
  }

  return null
}
