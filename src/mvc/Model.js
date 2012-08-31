define([
  'mvc/Events',
  'common'
], function(Events, _) {

  /**
   * Model is an abstract way to save data with possible event binding. Just
   * instantiate a new model with a map of whatever data you'd like to save.
   * 
   * @class
   */
  var Model = function(data) {

    if (_.isObject(data)) {
      this.add(data);
    }

  };

  _.extend(Model.prototype, Events, {

    add: function(data, silent) {

      _.each(data, function(value, prop) {

        var capital = capitalize(prop);

        if (_.isUndefined(this[prop])) {

          makeProperty.call(this, value, prop, capital);

        } else {

          this['set' + capital](value, silent);

        }

      }, this);

      return this;

    }

  });

  function makeProperty(value, prop, capital) {

    // Setup property for Model

    this[prop] = _.isObject(value) ? _.clone(value) : value;

    // Provide getters and setters

    this['get' + capital] = function() {
      return this[prop];
    };

    this['set' + capital] = function(n, silent) {
      if (n === this[prop]) {
        return this;
      }
      this[prop] = n;
      if (!silent) {
        this.trigger('change', prop, n);
      }
      return this;
    };

  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
  }

  return Model;

});
