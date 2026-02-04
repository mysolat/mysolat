import { Controller } from "@hotwired/stimulus";
import prayerTimesDB from "../services/prayer_times_db";

export default class extends Controller {
    static targets = [
        "list",
        "count",
        "monthLabel",
        "yearLabel",
        "prevLink",
        "nextLink",
        "todayBtn",
        "calendarToggle",
        "calendarLabel",
    ];
    static values = {
        zone: String,
        month: Number,
        year: Number,
        hijriMonth: Number,
        hijriYear: Number,
    };

    async connect() {
        this.zone = this.zoneValue || this.getZoneFromCookie() || "SGR01";
        this.month = this.monthValue || new Date().getMonth() + 1;
        this.year = this.yearValue || new Date().getFullYear();
        this.hijriMonth = this.hijriMonthValue || null;
        this.hijriYear = this.hijriYearValue || null;
        this.timeFormat = this.getTimeFormat();
        this.calendarMode = this.getCalendarMode(); // "gregorian" or "hijri"
        this.yearlyData = null;

        // Listen for time format changes
        this.handleTimeFormatChange = this.handleTimeFormatChange.bind(this);
        window.addEventListener(
            "timeFormatChanged",
            this.handleTimeFormatChange,
        );

        await this.loadYearlyData();
    }

    disconnect() {
        window.removeEventListener(
            "timeFormatChanged",
            this.handleTimeFormatChange,
        );
    }

    handleTimeFormatChange(event) {
        this.timeFormat = event.detail.format;
        this.renderCurrentMonth();
    }

    getZoneFromCookie() {
        const match = document.cookie.match(/(?:^|; )zone=([^;]*)/);
        return match ? decodeURIComponent(match[1]) : null;
    }

    getTimeFormat() {
        return localStorage.getItem("timeFormat") || "12";
    }

    getCalendarMode() {
        return localStorage.getItem("calendarMode") || "gregorian";
    }

    setCalendarMode(mode) {
        localStorage.setItem("calendarMode", mode);
        this.calendarMode = mode;
    }

    toggleCalendar() {
        const newMode =
            this.calendarMode === "gregorian" ? "hijri" : "gregorian";
        this.setCalendarMode(newMode);

        // Detect current hijri month if switching to hijri and not yet set
        if (newMode === "hijri" && (!this.hijriMonth || !this.hijriYear)) {
            this.detectCurrentHijriMonth();
        }

        this.updateCalendarUI();
        this.renderCurrentMonth();
    }

    updateCalendarUI() {
        if (this.hasCalendarToggleTarget) {
            this.calendarToggleTarget.checked = this.calendarMode === "hijri";
        }
        if (this.hasCalendarLabelTarget) {
            this.calendarLabelTarget.textContent =
                this.calendarMode === "hijri" ? "Hijri" : "Masihi";
        }
    }

    async loadYearlyData() {
        try {
            // Try to get from IndexedDB first
            let cached = await prayerTimesDB.get(this.zone, this.year);

            if (cached && cached.data && cached.data.prayerTime) {
                this.yearlyData = cached.data.prayerTime;
            } else {
                // Fetch yearly data from API
                const response = await fetch(
                    `/api/yearly/${this.zone}/${this.year}`,
                );
                if (!response.ok)
                    throw new Error("Failed to fetch yearly data");

                const data = await response.json();
                await prayerTimesDB.save(this.zone, this.year, data);
                this.yearlyData = data.prayerTime;
            }

            // If in hijri mode, detect current hijri month from data
            if (this.calendarMode === "hijri" && !this.hijriMonth) {
                this.detectCurrentHijriMonth();
            }

            this.updateCalendarUI();
            this.renderCurrentMonth();
        } catch (error) {
            console.error("Error loading yearly data:", error);
            this.renderError();
        }
    }

