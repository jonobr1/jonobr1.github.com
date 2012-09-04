(function() {

var js = js || {};
var mvc = mvc || {};
var gimmebar = gimmebar || {};
var timeline = timeline || {};
var dom = dom || {};
var svg = svg || {};

mvc.Events = (function () {

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

})();


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
    nativeSome     = ArrayProto.some,
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

    bindAll: function(obj) {
      var funcs = slice.call(arguments, 1);
      if (funcs.length == 0) funcs = this.functions(obj);
      this.each(funcs, function(f) { obj[f] = this.bind(obj[f], obj); }, this);
      return obj;
    },

    functions: function(obj) {
      var names = [];
      for (var key in obj) {
        if (this.isFunction(obj[key])) names.push(key);
      }
      return names.sort();
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

    any: function(obj, iterator, context) {
      iterator || (iterator = this.identity);
      var result = false;
      if (obj == null) return result;
      if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
      each(obj, function(value, index, list) {
        if (result || (result = iterator.call(context, value, index, list))) return breaker;
      });
      return !!result;
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
      if (!this.isObject(obj)) return obj;
      return this.isArray(obj) ? obj.slice() : this.extend({}, obj);
    },

    isElement: function(obj) {
      return !!(obj && obj.nodeType == 1);
    },

    isArray: nativeIsArray || function(obj) {
      return toString.call(obj) == '[object Array]';
    },

    toArray: function(obj) {
      if (!obj)                                        return [];
      if (this.isArray(obj))                           return slice.call(obj);
      if (this.isArguments(obj))                       return slice.call(obj);
      if (obj.toArray && this.isFunction(obj.toArray)) return obj.toArray();
      return this.values(obj);
    },

    values: function(obj) {
      return this.map(obj, this.identity);
    },

    once: function(func) {
      var ran = false, memo;
      return function() {
        if (ran) return memo;
        ran = true;
        return memo = func.apply(this, arguments);
      };
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
    },

    isRegExp: function(obj) {
      return toString.call(obj) == '[object RegExp]';
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


(function (Router, gimmebar, Stage, Minimap, Gallery, grid, _) {

  var $window     = $(window);
  var $document   = $(document);
  var $navigation = $document.find('nav');
  var content     = $('#content')[0];

  var stage   = new Stage().appendTo(content);
  var minimap = new Minimap().appendTo(document.body);
  var gallery = new Gallery();

  var router = new Router();
  var loading = false;

  router.route('page/:page', 'page', getContent);

  stage.setGallery(gallery);
  minimap.setGallery(gallery).setStage(stage);
  gallery.setStage(stage);

  var threshold = {
    min: 0,
    max: 0
  };
  var scrollTop = 0;
  var scrollLeft = 0;
  var windowHeight = $window.height();
  var navHeight = $navigation.outerHeight(true);
  var navOffset = $navigation.offset();
  var minimapOffset;

  var initialize = _.once(function() {

    minimap.clock.setInitialTime(gallery.models[0].date);

  });

  $window.resize(function() {

    windowHeight = $window.height();
    navOffset = $navigation.offset();
    minimapOffset = Math.max(navHeight - scrollTop, minimap.gutter);

    minimap
      .setOffset(navOffset.left + 32 - scrollLeft, minimapOffset, scrollTop)
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
    var sh = $document.scrollLeft();

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

    // Account for horizontal scrolling

    scrollLeft = sh;
    scrollTop = st;

    minimapOffset = Math.max(navHeight - scrollTop, minimap.gutter);
    minimap
      .setOffset(navOffset.left + 32 - scrollLeft, minimapOffset, scrollTop)
      .setHeight(windowHeight - minimapOffset - minimap.gutter)
      .updateViewport(scrollTop - navHeight, windowHeight);

    onScrollEnd();

  });

  /**
   * setup the page
   */

  var routeExists = Router.history.start({
    // root: '/inspiration/' // Only for deving locally
  });

  if (!routeExists) {
    loading = true;
    router.navigate('\#page/' + gimmebar.cursor);
  }

  function next() {
    if (loading || (gimmebar.cursor === gimmebar.total_pages && gimmebar.total_pages !== 0)) {
      return;
    }
    loading = true;
    gimmebar.cursor = Math.min(parseInt(gimmebar.cursor) + 1, gimmebar.total_pages);
    router.navigate('\#page/' + gimmebar.cursor);
  }

  function previous() {
    // if (loading || gimmebar.cursor === 0 || _.indexOf(gimmebar.loaded, 0) >= 0) {
    //   return;
    // }
    // loading = true;
    // gimmebar.cursor = Math.max(parseInt(gimmebar.cursor) - 1, 0);
    // router.navigate('\#page/' + gimmebar.cursor);
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

          var dimensions = grid.snapWidth(parseInt(width / 2), parseInt(height / 2));

          var model = gallery.add({
            url: image_data.full,
            date: record.date,
            width: dimensions.x,
            height: dimensions.y,
            title: record.title,
            href: record.source
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

    initialize();

    updateDisplay();
    minimap.loader.hide();

    $window.trigger('resize');

    loading = false;

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

  function getContent(page) {

    // Stay in the bounds
    if (page < 0 || (gimmebar.total_pages && page > gimmebar.total_pages)) {
      page = Math.min(Math.max(page, 0), gimmebar.total_pages);
      Router.history.navigate('\#page/' + page, { silent: true });
    }

    // Make sure we're in sync
    if (gimmebar.cursor !== page) {
      gimmebar.cursor = page;
    }

    var successful = gimmebar.getAssetsForUser('jonobr1', receiveData);

    if (successful) {
      minimap.loader.show();
    } else {
      loading = false;
    }

  }

})(mvc.Router = (function (Events, history, _) {

  // Backbone.Router
  // -------------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  Router.history = history;

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var namedParam    = /:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      history || (history = new History);
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (!callback) callback = this[name];
      history.route(route, _.bind(function(fragment) {
        var args = this._extractParameters(route, fragment);
        callback && callback.apply(this, args);
        this.trigger.apply(this, ['route:' + name].concat(args));
        history.trigger('route', this, name, args);
      }, this));
      return this;
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      history.navigate(fragment, options);
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      var routes = [];
      for (var route in this.routes) {
        routes.unshift([route, this.routes[route]]);
      }
      for (var i = 0, l = routes.length; i < l; i++) {
        this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(namedParam, '([^\/]+)')
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted parameters.
    _extractParameters: function(route, fragment) {
      return route.exec(fragment).slice(1);
    }

  });

  return Router;

})(mvc.Events,
mvc.History = (function (Events, _) {

  var History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');
  };

  // Cached regex for cleaning leading hashes and slashes.
  var routeStripper = /^[#\/]/;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(windowOverride) {
      var loc = windowOverride ? windowOverride.location : window.location;
      var match = loc.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || forcePushState) {
          fragment = window.location.pathname;
          var search = window.location.search;
          if (search) fragment += search;
        } else {
          fragment = this.getHash();
        }
      }
      if (!fragment.indexOf(this.options.root)) fragment = fragment.substr(this.options.root.length);
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error('history has already been started');
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({}, {root: '/'}, this.options, options);
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && window.history && window.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      if (oldIE) {
        this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        $(window).bind('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        $(window).bind('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = window.location;
      var atRoot  = loc.pathname == this.options.root;

      // If we've started off with a route from a `pushState`-enabled browser,
      // but we're currently in a browser that doesn't support it...
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        window.location.replace(this.options.root + '#' + this.fragment);
        // Return immediately as browser will do redirect to new url
        return true;

      // Or if we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, '');
        window.history.replaceState({}, document.title, loc.protocol + '//' + loc.host + this.options.root + this.fragment);
      }

      if (!this.options.silent) {
        return this.loadUrl();
      }
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      $(window).unbind('popstate', this.checkUrl).unbind('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current == this.fragment && this.iframe) current = this.getFragment(this.getHash(this.iframe));
      if (current == this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl() || this.loadUrl(this.getHash());
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `silent: true` if you wish to have the
    // route callback not be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {};
      var frag = (fragment || '').replace(routeStripper, '');
      if (this.fragment == frag) return;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        if (frag.indexOf(this.options.root) != 0) frag = this.options.root + frag;
        this.fragment = frag;
        window.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, frag);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this.fragment = frag;
        this._updateHash(window.location, frag, options.replace);
        if (this.iframe && (frag != this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a history entry on hash-tag change.
          // When replace is true, we don't want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, frag, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        window.location.assign(this.options.root + fragment);
      }
      if (!options.silent) this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        location.replace(location.toString().replace(/(javascript:|#).*$/, '') + '#' + fragment);
      } else {
        location.hash = fragment;
      }
    }
  });

  return new History;

})(mvc.Events,
common),
common),
gimmebar.api = (function (_) {

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
        return false;
      }

      $.get(proxy + url, function(resp) {

        var data = JSON.parse(resp);

        // Update the total records if we can

        var total_records = data.total_records;
        if (total_records && gimmebar.total_records !== total_records) {
          gimmebar.total_records = data.total_records;
          gimmebar.total_pages = Math.floor(gimmebar.total_records / gimmebar.limit);
        }

        loaded.push(gimmebar.cursor);
        _callback(data);
        gimmebar.querying = false;

      });

      return true;

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
    this.offset = { x: grid.getPosition(2), y: 0 };
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
          // padding: 3 + 'px',
          background: '#d1d1d1'
        })
        .appendTo(this.domElement);

      if (model.href) {
        $elem.html('<a href="' + model.href + '"></a>');
      }

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
timeline.Minimap = (function (loader, grid, Clock, _) {

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
    this.clock = new Clock(20, 20);

    this.domElement.appendChild(this.viewport);
    this.domElement.appendChild(this.canvas);
    this.domElement.appendChild(this.loader.domElement);
    this.domElement.appendChild(this.clock.domElement);

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

    setOffset: function(x, y, scrollTop) {

      _.extend(this.domElement.style, {
        left: x + 'px',
        top: y + 'px'
      });

      this.clock.setTimeByPosition(scrollTop);

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
        var w = this.toWorldX(model.width);
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

    isVisible: function() {
      return !hidden;
    },

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
timeline.Clock = (function (svg, _, dateFormat) {

  var DAY = 86400,
    TWO_PI = Math.PI * 2.0;

  var delimeter = '&middot;';
  var timeouts = [];
  var colors = {
    day: {
      r: 252,
      g: 192,
      b: 151
    },
    night: {
      r: 201,
      g: 192,
      b: 255
    }
  };

  var Clock = function(width, height) {

    var _this = this;

    this.width = (width || 20);
    this.height = (height || 20);

    var dimensions = {
      width: this.width + 1,
      height: this.height + 1
    };

    this.domElement = document.createElement('div');
    this.container = svg.createElement('svg');
    this.circle = svg.createElement('circle');
    this.label = $('<p class="day" />');//.html('9&middot;2&middot;2012');

    this.container.appendChild(this.circle);
    this.domElement.appendChild(this.container);
    this.domElement.appendChild(this.label[0]);

    this.__fadeLabelOut = _.debounce(function() {
      _this.label.fadeOut();
    }, 2500);

    svg
      .addClass(this.domElement, 'clock')
      .setAttributes(this.container, dimensions)
      .setAttributes(this.circle, {
        fill: '#fff',
        cx: dimensions.width / 2,
        cy: dimensions.height / 2,
        r: this.width / 2
      });

  };

  _.extend(Clock.prototype, {

    changeDate: function(date) {

      var text = dateFormat(date, 'mm/dd/yy').replace(/\//g, '&middot;');
      var label = this.label.html(text);

    },

    getCurrentTime: function() {

      return this.time - (this.offset || 0);

    },

    setInitialTime: function(t) {

      this.time = t;
      this.day = 0;
      this.updateDisplay();

      return this;

    },

    setTimeByPosition: function(ypos) {

      // We know that ypos is in seconds.

      this.offset = ypos;
      this.updateDisplay();

      return this;

    },

    updateDisplay: function() {

      if (_.isUndefined(this.time)) {
        return this;
      }

      var time = this.getCurrentTime();
      var date = new Date(time * 1000);

      svg.setAttributes(this.circle, {
        fill: getColorFromTime(time % DAY)
      });

      var currentDay = date.toDateString();

      if (currentDay !== this.day) {
        this.day = currentDay;
        this.changeDate(date);
      }

      var label = this.label;
      if (label.css('display') == 'none') {
        label.stop().fadeIn(150);
      }

      this.__fadeLabelOut();

      return this;

    }

  });

  function getColorFromTime(t) {

    var normal = Math.sin((t / DAY) * TWO_PI);
    var c = lerpColors(normal);

    return 'rgb(' + c.r +',' + c.g +',' + c.b +')';

  }

  function lerpColors(t) {
    return {
      r: Math.floor(lerp(colors.day.r, colors.night.r, t)),
      g: Math.floor(lerp(colors.day.g, colors.night.g, t)),
      b: Math.floor(lerp(colors.day.b, colors.night.b, t))
    };
  }

  function lerp(a, b, t) {
    return (b - a) * t + a
  }

  return Clock;

})(svg.utils = (function (_) {
  return {

    svgns: 'http://www.w3.org/2000/svg',
    xlinkns: 'http://www.w3.org/1999/xlink',


    createElement: function(nodeType, attr) {
      var toReturn = document.createElementNS(this.svgns, nodeType);
      if (attr) {
        this.setAttributes(toReturn, attr);
      }
      return toReturn;
    },

    createImage: function(src) {
      var img = this.createElement('image');
      img.setAttributeNS(this.xlinkns, 'href', src);
      return img;
    },

    createUse: function(id) {
      var use = this.createElement('use');
      use.setAttributeNS(this.xlinkns, 'href', '#' + id);
      return use;
    },

    setClass: function(elem, className) {
      if (elem.getAttribute('class') !== className)
      elem.setAttribute('class', className);
    },

    addClass: function(elem, className) {
      var classString = elem.getAttribute('class');
      if (classString === null) {
        elem.setAttribute('class', className);
      } else if (classString !== className) {
        var classes = classString.split(/ +/);
        if (classes.indexOf(className) == -1) {
          classes.push(className);
          elem.setAttribute('class', classes.join(' '));
        }
      }
      return this;
    },

    bezierString: function(x1, y1, cx1, cy1, cx2, cy2, x2, y2) {
      return 'M' + x1.toFixed(10) + ',' + y1.toFixed(10) + ' C' +
          cx1.toFixed(10) + ',' + cy1.toFixed(10) + ' ' + cx2.toFixed(10) + ',' +
          cy2.toFixed(10) + ' ' + x2.toFixed(10) + ' ' + y2.toFixed(10);
    },

    removeClass: function(elem, className) {
      var classString = elem.getAttribute('class');
      if (classString === null) {
        return;
      } else if (classString === className) {
        elem.setAttribute('class', '');
      } else {
        var classes = classString.split(/ +/);
        var index = classes.indexOf(className);
        if (index != -1) {
          classes.splice(index, 1);
          elem.setAttribute('class', classes.join(' '));
        }
      }
      return this;
    },

    hasClass: function(elem, className) {
      var classString = elem.getAttribute('class');
      var patt = new RegExp(className);
      return patt.test(classString);
    },

    setAttributes: function(elem, attributeMap) {
      _.each(attributeMap, function(value, key) {
        elem.setAttribute(key, value);
      });
      _.extend(elem, attributeMap);
      return this;
    },

    setTransform: function() {
//      console.log(arguments);
      arguments[0].setAttribute('transform', this.transformString.apply(this, _.toArray(arguments).splice(1)));
    },

    transformString: function(commands) {
      if (_.isArray(commands)) {
        var s = [];
        _.each(_.toArray(arguments), function(command) {
          s.push(t(command[0], command.slice(1)));
        });
        return s.join(' ');
      } else {
        return t(arguments[0], _.toArray(arguments).slice(1));
      }

      function t(command, params) {
        return command + '(' + params.join(' ') + ')';
      }

    }

  };
})(common),
common,
dateFormat = (function () {

  var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
      timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
      timezoneClip = /[^-+\dA-Z]/g,
      pad = function (val, len) {
        val = String(val);
        len = len || 2;
        while (val.length < len) val = "0" + val;
        return val;
      };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
      var dF = dateFormat;

      // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
      if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
        mask = date;
        date = undefined;
      }

      // Passing date through Date applies Date.parse, if necessary
      date = date ? new Date(date) : new Date;
      if (isNaN(date)) throw SyntaxError("invalid date");

      mask = String(dF.masks[mask] || mask || dF.masks["default"]);

      // Allow setting the utc argument via the mask
      if (mask.slice(0, 4) == "UTC:") {
        mask = mask.slice(4);
        utc = true;
      }

      var _ = utc ? "getUTC" : "get",
        d = date[_ + "Date"](),
        D = date[_ + "Day"](),
        m = date[_ + "Month"](),
        y = date[_ + "FullYear"](),
        H = date[_ + "Hours"](),
        M = date[_ + "Minutes"](),
        s = date[_ + "Seconds"](),
        L = date[_ + "Milliseconds"](),
        o = utc ? 0 : date.getTimezoneOffset(),
        flags = {
          d:    d,
          dd:   pad(d),
          ddd:  dF.i18n.dayNames[D],
          dddd: dF.i18n.dayNames[D + 7],
          m:    m + 1,
          mm:   pad(m + 1),
          mmm:  dF.i18n.monthNames[m],
          mmmm: dF.i18n.monthNames[m + 12],
          yy:   String(y).slice(2),
          yyyy: y,
          h:    H % 12 || 12,
          hh:   pad(H % 12 || 12),
          H:    H,
          HH:   pad(H),
          M:    M,
          MM:   pad(M),
          s:    s,
          ss:   pad(s),
          l:    pad(L, 3),
          L:    pad(L > 99 ? Math.round(L / 10) : L),
          t:    H < 12 ? "a"  : "p",
          tt:   H < 12 ? "am" : "pm",
          T:    H < 12 ? "A"  : "P",
          TT:   H < 12 ? "AM" : "PM",
          Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
          o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
          S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
        };

      return mask.replace(token, function ($0) {
        return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
      });
    };
  }();

  // Some common format strings
  dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
  };

  // Internationalization strings
  dateFormat.i18n = {
    dayNames: [
      "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
  };

  return dateFormat;

})()),
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
      container.children[0].appendChild(image);

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

      var el = $document.find('[model=' + id +'] img')[0];

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

        label.add($image, $image.parent(), true);

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

})(mvc.Events,
common),
dom.grid,
dom.label = (function () {

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

})(),
common),
dom.grid,
common);

})();