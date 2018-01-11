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
 * @fileoverview Prevent Import members and variables used in JSX to be marked as 'no-unused'
 */
'use strict';

//----------------------------------------------------------------------
// Helpers
//----------------------------------------------------------------------

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: 'Prevent Import members and variables used in JSX to be marked as unused',
            category: 'Twist',
            recommended: true
        },
        fixable: null, // or "code" or "whitespace"
        schema: []
    },

    create(context) {

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            JSXOpeningElement(node) {
                let name;
                if (node.name && node.name.namespace && node.name.namespace.name) {
                    // <Member:Var>
                    name = node.name.namespace.name;
                }
                else if (node.name && node.name.name) {
                    // <Member>
                    name = node.name.name;
                }
                else if (node.name && node.name.object) {
                    // <Member...Var>
                    let parent = node.name.object;
                    while (parent.object) {
                        parent = parent.object;
                    }
                    name = parent.name;
                }
                else {
                    return;
                }
                context.markVariableAsUsed(name);
            }
        };
    }
};
