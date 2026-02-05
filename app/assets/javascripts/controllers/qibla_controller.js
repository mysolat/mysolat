import { Controller } from "@hotwired/stimulus";

// Kaaba coordinates (Mecca)
const KAABA = {
  lat: 21.4225,
  lng: 39.8262,
};

export default class extends Controller {
  static targets = [
    "compass",
    "needle",
    "bearing",
    "location",
    "coordinates",
    "permissionBtn",
    "warning",
    "status",
    "ring",
  ];

  static values = {
    zoneLat: Number,
    zoneLng: Number,
    zoneName: String,
  };

  // Tolerance in degrees for "correct" Qibla alignment
  static ALIGNMENT_TOLERANCE = 10;

  connect() {
    this.qiblaBearing = null;
    this.userLat = null;
    this.userLng = null;
    this.orientationSupported = false;
    this.orientationHandler = null;
    this.isAligned = false;

    this.initializeLocation();
  }

  disconnect() {
    this.stopOrientation();
  }

  // ==================
  // Location Handling
  // ==================

  initializeLocation() {
    if (navigator.geolocation) {
      this.updateStatus("Mengesan lokasi...");
      navigator.geolocation.getCurrentPosition(
        this.handlePosition.bind(this),
        this.handlePositionError.bind(this),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
    } else {
      this.useZoneCoordinates();
    }
  }

  handlePosition(position) {
    this.userLat = position.coords.latitude;
    this.userLng = position.coords.longitude;

    this.qiblaBearing = this.calculateQiblaBearing(this.userLat, this.userLng);

    this.locationTarget.textContent = "Lokasi semasa anda";
    this.coordinatesTarget.textContent = `${this.userLat.toFixed(4)}°, ${this.userLng.toFixed(4)}°`;

    this.updateStaticBearing();
    this.checkOrientationSupport();
  }

  handlePositionError(error) {
    console.warn("Geolocation error:", error);
    this.useZoneCoordinates();
  }

  useZoneCoordinates() {
    if (this.zoneLatValue && this.zoneLngValue) {
      this.userLat = this.zoneLatValue;
      this.userLng = this.zoneLngValue;
      this.qiblaBearing = this.calculateQiblaBearing(
        this.userLat,
        this.userLng,
      );

      this.locationTarget.textContent = this.zoneNameValue || "Zon pilihan";
      this.coordinatesTarget.textContent = `${this.userLat.toFixed(4)}°, ${this.userLng.toFixed(4)}°`;

      this.updateStaticBearing();
      this.checkOrientationSupport();
    } else {
      this.showWarning("Tidak dapat menentukan lokasi. Sila aktifkan GPS.");
    }
  }

  // ==================
  // Qibla Calculation
  // ==================

  calculateQiblaBearing(userLat, userLng) {
    const lat1 = this.toRadians(userLat);
    const lat2 = this.toRadians(KAABA.lat);
    const deltaLng = this.toRadians(KAABA.lng - userLng);

    const x = Math.cos(lat2) * Math.sin(deltaLng);
    const y =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    let bearing = this.toDegrees(Math.atan2(x, y));

    // Normalize to 0-360
    return (bearing + 360) % 360;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  toDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  // ==================
  // Device Orientation
  // ==================

  checkOrientationSupport() {
    if (typeof DeviceOrientationEvent === "undefined") {
      this.showStaticMode("Peranti anda tidak menyokong kompas digital.");
      return;
    }

    // iOS 13+ requires explicit permission
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      this.permissionBtnTarget.classList.remove("hidden");
      this.updateStatus("Tekan butang untuk aktifkan kompas");
    } else {
      // Non-iOS devices - start directly
      this.startOrientation();
    }
  }

  async requestPermission() {
    try {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission === "granted") {
        this.permissionBtnTarget.classList.add("hidden");
        this.startOrientation();
      } else {
        this.showStaticMode("Kebenaran kompas ditolak.");
      }
    } catch (error) {
      console.error("Permission request failed:", error);
      this.showStaticMode("Tidak dapat mengaktifkan kompas.");
    }
  }