    detectCurrentHijriMonth() {
        if (!this.yearlyData) return;

        // Find today's entry to get current hijri month
        const today = new Date();
        const todayStr = this.formatDateForComparison(today);

        for (const day of this.yearlyData) {
            const date = this.parseDate(day.date);
            if (date && this.formatDateForComparison(date) === todayStr) {
                const hijri = this.parseHijriDate(day.hijri);
                if (hijri) {
                    this.hijriMonth = hijri.month;
                    this.hijriYear = hijri.year;
                }
                break;
            }
        }

        // Fallback: use first entry's hijri month
        if (!this.hijriMonth && this.yearlyData.length > 0) {
            const firstHijri = this.parseHijriDate(this.yearlyData[0].hijri);
            if (firstHijri) {
                this.hijriMonth = firstHijri.month;
                this.hijriYear = firstHijri.year;
            }
        }
    }

    formatDateForComparison(date) {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    }

    renderCurrentMonth() {
        if (!this.yearlyData) return;

        let monthlyData;
        if (this.calendarMode === "hijri") {
            monthlyData = this.filterByHijriMonth(
                this.yearlyData,
                this.hijriMonth,
                this.hijriYear,
            );
            this.updateNavigationForHijri();
        } else {
            monthlyData = this.filterByMonth(this.yearlyData, this.month);
            this.updateNavigationForGregorian();
        }

        this.renderMonthlyList(monthlyData);
    }

    filterByMonth(prayerTimes, month) {
        return prayerTimes.filter((p) => {
            const date = this.parseDate(p.date);
            return date && date.getMonth() + 1 === month;
        });
    }

    filterByHijriMonth(prayerTimes, hijriMonth, hijriYear) {
        return prayerTimes.filter((p) => {
            const hijri = this.parseHijriDate(p.hijri);
            return (
                hijri && hijri.month === hijriMonth && hijri.year === hijriYear
            );
        });
    }

    parseHijriDate(hijriStr) {
        if (!hijriStr) return null;
        const parts = hijriStr.split("-");
        if (parts.length !== 3) return null;

        return {
            year: parseInt(parts[0], 10),
            month: parseInt(parts[1], 10),
            day: parseInt(parts[2], 10),
        };
    }

    updateNavigationForGregorian() {
        const gregorianMonths = [
            "Januari",
            "Februari",
            "Mac",
            "April",
            "Mei",
            "Jun",
            "Julai",
            "Ogos",
            "September",
            "Oktober",
            "November",
            "Disember",
        ];

        if (this.hasMonthLabelTarget) {
            this.monthLabelTarget.textContent = gregorianMonths[this.month - 1];
        }
        if (this.hasYearLabelTarget) {
            this.yearLabelTarget.textContent = this.year;
        }

        // Update today button visibility
        if (this.hasTodayBtnTarget) {
            const now = new Date();
            const isCurrentMonth =
                this.month === now.getMonth() + 1 &&
                this.year === now.getFullYear();
            this.todayBtnTarget.classList.toggle("hidden", isCurrentMonth);
        }
    }

    updateNavigationForHijri() {
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

        if (this.hasMonthLabelTarget) {
            this.monthLabelTarget.textContent =
                hijriMonths[this.hijriMonth - 1] || "";
        }
        if (this.hasYearLabelTarget) {
            this.yearLabelTarget.textContent = `${this.hijriYear} H`;
        }

        // Always show today button in hijri mode if not current hijri month
        if (this.hasTodayBtnTarget) {
            // Detect current hijri month
            const today = new Date();
            const todayStr = this.formatDateForComparison(today);
            let currentHijriMonth = null;
            let currentHijriYear = null;

            for (const day of this.yearlyData) {
                const date = this.parseDate(day.date);
                if (date && this.formatDateForComparison(date) === todayStr) {
                    const hijri = this.parseHijriDate(day.hijri);
                    if (hijri) {
                        currentHijriMonth = hijri.month;
                        currentHijriYear = hijri.year;
                    }
                    break;
                }
            }

            const isCurrentMonth =
                this.hijriMonth === currentHijriMonth &&
                this.hijriYear === currentHijriYear;
            this.todayBtnTarget.classList.toggle("hidden", isCurrentMonth);
        }
    }

    prevMonth() {
        if (this.calendarMode === "hijri") {
            this.hijriMonth--;
            if (this.hijriMonth < 1) {
                this.hijriMonth = 12;
                this.hijriYear--;
                // May need to load previous year's data
                this.checkAndLoadYear(this.hijriYear);
            }
        } else {
            this.month--;
            if (this.month < 1) {
                this.month = 12;
                this.year--;
                this.loadYearlyData();
                return;
            }
        }
        this.renderCurrentMonth();
    }

