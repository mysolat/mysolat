import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["date", "sec", "min", "hours", "ampm"];

  connect() {
    this.element.innerHTML = "";
    this.appendHtml();
    this.updateClock();
    this.interval = setInterval(() => this.updateClock(), 1000);
  }

  disconnect() {
    clearInterval(this.interval);
  }

  appendHtml() {
    const mode = this.element.dataset.clockMode;
    const isMini = this.element.classList.contains("mini-clock");

    if (mode === "hero") {
      this.element.insertAdjacentHTML(
        "beforeend",
        `
        <div class="flex items-center justify-center gap-1 md:gap-2">
          <span data-clock-target="hours">00</span>
          <span class="animate-pulse text-primary">:</span>
          <span data-clock-target="min">00</span>
          <span class="animate-pulse text-primary">:</span>
          <span data-clock-target="sec">00</span>
          <span data-clock-target="ampm" class="text-xl md:text-2xl lg:text-3xl font-bold ml-2 text-base-content/50 self-end mb-1 md:mb-2">AM</span>
        </div>
      `,
      );
    } else if (isMini) {
      this.element.insertAdjacentHTML(
        "beforeend",
        `
        <div class="flex items-center gap-1 text-lg md:text-xl font-bold">
          <span data-clock-target="hours">00</span>
          <span class="animate-pulse">:</span>
          <span data-clock-target="min">00</span>
          <span data-clock-target="ampm" class="text-sm ml-1 opacity-70">AM</span>
        </div>
      `,
      );
    } else {
      this.element.insertAdjacentHTML(
        "beforeend",
        `
        <div id="date" class="mb-6" data-clock-target="date"></div>
        <ul>
          <li id="hours" data-clock-target="hours">00</li>
          <li id="point">:</li>
          <li id="min" data-clock-target="min">00</li>
          <li id="point">:</li>
          <li id="sec" data-clock-target="sec">00</li>
          <li id="ampm" class="ml-2" data-clock-target="ampm">AM</li>
        </ul>
      `,
      );
    }
  }

  updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    this.hoursTarget.textContent = String(displayHours).padStart(2, "0");
    this.minTarget.textContent = String(minutes).padStart(2, "0");
    if (this.hasSecTarget) {
      this.secTarget.textContent = String(seconds).padStart(2, "0");
    }
    this.ampmTarget.textContent = ampm;

    if (this.hasDateTarget) {
      const monthNames = [
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
      const dayNames = [
        "Ahad",
        "Isnin",
        "Selasa",
        "Rabu",
        "Khamis",
        "Jumaat",
        "Sabtu",
      ];
      const day = now.getDate();
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      const dayName = dayNames[now.getDay()];
      this.dateTarget.textContent = `${dayName}, ${day} ${month} ${year}`;
    }
  }
}
