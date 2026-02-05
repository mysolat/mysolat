const DB_NAME = "mysolat";
const DB_VERSION = 1;
const STORE_NAME = "prayer_times";

class PrayerTimesDB {
  constructor() {
    this.db = null;
  }

  async open() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("zone_year", ["zone", "year"], { unique: true });
        }
      };
    });
  }

  generateId(zone, year) {
    return `${zone}_${year}`;
  }

  async get(zone, year) {
    await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(this.generateId(zone, year));

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async save(zone, year, data) {
    await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const record = {
        id: this.generateId(zone, year),
        zone: zone,
        year: year,
        data: data,
        savedAt: new Date().toISOString(),
      };

      const request = store.put(record);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(record);
    });
  }

  async getToday(zone) {
    return this.getByDate(zone, new Date());
  }

  async getByDate(zone, date) {
    const year = date.getFullYear();
    const cached = await this.get(zone, year);

    if (!cached) return null;

    const dateStr = this.formatDate(date);
    const prayerTimes = cached.data.prayerTime || [];

    return {
      today: prayerTimes.find((p) => p.date === dateStr),
      bearing: cached.data.bearing,
      prayerTime: prayerTimes,
    };
  }

  async getMonth(zone, month) {
    const year = new Date().getFullYear();
    const cached = await this.get(zone, year);

    if (!cached) return null;

    const targetMonth = month || new Date().getMonth() + 1;
    const prayerTimes = cached.data.prayerTime || [];

    const monthlyData = prayerTimes.filter((p) => {
      const date = this.parseDate(p.date);
      return date && date.getMonth() + 1 === targetMonth;
    });

    return {
      prayerTime: monthlyData,
      bearing: cached.data.bearing,
    };
  }

  formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  parseDate(dateStr) {
    // Parse "01-Jan-2025" format
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

  async hasCurrentYear(zone) {
    const year = new Date().getFullYear();
    const cached = await this.get(zone, year);
    return cached !== null && cached !== undefined;
  }

  async clear() {
    await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

const prayerTimesDB = new PrayerTimesDB();
export default prayerTimesDB;
