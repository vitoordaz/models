/* jshint strict: true */
/* globals define */

define(['underscore', 'Backbone'], function(_, Backbone) {
  'use strict';

  return Backbone.Model.extend({
    url: 'script/',
    /**
     * Returns script's first step name.
     * @returns {string} first step name.
     */
    getFirstStepName: function() {
      var firstStep = this.get('firstStep');
      if (!firstStep) {
        // If first step is not defined in script lets use name of the
        // first step in 'steps'.
        firstStep = _.first(this.get('steps'));
        if (firstStep) {
          firstStep = firstStep.name;
        }
      }
      return firstStep;
    },
    /**
     * Returns script step by it name.
     * @param name {string} step name.
     */
    getStep: function(name) {
      var steps = this.get('steps') || [];
      var idx = _.findIndex(steps, function(step) {
        return step.name === name;
      });
      return idx < 0 ? undefined : steps[idx];
    }
  });
});
