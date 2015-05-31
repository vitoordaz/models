/* jshint strict: true */
/* globals define */

define(['Backbone', 'utils'], function(Backbone, utils) {
  'use strict';

  return Backbone.Model.extend({
    idAttribute: 'id',
    urlRoot: 'customer/',
    initialize: function() {
      this.name = utils.getFullName(
        this.get('first_name'),
        this.get('last_name'),
        this.get('middle_name')
      );
    }
  });
});
