import { Controller } from "stimulus"

export default class extends Controller {
  static targets = [ "background", "container" ]

  connect() {
    this.toggleClass = this.data.get("class") || "hidden"
  }

  open(e) {
    e.preventDefault()

    let scrollbarWidth                = window.innerWidth - document.documentElement.clientWidth
    document.body.style.paddingRight  = `${scrollbarWidth}px`
    document.body.style.overflow      = "hidden"

    this.containerTarget.classList.remove(this.toggleClass)
  }

  close(e) {
    e.preventDefault()

    document.body.style.paddingRight = null
    document.body.style.overflow     = null

    this.containerTarget.classList.add(this.toggleClass)
  }

  closeBackground(e) {
    if (e.target === this.backgroundTarget) { this.close(e) }
  }

  closeWithKeyboard(e) {
    if (e.keyCode === 27) {
      this.close(e)
    }
  }
}
