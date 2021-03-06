/* jshint strict: true */
/* globals define */

define([
  'jquery',
  'underscore',
  'Backbone',
  'utils'
], function($, _, Backbone, utils) {
  'use strict';

  function processIf(model, op) {
    return model.evaluate(op.condition)
      .then(function(condition) {
        var v;
        if (_.isArray(condition) || _.isObject(condition)) {
          v = _.isEmpty(condition) ? op.negative : op.positive;
        } else {
          v = !!condition ? op.positive : op.negative;
        }
        return model.evaluate(v);
      });
  }

  function processSwitch(model, op) {
    return model.evaluate(op.condition).then(function(condition) {
      var cases = _.isArray(op.cases) ? op.cases : [op.cases];
      var promises = _.map(cases, function(c) {
        return model.evaluate(c.when).then(function(r) {
          return {when: r, value: c.value};
        });
      });
      return $.when.apply($, promises).then(function() {
        var f = _.find(arguments, function(c) {
          return c.when == condition;
        });
        return model.evaluate(_.isUndefined(f) ? op.defaultValue : f.value);
      });
    });
  }

  function processFind(model, op) {
    return $.when(model.evaluate(op.where), model.evaluate(op.value))
      .then(function(where, value) {
        var property = op.property;
        if (where instanceof Backbone.Collection) {
          where = where.models;
        }
        var r = _.find(where, function(item) {
          if (item instanceof Backbone.Model) {
            return item.get(property) == value;
          }
          return item[property] == value;
        });
        return r instanceof Backbone.Model ? r.toJSON() : r;
      });
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
     * @returns {$.Promise} promise object.
     */
    evaluate: function(value) {
      if (_.isNull(value) || _.isUndefined(value) || _.isBoolean(value)) {
        return $.Deferred().resolve(value);
      }
      if (_.isString(value)) {
        return $.Deferred().resolve(
          utils.interpolateValueString(this, value));
      }
      if (_.isArray(value)) {
        // If a given value is an array we should evaluate each array item.
        return $.when.apply($, _.map(value, this.evaluate.bind(this)))
          .then(function() {
            return Array.prototype.slice.call(arguments);
          });
      }
      if (_.isObject(value) && _.has(value, 'operator')) {
        if (value.operator === 'if') {
          return processIf(this, value);
        }
        if (value.operator === 'switch') {
          return processSwitch(this, value);
        }
        if (value.operator === 'find') {
          return processFind(this, value);
        }
        return $.when(
          this.evaluate(value.first),
          this.evaluate(value.second)
        ).then(function(first, second) {
            switch (value.operator) {
              case 'eq':
                return first == second;
              case 'nq':
                return first != second;
              case 'gt':
                return first > second;
              case 'lt':
                return first < second;
              case 'ge':
                return first >= second;
              case 'le':
                return first <= second;
            }
          });
      }
      return $.Deferred().resolve(value);
    },
    /**
     * Updates current interaction step to a given step and triggers
     * 'next-step' event.
     * @param step {string} step name.
     * @returns {$.Promise} promise object.
     */
    nextStep: function(step) {
      // On this event each controller should update interaction with it's
      // current value.
      return this.evaluate(step).then(_.bind(function(step) {
        this.trigger('before-next-step');

        this.set('step', step);

        var steps = this.get('steps') || [];
        steps.push(step);
        this.set('steps', steps);

        this.trigger('next-step');
      }, this));
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
