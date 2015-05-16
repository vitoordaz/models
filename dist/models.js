/* jshint strict: true */
/* globals define */

AM.define('utils',['underscore', 'exports'], function(_, exports) {
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

/* jshint strict: true */
/* globals define */

AM.define('interaction',[
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

/* jshint strict: true */
/* globals define */

AM.define('script',['underscore', 'Backbone'], function(_, Backbone) {
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

/* jshint strict: true */
/* globals define */

AM.define('models',[
  'interaction',
  'script'
], function(interaction, script) {
  'use strict';

  return {
    Interaction: interaction,
    Script: script
  };
});

