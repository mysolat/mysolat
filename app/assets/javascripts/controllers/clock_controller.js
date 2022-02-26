
import Snap from 'snapsvg';
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  //static targets = ['easing']
  initialize() {
    var s = Snap(document.getElementById("clock"));

    this.seconds = s.select("#seconds")
    this.minutes = s.select("#minutes")
    this.hours = s.select("#hours")
    this.rim = s.select("#rim")
    this.face = {
      elem: s.select("#face"),
      cx: s.select("#face").getBBox().cx,
      cy: s.select("#face").getBBox().cy,
    },
      this.angle = 0
  }

  connect() {
    var s = Snap(document.getElementById("clock"));
    var sshadow = this.seconds.clone(),
      mshadow = this.minutes.clone(),
      hshadow = this.hours.clone(),
      rshadow = this.rim.clone(),
      shadows = [sshadow, mshadow, hshadow];

    //Insert shadows before their respective opaque pals
    this.seconds.before(sshadow);
    this.minutes.before(mshadow);
    this.hours.before(hshadow);
    this.rim.before(rshadow);

    //Create a filter to make a blurry black version of a thing
    var filter = Snap.filter.blur(0.1) + Snap.filter.brightness(0);

    //Add the filter, shift and opacity to each of the shadows
    shadows.forEach(function (el) {
      el.attr({
        transform: "translate(0, 2)",
        opacity: 0.2,
        filter: s.filter(filter)
      });
    })

    rshadow.attr({
      transform: "translate(0, 8) ",
      opacity: 0.5,
      filter: s.filter(Snap.filter.blur(0, 8) + Snap.filter.brightness(0)),
    })

    setInterval(() => { this.update(hshadow, mshadow, sshadow) }, 1000);
  }

  update(hshadow, mshadow, sshadow) {
    var time = new Date();
    console.log(time)
    this.setHours(time, hshadow);
    this.setMinutes(time, mshadow);
    this.setSeconds(time, sshadow);
  }

  setHours(t, hshadow) {
    var face = this.face
    var hours = this.hours
    var hour = t.getHours();
    hour %= 12;
    hour += Math.floor(t.getMinutes() / 10) / 6;
    var angle = hour * 360 / 12;
    hours.animate(
      { transform: "rotate(" + angle + " 244 251)" },
      100,
      mina.linear,
      () => { this.rotate(angle, face, hours, hshadow) }
    );
    hshadow.animate(
      { transform: "translate(0, 2) rotate(" + angle + " " + face.cx + " " + face.cy + 2 + ")" },
      100,
      mina.linear
    );
  }

  setMinutes(t, mshadow) {
    var face = this.face
    var minutes = this.minutes
    var minute = t.getMinutes();
    minute %= 60;
    minute += Math.floor(t.getSeconds() / 10) / 6;
    var angle = minute * 360 / 60;
    minutes.animate(
      { transform: "rotate(" + angle + " " + face.cx + " " + face.cy + ")" },
      100,
      mina.linear,
      () => { this.rotate(angle, face, minutes, mshadow) }
    );
    mshadow.animate(
      { transform: "translate(0, 2) rotate(" + angle + " " + face.cx + " " + face.cy + 2 + ")" },
      100,
      mina.linear
    );
  }

  setSeconds(t, sshadow) {
    var face = this.face
    var seconds = this.seconds
    t = t.getSeconds();
    t %= 60;
    var angle = t * 360 / 60;
    //if ticking over to 0 seconds, animate angle to 360 and then switch angle to 0
    if (angle === 0) angle = 360;
    seconds.animate(
      { transform: "rotate(" + angle + " " + face.cx + " " + face.cy + ")" },
      600,
      this.easing,
      () => { this.rotate(angle, face, seconds, sshadow) }
    );
    sshadow.animate(
      { transform: "translate(0, 2) rotate(" + angle + " " + face.cx + " " + face.cy + 2 + ")" },
      600,
      this.easing
    );
  }

  easing = (a) => {
    console.log(a)
    return a == !!a ? a : Math.pow(4, -10 * a) * Math.sin((a - .075) * 2 * Math.PI / .3) + 1;
  }

  rotate(angle, face, unit, shadow) {
    if (angle === 360) {
      unit.attr({ transform: "rotate(" + 0 + " " + face.cx + " " + face.cy + ")" });
      shadow.attr({ transform: "translate(0, 2) rotate(" + 0 + " " + face.cx + " " + face.cy + 2 + ")" });
    }
  }
}