    nextMonth() {
        if (this.calendarMode === "hijri") {
            this.hijriMonth++;
            if (this.hijriMonth > 12) {
                this.hijriMonth = 1;
                this.hijriYear++;
                // May need to load next year's data
                this.checkAndLoadYear(this.hijriYear);
            }
        } else {
            this.month++;
            if (this.month > 12) {
                this.month = 1;
                this.year++;
                this.loadYearlyData();
                return;
            }
        }
        this.renderCurrentMonth();
    }

    async checkAndLoadYear(hijriYear) {
        // Find which gregorian year contains this hijri year
        // For simplicity, try current year and adjacent years
        const currentYear = new Date().getFullYear();
        const yearsToCheck = [currentYear - 1, currentYear, currentYear + 1];

        for (const gYear of yearsToCheck) {
            let cached = await prayerTimesDB.get(this.zone, gYear);
            if (!cached) {
                try {
                    const response = await fetch(
                        `/api/yearly/${this.zone}/${gYear}`,
                    );
                    if (response.ok) {
                        const data = await response.json();
                        await prayerTimesDB.save(this.zone, gYear, data);
                        cached = { data };
                    }
                } catch (e) {
                    continue;
                }
            }

            if (cached && cached.data && cached.data.prayerTime) {
                // Check if this year contains the hijri month we want
                const hasMonth = cached.data.prayerTime.some((p) => {
                    const hijri = this.parseHijriDate(p.hijri);
                    return (
                        hijri &&
                        hijri.year === hijriYear &&
                        hijri.month === this.hijriMonth
                    );
                });

                if (hasMonth) {
                    this.year = gYear;
                    this.yearlyData = cached.data.prayerTime;
                    this.renderCurrentMonth();
                    return;
                }
            }
        }

        this.renderCurrentMonth();
    }

    goToToday() {
        const now = new Date();

        if (this.calendarMode === "hijri") {
            // Find today's hijri date
            const todayStr = this.formatDateForComparison(now);
            for (const day of this.yearlyData) {
                const date = this.parseDate(day.date);
                if (date && this.formatDateForComparison(date) === todayStr) {
                    const hijri = this.parseHijriDate(day.hijri);
                    if (hijri) {
                        this.hijriMonth = hijri.month;
                        this.hijriYear = hijri.year;
                    }
                    break;
                }
            }
        } else {
            this.month = now.getMonth() + 1;
            this.year = now.getFullYear();
        }

        this.loadYearlyData();
    }

