/* jshint strict: true, expr: true */
/* globals define, beforeEach, it */

define([
  'jquery',
  'should',
  'models/interaction'
], function($, should, Interaction) {
  'use strict';

  var model;

  beforeEach(function() {
    model = new Interaction();
  });

  describe('Test Interaction model', function() {
    describe('Test evaluate method', function() {
      it('should just return given value if it is null', function(done) {
        model.evaluate(null).always(function(v) {
          should(v).be.null;
          done();
        });
      });

      it('should just return given value if it is undefined', function(done) {
        $.when(model.evaluate(), model.evaluate(undefined))
          .always(function(v1, v2) {
            should(v1).be.undefined;
            should(v2).be.undefined;
            done();
          });
      });

      it('should just return given value if it is boolean', function(done) {
        $.when(model.evaluate(true), model.evaluate(false))
          .always(function(v1, v2) {
            should(v1).be.true;
            should(v2).be.false;
            done();
          });
      });

      it('should evaluate strings', function(done) {
        model.evaluate('blah').always(function(v) {
          should(v).be.eql('blah');

          model.set('var', 'value');
          model.evaluate('{{ var }}').always(function(v) {
            should(v).be.eql('value');

            model.set('var', true);
            model.evaluate('{{ var }}').always(function(v) {
              should(v).be.true;
              done();
            });
          });
        });
      });

      it(
        'should evaluate each item if given value is an array',
        function(done) {
          $.when(
            model.evaluate([]),
            model.evaluate([null]),
            model.evaluate([undefined]),
            model.evaluate([true, false]),
            model.evaluate(['string', false])
          ).always(function(v1, v2, v3, v4, v5) {
              should(v1).be.eql([]);
              should(v2).be.eql([null]);
              should(v3).be.eql([undefined]);
              should(v4).be.eql([true, false]);
              should(v5).be.eql(['string', false]);
              done();
            });
        }
      );

      it('should evaluate "if" objects', function(done) {
        var op = {
          operator: 'if',
          condition: '',
          positive: 'positive',
          negative: 'negative'
        };

        model.evaluate(op).then(function(v) {
          should(v).be.eql('negative');

          op.condition = '1';
          model.evaluate(op).always(function(v) {
            should(v).be.eql('positive');

            op.condition = '{{ var }}';
            model.set('var', false);
            model.evaluate(op).always(function(v) {
              should(v).be.eql('negative');

              model.set('var', true);
              model.evaluate(op).always(function(v) {
                should(v).be.eql('positive');

                model.set('var', []);
                model.evaluate(op).always(function(v) {
                  should(v).be.eql('negative');

                  op.condition = false;
                  model.evaluate(op).always(function(v) {
                    should(v).be.eql('negative');

                    op.condition = true;
                    model.evaluate(op).always(function(v) {
                      should(v).be.eql('positive');
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });

      it('should evaluate "switch" objects', function(done) {
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
        model.evaluate(op).always(function(v) {
          should(v).be.false;

          model.set('var', 'blah');
          op.condition = '{{ var }}';
          model.evaluate(op).always(function(v) {
            should(v).be.eql('default');

            model.set('var', 'foo');
            model.evaluate(op).always(function(v) {
              should(v).be.eql('blah');

              model.set('var', 'blah');
              op.condition = '{{ var }}';
              op.cases = {
                when: 'blah',
                value: 'foo'
              };
              model.evaluate(op).always(function(v) {
                should(v).be.eql('foo');

                done();
              });
            });
          });
        });
      });

      it('should evaluate "eq" objects', function(done) {
        var op = {
          operator: 'eq',
          first: '{{ foo }}',
          second: '{{ bar }}'
        };
        model.evaluate(op).always(function(v) {
          should(v).be.true;

          model.set('foo', 'something');
          model.evaluate(op).always(function(v) {
            should(v).be.false;

            model.set('bar', 'something');
            model.evaluate(op).always(function(v) {
              should(v).be.true;

              op.second = 'something';
              model.evaluate(op).always(function(v) {
                should(v).be.true;

                model.set('foo', true);
                op.second = true;
                model.evaluate(op).always(function(v) {
                  should(v).be.true;

                  model.set('foo', 1);
                  op.second = 1;
                  model.evaluate(op).always(function() {
                    should(v).be.true;

                    model.set('foo', 1);
                    op.second = '1';
                    model.evaluate(op).always(function(v) {
                      should(v).be.true;
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });

      it('should evaluate "nq" objects', function(done) {
        var op = {
          operator: 'nq',
          first: '{{ foo }}',
          second: '{{ bar }}'
        };
        model.evaluate(op).always(function(v) {
          should(v).be.false;

          model.set('foo', 'something');
          model.evaluate(op).always(function(v) {
            should(v).be.true;

            model.set('bar', 'something');
            model.evaluate(op).always(function(v) {
              should(v).be.false;

              model.set('foo', true);
              op.second = true;
              model.evaluate(op).always(function(v) {
                should(v).be.false;

                model.set('foo', 1);
                op.second = '1';
                model.evaluate(op).always(function(v) {
                  should(v).be.false;

                  done();
                });
              });
            });
          });
        });
      });

      it('should evaluate "gt" objects', function(done) {
        var op = {
          operator: 'gt',
          first: '{{ foo }}',
          second: '{{ bar }}'
        };
        model.set('foo', 2);
        model.set('bar', 1);
        model.evaluate(op).always(function(v) {
          should(v).be.true;

          model.set('foo', 1);
          model.evaluate(op).always(function(v) {
            should(v).be.false;

            op.first = '{{ foo.length }}';
            model.set('foo', 'something');
            model.evaluate(op).always(function(v) {
              should(v).be.true;

              op.first = '{{ foo.length }}';
              model.set('foo', [1, 2, 3]);
              model.evaluate(op).always(function(v) {
                should(v).be.true;

                done();
              });
            });
          });
        });
      });

      it('should evaluate "ge" objects', function(done) {
        var op = {
          operator: 'ge',
          first: '{{ foo }}',
          second: '{{ bar }}'
        };
        model.set('foo', 1);
        model.set('bar', 1);
        model.evaluate(op).always(function(v) {
          should(v).be.true;

          model.set('foo', 2);
          model.evaluate(op).always(function(v) {
            should(v).be.true;

            op.first = '{{ foo.length }}';
            model.set('foo', 'something');
            model.evaluate(op).always(function(v) {
              should(v).be.true;

              op.first = '{{ foo.length }}';
              model.set('foo', [1, 2, 3]);
              model.evaluate(op).always(function(v) {
                should(v).be.true;

                done();
              });
            });
          });
        });
      });

      it('should evaluate "find" objects', function(done) {
        var op = {
          operator: 'find',
          where: '{{ items }}',
          property: 'id',
          value: 4
        };
        model.set('items', [{id: 2}, {id: 3}, {id: 4}, {id: 1}]);
        model.evaluate(op).always(function(v) {
          should(v).be.eql({id: 4});

          model.set('items', new Backbone.Collection([{
            id: 2,
            name: 'a'
          }, {
            id: 3,
            name: 'b'
          }, {
            id: 4,
            name: 'c'
          }, {
            id: 1,
            name: 'd'
          }]));
          model.evaluate(op).always(function(v) {
            should(v).be.eql({
              id: 4,
              name: 'c'
            });
            done();
          });
        });
      });
    });
  });
});
