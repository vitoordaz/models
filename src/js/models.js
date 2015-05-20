/* jshint strict: true */
/* globals define */

define([
  'models/interaction',
  'models/script'
], function(interaction, script) {
  'use strict';

  return {
    Interaction: interaction,
    Script: script
  };
});
