define([
  'common'
], function(_) {

  var hidden = false;
  var domElement = document.createElement('div');
  var $el = $(domElement).css('display', 'block').addClass('loader');
  var image = document.createElement('img');
  image.src = '../images/loader.gif';

  domElement.appendChild(image);

  return {

    domElement: domElement,

    show: function(callback) {
      if (!hidden) {
        return this;
      }
      $el.fadeIn(150, function() {
        hidden = false;
        (_.isFunction(callback) ? callback : _.identity)();
      });
    },

    hide: function(callback) {
      if (hidden) {
        return this;
      }
      $el.fadeOut(150, function() {
        hidden = true;
        (_.isFunction(callback) ? callback : _.identity)();
      });
    }

  };

})