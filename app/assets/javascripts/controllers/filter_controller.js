import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['listItem', 'parentListItem', 'searchTerm']

  connect() { }

  filterList() {
    const searchTerm = this.searchTermTarget.value.toLowerCase()

    this.listItemTargets.forEach(item => {
      const text = item.textContent.toLowerCase()
      item.classList.toggle('hidden', !text.includes(searchTerm))
    })

    this.parentListItemTargets.forEach(parent => {
      const listItems = parent.querySelectorAll('[data-filter-target="listItem"]')
      const anyVisible = Array.from(listItems).some(item => !item.classList.contains('hidden'))
      parent.classList.toggle('hidden', searchTerm !== '' && !anyVisible)
    })
  }
}
