/**
 * @author jonobr1 / http://jonobr1.com
 * dependent on jquery and underscore

 * Minify commands:
 *

  cd src/utils
  node build.js

 *
 */

require([
  'svg/AnimatedPath',
  'Physics',
  'Vector',
  'webfont/loader',
  'dom/label',
  'common'
], function(AnimatedPath, Physics, Vector, webfont, label, _) {

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

    /**
     * Image `alt` labeling
     */

    _.each($('[alt]'), function(img) {
      label.add($(img), container);
    });

    _.each($('.slideshow').not('.touched'), function(elem) {

      var width = 0;
      var times = elem.children.length;
      var $elem = $(elem).addClass('touched');
      var elemWidth = $elem.width();

      // Click through the slideshow

      $elem
        .css({
          // opacity: 0 // Prep
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

      // Make a callback after all the images have been calculated.

      var callback = _.after(times, function() {
        $elem
          .width(width + width / times)
          .fadeIn(function() {
            $elem.css({
              marginLeft: (elemWidth - $(elem.children[0]).outerWidth(true)) / 2
            });
          })
          .addClass('animated');
      });

      // Load and calculate widths for each image.

      $elem.find(':first-child').addClass('selected');

      _.each(elem.children, function(child) {

        var $child = $(child).addClass('animated');
        var w = $child.outerWidth(true);

        if (w <= 0) {
          $child.load(function() {
            width += $child.outerWidth(true) || parseFloat($child.css('width'));
            callback();
          });
          return;
        }

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

});