define([
  'underscore',
  'jquery'
], function() {

  var ScrollMap = function(callback) {

    var that = this;

    var domElement = document;

    var x, y, width, height, children, scrollX, scrollY, $dom, $win, $bod;

    this.init = function() {
      return init();
    };

    this.getScrollPosition = function() {
      getScrollPosition();
    };

    function getScrollPosition() {

      x = $dom.offset().left;
      y = $dom.offset().top;
      width = $dom.outerWidth(true);
      height = $dom.outerHeight(true);

      scrollX = $bod.scrollLeft() / (width + $win.width());
      scrollY = $bod.scrollTop() / (height + $win.height());

      scrollX = Math.min(1.0, scrollX);
      scrollY = Math.min(1.0, scrollY);

      if(_.isFunction(callback)) {
        callback.call(this, { x: scrollX, y: scrollY });
      }

    }

    function init() {

      $dom = $('html');
      $win = $(window);
      $bod = $(document.body);

      var selector = domElement;

      children = document.body.children;

      $(selector)
        .scroll(getScrollPosition)
        .trigger('scroll');

      $win.resize(getScrollPosition);

    }

  };

  return ScrollMap;

});