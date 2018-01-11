/*
 *  Modification of original source from https://github.com/eslint/eslint/blob/master/lib/rules/no-undef.js,
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
 * @fileoverview Extends eslint 'no-undef' rule for Twist's structural components, like <repeat> and <using>.
 *
 * Since the knowledge of Twist's JSX isn't built into ESLint's scope, this rule has to determine
 * the scope of JSX-defined variables (via the 'as' and 'for' attributes).
 *
 * The 'as' and 'for' attributes are scoped to the JSXElement where they're defined,
 * so we can simply walk up the node tree for each "global" variable (as per ESLint), and see if
 * it was actually defined.
 */
'use strict';

//----------------------------------------------------------------------
// Helpers
//----------------------------------------------------------------------

const getTwistConfiguration = require('../twist-config');

const hasTypeOfOperator = node => {
    var parent = node.parent;

    return parent && parent.type === 'UnaryExpression' && parent.operator === 'typeof';
};

const isJSXTag = (node, tag) => {
    if (node.name && node.name.type === 'JSXIdentifier' && (!tag || node.name.name === tag)) {
        return true;
    }
    if (node.name && node.name.type === 'JSXNamespacedName' && (!tag || (node.name.namespace.name + ':' + node.name.name.name) === tag)) {
        return true;
    }
    return false;
};

const isDecorator = node => {
    for (let n = node; n; n = n.parent) {
        if (n.type === 'Decorator') {
            return true;
        }
    }
    return false;
};

const isNameInExpression = (expression, name) => {
    if (expression.type === 'Identifier') {
        return expression.name === name;
    }
    if (expression.type === 'SequenceExpression') {
        // Right now, the only valid
        return expression.expressions[0].name === name || expression.expressions[1].name === name;
    }
    return false;
};

const isNameInAsAttribute = (asObject, name) => {
    if (asObject) {
        return isNameInExpression(asObject.value.expression, name);
    }
    return false;
};

const isNameInForAttribute = (forObject, name) => {
    if (forObject) {
        return isNameInExpression(forObject.value.expression.left, name);
    }
    return false;
};




//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Extends eslint 'no-undef' rule for Twist structural components",
            category: 'Twist',
            recommended: true
        },
        fixable: null, // or "code" or "whitespace"
        schema: [ {
            'type': 'object',
            'properties': {
                'typeof': {
                    'type': 'boolean'
                }
            },
            'additionalProperties': false
        } ]
    },

    create(context) {
        const options = context.options[0];
        const considerTypeOf = options && options.typeof === true || false;

        // Returns the name of the identifier in the passed in attribute, and also checks that it isn't an identifier!
        // (e.g. you can't write as={ 2 + 4 } - it has to be an identifier name).
        const attrIdentifierName = function(attr) {
            if (!attr) {
                return;
            }

            let value = attr.value;
            if (value && value.expression.type === 'Identifier') {
                return value.expression.name;
            }

            if (value && value.expression.type === 'SequenceExpression') {
                // As can take a sequence (e.g. as={ item, index}).
                return;
            }

            // Otherwise, we got an attribute whose value is _not_ an identifier - not allowed for as/define-ref
            context.report({
                node: attr,
                message: '"{{expr}}" is not an identifier. The "{{attr}}" attribute can only be used with an identifier.',
                data: {
                    expr: context.getSourceCode().getText(value.expression),
                    attr: attr.name.name
                }
            });
        };

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            JSXOpeningElement(node) {
                // We need to go through the define-ref attributes as we see them,
                // so that we can hoist the knowledge of their definition to the parent
                // (they have the scope of the containing JSX fragment).
                let attributes = node.attributes;
                for (let i = 0; i < attributes.length; i++) {
                    let attr = attributes[i];
                    if (attr && attr.name) {
                        switch(attr.name.name) {
                        case 'as':
                            attrIdentifierName(attr, true);
                            break;
                        }
                    }
                }
            },
            'Program:exit'() {
                const globalScope = context.getScope();
                const twistConfig = getTwistConfiguration();
                const twistDecorators = twistConfig.decorators || {};

                globalScope.through.forEach(({ identifier }) => {
                    let node = identifier;

                    if (!considerTypeOf && hasTypeOfOperator(identifier)) {
                        return;
                    }

                    let identifierName = identifier.name;

                    // First check for decorators - they're ok if defined
                    if (twistDecorators[identifierName] && isDecorator(identifier)) {
                        return;
                    }

                    while (node.parent) {
                        node = node.parent;

                        if (node.type === 'JSXElement') {
                            // we convert the attributes to a map to be able to evaluate the assignments
                            const attrMap = node.openingElement.attributes.reduce((result, attr) => {
                                let map = result;
                                if (attr && attr.name) {
                                    map[attr.name.name] = attr;
                                }
                                return result;
                            }, {});

                            if (isJSXTag(node.openingElement, 'repeat')) {
                                // adds support for <repeat for={ item in value }></repeat>
                                // adds support for <repeat for={ (item, index) in value }></repeat>
                                if (isNameInForAttribute(attrMap.for, identifierName)
                                    // adds support for <repeat collection={ value } as={ item }></repeat>
                                    // adds support for <repeat collection={ value } as={ item, index }></repeat>
                                    || isNameInAsAttribute(attrMap.as, identifierName)) {
                                    return;
                                }
                            }
                            // adds support for <using value={ value } as={ item }></using>
                            else if (isJSXTag(node.openingElement, 'using')) {
                                if (isNameInAsAttribute(attrMap.as, identifierName)) {
                                    return;
                                }
                            }
                            // adds support for <MyComponent as={ params } />
                            else if (isJSXTag(node.openingElement)) {
                                if (isNameInAsAttribute(attrMap.as, identifierName)) {
                                    return;
                                }
                            }
                        }
                    }

                    context.report({
                        node: identifier,
                        message: "'{{name}}' is not defined.",
                        data: identifier
                    });
                });
            }
        };
    }
};
