/* jshint strict: true */
/* globals define */

define(['Backbone'], function(Backbone) {
  'use strict';

  return Backbone.Model.extend({
    idAttribute: 'id',
    urlRoot: 'vehicle/'
  });
});
