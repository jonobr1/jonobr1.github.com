define([
  'mvc/Model',
  'dom/grid',
  'underscore'
], function(Model, grid) {

  var $document = $(document);
  var ID = 0;
  var stage;

  var Gallery = function() {

    this.models = []; // The data
    this.images = []; // <img />'s

  };

  _.extend(Gallery, {

    MaxImages: 50

  });

  _.extend(Gallery.prototype, {

    /** 
     * Given an object of data, create a new model from it.
     */
    add: function(data) {

      var last = this.models.length;

      data.id = ID;
      ID++;

      var m = new Model(data);

      this.models.push(m);

      return m;

    },

    hideImage: function(model, parent) {

      var image = this.getImageById(model.id);

      if (_.isElement(image)) {
        $(image).fadeOut();
      }

      return this;

    },

    setStage: function(_stage) {

      this.stage = stage = _stage;

      return this;

    },

    getImageForModel: function(model, container) {

      var image = this.makeImage(model);
      container.appendChild(image);

      return this;

    },

    makeImage: function(model) {

      var length = this.images.length;
      var image = this.getImageById(model.id);

      if (_.isElement(image)) {
        return $(image).fadeIn()[0];
      }

      if (length < Gallery.MaxImages) {
        return makeNewImage(model);
      }

      image = this.getImageOffScreen();

      return makeNewImage(model, image);

    },

    getImageOffScreen: function() {

      var result;

      for (var i = 0, l = this.images.length; i < l; i++) {

        var image = this.images[i];
        var parent = $(image).parent();
        if (parent.length > 0 && !parent.hasClass('visible')) {
          result = image;
        }

      }

      return result;

    },

    getImageById: function(id) {

      var el = $document.find('[model=' + id +']').children()[0];

      return el;

    }

  });

  function makeNewImage(model, img) {

    var $image = $(img || '<img />')
      .css({
        display: 'none'
      })
      .bind('load', function() {

        if (model.width === 0) {

          var width = Math.min($image.width(), grid.getWidth(11));
          var height = $image.height();

          // Cap at stage width.

          var dimensions = grid.snapWidth(width, height);

          $image.width(dimensions.x).height(dimensions.y);
          model.setWidth(dimensions.x);
          model.setHeight(dimensions.y);

        }

        $image.fadeIn();

      });

    var image = $image[0];
    if (model.width !== 0) {
      image.width = model.width;
    }
    if (model.height !== 0) {
      image.height = model.height;
    }
    image.src = model.url;

    return image;

  }

  return Gallery;

});
