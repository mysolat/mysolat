import { Controller } from "@hotwired/stimulus";
export default class extends Controller {
  static targets = ["navbar"];

  initialize() {
    this.apply();
  }

  connect() {
    // this.toggleNavbar(); // Ensure the correct class is set on page load
    // window.addEventListener("scroll", this.toggleNavbar.bind(this));
  }

  apply() {
    document.documentElement.setAttribute("data-theme", this.theme);
  }

  disconnect() {
    window.removeEventListener("scroll", this.toggleNavbar.bind(this));
  }

  switch(event) {
    // Use currentTarget to get the button element, not the clicked child element
    this.theme = event.currentTarget.dataset.themeValue;
    this.apply();
  }

  toggleNavbar() {
    if (window.scrollY > 50) {
      this.navbarTarget.classList.add("navbar-scrolled");
    } else {
      this.navbarTarget.classList.remove("navbar-scrolled");
    }
  }

  get systemDefault() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "emerald";
  }

  get theme() {
    return (
      window.localStorage.getItem("theme") || (this.theme = this.systemDefault)
    );
  }

  set theme(value) {
    window.localStorage.setItem("theme", value);
    document.cookie = `theme=${value};path=/;max-age=31536000;SameSite=Lax`;
  }
}
