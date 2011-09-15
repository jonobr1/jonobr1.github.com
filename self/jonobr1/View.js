define([
  'underscore',
  'jquery',
  'backbone'
], function() {

  var THRESHOLD = 10;

  var View = Backbone.View.extend({

    tagName: 'div',

    initialize: function() {

      if (_.isUndefined(this.options.container)) {
        this.container = document.body;
      } else {
        this.container = this.options.container;
      }

      this.model.bind('change', this.render, this);
      this.views = this.options.views;
      this.distance = 0;
      this.className = 'post ' + this.model.get('tags').toString().replace(/\,/g, ' ');
      this.el.setAttribute('class', this.className);

      var index = this.model.collection.indexOf(this.model);
      var pindex;

      if (index <= 0 && this.model.collection.length > 1) {
        // We're going into the future.
        pindex = index + 1;
      } else {
        // We're going into the past.
        pindex = index - 1;
      }

      // This is done incorrectly.
      if (pindex >= 0) {
        var prev = this.model.collection.at(pindex);
        this.distance = Math.abs(timeDelta(this.model.get('date'), prev.get('date')));
        if (this.distance < THRESHOLD) {
          if (pindex > index) {
            this.packet = this.views[index].packet;
          } else {
            this.packet = this.views[pindex].packet;
          }
        }
      }

      if (_.isUndefined(this.packet)) {
          if (pindex > index) {
            this.packet = $('<div class="packet future" />')
              .css({
                position: 'relative',
                marginBottom: this.distance
              })
              .prependTo(this.container)[0];
          } else {
            this.packet = $('<div class="packet past" />')
              .css({
                position: 'relative',
                marginTop: this.distance
              })
              .appendTo(this.container)[0];
          }
      }

      if (pindex > index) {
        // We're going into the future.
        $(this.el).prependTo(this.packet);
      } else {
        // We're going into the past.
        $(this.el).appendTo(this.packet);
      }

      

    },

    render: function() {
      // TODO: Animate from width: 0 -> width: auto... somehow.
      $(this.el)
        .html(template(this.model.toJSON()));
      return this;
    }

  });

  function timeDelta(cur, ref) {
    // cur and ref are in seconds
    return Math.round((ref - cur) / 60);
  }

  function template(o) {

    switch(o.asset_type) {
      case 'image':
        var href = o.content.stash;
        if (!href) {
          href = o.content.full;
        }
        return '<a href="' + o.source + '" target="_blank"><img src="' + href + '" alt="' + o.title + '"/></a>';
        break;
      case 'embed':
        // return o.content.info.html;
        return '';
        break;
      case 'page':
        return '<a href="' + o.source + '" target="_blank"><img src="' + o.content.thumb + '" alt="' + o.title + '"/></a>';
        break;
      default:
        return '';
    }
  }

  return View;

});