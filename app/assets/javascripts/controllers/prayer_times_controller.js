import { Controller } from "@hotwired/stimulus";
import prayerTimesDB from "../services/prayer_times_db";

export default class extends Controller {
    static targets = [
        "nextPrayer",
        "countdown",
        "progressBar",
        "progressStart",
        "progressEnd",
        "syurukMarker",
        "dhuhaMarker",
        "syurukTime",
        "dhuhaTime",
        "syurukLabel",
        "dhuhaLabel",
        "prayerGrid",
        "loading",
        "dateDisplay",
        "hijriDisplay",
        "prevButton",
        "nextButton",
        "carousel",
        "puasaCard",
        "puasaLabel",
        "puasaCountdown",
        "puasaTime",
        "puasaTimePrefix",
        "puasaProgressBar",
        "puasaProgressStart",
        "puasaProgressEnd",
        "sahurIcon",
        "berbukaIcon",
        "indicatorPuasa",
        "indicatorPrayer",
    ];
    static values = {
        prayers: Object,
        zone: String,
        selectedDate: String,
    };

    async connect() {
        this.zone = this.zoneValue || this.getZoneFromCookie() || "SGR01";
        this.timeFormat = this.getTimeFormat(); // "12" or "24"
        this.currentDate = new Date(); // Track currently displayed date

        // Listen for time format changes
        this.handleTimeFormatChange = this.handleTimeFormatChange.bind(this);
        window.addEventListener(
            "timeFormatChanged",
            this.handleTimeFormatChange,
        );

        // If prayers already provided from server, use them
        if (this.hasPrayersValue && Object.keys(this.prayersValue).length > 0) {
            this.startUpdates();
            // Fetch yearly in background for future use
            this.fetchAndCacheYearly();
        } else {
            // Load from IndexedDB or fetch from API
            await this.loadPrayerTimes();
        }
    }

