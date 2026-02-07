import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets = [
        "map",
        "masjidToggle",
        "surauToggle",
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

        // Load data
        this.loadMasjidData();
        this.loadSurauData();
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
            content += `<p class="text-xs text-base-content/70 mb-1">${item.alamat}</p>`;
        }

        if (item.tel) {
            content += `<p class="text-xs"><a href="tel:${item.tel}" class="link link-primary">${item.tel}</a></p>`;
        }

        // Add directions link
        const lat = parseFloat(item.latitud);
        const lng = parseFloat(item.longitud);
        content += `
      <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}"
         target="_blank"
         class="btn btn-xs btn-primary mt-2 gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Arah
      </a>
    `;

        content += "</div>";
        return content;
    }

    toggleMarkers() {
        // Toggle masjid layer
        if (this.masjidToggleTarget.checked) {
            if (!this.map.hasLayer(this.masjidLayer)) {
                this.map.addLayer(this.masjidLayer);
            }
        } else {
            if (this.map.hasLayer(this.masjidLayer)) {
                this.map.removeLayer(this.masjidLayer);
            }
        }

        // Toggle surau layer
        if (this.surauToggleTarget.checked) {
            if (!this.map.hasLayer(this.surauLayer)) {
                this.map.addLayer(this.surauLayer);
            }
        } else {
            if (this.map.hasLayer(this.surauLayer)) {
                this.map.removeLayer(this.surauLayer);
            }
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
