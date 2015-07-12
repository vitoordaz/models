/* jshint strict: true */
/* globals define */

define([
  'models/call',
  'models/customer',
  'models/customers',
  'models/interaction',
  'models/script',
  'models/user',
  'models/vehicle',
  'models/vehicles'
], function(call, customer, customers, interaction, script, user, vehicle,
            vehicles) {
  'use strict';

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
