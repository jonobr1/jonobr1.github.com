define([
], function() {

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

});