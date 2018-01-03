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
 * @author Manuel Castellanos Raboso
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const requireIndex = require("requireindex");

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

"use strict";

module.exports = {
    environments: {
        "twist": {
            globals: {
                "Component": true,
                "Prototype": true,
                "Attribute": true,
                "Observable": true,
                "Task": true,
                "Abstract": true,
                "Bind": true,
                "Debounce": true,
                "Delay": true,
                "Memoize": true,
                "Throttle": true,
                "Cache": true,
                "Store": true,
                "State": true,
                "Json": true,
                "Route": true,
                "Action": true,
            }
        }
    },
    rules: requireIndex(__dirname + "/src/rules"),
    configs: {
        recommended: {
            env: {
                "twist": true
            },
            rules: {
                "twist/jsx-member-vars": 2,
                "twist/jsx-no-undef": 2
            }
        }
    }
};
