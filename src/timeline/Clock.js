define([
  'svg/utils',
  'common',
  'dateFormat'
], function(svg, _, dateFormat) {

  var DAY = 86400,
    TWO_PI = Math.PI * 2.0;

  var delimeter = '&middot;';
  var timeouts = [];
  var colors = {
    day: {
      r: 252,
      g: 192,
      b: 151
    },
    night: {
      r: 201,
      g: 192,
      b: 255
    }
  };

  var Clock = function(width, height) {

    var _this = this;

    this.width = (width || 20);
    this.height = (height || 20);

    var dimensions = {
      width: this.width + 1,
      height: this.height + 1
    };

    this.domElement = document.createElement('div');
    this.container = svg.createElement('svg');
    this.circle = svg.createElement('circle');
    this.label = $('<p class="day" />');//.html('9&middot;2&middot;2012');

    this.container.appendChild(this.circle);
    this.domElement.appendChild(this.container);
    this.domElement.appendChild(this.label[0]);

    this.__fadeLabelOut = _.debounce(function() {
      _this.label.fadeOut();
    }, 2500);

    svg
      .addClass(this.domElement, 'clock')
      .setAttributes(this.container, dimensions)
      .setAttributes(this.circle, {
        fill: '#fff',
        cx: dimensions.width / 2,
        cy: dimensions.height / 2,
        r: this.width / 2
      });

  };

  _.extend(Clock.prototype, {

    changeDate: function(date) {

      var text = dateFormat(date, 'mm/dd/yy').replace(/\//g, '&middot;');
      var label = this.label.html(text);

    },

    getCurrentTime: function() {

      return this.time - (this.offset || 0);

    },

    setInitialTime: function(t) {

      this.time = t;
      this.day = 0;
      this.updateDisplay();

      return this;

    },

    setTimeByPosition: function(ypos) {

      // We know that ypos is in seconds.

      this.offset = ypos;
      this.updateDisplay();

      return this;

    },

    updateDisplay: function() {

      if (_.isUndefined(this.time)) {
        return this;
      }

      var time = this.getCurrentTime();
      var date = new Date(time * 1000);

      svg.setAttributes(this.circle, {
        fill: getColorFromTime(time)
      });

      var currentDay = date.toDateString();

      if (currentDay !== this.day) {
        this.day = currentDay;
        this.changeDate(date);
      }

      var label = this.label;
      if (label.css('display') == 'none') {
        label.stop().fadeIn(150);
      }

      this.__fadeLabelOut();

      return this;

    }

  });

  function getColorFromTime(t) {

    var normal = Math.sin((t / DAY) * TWO_PI);
    var c = lerpColors(normal);

    return 'rgb(' + c.r +',' + c.g +',' + c.b +')';

  }

  function lerpColors(t) {
    return {
      r: Math.floor(lerp(colors.day.r, colors.night.r, t)),
      g: Math.floor(lerp(colors.day.g, colors.night.g, t)),
      b: Math.floor(lerp(colors.day.b, colors.night.b, t))
    };
  }

  function lerp(a, b, t) {
    return (b - a) * t + a
  }

  return Clock;

});
