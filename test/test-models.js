/* jshint strict: true */
/* globals define, it, describe */

define(['should', 'models'], function(should, models) {
  'use strict';

  describe('Test models', function() {
    it('should has all models', function() {
      should(models).have.property('Interaction');
      should(models).have.property('Script');
    });
  });
});
