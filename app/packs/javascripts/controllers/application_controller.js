import { Controller } from 'stimulus'
import screenfull from 'screenfull'
export default class extends Controller {
  static targets = ['disabled']

  initialize () {}

  connect () {
    $('.main-content').css({
      minHeight: $(window).outerHeight() - 108
    })

    $('.nav-collapse-toggle').click(function () {
      $(this)
        .parent()
        .find('.navbar-nav')
        .toggleClass('show')
      return false
    })

    $(document).on('click', function (e) {
      $('.nav-collapse .navbar-nav').removeClass('show')
    })

    this.formFileInput()
    this.enableTootip()
    this.cssUtils()
    this.defaultModal = document.getElementById('modal')
    if (this.defaultModal) {
      this.defaultModal.addEventListener('shown.bs.modal', this.formFileInput())
    }
  }

  enableTootip () {
    $('[data-toggle="tooltip"]').tooltip()
    // popover
    $('[data-toggle="popover"]').popover({
      container: 'body'
    })
  }

  fullscreen () {
    //TODO: Toggle icon
    screenfull.toggle($('html')[0])
  }

  formFileInput () {
    document.querySelectorAll('.form-file-input').forEach(function (item) {
      item.addEventListener('change', function (e) {
        let fileName = e.target.files
        let files = []
        let i = 0
        while (i < fileName.length) {
          files.push(fileName[i].name)
          i++
        }
        let nextSibling = e.target.nextElementSibling.querySelector(
          '.form-file-text'
        )
        nextSibling.innerText = files.join(', ')
      })
    })
  }

  cssUtils () {
    // Background
    $('[data-background]').each(function () {
      var me = $(this)
      me.css({
        backgroundImage: 'url(' + me.data('background') + ')'
      })
    })

    // Width attribute
    $('[data-width]').each(function () {
      $(this).css({
        width: $(this).data('width')
      })
    })

    // Height attribute
    $('[data-height]').each(function () {
      $(this).css({
        height: $(this).data('height')
      })
    })
  }
}
