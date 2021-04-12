import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['source']

  initialize () {
    //console.log('clipboard initialize')
  }

  connect () {
    //console.log('clipboard connect')
    if (document.queryCommandSupported('copy')) {
      this.element.classList.add('clipboard--supported')
    }
  }

  copy (event) {
    event.preventDefault()
    $.snackbar({
      content: 'Copied to clipboard'
    })
    this.selectText(this.sourceTarget)
    document.execCommand('copy')
    this.deselectAll()
  }

  selectText (element) {
    if (/INPUT|TEXTAREA/i.test(element.tagName)) {
      element.focus()
      if (element.setSelectionRange) {
        element.setSelectionRange(0, element.value.length)
      } else {
        element.select()
      }
      return
    }

    if (window.getSelection) {
      // All browsers, except IE <=8
      window.getSelection().selectAllChildren(element)
    } else if (document.body.createTextRange) {
      // IE <=8
      var range = document.body.createTextRange()
      range.moveToElementText(element)
      range.select()
    }
  }

  deselectAll () {
    var element = document.activeElement
    if (element && /INPUT|TEXTAREA/i.test(element.tagName)) {
      if ('selectionStart' in element) {
        element.selectionEnd = element.selectionStart
      }
      element.blur()
    }

    if (window.getSelection) {
      // All browsers, except IE <=8
      window.getSelection().removeAllRanges()
    } else if (document.selection) {
      // IE <=8
      document.selection.empty()
    }
  }
}
