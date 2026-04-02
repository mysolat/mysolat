import React, { useState } from 'react'
import { Modal, ModalBackdrop, ModalPopup } from '@base-ui-components/react'

interface TetapanDrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

/**
 * Tetapan (Settings) Drawer Component
 * 
 * A bottom drawer using Base UI Modal component
 * Slides up from the bottom on mobile, modal on desktop
 * 
 * @see https://base-ui.com/react/components/modal/
 */
export function TetapanDrawer({ isOpen, onClose, children }: TetapanDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(isOpen)

  const handleOpenChange = (open: boolean) => {
    setInternalOpen(open)
    if (!open) {
      onClose()
    }
  }

  return (
    <Modal open={internalOpen} onOpenChange={handleOpenChange}>
      {/* Backdrop */}
      <ModalBackdrop
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={() => handleOpenChange(false)}
      />

      {/* Bottom Drawer / Modal */}
      <ModalPopup
        className={`
          fixed z-50
          md:inset-4 md:m-auto md:w-80 md:rounded-3xl
          bottom-0 left-0 right-0 md:top-auto
          flex flex-col
          rounded-t-3xl md:rounded-3xl
          bg-white/20 backdrop-blur-md
          border border-white/30
          shadow-2xl
          overflow-hidden
          max-h-[90vh] md:max-h-[85vh]
        `}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-white/20 safe-top">
          {/* Mobile drag handle */}
          <div className="flex md:hidden justify-center pt-3 pb-1">
            <div className="w-10 h-1.5 rounded-full bg-base-content/30" />
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <svg
                className="w-8 h-8 text-primary fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
              >
                <path d="M400 0C405 0 409.8 2.371 412.8 6.4C447.5 52.7 490.9 81.34 546.3 117.9C551.5 121.4 556.9 124.9 562.3 128.5C591.3 147.7 608 180.2 608 214.6C608 243.1 596.7 269 578.2 288H221.8C203.3 269 192 243.1 192 214.6C192 180.2 208.7 147.7 237.7 128.5C243.1 124.9 248.5 121.4 253.7 117.9C309.1 81.34 352.5 52.7 387.2 6.4C390.2 2.371 394.1 0 400 0V0zM288 440C288 426.7 277.3 416 264 416C250.7 416 240 426.7 240 440V512H192C174.3 512 160 497.7 160 480V352C160 334.3 174.3 320 192 320H608C625.7 320 640 334.3 640 352V480C640 497.7 625.7 512 608 512H560V440C560 426.7 549.3 416 536 416C522.7 416 512 426.7 512 440V512H448V453.1C448 434.1 439.6 416.1 424.1 404.8L400 384L375 404.8C360.4 416.1 352 434.1 352 453.1V512H288V440zM70.4 5.2C76.09 .9334 83.91 .9334 89.6 5.2L105.6 17.2C139.8 42.88 160 83.19 160 126V128H0V126C0 83.19 20.15 42.88 54.4 17.2L70.4 5.2zM0 160H160V296.6C140.9 307.6 128 328.3 128 352V480C128 489.6 130.1 498.6 133.8 506.8C127.3 510.1 119.9 512 112 512H48C21.49 512 0 490.5 0 464V160z" />
              </svg>
              <h1 className="text-xl font-bold">Tetapan</h1>
            </div>

            {/* Close button (visible on desktop) */}
            <button
              onClick={() => handleOpenChange(false)}
              className="hidden md:flex btn btn-ghost btn-circle btn-sm hover:bg-white/20"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {children}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/20 text-center safe-bottom">
          <p className="text-xs text-base-content/50">
            &copy; {new Date().getFullYear()} Solat.my
          </p>
        </div>
      </ModalPopup>
    </Modal>
  )
}

export default TetapanDrawer
