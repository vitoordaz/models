/* jshint strict: true */
/* globals define */

define(['Backbone'], function(Backbone) {
  'use strict';

  return Backbone.Model.extend({
    idAttribute: 'id',
    urlRoot: 'vehicle/',
    /**
     * Returns vehicle short name.
     */
    getShortName: function() {
      return [
        this.get('brand'),
        this.get('model'),
        this.get('registration_number')
      ].join(' ') || '&nbsp;';
    }
  });
});
