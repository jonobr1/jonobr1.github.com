define([
  'underscore',
  'jquery',
  'backbone'
], function() {

  var View = Backbone.View.extend({

    tagName: 'div',

    initialize: function() {

      if (!this.container) {
        this.container = document.body;
      }

      this.model.bind('change', this.render, this);

      this.className = 'post ' + this.model.get('tags').toString().replace(/\,/g, ' ');
      this.el.setAttribute('class', this.className);
      this.container.appendChild(this.el);

      // console.log(this.model);

      var prev = _.indexOf(this.model.collection.models, this.model) - 1;

      if (prev >= 0) {
        prev = this.model.collection.at(prev);
        this.distance = timeDeltaToPixels(this.model.get('date'), prev.get('date'));
      } else {
        this.distance = 0;
      }

      $(this.el)
        .css({
          position: 'relative',
          marginTop: this.distance
        });

    },

    render: function() {
      // TODO: Fade In content
      $(this.el).html(template(this.model.toJSON()));
      return this;
    }

  });

  function timeDeltaToPixels(cur, ref) {
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