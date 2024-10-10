import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["date", "sec", "min", "hours", "ampm"]

  connect() {
    this.element.innerHTML = '';
    this.appendHtml();
    this.updateClock();
    setInterval(() => this.updateClock(), 1000); // Update clock every second
  }

  disconnect() {
    clearInterval(this.interval);
  }

  appendHtml() {
    this.element.insertAdjacentHTML('beforeend', `
      <div id="date" class="mb-6" data-clock-target="date"></div>
      <ul>
        <li id="hours" data-clock-target="hours">00</li>
        <li id="point">:</li>
        <li id="min" data-clock-target="min">00</li>
        <li id="point">:</li>
        <li id="sec" data-clock-target="sec">00</li>
        <li id="ampm" class="ml-2" data-clock-target="ampm">AM</li>
      </ul>
    `);
  }

  updateClock() {
    const monthNames = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
    const dayNames = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 24-hour format to 12-hour format

    this.hoursTarget.textContent = String(displayHours).padStart(2, '0');
    this.minTarget.textContent = String(minutes).padStart(2, '0');
    this.secTarget.textContent = String(seconds).padStart(2, '0');
    this.ampmTarget.textContent = ampm;

    const day = now.getDate();
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    const dayName = dayNames[now.getDay()];

    this.dateTarget.textContent = `${dayName}, ${day} ${month} ${year}`;
  }
}
