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
  'jonobr1/Collection',
  'jonobr1/query',
  'jonobr1/View',
  'backbone',
  'underscore',
  'jquery'
], function(Router, Collection, query, View) {

  var more_rows = true, total_rows, limit = 50, skip = 0;
  var router, collection, views = [];

  require.ready(function() {

    /**
     * Controller to handle the URLs.
     * 
     * main page : a feed of the firehose slug.
     * single : a page to display one item from the feed.
     * 
     */

    collection = new Collection()
      .bind('add', addView);

     router = new Router()
      .bind('route:page', loadFeed)
      .bind('route:single', loadSingle)
      .init();

  });

  function loadFeed(index) {

    skip = limit * (index - 1);

    query({
      limit: limit,
      skip: skip,
      callback: function(data) {
        collection.add(data.records);
        more_rows = data.more_rows;
        total_rows = data.total_rows;
      }
    });

  }

  // Does not exist in Public API yet.
  function loadSingle(index) {
    // TODO: Get content and then fire this callbacks.
  }

  function addView(model) {
    views.push(new View({
      model: model,
      id: model.cid,
      views: views
    }));
    model.trigger('change');
  }

});