/* jshint strict: true */
/* globals define */

define([
  'underscore',
  'Backbone',
  'utils'
], function(_, Backbone, utils) {
  'use strict';

  return Backbone.Model.extend({
    idAttribute: 'id',
    urlRoot: 'interaction/',
    /**
     * Evaluates given value.
     *
     * This function can handle following cases.
     *
     * * If a given value is a null, undefined or boolean this function will
     *   return given value.
     *
     * * If a given value is a string it will try to interpolate all string
     *   variables.
     *
     * * If a given value is an array it will evaluate each item of the array.
     *
     * * If a given value is an object and it has 'operator' property it will
     *   evaluate value based on operator type.
     *
     * @param value {*} value to evaluate.
     */
    evaluate: function(value) {
      if (_.isNull(value) || _.isUndefined(value) || _.isBoolean(value)) {
        return value;
      } else if (_.isString(value)) {
        return utils.interpolateValueString(this, value);
      } else if (_.isArray(value)) {
        // If a given value is an array we should evaluate each array item.
        return _.map(value, this.evaluate.bind(this));
      } else if (_.isObject(value) && _.has(value, 'operator')) {
        var type = value.operator;
        var condition;
        if (type === 'if') {  // if operator
          condition = this.evaluate(value.condition);
          if (_.isEmpty(condition) || !condition) {
            return this.evaluate(value.negative);
          }
          return this.evaluate(value.positive);
        } else if (type === 'switch') {  // switch operator
          condition = this.evaluate(value.condition);
          var cases = _.isArray(value.cases) ? value.cases : [value.cases];
          for (var i = 0, len = cases.length; i < len; i++) {
            var c = cases[i];
            if (this.evaluate(c.when) === condition) {
              return this.evaluate(c.value);
            }
          }
          return this.evaluate(value.defaultValue);
        }
      }
      return value;
    },
    /**
     * Updates current interaction step to a given step and triggers
     * 'next-step' event.
     * @param step {string} step name.
     */
    nextStep: function(step) {
      step = this.evaluate(step);
      this.set('step', step);

      var steps = this.get('steps') || [];
      steps.push(step);
      this.set('steps', steps);

      this.trigger('next-step');
    },
    /**
     * Updates current interaction step to the previous step and triggers
     * 'previous-step' event.
     */
    previousStep: function() {
      var steps = this.get('steps') || [];
      if (!!steps || steps.length > 0) {
        var step = steps.pop();
        if (steps.length === 0) {
          steps.push(step);
        } else {
          // Make sure that there is at least one step remains.
          this.set('step', steps[steps.length - 1]);
          this.set('steps', steps);
          this.trigger('previous-step');
        }
      }
    }
  });
});
