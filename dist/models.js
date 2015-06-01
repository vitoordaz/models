/* jshint strict: true */
/* globals define */

define('models/customer',['Backbone', 'utils'], function(Backbone, utils) {
  'use strict';

  return Backbone.Model.extend({
    idAttribute: 'id',
    urlRoot: 'customer/',
    initialize: function() {
      this.name = utils.getFullName(
        this.get('first_name'),
        this.get('last_name'),
        this.get('middle_name')
      );
    }
  });
});

/* jshint strict: true */
/* globals define */

define('models/customers',['Backbone', './customer'], function(Backbone, Customer) {
  'use strict';

  return Backbone.Collection.extend({
    model: Customer,
    url: 'customer/',
    parse: function(response) {
      this.total = response.meta.total;
      return response.data;
    }
  });
});

/* jshint strict: true */
/* globals define */

define('models/interaction',[
  'underscore',
  'Backbone',
  'utils'
], function(_, Backbone, utils) {
  'use strict';

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
        var type = value.operator;
        var condition;
        if (type === 'if') {  // if operator
          condition = this.evaluate(value.condition);
          if (_.isArray(condition) || _.isObject()) {
            if (_.isEmpty(condition)) {
              return this.evaluate(value.negative);
            }
            return this.evaluate(value.positive);
          }
          return this.evaluate(!!condition ? value.positive : value.negative);
        } else if (type === 'eq') {
          return this.evaluate(value.first) === this.evaluate(value.second);
        } else if (type === 'gt') {
          return this.evaluate(value.first) > this.evaluate(value.second);
        } else if (type === 'ge') {
          return this.evaluate(value.first) >= this.evaluate(value.second);
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

/* jshint strict: true */
/* globals define */

define('models/script',['underscore', 'Backbone'], function(_, Backbone) {
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

define('models',[
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

