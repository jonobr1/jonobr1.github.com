define([
  'jquery',
  'underscore',
  'backbone'
  ], function() {

    var model = Backbone.Model.extend();
    var Collection = Backbone.Collection.extend({
      model: model,
      value: null,
      username: 'jonobr1',
      name: 'firehose',
      url: function() {
        return '/self/get.php?query=https://gimmebar.com/api/v0/public/assets/'
          + this.username + '/' + this.name;
      }
    });

    return Collection;

});