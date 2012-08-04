define([
  'underscore'
], function() {

  var proxy = '../php/get.php?q=';
  var base  = 'https://gimmebar.com/api/v1';
  var api   = '/public/assets';

  // DOCS: https://pro.gimmebar.com/api/v1
  // e.g: https://gimmebar.com/api/v1/public/assets/funkatron

  var gimmebar = {

    limit: 10,

    total_records: 0,

    getAssetsForUser: function() {

      var _user, _skip, _limit, _callback, length = arguments.length;

      if (length <= 2) {
        _user = arguments[0];
        _callback = arguments[1];
      } else if (length <= 3) {
        _user = arguments[0];
        _callback = arguments[2];
      } else if (length <= 4) {
        _user = arguments[0];
        _skip = arguments[2];
        _callback = arguments[3];
      }

      var user = '/' + _user;
      var skip = '&skip=' + (_skip || 0);
      var limit = '&limit=' + this.limit;

      var url = base + api + user + skip + limit;

      $.get(proxy + url, function(resp) {

        var data = JSON.parse(resp);

        // Update the total records if we can

        var total_records = data.total_records;
        if (_.isNumber(total_records) && gimmebar.total_records !== total_records) {
          gimmebar.total_records = data.total_records;
        }

        _callback(data);

      });

    }

  };

  return gimmebar;

});