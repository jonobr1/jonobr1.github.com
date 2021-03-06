define([
  'common'
], function(_) {

  var proxy  = '../php/get.php?q=';
  var base   = 'https://gimmebar.com/api/v1';
  var api    = '/public/assets';
  var loaded = [];

  // DOCS: https://pro.gimmebar.com/api/v1
  // e.g: https://gimmebar.com/api/v1/public/assets/funkatron

  var gimmebar = {

    loaded: loaded,

    querying: false,

    limit: 10,

    cursor: 0,

    total_records: 0,

    total_pages: 0,

    getAssetsForUser: function(_user, _callback, silent) {

      this.querying = true;

      var user = '/' + _user;
      var skip = '?skip=' + (this.cursor * this.limit);
      var limit = '&limit=' + this.limit;

      var url = base + api + user + skip + limit;

      if (_.indexOf(loaded, this.cursor) >= 0) {
        return false;
      }

      $.get(proxy + url, function(resp) {

        var data = JSON.parse(resp);

        // Update the total records if we can

        var total_records = data.total_records;
        if (total_records && gimmebar.total_records !== total_records) {
          gimmebar.total_records = data.total_records;
          gimmebar.total_pages = Math.floor(gimmebar.total_records / gimmebar.limit);
        }

        if (!silent) {
          loaded.push(gimmebar.cursor);
        }
        _callback(data);
        gimmebar.querying = false;

      });

      return true;

    }

  };

  return gimmebar;

});