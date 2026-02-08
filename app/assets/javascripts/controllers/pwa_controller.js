import { Controller } from "@hotwired/stimulus";
import "@khmyznikov/pwa-install";

export default class extends Controller {
    connect() {
        this.pwaInstall = document.querySelector("pwa-install");

        if (!this.pwaInstall) {
            this.pwaInstall = document.createElement("pwa-install");
            this.pwaInstall.setAttribute("manifest-url", "/manifest.json");
            document.body.appendChild(this.pwaInstall);
        }
    }

    install() {
        if (this.pwaInstall) {
            this.pwaInstall.showDialog();
        }
    }
}
