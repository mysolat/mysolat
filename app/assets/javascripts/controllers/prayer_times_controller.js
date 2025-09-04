import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["nextPrayer", "countdown"]
  static values = { prayers: Object }

  connect() {
    this.updateNextPrayer()
    this.highlightCurrentPrayer()
    this.interval = setInterval(() => {
      this.updateNextPrayer()
      this.highlightCurrentPrayer()
    }, 1000)
  }

  disconnect() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  updateNextPrayer() {
    const now = new Date()
    const nextPrayer = this.findNextPrayer(now)

    if (nextPrayer) {
      this.displayNextPrayer(nextPrayer, now)
    }
  }

  highlightCurrentPrayer() {
    const now = new Date()
    const prayerOrder = ["imsak", "fajr", "syuruk", "dhuha", "dhuhr", "asr", "maghrib", "isha"]
    const prayers = this.prayersValue

    let currentPrayer = null

    // Find the current prayer period (between current prayer and next prayer)
    for (let i = 0; i < prayerOrder.length; i++) {
      const prayerKey = prayerOrder[i]
      const nextPrayerKey = prayerOrder[i + 1]

      if (prayers[prayerKey]) {
        const prayerTime = this.parseTime(prayers[prayerKey])

        if (prayerTime <= now) {
          currentPrayer = prayerKey

          // Check if we haven't passed the next prayer yet
          if (nextPrayerKey && prayers[nextPrayerKey]) {
            const nextPrayerTime = this.parseTime(prayers[nextPrayerKey])
            if (now >= nextPrayerTime) {
              currentPrayer = null // Continue to next iteration
            }
          }
        }
      }
    }

    // Remove previous highlights
    document.querySelectorAll('.prayer-current').forEach(el => {
      el.classList.remove('prayer-current', 'bg-accent', 'text-accent-content', 'scale-105', 'shadow-lg')
    })

    // Highlight current prayer
    if (currentPrayer) {
      const prayerElement = document.querySelector(`.${currentPrayer}`)
      if (prayerElement) {
        prayerElement.classList.add('prayer-current', 'bg-accent', 'text-accent-content', 'scale-105', 'shadow-lg')
      }
    }
  }

  findNextPrayer(now) {
    const prayerOrder = ["fajr", "dhuhr", "asr", "maghrib", "isha"]
    const prayers = this.prayersValue

    // Special handling: if it's after Syuruk but before Dhuhr, next prayer is Dhuhr
    if (prayers["syuruk"] && prayers["dhuhr"]) {
      const syurukTime = this.parseTime(prayers["syuruk"])
      const dhuhrTime = this.parseTime(prayers["dhuhr"])

      if (now >= syurukTime && now < dhuhrTime) {
        return {
          key: "dhuhr",
          time: dhuhrTime,
          label: this.getPrayerLabel("dhuhr")
        }
      }
    }

    for (const prayerKey of prayerOrder) {
      if (prayers[prayerKey]) {
        const prayerTime = this.parseTime(prayers[prayerKey])

        if (prayerTime > now) {
          return {
            key: prayerKey,
            time: prayerTime,
            label: this.getPrayerLabel(prayerKey)
          }
        }
      }
    }

    // If no prayer is found for today, return the first prayer of tomorrow
    if (prayers["fajr"]) {
      const tomorrowFajr = this.parseTime(prayers["fajr"])
      tomorrowFajr.setDate(tomorrowFajr.getDate() + 1)

      return {
        key: "fajr",
        time: tomorrowFajr,
        label: this.getPrayerLabel("fajr")
      }
    }

    return null
  }

  parseTime(timeString) {
    // Handle Rails Time object or formatted time string
    if (timeString.includes('T')) {
      return new Date(timeString)
    }

    // Parse time like "05:49 AM" or just "05:49"
    const parts = timeString.trim().split(' ')
    const time = parts[0]
    const period = parts[1] // AM/PM or undefined

    const [hours, minutes] = time.split(':').map(Number)

    const date = new Date()
    let hour24 = hours

    if (period) {
      if (period === 'PM' && hours !== 12) {
        hour24 += 12
      } else if (period === 'AM' && hours === 12) {
        hour24 = 0
      }
    }

    date.setHours(hour24, minutes, 0, 0)
    return date
  }

  getPrayerLabel(prayerKey) {
    const labels = {
      "imsak": "Imsak",
      "fajr": "Subuh",
      "syuruk": "Syuruk",
      "dhuha": "Dhuha",
      "dhuhr": "Zohor",
      "asr": "Asar",
      "maghrib": "Maghrib",
      "isha": "Isyak"
    }
    return labels[prayerKey] || prayerKey
  }

  displayNextPrayer(nextPrayer, now) {
    if (this.hasNextPrayerTarget) {
      this.nextPrayerTarget.textContent = `Solat Seterusnya: ${nextPrayer.label}`
    }

    if (this.hasCountdownTarget) {
      const timeDiff = nextPrayer.time - now

      if (timeDiff > 0) {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60))
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)

        this.countdownTarget.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      } else {
        this.countdownTarget.textContent = "00:00:00"
      }
    }
  }
}
