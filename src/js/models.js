/* jshint strict: true */
/* globals define */

define([
  'underscore',
  'utils',
  'models/call',
  'models/customer',
  'models/customers',
  'models/interaction',
  'models/script',
  'models/user',
  'models/vehicle',
  'models/vehicles'
], function(_, utils, call, customer, customers, interaction, script, user,
            vehicle, vehicles) {
  'use strict';

  var originalSync = Backbone.sync;

  Backbone.sync = function(method, model, options) {
    var url = _.result(model, 'url');
    if (!options.url && url) {
      options.url = config.apiServer;
      if (_.last(options.url) !== '/') {
        options.url += '/';
      }
      if (_.first(url) === '/') {
        options.url += url.substr(1);
      } else {
        options.url += url;
      }
    }
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
