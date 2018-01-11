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
'use strict';

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

const constructorSuper = require('../../../src/rules/constructor-super');
let ruleTester = new RuleTester({ parserOptions, parser: 'babel-eslint' });

ruleTester.run('constructor-super', constructorSuper, {
    valid: [ {
        code: `
        @Store
        class MyStore {
            constructor() {
                super();
                this.x = 2;
            }
        }
        `
    }, {
        code: `
        @Prototype
        class MyClass {
            constructor() {
                this.x = 2;
            }
        }
        `
    }, {
        code: `
        @Store({ mutable: true })
        class MyStore {
            constructor() {
                super();
                this.x = 2;
            }
        }
        `
    }, {
        code: `
        @Prototype({ x: 3 })
        class MyClass {
            constructor() {
                this.x = 2;
            }
        }
        `
    } ],
    invalid: [ {
        code: `
        @Store
        class MyStore {
            constructor() {
                this.x = 2;
            }
        }
        `,
        errors: [ {
            message: `Expected to call 'super()'.`,
            line: 4
        } ],
        parser: 'babel-eslint'
    }, {
        code: `
        @Prototype
        class MyClass {
            constructor() {
                super();
                this.x = 2;
            }
        }
        `,
        errors: [ {
            message: `Unexpected 'super()'.`,
            line: 5
        } ],
        parser: 'babel-eslint'
    }, {
        code: `
        @Store({ mutable: true })
        class MyStore {
            constructor() {
                this.x = 2;
            }
        }
        `,
        errors: [ {
            message: `Expected to call 'super()'.`,
            line: 4
        } ],
        parser: 'babel-eslint'
    }, {
        code: `
        @Prototype({ x: 3 })
        class MyClass {
            constructor() {
                super();
                this.x = 2;
            }
        }
        `,
        errors: [ {
            message: `Unexpected 'super()'.`,
            line: 5
        } ],
        parser: 'babel-eslint'
    } ]
});

