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
  'backbone',
  'underscore',
  'jquery'
], function() {

  require.ready(function() {

    

  });

});