define([
  'dom/grid',
  'underscore'
], function(grid) {

  var random_seed = 0;

  var Stage = function() {

    this.birthday = Math.round(Date.now() / 1000);
    this.$el = $('<div class="stage"/>');
    this.domElement = this.$el[0];
    this.offset = { x: grid.getPosition(1), y: 0 };
    this.range = { min: 0, max: 0 };

  };

  _.extend(Stage, {

    Id: 's-'

  });

  _.extend(Stage.prototype, {

    /**
     * Append the stage to an element.
     */
    appendTo: function(elem) {

      if (!_.isElement(elem)) {
        return this;
      }

      elem.appendChild(this.domElement);

      _.extend(elem.style, {
        overflow: 'hidden'
      });

      return this;

    },

    /**
     * Set a Timeline.Gallery reference on the Stage.
     */
    setGallery: function(gallery) {

      this.gallery = gallery;

      return this;

    },

    /**
     * Set a Timeline.Minimap reference on the Stage.
     */
    setMinimap: function(minimap) {

      this.minimap = minimap;

      return this;

    },

    /**
     * Place content based on the time.
     */
    place: function(model) {

      var offset = calculateOffset.call(this, model);

      var $elem = $('<div />')
        .addClass('moment')
        .attr('model', model.id)
        .css({
          position: 'absolute',
          padding: 6 + 'px',
          background: '#d1d1d1'
        })
        .appendTo(this.domElement);

      // Bind the models properties to the display of this div.
      var updateDisplay = function() {
        $elem.css({
          top: model.top + 'px',
          left: model.left + 'px',
          width: model.width + 'px',
          height: model.height + 'px'
        });
      };

      model
        .bind('change', updateDisplay)
        .add(offset);

      updateDisplay();
      this.updateDisplay();

      return $elem[0];

    },

    /**
     * Update the div elements to be shown or not shown, based on frustrum
     * culling.
     */
    update: function(scrollTop, windowHeight) {

      var viewport = {
        top: scrollTop,
        bottom: scrollTop + windowHeight
      };

      _.each(this.gallery.models, function(model) {

        var top = model.top - this.range.min;
        var bottom = top + model.height;
        var $el = this.$el.find('[model=' + model.id + ']');

        if ($el) {

          if (top > viewport.bottom || bottom < viewport.top) {
            $el.removeClass('visible');
            this.gallery.hideImage(model, $el[0]);
          } else {
            $el.addClass('visible');
            this.gallery.getImageForModel(model, $el[0]);
          }

        }

      }, this);

    },

    updateDisplay: function() {

      _.extend(this.domElement.style, {
        marginTop: - this.range.min + 'px',
        height: this.range.max + 'px'
      });

    }

  });

  function calculateOffset(model) {

    var x = this.offset.x;
    var y = Math.round((this.birthday - model.date) / 10 - this.offset.y);

    if (model.width) {
      var possible = random_seed * (this.width - model.width - this.offset.x);
      x += grid.snapPosition(possible).x;
      increment();
    }

    if (y > this.range.max) {
      this.range.max = y;
    }

    if (y < this.range.min || this.range.min === 0) {
      this.range.min = y;
    }

    return { left: x, top: y };

  }

  function increment() {
    random_seed = Math.floor(Math.random() * 7) / 6;
  }

  return Stage;

});
