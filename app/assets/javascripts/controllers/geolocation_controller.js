import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['link']

  connect () {
    this.getPosition()
    this.watchPosition()
  }

  getPosition () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.setCurrentPosition.bind(this),
        this.positionError.bind(this),
        this.positionOption()
      )
    } else {
      console.log('Geolocation is not supported in this browser.')
    }
  }

  positionOption () {
    return {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  }

  setCurrentPosition (position) {
    const crd = position.coords
    console.log('Your current position is:')
    console.log(`Latitude : ${crd.latitude}`)
    console.log(`Longitude: ${crd.longitude}`)
    console.log(`More or less ${crd.accuracy} meters.`)
  }

  positionError (error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.error('User denied the request for Geolocation.')
        break

      case error.POSITION_UNAVAILABLE:
        console.error('Location information is unavailable.')
        break

      case error.TIMEOUT:
        console.error('The request to get user location timed out.')
        break

      case error.UNKNOWN_ERROR:
        console.error('An unknown error occurred.')
        break
    }
  }

  watchPosition () {
    if (!this.geoWatch) {
      if (
        'geolocation' in navigator &&
        'watchPosition' in navigator.geolocation
      ) {
        this.geoWatch = navigator.geolocation.watchPosition(
          this.setCurrentPosition.bind(this),
          this.positionError.bind(this),
          this.positionOption()
        )
      }
    }
  }

  stopWatchPosition () {
    navigator.geolocation.clearWatch(this.geoWatch)
    this.geoWatch = undefined
  }
}
