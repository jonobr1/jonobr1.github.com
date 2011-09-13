define([
  'underscore',
  'jquery',
  'backbone'
], function() {

  var THRESHOLD = 5;

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
        // We're going backwards in time.
        pindex = index + 1;
      } else {
        // We're going forwards in time.
        pindex = index - 1;
      }

      if (pindex >= 0) {
        var prev = this.model.collection.at(pindex);
        this.distance = timeDelta(this.model.get('date'), prev.get('date'));
        if (this.distance < THRESHOLD) {
          this.packet = this.views[pindex].packet;
        }
      }

      if (_.isUndefined(this.packet)) {
        this.packet = $('<div class="packet" />')
          .css({
            position: 'relative',
            marginTop: this.distance
          })
          .appendTo(this.container)[0];
      }

      $(this.el).appendTo(this.packet);

    },

    render: function() {
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
        return o.content.info.html;
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