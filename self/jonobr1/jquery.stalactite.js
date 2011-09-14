/**
 * jQuery Stalactite : Lightweight Element Packing
 * Examples and documentation at: http://jonobr1.github.com/stalactite
 * Copyright (c) 2011 Jono Brandel
 * Version: 0.1 (8-SEPTEMBER-2011)
 * Requires: jQuery v1.6.2 or later
 *
 * Copyright 2011 jonobr1
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function($) {

  $.fn.stalactite = function(customOptions) {

    var resizing = false;
    var options = $.extend({}, $.fn.stalactite.defaultOptions, customOptions);

    return this.each(function() {

      var $this = $(this);
      var packTimeout = null;
      var row = 0;

      prep($this);
      appendLoader($this);

      if (options.fluid) {
        $this.css('width', 'auto');
        $(window).bind('resize', function() {
          if (packTimeout) {
            clearTimeout(packTimeout);
          } else {
            appendLoader($this);
          }
          resizing = true;
          packTimeout = setTimeout(function() {
            resizing = false;
            packTimeout = null;
            row = 0;
            pack($this, calculateOffset);
          }, 2000);
        });
      }

      var $assets = $this.find('img, embed, iframe, audio, video');
      var $content = $this.find(':not(img, embed iframe, audio, video)');

      var loadedImgs = 0;

      if ($assets.length > 0) {
        $assets.each(function(i) {
          var $asset = $(this).load(function() {
            animateIn($asset);
            loadedImgs++;
            if (loadedImgs >= $assets.length) {
              pack($this, calculateOffset);
            }
          });
        });
      } else {
        pack($this, calculateOffset);
      }

      function calculateOffset($content, origin, prevMinIndex, prevMaxIndex, i) {

        if (i >= $content.length) {
          options.complete.apply(this);
          return;
        } else if (resizing && options.fluid) {
          return;
        }

        var $this = $($content[i]);
        var $prev = $($content[i - 1]);
        var x1 = $this.offset().left, x2 = x1 + $this.outerWidth(),
            y1 = $this.offset().top, y2 = y1 + $this.outerHeight();

        if ($prev.length > 0) {
          if (x1 < $prev.offset().left && i > 0) {
            row++;
            prevMinIndex = prevMaxIndex;
            prevMaxIndex = i - 1;
          }
        }

        var offsetY = 0;

        if (row > 0) {

          for (var j = prevMaxIndex; j >= prevMinIndex; j--) {

            var $prev = $($content[j]);
            var a1 = $prev.offset().left, a2 = a1 + $prev.outerWidth(),
                b1 = $prev.offset().top, b2 = b1 + $prev.outerHeight();

            if (a1 >= x2 || a2 <= x1) {
              continue;
            } else if (offsetY < b2) {
              offsetY = b2;
            }

          }

          offsetY = offsetY - y1;

        } else {
          offsetY = - parseInt($this.css('margin-top').toString().replace('px', ''));
        }

        animateIn($this, {
          opacity: 1,
          marginTop: '+=' + offsetY
        }, function() {
          calculateOffset($content, origin, prevMinIndex, prevMaxIndex, i + 1);
        });

      }

    });

    function appendLoader($dom) {

      var origin = {
        x: $dom.offset().left + ($dom.outerWidth() - $dom.width()) / 2,
        y: $dom.offset().top + ($dom.outerHeight() - $dom.height()) / 2
      };

      var $loader = $('<p class="stalactite-loader" style="display: none;"/>')
        .css({
          position: 'absolute',
          top: origin.y,
          left: origin.x
        })
        .html(options.loader)
        .appendTo('body');

      $loader
        .find('img')
        .load(function() {
          $loader.fadeIn();
        });

    }

    function animateIn($dom, params, callback) {
      $dom.css('z-index', 'auto').stop().animate($.extend({}, params, options.styles),
        options.duration, options.easing, callback);
    }

  };

  function removeLoader() {
    $('.stalactite-loader').fadeOut(function() {
      $('.stalactite-loader').remove();
    });
  }

  function prep($dom) {

    $dom
      .children().css({
        position: 'relative',
        display: 'inline-block',
        verticalAlign: 'top',
        opacity: 0,
        zIndex: -1
      });

  }

  function pack($dom, callback) {

    var $content = $dom.children();

    var prevMinIndex = 0, prevMaxIndex = 0;

    var origin = {
      x: $dom.offset().left + ($dom.outerWidth() - $dom.width()) / 2,
      y: $dom.offset().top + ($dom.outerHeight() - $dom.height()) / 2
    };

    removeLoader();

    callback.apply(this, [$content, origin, prevMinIndex, prevMaxIndex, 0]);

  }

  $.fn.stalactite.defaultOptions = {
    duration: 150,
    easing: 'swing',
    fluid: true,
    loader: '<img src="data:image/gif;base64, R0lGODlhEAAQAPQAAP///zMzM/n5+V9fX5ycnDc3N1FRUd7e3rm5uURERJGRkYSEhOnp6aysrNHR0WxsbHd3dwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAAFUCAgjmRpnqUwFGwhKoRgqq2YFMaRGjWA8AbZiIBbjQQ8AmmFUJEQhQGJhaKOrCksgEla+KIkYvC6SJKQOISoNSYdeIk1ayA8ExTyeR3F749CACH5BAkKAAAALAAAAAAQABAAAAVoICCKR9KMaCoaxeCoqEAkRX3AwMHWxQIIjJSAZWgUEgzBwCBAEQpMwIDwY1FHgwJCtOW2UDWYIDyqNVVkUbYr6CK+o2eUMKgWrqKhj0FrEM8jQQALPFA3MAc8CQSAMA5ZBjgqDQmHIyEAIfkECQoAAAAsAAAAABAAEAAABWAgII4j85Ao2hRIKgrEUBQJLaSHMe8zgQo6Q8sxS7RIhILhBkgumCTZsXkACBC+0cwF2GoLLoFXREDcDlkAojBICRaFLDCOQtQKjmsQSubtDFU/NXcDBHwkaw1cKQ8MiyEAIfkECQoAAAAsAAAAABAAEAAABVIgII5kaZ6AIJQCMRTFQKiDQx4GrBfGa4uCnAEhQuRgPwCBtwK+kCNFgjh6QlFYgGO7baJ2CxIioSDpwqNggWCGDVVGphly3BkOpXDrKfNm/4AhACH5BAkKAAAALAAAAAAQABAAAAVgICCOZGmeqEAMRTEQwskYbV0Yx7kYSIzQhtgoBxCKBDQCIOcoLBimRiFhSABYU5gIgW01pLUBYkRItAYAqrlhYiwKjiWAcDMWY8QjsCf4DewiBzQ2N1AmKlgvgCiMjSQhACH5BAkKAAAALAAAAAAQABAAAAVfICCOZGmeqEgUxUAIpkA0AMKyxkEiSZEIsJqhYAg+boUFSTAkiBiNHks3sg1ILAfBiS10gyqCg0UaFBCkwy3RYKiIYMAC+RAxiQgYsJdAjw5DN2gILzEEZgVcKYuMJiEAOwAAAAAAAAAAAA==" />',
    styles: {},
    complete: function(value) { return value; }
  };

})(jQuery)