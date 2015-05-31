/* jshint strict: true */
/* globals define */

define(['Backbone', './customer'], function(Backbone, Customer) {
  'use strict';

  return Backbone.Collection.extend({
    model: Customer,
    url: 'customer/',
    parse: function(response) {
      this.total = response.meta.total;
      return response.data;
    }
  });
});
