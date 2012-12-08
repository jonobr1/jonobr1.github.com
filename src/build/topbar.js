(function() {

var js = js || {};
var svg = svg || {};
var webfont = webfont || {};
var dom = dom || {};

requestAnimationFrame = (function () {

  /**
   * requirejs version of Paul Irish's RequestAnimationFrame
   * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
   */

  return window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback, element) {

        window.setTimeout(callback, 1000 / 60);

      };
})();


Vector = (function (_) {

  /**
   * A two dimensional vector.
   */
  var Vector = function(x, y) {

    this.x = x || 0;
    this.y = y || 0;

  };

  _.extend(Vector.prototype, {

    set: function(x, y) {
      this.x = x;
      this.y = y;
      return this;
    },

    copy: function(v) {
      this.x = v.x;
      this.y = v.y;
      return this;
    },

    clear: function() {
      this.x = 0;
      this.y = 0;
      return this;
    },

    clone: function() {
      return new Vector(this.x, this.y);
    },

    add: function(v1, v2) {
      this.x = v1.x + v2.x;
      this.y = v1.y + v2.y;
      return this;
    },

    addSelf: function(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    },

    sub: function(v1, v2) {
      this.x = v1.x - v2.x;
      this.y = v1.y - v2.y;
      return this;
    },

    subSelf: function(v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    },

    multiplySelf: function(v) {
      this.x *= v.x;
      this.y *= v.y;
      return this;
    },

    multiplyScalar: function(s) {
      this.x *= s;
      this.y *= s;
      return this;
    },

    divideScalar: function(s) {
      if (s) {
        this.x /= s;
        this.y /= s;
      } else {
        this.set(0, 0);
      }
      return this;
    },

    negate: function() {
      return this.multiplyScalar(-1);
    },

    dot: function(v) {
      return this.x * v.x + this.y * v.y;
    },

    lengthSq: function() {
      return this.x * this.x + this.y * this.y;
    },

    length: function() {
      return Math.sqrt(this.lengthSq());
    },

    normalize: function() {
      return this.divideScalar(this.length());
    },

    distanceTo: function(v) {
      return Math.sqrt(this.distanceToSquared(v));
    },

    distanceToSquared: function(v) {
      var dx = this.x - v.x, dy = this.y - v.y;
      return dx * dx + dy * dy;
    },

    setLength: function(l) {
      return this.normalize().multiplyScalar(l);
    },

    equals: function(v) {
      return this.distanceTo(v) < 0.0001 /* almost same position */;
    },

    lerp: function(v, t) {
      var x = (v.x - this.x) * t + this.x;
      var y = (v.y - this.y) * t + this.y;
      return this.set(x, y);
    },

    isZero: function() {
      return ( this.lengthSq() < 0.0001 /* almost zero */ );
    }

  });

  return Vector;

})(common = (function () {

  /**
   * Pulled only what's needed from:
   * 
   * Underscore.js 1.3.3
   * (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
   * http://documentcloud.github.com/underscore
   */

  var ArrayProto   = Array.prototype,
    hasOwnProperty = Object.prototype.hasOwnProperty,
    slice          = ArrayProto.slice,
    nativeForEach  = ArrayProto.forEach,
    nativeIndexOf  = ArrayProto.indexOf,
    nativeMap      = ArrayProto.map,
    nativeFilter   = ArrayProto.filter,
    nativeIsArray  = Array.isArray,
    nativeSome     = ArrayProto.some,
    nativeBind     = Function.prototype.bind;

  var ctor = function(){};
  var breaker = {};

  var has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  var each = function(obj, iterator, context) {

    if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
          obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
          for (var i = 0, l = obj.length; i < l; i++) {
            if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
          }
        } else {
          for (var key in obj) {
            if (has(obj, key)) {
              if (iterator.call(context, obj[key], key, obj) === breaker) return;
            }
          }
        }

  };

  var identity = function(value) {
    return value;
  };

  var sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  var filter = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  return {

    has: has,

    each: each,

    compact: function(array) {
      return filter(array, function(value) { return !!value; });
    },

    bind: function(func, context) {
      var bound, args;
      if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
      if (!this.isFunction(func)) throw new TypeError;
      args = slice.call(arguments, 2);
      return bound = function() {
        if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
        ctor.prototype = func.prototype;
        var self = new ctor;
        var result = func.apply(self, args.concat(slice.call(arguments)));
        if (Object(result) === result) return result;
        return self;
      };
    },

    bindAll: function(obj) {
      var funcs = slice.call(arguments, 1);
      if (funcs.length == 0) funcs = this.functions(obj);
      this.each(funcs, function(f) { obj[f] = this.bind(obj[f], obj); }, this);
      return obj;
    },

    functions: function(obj) {
      var names = [];
      for (var key in obj) {
        if (this.isFunction(obj[key])) names.push(key);
      }
      return names.sort();
    },

    extend: function(obj) {
      each(slice.call(arguments, 1), function(source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      });
      return obj;
    },

    map: function(obj, iterator, context) {
      var results = [];
      if (obj == null) return results;
      if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
      each(obj, function(value, index, list) {
        results[results.length] = iterator.call(context, value, index, list);
      });
      if (obj.length === +obj.length) results.length = obj.length;
      return results;
    },

    any: function(obj, iterator, context) {
      iterator || (iterator = this.identity);
      var result = false;
      if (obj == null) return result;
      if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
      each(obj, function(value, index, list) {
        if (result || (result = iterator.call(context, value, index, list))) return breaker;
      });
      return !!result;
    },

    indexOf: function(array, item, isSorted) {
      if (array == null) return -1;
      var i, l;
      if (isSorted) {
        i = sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
      if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
      for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
      return -1;
    },

    sortedIndex: sortedIndex,

    identity: identity,

    after: function(times, func) {
      if (times <= 0) return func();
      return function() {
        if (--times < 1) { return func.apply(this, arguments); }
      };
    },

    debounce: function(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        if (immediate && !timeout) func.apply(context, args);
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    clone: function(obj) {
      if (!this.isObject(obj)) return obj;
      return this.isArray(obj) ? obj.slice() : this.extend({}, obj);
    },

    isElement: function(obj) {
      return !!(obj && obj.nodeType == 1);
    },

    isArray: nativeIsArray || function(obj) {
      return toString.call(obj) == '[object Array]';
    },

    toArray: function(obj) {
      if (!obj)                                        return [];
      if (this.isArray(obj))                           return slice.call(obj);
      if (this.isArguments(obj))                       return slice.call(obj);
      if (obj.toArray && this.isFunction(obj.toArray)) return obj.toArray();
      return this.values(obj);
    },

    values: function(obj) {
      return this.map(obj, this.identity);
    },

    once: function(func) {
      var ran = false, memo;
      return function() {
        if (ran) return memo;
        ran = true;
        return memo = func.apply(this, arguments);
      };
    },

    isObject: function(obj) {
      return obj === Object(obj);
    },

    isNumber: function(obj) {
      return toString.call(obj) == '[object Number]';
    },

    isFunction: function(obj) {
      return toString.call(obj) == '[object Function]' || typeof obj == 'function';
    },

    isUndefined: function(obj) {
      return obj === void 0;
    },

    isNull: function(obj) {
      return obj === null;
    },

    isRegExp: function(obj) {
      return toString.call(obj) == '[object RegExp]';
    }

  };

})());


(function (AnimatedPath, Physics, Vector, webfont, label, _) {

  var physics = new Physics();
  var container;

  webfont.start();

  // Globals
  var valid_email = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  var logo, $logo, elements, shake = false, shakeTimeout;

  $(setup);

  function setup() {

    container = $('#container')

    if (container.length < 1) {
      container = document.body;
    }

    handleImages();
    syntaxHighlight();

    // SVG container
    $logo = $('#logo');
    logo = $logo[0];

    // Actual SVG objects
    elements = _.map($logo.find('path, polyline'), function(elem) {
      return new AnimatedPath(elem).setParticleSystem(physics);
    });

    $(window)
      .bind('mousedown', function(e) {

        if (isVisible()) {
          logoReact(e.clientX, e.clientY);
        }

      })
      .bind('touchend', function(e) {

        var touch = e.originalEvent.changedTouches[0];

        if (isVisible()) {
          logoReact(touch.pageX, touch.pageY);
        }

      });

    /**
     * Email nudging
     */
    var email = $('#xdhdhj-xdhdhj')[0];
    var submit = $('#subscribe')
      .keyup(function(e) {
        if (valid_email.test(email.value)) {
          submit.addClass('eligible');
        } else if (submit.hasClass('eligible')) {
          submit.removeClass('eligible');
        }
      })
      .find('input[type="submit"]');

    /**
     * Image `alt` labeling
     */

    _.each($('img'), function(img) {
      label.add($(img), container);
    });

    /**
     * Fire a custom event for Cargo ajax loading Project content
     * on slideshows.
     */

     $(document).bind('update-slideshow', handleImages);

  }

  function isVisible() {
    var offset = $logo.offset();
    var top = $(document).scrollTop();
    return top < offset.top + $logo.outerHeight();
  }

  function clamp(v, min, max) {
    return Math.max(Math.min(v, max), min);
  }

  function map(v, i1, i2, o1, o2) {
    return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
  }

  function logoReact(x, y) {

    var window_width = $(window).width();
    var window_height = $(window).height();
    var window_size = window_width > window_height ? window_width : window_height;

    var mouse = new Vector(x, y);
    var desired_distance = 25;
    var o = $logo.offset();
    var offset = new Vector(o.left, o.top);

    _.each(elements, function(svg) {

      var d_origin = mouse.distanceTo(svg.origin);
      var m_world = mouse.clone().subSelf(offset).subSelf(svg.origin);

      _.each(svg.particles, function(points) {
        _.each(points, function(p) {

          var d = window_size - p.position.clone().multiplyScalar(4).distanceTo(m_world);
          var t = map(d, 0, window_size, 0, 1);

          t /= 16;

          p.position.lerp(m_world, clamp(t, 0, 1));
          p.velocity.set(0, 0);
          p.force.set(0, 0);

        }, this);
      }, svg);
    });

    physics.update();

  }

  function handleImages() {

    _.each($('.slideshow').not('.touched'), function(elem) {

      var width = 0;
      var times = elem.children.length;
      var $elem = $(elem).addClass('touched');
      var elemWidth = $elem.width();

      // Click through the slideshow

      $elem
        .css({
          display: 'none' // Prep
        })
        .bind('click', function(e) {

          e.preventDefault();

          var active = $elem.find('.selected').removeClass('selected');
          var index = (_.indexOf(elem.children, active[0]) + 1) % times;
          var offset = parseInt($elem.css('marginLeft').replace('px', ''));
          var next = $(elem.children[index]).addClass('selected');

          if (index > 0) {
            offset -= (next.outerWidth(true) + active.outerWidth(true)) / 2;
          } else {
            offset = (elemWidth - next.outerWidth(true)) / 2;
          }

          $elem.css({
            marginLeft: offset + 'px'
          });

          $('.label').each(function() {
            $(this).fadeOut(150);
          });

        });

      var callback = _.after(times, function() {
        console.log('fading in slideshow', elem, width, times);
        $elem
          .width(width + width / times)
          .fadeIn(function() {
            $elem.css({
              marginLeft: (elemWidth - $(elem.children[0]).outerWidth(true)) / 2
            });
          })
          .addClass('animated');
      });

      $elem.find(':first-child').addClass('selected');

      _.each(elem.children, function(child) {

        var $child = $(child).addClass('animated');
        var w = $child.outerWidth(true);

        console.log('surmising image', w, child);

        if (w <= 0) {
          $child.load(function() {
            width += $child.outerWidth(true) || parseFloat($child.css('width'));
            console.log('loaded image');
            callback();
          });
          return;
        }

        console.log('loaded image');
        width += w;
        callback();

      });

    });

  }

  function syntaxHighlight() {

    _.each($('pre'), function(pre) {
      pre.className += ' prettyprint linenums';

      var str = pre.innerHTML;
      var pattern = new RegExp('^' + str.match(/^\s*/)[0], 'gim');
      pre.innerHTML = str.replace(pattern, '').replace();
      // TODO: Remove the final spacing...

    });

    prettyPrint();
  }

})(svg.AnimatedPath = (function (raf, Vector, _) {

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

  };

  _.extend(AnimatedPath.prototype, {

    setParticleSystem: function(physics) {

      this.ParticleSystem = physics;

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

      physics.animations.push(_.bind(this.update, this));

      return this;

    },

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

})(requestAnimationFrame,
Vector,
common),
Physics = (function (ParticleSystem, raf, _) {

  var updates = [];

  /**
   * Extended singleton instance of ParticleSystem with convenience methods for
   * Request Animation Frame.
   * @class
   */
  var Physics = function() {

    var _this = this;

    ParticleSystem.apply(this, arguments);

    this.animations = [];

    update.call(this);

  };

  _.extend(Physics, ParticleSystem, {

    superclass: ParticleSystem

  });

  _.extend(Physics.prototype, ParticleSystem.prototype, {

    onUpdate: function(func) {

      if (_.indexOf(this.animations, func) >= 0 || !_.isFunction(func)) {
        return this;
      }

      this.animations.push(func);

      return this;

    },

    /**
     * Call update after values in the system have changed and this will fire
     * it's own Request Animation Frame to update until things have settled
     * to equilibrium — at which point the system will stop updating.
     */
    update: function() {

      if (this.__equilibrium) {
        this.__equilibrium = false;
        update.call(this);
      }

      return this;

    }

  });

  function update() {

    var _this = this;

    this.tick();

    _.each(this.animations, function(a) {
      a();
    });

    if (!this.__equilibrium) {

      raf(function() {
        update.call(_this);
      });

    }

  }

  return Physics;

})(ParticleSystem = (function (Vector, Particle, Spring, Attraction, Integrator, _) {

  /**
   * traer.js
   * A particle-based physics engine ported from Jeff Traer's Processing
   * library to JavaScript. This version is intended for use with the
   * HTML5 canvas element. It is dependent on Three.js' Vector2 class,
   * but can be overridden with any Vector2 class with the methods included.
   *
   * @author Jeffrey Traer Bernstein <jeff TA traer TOD cc> (original Java library)
   * @author Adam Saponara <saponara TA gmail TOD com> (JavaScript port)
   * @author Jono Brandel <http://jonobr1.com/> (requirified/optimization port)
   * 
   * @version 0.3
   * @date March 25, 2012
   *
   * @class
   */

  /**
   * The who kit and kaboodle.
   *
   * @class
   */
  var ParticleSystem = function() {

    this.__equilibrium = false; // are we at equilibrium?

    this.particles = [];
    this.springs = [];
    this.attractions = [];
    this.forces = [];
    this.integrator = new Integrator(this);
    this.hasDeadParticles = false;

    var args = arguments.length;

    if (args === 2) {
      this.gravity = new Vector(0, arguments[0]);
      this.drag = arguments[1];
    } else if (args === 3) {
      this.gravity = new Vector(arguments[0], arguments[1]);
      this.drag = arguments[3];
    } else {
      this.gravity = new Vector(0, ParticleSystem.DEFAULT_GRAVITY);
      this.drag = ParticleSystem.DEFAULT_DRAG;
    }

  };

  _.extend(ParticleSystem, {

    DEFAULT_GRAVITY: 0,

    DEFAULT_DRAG: 0.001,

    Attraction: Attraction,

    Integrator: Integrator,

    Particle: Particle,

    Spring: Spring,

    Vector: Vector

  });

  _.extend(ParticleSystem.prototype, {

    /**
     * Set the gravity of the ParticleSystem.
     */
    setGravity: function(x, y) {
      this.gravity.set(x, y);
      return this;
    },

    /**
     * Update the integrator
     */
    tick: function() {
      this.integrator.step(arguments.length === 0 ? 1 : arguments[0]);
      this.__equilibrium = !this.needsUpdate();
      return this;
    },

    /**
     * Checks all springs and attractions to see if the contained particles are
     * inert / resting and returns a boolean.
     */
    needsUpdate: function() {

      needsUpdate = false;

      for (var i = 0, l = this.springs.length; i < l; i++) {
        if (!this.springs[i].resting()) {
          needsUpdate = true;
          break;
        }
      }

      if (!needsUpdate) {
        for (var i = 0, l = this.attractions.length; i < l; i++) {
          if (!this.attractions[i].resting()) {
            needsUpdate = true;
            break;
          }
        }
      }

      return needsUpdate;

    },

    /**
     * Add a particle to the ParticleSystem.
     */
    addParticle: function(p) {

      this.particles.push(p);
      return this;

    },

    /**
     * Add a spring to the ParticleSystem.
     */
    addSpring: function(s) {

      this.springs.push(s);
      return this;

    },

    /**
     * Add an attraction to the ParticleSystem.
     */
    addAttraction: function(a) {

      this.attractions.push(a);
      return this;

    },

    /**
     * Makes and then adds Particle to ParticleSystem.
     */
    makeParticle: function(m, x, y) {

      var mass = _.isNumber(m) ? m : 1.0;
      var x = x || 0;
      var y = y || 0;

      var p = new Particle(mass);
      p.position.set(x, y);
      this.addParticle(p);
      return p;

    },

    /**
     * Makes and then adds Spring to ParticleSystem.
     */
    makeSpring: function(a, b, k, d, l) {

      var s = new Spring(a, b, k, d, l);
      this.addSpring(s);
      return s;

    },

    /**
     * Makes and then adds Attraction to ParticleSystem.
     */
    makeAttraction: function(a, b, k, d) {

      var a = new Attraction(a, b, k, d);
      this.addAttraction(a);
      return a;

    },

    /**
     * Wipe the ParticleSystem clean.
     */
    clear: function() {

      this.particles.length = 0;
      this.springs.length = 0;
      this.attractions.length = 0;

    },

    /**
     * Calculate and apply forces.
     */
    applyForces: function() {

      if (!this.gravity.isZero()) {
        _.each(this.particles, function(p) {
          p.force.addSelf(this.gravity);
        }, this);
      }

      var t = new Vector();

      _.each(this.particles, function(p) {
        t.set(p.velocity.x * -1 * this.drag, p.velocity.y * -1 * this.drag);
        p.force.addSelf(t);
      }, this);

      _.each(this.springs, function(s) {
        s.update();
      });

      _.each(this.attractions, function(a) {
        a.update();
      });

      _.each(this.forces, function(f) {
        f.update();
      });

      return this;

    },

    /**
     * Clear all particles in the system.
     */
    clearForces: function() {
      _.each(this.particles, function(p) {
        p.clear();
      });
      return this;
    }

  });

  return ParticleSystem;

})(Vector,
Particle = (function (Vector, _) {

  var Particle = function(mass) {

    this.position = new Vector();
    this.velocity = new Vector();
    this.force = new Vector();
    this.mass = mass;
    this.fixed = false;
    this.age = 0;
    this.dead = false;

  };

  _.extend(Particle.prototype, {

    /**
     * Get the distance between two particles.
     */
    distanceTo: function(p) {
      return this.position.distanceTo(p.position);
    },

    /**
     * Make the particle fixed in 2D space.
     */
    makeFixed: function() {
      this.fixed = true;
      this.velocity.clear();
      return this;
    },

    /**
     * Reset a particle.
     */
    reset: function() {

      this.age = 0;
      this.dead = false;
      this.position.clear();
      this.velocity.clear();
      this.force.clear();
      this.mass = 1.0;

      return this;
    },

    /**
     * Returns a boolean describing whether the particle is in movement.
     */
    resting: function() {
      return this.fixed || this.velocity.isZero() && this.force.isZero();
    }

  });

  return Particle;

})(Vector,
common),
Spring = (function (Vector, _) {

  var Spring = function(a, b, k, d, l) {

    this.constant = k;
    this.damping = d;
    this.length = l;
    this.a = a;
    this.b = b;
    this.on = true;

  };

  _.extend(Spring.prototype, {

    /**
     * Returns the distance between particle a and particle b
     * in 2D space.
     */
    currentLength: function() {
      return this.a.position.distanceTo(this.b.position);
    },

    /**
     * Update spring logic.
     */
    update: function() {

      var a = this.a;
      var b = this.b;
      if (!(this.on && (!a.fixed || !b.fixed))) return this;

      var a2b = new Vector().sub(a.position, b.position);
      var d = a2b.length();

      if (d === 0) {
        a2b.clear();
      } else {
        a2b.divideScalar(d);  // Essentially normalize
      }

      var fspring = -1 * (d - this.length) * this.constant;

      var va2b = new Vector().sub(a.velocity, b.velocity);

      var fdamping = -1 * this.damping * va2b.dot(a2b);

      var fr = fspring + fdamping;

      a2b.multiplyScalar(fr);

      if (!a.fixed) {
        a.force.addSelf(a2b);
      }
      if (!b.fixed) {
        b.force.subSelf(a2b);
      }

      return this;

    },

    /**
     * Returns a boolean describing whether the spring is resting or not.
     * Convenient for knowing whether or not the spring needs another update
     * tick.
     *
     * TODO: Assumes a length of zero at the moment...
     */
    resting: function() {

      var a = this.a;
      var b = this.b;
      var l = this.length;

      return (a.fixed && b.fixed)
        || (a.fixed && (l === 0 ? b.position.equals(a.position) : b.position.distanceTo(a.position) <= l) && b.resting())
        || (b.fixed && (l === 0 ? a.position.equals(b.position) : a.position.distanceTo(b.position) <= l) && a.resting());

    }

  });

  return Spring;

})(Vector,
common),
Attraction = (function (Vector, _) {

  var Attraction = function(a, b, k, d) {

    this.a = a;
    this.b = b;
    this.constant = k;
    this.on = true;
    this.distanceMin = d;
    this.distanceMinSquared = d * d;

  };

  _.extend(Attraction.prototype, {

    update: function() {

     var a = this.a, b = this.b;
     if (!this.on || (a.fixed && b.fixed)) {
       return;
     }

     var a2bx = a.position.x - b.position.x;
     var a2by = a.position.y - b.position.y;

     var a2b = new Vector().sub(a.position, b.position);

     var a2bdistanceSquared = Math.max(a2b.lengthSq(), this.distanceMinSquared);

     var force = (this.constant * a.mass * b.mass) / a2bdistanceSquared;

     var length = Math.sqrt(a2bdistanceSquared);

     if (force === 0 || length === 0) {
       a2b.clear();
     } else {
       a2b.divideScalar(length).multiplyScalar(force);
     }

     if (!a.fixed) {
       a.force.subSelf(a2b);
     }
     if (!b.fixed) {
       b.force.addSelf(a2b);
     }

     return this;

    },

    /**
     * Returns a boolean describing whether the spring is resting or not.
     * Convenient for knowing whether or not the spring needs another update
     * tick.
     *
     * TODO: Test
     */
    resting: function() {

      var a = this.a;
      var b = this.b;
      var l = this.distanceMin;

      return (a.fixed && b.fixed)
        || (a.fixed && b.position.distanceTo(a.position) <= l && b.resting())
        || (b.fixed && a.position.distanceTo(b.position) <= l && a.resting());

    }

  });

  return Attraction;

})(Vector,
common),
Integrator = (function (Vector, _) {

  /**
   * Runge Kutta Integrator
   * http://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods
   * 
   * @class
   */
  var Integrator = function(s) {
    this.s = s;
    this.originalPositions = [];
    this.originalVelocities = [];
    this.k1Forces = [];
    this.k1Velocities = [];
    this.k2Forces = [];
    this.k2Velocities = [];
    this.k3Forces = [];
    this.k3Velocities = [];
    this.k4Forces = [];
    this.k4Velocities = [];
  };

  _.extend(Integrator.prototype, {

    allocateParticles: function() {

      while (this.s.particles.length > this.originalPositions.length) {
        this.originalPositions.push(new Vector());
        this.originalVelocities.push(new Vector());
        this.k1Forces.push(new Vector());
        this.k1Velocities.push(new Vector());
        this.k2Forces.push(new Vector());
        this.k2Velocities.push(new Vector());
        this.k3Forces.push(new Vector());
        this.k3Velocities.push(new Vector());
        this.k4Forces.push(new Vector());
        this.k4Velocities.push(new Vector());
      }

      return this;

    },

    step: function(dt) {

      var s = this.s;
      var p, x, y;

      this.allocateParticles();

      _.each(s.particles, function(p, i) {
        if (!p.fixed) {
          this.originalPositions[i].copy(p.position);
          this.originalVelocities[i].copy(p.velocity);
        }
        p.force.clear();
      }, this);

      // K1

      s.applyForces();

      _.each(s.particles, function(p, i) {
        if (!p.fixed) {
          this.k1Forces[i].copy(p.force);
          this.k1Velocities[i].copy(p.velocity);
        }
        p.force.clear();
      }, this);

      // K2

      _.each(s.particles, function(p, i) {
        if (!p.fixed) {

          var op = this.originalPositions[i];
          var k1v = this.k1Velocities[i];
          x = op.x + k1v.x * 0.5 * dt;
          y = op.y + k1v.y * 0.5 * dt;
          p.position.set(x, y);

          var ov = this.originalVelocities[i];
          var k1f = this.k1Forces[i];
          x = ov.x + k1f.x * 0.5 * dt / p.mass;
          y = ov.y + k1f.y * 0.5 * dt / p.mass;
          p.velocity.set(x, y);

        }
      }, this);

      s.applyForces();

      _.each(s.particles, function(p, i) {
        if (!p.fixed) {
          this.k2Forces[i].copy(p.force);
          this.k2Velocities[i].copy(p.velocity);
        }
        p.force.clear();
      }, this);

      // K3

      _.each(s.particles, function(p, i) {
        if (!p.fixed) {

          var op = this.originalPositions[i];
          var k2v = this.k2Velocities[i];
          p.position.set(op.x + k2v.x * 0.5 * dt, op.y + k2v.y * 0.5 * dt);

          var ov = this.originalVelocities[i];
          var k2f = this.k2Forces[i];
          p.velocity.set(ov.x + k2f.x * 0.5 * dt / p.mass, ov.y + k2f.y * 0.5 * dt / p.mass);
        }
      }, this);

      s.applyForces();

      _.each(s.particles, function(p, i) {
        if (!p.fixed) {
          this.k3Forces[i].copy(p.force);
          this.k3Velocities[i].copy(p.velocity);
        }
        p.force.clear();
      }, this);

      // K4

      _.each(s.particles, function(p, i) {
        if (!p.fixed) {

          var op = this.originalPositions[i];
          var k3v = this.k3Velocities[i];
          p.position.set(op.x + k3v.x * dt, op.y + k3v.y * dt)

          var ov = this.originalVelocities[i];
          var k3f = this.k3Forces[i];
          p.velocity.set(ov.x + k3f.x * dt / p.mass, ov.y + k3f.y * dt / p.mass);
        }
      }, this);

      s.applyForces();

      _.each(s.particles, function(p, i) {
        if (!p.fixed) {
          this.k4Forces[i].copy(p.force);
          this.k4Velocities[i].copy(p.velocity);
        }
      }, this);

      // TOTAL

      _.each(s.particles, function(p, i) {

        p.age += dt;

        if (!p.fixed) {

          var op = this.originalPositions[i];
          var k1v = this.k1Velocities[i];
          var k2v = this.k2Velocities[i];
          var k3v = this.k3Velocities[i];
          var k4v = this.k4Velocities[i];

          var x = op.x + dt / 6.0 * (k1v.x + 2.0 * k2v.x + 2.0 * k3v.x + k4v.x);
          var y = op.y + dt / 6.0 * (k1v.y + 2.0 * k2v.y + 2.0 * k3v.y + k4v.y);

          p.position.set(x, y);

          var ov = this.originalVelocities[i];
          var k1f = this.k1Forces[i];
          var k2f = this.k2Forces[i];
          var k3f = this.k3Forces[i];
          var k4f = this.k4Forces[i];

          x = ov.x + dt / (6.0 * p.mass) * (k1f.x + 2.0 * k2f.x + 2.0 * k3f.x + k4f.x);
          y = ov.y + dt / (6.0 * p.mass) * (k1f.y + 2.0 * k2f.y + 2.0 * k3f.y + k4f.y);

          p.velocity.set(x, y);

        }

      }, this);

      return this;

    }

  });

  return Integrator;

})(Vector,
common),
common),
requestAnimationFrame,
common),
Vector,
webfont.loader = (function () {

  WebFontConfig = {
    google: { families: [ 'Lekton' ] },
    typekit: {
       id: 'ohq0hea'
     }
  };

  return {
    config: WebFontConfig,
    start: function() {
      var wf = document.createElement('script');
      wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
          '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
      wf.type = 'text/javascript';
      wf.async = 'true';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(wf, s);
    }
  };

})(),
dom.label = (function () {

  return {

    add: function($img, container, relative) {

      var alt = $img.attr('alt');
      var isRelative = !!relative;

      if (!alt || alt.length <= 0) {
        return;
      }

      var text = marked(alt);
      var label = $('<div class="label image" />').html(text).appendTo(container || document.body);

      var parent = container = $(container || document.body);

      var fadeIn = function() {

        var o, n, w, h, pos;

        if (isRelative) {
          pos = { left: 0, top: 0 };
        } else {
          var n = container.offset().top;
          var o = $img.offset();
          var w = ($img.outerWidth() - $img.width()) / 2;
          var h = ($img.outerHeight() - $img.height()) / 2 - n;
          pos = { left: o.left + w + 'px', top: o.top + h + 'px' };
        }

        label
          .css(pos)
          .fadeIn(150);

      };

      var fadeOut = function(e) {

        var target = $(e.relatedTarget);

        if (target.hasClass('image') || target.hasClass('label')) {
          return;
        }

        label.fadeOut(150);

      };

      var el = isRelative ? container : $img;

      el
        .hover(fadeIn, fadeOut)
        .bind('touchstart', fadeIn)
        .bind('touchend', fadeOut);

      return label;

    }

  };

})(),
common);

})();