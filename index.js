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
 * @fileoverview Custom rules to support syntactic features of Twist
 * @author Adobe
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const requireIndex = require('requireindex');

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

'use strict';

module.exports = {
    rules: requireIndex(__dirname + '/src/rules'),
    configs: {
        recommended: {
            rules: {
                '@twist/core/jsx-member-vars': 'warn',
                '@twist/core/no-undef': 'error',
                '@twist/core/constructor-super': 'error',
                'constructor-super': 'off',
                'no-undef': 'off'
            }
        }
    }
};
