require({
  "jQuery": false, 
  "paths": {
    "jquery": "/third-party/jquery.min",
    "backbone": "/third-party/backbone/backbone",
    "text": "/third-party/requirejs/text",
    "underscore": "/third-party/underscore/underscore-min",
    "order": "/third-party/requirejs/order",
    "enhance.animate": "/third-party/animate.enhanced/jquery.animate-enhanced.min"
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
  'enhance.animate',
  'jonobr1/jquery.stalactite'
], function(Router, Collection, query, View, ScrollMap) {

  // Figure out why page 5 is exceptionally slow in all browsers.
  // In general speed things up! Has something to do with the view.

  var more_rows = true, total_rows, limit = 5, skip = 0;
  var router, collection, scrollMap, $scroll;
  var page = 0, currentViews = [], existingPages = [], querying = false;
  var queueUI = _.identity;

  require.ready(function() {

    scrollMap = new ScrollMap(onDocumentScroll);
    $scroll = $('<p id="playhead" />')
      .css({
        position: 'fixed',
        top: 10,
        right: 10
      })
      .html('<span class="date" style="opacity: 0;"/>')
      .appendTo('body');

    collection = new Collection()
      .bind('add', addView);

     router = new Router()
      .bind('route:page', loadFeed)
      .bind('route:single', loadSingle)
      .init();

  });

  function next(e) {
    e.preventDefault();
    loadFeed(parseInt(page) + 1);
    $(this).unbind('click');
  }

  function prev(e) {
    e.preventDefault();
    loadFeed(parseInt(page) - 1, true);
    $(this).unbind('click');
  }

  function loadFeed(index, direction) {

    if (_.include(existingPages, index)) {
      if (direction) {
        loadFeed(index - 1, true);
      } else {
        loadFeed(index + 1);
      }
    } else {

      if (!querying) {

        querying = true;

        page = index;
        skip = limit * (index - 1);

        query({
          limit: limit,
          skip: skip,
          callback: function(data) {
            querying = false;
            loadContent(data, direction)
          }
        });

      }

    }

  }

  function loadContent(data, backwards) {
    router.navigate('page/' + page);
    existingPages.push(parseInt(page));
    currentViews.splice(0, currentViews.length);
    if (backwards) {
      data.records.reverse(); 
    }
    queueUI = _.after(data.records.length, updateUI);
    _.each(data.records, function(record) {
      collection.add(record);
    });
    more_rows = data.more_rows;
    total_rows = data.total_rows;
    $('#next').click(next);
    $('#prev').click(prev);
  }

  // Does not exist in Public API yet.
  function loadSingle(index) {
    // TODO: Get content and then fire this callbacks.
  }

  function addView(model) {
    currentViews.push(new View({
      model: model,
      id: model.cid,
      container: $('#content')[0],
      complete: queueUI
    }));
    model.trigger('change');
  }

  function updateUI() {
    queueUI = _.identity;
    var packets = _.union(_.map(currentViews, function(view) {
      return view.packet;
    }));
    $(packets).stalactite({
      cssSelector: '.image-loaded',
      cssPrep: false
    });
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
    var month = (date.getMonth() + 1 >= 10) ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
    var year = date.getYear() - 100;
    var hour = (date.getHours() >= 10) ? date.getHours() : '0' + date.getHours();
    var minutes = (date.getMinutes() >= 10) ? date.getMinutes() : '0' + date.getMinutes();
    var seconds = (date.getSeconds() >= 10) ? date.getSeconds() : '0' + date.getSeconds();

    return day + '&middot;' + month + '&middot;' + year + '<br />'
      + hour + '\:' + minutes + '\:' + seconds;

  }

});