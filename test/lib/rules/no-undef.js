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
 * @fileoverview Tests for jsx-no-undef
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint');
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

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const jsxNoUndef = require('../../../src/rules/no-undef');
let ruleTester = new RuleTester({ parserOptions, parser: 'babel-eslint' });

ruleTester.run('no-undef', jsxNoUndef, {
    valid: [ {
        code: `
        var fruits = [ "apple", "orange", "watermelon" ];
        export default <ul>
            <repeat for={ item in fruits }>
                <li>{ item }</li>
            </repeat>
        </ul>;
        `
    }, {
        code: `
        var fruits = "apple";
        export default <ul>
            <using value={ fruits } as={ fruit }>
                <li>{ fruit }</li>
            </using>
        </ul>;
        `
    }, {
        code: `
        var fruits = [ "apple", "orange", "watermelon" ];
        export default function() {
            return
                <ul>
                    <repeat collection={ fruits } as={ item }>
                        <li>{ item }</li>
                    </repeat>
                </ul>;
        };`
    }, {
        code: `
        var fruits = [ "apple", "orange", "watermelon" ];
        export default function() {
        return <ol>
                <repeat for={ (item, index) in fruits }>
                    <li selected={ item.selected } index={ index }>
                        { item.name }
                    </li>
                </repeat>
            </ol>;
        };`
    }, {
        code: `
        var fruits = [ "apple", "orange", "watermelon" ];
        export default <ul>
            <repeat collection={ fruits } as={ item }>
                <li>{ item }</li>
            </repeat>
        </ul>;
        `
    }, {
        code: `
        var fruits = [ "apple", "orange", "watermelon" ];
        export default <ul>
            <repeat collection={ fruits } as={ item, index }>
                <li>{ index }{ item }</li>
            </repeat>
        </ul>;
        `
    }, {
        code: `
        export default <ul>
            <spectrum:dialog>
                <dialog:footer as={ accept, cancel }>
                    <button on-click={ accept() }>OK</button>
                    <button on-click={ cancel() }>Cancel</button>
                </dialog:footer>
            </spectrum:dialog>
        </ul>;
        `
    }, {
        code: `
        export default <ul>
            <MyComponent as={ data }>
                <div>{ data }</div>
            </MyComponent>
        </ul>;
        `
    }, {
        code: `
        @Store
        export default class MyStore {
            @State.byVal x;
        }
        `
    } ],
    invalid: [ {
        code: `
        var fruits = [ "apple", "orange", "watermelon" ];
        export default <ul>
            <repeat for={ item in fruits }>
                <li>{ index }</li>
            </repeat>
        </ul>;
        `,
        errors: [ { message: "'index' is not defined.", type: "Identifier" } ]
    }, {
        code: `
        var fruits = [ "apple", "orange", "watermelon" ];
        export default <ul>
            <repeat collection={ fruits } as={ item }>
                <li>{ index }</li>
            </repeat>
        </ul>;
        `,
        errors: [ { message: "'index' is not defined.", type: "Identifier" } ]
    }, {
        code: `
        export default <g>
            <div ref={ element }></div>
            <div>{ element.tagName }</div>
        </g>;
        `,
        errors: [
            { message: "'element' is not defined.", type: "Identifier" },
            { message: "'element' is not defined.", type: "Identifier" },
        ]
    }, {
        code: `
        var fruits = "apple";
        export default <ul>
            <using value={ fruits } as={ fruit }>
                <li>{ fruit }</li>
            </using>
            <div>{ fruit }</div>
        </ul>;
        `,
        errors: [ { message: "'fruit' is not defined.", type: "Identifier" } ]
    }, {
        code: `
        export default <ul>
            <spectrum:dialog>
                <dialog:footer as={ accept, cancel }>
                    <button on-click={ accept() }>OK</button>
                    <button on-click={ cancel() }>Cancel</button>
                </dialog:footer>
                <button on-click={ accept() }>OK</button>
            </spectrum:dialog>
        </ul>;
        `,
        errors: [
            { message: "'accept' is not defined.", type: "Identifier" }
        ]
    }, {
        code: `
        var fruits = "apple";
        export default <using value={ fruits } as={ this.fruit } ></using>;
        `,
        errors: [
            { message: '"this.fruit" is not an identifier. The "as" attribute can only be used with an identifier.', type: "JSXAttribute" }
        ]
    }, {
        code: `
        var f = function() { return 'apple'; };
        export default <repeat collection={ f() } as={ f() } ></repeat>;
        `,
        errors: [
            { message: '"f()" is not an identifier. The "as" attribute can only be used with an identifier.', type: "JSXAttribute" }
        ]
    }, {
        code: `
        @Comp
        export default class C {}
        `,
        errors: [ { message: "'Comp' is not defined.", type: "Identifier" } ]
    }, {
        code: `
        let x = new Store();
        `,
        errors: [ { message: "'Store' is not defined.", type: "Identifier" } ]
    } ]
});

// The below is copied from https://github.com/eslint/eslint/blob/master/tests/lib/rules/no-undef.js
// (Making sure that our new no-undef rule still works with the old use cases)

ruleTester = new RuleTester();

