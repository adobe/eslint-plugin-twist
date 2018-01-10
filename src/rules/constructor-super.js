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
 * @fileoverview Extending eslint 'constructor-super' rule to understand Twist's auto-imports that extend classes
 */
'use strict';

const constructorSuperRule = require('eslint/lib/rules/constructor-super');
const getTwistConfiguration = require('../twist-config');

function isAutoExtended(classNode) {
    // Look to see if we have a class decorator that extends from a super-class
    const twistDecorators = getTwistConfiguration().decorators || {};
    const isExtendedDecorator = decorator => {
        const name = decorator.expression && decorator.expression.name;
        if (name && twistDecorators[name]) {
            return twistDecorators[name].inherits !== undefined;
        }
        return false;
    };
    return classNode.decorators && classNode.decorators.some(isExtendedDecorator);
}

module.exports = {
    meta: {
        docs: {
            description: 'require `super()` calls in constructors - understands Twist auto-imports',
            category: 'Twist',
            recommended: true
        },
        fixable: null, // or "code" or "whitespace"
        schema: []
    },

    create(context) {
        let visitor = constructorSuperRule.create(context);

        let onCodePathStart = visitor.onCodePathStart;
        visitor.onCodePathStart = function(codePath, node) {
            // See if it's a constructor of a class (replicates what happens inside the original onCodePathStart)
            const isConstructorFunction = node.type === 'FunctionExpression'
                && node.parent.type === 'MethodDefinition'
                && node.parent.kind === 'constructor';
            if (isConstructorFunction) {
                let classNode = node.parent.parent.parent;
                if (!classNode.superClass && isAutoExtended(classNode)) {
                    // TODO: This is really hacky, but it's the only way to avoid copying the entire constructor-super rule
                    // just to make this change. We may need to do so still if this isn't robust:
                    node = {
                        type: 'FunctionExpression',
                        parent: {
                            type: 'MethodDefinition',
                            kind: 'constructor',
                            parent: {
                                parent: {
                                    superClass: {
                                        type: 'ClassExpression'
                                    }
                                }
                            }
                        }
                    };
                }
            }

            onCodePathStart(codePath, node);
        };

        return visitor;
    }
};
