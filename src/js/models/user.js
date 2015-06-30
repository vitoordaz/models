/* jshint strict: true, browser: true */
/* globals define */

define(['Backbone'], function(Backbone) {
  'use strict';

  return Backbone.Model.extend({
    idAttribute: 'id',
    urlRoot: 'user/'
  });
});
