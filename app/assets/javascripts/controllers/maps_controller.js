import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets = [
        "map",
        "masjidToggle",
        "surauToggle",
        "zonToggle",
        "masjidCount",
        "surauCount",
        "locateBtn",
        "loading",
    ];

    static values = {
        centerLat: { type: Number, default: 4.2105 },
        centerLng: { type: Number, default: 101.9758 },
    };

    connect() {
        this.map = null;
        this.masjidLayer = null;
        this.surauLayer = null;
        this.zonLayer = null;
        this.masjidData = [];
        this.surauData = [];
        this.userMarker = null;

        this.loadLeaflet();
    }

    disconnect() {
        if (this.map) {
            this.map.remove();
        }
    }

    async loadLeaflet() {
        // Load Leaflet JS dynamically
        if (!window.L) {
            await this.loadScript(
                "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
                "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=",
            );
        }

        // Load MarkerCluster plugin
        if (!window.L.MarkerClusterGroup) {
            await this.loadScript(
                "https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js",
            );
        }

        this.initMap();
    }

    loadScript(src, integrity = null) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            if (integrity) {
                script.integrity = integrity;
                script.crossOrigin = "";
            }
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    initMap() {
        // Initialize map centered on Malaysia or user's zone
        this.map = L.map(this.mapTarget, {
            zoomControl: true,
            scrollWheelZoom: true,
        }).setView([this.centerLatValue, this.centerLngValue], 10);

        // Add Positron (CartoDB) basemap
        L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
            {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: "abcd",
                maxZoom: 20,
            },
        ).addTo(this.map);

        // Create marker cluster groups
        this.masjidLayer = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            iconCreateFunction: (cluster) => {
                return L.divIcon({
                    html: `<div>${cluster.getChildCount()}</div>`,
                    className: "marker-cluster marker-cluster-small",
                    iconSize: L.point(40, 40),
                });
            },
        });

        this.surauLayer = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            iconCreateFunction: (cluster) => {
                return L.divIcon({
                    html: `<div>${cluster.getChildCount()}</div>`,
                    className: "marker-cluster marker-cluster-small",
                    iconSize: L.point(40, 40),
                });
            },
        });

        // Lazy-load data only for toggles that are checked by default
        if (this.masjidToggleTarget.checked) {
            this.loadMasjidData();
        }
        if (this.surauToggleTarget.checked) {
            this.loadSurauData();
        }
    }

    async loadMasjidData() {
        try {
            const response = await fetch("/masjid.json");
            const data = await response.json();

            if (data.status === "success" && data.masjid) {
                this.masjidData = data.masjid;
                this.addMasjidMarkers();
                this.masjidCountTarget.textContent = this.masjidData.length;
            }
        } catch (error) {
            console.error("Error loading masjid data:", error);
        }
    }

    async loadSurauData() {
        try {
            const response = await fetch("/surau.json");
            const data = await response.json();

            if (data.status === "success" && data.masjid) {
                this.surauData = data.masjid;
                this.addSurauMarkers();
                this.surauCountTarget.textContent = this.surauData.length;
            }
        } catch (error) {
            console.error("Error loading surau data:", error);
        }
    }

    addMasjidMarkers() {
        this.masjidLayer.clearLayers();

        this.masjidData.forEach((item) => {
            const lat = parseFloat(item.latitud);
            const lng = parseFloat(item.longitud);

            if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                const marker = L.marker([lat, lng], {
                    icon: this.createIcon("masjid"),
                });

                marker.bindPopup(this.createPopup(item, "masjid"));
                this.masjidLayer.addLayer(marker);
            }
        });

        if (this.masjidToggleTarget.checked) {
            this.map.addLayer(this.masjidLayer);
        }
    }

    addSurauMarkers() {
        this.surauLayer.clearLayers();

        this.surauData.forEach((item) => {
            const lat = parseFloat(item.latitud);
            const lng = parseFloat(item.longitud);

            if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                const marker = L.marker([lat, lng], {
                    icon: this.createIcon("surau"),
                });

                marker.bindPopup(this.createPopup(item, "surau"));
                this.surauLayer.addLayer(marker);
            }
        });

        if (this.surauToggleTarget.checked) {
            this.map.addLayer(this.surauLayer);
        }
    }

    createIcon(type) {
        const className = type === "masjid" ? "masjid-marker" : "surau-marker";
        return L.divIcon({
            className: className,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -14],
        });
    }

    createPopup(item, type) {
        const typeLabel = type === "masjid" ? "Masjid" : "Surau";
        const typeClass =
            type === "masjid" ? "badge-primary" : "badge-secondary";

        let content = `
      <div class="min-w-[200px]">
        <div class="badge ${typeClass} badge-sm mb-2">${typeLabel}</div>
        <h3 class="font-bold text-sm mb-1">${item.nama_masjid || "Tiada Nama"}</h3>
    `;

        if (item.alamat) {
            content += `<p class="text-xs opacity-60 mb-1">${item.alamat}</p>`;
        }

        if (item.tel) {
            content += `<p class="text-xs"><a href="tel:${item.tel}" class="link link-primary">${item.tel}</a></p>`;
        }

        // Add direction buttons
        const lat = parseFloat(item.latitud);
        const lng = parseFloat(item.longitud);
        content += `
      <div class="flex gap-1 mt-2">
        <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}"
           target="_blank"
           class="btn btn-xs btn-success gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C7.589 2 4 5.589 4 9.995 3.971 16.44 11.696 21.784 12 22c0 0 8.029-5.56 8-12C20 5.589 16.411 2 12 2zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
          </svg>
          Google Maps
        </a>
        <a href="https://waze.com/ul?ll=${lat},${lng}&navigate=yes"
           target="_blank"
           class="btn btn-xs btn-info gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.54 6.63c-1.62-4.15-6.38-5.8-9.95-5.56C6.04 1.36 1.64 5.5 1.5 10.16c-.08 2.6.98 4.83 2.8 6.37-.34 1.62-.98 2.62-1.7 3.27-.25.23-.05.63.25.57 1.63-.31 3.55-1.1 4.93-2.39 1.02.33 2.12.5 3.27.45 5.87-.31 10.55-5.87 9.49-11.8zM8.5 12.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
          </svg>
          Waze
        </a>
      </div>
    `;

        content += "</div>";
        return content;
    }

    toggleMarkers() {
        // Toggle masjid layer (lazy-load on first toggle)
        if (this.masjidToggleTarget.checked) {
            if (this.masjidData.length === 0) {
                this.loadMasjidData();
            } else if (!this.map.hasLayer(this.masjidLayer)) {
                this.map.addLayer(this.masjidLayer);
            }
        } else {
            if (this.map.hasLayer(this.masjidLayer)) {
                this.map.removeLayer(this.masjidLayer);
            }
        }

        // Toggle surau layer (lazy-load on first toggle)
        if (this.surauToggleTarget.checked) {
            if (this.surauData.length === 0) {
                this.loadSurauData();
            } else if (!this.map.hasLayer(this.surauLayer)) {
                this.map.addLayer(this.surauLayer);
            }
        } else {
            if (this.map.hasLayer(this.surauLayer)) {
                this.map.removeLayer(this.surauLayer);
            }
        }

        // Toggle zon JAKIM layer
        if (this.hasZonToggleTarget) {
            if (this.zonToggleTarget.checked) {
                if (!this.zonLayer) {
                    this.loadZonData();
                } else if (!this.map.hasLayer(this.zonLayer)) {
                    this.map.addLayer(this.zonLayer);
                }
            } else {
                if (this.zonLayer && this.map.hasLayer(this.zonLayer)) {
                    this.map.removeLayer(this.zonLayer);
                }
            }
        }
    }

    async loadZonData() {
        try {
            const response = await fetch("/jakim.geojson");
            const geojson = await response.json();

            this.zonLayer = L.geoJSON(geojson, {
                style: () => ({
                    color: "var(--color-secondary)",
                    weight: 2,
                    opacity: 0.8,
                    fillColor: "var(--color-secondary)",
                    fillOpacity: 0.1,
                }),
                onEachFeature: (feature, layer) => {
                    const props = feature.properties;
                    layer.bindPopup(`
                        <div class="min-w-[150px]">
                            <div class="badge badge-secondary badge-sm mb-2">Zon JAKIM</div>
                            <h3 class="font-bold text-sm">${props.name}</h3>
                            <p class="text-xs opacity-60 mb-2">${props.jakim_code}</p>
                            <a href="/zones/${props.jakim_code}" class="btn btn-xs btn-secondary gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                                </svg>
                                Waktu Solat
                            </a>
                        </div>
                    `);
                },
            });

            this.map.addLayer(this.zonLayer);
        } catch (error) {
            console.error("Error loading zon JAKIM data:", error);
        }
    }

    locateUser() {
        if (!navigator.geolocation) {
            alert("Pelayar anda tidak menyokong geolokasi.");
            return;
        }

        this.locateBtnTarget.classList.add("loading");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // Remove existing user marker
                if (this.userMarker) {
                    this.map.removeLayer(this.userMarker);
                }

                // Add user marker
                this.userMarker = L.marker([latitude, longitude], {
                    icon: L.divIcon({
                        className:
                            "bg-info border-2 border-white rounded-full shadow-lg animate-pulse",
                        iconSize: [16, 16],
                        iconAnchor: [8, 8],
                    }),
                })
                    .addTo(this.map)
                    .bindPopup("Lokasi anda")
                    .openPopup();

                // Pan to user location
                this.map.setView([latitude, longitude], 14);

                this.locateBtnTarget.classList.remove("loading");
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Tidak dapat mengesan lokasi anda.");
                this.locateBtnTarget.classList.remove("loading");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            },
        );
    }
}
