/* jshint strict: true, expr: true */
/* globals define, beforeEach, it */

define([
  'should',
  'interaction'
], function(should, Interaction) {
  'use strict';

  var model;

  beforeEach(function() {
    model = new Interaction();
  });

  describe('Test Interaction model', function() {
    describe('Test evaluate method', function() {
      it('should just return given value if it is null', function() {
        should(model.evaluate(null)).be.null;
      });

      it('should just return given value if it is undefined', function() {
        should(model.evaluate()).be.undefined;
        should(model.evaluate(undefined)).be.undefined;
      });

      it('should just return given value if it is boolean', function() {
        should(model.evaluate(true)).be.true;
        should(model.evaluate(false)).be.false;
      });

      it('should evaluate strings', function() {
        should(model.evaluate('blah')).be.eql('blah');

        model.set('var', 'value');
        should(model.evaluate('{{ var }}')).be.eql('value');

        model.set('var', true);
        should(model.evaluate('{{ var }}')).be.true;
      });

      it('should evaluate each item if given value is an array', function() {
        should(model.evaluate([])).be.eql([]);
        should(model.evaluate([null])).be.eql([null]);
        should(model.evaluate([undefined])).be.eql([undefined]);
        should(model.evaluate([true, false])).be.eql([true, false]);
        should(model.evaluate(['string', false])).be.eql(['string', false]);
      });

      it('should evaluate "if" objects', function() {
        var op = {
          operator: 'if',
          condition: '',
          positive: 'positive',
          negative: 'negative'
        };

        should(model.evaluate(op)).be.eql('negative');

        op.condition = '1';
        should(model.evaluate(op)).be.eql('positive');

        op.condition = '{{ var }}';
        model.set('var', false);
        should(model.evaluate(op)).be.eql('negative');

        model.set('var', true);
        should(model.evaluate(op)).be.eql('negative');

        model.set('var', []);
        should(model.evaluate(op)).be.eql('negative');
      });

      it('should evaluate "switch" objects', function() {
        var op = {
          operator: 'switch',
          condition: '',
          defaultValue: 'default',
          cases: [{
            when: '',
            value: false
          }, {
            when: 'foo',
            value: 'blah'
          }]
        };
        should(model.evaluate(op)).be.false;

        model.set('var', 'blah');
        op.condition = '{{ var }}';
        should(model.evaluate(op)).be.eql('default');

        model.set('var', 'foo');
        should(model.evaluate(op)).be.eql('blah');

        model.set('var', 'blah');
        op.condition = '{{ var }}';
        op.cases = {
          when: 'blah',
          value: 'foo'
        };
        should(model.evaluate(op)).be.eql('foo');
      });
    });
  });
});