  startOrientation() {
    this.orientationHandler = this.handleOrientation.bind(this);

    // Try absolute orientation first (more accurate)
    if ("ondeviceorientationabsolute" in window) {
      window.addEventListener(
        "deviceorientationabsolute",
        this.orientationHandler,
        true,
      );
    } else {
      window.addEventListener(
        "deviceorientation",
        this.orientationHandler,
        true,
      );
    }

    this.orientationSupported = true;
    this.updateStatus("Kompas aktif");
  }

  stopOrientation() {
    if (this.orientationHandler) {
      window.removeEventListener(
        "deviceorientationabsolute",
        this.orientationHandler,
        true,
      );
      window.removeEventListener(
        "deviceorientation",
        this.orientationHandler,
        true,
      );
    }
  }

  handleOrientation(event) {
    let heading;

    // Get compass heading based on available data
    if (event.webkitCompassHeading !== undefined) {
      // iOS Safari - webkitCompassHeading is degrees from magnetic north
      heading = event.webkitCompassHeading;
    } else if (event.absolute && event.alpha !== null) {
      // Android with absolute orientation
      heading = 360 - event.alpha;
    } else if (event.alpha !== null) {
      // Relative orientation (less accurate)
      heading = 360 - event.alpha;
    } else {
      return; // No usable data
    }

    this.updateCompass(heading);
  }

  updateCompass(deviceHeading) {
    if (this.qiblaBearing === null) return;

    // Rotate compass dial opposite to device heading (so North indicator follows real North)
    this.compassTarget.style.transform = `rotate(${-deviceHeading}deg)`;

    // Needle points to Qibla relative to current device heading
    // When device faces North (heading=0), needle shows raw qiblaBearing
    // As device rotates, needle counter-rotates to keep pointing at real-world Qibla
    const needleRotation = this.qiblaBearing - deviceHeading;
    this.needleTarget.style.transform = `rotate(${needleRotation}deg)`;

    // Update bearing display (always shows the fixed bearing from North)
    this.bearingTarget.textContent = Math.round(this.qiblaBearing) + "°";

    // Check if device is aligned with Qibla direction
    this.checkAlignment(deviceHeading);
  }

  checkAlignment(deviceHeading) {
    // Calculate the difference between device heading and Qibla bearing
    let diff = Math.abs(deviceHeading - this.qiblaBearing);

    // Normalize to handle wrap-around (e.g., 359° vs 1°)
    if (diff > 180) {
      diff = 360 - diff;
    }

    const isNowAligned = diff <= this.constructor.ALIGNMENT_TOLERANCE;

    // Only update if alignment state changed
    if (isNowAligned !== this.isAligned) {
      this.isAligned = isNowAligned;
      this.updateAlignmentUI();
    }
  }

  updateAlignmentUI() {
    if (this.hasRingTarget) {
      if (this.isAligned) {
        // Highlight when aligned - green glow effect
        this.ringTarget.classList.add(
          "ring-4",
          "ring-success",
          "ring-opacity-80",
        );
        this.ringTarget.classList.add("shadow-[0_0_30px_rgba(34,197,94,0.6)]");
        this.updateStatus("Anda menghadap Kiblat!");
      } else {
        // Remove highlight when not aligned
        this.ringTarget.classList.remove(
          "ring-4",
          "ring-success",
          "ring-opacity-80",
        );
        this.ringTarget.classList.remove(
          "shadow-[0_0_30px_rgba(34,197,94,0.6)]",
        );
        this.updateStatus("Kompas aktif");
      }
    }
  }

  // ==================
  // UI Updates
  // ==================

  updateStaticBearing() {
    if (this.qiblaBearing !== null) {
      this.bearingTarget.textContent = Math.round(this.qiblaBearing) + "°";
      this.needleTarget.style.transform = `rotate(${this.qiblaBearing}deg)`;
    }
  }

  showStaticMode(message) {
    if (message) {
      this.updateStatus(message);
    }

    // Show bearing as static number
    this.updateStaticBearing();

    // Add visual indicator that compass is static
    this.compassTarget.classList.add("opacity-70");
  }

  showWarning(message) {
    this.warningTarget.textContent = message;
    this.warningTarget.classList.remove("hidden");
  }

  updateStatus(message) {
    if (this.hasStatusTarget) {
      this.statusTarget.textContent = message;
    }
  }
}
