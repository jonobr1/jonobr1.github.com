define([
  'underscore'
], function() {

  var GoogleWebFont = function(fonts, callback) {

    window.WebFontConfig = {
      google: { families: [ fonts ] },
      active: function() {
        if (_.isFunction(callback)) {
          callback.call(this); 
        }
      }
    };

    loadScript();

  };

  function loadScript() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
    '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  }

  return GoogleWebFont;

});