define([
], function() {

  return {

    add: function($img, container) {

      var alt = $img.attr('alt');

      if (!alt || alt.length <= 0) {
        return;
      }

      var text = marked(alt);
      var label = $('<div class="label image" />').html(text).appendTo(container || document.body);

      var fadeIn = function() {

        var n = container.offset().top;
        var o = $img.offset();
        var w = ($img.outerWidth() - $img.width()) / 2;
        var h = ($img.outerHeight() - $img.height()) / 2 - n;

        label
          .css({
            top: o.top + h + 'px',
            left: o.left + w + 'px'
          })
          .fadeIn(150);

      };

      var fadeOut = function(e) {

        var target = $(e.relatedTarget);

        if (target.hasClass('image') || target.hasClass('label')) {
          return;
        }

        label.fadeOut(150);

      };

      $img
        .hover(fadeIn, fadeOut)
        .bind('touchstart', fadeIn)
        .bind('touchend', fadeOut);

      return label;

    }

  };

});