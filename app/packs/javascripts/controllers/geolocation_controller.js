// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>

import { Controller } from "stimulus"

export default class extends Controller {
  static targets = [ "link" ]

  connect() {
    //this.geolocate()
  }

  geolocate() {
    if (!navigator.geolocation) {
      this.linkTarget.textContent = "Geolocation is not supported in this browser."
    } else {
      navigator.geolocation.getCurrentPosition(this.success.bind(this), this.error.bind(this))

      //let options = {
      //  enableHighAccuracy: false,
      //  timeout: 5000,
      //  maximumAge: 0
      //}
      //navigator.geolocation.watchPosition(this.success.bind(this), this.error.bind(this), options)
    }
  }

  success(position) {
    this.linkTarget.textContent = `Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`
  }

  error() {
    this.linkTarget.textContent = "Unable to get your location."
  }
}
