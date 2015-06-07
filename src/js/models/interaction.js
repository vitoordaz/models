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
      var deferred = $.Deferred();

      _.defer(function() {
        if (_.isNull(value) || _.isUndefined(value) || _.isBoolean(value)) {
          deferred.resolve(value);
        } else if (_.isString(value)) {
          deferred.resolve(utils.interpolateValueString(this, value));
        } else if (_.isArray(value)) {
          // If a given value is an array we should evaluate each array item.
          $.when.apply($, _.map(value, this.evaluate.bind(this)))
            .then(function() {
              deferred.resolve(Array.prototype.slice.call(arguments));
            })
            .fail(function() {
              deferred.reject(Array.prototype.slice.call(arguments));
            });
          //return _.map(value, this.evaluate.bind(this));
        } else if (_.isObject(value) && _.has(value, 'operator')) {
          if (value.operator === 'if') {
            processIf(this, value)
              .then(deferred.resolve)
              .fail(deferred.reject);
          } else if (value.operator === 'switch') {
            processSwitch(this, value)
              .then(deferred.resolve)
              .fail(deferred.reject);
          } else if (value.operator === 'find') {
            processFind(this, value)
              .then(deferred.resolve)
              .fail(deferred.reject);
          } else {
            $.when(this.evaluate(value.first), this.evaluate(value.second))
              .then(function(first, second) {
                switch (value.operator) {
                  case 'eq':
                    deferred.resolve(first == second);
                    break;
                  case 'nq':
                    deferred.resolve(first != second);
                    break;
                  case 'gt':
                    deferred.resolve(first > second);
                    break;
                  case 'lt':
                    deferred.resolve(first < second);
                    break;
                  case 'ge':
                    deferred.resolve(first >= second);
                    break;
                  case 'le':
                    deferred.resolve(first <= second);
                    break;
                }
              });
          }
        } else {
          deferred.resolve(value);
        }
      }.bind(this));

      return deferred.promise();
    },
    /**
     * Updates current interaction step to a given step and triggers
     * 'next-step' event.
     * @param step {string} step name.
     */
    nextStep: function(step) {
      // On this event each controller should update interaction with it's
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
