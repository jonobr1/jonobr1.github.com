define([
  'common'
], function(_) {
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
});
