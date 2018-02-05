# ESLint Plugin for Twist

[![Build Status](https://travis-ci.org/adobe/eslint-plugin-twist.svg?branch=master)](https://travis-ci.org/adobe/eslint-plugin-twist)

Custom rules to support [Twist](https://github.com/adobe/twist) features, such as auto-imports and JSX syntax.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
npm install eslint --save-dev
npm install @twist/eslint-plugin-core --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `@twist/eslint-plugin` globally.

## Usage

Add `twist` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "@twist/core"
    ]
}

Then add the recommended rules to your `extends` section:

```JSON
{
    "extends": [
        "plugin:@twist/core/recommended"
    ]
}
```

Alternative, you can configure the rules you want to use individually, under the rules section:

```json
{
    "rules": {
        "@twist/core/rule-name": "error"
    }
}
```

## Supported Rules

* [@twist/core/jsx-member-vars](docs/rules/jsx-member-vars.md): Prevent imported members and variables used in JSX from being marked as unused.
* [@twist/core/no-undef](docs/rules/no-undef.md): Extends the eslint 'no-undef' rule for Twist structural components like `<repeat>` and `using`, and to understand auto-imported decorators.
* [@twist/core/constructor-super](docs/rules/constructor-super.md): Extends the eslint 'constructor-super' rule to understand Twist class decorators that auto-extend a class (e.g. `@Store` and `@Component`).

Note: This eslint plugin reads your `.twistrc` configuration file to determine which decorators are auto-imported, based on which Twist libraries you use.

## Proposing a new Rule

If you find that the current set of rules are not enough to handle a specific case in your Twist project, here are the
steps for proposing a new one:

1. File an issue describing the case with the code snippet that is incorrectly handled by ESLint
2. Propose in the issue if possible an expected behavior
3. Label the issue as appropriately as possible, so that it's processed in the correct priority
4. If you want to fix an issue yourself, first assign it to you so everyone knows it's in progress
5. When creating the PR with the fix for the issue make sure you [reference the issue ID](https://help.github.com/articles/closing-issues-using-keywords/)
to have it automatically closed when merged

## Writing rules

Writing a rule requires a non-trivial amount of work and some base boilerplate code. In order to make the task easy you
can read our [ESLint How-To Guide](ESLINT_HOWTO.md).

## .eslintrc sample configuration

Here's an example of using the Twist ESLint plugin in conjunction with the `eslint:recommended` rules:

```js
{
    "parser": "babel-eslint",
    "plugins": [
        "babel",
        "@twist/core"
    ],
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@twist/core/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        },
        "sourceType": "module"
    }
}
```
