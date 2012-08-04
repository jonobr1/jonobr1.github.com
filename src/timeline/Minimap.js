define([
  'underscore'
], function() {

  var Minimap = function() {

    this.width = 138;
    this.gutter = 12;

    this.domElement = document.createElement('div');
    this.stage = document.createElement('canvas');

    _.extend(this.domElement.style, {
      position: 'fixed',
      background: 'rgba(0,0,0,0.125)'
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

    setOffset: function(x, y) {

      _.extend(this.domElement.style, {
        left: x + 'px',
        top: y + 'px'
      });

      return this;

    },

    setHeight: function(height) {

      _.extend(this.domElement.style, {
        width: this.width + 'px',
        height: height + 'px'
      });

      return this;

    }

  });

  return Minimap;

});
