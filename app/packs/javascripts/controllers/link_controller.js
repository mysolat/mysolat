import { Controller } from 'stimulus'

export default class extends Controller {
  connect () {
    console.log('hgeh')
  }

  go (event) {
    this.item = event.currentTarget
    const url = this.item.dataset.url
    const remote = this.item.dataset.remote
    if (remote === 'true') {
      this.load(url)
    } else {
      Turbo.visit(url)
    }
  }

  dispatch (event) {
    const data = event.target.dataset.dispatch
    data.split(' ').forEach(function (e) {
      document.dispatchEvent(new Event(e))
    })
  }

  post (event) {
    const url = this.item.dataset.url
    const params = this.item.dataset.params
    Rails.ajax({
      type: 'POST',
      url: url,
      data: params
    })
  }

  load (path) {
    Rails.ajax({
      type: 'GET',
      url: path,
      dataType: 'script',
      success: () => this._success(),
      complete: () => this._complete(),
      error: () => this._errors()
    })
  }

  loadingContent () {
    return `<div class="modal-body">
              <div class="text-center">
                <span class="spinner-border text-azure"></span>
              </div>
            </div>`
  }

  _success () {}

  _complete () {}

  _errors () {}
}
