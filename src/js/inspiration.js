require([
  'gimmebar/api',
  'timeline/Stage',
  'timeline/Minimap',
  'timeline/Gallery',
  'dom/grid',
  'common'
], function(gimmebar, Stage, Minimap, Gallery, grid, _) {

  var $window     = $(window);
  var $document   = $(document);
  var $navigation = $document.find('nav');
  var content     = $('#content')[0];

  var stage   = new Stage().appendTo(content);
  var minimap = new Minimap().appendTo(document.body);
  var gallery = new Gallery();

  stage.setGallery(gallery);
  minimap.setGallery(gallery).setStage(stage);
  gallery.setStage(stage);

  var threshold = {
    min: 0,
    max: 0
  };
  var scrollTop = 0;
  var windowHeight = $window.height();
  var navHeight = $navigation.outerHeight(true);
  var navOffset = $navigation.offset();
  var minimapOffset;

  gimmebar.getAssetsForUser('jonobr1', receiveData);

  $window.resize(function() {

    windowHeight = $window.height();
    navOffset = $navigation.offset();
    minimapOffset = Math.max(navHeight - scrollTop, minimap.gutter);

    minimap
      .setOffset(navOffset.left, minimapOffset)
      .setHeight(windowHeight - minimapOffset - minimap.gutter);

  }).trigger('resize');

  /**
   * Place all events considered for triggering once scrolling has finished.
   */
  var onScrollEnd = _.debounce(function() {

    stage.update(scrollTop - navHeight, windowHeight);

  }, 750);

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

    minimapOffset = Math.max(navHeight - scrollTop, minimap.gutter);
    minimap
      .setOffset(navOffset.left, minimapOffset)
      .setHeight(windowHeight - minimapOffset - minimap.gutter)
      .updateViewport(scrollTop - navHeight, windowHeight);

    onScrollEnd();

  });

  function next() {
    if (gimmebar.querying || (gimmebar.cursor === gimmebar.total_pages && gimmebar.total_pages !== 0)) {
      return;
    }
    minimap.loader.show();
    gimmebar.cursor++;
    gimmebar.getAssetsForUser('jonobr1', receiveData);
  }

  function previous() {
    if (gimmebar.querying || gimmebar.cursor === 0 || _.indexOf(gimmebar.loaded, 0) >= 0) {
      return;
    }
    minimap.loader.show();
    gimmebar.cursor--;
    gimmebar.getAssetsForUser('jonobr1', receiveData);
  }

  function receiveData(resp) {

    _.each(resp.records, function(record) {

      switch (record.asset_type) {

        case 'image':

          var image_data = record.content.resized_images;
          var stash = image_data.stash;
          var display = image_data.display;

          var stashHas = stash && _.isObject(stash.dims);
          var displayHas = display && _.isObject(display.dims);

          var width = stashHas ? stash.dims.w : displayHas ? display.dims.w : 0;
          var height = stashHas ? stash.dims.h : displayHas ? display.dims.h : 0;

          var dimensions = grid.snapWidth(parseInt(width), parseInt(height));

          var model = gallery.add({
            url: image_data.full,
            date: record.date,
            width: dimensions.x,
            height: dimensions.y
          });

          stage.place(model);

          break;

      }

    });

    updateDisplay();
    minimap.loader.hide();

  }

  function updateDisplay() {

    var height = $document.height();

    threshold.max = height * 0.9;
    threshold.min = height * 0.1;

    if (height <= windowHeight) {
      next();
      return;
    }

    var offsetScroll = scrollTop - navHeight;

    stage.update(offsetScroll, windowHeight);
    minimap.updateDisplay(offsetScroll, windowHeight);

  }

});
