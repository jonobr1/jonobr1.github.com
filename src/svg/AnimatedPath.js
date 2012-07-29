define([
  'RAF',
  'physics/Physics',
  'physics/Vector',
  'underscore'
], function(raf, physics, Vector) {

  var AnimatedPath = function(elem, mass) {

    var _this = this;

    // keep a pointer to the original position
    this.__coords = [];
    this.__isCurve = true;

    this.domElement = elem;
    this.commands = [];
    this.particles = [];
    this.mass = _.isNumber(mass) ? mass : 0.2;
    this.origin = new Vector();
    this.ParticleSystem = physics;

    var d = elem.getAttribute('d');
    var p = elem.getAttribute('points');

    var rect = this.domElement.getBoundingClientRect();
    this.origin.x = rect.width / 2;
    this.origin.y = rect.height / 2;

    if (d) {
      initializePath.call(this, d);
    } else if (p) {
      initializePolyline.call(this, p);
    }

    this.origin.x += this.__coords[0][0] / 2;
    this.origin.y += this.__coords[0][1] / 2;

    // Add them to physics

    // TODO: Don't forget about elem.getScreenCTM(), elem.getPointAtLength(1.0);
    //       Figure out a way to settle the particles so we don't have to raf all the time.

    _.each(this.__coords, function(coord) {

      var particles = [];
      for (var i = 0, l = coord.length; i < l; i+=2) {

        var x = coord[i];
        var y = coord[i + 1];

        var a = physics.makeParticle(this.mass, x, y);
        var b = physics.makeParticle(this.mass, x, y);

        b.makeFixed();
        particles.push(a);
        var s = physics.makeSpring(a, b, 0.2, 0.0625, 0);

      }

      this.particles.push(particles);

    }, this);

    physics.animations.push(this);

  };

  _.extend(AnimatedPath.prototype, {

    /**
     * Updates the d attribute of an SVG.
     */
    update: function() {

      if (this.__isCurve) {
        var d = construct_d(this.commands, this.particles);
        this.domElement.setAttribute('d', d);
      } else {
        var p = construct_p(this.particles);
        this.domElement.setAttribute('points', p);
      }

    }

  });

  function initializePolyline(p) {

    this.__isCurve = false;

    var coords = [];
    _.each(p.split(/[\,(\s\r\n)*]/), function(point) {

      if (point) {

        var point = parseFloat(point);
        coords.push(point);

        if (coords.length > 1) {
          this.__coords.push(coords.slice(0));
          coords.length = 0;
        }

      }

    }, this);

  }

  function initializePath(d) {

    var x = 0, y = 0;

    _.each(d.match(/[mMzZLlHhVvCcSs][0-9\.\-\,]*/g), function(cmd) {

      var type = cmd[0];
      var command = _.compact(cmd.substring(1).replace(/\-/g, ',-').split(/\,/g));
      var length = command.length;
      var coord = _.map(command, function(s, i) {

        var v = parseFloat(s);

        // Place in absolute space

        if (/[mzlhvcs]/.test(type)) {
          if (isEven(i)) {
            v += x;
          } else {
            v += y;
          }
        }

        // Pass the positions along

        if (i === length - 2) {
          x = v;
        } else if (i === length - 1) {
          y = v;
        }

        return v;

      });

      this.commands.push(type.toUpperCase());
      this.__coords.push(_.map(coord, function(c) { return c; }));

    }, this);

  }

  function construct_p(particles) {

    var p_string = '';
    _.each(particles, function(p) {

      var point = p[0];

      var v1 = point.position.x;
      var v2 = point.position.y;

      p_string += v1 + ', ' + v2 + ' ';

    });

    return p_string;

  }

  function construct_d(commands, particles) {

    var d_string = '';
    _.each(commands, function(c, i) {

      d_string += c;
      var points = particles[i];

      _.each(points, function(point, i) {

        var v1 = point.position.x;
        var v2 = point.position.y;

        if (v1 < 0 || i === 0) {
          d_string += v1;
        } else {
          d_string += ',' + v1;
        }

        if (v2 < 0) {
          d_string += v2;
        } else {
          d_string += ',' + v2;
        }

      });

    });

    return d_string;
  }

  function isEven(v) {
    return (v % 2) === 0;
  }

  return AnimatedPath;

});
