import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["content", "icon", "label", "button"]
  static values = { open: { type: Boolean, default: false } }

  connect() {
    this.updateUI()
  }

  toggle() {
    this.openValue = !this.openValue
    this.updateUI()
  }

  updateUI() {
    if (this.openValue) {
      this.expand()
    } else {
      this.collapse()
    }
  }

  expand() {
    if (this.hasContentTarget) {
      this.contentTarget.style.maxHeight = this.contentTarget.scrollHeight + "px"
    }
    if (this.hasIconTarget) {
      this.iconTarget.classList.add("rotate-180")
    }
    if (this.hasLabelTarget) {
      this.labelTarget.textContent = "Sembunyi"
    }
    if (this.hasButtonTarget) {
      this.buttonTarget.setAttribute("aria-expanded", "true")
    }
  }

  collapse() {
    if (this.hasContentTarget) {
      this.contentTarget.style.maxHeight = "0"
    }
    if (this.hasIconTarget) {
      this.iconTarget.classList.remove("rotate-180")
    }
    if (this.hasLabelTarget) {
      this.labelTarget.textContent = "Tunjuk"
    }
    if (this.hasButtonTarget) {
      this.buttonTarget.setAttribute("aria-expanded", "false")
    }
  }
}
