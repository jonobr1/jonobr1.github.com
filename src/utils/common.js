define([
], function() {

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

});
