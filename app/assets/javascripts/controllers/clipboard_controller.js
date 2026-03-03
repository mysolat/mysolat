import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets = ["button"];

    copy(event) {
        const button = event.currentTarget;

        // Collect text from every <code> inside this mockup-code block
        const codeEls = this.element.querySelectorAll("pre code");
        const text = Array.from(codeEls)
            .map((el) => el.textContent.trim())
            .join("\n");

        navigator.clipboard
            .writeText(text)
            .then(() => {
                this.#showFeedback(button);
            })
            .catch(() => {
                // Fallback for older/restricted environments
                const ta = document.createElement("textarea");
                ta.value = text;
                ta.style.cssText = "position:fixed;opacity:0";
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
                this.#showFeedback(button);
            });
    }

    #showFeedback(button) {
        const iconCopy = button.querySelector("[data-clipboard-icon='copy']");
        const iconCheck = button.querySelector("[data-clipboard-icon='check']");
        const tipBefore = button.dataset.tip;

        // Swap icon to checkmark
        iconCopy?.classList.add("hidden");
        iconCheck?.classList.remove("hidden");

        // Swap tooltip text
        button.dataset.tip = "Disalin!";

        clearTimeout(this._resetTimer);
        this._resetTimer = setTimeout(() => {
            iconCopy?.classList.remove("hidden");
            iconCheck?.classList.add("hidden");
            button.dataset.tip = tipBefore;
        }, 2000);
    }
}