/*
 *  The below is copied from https://github.com/eslint/eslint/blob/master/tests/lib/rules/no-undef.js
 *  (Making sure that our new no-undef rule still works with the old use cases),
 *  which is licensed under the following:
 *
 *  Copyright JS Foundation and other contributors, https://js.foundation
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

ruleTester = new RuleTester({ parserOptions });

ruleTester.run('constructor-super', constructorSuper, {
    valid: [

        // non derived classes.
        'class A { }',
        'class A { constructor() { } }',

        /*
         * inherit from non constructors.
         * those are valid if we don't define the constructor.
         */
        'class A extends null { }',

        // derived classes.
        'class A extends B { }',
        'class A extends B { constructor() { super(); } }',
        'class A extends B { constructor() { if (true) { super(); } else { super(); } } }',
        'class A extends (class B {}) { constructor() { super(); } }',
        'class A extends (B = C) { constructor() { super(); } }',
        'class A extends (B || C) { constructor() { super(); } }',
        'class A extends (a ? B : C) { constructor() { super(); } }',
        'class A extends (B, C) { constructor() { super(); } }',

        // nested.
        'class A { constructor() { class B extends C { constructor() { super(); } } } }',
        'class A extends B { constructor() { super(); class C extends D { constructor() { super(); } } } }',
        'class A extends B { constructor() { super(); class C { constructor() { } } } }',

        // ignores out of constructors.
        'class A { b() { super(); } }',
        'function a() { super(); }',

        // multi code path.
        'class A extends B { constructor() { a ? super() : super(); } }',
        'class A extends B { constructor() { if (a) super(); else super(); } }',
        'class A extends B { constructor() { switch (a) { case 0: super(); break; default: super(); } } }',
        'class A extends B { constructor() { try {} finally { super(); } } }',
        'class A extends B { constructor() { if (a) throw Error(); super(); } }',

        // returning value is a substitute of 'super()'.
        'class A extends B { constructor() { if (true) return a; super(); } }',
        'class A extends null { constructor() { return a; } }',
        'class A { constructor() { return a; } }',

        // https://github.com/eslint/eslint/issues/5261
        'class A extends B { constructor(a) { super(); for (const b of a) { this.a(); } } }',

        // https://github.com/eslint/eslint/issues/5319
        'class Foo extends Object { constructor(method) { super(); this.method = method || function() {}; } }',

        // https://github.com/eslint/eslint/issues/5394
        [
            'class A extends Object {',
            '    constructor() {',
            '        super();',
            '        for (let i = 0; i < 0; i++);',
            '    }',
            '}'
        ].join('\n'),

        // https://github.com/eslint/eslint/issues/5894
        'class A { constructor() { return; super(); } }',

        // https://github.com/eslint/eslint/issues/8848
        // `
        //     class A extends B {
        //         constructor(props) {
        //             super(props);
        //
        //             try {
        //                 let arr = [];
        //                 for (let a of arr) {
        //                 }
        //             } catch (err) {
        //             }
        //         }
        //     }
        // `
    ],
    invalid: [

        // non derived classes.
        {
            code: 'class A { constructor() { super(); } }',
            errors: [ { message: "Unexpected 'super()'.", type: 'CallExpression' } ]
        },

        // inherit from non constructors.
        {
            code: 'class A extends null { constructor() { super(); } }',
            errors: [ { message: "Unexpected 'super()' because 'super' is not a constructor.", type: 'CallExpression' } ]
        },
        {
            code: 'class A extends null { constructor() { } }',
            errors: [ { message: "Expected to call 'super()'.", type: 'MethodDefinition' } ]
        },
        {
            code: 'class A extends 100 { constructor() { super(); } }',
            errors: [ { message: "Unexpected 'super()' because 'super' is not a constructor.", type: 'CallExpression' } ]
        },
        {
            code: "class A extends 'test' { constructor() { super(); } }",
            errors: [ { message: "Unexpected 'super()' because 'super' is not a constructor.", type: 'CallExpression' } ]
        },

        // derived classes.
        {
            code: 'class A extends B { constructor() { } }',
            errors: [ { message: "Expected to call 'super()'.", type: 'MethodDefinition' } ]
        },
        {
            code: 'class A extends B { constructor() { for (var a of b) super.foo(); } }',
            errors: [ { message: "Expected to call 'super()'.", type: 'MethodDefinition' } ]
        },

        // nested execution scope.
        {
            code: 'class A extends B { constructor() { function c() { super(); } } }',
            errors: [ { message: "Expected to call 'super()'.", type: 'MethodDefinition' } ]
        },
        {
            code: 'class A extends B { constructor() { var c = function() { super(); } } }',
            errors: [ { message: "Expected to call 'super()'.", type: 'MethodDefinition' } ]
        },
        {
            code: 'class A extends B { constructor() { var c = () => super(); } }',
            errors: [ { message: "Expected to call 'super()'.", type: 'MethodDefinition' } ]
        },
        {
            code: 'class A extends B { constructor() { class C extends D { constructor() { super(); } } } }',
            errors: [ { message: "Expected to call 'super()'.", type: 'MethodDefinition', column: 21 } ]
        },
        {
            code: 'class A extends B { constructor() { var C = class extends D { constructor() { super(); } } } }',
            errors: [ { message: "Expected to call 'super()'.", type: 'MethodDefinition', column: 21 } ]
        },
        {
            code: 'class A extends B { constructor() { super(); class C extends D { constructor() { } } } }',
            errors: [ { message: "Expected to call 'super()'.", type: 'MethodDefinition', column: 66 } ]
        },
        {
            code: 'class A extends B { constructor() { super(); var C = class extends D { constructor() { } } } }',
            errors: [ { message: "Expected to call 'super()'.", type: 'MethodDefinition', column: 72 } ]
        },

        // lacked in some code path.
        {
            code: 'class A extends B { constructor() { if (a) super(); } }',
            errors: [ { message: "Lacked a call of 'super()' in some code paths.", type: 'MethodDefinition' } ]
        },
        {
            code: 'class A extends B { constructor() { if (a); else super(); } }',
            errors: [ { message: "Lacked a call of 'super()' in some code paths.", type: 'MethodDefinition' } ]
        },
        {
            code: 'class A extends B { constructor() { a && super(); } }',
            errors: [ { message: "Lacked a call of 'super()' in some code paths.", type: 'MethodDefinition' } ]
        },
        {
            code: 'class A extends B { constructor() { switch (a) { case 0: super(); } } }',
            errors: [ { message: "Lacked a call of 'super()' in some code paths.", type: 'MethodDefinition' } ]
        },
        {
            code: 'class A extends B { constructor() { switch (a) { case 0: break; default: super(); } } }',
            errors: [ { message: "Lacked a call of 'super()' in some code paths.", type: 'MethodDefinition' } ]
        },
        {
            code: 'class A extends B { constructor() { try { super(); } catch (err) {} } }',
            errors: [ { message: "Lacked a call of 'super()' in some code paths.", type: 'MethodDefinition' } ]
        },
        {
            code: 'class A extends B { constructor() { try { a; } catch (err) { super(); } } }',
            errors: [ { message: "Lacked a call of 'super()' in some code paths.", type: 'MethodDefinition' } ]
        },
        {
            code: 'class A extends B { constructor() { if (a) return; super(); } }',
            errors: [ { message: "Lacked a call of 'super()' in some code paths.", type: 'MethodDefinition' } ]
        },

        // duplicate.
        {
            code: 'class A extends B { constructor() { super(); super(); } }',
            errors: [ { message: "Unexpected duplicate 'super()'.", type: 'CallExpression', column: 46 } ]
        },
        {
            code: 'class A extends B { constructor() { super() || super(); } }',
            errors: [ { message: "Unexpected duplicate 'super()'.", type: 'CallExpression', column: 48 } ]
        },
        {
            code: 'class A extends B { constructor() { if (a) super(); super(); } }',
            errors: [ { message: "Unexpected duplicate 'super()'.", type: 'CallExpression', column: 53 } ]
        },
        {
            code: 'class A extends B { constructor() { switch (a) { case 0: super(); default: super(); } } }',
            errors: [ { message: "Unexpected duplicate 'super()'.", type: 'CallExpression', column: 76 } ]
        },
        {
            code: 'class A extends B { constructor(a) { while (a) super(); } }',
            errors: [
                { message: "Lacked a call of 'super()' in some code paths.", type: 'MethodDefinition' },
                { message: "Unexpected duplicate 'super()'.", type: 'CallExpression', column: 48 }
            ]
        },

        // ignores `super()` on unreachable paths.
        {
            code: 'class A extends B { constructor() { return; super(); } }',
            errors: [ { message: "Expected to call 'super()'.", type: 'MethodDefinition' } ]
        },

        // https://github.com/eslint/eslint/issues/8248
        {
            code: `class Foo extends Bar {
                constructor() {
                    for (a in b) for (c in d);
                }
            }`,
            errors: [ { message: "Expected to call 'super()'.", type: 'MethodDefinition' } ]
        }
    ]
});
