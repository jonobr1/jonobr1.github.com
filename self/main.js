require({
  "jQuery": false, 
  "paths": {
    "jquery": "/third-party/jquery.min",
    "backbone": "/third-party/backbone/backbone",
    "text": "/third-party/requirejs/text",
    "underscore": "/third-party/underscore/underscore-min",
    "order": "/third-party/requirejs/order"
  }, 
  "baseUrl": "/self", 
  "priority": ["jquery", "underscore"]
});

require([
  'jonobr1/Router',
  'jonobr1/query',
  'backbone',
  'underscore',
  'jquery'
], function(Router, query) {

  var router;

  require.ready(function() {

    /**
     * Controller to handle the URLs.
     * 
     * main page : a feed of the firehose slug.
     * single : a page to display one item from the feed.
     * 
     */

     router = new Router()
      .bind('route:page', loadFeed)
      .bind('route:single', loadSingle)
      .init();

  });

  function loadFeed(index) {

    var limit = 10;
    var skip = limit * index;

    query({

      limit: limit,
      skip: skip,
      callback: function(data) {
        // TODO: Organize data to be viewed using Backbone.View
      }
    });
  }

  // Does not exist in Public API yet.
  function loadSingle(index) {

    // TODO: Get content and then fire this callbacks.
    onDocumentReady();
  }

  function onDocumentReady() {

    // Equivalent to jQuery's $(function() {}); Data's ready and everything.

  }

});