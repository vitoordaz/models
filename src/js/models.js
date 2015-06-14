/* jshint strict: true */
/* globals define */

define([
  'models/customer',
  'models/customers',
  'models/interaction',
  'models/script',
  'models/vehicle',
  'models/vehicles'
], function(customer, customers, interaction, script, vehicle, vehicles) {
  'use strict';

  return {
    Customer: customer,
    Customers: customers,
    Interaction: interaction,
    Script: script,
    Vehicle: vehicle,
    Vehicles: vehicles
  };
});
