/*
 *  Copyright 2017 Adobe Systems Incorporated. All rights reserved.
 *  This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License. You may obtain a copy
 *  of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under
 *  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *  OF ANY KIND, either express or implied. See the License for the specific language
 *  governing permissions and limitations under the License.
 *
 */

/**
 * @fileoverview Tests for jsx-member-vars
 */

'use strict';

// -----------------------------------------------------------------------------
// Requirements
// -----------------------------------------------------------------------------

const eslint = require('eslint');
const ruleNoUnusedVars = require('eslint/lib/rules/no-unused-vars');
const rulePreferConst = require('eslint/lib/rules/prefer-const');
const RuleTester = eslint.RuleTester;

const parserOptions = {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
        experimentalObjectRestSpread: true,
        jsx: true
    }
};

require('babel-eslint');

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions });
const linter = ruleTester.linter || eslint.linter;
linter.defineRule('jsx-member-vars', require('../../../src/rules/jsx-member-vars'));

ruleTester.run('no-unused-vars', ruleNoUnusedVars, {
    valid: [
        {
            code: `
        /* eslint jsx-member-vars: 1 */
        var App;
        function fn() {
          return <App />;
        }
        fn();
      `
        }, {
            code: `
        /* eslint jsx-member-vars: 1 */
        var App;
        <App.Member />
      `
        }, {
            code: `
        /* eslint jsx-member-vars: 1 */
        var App;
        <App:Member />
      `
        }, {
            code: `
        /* eslint jsx-member-vars: 1 */
        class MainApplication {};
        <MainApplication />
      `
        }, {
            code: `
        /* eslint jsx-member-vars: 1 */
        class MainApplication {
          render() {
            var MainApplication = <div>Hello</div>;
            return MainApplication;
          }
        };
        <MainApplication />
      `
        }, {
            code: `
        /* eslint jsx-member-vars: 1 */
        function foo() {
          var App = { Foo: { Bar: {} } };
          var bar = TestRender(<App.Foo.Bar/>);
          return bar;
        };
        foo()
      `
        }, {
            code: `
        /* eslint jsx-member-vars: 1 */
        function foo() {
          var App = { Foo: { Bar: { Baz: {} } } };
          var bar = TestRender(<App.Foo.Bar.Baz/>);
          return bar;
        };
        foo()
      `
        }
    ],
    invalid: [
        {
            code: '/* eslint jsx-member-vars: 1 */ var App;',
            errors: [ { message: '\'App\' is defined but never used.' } ]
        }, {
            code: `
        /* eslint jsx-member-vars: 1 */
        var App;
        var unused;
        TestRender(<App unused=""/>);
      `,
            errors: [ { message: '\'unused\' is defined but never used.' } ]
        }, {
            code: `
        /* eslint jsx-member-vars: 1 */
        var App;
        var Hello;
        TestRender(<App:Hello/>);
      `,
            errors: [ { message: '\'Hello\' is defined but never used.' } ]
        }, {
            code: `
        /* eslint jsx-member-vars: 1 */
        var Button;
        var Input;
        TestRender(<Button.Input unused=""/>);
      `,
            errors: [ { message: '\'Input\' is defined but never used.' } ]
        }, {
            code: `
        /* eslint jsx-member-vars: 1 */
        class unused {}
      `,
            errors: [ { message: '\'unused\' is defined but never used.' } ]
        }, {
            code: `
        /* eslint jsx-member-vars: 1 */
        class HelloMessage {
          render() {
            var HelloMessage = <div>Hello</div>;
            return HelloMessage;
          }
        }
      `,
            errors: [ {
                message: '\'HelloMessage\' is defined but never used.',
                line: 3
            } ]
        }, {
            code: `
        /* eslint jsx-member-vars: 1 */
        class HelloMessage {
          render() {
            var HelloMessage = <div>Hello</div>;
            return HelloMessage;
          }
        }
      `,
            errors: [ {
                message: '\'HelloMessage\' is defined but never used.',
                line: 3
            } ],
            parser: 'babel-eslint'
        }, {
            code: `
        /* eslint jsx-member-vars: 1 */
        import {Hello} from 'Hello';
        function Greetings() {
          const Hello = require('Hello').default;
          return <Hello />;
        }
        Greetings();
      `,
            errors: [ {
                message: '\'Hello\' is defined but never used.',
                line: 3
            } ],
            parser: 'babel-eslint'
        }
    ]
});

ruleTester.run('prefer-const', rulePreferConst, {
    valid: [],
    invalid: [ {
        code: [
            '/* eslint jsx-member-vars:1 */',
            'let App = <div />;',
            '<App />;'
        ].join('\n'),
        errors: [ { message: '\'App\' is never reassigned. Use \'const\' instead.' } ]
    }, {
        code: [
            '/* eslint jsx-member-vars:1 */',
            'let filters = \'foo\';',
            '<div>{filters}</div>;'
        ].join('\n'),
        errors: [ { message: '\'filters\' is never reassigned. Use \'const\' instead.' } ]
    } ]
});
