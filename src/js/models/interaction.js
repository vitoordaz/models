/* jshint strict: true */
/* globals define */

define([
  'underscore',
  'Backbone',
  'utils'
], function(_, Backbone, utils) {
  'use strict';

  function processIf(model, op) {
    var condition = model.evaluate(op.condition);
    if (_.isArray(condition) || _.isObject(condition)) {
      return model.evaluate(_.isEmpty(condition) ? op.negative : op.positive);
    }
    return model.evaluate(!!condition ? op.positive : op.negative);
  }

  function processSwitch(model, op) {
    var condition = model.evaluate(op.condition);
    var cases = _.isArray(op.cases) ? op.cases : [op.cases];
    var found = _.find(cases, function(c) {
      return model.evaluate(c.when) === condition;
    });
    if (_.isUndefined(found)) {
      return model.evaluate(op.defaultValue);
    }
    return model.evaluate(found.value);
  }

  return Backbone.Model.extend({
    idAttribute: 'id',
    urlRoot: 'interaction/',
    initialize: function(attrs, opts) {
      opts = opts || {};
      this.context = opts.context || {};
      if (this.context.call && this.context.call.id) {
        this.set('call_id', this.context.call.id);
      }
    },
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
        switch (value.operator) {
          case 'if':  // if operator
            return processIf(this, value);
          case 'eq':
            return this.evaluate(value.first) == this.evaluate(value.second);
          case 'nq':
            return this.evaluate(value.first) != this.evaluate(value.second);
          case 'gt':
            return this.evaluate(value.first) > this.evaluate(value.second);
          case 'ge':
            return this.evaluate(value.first) >= this.evaluate(value.second);
          case 'switch':  // switch operator
            return processSwitch(this, value);
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
      // On this event each controller should update interaction with if it
      // current value.
      this.trigger('before-next-step');

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
