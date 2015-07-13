/* jshint strict: true */
/* globals define */

define([
  'utils',
  'models/call',
  'models/customer',
  'models/customers',
  'models/interaction',
  'models/script',
  'models/user',
  'models/vehicle',
  'models/vehicles'
], function(utils, call, customer, customers, interaction, script, user,
            vehicle, vehicles) {
  'use strict';

  var originalSync = Backbone.sync;

  Backbone.sync = function(method, model, options) {
    return utils.credentials.get()
      .then(function(credentials) {
        options.headers = options.headers || {};
        options.headers.Authorization =
          'user ' + window.btoa(credentials.key + ':' + credentials.secret);
        return originalSync(method, model, options);
      });
  };

  return {
    Call: call,
    Customer: customer,
    Customers: customers,
    Interaction: interaction,
    Script: script,
    User: user,
    Vehicle: vehicle,
    Vehicles: vehicles
  };
});
