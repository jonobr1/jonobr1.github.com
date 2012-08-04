require([
  'gimmebar/api',
  'underscore'
], function(gimmebar) {

  gimmebar.getAssetsForUser('jonobr1', function(resp) {
    console.log(resp);
  });

});
