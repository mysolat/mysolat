import { Controller } from "@hotwired/stimulus";
import { detectZone } from "../services/zone_detector";

export default class extends Controller {
    connect() {
        // Only auto-detect on first visit (no zone cookie set yet)
        if (!this.getCookie("zone")) {
            this.autoDetect();
        }
    }

    // Stimulus action: triggered by GPS button click
    detect(event) {
        this.detectButton = event?.currentTarget;
        if (this.detectButton) {
            this.detectButton.classList.add("loading");
        }
        this.autoDetect();
    }

    autoDetect() {
        if (!navigator.geolocation) {
            this.detectByGeoIP();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            this.onPositionSuccess.bind(this),
            this.onPositionError.bind(this),
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 },
        );
    }

    async onPositionSuccess(position) {
        const { latitude, longitude } = position.coords;

        try {
            const zone = await detectZone(latitude, longitude);
            if (zone) {
                const currentZone = this.getCookie("zone");
                if (currentZone !== zone.code) {
                    this.setCookie("zone", zone.code);
                    this.setCookie("zone_source", "auto");
                    window.Turbo.visit(`/zones/${zone.code}?source=auto`);
                    return;
                }
            } else {
                // Outside Malaysia - fall back to default if no cookie
                if (!this.getCookie("zone")) {
                    this.setCookie("zone", "SGR01");
                }
            }
        } catch (error) {
            console.error("Zone detection failed:", error);
        }

        this.clearLoading();
    }

    onPositionError(error) {
        console.warn("Geolocation error:", error.message);
        this.detectByGeoIP();
    }

    async detectByGeoIP() {
        try {
            const response = await fetch("https://freeipapi.com/api/json/");
            const data = await response.json();

            if (data.latitude && data.longitude) {
                const zone = await detectZone(data.latitude, data.longitude);
                if (zone) {
                    const currentZone = this.getCookie("zone");
                    if (currentZone !== zone.code) {
                        this.setCookie("zone", zone.code);
                        this.setCookie("zone_source", "auto");
                        window.Turbo.visit(`/zones/${zone.code}?source=auto`);
                        return;
                    }
                }
            }
        } catch (error) {
            console.warn("GeoIP fallback failed:", error.message);
        }

        if (!this.getCookie("zone")) {
            this.setCookie("zone", "SGR01");
        }
        this.clearLoading();
    }

    clearLoading() {
        if (this.detectButton) {
            this.detectButton.classList.remove("loading");
            this.detectButton = null;
        }
    }

    getCookie(name) {
        const match = document.cookie.match(
            new RegExp(`(?:^|; )${name}=([^;]*)`),
        );
        return match ? decodeURIComponent(match[1]) : null;
    }

    setCookie(name, value) {
        document.cookie = `${name}=${value};path=/;max-age=31536000;SameSite=Lax`;
    }
}
