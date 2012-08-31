define([
  'common'
], function(_) {

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

  return grid;

});
