
import { Controller } from '@hotwired/stimulus'
export default class extends Controller {
  initialize () {
    this.apply()
  }

  connect () {
    console.log('connect theme')
  }

  apply () {
    document.documentElement.setAttribute('data-theme', this.theme)
  }

  switch (event) {
    this.theme = event.target.dataset.themeValue
    this.apply()
  }

  get theme () {
    return window.localStorage.getItem('theme')
  }

  set theme (value) {
    window.localStorage.setItem('theme', value)
  }
}
