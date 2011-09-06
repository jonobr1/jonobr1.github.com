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

      this.distance = timeDeltaToPixels(this.model.get('date'), this.model.collection.models[0].get('date'));

      $(this.el)
        .css({
          position: 'absolute',
          marginTop: this.distance
        });

    },

    render: function() {
      // Fade In content
      $(this.el).html(template(this.model.toJSON()));
      return this;
    }

  });

  function timeDeltaToPixels(cur, ref) {
    return Math.round((ref - cur));
  }

  function template(o) {
    return '<a href="' + o.source + '" target="_blank"><img src="' + o.content.display + '" alt="' + o.title + '"/></a>';
  }

  return View;

});