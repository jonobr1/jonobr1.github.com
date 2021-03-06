require([
  'mvc/Router',
  'gimmebar/api',
  'timeline/Stage',
  'timeline/Minimap',
  'timeline/Gallery',
  'dom/grid',
  'common'
], function(Router, gimmebar, Stage, Minimap, Gallery, grid, _) {

  var $window     = $(window);
  var $document   = $(document);
  var $navigation = $document.find('nav');
  var content     = $('#content')[0];

  var stage   = new Stage().appendTo(content);
  var minimap = new Minimap().appendTo(document.body);
  var gallery = new Gallery();

  var router = new Router();
  var loading = false;

  router.route('page/:page', 'page', getContent);

  stage.setGallery(gallery);
  minimap.setGallery(gallery).setStage(stage);
  gallery.setStage(stage);

  var threshold = {
    min: 0,
    max: 0
  };
  var scrollTop = 0;
  var scrollLeft = 0;
  var windowHeight = $window.height();
  var navHeight = $navigation.outerHeight(true);
  var navOffset = $navigation.offset();
  var minimapOffset;

  var initialize = _.once(function() {

    minimap.clock.setInitialTime(gallery.models[0].date);

  });

  $window.resize(function() {

    windowHeight = $window.height();
    navOffset = $navigation.offset();
    minimapOffset = Math.max(navHeight - scrollTop, minimap.gutter);
    var stageOffset = $(stage.domElement).offset().top;

    minimap
      .setOffset(navOffset.left + 32 - scrollLeft, minimapOffset, scrollTop - stageOffset)
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
    var sh = $document.scrollLeft();
    var stageOffset = $(stage.domElement).offset().top;

    if (scrollTop < st) {
      // Scrolling down
      if (st + windowHeight > threshold.max) {
        next();
      }
    } else if (scrollTop > st) {
      // Scrolling up
      if (st < threshold.min) {
        // previous();
      }
    }

    // Account for horizontal scrolling

    scrollLeft = sh;
    scrollTop = st;

    minimapOffset = Math.max(navHeight - scrollTop, minimap.gutter);
    minimap
      .setOffset(navOffset.left + 32 - scrollLeft, minimapOffset, scrollTop - stageOffset)
      .setHeight(windowHeight - minimapOffset - minimap.gutter)
      .updateViewport(scrollTop - navHeight, windowHeight);

    onScrollEnd();

  });

  /**
   * setup the page
   */

  gimmebar.getAssetsForUser('jonobr1', function(resp) {

    gimmebar.total_pages = Math.floor(resp.total_records / gimmebar.limit);

    var routeExists = Router.history.start({
      root: '/inspiration/' // Only for deving locally
    });

    if (!routeExists) {
      loading = true;
      router.navigate('#/page/' + (gimmebar.total_pages - gimmebar.cursor));
    }

  }, true);

  function next() {
    if (loading || (gimmebar.cursor === gimmebar.total_pages && gimmebar.total_pages !== 0)) {
      return;
    }
    loading = true;
    gimmebar.cursor = Math.min(parseInt(gimmebar.cursor) + 1, gimmebar.total_pages);
    router.navigate('#/page/' + (gimmebar.total_pages - gimmebar.cursor));
  }

  function previous() {
    return;
    if (loading || gimmebar.cursor === 0 || _.indexOf(gimmebar.loaded, 0) >= 0) {
      return;
    }
    loading = true;
    gimmebar.cursor = Math.max(parseInt(gimmebar.cursor) - 1, 0);
    router.navigate('#/page/' + (gimmebar.total_pages - gimmebar.cursor));
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

          if (width === 0 && record.content && record.content.dimensions) {
            width = record.content.dimensions.w;
          }

          if (height === 0 && record.content && record.content.dimensions) {
            height = record.content.dimensions.h;
          }

          var dimensions = grid.snapWidth(parseInt(width / 2), parseInt(height / 2));

          var model = gallery.add({
            url: image_data.full,
            date: record.date,
            width: dimensions.x,
            height: dimensions.y,
            title: record.title,
            href: record.source
          });

          for (var i = 0, l = gallery.models.length; i < l; i++) {

            var m = gallery.models[i];

            if (model.id === m.id || gallery.areNeighbors(model, m) || !gallery.isNeighbors(model, m)) {
              continue;
            }
            gallery.makeNeighbors(model, m);

          }

          break;

      }

    });

    for (var i = 0, l = gallery.models.length; i < l; i++) {
      var model = gallery.models[i];
      if (model.placed) {
        continue;
      }
      model.add({ placed: true });
      stage.place(model);
    }

    initialize();

    updateDisplay();
    minimap.loader.hide();

    $window.trigger('resize');

    loading = false;

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

  function getContent(p) {

    var p = parseInt(p);
    var page = gimmebar.total_pages - p;

    // Stay in the bounds
    if (page < 0 || (gimmebar.total_pages && page > gimmebar.total_pages)) {
      page = Math.min(Math.max(page, 0), gimmebar.total_pages);
      Router.history.navigate('#/page/' + p, { silent: true });
    }

    // Make sure we're in sync
    if (gimmebar.cursor !== page) {
      gimmebar.cursor = page;
    }

    var successful = gimmebar.getAssetsForUser('jonobr1', receiveData);

    if (successful) {
      minimap.loader.show();
    } else {
      loading = false;
    }

  }

});
