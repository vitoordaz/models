/* jshint strict: true, browser: true */
/* globals define */

define(['Backbone'], function(Backbone) {
  'use strict';

  return Backbone.Model.extend({
    idAttribute: 'id',
    urlRoot: 'call/',
    /**
     * Returns true if call status is call.
     * @returns {boolean}
     */
    isRinging: function() {
      return this.get('status') === 'call';
    },
    /**
     * Returns true if call status is up.
     * @returns {boolean}
     */
    isUp: function() {
      return this.get('status') === 'up';
    },
    /**
     * Returns true if call status is transfer.
     * @returns {boolean}
     */
    isTransfer: function() {
      return this.get('status') === 'transfer';
    }
  });
});
