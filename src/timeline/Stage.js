define([
  'dom/grid',
  'common'
], function(grid, _) {

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

      var _this = this;
      var offset = calculateOffset.call(this, model);

      var $elem = $('<div />')
        .addClass('moment')
        .attr('model', model.id)
        .css({
          position: 'absolute',
          // padding: 6 + 'px',
          background: '#d1d1d1'
        })
        .appendTo(this.domElement);

      // Bind the models properties to the display of this div.
      var updateDisplay = function() {

        // var offset = calculateOffset.call(_this, model);
        // 
        // if (offset.left !== model.left) {
        //   model.left = offset.left;
        // }
        // if (offset.top !== model.top) {
        //   model.top = offset.top;
        // }

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

        if ($el.length > 0) {

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

    /**
     * Neighbor repelling
     */
    if (model.id !== 0 && _.isArray(model.neighbors)) {

      for (var i = 0, l = model.neighbors.length; i < l; i++) {

        var m = model.neighbors[i];
        if (_.isUndefined(m.top) || _.isUndefined(m.left)) {
          continue;
        }

        var left = m.left;
        var right = left + (m.width || 0);
        var top = m.top;
        var bottom = top + (m.height || 0);

        if (x + (model.width || 0) >= left && x <= right
          && y + (model.height || 0) >= top && y <= bottom) {

          var offset_column = grid.snapPosition(right + grid.width).x;
          var offset_width = offset_column + (model.width || 0);

          if (offset_width < 900 && offset_column > x) {
            x = offset_column;
          }

        }

      }

      for (var i = 0, l = model.neighbors.length; i < l; i++) {

        var m = model.neighbors[i];
        if (_.isUndefined(m.top) || _.isUndefined(m.left)) {
          continue;
        }

        var left = m.left;
        var right = left + (m.width || 0);
        var top = m.top;
        var bottom = top + (m.height || 0);

        if (x + (model.width || 0) >= left && x <= right
          && y + (model.height || 0) >= top && y <= bottom) {

            if (y < bottom) {
              y = bottom + grid.gutter;
            }

        }

      }

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
;