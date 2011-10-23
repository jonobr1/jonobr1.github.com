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
  'jonobr1/goog.webfont',
  'backbone',
  'underscore',
  'jquery',
  'enhance.animate',
  'jonobr1/jquery.stalactite'
], function(Router, Collection, query, View, ScrollMap, GoogleWebFont) {

  // In general speed things up! Has something to do with the view.
  // TODO: Make touch events work !!

  var more_rows = true, total_rows, limit = 1, skip = 0;
  var router, collection, scrollMap, $scroll, $win;
  var page = 0, currentViews = [], existingPages = [], querying = false;
  var queueUI = _.identity, total_gimmes = 0, loader, fontLoaded = false;
  var lazyResize, $date, initializeScene;

  require.ready(function() {

    loader = $('')[0];

    // width x height ratio of Lato
    var ratio = .7;

    scrollMap = new ScrollMap(onDocumentScroll);
    $scroll = $('<p id="playhead" />')
      .css({
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 500,
        opacity: 0,
        lineHeight: '100%'
      })
      .html('<span class="date" />')
      .appendTo('body');

    $date = $scroll.find('span').css({
      position: 'relative',
      zIndex: 9999
    })

    lazyResize = _.debounce(function() {
        $scroll.css({
          opacity: 1.0
        });
      }, 700);

    $win = $(window)
      .resize(function() {
        $scroll.css('opacity', 0.0);
        onWindowResized.apply(this, arguments);
      });
    var gwf = new GoogleWebFont('Lato:100', function() {
      fontLoaded = true;
      $win.trigger('resize');
    });

    initializeScene = _.once(function() {
      scrollMap.init();
      if (new RegExp(total_gimmes.toString()).test(window.location)) {
        $('#prev a').addClass('unselect').html('x');
      } else if (new RegExp('1').test(window.location)) {
        $('#next a').addClass('unselect').html('x');
      }
      var css = {
        position: 'relative',
        zIndex: '9999'
      }
      $('#next a').animate({ opacity: 1.0 }).click(next);
      $('#prev a').animate({ opacity: 1.0 }).click(prev);
      $win.trigger('resize');
    })

    // Solidify size of document
    $('body')
      .width($win.width() - 25);

    collection = new Collection()
      .bind('add', addView);

     router = new Router()
      .bind('route:case', loadFeed)
      .bind('route:single', loadSingle)
      .init();

  });

  function onWindowResized() {

    if (fontLoaded && $date.html() !== '') {

      var ratio = .7;
      var fontSize = ($win.width() < $win.height()) ?
        ($win.width() * ratio / 3.0 - 10) : ($win.height() / 3.0 - 10);

      $scroll.css('font-size', fontSize);

      _.defer(function() {
        var x = ($win.width() - $scroll.outerWidth()) / 2;
        var y = ($win.height() - $scroll.outerHeight()) / 2;
        $scroll.css({
          left: x,
          top: y
        });
      });

      lazyResize.apply(this, arguments);

    }
  }

  function next(e) {

    e.preventDefault();
    if (!querying) {
      var $a = $(this)
        .addClass('unselect')
        .html('<img src="data:image/gif;base64, R0lGODlhEAAQAPQAAP///zMzM/n5+V9fX5ycnDc3N1FRUd7e3rm5uURERJGRkYSEhOnp6aysrNHR0WxsbHd3dwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAAFUCAgjmRpnqUwFGwhKoRgqq2YFMaRGjWA8AbZiIBbjQQ8AmmFUJEQhQGJhaKOrCksgEla+KIkYvC6SJKQOISoNSYdeIk1ayA8ExTyeR3F749CACH5BAkKAAAALAAAAAAQABAAAAVoICCKR9KMaCoaxeCoqEAkRX3AwMHWxQIIjJSAZWgUEgzBwCBAEQpMwIDwY1FHgwJCtOW2UDWYIDyqNVVkUbYr6CK+o2eUMKgWrqKhj0FrEM8jQQALPFA3MAc8CQSAMA5ZBjgqDQmHIyEAIfkECQoAAAAsAAAAABAAEAAABWAgII4j85Ao2hRIKgrEUBQJLaSHMe8zgQo6Q8sxS7RIhILhBkgumCTZsXkACBC+0cwF2GoLLoFXREDcDlkAojBICRaFLDCOQtQKjmsQSubtDFU/NXcDBHwkaw1cKQ8MiyEAIfkECQoAAAAsAAAAABAAEAAABVIgII5kaZ6AIJQCMRTFQKiDQx4GrBfGa4uCnAEhQuRgPwCBtwK+kCNFgjh6QlFYgGO7baJ2CxIioSDpwqNggWCGDVVGphly3BkOpXDrKfNm/4AhACH5BAkKAAAALAAAAAAQABAAAAVgICCOZGmeqEAMRTEQwskYbV0Yx7kYSIzQhtgoBxCKBDQCIOcoLBimRiFhSABYU5gIgW01pLUBYkRItAYAqrlhYiwKjiWAcDMWY8QjsCf4DewiBzQ2N1AmKlgvgCiMjSQhACH5BAkKAAAALAAAAAAQABAAAAVfICCOZGmeqEgUxUAIpkA0AMKyxkEiSZEIsJqhYAg+boUFSTAkiBiNHks3sg1ILAfBiS10gyqCg0UaFBCkwy3RYKiIYMAC+RAxiQgYsJdAjw5DN2gILzEEZgVcKYuMJiEAOwAAAAAAAAAAAA==" />');
        loadFeed(parseInt(total_gimmes - page) - 1, false, function(error) {
          if (error) {
            $a
              .html('x');
          } else {
            $a
              .removeClass('unselect')
              .html('&#8595;');
          }
        });
    }
  }

  function prev(e) {

    e.preventDefault();
    if (!querying) {
      var $a = $(this)
        .addClass('unselect')
        .html('<img src="data:image/gif;base64, R0lGODlhEAAQAPQAAP///zMzM/n5+V9fX5ycnDc3N1FRUd7e3rm5uURERJGRkYSEhOnp6aysrNHR0WxsbHd3dwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAAFUCAgjmRpnqUwFGwhKoRgqq2YFMaRGjWA8AbZiIBbjQQ8AmmFUJEQhQGJhaKOrCksgEla+KIkYvC6SJKQOISoNSYdeIk1ayA8ExTyeR3F749CACH5BAkKAAAALAAAAAAQABAAAAVoICCKR9KMaCoaxeCoqEAkRX3AwMHWxQIIjJSAZWgUEgzBwCBAEQpMwIDwY1FHgwJCtOW2UDWYIDyqNVVkUbYr6CK+o2eUMKgWrqKhj0FrEM8jQQALPFA3MAc8CQSAMA5ZBjgqDQmHIyEAIfkECQoAAAAsAAAAABAAEAAABWAgII4j85Ao2hRIKgrEUBQJLaSHMe8zgQo6Q8sxS7RIhILhBkgumCTZsXkACBC+0cwF2GoLLoFXREDcDlkAojBICRaFLDCOQtQKjmsQSubtDFU/NXcDBHwkaw1cKQ8MiyEAIfkECQoAAAAsAAAAABAAEAAABVIgII5kaZ6AIJQCMRTFQKiDQx4GrBfGa4uCnAEhQuRgPwCBtwK+kCNFgjh6QlFYgGO7baJ2CxIioSDpwqNggWCGDVVGphly3BkOpXDrKfNm/4AhACH5BAkKAAAALAAAAAAQABAAAAVgICCOZGmeqEAMRTEQwskYbV0Yx7kYSIzQhtgoBxCKBDQCIOcoLBimRiFhSABYU5gIgW01pLUBYkRItAYAqrlhYiwKjiWAcDMWY8QjsCf4DewiBzQ2N1AmKlgvgCiMjSQhACH5BAkKAAAALAAAAAAQABAAAAVfICCOZGmeqEgUxUAIpkA0AMKyxkEiSZEIsJqhYAg+boUFSTAkiBiNHks3sg1ILAfBiS10gyqCg0UaFBCkwy3RYKiIYMAC+RAxiQgYsJdAjw5DN2gILzEEZgVcKYuMJiEAOwAAAAAAAAAAAA==" />');
        loadFeed(parseInt(total_gimmes - page) + 1, true, function(error) {
          if (error) {
            $a
              .html('x');
          } else {
            $a
              .removeClass('unselect')
              .html('&#8593;');
          }
        });
    }
  }

  function loadFeed(index, direction, onFinishExec) {

    // Really round about but I guess it works :\
    if (total_gimmes <= 0) {
      querying = true;
      query({
        limit: 0,
        skip: 0,
        callback: function(data) {
          querying = false;
          if (_.isNumber(data.total_records)) {
            total_gimmes = data.total_records;
            loadFeed(index || total_gimmes, direction);
          }
        }
      });
      return false;
    }

    if (_.include(existingPages, total_gimmes - index)) {
      if (direction) {
        loadFeed(index + 1, true, onFinishExec);
      } else {
        loadFeed(index - 1, false, onFinishExec);
      }
    } else {

      if (index <= 0 || index > total_gimmes) {
        onFinishExec.call(this, true);
        return false;
      }

      if (!querying) {

        querying = true;

        page = total_gimmes - index;
        skip = limit * page;

        query({
          limit: limit,
          skip: skip,
          callback: function(data) {
            querying = false;
            loadContent(data, direction, index, onFinishExec)
          }
        });

      }

    }

  }

  function loadContent(data, backwards, index, onFinishExec) {
    router.navigate('case/' + index);
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
    if (_.isFunction(onFinishExec)) {
      onFinishExec.call(this);
    }
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
      loader: '',
      cssPrep: false,
      complete: function() {
        initializeScene();
        scrollMap.getScrollPosition();
      }
    });
  }

  function onDocumentScroll(e) {
    $date
      .html(formatDate(e.y)); // Doesn't work in FF
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