    disconnect() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        window.removeEventListener(
            "timeFormatChanged",
            this.handleTimeFormatChange,
        );
    }

    handleTimeFormatChange(event) {
        this.timeFormat = event.detail.format;
        this.loadPrayerTimes();
    }

    // Date navigation methods
    previousDay() {
        this.currentDate.setDate(this.currentDate.getDate() - 1);
        this.loadPrayerTimesForDate(this.currentDate);
    }

    nextDay() {
        this.currentDate.setDate(this.currentDate.getDate() + 1);
        this.loadPrayerTimesForDate(this.currentDate);
    }

    isToday() {
        const today = new Date();
        return (
            this.currentDate.getDate() === today.getDate() &&
            this.currentDate.getMonth() === today.getMonth() &&
            this.currentDate.getFullYear() === today.getFullYear()
        );
    }

    async loadPrayerTimes() {
        await this.loadPrayerTimesForDate(this.currentDate);
    }

    async loadPrayerTimesForDate(date) {
        try {
            // Try to get from IndexedDB first
            const cached = await prayerTimesDB.getByDate(this.zone, date);

            if (cached && cached.today) {
                this.prayersValue = this.formatPrayersForDisplay(cached.today);
                this.updatePrayerGrid(cached.today);
                this.updateCountdownVisibility();

                // Only run countdown updates if viewing today
                if (this.isToday()) {
                    this.startUpdates();
                } else {
                    this.stopUpdates();
                    this.showStaticNextPrayer();
                }
            } else {
                // Fetch yearly data from API
                await this.fetchAndCacheYearly(date.getFullYear());
                // Retry loading after fetch
                const retryCache = await prayerTimesDB.getByDate(
                    this.zone,
                    date,
                );
                if (retryCache && retryCache.today) {
                    this.prayersValue = this.formatPrayersForDisplay(
                        retryCache.today,
                    );
                    this.updatePrayerGrid(retryCache.today);
                    this.updateCountdownVisibility();

                    if (this.isToday()) {
                        this.startUpdates();
                    } else {
                        this.stopUpdates();
                        this.showStaticNextPrayer();
                    }
                }
            }
        } catch (error) {
            console.error("Error loading prayer times:", error);
            // Fallback: fetch from API
            await this.fetchAndCacheYearly(date.getFullYear());
        }
    }

    stopUpdates() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    updateCountdownVisibility() {
        // Show/hide countdown based on whether viewing today
        if (this.hasCountdownTarget) {
            if (!this.isToday()) {
                this.countdownTarget.textContent = "--:--:--";
            }
        }
        if (this.hasProgressBarTarget) {
            this.progressBarTarget.style.width = this.isToday()
                ? this.progressBarTarget.style.width
                : "0%";
        }
        // Reset puasa countdown visibility
        if (this.hasPuasaCountdownTarget) {
            if (!this.isToday()) {
                this.puasaCountdownTarget.textContent = "--:--:--";
            }
        }
        if (this.hasPuasaProgressBarTarget) {
            this.puasaProgressBarTarget.style.width = this.isToday()
                ? this.puasaProgressBarTarget.style.width
                : "0%";
        }
    }

    showStaticNextPrayer() {
        // Show first prayer of the day when not viewing today
        if (this.hasNextPrayerTarget) {
            this.nextPrayerTarget.textContent = "Waktu Solat";
        }
        if (this.hasProgressStartTarget) {
            this.progressStartTarget.textContent = "--:--";
        }
        if (this.hasProgressEndTarget) {
            this.progressEndTarget.textContent = "--:--";
        }
    }

    async fetchAndCacheYearly(year = null) {
        try {
            const targetYear = year || new Date().getFullYear();
            const cached = await prayerTimesDB.get(this.zone, targetYear);

            if (cached) return;

            const response = await fetch(
                `/api/yearly/${this.zone}/${targetYear}`,
            );
            if (!response.ok) throw new Error("Failed to fetch yearly data");

            const data = await response.json();
            await prayerTimesDB.save(this.zone, targetYear, data);

            // If we didn't have prayer times yet, load them now
            if (
                !this.hasPrayersValue ||
                Object.keys(this.prayersValue).length === 0
            ) {
                const cachedToday = await prayerTimesDB.getToday(this.zone);
                if (cachedToday && cachedToday.today) {
                    this.prayersValue = this.formatPrayersForDisplay(
                        cachedToday.today,
                    );
                    this.startUpdates();
                    this.updatePrayerGrid(cachedToday.today);
                }
            }
        } catch (error) {
            console.error("Error fetching yearly data:", error);
        }
    }

    formatPrayersForDisplay(todayData) {
        const prayerKeys = [
            "imsak",
            "fajr",
            "syuruk",
            "dhuha",
            "dhuhr",
            "asr",
            "maghrib",
            "isha",
        ];
        const formatted = {};

        prayerKeys.forEach((key) => {
            if (todayData[key]) {
                formatted[key] = todayData[key];
            }
        });

        return formatted;
    }

    updatePrayerGrid(todayData) {
        if (!this.hasPrayerGridTarget) return;

        // Update date displays if available
        if (todayData.date) {
            this.updateDateDisplays(todayData.date, todayData.hijri);
        }

        const prayerKeys = [
            "imsak",
            "fajr",
            "syuruk",
            "dhuha",
            "dhuhr",
            "asr",
            "maghrib",
            "isha",
        ];
        const labels = {
            imsak: "Imsak",
            fajr: "Subuh",
            syuruk: "Syuruk",
            dhuha: "Dhuha",
            dhuhr: "Zohor",
            asr: "Asar",
            maghrib: "Maghrib",
            isha: "Isyak",
        };

        let html = "";
        prayerKeys.forEach((key) => {
            if (todayData[key]) {
                const time = this.formatTimeForGrid(todayData[key]);
                const period = this.formatPeriodForGrid(todayData[key]);
                html += `
          <div class="backdrop-blur-md bg-white/10 rounded-2xl p-4 md:p-5 border border-white/10 transition-all hover:bg-white/20 ${key}">
            <div class="prayer-icon prayer-icon-${key} w-6 h-6 md:w-7 md:h-7 opacity-70 mb-1 mx-auto"></div>
            <div class="text-xs md:text-sm font-semibold text-base-content/50 uppercase tracking-wide mb-1">
              ${labels[key]}
            </div>
            <div class="text-2xl md:text-3xl font-bold tabular-nums">
              ${time}
            </div>
            <div class="text-xs text-base-content/40 font-medium">
              ${period}
            </div>
          </div>
        `;
            }
        });

        this.prayerGridTarget.innerHTML = html;
    }

    updateDateDisplays(dateStr, hijriStr) {
        // Update Gregorian date display - dateStr is "04-Feb-2026"
        if (this.hasDateDisplayTarget && dateStr) {
            const date = this.parseDateString(dateStr);
            if (date) {
                const options = {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                };
                this.dateDisplayTarget.textContent = date.toLocaleDateString(
                    "ms-MY",
                    options,
                );
            }
        }

        // Update Hijri date display - hijriStr is "2026-02-04" format
        if (this.hasHijriDisplayTarget && hijriStr) {
            // Format hijri date - simple display since we don't have Hijri library on client
            // The hijri value from API is already in correct format
            this.hijriDisplayTarget.textContent =
                this.formatHijriDate(hijriStr) + " H";
        }
    }

    parseDateString(dateStr) {
        // Parse "04-Feb-2026" format
        const parts = dateStr.split("-");
        if (parts.length !== 3) return null;

        const day = parseInt(parts[0], 10);
        const months = {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11,
        };
        const month = months[parts[1]];
        const year = parseInt(parts[2], 10);

        if (isNaN(day) || month === undefined || isNaN(year)) return null;

        return new Date(year, month, day);
    }

    formatHijriDate(hijriStr) {
        // hijriStr is in "YYYY-MM-DD" format
        // Convert to "DD MonthName YYYY" format
        const parts = hijriStr.split("-");
        if (parts.length !== 3) return hijriStr;

        const year = parts[0];
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);

        const hijriMonths = [
            "Muharram",
            "Safar",
            "Rabiulawal",
            "Rabiulakhir",
            "Jamadilawal",
            "Jamadilakhir",
            "Rejab",
            "Syaaban",
            "Ramadan",
            "Syawal",
            "Zulkaedah",
            "Zulhijjah",
        ];

        const monthName = hijriMonths[month - 1] || "";
        return `${day} ${monthName} ${year}`;
    }

    formatTimeForGrid(timeStr) {
        // Parse the time string to get hours and minutes
        const { hours, minutes } = this.parseTimeComponents(timeStr);

        if (this.timeFormat === "24") {
            return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
        }

        // 12-hour format
        let hour12 = hours;
        if (hours === 0) {
            hour12 = 12;
        } else if (hours > 12) {
            hour12 = hours - 12;
        }

        return `${hour12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    }

    formatPeriodForGrid(timeStr) {
        if (this.timeFormat === "24") {
            return ""; // No AM/PM for 24-hour format
        }

        const { hours } = this.parseTimeComponents(timeStr);
        return hours < 12 ? "AM" : "PM";
    }

    parseTimeComponents(timeStr) {
        // Handle both "05:49 AM" and "06:08:00" (24-hour) formats
        const parts = timeStr.trim().split(" ");
        const timeParts = parts[0].split(":");
        let hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);

        // If it has AM/PM, convert to 24-hour first for consistency
        if (parts.length === 2) {
            const period = parts[1];
            if (period === "PM" && hours !== 12) {
                hours += 12;
            } else if (period === "AM" && hours === 12) {
                hours = 0;
            }
        }

        return { hours, minutes };
    }

    getZoneFromCookie() {
        const match = document.cookie.match(/(?:^|; )zone=([^;]*)/);
        return match ? decodeURIComponent(match[1]) : null;
    }

    getTimeFormat() {
        return localStorage.getItem("timeFormat") || "12";
    }

    setTimeFormat(format) {
        localStorage.setItem("timeFormat", format);
        this.timeFormat = format;
        // Re-render the prayer grid with new format
        this.loadPrayerTimes();
    }

    toggleTimeFormat() {
        const newFormat = this.timeFormat === "12" ? "24" : "12";
        this.setTimeFormat(newFormat);
    }

    startUpdates() {
        this.updateNextPrayer();
        this.highlightCurrentPrayer();
        this.updatePuasaCountdown();
        this.interval = setInterval(() => {
            this.updateNextPrayer();
            this.highlightCurrentPrayer();
            this.updatePuasaCountdown();
        }, 1000);
    }

    // Determine if we should show Sahur or Berbuka mode
    // Sahur mode: After Isyak until Imsak (next day early morning)
    // Berbuka mode: After Subuh (Fajr) until Maghrib
    getPuasaMode() {
        const prayers = this.prayersValue;
        if (!prayers["fajr"] || !prayers["maghrib"] || !prayers["isha"]) {
            return null;
        }

        const now = new Date();
        const fajrTime = this.parseTime(prayers["fajr"]);
        const maghribTime = this.parseTime(prayers["maghrib"]);
        const ishaTime = this.parseTime(prayers["isha"]);

        // After Isyak OR before Subuh (early morning) = Sahur mode
        // Sahur ends at Subuh (Fajr), not Imsak
        if (now >= ishaTime || now < fajrTime) {
            return "sahur";
        }

        // After Fajr and before Maghrib = Berbuka mode
        if (now >= fajrTime && now < maghribTime) {
            return "berbuka";
        }

        // After Maghrib but before Isyak = show completed berbuka briefly
        if (now >= maghribTime && now < ishaTime) {
            return "berbuka-done";
        }

        return "sahur";
    }

    updatePuasaCountdown() {
        const prayers = this.prayersValue;
        const mode = this.getPuasaMode();

        if (!mode) return;

        const now = new Date();

        if (mode === "sahur") {
            this.showSahurMode(now, prayers);
        } else if (mode === "berbuka") {
            this.showBerbukaMode(now, prayers);
        } else if (mode === "berbuka-done") {
            this.showBerbukaDoneMode(prayers);
        }
    }

    showSahurMode(now, prayers) {
        // Sahur ends at Subuh (Fajr), not Imsak
        // Imsak is just a precautionary time (ihtiyat) ~10 mins before Subuh
        const fajrTime = prayers["fajr"]
            ? this.parseTime(prayers["fajr"])
            : null;
        const imsakTime = prayers["imsak"]
            ? this.parseTime(prayers["imsak"])
            : null;

        if (!fajrTime) return;

        // Update UI to Sahur mode
        if (this.hasPuasaLabelTarget) {
            this.puasaLabelTarget.textContent = "Waktu Sahur";
        }
        if (this.hasSahurIconTarget) {
            this.sahurIconTarget.classList.remove("hidden");
        }
        if (this.hasBerbukaIconTarget) {
            this.berbukaIconTarget.classList.add("hidden");
        }
        if (this.hasPuasaTimePrefixTarget) {
            this.puasaTimePrefixTarget.textContent = "Berakhir pada";
        }
        if (this.hasPuasaTimeTarget) {
            this.puasaTimeTarget.textContent = this.formatTime(fajrTime);
        }
        if (this.hasPuasaCountdownTarget) {
            this.puasaCountdownTarget.classList.remove("text-warning");
            this.puasaCountdownTarget.classList.add("text-info");
        }
        if (this.hasPuasaProgressBarTarget) {
            this.puasaProgressBarTarget.classList.remove("bg-warning");
            this.puasaProgressBarTarget.classList.add("bg-info");
        }
        if (this.hasIndicatorPuasaTarget) {
            this.indicatorPuasaTarget.classList.remove(
                "hover:bg-warning",
                "hover:border-warning",
            );
            this.indicatorPuasaTarget.classList.add(
                "hover:bg-info",
                "hover:border-info",
            );
        }

        // Determine times based on scenario
        const ishaTime = this.parseTime(prayers["isha"]);
        let targetFajr, targetImsak;

        if (now >= ishaTime) {
            // Scenario 1: After Isyak (evening) - target is tomorrow's times
            targetFajr = new Date(fajrTime);
            targetFajr.setDate(targetFajr.getDate() + 1);
            if (imsakTime) {
                targetImsak = new Date(imsakTime);
                targetImsak.setDate(targetImsak.getDate() + 1);
            }
        } else {
            // Scenario 2: Early morning before Subuh - use today's times
            targetFajr = fajrTime;
            targetImsak = imsakTime;
        }

        // Calculate countdown to Subuh
        if (now < targetFajr) {
            const timeDiff = targetFajr - now;
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor(
                (timeDiff % (1000 * 60 * 60)) / (1000 * 60),
            );
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            if (this.hasPuasaCountdownTarget) {
                this.puasaCountdownTarget.textContent = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
            }

            // Progress bar: swap start time based on whether we've passed Imsak
            // Before Imsak: Isyak -> Subuh
            // After Imsak: Imsak -> Subuh
            let progressStart, progressStartLabel;

            if (targetImsak && now >= targetImsak) {
                // After Imsak - show Imsak to Subuh
                progressStart = targetImsak;
                progressStartLabel = this.formatTime(imsakTime);
            } else if (now >= ishaTime) {
                // After Isyak but before Imsak - show Isyak to Subuh
                progressStart = ishaTime;
                progressStartLabel = this.formatTime(ishaTime);
            } else {
                // Early morning before Imsak - Isyak was yesterday
                if (targetImsak && now >= targetImsak) {
                    progressStart = targetImsak;
                    progressStartLabel = this.formatTime(imsakTime);
                } else {
                    const yesterdayIsha = new Date(ishaTime);
                    yesterdayIsha.setDate(yesterdayIsha.getDate() - 1);
                    progressStart = yesterdayIsha;
                    progressStartLabel = this.formatTime(ishaTime);
                }
            }

            const totalDuration = targetFajr - progressStart;
            const elapsed = now - progressStart;
            let progressPercentage = (elapsed / totalDuration) * 100;
            progressPercentage = Math.max(0, Math.min(100, progressPercentage));

            if (this.hasPuasaProgressBarTarget) {
                this.puasaProgressBarTarget.style.width = `${progressPercentage}%`;
            }
            if (this.hasPuasaProgressStartTarget) {
                this.puasaProgressStartTarget.textContent = progressStartLabel;
            }
            if (this.hasPuasaProgressEndTarget) {
                this.puasaProgressEndTarget.textContent =
                    this.formatTime(fajrTime);
            }
        } else {
            // Sahur time ended
            if (this.hasPuasaCountdownTarget) {
                this.puasaCountdownTarget.textContent = "Tamat";
            }
            if (this.hasPuasaProgressBarTarget) {
                this.puasaProgressBarTarget.style.width = "100%";
            }
        }
    }

    showBerbukaMode(now, prayers) {
        const maghribTime = this.parseTime(prayers["maghrib"]);
        const fajrTime = this.parseTime(prayers["fajr"]);

        // Update UI to Berbuka mode
        if (this.hasPuasaLabelTarget) {
            this.puasaLabelTarget.textContent = "Waktu Berbuka";
        }
        if (this.hasSahurIconTarget) {
            this.sahurIconTarget.classList.add("hidden");
        }
        if (this.hasBerbukaIconTarget) {
            this.berbukaIconTarget.classList.remove("hidden");
        }
        if (this.hasPuasaTimePrefixTarget) {
            this.puasaTimePrefixTarget.textContent = "Berbuka pada";
        }
        if (this.hasPuasaTimeTarget) {
            this.puasaTimeTarget.textContent = this.formatTime(maghribTime);
        }
        if (this.hasPuasaCountdownTarget) {
            this.puasaCountdownTarget.classList.remove("text-info");
            this.puasaCountdownTarget.classList.add("text-warning");
        }
        if (this.hasPuasaProgressBarTarget) {
            this.puasaProgressBarTarget.classList.remove("bg-info");
            this.puasaProgressBarTarget.classList.add("bg-warning");
        }
        if (this.hasIndicatorPuasaTarget) {
            this.indicatorPuasaTarget.classList.remove(
                "hover:bg-info",
                "hover:border-info",
            );
            this.indicatorPuasaTarget.classList.add(
                "hover:bg-warning",
                "hover:border-warning",
            );
        }

        // Calculate countdown
        const timeDiff = maghribTime - now;
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        if (this.hasPuasaCountdownTarget) {
            this.puasaCountdownTarget.textContent = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        }

        // Progress bar: Fajr to Maghrib
        const totalDuration = maghribTime - fajrTime;
        const elapsed = now - fajrTime;
        let progressPercentage = (elapsed / totalDuration) * 100;
        progressPercentage = Math.max(0, Math.min(100, progressPercentage));

        if (this.hasPuasaProgressBarTarget) {
            this.puasaProgressBarTarget.style.width = `${progressPercentage}%`;
        }
        if (this.hasPuasaProgressStartTarget) {
            this.puasaProgressStartTarget.textContent =
                this.formatTime(fajrTime);
        }
        if (this.hasPuasaProgressEndTarget) {
            this.puasaProgressEndTarget.textContent =
                this.formatTime(maghribTime);
        }
    }

    showBerbukaDoneMode(prayers) {
        const maghribTime = this.parseTime(prayers["maghrib"]);

        // Update UI to show berbuka completed
        if (this.hasPuasaLabelTarget) {
            this.puasaLabelTarget.textContent = "Waktu Berbuka";
        }
        if (this.hasSahurIconTarget) {
            this.sahurIconTarget.classList.add("hidden");
        }
        if (this.hasBerbukaIconTarget) {
            this.berbukaIconTarget.classList.remove("hidden");
        }
        if (this.hasPuasaTimePrefixTarget) {
            this.puasaTimePrefixTarget.textContent = "Berbuka pada";
        }
        if (this.hasPuasaTimeTarget) {
            this.puasaTimeTarget.textContent = this.formatTime(maghribTime);
        }
        if (this.hasPuasaCountdownTarget) {
            this.puasaCountdownTarget.classList.remove("text-info");
            this.puasaCountdownTarget.classList.add("text-warning");
            this.puasaCountdownTarget.textContent = "Selamat Berbuka!";
        }
        if (this.hasPuasaProgressBarTarget) {
            this.puasaProgressBarTarget.classList.remove("bg-info");
            this.puasaProgressBarTarget.classList.add("bg-warning");
            this.puasaProgressBarTarget.style.width = "100%";
        }
        if (this.hasPuasaProgressStartTarget) {
            this.puasaProgressStartTarget.textContent = this.formatTime(
                this.parseTime(prayers["fajr"]),
            );
        }
        if (this.hasPuasaProgressEndTarget) {
            this.puasaProgressEndTarget.textContent =
                this.formatTime(maghribTime);
        }
    }

    updateNextPrayer() {
        const now = new Date();
        const nextPrayer = this.findNextPrayer(now);

        if (nextPrayer) {
            this.displayNextPrayer(nextPrayer, now);
        }
    }

    highlightCurrentPrayer() {
        const now = new Date();
        const prayerOrder = [
            "imsak",
            "fajr",
            "syuruk",
            "dhuha",
            "dhuhr",
            "asr",
            "maghrib",
            "isha",
        ];
        const prayers = this.prayersValue;

        let currentPrayer = null;

        // Find the current prayer period (between current prayer and next prayer)
        for (let i = 0; i < prayerOrder.length; i++) {
            const prayerKey = prayerOrder[i];
            const nextPrayerKey = prayerOrder[i + 1];

            if (prayers[prayerKey]) {
                const prayerTime = this.parseTime(prayers[prayerKey]);

                if (prayerTime <= now) {
                    currentPrayer = prayerKey;

                    // Check if we haven't passed the next prayer yet
                    if (nextPrayerKey && prayers[nextPrayerKey]) {
                        const nextPrayerTime = this.parseTime(
                            prayers[nextPrayerKey],
                        );
                        if (now >= nextPrayerTime) {
                            currentPrayer = null; // Continue to next iteration
                        }
                    }
                }
            }
        }

        // Remove previous highlights
        document.querySelectorAll(".prayer-current").forEach((el) => {
            el.classList.remove("prayer-current", "scale-105");
        });

        // Highlight current prayer
        if (currentPrayer) {
            const prayerElement = document.querySelector(`.${currentPrayer}`);
            if (prayerElement) {
                prayerElement.classList.add("prayer-current", "scale-105");
            }
        }
    }

    findNextPrayer(now) {
        const prayerOrder = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
        const prayers = this.prayersValue;

        // Special handling: if it's after Syuruk but before Dhuhr, next prayer is Dhuhr
        if (prayers["syuruk"] && prayers["dhuhr"]) {
            const syurukTime = this.parseTime(prayers["syuruk"]);
            const dhuhrTime = this.parseTime(prayers["dhuhr"]);

            if (now >= syurukTime && now < dhuhrTime) {
                return {
                    key: "dhuhr",
                    time: dhuhrTime,
                    label: this.getPrayerLabel("dhuhr"),
                };
            }
        }

        for (const prayerKey of prayerOrder) {
            if (prayers[prayerKey]) {
                const prayerTime = this.parseTime(prayers[prayerKey]);

                if (prayerTime > now) {
                    return {
                        key: prayerKey,
                        time: prayerTime,
                        label: this.getPrayerLabel(prayerKey),
                    };
                }
            }
        }

        // If no prayer is found for today, return the first prayer of tomorrow
        if (prayers["fajr"]) {
            const tomorrowFajr = this.parseTime(prayers["fajr"]);
            tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);

            return {
                key: "fajr",
                time: tomorrowFajr,
                label: this.getPrayerLabel("fajr"),
            };
        }

        return null;
    }

    parseTime(timeString) {
        // Handle Rails Time object or formatted time string
        if (timeString.includes("T")) {
            return new Date(timeString);
        }

        // Parse time like "05:49 AM", "05:49", or "06:08:00" (24-hour with seconds)
        const parts = timeString.trim().split(" ");
        const time = parts[0];
        const period = parts[1]; // AM/PM or undefined

        const timeParts = time.split(":");
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);

        const date = new Date();
        let hour24 = hours;

        if (period) {
            // 12-hour format with AM/PM
            if (period === "PM" && hours !== 12) {
                hour24 += 12;
            } else if (period === "AM" && hours === 12) {
                hour24 = 0;
            }
        }
        // If no period, assume it's already in 24-hour format

        date.setHours(hour24, minutes, 0, 0);
        return date;
    }

    getPrayerLabel(prayerKey) {
        const labels = {
            imsak: "Imsak",
            fajr: "Subuh",
            syuruk: "Syuruk",
            dhuha: "Dhuha",
            dhuhr: "Zohor",
            asr: "Asar",
            maghrib: "Maghrib",
            isha: "Isyak",
        };
        return labels[prayerKey] || prayerKey;
    }

    displayNextPrayer(nextPrayer, now) {
        if (this.hasNextPrayerTarget) {
            this.nextPrayerTarget.textContent = `Solat Seterusnya: ${nextPrayer.label}`;
        }

        if (this.hasCountdownTarget) {
            const timeDiff = nextPrayer.time - now;

            if (timeDiff > 0) {
                const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                const minutes = Math.floor(
                    (timeDiff % (1000 * 60 * 60)) / (1000 * 60),
                );
                const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

                this.countdownTarget.textContent = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
            } else {
                this.countdownTarget.textContent = "00:00:00";
            }
        }

        // Update progress bar
        this.updateProgressBar(nextPrayer, now);
    }

    updateProgressBar(nextPrayer, now) {
        const currentTime = now.getTime();
        const nextPrayerTime = nextPrayer.time.getTime();

        // Find the previous prayer time to calculate progress
        const previousPrayer = this.findPreviousPrayer(nextPrayer.key, now);

        if (previousPrayer && this.hasProgressBarTarget) {
            const previousPrayerTime = previousPrayer.time.getTime();
            const totalDuration = nextPrayerTime - previousPrayerTime;
            const elapsed = currentTime - previousPrayerTime;

            // Calculate progress percentage (0-100)
            let progressPercentage = (elapsed / totalDuration) * 100;

            // Ensure progress is between 0 and 100
            progressPercentage = Math.max(0, Math.min(100, progressPercentage));

            // Update progress bar width
            this.progressBarTarget.style.width = `${progressPercentage}%`;

            // Update progress start and end times
            if (this.hasProgressStartTarget) {
                this.progressStartTarget.textContent = this.formatTime(
                    previousPrayer.time,
                );
            }
            if (this.hasProgressEndTarget) {
                this.progressEndTarget.textContent = this.formatTime(
                    nextPrayer.time,
                );
            }

            // Show intermediate prayers (Syuruk and Dhuha) if between Fajr and Dhuhr
            this.updateIntermediatePrayers(
                previousPrayer,
                nextPrayer,
                previousPrayerTime,
                nextPrayerTime,
                totalDuration,
            );
        } else {
            // Reset progress bar if no previous prayer found
            if (this.hasProgressBarTarget) {
                this.progressBarTarget.style.width = "0%";
            }
            if (this.hasProgressStartTarget) {
                this.progressStartTarget.textContent = "--:--";
            }
            if (this.hasProgressEndTarget) {
                this.progressEndTarget.textContent = this.formatTime(
                    nextPrayer.time,
                );
            }
            this.hideIntermediatePrayers();
        }
    }

    updateIntermediatePrayers(
        previousPrayer,
        nextPrayer,
        previousPrayerTime,
        nextPrayerTime,
        totalDuration,
    ) {
        const prayers = this.prayersValue;

        // Check if we're between Fajr and Dhuhr
        if (previousPrayer.key === "fajr" && nextPrayer.key === "dhuhr") {
            // Show Syuruk marker and time
            if (prayers["syuruk"] && this.hasSyurukMarkerTarget) {
                const syurukTime = this.parseTime(prayers["syuruk"]).getTime();
                const syurukPosition =
                    ((syurukTime - previousPrayerTime) / totalDuration) * 100;

                this.syurukMarkerTarget.style.left = `${Math.max(0, Math.min(100, syurukPosition))}%`;
                this.syurukMarkerTarget.style.display = "flex";

                // Position the label at the same position as the marker
                if (this.hasSyurukLabelTarget) {
                    this.syurukLabelTarget.style.left = `${Math.max(0, Math.min(100, syurukPosition))}%`;
                    this.syurukLabelTarget.style.display = "inline";
                }

                if (this.hasSyurukTimeTarget) {
                    this.syurukTimeTarget.textContent = this.formatTime(
                        this.parseTime(prayers["syuruk"]),
                    );
                }
            }

            // Show Dhuha marker and time
            if (prayers["dhuha"] && this.hasDhuhaMarkerTarget) {
                const dhuhaTime = this.parseTime(prayers["dhuha"]).getTime();
                const dhuhaPosition =
                    ((dhuhaTime - previousPrayerTime) / totalDuration) * 100;

                this.dhuhaMarkerTarget.style.left = `${Math.max(0, Math.min(100, dhuhaPosition))}%`;
                this.dhuhaMarkerTarget.style.display = "flex";

                // Position the label at the same position as the marker
                if (this.hasDhuhaLabelTarget) {
                    this.dhuhaLabelTarget.style.left = `${Math.max(0, Math.min(100, dhuhaPosition))}%`;
                    this.dhuhaLabelTarget.style.display = "inline";
                }

                if (this.hasDhuhaTimeTarget) {
                    this.dhuhaTimeTarget.textContent = this.formatTime(
                        this.parseTime(prayers["dhuha"]),
                    );
                }
            }
        } else {
            this.hideIntermediatePrayers();
        }
    }

    hideIntermediatePrayers() {
        if (this.hasSyurukMarkerTarget) {
            this.syurukMarkerTarget.style.display = "none";
        }
        if (this.hasDhuhaMarkerTarget) {
            this.dhuhaMarkerTarget.style.display = "none";
        }
        if (this.hasSyurukLabelTarget) {
            this.syurukLabelTarget.style.display = "none";
        }
        if (this.hasDhuhaLabelTarget) {
            this.dhuhaLabelTarget.style.display = "none";
        }
    }

    findPreviousPrayer(nextPrayerKey, now) {
        const prayerOrder = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
        const prayers = this.prayersValue;

        const nextIndex = prayerOrder.indexOf(nextPrayerKey);

        // If next prayer is Fajr, previous is Isha
        // Two scenarios:
        // 1. After Isha (evening): use today's Isha
        // 2. Before Fajr (early morning): use yesterday's Isha
        if (nextIndex === 0) {
            if (prayers["isha"]) {
                const ishaTime = this.parseTime(prayers["isha"]);

                if (now >= ishaTime) {
                    // Scenario 1: After Isha (evening) - use today's Isha
                    return {
                        key: "isha",
                        time: ishaTime,
                        label: this.getPrayerLabel("isha"),
                    };
                } else {
                    // Scenario 2: Early morning before Fajr - use yesterday's Isha
                    const yesterdayIsha = new Date(ishaTime);
                    yesterdayIsha.setDate(yesterdayIsha.getDate() - 1);
                    return {
                        key: "isha",
                        time: yesterdayIsha,
                        label: this.getPrayerLabel("isha"),
                    };
                }
            }
        } else {
            // Find the previous prayer in the order
            for (let i = nextIndex - 1; i >= 0; i--) {
                const prayerKey = prayerOrder[i];
                if (prayers[prayerKey]) {
                    const prayerTime = this.parseTime(prayers[prayerKey]);
                    if (prayerTime <= now) {
                        return {
                            key: prayerKey,
                            time: prayerTime,
                            label: this.getPrayerLabel(prayerKey),
                        };
                    }
                }
            }
        }

        return null;
    }

    formatTime(date) {
        // Format based on time format setting
        if (this.timeFormat === "24") {
            return date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
        }

        // 12-hour format with AM/PM, no seconds
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }
}
