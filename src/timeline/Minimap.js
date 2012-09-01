define([
  'dom/loader',
  'dom/grid',
  'common'
], function(loader, grid, _) {

  var $document = $(document);
  var $window = $(window);

  var Minimap = function() {

    var _this = this;

    this.width = grid.getWidth(1);
    this.gutter = grid.gutter;

    this.$el = $('<div class="minimap" />');
    this.domElement = this.$el[0];
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.loader = loader;

    this.viewport = $('<div class="viewport" />')[0];

    this.domElement.appendChild(this.viewport);
    this.domElement.appendChild(this.canvas);
    this.domElement.appendChild(this.loader.domElement);

    var onElementMouseDown = _.bind(function(e) {
      $document
        .bind('mousemove', drag)
        .bind('mouseup', endDrag);
    }, this);

    var drag = _.bind(function(e) {

      e.preventDefault();
      e.stopPropagation();

      var o = this.$el.offset();
      var x = Math.max(Math.min(e.pageX - o.left, this.width), 0);
      var y = Math.max(Math.min(e.pageY - o.top, this.height), 0);

      var scrollTop = this.fromWorldY(y);
      $document.scrollTop(scrollTop);

    }, this);

    var endDrag = _.bind(function(e) {
      $document
        .unbind('mousemove', drag)
        .unbind('mouseup', endDrag);
    }, this);

    $(this.domElement)
      .bind('mousedown', onElementMouseDown)
      .bind('mouseup', function(e) {
        drag(e);
        endDrag();
      });

  };

  _.extend(Minimap.prototype, {

    appendTo: function(elem) {

      if (!_.isElement(elem)) {
        return this;
      }

      elem.appendChild(this.domElement);

      return this;

    },

    setStage: function(stage) {

      this.stage = stage;

      return this;

    },

    setGallery: function(gallery) {

      this.gallery = gallery;

      return this;

    },

    setOffset: function(x, y) {

      _.extend(this.domElement.style, {
        left: x + 'px',
        top: y + 'px'
      });

      return this;

    },

    setHeight: function(height) {

      if (height === this.height) {
        return this;
      }

      this.height = height;

      _.extend(this.domElement.style, {
        width: this.width + 'px',
        height: this.height + 'px'
      });
      this.canvas.width = this.width;
      this.canvas.height = this.height;

      this.updateDisplay();

      return this;

    },

    toWorldX: function(x) {
      // TODO: Optimize
      var scaleX = this.stage.width / this.width;
      return Math.ceil(x / scaleX);
    },

    toWorldY: function(y) {
      // TODO: Optimize
      var scaleY = this.stage.height / this.height;
      return Math.ceil(y / scaleY);
    },

    fromWorldX: function(x) {
      // TODO: Optimize
      var scaleX = this.stage.width / this.width;
      return Math.ceil(x * scaleX);
    },

    fromWorldY: function(y) {
      // TODO: Optimize
      var scaleY = this.stage.height / this.height;
      return Math.ceil(y * scaleY);
    },

    update: function() {

      var $stage = $(this.stage.domElement);
      this.stage.width = $stage.width();
      this.stage.height = $stage.height() - this.stage.range.min;

      return this;

    },

    updateDisplay: function(scrollTop, windowHeight) {

      this.update();

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';

      var half_offset = this.stage.offset.x / 2;

      _.each(this.gallery.models, function(model) {

        var x = this.toWorldX(model.left - half_offset);
        var y = this.toWorldY(model.top - this.stage.range.min);
        var w = this.toWorldX(model.width - this.stage.offset.x);
        var h = this.toWorldY(model.height) + 6;

        this.ctx.fillRect(x, y, w, h);

      }, this);

      this.updateViewport(scrollTop, windowHeight);

      return this;

    },

    updateViewport: function(scrollTop, windowHeight) {

      _.extend(this.viewport.style, {
        top: this.toWorldY(scrollTop) + 'px',
        height: this.toWorldY(windowHeight) + 'px'
      });

      return this;

    }

  });

  return Minimap;

});
