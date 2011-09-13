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
  'jonobr1/ScrollMap',
  'backbone',
  'underscore',
  'jquery',
  'jonobr1/jquery.stalactite'
], function(Router, Collection, query, View, ScrollMap) {

  var more_rows = true, total_rows, limit = 50, skip = 0;
  var router, collection, views = [], scrollMap, $scroll;

  require.ready(function() {

    /**
     * Controller to handle the URLs.
     * 
     * main page : a feed of the firehose slug.
     * single : a page to display one item from the feed.
     * 
     */

    scrollMap = new ScrollMap(onDocumentScroll);
    $scroll = $('<p id="playhead" />')
      .css({
        position: 'fixed',
        top: 10,
        right: 10
      })
      .html('<span class="date" style="opacity: 0;"/>')
      .appendTo('#content');

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
        updateUI();
      }
    });

  }

  // Does not exist in Public API yet.
  function loadSingle(index) {
    // TODO: Get content and then fire this callbacks.
  }

  function addView(model) {

    // Figure out how to add in the right place???

    views.push(new View({
      model: model,
      id: model.cid,
      views: views,
      container: document.getElementById('content')
    }));
    model.trigger('change');
  }

  function updateUI() {

    $('.packet').stalactite();
    scrollMap.init();
    scrollMap.getScrollPosition();
  }

  function onDocumentScroll(e) {
    $scroll
      .css({
        // marginTop: (e.y * ($(window).height())) + 10
      })
      .stop().animate({ // TODO: Optimize
      }, function() {
        $(this).find('span')
        .animate({
          opacity: 1
        });
      })
      .find('span')
        .html(formatDate(e.y));
      
  }

  function formatDate(f) {

    var first = parseInt(collection.at(0).get('date'));
    var last = parseInt(collection.at(collection.length - 1).get('date'));

    var date = new Date(Math.floor(first - f * (first - last)) * 1000);

    var day = (date.getDate() >= 10) ? date.getDate() : '0' + date.getDate();
    var month = (date.getMonth() >= 10) ? date.getMonth() : '0' + date.getMonth();
    var year = date.getYear() - 100;
    var hour = (date.getHours() >= 10) ? date.getHours() : '0' + date.getHours();
    var minutes = (date.getMinutes() >= 10) ? date.getMinutes() : '0' + date.getMinutes();
    var seconds = (date.getSeconds() >= 10) ? date.getSeconds() : '0' + date.getSeconds();

    return year + '&middot;' + month + '&middot;' + day + '<br />'
      + hour + '\:' + minutes + '\:' + seconds;

  }

});