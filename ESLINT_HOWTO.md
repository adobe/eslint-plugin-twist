# How to write new ESLint rules

There is a [Yeoman](http://yeoman.io) generator that helps create all the boilerplate code required when creating new
plugins and rules. The generator for Yeoman can be found [here](https://github.com/eslint/generator-eslint).

## Installation

First install Yeoman and the ESLint generator globally.
```
npm install -g yo
npm install -g generator-eslint
```

## Generating code

The Yeoman ESLint generator can do two things:
1. Generate boilerplate code for new ESlint plugins
2. Generate boilerplate code for new Rules within a plugin

Since the initial structure for the plugin is already in place within this project, we simply need to create new rules
as follows:
```
yo eslint:rule
```

This will prompt some options which should be completed as follows:
```
? What is your name? <Full Name> // The author's name
? Where will this rule be published? <ESLint Plugin> // This rule is not part of the ESLint Core so choose ESLint Plugin
? What is the rule ID? <rule-name> // please use kebabcase for rule names
? Type a short description of this rule: <Rule Description>
? Type a short example of the code that will fail: <Rule Example>
```

**Note:** *If you are not familiar with Yeoman please read the [Getting started](http://yeoman.io/learning/index.html).*

When these steps are completed the generator will have had created three files:
```
docs/rules/<rule-name>.md
lib/rules/<rule-name>.js
tests/lib/rules/<rule-name>.js

```

## Writing custom rules

To write custom rules requires some understanding on how JavaScript is parsed. ESLint uses by default a JavaScript
parser called `Acorn`. We prefer to use `Babel Eslint` in order to support modern ECMAScript syntax that is required
when working with Twist. The parser generates an AST (Abstract Syntax Tree) out of the JavaScript code.

Custom rules can then introspect certain types of nodes in the AST tree, perform checks when the conditions configured
in the rule are met, and report any encountered issues with their corresponding severity.

There is an online based tool called [AST Explorer](https://astexplorer.net) that generates the AST tree from a snippet
of JavaScript and allows us to apply ESLint rules on realtime. If you decide to use to check your rule, please make sure
that you configure the AST Explorer to meet the following recommended settings:
```
Parser: Babel Eslint v7+
Transformer: ESLint v4+
```

**NOTE:** Besides this information about tooling it's highly encouraged to go through all the
[additional reading](#additional-reading) as it's imperative that one understands how ESLint works first.

## Example Rule

1. Go to [AST Explorer](https://astexplorer.net) and first configure the recommended settings
2. In the `top left` JavaScript window panel add:
```js
var framework = 'Twist';
```
3. In the `bottom left` ESLint Rule window panel add this sample rule:
```js
module.exports = {
	meta: {
		docs: {
			description: "This is an example of a very strict rule which enforces a variable with the name `framework` to have the value `Twist`",
			category: "Twist",
			recommended: true
		},
		fixable: null, // or "code" or "whitespace"
		schema: []
	},
	create: function(context) {
		return {
			"VariableDeclaration": function(node) {
			    node.declarations.forEach(variableDeclarator => {
			    	if(variableDeclarator.id.name === 'framework' &&
			    	    variableDeclarator.init.type === 'Literal' &&
			    	    variableDeclarator.init.value !== 'Twist') {
			    		context.report(node, 'Required value to be "Twist"');
			    	}
			    });
			}
		};
	}
};
```
**NOTE:** *If you can't see the `botton left` ESLint Rule window panel enable `Transform` at the `top` and `select ESLint V3`*

4. Right away you can inspect the generated AST tree on the `top right` AST Tree window panel. Take a moment to analyze
the structure and the nodes to get sense of what's going on

5. Change the value of the variable name `framework` to something else other than `Twist` in the JavaScript window and
observe the updated AST Tree along with the `bottom right` ESLint Report window panel

6. ESLint rule reports an error as it would in the CLI or IDE. If everything is valid you will see the message `Lint rule not fired.`

## Testing

We are using [Mocha](https://mochajs.org) for unit testing. Rules must be tested in all applicable `Valid` and
`Invalid` scenarios. Please refer to the [existing rules](tests/lib/rules/) for examples on how to cover with unit tests.


## Additional Reading

* [ESLint Working with Plugins](http://eslint.org/docs/developer-guide/working-with-plugins)
* [ESLint Working with Rules](http://eslint.org/docs/developer-guide/working-with-rules)
