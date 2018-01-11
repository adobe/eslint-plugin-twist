# Extends eslint 'constructor-super' rule for Twist.

This rule is the same as the standard ESlint [`constructor-super` rule](http://eslint.org/docs/rules/constructor-super), but it additionally recognizes the class decorators in Twist that change a class to be inherited from a base class (e.g. `@Store`, `@Component`). It reads this configuration from the `.twistrc` file, so only decorators that actually extend the class are required to have a `super()` call in the constructor.

## Rule Details

The following patterns are not considered errors:

```js
@Store
class MyStore {
    constructor(INITIAL_STATE) {
        super(INITIAL_STATE);
    }
}
```

```js
@Prototype({x : 2})
class MyClass {
    constructor() {
    }
}
```

The following patterns are considered errors:

```js
@Store
class MyStore {
    constructor() {
    }
}
```

```js
@Prototype({x : 2})
class MyClass {
    constructor() {
        super();
    }
}
```

## When Not To Use It

If you are not using the decorators of Twist.
