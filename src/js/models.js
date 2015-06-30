/* jshint strict: true */
/* globals define */

define([
  'models/customer',
  'models/customers',
  'models/interaction',
  'models/script',
  'models/user',
  'models/vehicle',
  'models/vehicles'
], function(customer, customers, interaction, script, user, vehicle,
            vehicles) {
  'use strict';

  return {
    Customer: customer,
    Customers: customers,
    Interaction: interaction,
    Script: script,
    User: user,
    Vehicle: vehicle,
    Vehicles: vehicles
  };
});
