import { Controller } from "@hotwired/stimulus";
import { post } from "@rails/request.js";

export default class extends Controller {
    static classes = ["enabled"];
    static targets = ["toggle", "label"];
    static values = { subscriptionsUrl: String };

    async connect() {
        if (!this.#allowed) return;

        switch (Notification.permission) {
            case "default":
                this.toggleTarget.checked = false;
                break;
            case "granted":
                const registration = await this.#getServiceWorkerRegistration();
                const subscription =
                    await registration?.pushManager?.getSubscription();

                if (registration && subscription) {
                    this.toggleTarget.checked = true;
                    this.element.classList.add(this.enabledClass);
                } else {
                    this.toggleTarget.checked = false;
                }
                break;
            case "denied":
                this.toggleTarget.checked = false;
                this.toggleTarget.disabled = true;
                this.labelTarget.textContent = "Notifikasi Disekat";
                break;
        }
    }

    async toggleSubscription() {
        if (this.toggleTarget.checked) {
            await this.#attemptSubscribe();
        } else {
            await this.#unsubscribe();
        }
    }

    async #attemptSubscribe() {
        if (!this.#allowed) return;

        const registration =
            (await this.#getServiceWorkerRegistration()) ||
            (await this.#registerServiceWorker());

        switch (Notification.permission) {
            case "denied":
                this.toggleTarget.checked = false;
                this.toggleTarget.disabled = true;
                this.labelTarget.textContent = "Notifikasi Disekat";
                break;
            case "granted":
                this.#subscribe(registration);
                break;
            case "default":
                this.#requestPermissionAndSubscribe(registration);
                break;
        }
    }

    async sendTest() {
        const response = await fetch("/push/test", {
            method: "POST",
            headers: {
                "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content,
            },
        });
        const data = await response.json();
        if (response.ok) {
            console.info(`[Notification] Test sent to ${data.count} subscription(s) for zone ${data.zone}`);
        } else {
            console.warn("[Notification] Test failed:", data.error);
        }
    }

    async #unsubscribe() {
        const registration = await this.#getServiceWorkerRegistration();
        const subscription = await registration?.pushManager?.getSubscription();

        if (subscription) {
            await subscription.unsubscribe();
        }

        this.toggleTarget.checked = false;
        this.element.classList.remove(this.enabledClass);
    }

    get #allowed() {
        return navigator.serviceWorker && window.Notification;
    }

    async #getServiceWorkerRegistration() {
        return navigator.serviceWorker.getRegistration("/service-worker.js", {
            scope: "/",
        });
    }

    async #registerServiceWorker() {
        await navigator.serviceWorker.register("/service-worker.js", {
            scope: "/",
        });
        return navigator.serviceWorker.ready;
    }

    async #subscribe(registration) {
        try {
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.#vapidPublicKey,
            });
            await this.#syncPushSubscription(subscription);
        } catch (error) {
            console.error("[Notification]", "Push subscription failed:", error);
            this.toggleTarget.checked = false;
        }
    }

    async #syncPushSubscription(subscription) {
        const response = await post(this.subscriptionsUrlValue, {
            body: this.#extractJsonPayloadAsString(subscription),
        });
        if (response.ok) {
            this.toggleTarget.checked = true;
            this.element.classList.add(this.enabledClass);
        } else {
            subscription.unsubscribe();
            this.toggleTarget.checked = false;
        }
    }

    async #requestPermissionAndSubscribe(registration) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            this.#subscribe(registration);
        } else {
            this.toggleTarget.checked = false;
            if (permission === "denied") {
                this.toggleTarget.disabled = true;
                this.labelTarget.textContent = "Notifikasi Disekat";
            }
        }
    }

    get #vapidPublicKey() {
        const encodedVapidPublicKey = document.querySelector(
            'meta[name="vapid-public-key"]',
        ).content;
        return this.#urlBase64ToUint8Array(encodedVapidPublicKey);
    }

    #extractJsonPayloadAsString(subscription) {
        const {
            endpoint,
            keys: { p256dh, auth },
        } = subscription.toJSON();
        return JSON.stringify({
            push_subscription: { endpoint, p256dh_key: p256dh, auth_key: auth },
        });
    }

    #urlBase64ToUint8Array(base64String) {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    }
}
