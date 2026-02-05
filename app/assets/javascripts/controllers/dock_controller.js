import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets = ["nav", "navItems", "toggleIcon"];
    static values = { collapsed: { type: Boolean, default: false } };

    connect() {
        this.loadState();
        this.updateUI();
    }

    toggle() {
        this.collapsedValue = !this.collapsedValue;
        this.saveState();
        this.updateUI();
    }

    loadState() {
        const saved = localStorage.getItem("dock-collapsed");
        if (saved !== null) {
            this.collapsedValue = saved === "true";
        }
    }

    saveState() {
        localStorage.setItem("dock-collapsed", this.collapsedValue);
    }

    updateUI() {
        // Only apply collapsed state on desktop (md breakpoint = 768px)
        const isDesktop = window.matchMedia("(min-width: 768px)").matches;

        if (this.collapsedValue && isDesktop) {
            this.collapse();
        } else {
            this.expand();
        }
    }

    collapse() {
        if (this.hasNavTarget) {
            this.navTarget.classList.remove("md:bottom-4");
        }
        if (this.hasNavItemsTarget) {
            this.navItemsTarget.classList.add("hidden");
        }
        if (this.hasToggleIconTarget) {
            this.toggleIconTarget.classList.add("rotate-180");
        }
    }

    expand() {
        if (this.hasNavTarget) {
            this.navTarget.classList.add("md:bottom-4");
        }
        if (this.hasNavItemsTarget) {
            this.navItemsTarget.classList.remove("hidden");
        }
        if (this.hasToggleIconTarget) {
            this.toggleIconTarget.classList.remove("rotate-180");
        }
    }
}
