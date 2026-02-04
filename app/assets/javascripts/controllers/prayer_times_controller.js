import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["nextPrayer", "countdown", "progressBar", "progressStart", "progressEnd",
                   "syurukMarker", "dhuhaMarker", "syurukTime", "dhuhaTime",
                   "syurukLabel", "dhuhaLabel"]
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
      el.classList.remove('prayer-current', 'scale-105')
    })

    // Highlight current prayer
    if (currentPrayer) {
      const prayerElement = document.querySelector(`.${currentPrayer}`)
      if (prayerElement) {
        prayerElement.classList.add('prayer-current', 'scale-105')
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

    // Update progress bar
    this.updateProgressBar(nextPrayer, now)
  }

  updateProgressBar(nextPrayer, now) {
    const currentTime = now.getTime()
    const nextPrayerTime = nextPrayer.time.getTime()

    // Find the previous prayer time to calculate progress
    const previousPrayer = this.findPreviousPrayer(nextPrayer.key, now)

    if (previousPrayer && this.hasProgressBarTarget) {
      const previousPrayerTime = previousPrayer.time.getTime()
      const totalDuration = nextPrayerTime - previousPrayerTime
      const elapsed = currentTime - previousPrayerTime

      // Calculate progress percentage (0-100)
      let progressPercentage = (elapsed / totalDuration) * 100

      // Ensure progress is between 0 and 100
      progressPercentage = Math.max(0, Math.min(100, progressPercentage))

      // Update progress bar width
      this.progressBarTarget.style.width = `${progressPercentage}%`

      // Update progress start and end times
      if (this.hasProgressStartTarget) {
        this.progressStartTarget.textContent = this.formatTime(previousPrayer.time)
      }
      if (this.hasProgressEndTarget) {
        this.progressEndTarget.textContent = this.formatTime(nextPrayer.time)
      }

      // Show intermediate prayers (Syuruk and Dhuha) if between Fajr and Dhuhr
      this.updateIntermediatePrayers(previousPrayer, nextPrayer, previousPrayerTime, nextPrayerTime, totalDuration)
    } else {
      // Reset progress bar if no previous prayer found
      if (this.hasProgressBarTarget) {
        this.progressBarTarget.style.width = '0%'
      }
      if (this.hasProgressStartTarget) {
        this.progressStartTarget.textContent = '--:--'
      }
      if (this.hasProgressEndTarget) {
        this.progressEndTarget.textContent = this.formatTime(nextPrayer.time)
      }
      this.hideIntermediatePrayers()
    }
  }

  updateIntermediatePrayers(previousPrayer, nextPrayer, previousPrayerTime, nextPrayerTime, totalDuration) {
    const prayers = this.prayersValue

    // Check if we're between Fajr and Dhuhr
    if (previousPrayer.key === "fajr" && nextPrayer.key === "dhuhr") {
      // Show Syuruk marker and time
      if (prayers["syuruk"] && this.hasSyurukMarkerTarget) {
        const syurukTime = this.parseTime(prayers["syuruk"]).getTime()
        const syurukPosition = ((syurukTime - previousPrayerTime) / totalDuration) * 100

        this.syurukMarkerTarget.style.left = `${Math.max(0, Math.min(100, syurukPosition))}%`
        this.syurukMarkerTarget.style.display = 'flex'

        // Position the label at the same position as the marker
        if (this.hasSyurukLabelTarget) {
          this.syurukLabelTarget.style.left = `${Math.max(0, Math.min(100, syurukPosition))}%`
          this.syurukLabelTarget.style.display = 'inline'
        }

        if (this.hasSyurukTimeTarget) {
          this.syurukTimeTarget.textContent = this.formatTime(this.parseTime(prayers["syuruk"]))
        }
      }

      // Show Dhuha marker and time
      if (prayers["dhuha"] && this.hasDhuhaMarkerTarget) {
        const dhuhaTime = this.parseTime(prayers["dhuha"]).getTime()
        const dhuhaPosition = ((dhuhaTime - previousPrayerTime) / totalDuration) * 100

        this.dhuhaMarkerTarget.style.left = `${Math.max(0, Math.min(100, dhuhaPosition))}%`
        this.dhuhaMarkerTarget.style.display = 'flex'

        // Position the label at the same position as the marker
        if (this.hasDhuhaLabelTarget) {
          this.dhuhaLabelTarget.style.left = `${Math.max(0, Math.min(100, dhuhaPosition))}%`
          this.dhuhaLabelTarget.style.display = 'inline'
        }

        if (this.hasDhuhaTimeTarget) {
          this.dhuhaTimeTarget.textContent = this.formatTime(this.parseTime(prayers["dhuha"]))
        }
      }
    } else {
      this.hideIntermediatePrayers()
    }
  }

  hideIntermediatePrayers() {
    if (this.hasSyurukMarkerTarget) {
      this.syurukMarkerTarget.style.display = 'none'
    }
    if (this.hasDhuhaMarkerTarget) {
      this.dhuhaMarkerTarget.style.display = 'none'
    }
    if (this.hasSyurukLabelTarget) {
      this.syurukLabelTarget.style.display = 'none'
    }
    if (this.hasDhuhaLabelTarget) {
      this.dhuhaLabelTarget.style.display = 'none'
    }
  }

  findPreviousPrayer(nextPrayerKey, now) {
    const prayerOrder = ["fajr", "dhuhr", "asr", "maghrib", "isha"]
    const prayers = this.prayersValue

    const nextIndex = prayerOrder.indexOf(nextPrayerKey)

    // If it's the first prayer (fajr), check if we're past yesterday's isha
    if (nextIndex === 0) {
      // Use yesterday's isha as previous prayer
      if (prayers["isha"]) {
        const yesterdayIsha = this.parseTime(prayers["isha"])
        yesterdayIsha.setDate(yesterdayIsha.getDate() - 1)
        return {
          key: "isha",
          time: yesterdayIsha,
          label: this.getPrayerLabel("isha")
        }
      }
    } else {
      // Find the previous prayer in the order
      for (let i = nextIndex - 1; i >= 0; i--) {
        const prayerKey = prayerOrder[i]
        if (prayers[prayerKey]) {
          const prayerTime = this.parseTime(prayers[prayerKey])
          if (prayerTime <= now) {
            return {
              key: prayerKey,
              time: prayerTime,
              label: this.getPrayerLabel(prayerKey)
            }
          }
        }
      }
    }

    return null
  }

  formatTime(date) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }
}
