(function() {

var js = js || {};
var gimmebar = gimmebar || {};
var timeline = timeline || {};
var dom = dom || {};
var mvc = mvc || {};

common = (function () {

  /**
   * Pulled only what's needed from:
   * 
   * Underscore.js 1.3.3
   * (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
   * http://documentcloud.github.com/underscore
   */

  var ArrayProto   = Array.prototype,
    hasOwnProperty = Object.prototype.hasOwnProperty,
    slice          = ArrayProto.slice,
    nativeForEach  = ArrayProto.forEach,
    nativeIndexOf  = ArrayProto.indexOf,
    nativeMap      = ArrayProto.map,
    nativeFilter   = ArrayProto.filter,
    nativeIsArray  = Array.isArray,
    nativeBind     = Function.prototype.bind;

  var ctor = function(){};
  var breaker = {};

  var has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  var each = function(obj, iterator, context) {

    if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
          obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
          for (var i = 0, l = obj.length; i < l; i++) {
            if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
          }
        } else {
          for (var key in obj) {
            if (has(obj, key)) {
              if (iterator.call(context, obj[key], key, obj) === breaker) return;
            }
          }
        }

  };

  var identity = function(value) {
    return value;
  };

  var sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  var filter = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  return {

    has: has,

    each: each,

    compact: function(array) {
      return filter(array, function(value) { return !!value; });
    },

    bind: function(func, context) {
      var bound, args;
      if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
      if (!this.isFunction(func)) throw new TypeError;
      args = slice.call(arguments, 2);
      return bound = function() {
        if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
        ctor.prototype = func.prototype;
        var self = new ctor;
        var result = func.apply(self, args.concat(slice.call(arguments)));
        if (Object(result) === result) return result;
        return self;
      };
    },

    extend: function(obj) {
      each(slice.call(arguments, 1), function(source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      });
      return obj;
    },

    map: function(obj, iterator, context) {
      var results = [];
      if (obj == null) return results;
      if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
      each(obj, function(value, index, list) {
        results[results.length] = iterator.call(context, value, index, list);
      });
      if (obj.length === +obj.length) results.length = obj.length;
      return results;
    },

    indexOf: function(array, item, isSorted) {
      if (array == null) return -1;
      var i, l;
      if (isSorted) {
        i = sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
      if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
      for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
      return -1;
    },

    sortedIndex: sortedIndex,

    identity: identity,

    after: function(times, func) {
      if (times <= 0) return func();
      return function() {
        if (--times < 1) { return func.apply(this, arguments); }
      };
    },

    debounce: function(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        if (immediate && !timeout) func.apply(context, args);
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    clone: function(obj) {
      if (!_.isObject(obj)) return obj;
      return this.isArray(obj) ? obj.slice() : _.extend({}, obj);
    },

    isArray: nativeIsArray || function(obj) {
      return toString.call(obj) == '[object Array]';
    },

    isElement: function(obj) {
      return !!(obj && obj.nodeType == 1);
    },

    isObject: function(obj) {
      return obj === Object(obj);
    },

    isNumber: function(obj) {
      return toString.call(obj) == '[object Number]';
    },

    isFunction: function(obj) {
      return toString.call(obj) == '[object Function]' || typeof obj == 'function';
    },

    isUndefined: function(obj) {
      return obj === void 0;
    },

    isNull: function(obj) {
      return obj === null;
    }

  };

})();


dom.grid = (function (_) {

  var column_widths = [888, 813, 738, 663, 588, 513, 438, 363, 288, 213, 138, 63];
  var column_positions = [900, 825, 750, 675, 600, 525, 450, 375, 300, 225, 150, 75, 0];

  var grid = {

    gutter: 12,

    width: 75,

    columns: 12,

    getPosition: function(columns) {
      return Math.max(Math.min(columns, this.columns), 0) * this.width;
    },

    getWidth: function(columns) {
      return this.getPosition(columns) - this.gutter;
    },

    snapWidth: function(x, y) {

      if (x === 0) {
        return { x: x, y: y };
      }

      if (_.isUndefined(y)) {
        y = 0;
      }

      var _x = x, _y = y;

      for (var i = 0, l = column_widths.length; i < l; i++) {

        var column = column_widths[i];
        if (column < _x) {
          x = column;
          y = Math.floor(column * _y / _x);
          break;
        }

      }

      return { x: x, y: y };

    },

    snapPosition: function(x, y) {

      if (x === 0) {
        return { x: x, y: y };
      }

      if (_.isUndefined(y)) {
        y = 0;
      }

      var _x = x, _y = y;

      for (var i = 0, l = column_positions.length; i < l; i++) {

        var column = column_positions[i];
        if (column < _x) {
          x = column;
          y = Math.floor(column * _y / _x);
          break;
        }

      }

      return { x: x, y: y };

    }

  };

  // grid.width = grid.width * grid.columns;

  return grid;

})(common);


(function (gimmebar, Stage, Minimap, Gallery, grid, _) {

  var $window     = $(window);
  var $document   = $(document);
  var $navigation = $document.find('nav');
  var content     = $('#content')[0];

  var stage   = new Stage().appendTo(content);
  var minimap = new Minimap().appendTo(document.body);
  var gallery = new Gallery();

  stage.setGallery(gallery);
  minimap.setGallery(gallery).setStage(stage);
  gallery.setStage(stage);

  var threshold = {
    min: 0,
    max: 0
  };
  var scrollTop = 0;
  var windowHeight = $window.height();
  var navHeight = $navigation.outerHeight(true);
  var navOffset = $navigation.offset();
  var minimapOffset;

  gimmebar.getAssetsForUser('jonobr1', receiveData);

  $window.resize(function() {

    windowHeight = $window.height();
    navOffset = $navigation.offset();
    minimapOffset = Math.max(navHeight - scrollTop, minimap.gutter);

    minimap
      .setOffset(navOffset.left, minimapOffset)
      .setHeight(windowHeight - minimapOffset - minimap.gutter);

  }).trigger('resize');

  /**
   * Place all events considered for triggering once scrolling has finished.
   */
  var onScrollEnd = _.debounce(function() {

    stage.update(scrollTop - navHeight, windowHeight);

  }, 750);

  $document.scroll(function() {

    var st = $document.scrollTop();

    if (scrollTop < st) {
      // Scrolling down
      if (st + windowHeight > threshold.max) {
        next();
      }
    } else if (scrollTop > st) {
      // Scrolling up
      if (st < threshold.min) {
        previous();
      }
    }

    scrollTop = st;

    minimapOffset = Math.max(navHeight - scrollTop, minimap.gutter);
    minimap
      .setOffset(navOffset.left, minimapOffset)
      .setHeight(windowHeight - minimapOffset - minimap.gutter)
      .updateViewport(scrollTop - navHeight, windowHeight);

    onScrollEnd();

  });

  function next() {
    if (gimmebar.querying || (gimmebar.cursor === gimmebar.total_pages && gimmebar.total_pages !== 0)) {
      return;
    }
    minimap.loader.show();
    gimmebar.cursor++;
    gimmebar.getAssetsForUser('jonobr1', receiveData);
  }

  function previous() {
    if (gimmebar.querying || gimmebar.cursor === 0 || _.indexOf(gimmebar.loaded, 0) >= 0) {
      return;
    }
    minimap.loader.show();
    gimmebar.cursor--;
    gimmebar.getAssetsForUser('jonobr1', receiveData);
  }

  function receiveData(resp) {

    _.each(resp.records, function(record) {

      switch (record.asset_type) {

        case 'image':

          var image_data = record.content.resized_images;
          var stash = image_data.stash;
          var display = image_data.display;

          var stashHas = stash && _.isObject(stash.dims);
          var displayHas = display && _.isObject(display.dims);

          var width = stashHas ? stash.dims.w : displayHas ? display.dims.w : 0;
          var height = stashHas ? stash.dims.h : displayHas ? display.dims.h : 0;

          if (width === 0 || height === 0) {
            break;
          }

          var dimensions = grid.snapWidth(parseInt(width), parseInt(height));

          var model = gallery.add({
            url: image_data.full,
            date: record.date,
            width: dimensions.x / 2,
            height: dimensions.y / 2,
            title: record.title
          });

          for (var i = 0, l = gallery.models.length; i < l; i++) {

            var m = gallery.models[i];

            if (model.id === m.id || gallery.areNeighbors(model, m) || !gallery.isNeighbors(model, m)) {
              continue;
            }
            gallery.makeNeighbors(model, m);

          }

          break;

      }

    });

    for (var i = 0, l = gallery.models.length; i < l; i++) {
      var model = gallery.models[i];
      if (model.placed) {
        continue;
      }
      model.add({ placed: true });
      stage.place(model);
    }

    updateDisplay();
    minimap.loader.hide();

  }

  function updateDisplay() {

    var height = $document.height();

    threshold.max = height * 0.9;
    threshold.min = height * 0.1;

    if (height <= windowHeight) {
      next();
      return;
    }

    var offsetScroll = scrollTop - navHeight;

    stage.update(offsetScroll, windowHeight);
    minimap.updateDisplay(offsetScroll, windowHeight);

  }

})(gimmebar.api = (function (_) {

  var proxy  = '../php/get.php?q=';
  var base   = 'https://gimmebar.com/api/v1';
  var api    = '/public/assets';
  var loaded = [];

  // DOCS: https://pro.gimmebar.com/api/v1
  // e.g: https://gimmebar.com/api/v1/public/assets/funkatron

  var gimmebar = {

    loaded: loaded,

    querying: false,

    limit: 10,

    cursor: 0,

    total_records: 0,

    total_pages: 0,

    getAssetsForUser: function(_user, _callback) {

      this.querying = true;

      var user = '/' + _user;
      var skip = '?skip=' + (this.cursor * this.limit);
      var limit = '&limit=' + this.limit;

      var url = base + api + user + skip + limit;

      if (_.indexOf(loaded, this.cursor) >= 0) {
        return;
      }

      $.get(proxy + url, function(resp) {

        var data = JSON.parse(resp);

        console.log('GET: ', data);

        // Update the total records if we can

        var total_records = data.total_records;
        if (total_records && gimmebar.total_records !== total_records) {
          gimmebar.total_records = data.total_records;
          gimmebar.total_pages = Math.floor(gimmebar.total_records / gimmebar.limit);
        }

        loaded.push(gimmebar.cursor);
        gimmebar.querying = false;

        _callback(data);

      });

    }

  };

  return gimmebar;

})(common),
timeline.Stage = (function (grid, _) {

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

})(dom.grid,
common),
timeline.Minimap = (function (loader, grid, _) {

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

})(dom.loader = (function (_) {

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

})(common),
dom.grid,
common),
timeline.Gallery = (function (Model, grid, label, _) {

  var $document = $(document);
  var ID = 0;
  var stage;

  var Gallery = function() {

    this.models = []; // The data
    this.images = []; // <img />'s

  };

  _.extend(Gallery, {

    MaxImages: 50,

    /**
     * Seconds to check for neighbors.
     */
    Threshold: 3600

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

    /**
     * Is the match made already?
     */
    areNeighbors: function(m1, m2) {
      return m1.neighbors && m1.neighbors.length > 0 && _.indexOf(m1.neighbors, m2) >= 0;
    },

    /**
     * Date comparison
     */
    isNeighbors: function(m1, m2) {
      var d1 = m1.date;
      var d2 = m2.date;
      return Math.abs(d1 - d2) < Gallery.Threshold;
    },

    /**
     * Make a connection between two models.
     */
    makeNeighbors: function(m1, m2) {
      if (!_.isArray(m1.neighbors)) {
        m1.add({ neighbors: [] });
      }
      if (!_.isArray(m2.neighbors)) {
        m2.add({ neighbors: [] });
      }
      m1.neighbors.push(m2);
      m2.neighbors.push(m1);
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
      .attr('alt', model.title)
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

        // label.add($image, $image.parent());

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

})(mvc.Model = (function (Events, _) {

  /**
   * Model is an abstract way to save data with possible event binding. Just
   * instantiate a new model with a map of whatever data you'd like to save.
   * 
   * @class
   */
  var Model = function(data) {

    if (_.isObject(data)) {
      this.add(data);
    }

  };

  _.extend(Model.prototype, Events, {

    add: function(data, silent) {

      _.each(data, function(value, prop) {

        var capital = capitalize(prop);

        if (_.isUndefined(this[prop])) {

          makeProperty.call(this, value, prop, capital);

        } else {

          this['set' + capital](value, silent);

        }

      }, this);

      return this;

    }

  });

  function makeProperty(value, prop, capital) {

    // Setup property for Model

    this[prop] = _.isObject(value) ? _.clone(value) : value;

    // Provide getters and setters

    this['get' + capital] = function() {
      return this[prop];
    };

    this['set' + capital] = function(n, silent) {
      if (n === this[prop]) {
        return this;
      }
      this[prop] = n;
      if (!silent) {
        this.trigger('change', prop, n);
      }
      return this;
    };

  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
  }

  return Model;

})(mvc.Events = (function () {

  return {

      // Bind an event, specified by a string name, `ev`, to a `callback` function.
      // Passing `"all"` will bind the callback to all events fired.
      bind: function(ev, callback) {
        var evs = ev.split(' ');
        for (var i = 0, l = evs.length; i < l; i++) {
          ev = evs[i];
          var calls = this._callbacks || (this._callbacks = {});
          var list = this._callbacks[ev] || (this._callbacks[ev] = []);
          list.push(callback);
        }
        return this;
      },

      // Remove one or many callbacks. If `callback` is null, removes all
      // callbacks for the event. If `ev` is null, removes all bound callbacks
      // for all events.
      unbind: function(ev, callback) {
        var calls;
        if (!ev) {
          this._callbacks = {};
        } else if (calls = this._callbacks) {
          if (!callback) {
            calls[ev] = [];
          } else {
            var list = calls[ev];
            if (!list) return this;
            for (var i = 0, l = list.length; i < l; i++) {
              if (callback === list[i]) {
                list.splice(i, 1);
                break;
              }
            }
          }
        }
        return this;
      },

      // Trigger an event, firing all bound callbacks. Callbacks are passed the
      // same arguments as `trigger` is, apart from the event name.
      // Listening for `"all"` passes the true event name as the first argument.
      trigger: function(ev) {
        var list, calls, i, l;
        if (!(calls = this._callbacks)) return this;
        if (list = calls[ev]) {
          for (i = 0, l = list.length; i < l; i++) {
            list[i].apply(this, Array.prototype.slice.call(arguments, 1));
          }
        }
        if (list = calls['all']) {
          for (i = 0, l = list.length; i < l; i++) {
            list[i].apply(this, arguments);
          }
        }
        return this;
      }
  };

})(),
common),
dom.grid,
dom.label = (function () {

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

})(),
common),
dom.grid,
common);

})();