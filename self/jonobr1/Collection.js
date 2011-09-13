define([
  'jquery',
  'underscore',
  'backbone'
  ], function() {

    var Collection = Backbone.Collection.extend({
      model: Backbone.Model.extend(),
      value: null,
      comparator: function(model) {
        return -model.get('date');  // Descending order
      }
    });

    return Collection;

});