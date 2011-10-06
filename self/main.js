require({
  "jQuery": false, 
  "paths": {
    "jquery": "/third-party/jquery.min",
    "backbone": "/third-party/backbone/backbone",
    "text": "/third-party/require/text",
    "underscore": "/third-party/underscore/underscore-min",
    "order": "/third-party/require/order",
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

  var more_rows = true, total_rows, limit = 1, skip = 0;
  var router, collection, scrollMap, $scroll, $win;
  var page = 0, currentViews = [], existingPages = [], querying = false;
  var queueUI = _.identity;

  require.ready(function() {

    var lazyResize = _.debounce(onWindowResize, 350);
    $win = $(window).resize(lazyResize);

    // Set size of document
    $('body')
      .width($win.width() - 25);

    scrollMap = new ScrollMap(onDocumentScroll);
    $scroll = $('<p id="playhead" />')
      .css({
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 500,
        opacity: 0,
        fontSize: $win.height() / 3.0 - 10,
        lineHeight: '100%'
      })
      .html('<span class="date" />')
      .appendTo('body');

    $scroll.find('span').css({
      position: 'relative',
      zIndex: 9999
    })

    collection = new Collection()
      .bind('add', addView);

     router = new Router()
      .bind('route:case', loadFeed)
      .bind('route:single', loadSingle)
      .init();

  });

  function onWindowResize() {

    $scroll
      .css({
        left: ($win.width() - $scroll.outerWidth()) / 2,
        top: ($win.height() - $scroll.outerHeight()) / 2
      });

  }

  function next(e) {

    e.preventDefault();
    $(this)
      .unbind('click')
      .animate({ opacity: 0 }, function() {
        loadFeed(parseInt(page) + 1);
      });
  }

  function prev(e) {

    e.preventDefault();
    $(this)
      .unbind('click')
      .animate({ opacity: 0 }, function() {
        loadFeed(parseInt(page) - 1, true);
      });
  }

  function loadFeed(index, direction) {

    if (_.include(existingPages, index)) {
      if (direction) {
        loadFeed(index - 1, true);
      } else {
        loadFeed(index + 1);
      }
    } else {

      if (index <= 0) {
        return false;
      }

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
    router.navigate('case/' + page);
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
      fluid: false,
      cssSelector: '.image-loaded',
      cssPrep: false,
      complete: function() {
        $('#next').click(next).fadeIn();
        $('#prev').click(prev).fadeIn();
      }
    });
    scrollMap.init();
    scrollMap.getScrollPosition();
  }

  function onDocumentScroll(e) {
    $scroll
      .find('span')
        .html(formatDate(e.y));

    if ($scroll.css('opacity') < 1) {
      _.delay(function() {
        $scroll.animate({ opacity: 1.0 });
        onWindowResize();
      }, 1000);
    }
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

    return day + '\/' + month + '\/' + year + '<br />'
      + hour + '\:' + minutes + '\:' + seconds;

  }

});