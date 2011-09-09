/**
 * Stalactite
 *
 * @author jonobr1 / http://jonobr1.com/
 */

(function($) {

  $.fn.stalactite = function(customOptions) {

    var options = $.extend({}, $.fn.stalactite.defaultOptions, customOptions);

    return this.each(function() {

      var $this = $(this);

      prep($this);

      // if fluid bind to window resize
      // by spacing out the objects with padding / margin left <-> right

      // Make sure images are loaded before calculations for proper width / height measurements.
      var $assets = $this.find('img');
      var $content = $this.find(':not(img)');

      var loadedImgs = 0;

      if ($assets.length > 0) {
        $assets.each(function(i) {
          var $asset = $(this).load(function() {
            // Animate in!
            animateIn($asset);
            loadedImgs++;
            if (loadedImgs >= $assets.length) {
              pack($this);
            }
          });
        });
      } else {
        pack($this);
      }

    });

  };

  function animateIn($dom, params, callback) {

    // Animate this sucker in!
    // Parameterize this in defaults

    $dom.animate(params, callback);

  }

  function prep($dom) {

    $dom
      .children().css({
        position: 'relative',
        display: 'inline-block',
        verticalAlign: 'top',
        opacity: 0
      });

  }

  function pack($dom) {

    // Pack and then fade in!
    var $content = $dom.children();

    var row = 0, col = 0, prevMinIndex = 0, prevMaxIndex = 0;

    var origin = {
      x: $dom.position().left + ($dom.outerWidth() - $dom.width()) / 2,
      y: $dom.position().top + ($dom.outerHeight() - $dom.height()) / 2
    };

    calculateOffset(0);

    function calculateOffset(i) {

      if (i >= $content.length) {
        return;
      }

      var $this = $($content[i]);
      var x1 = $this.offset().left, x2 = x1 + $this.outerWidth(),
          y1 = $this.offset().top, y2 = y1 + $this.outerHeight();

      if (x1 === origin.x && i > 0) {
        row++;
        prevMinIndex = prevMaxIndex;
        prevMaxIndex = i - 1;
      }

      if (row > 0) {

        var offsetY = 0;

        for (var j = prevMaxIndex; j >= prevMinIndex; j--) {

          var $prev = $($content[j]);
          var a1 = $prev.offset().left, a2 = a1 + $prev.outerWidth(),
              b1 = $prev.offset().top, b2 = b1 + $prev.outerHeight();

          if (a1 > x2 || a2 < x1) {
            continue;
          } else if (offsetY < b2) {
            offsetY = b2;
          }

        }

        // Set the property
        animateIn($this, {
          opacity: 1,
          marginTop: (offsetY - y1)
        }, function() {
          calculateOffset(i + 1);
        });

      } else {

        animateIn($this, {
          opacity: 1
        }, function() {
          calculateOffset(i + 1);
        });

      }

    }

  }

  $.fn.stalactite.defaultOptions = {

    

  };

})(jQuery)