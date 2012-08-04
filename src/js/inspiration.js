require([
  'gimmebar/api',
  'timeline/Stage',
  'timeline/Minimap',
  'underscore'
], function(gimmebar, Stage, Minimap) {

  var $window = $(window);
  var $document = $(document);
  var $navigation = $document.find('nav');
  var content = $('#content')[0];

  var stage = new Stage().appendTo(content);
  var minimap = new Minimap().appendTo(document.body);

  var threshold = {
    min: 0,
    max: 0
  };
  var scrollTop = 0;
  var windowHeight = $window.height();
  var navHeight = $navigation.outerHeight(true);

  gimmebar.getAssetsForUser('jonobr1', receiveData);

  $window.resize(function() {

    windowHeight = $window.height();
    var navOffset = $navigation.offset();

    minimap
      .setOffset(navOffset.left, navHeight)
      .setHeight(windowHeight - navHeight - minimap.gutter);

  }).trigger('resize');

  $document.scroll(function() {

    var st = $document.scrollTop();

    if (scrollTop < st) {
      // Scrolling down
      if (st + windowHeight > threshold.max) {
        next();
      }
    } else if (scrollTop > st) {
      // Scrolling up
      if (st < threshold.min) {
        previous();
      }
    }

    scrollTop = st;

  });

  function next() {
    if (gimmebar.querying || (gimmebar.cursor === gimmebar.total_pages && gimmebar.total_pages !== 0)) {
      return;
    }
    gimmebar.cursor++;
    gimmebar.getAssetsForUser('jonobr1', receiveData);
  }

  function previous() {
    if (gimmebar.querying || gimmebar.cursor === 0) {
      return;
    }
    gimmebar.cursor--;
    gimmebar.getAssetsForUser('jonobr1', receiveData);
  }

  function receiveData(resp) {
    _.each(resp.records, function(record) {
      if (asset.type === 'image') {
        var image = document.createElement('img');
        $(image).css('opacity', 0.0).load(function() {
          $(this).fadeIn();
        });
        image.url = record.source;
        stage.place(record.date, image);
      }
    });
    updateDisplay();
  }

  function updateDisplay() {

    var height = $document.height();

    threshold.max = height * 0.9;
    threshold.min = height * 0.1;

    if (height <= windowHeight) {
      next();
    }

  }

});
