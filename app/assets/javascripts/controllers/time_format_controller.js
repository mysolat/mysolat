import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = ["toggle", "label"]

    connect() {
        this.updateUI()
    }

    toggle() {
        const current = this.getTimeFormat()
        const newFormat = current === "12" ? "24" : "12"
        this.setTimeFormat(newFormat)
        this.updateUI()

        // Dispatch event so prayer_times_controller can update
        window.dispatchEvent(new CustomEvent("timeFormatChanged", { detail: { format: newFormat } }))
    }

    getTimeFormat() {
        return localStorage.getItem("timeFormat") || "12"
    }

    setTimeFormat(format) {
        localStorage.setItem("timeFormat", format)
    }

    updateUI() {
        const format = this.getTimeFormat()

        if (this.hasToggleTarget) {
            this.toggleTarget.checked = format === "24"
        }

        if (this.hasLabelTarget) {
            this.labelTarget.textContent = format === "24" ? "24 jam" : "12 jam"
        }
    }
}
