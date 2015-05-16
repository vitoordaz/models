/* jshint strict: true */
/* globals define */

define(['underscore', 'exports'], function(_, exports) {
  'use strict';

  var VARIABLE_BLOCK_REGEX = /{{\s*\S+\s*}}/g;
  var VARIABLE_REGEX = /^{{\s*(\S*)\s*}}$/;

  /**
   * Returns a list of string variables.
   * @param str {string} string with variables
   * @returns {[]}
   */
  var getStringVariables = exports.getStringVariables = function(str) {
    var vars = [];
    if (!!str && _.isString(str)) {
      _.each(str.match(VARIABLE_BLOCK_REGEX), function(varBlock) {
        var variable = varBlock.match(VARIABLE_REGEX)[1];
        if (!!variable) {
          vars.push(variable);
        }
      });
    }
    return _.uniq(vars.sort(), true);
  };

  /**
   * Interpolate variables in string using given context.
   * @param context {Backbone.Model} model object
   * @param value {string} string with variables to interpolate
   * @returns {string} string with interpolated variables
   */
  exports.interpolateValueString = function(context, value) {
    if (_.isString(value)) {
      var variables = getStringVariables(value);
      if (variables.length === 0) {
        return value;
      }
      var processVariable = function(variable) {
        var regex = new RegExp('{{\\s*' + variable + '\\s*}}', 'g');
        var variableValue = context.get(variable);
        if (!_.isNull(variableValue) && !_.isUndefined(variableValue)) {
          variableValue = variableValue.toString();
        }
        value = value.replace(regex, variableValue || '');
      };

      if (variables.length !== 1) {
        _.each(variables, processVariable);
      } else {
        var variable = _.first(variables);
        var variableValue = context.get(variable);
        var regex = new RegExp('{{\\s*' + variable + '\\s*}}', 'g');
        value = value.replace(regex, '{{' + variable + '}}');
        if (value !== '{{' + variable + '}}') {
          value = value.replace(regex, variableValue || '');
        } else {
          // NOTE: It's seems that a given value has only variable definition,
          // so we should return current variable value.
          return variableValue;
        }
      }
    }
    return value;
  };
});
