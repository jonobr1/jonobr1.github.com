define([
  'underscore'
], function() {

  var hidden = false;
  var domElement = document.createElement('div');
  var $el = $(domElement).addClass('loader');
  var image = document.createElement('img');
  image.src = '../images/loader.gif';

  domElement.appendChild(image);

  return {

    domElement: domElement,

    show: function(callback) {
      if (!hidden) {
        return this;
      }
      $el.fadeIn(function() {
        hidden = false;
        (_.isFunction(callback) ? callback : _.identity)();
      });
    },

    hide: function(callback) {
      if (hidden) {
        return this;
      }
      $el.fadeOut(function() {
        hidden = true;
        (_.isFunction(callback) ? callback : _.identity)();
      });
    }

  };

})