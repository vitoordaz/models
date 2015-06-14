/* jshint strict: true */
/* globals define */

define(['Backbone', './vehicle'], function(Backbone, Vehicle) {
  'use strict';

  return Backbone.Collection.extend({
    model: Vehicle,
    url: 'vehicle/',
    parse: function(response) {
      this.total = response.meta.total;
      return response.data;
    }
  });
});