    parseDate(dateStr) {
        // Parse "01-Jan-2026" format
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

    renderMonthlyList(monthlyData) {
        if (!this.hasListTarget) return;

        // Update count badge
        if (this.hasCountTarget) {
            this.countTarget.textContent = `${monthlyData.length} hari`;
        }

        const prayers = [
            { key: "imsak", label: "Imsak" },
            { key: "fajr", label: "Subuh" },
            { key: "syuruk", label: "Syuruk" },
            { key: "dhuha", label: "Dhuha" },
            { key: "dhuhr", label: "Zohor" },
            { key: "asr", label: "Asar" },
            { key: "maghrib", label: "Maghrib" },
            { key: "isha", label: "Isyak" },
        ];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (monthlyData.length === 0) {
            this.listTarget.innerHTML = `
                <div class="text-center py-8 text-base-content/60">
                    <p>Tiada data untuk bulan ini.</p>
                </div>
            `;
            return;
        }

        let html = "";
        monthlyData.forEach((day) => {
            const date = this.parseDate(day.date);
            const isToday = date && date.getTime() === today.getTime();
            const isFriday = date && date.getDay() === 5;

            // Determine which date to show prominently based on calendar mode
            const primaryDate =
                this.calendarMode === "hijri"
                    ? this.formatHijriDateFull(day.hijri)
                    : this.formatDateLong(date);
            const secondaryDate =
                this.calendarMode === "hijri"
                    ? this.formatDateLong(date)
                    : this.formatHijriDateShort(day.hijri);

            // Friday highlight class
            const fridayClass = !isToday && isFriday ? "text-accent" : "";

            html += `
                <div class="group rounded-xl p-3 transition-all duration-200 border backdrop-blur-sm ${isToday ? "bg-primary text-primary-content border-primary shadow-lg scale-[1.02]" : "bg-white/10 border-white/10 hover:bg-white/20"}">
                    <!-- Mobile View -->
                    <div class="md:hidden">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-2">
                                ${isToday ? '<div class="badge badge-secondary badge-sm">Hari Ini</div>' : ""}
                                <div class="font-bold ${fridayClass}">${this.formatDayName(date)}</div>
                                <span class="text-sm">${primaryDate}</span>
                            </div>
                            <div class="text-xs opacity-70">${secondaryDate}</div>
                        </div>
                        <div class="grid grid-cols-4 gap-2 text-center">
                            ${prayers
                                .map(
                                    (prayer) => `
                                <div class="rounded-lg p-2 ${isToday ? "bg-primary-content/10" : "bg-white/10"} ${prayer.key}">
                                    <div class="text-xs opacity-60">${prayer.label}</div>
                                    <div class="text-sm font-bold tabular-nums">${this.formatTime(day[prayer.key])}</div>
                                </div>
                            `,
                                )
                                .join("")}
                        </div>
                    </div>

                    <!-- Desktop View -->
                    <div class="hidden md:grid md:grid-cols-9 gap-2 items-center">
                        <div class="col-span-1">
                            ${isToday ? '<div class="badge badge-secondary badge-sm mb-1">Hari Ini</div>' : ""}
                            <div class="font-bold ${fridayClass}">${this.formatDayName(date)}</div>
                            <div class="text-sm opacity-80">${primaryDate}</div>
                            <div class="text-xs opacity-60">${secondaryDate}</div>
                        </div>
                        ${prayers
                            .map(
                                (prayer) => `
                            <div class="text-center font-semibold tabular-nums ${prayer.key}">
                                ${this.formatTimeWithPeriod(day[prayer.key])}
                            </div>
                        `,
                            )
                            .join("")}
                    </div>
                </div>
            `;
        });

        this.listTarget.innerHTML = html;
    }

    formatTime(timeStr) {
        if (!timeStr) return "--:--";
        const { hours, minutes } = this.parseTimeComponents(timeStr);

        if (this.timeFormat === "24") {
            return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
        }

        let hour12 = hours;
        if (hours === 0) {
            hour12 = 12;
        } else if (hours > 12) {
            hour12 = hours - 12;
        }

        return `${hour12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    }

    formatTimeWithPeriod(timeStr) {
        if (!timeStr) return "--:--";
        const time = this.formatTime(timeStr);

        if (this.timeFormat === "24") {
            return time;
        }

        const { hours } = this.parseTimeComponents(timeStr);
        const period = hours < 12 ? "AM" : "PM";
        return `${time} ${period}`;
    }

    parseTimeComponents(timeStr) {
        const parts = timeStr.trim().split(" ");
        const timeParts = parts[0].split(":");
        let hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);

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

    formatDayName(date) {
        if (!date) return "";
        return date.toLocaleDateString("ms-MY", { weekday: "long" });
    }

    formatDateLong(date) {
        if (!date) return "";
        return date.toLocaleDateString("ms-MY", {
            day: "numeric",
            month: "long",
        });
    }

    formatHijriDateShort(hijriStr) {
        if (!hijriStr) return "";
        const parts = hijriStr.split("-");
        if (parts.length !== 3) return hijriStr;

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
        return `${day} ${monthName}`;
    }

    formatHijriDateFull(hijriStr) {
        if (!hijriStr) return "";
        const parts = hijriStr.split("-");
        if (parts.length !== 3) return hijriStr;

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
        return `${day} ${monthName}`;
    }

    renderError() {
        if (!this.hasListTarget) return;
        this.listTarget.innerHTML = `
            <div class="text-center py-8 text-base-content/60">
                <p>Gagal memuatkan data. Sila cuba lagi.</p>
            </div>
        `;
    }
}
