/* jshint strict: true */
/* globals define */

define([
  'models/customer',
  'models/customers',
  'models/interaction',
  'models/script'
], function(customer, customers, interaction, script) {
  'use strict';

  return {
    Customer: customer,
    Customers: customers,
    Interaction: interaction,
    Script: script
  };
});
