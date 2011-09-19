define([
  'jquery',
  'underscore',
  'backbone'
], function() {

  var indexed = false;
  /**
   * Routes all URL bindings for site.
   * 
   * main page : a feed of the firehose slug.
   * single : a page to display one item from the feed.
   * 
   * @class
   */
  var Router = Backbone.Router.extend({

    initialize: function() {

      this.route('page/:page', 'page', onRouted);
      this.route('single/:slug', 'single', onRouted);

    },

    init: function() {

      Backbone.history.start({ pushState: true });

      if (!indexed) {
        this.navigate('page/1', true);
      }

      return this;
    }

  });

  function onRouted(e) {
    indexed = true;
  }

  return Router;

});