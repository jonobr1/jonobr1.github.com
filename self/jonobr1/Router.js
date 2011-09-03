define([
  'jquery',
  'underscore',
  'backbone'
], function() {

  var indexed = false;

  /**
   * Routes all URL bindings for site.
   * @class
   */
  var Router = Backbone.Router.extend({

    initialize: function() {

      this.route('page/:page', 'page', _.identity);
      this.route('single/:slug', 'single', _.identity);

    },

    init: function() {

      Backbone.history.start({ pushState: true });

      if (!indexed) {
        this.navigate('page/1', true);
      }
    }

  });

  function onRouted(e) {
    indexed = true;
  }

  return Router;

});