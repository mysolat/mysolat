import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['listItem', 'parentListItem', 'searchTerm']

  connect() { }

  filterList() {
    const searchTerm = this.searchTermTarget.value.toLowerCase()

    this.listItemTargets.forEach(item => {
      const text = item.textContent.toLowerCase()

      if (text.includes(searchTerm)) {
        item.style.display = 'block'
      } else {
        item.style.display = 'none'
      }
    })

    this.parentListItemTargets.forEach(parent => {
      const listItems = parent.querySelectorAll('[data-filter-target="listItem"]')
      const anyVisible = Array.from(listItems).some(item => item.style.display === 'block')

      if (anyVisible) {
        parent.style.display = 'block'
      } else {
        parent.style.display = 'none'
      }
    })
  }
}
