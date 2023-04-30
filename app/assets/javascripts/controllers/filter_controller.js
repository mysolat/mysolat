import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['listItem', 'searchTerm']

  connect () {}

  filterList () {
    const searchTerm = this.searchTermTarget.value.toLowerCase()

    console.log(searchTerm)

    this.listItemTargets.forEach(item => {
      const text = item.textContent.toLowerCase()

      if (text.includes(searchTerm)) {
        item.style.display = 'block'
      } else {
        item.style.display = 'none'
      }
    })
  }
}
