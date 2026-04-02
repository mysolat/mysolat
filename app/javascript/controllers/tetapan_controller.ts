import { Controller } from '@hotwired/stimulus'

/**
 * Tetapan (Settings) Drawer Controller
 * 
 * Manages the bottom drawer for settings using Stimulus
 * Integrates with Base UI Modal style
 * 
 * @see https://base-ui.com/react/components/modal/
 */
export default class TetapanController extends Controller {
  static targets = ['backdrop', 'drawer']

  declare readonly backdropTarget: HTMLElement
  declare readonly drawertarget: HTMLElement
  declare readonly hasBackdropTarget: boolean
  declare readonly hasDrawerTarget: boolean

  connect() {
    // Listen for drawer trigger changes
    const drawerCheckbox = document.querySelector('input[type="checkbox"]#drawer')
    if (drawerCheckbox) {
      drawerCheckbox.addEventListener('change', () => {
        const isOpen = (drawerCheckbox as HTMLInputElement).checked
        this.setOpen(isOpen)
      })
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close()
      }
    })
  }

  open() {
    if (this.hasBackdropTarget && this.hasDrawerTarget) {
      this.backdropTarget.classList.remove('hidden')
      this.drawertarget.classList.add('translate-y-0')
      this.drawertarget.classList.remove('translate-y-full')
      document.body.style.overflow = 'hidden'
    }
  }

  close() {
    if (this.hasBackdropTarget && this.hasDrawerTarget) {
      this.backdropTarget.classList.add('hidden')
      this.drawertarget.classList.remove('translate-y-0')
      this.drawertarget.classList.add('translate-y-full')
      document.body.style.overflow = 'auto'

      // Update the checkbox if it exists
      const drawerCheckbox = document.querySelector('input[type="checkbox"]#drawer') as HTMLInputElement
      if (drawerCheckbox) {
        drawerCheckbox.checked = false
      }
    }
  }

  setOpen(open: boolean) {
    if (open) {
      this.open()
    } else {
      this.close()
    }
  }
}
