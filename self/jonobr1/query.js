define([
  'underscore',
  'jquery'
], function() {

  return function(params) {

    params = _.defaults(params || {}, {
      username: 'jonobr1',
      collection: 'firehose',
      type: '',
      limit: 10,
      skip: 0,
      callback: _.identity
    });

    var url = 'https://gimmebar.com/api/v0/public/assets/' + params.username + '/' + params.collection + '?type=' + params.type + '&limit=' + params.limit + '&skip=' + params.skip;

    $.post('/self/proxy.php', {
      url: url
    }, function(data) {
      var json = $.parseJSON(data);
      params.callback.apply(this, [json]);
    });

  };

});