ruleTester.run("jsx-no-undef", jsxNoUndef, {
    valid: [
        "var a = 1, b = 2; a;",
        "/*global b*/ function f() { b; }",
        { code: "function f() { b; }", globals: { b: false } },
        "/*global b a:false*/  a;  function f() { b; a; }",
        "function a(){}  a();",
        "function f(b) { b; }",
        "var a; a = 1; a++;",
        "var a; function f() { a = 1; }",
        "/*global b:true*/ b++;",
        "/*eslint-env browser*/ window;",
        "/*eslint-env node*/ require(\"a\");",
        "Object; isNaN();",
        "toString()",
        "hasOwnProperty()",
        "function evilEval(stuffToEval) { var ultimateAnswer; ultimateAnswer = 42; eval(stuffToEval); }",
        "typeof a",
        "typeof (a)",
        "var b = typeof a",
        "typeof a === 'undefined'",
        "if (typeof a === 'undefined') {}",
        { code: "function foo() { var [a, b=4] = [1, 2]; return {a, b}; }", parserOptions: { ecmaVersion: 6 } },
        { code: "var toString = 1;", parserOptions: { ecmaVersion: 6 } },
        { code: "function myFunc(...foo) {  return foo;}", parserOptions: { ecmaVersion: 6 } },
        { code: "var React, App, a=1; React.render(<App attr={a} />);", parserOptions: { ecmaVersion: 6, ecmaFeatures: { jsx: true } } },
        { code: "var console; [1,2,3].forEach(obj => {\n  console.log(obj);\n});", parserOptions: { ecmaVersion: 6 } },
        { code: "var Foo; class Bar extends Foo { constructor() { super();  }}", parserOptions: { ecmaVersion: 6 } },
        { code: "import Warning from '../lib/warning'; var warn = new Warning('text');", parserOptions: { sourceType: "module" } },
        { code: "import * as Warning from '../lib/warning'; var warn = new Warning('text');", parserOptions: { sourceType: "module" } },
        { code: "var a; [a] = [0];", parserOptions: { ecmaVersion: 6 } },
        { code: "var a; ({a} = {});", parserOptions: { ecmaVersion: 6 } },
        { code: "var a; ({b: a} = {});", parserOptions: { ecmaVersion: 6 } },
        { code: "var obj; [obj.a, obj.b] = [0, 1];", parserOptions: { ecmaVersion: 6 } },
        { code: "URLSearchParams;", env: { browser: true } },
        { code: "Intl;", env: { browser: true } },
        { code: "IntersectionObserver;", env: { browser: true } },
        { code: "Credential;", env: { browser: true } },
        { code: "requestIdleCallback;", env: { browser: true } },
        { code: "customElements;", env: { browser: true } },
        { code: "PromiseRejectionEvent;", env: { browser: true } },

        // Notifications of readonly are removed: https://github.com/eslint/eslint/issues/4504
        { code: "/*global b:false*/ function f() { b = 1; }" },
        { code: "function f() { b = 1; }", globals: { b: false } },
        { code: "/*global b:false*/ function f() { b++; }" },
        { code: "/*global b*/ b = 1;" },
        { code: "/*global b:false*/ var b = 1;" },
        { code: "Array = 1;" },

        // new.target: https://github.com/eslint/eslint/issues/5420
        { code: "class A { constructor() { new.target; } }", parserOptions: { ecmaVersion: 6 } },

        // Experimental,
        {
            code: "var {bacon, ...others} = stuff; foo(others)",
            parserOptions: {
                ecmaVersion: 6,
                ecmaFeatures: {
                    experimentalObjectRestSpread: true
                }
            },
            globals: { stuff: false, foo: false }
        }
    ],
    invalid: [
        { code: "a = 1;", errors: [ { message: "'a' is not defined.", type: "Identifier" } ] },
        { code: "if (typeof anUndefinedVar === 'string') {}", options: [ { typeof: true } ], errors: [ { message: "'anUndefinedVar' is not defined.", type: "Identifier" } ] },
        { code: "var a = b;", errors: [ { message: "'b' is not defined.", type: "Identifier" } ] },
        { code: "function f() { b; }", errors: [ { message: "'b' is not defined.", type: "Identifier" } ] },
        { code: "window;", errors: [ { message: "'window' is not defined.", type: "Identifier" } ] },
        { code: "require(\"a\");", errors: [ { message: "'require' is not defined.", type: "Identifier" } ] },
        { code: "var React; React.render(<img attr={a} />);", parserOptions: { ecmaVersion: 6, ecmaFeatures: { jsx: true } }, errors: [ { message: "'a' is not defined." } ] },
        { code: "var React, App; React.render(<App attr={a} />);", parserOptions: { ecmaVersion: 6, ecmaFeatures: { jsx: true } }, errors: [ { message: "'a' is not defined." } ] },
        { code: "[a] = [0];", parserOptions: { ecmaVersion: 6 }, errors: [ { message: "'a' is not defined." } ] },
        { code: "({a} = {});", parserOptions: { ecmaVersion: 6 }, errors: [ { message: "'a' is not defined." } ] },
        { code: "({b: a} = {});", parserOptions: { ecmaVersion: 6 }, errors: [ { message: "'a' is not defined." } ] },
        { code: "[obj.a, obj.b] = [0, 1];", parserOptions: { ecmaVersion: 6 }, errors: [ { message: "'obj' is not defined." }, { message: "'obj' is not defined." } ] },

        // Experimental
        {
            code: "const c = 0; const a = {...b, c};",
            parserOptions: {
                ecmaVersion: 6,
                ecmaFeatures: {
                    experimentalObjectRestSpread: true
                }
            },
            errors: [ { message: "'b' is not defined." } ]
        }
    ]
});
