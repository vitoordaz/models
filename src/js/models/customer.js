/* jshint strict: true */
/* globals define */

define(['Backbone', 'utils', './vehicles'], function(Backbone, Vehicles,
                                                     utils) {
  'use strict';

  return Backbone.Model.extend({
    idAttribute: 'id',
    urlRoot: 'customer/',
    initialize: function() {
      this.vehicles = new Vehicles();
      this.name = utils.getFullName(
        this.get('first_name'),
        this.get('last_name'),
        this.get('middle_name')
      );
    },
    getShortName: function() {
      var firstName = this.get('first_name');
      var lastName = this.get('last_name');
      var parts = [];
      if (firstName) {
        parts.push(firstName);
      }
      if (lastName) {
        parts.push(lastName);
      }
      return parts.join(' ');
    }
  });
});
