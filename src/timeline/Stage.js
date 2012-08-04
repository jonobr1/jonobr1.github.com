define([
  'underscore'
], function() {

  var Stage = function() {

    this.birthday = Date.now() / 1000;
    this.domElement = document.createElement('div');
    this.$el = $(this.domElement);

    this.range = {
      min: 0,
      max: 0
    };

    _.extend(this.domElement.style, {
      position: 'relative'
    });

  };

  _.extend(Stage, {

    Id: 's-'

  });

  _.extend(Stage.prototype, {

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

    place: function(time, content) {

      var id = Stage.Id + time;
      var selector = '#' + id;
      var elem = this.$el.find(selector);

      if (_.isElement(elem)) {
        return elem;
      }

      var offset = calculateOffset.call(this, time);

      var $elem = $('<div />')
        .attr('id', id)
        .addClass('moment')
        .css({
          position: 'absolute',
          top: offset.top,
          left: offset.left,
          padding: 6 + 'px',
          background: 'rgba(0,0,0,0.121569)'
        })
        .appendTo(this.domElement);

      if (_.isElement(content)) {
        $elem.append(content);
      }

      this.updateDisplay();

      return $elem[0];

    },

    updateDisplay: function() {

      _.extend(this.domElement.style, {
        marginTop: - this.range.min + 'px',
        height: this.range.max + 'px'
      });

    }

  });

  function calculateOffset(time) {

    var x = 150;
    var y = Math.round((this.birthday - time) / 10);

    if (y > this.range.max) {
      this.range.max = y;
    }

    if (y < this.range.min || this.range.min === 0) {
      this.range.min = y;
    }

    return {
      left: x + 'px',
      top: y + 'px'
    };

  }

  return Stage;

});
