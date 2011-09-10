define([
  'underscore',
  'jquery',
  'backbone'
], function() {

  var THRESHOLD = 3;

  var View = Backbone.View.extend({

    tagName: 'div',

    initialize: function() {

      if (!this.container) {
        this.container = document.body;
      }

      this.model.bind('change', this.render, this);
      this.views = this.options.views;
      this.className = 'post ' + this.model.get('tags').toString().replace(/\,/g, ' ');
      this.el.setAttribute('class', this.className);

      var prevIndex = _.indexOf(this.model.collection.models, this.model) - 1;
      var prev;

      // TODO: CLEAN UP!!!
      if (prevIndex >= 0) {
        prev = this.model.collection.at(prevIndex);
        this.distance = timeDelta(this.model.get('date'), prev.get('date'));
        if (this.distance < THRESHOLD) {
          this.packet = this.views[prevIndex].packet;
        } else {
          this.packet = $('<div class="packet" />')
            .css({
              position: 'relative',
              marginTop: this.distance
            })
            .appendTo(this.container)[0];
        }
      } else {
        this.distance = 0;
        this.packet = $('<div class="packet" />') // TODO: ABSTRACT
          .appendTo(this.container)[0];
      }

      $(this.el).appendTo(this.packet);

    },

    render: function() {
      // TODO: Fade In content
      $(this.el).html(template(this.model.toJSON()));
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