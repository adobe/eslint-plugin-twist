# Extends eslint 'no-undef' rule for Twist.

This rule is the same as the standard ESlint [`no-undef` rule](http://eslint.org/docs/rules/no-undef), but it additionally recognizes variables defined in Twist's structural JSX components - in particular in `<repeat>` and `<using>` - as well as auto-imported decorators (as read from the .twistrc file).

## Rule Details

The following patterns are not considered errors:

```jsx
<repeat for={ item in fruits }>
    <li>{ item }</li>
</repeat>
```

```jsx
<repeat for={ (item, index) in fruits }>
    <li>{ item }</li>
</repeat>
```

```jsx
<repeat collection={ fruits } as={ item }>
    <li>{ item }</li>
</repeat>
```

```jsx
<repeat collection={ fruits } as={ item, index }>
    <li>{ item }</li>
</repeat>
```

```jsx
<using value={ fruit } as={ item }>
    <li>{ item }</li>
</using>
```

```js
// Assumes a .twistrc file that includes only @twist/core
@Store
class MyStore {
}
```

The following patterns are considered errors:

```js
var a = someFunction();
b = 10;
```

```jsx
<using value={ fruit } as={ myItem }>
    <li>{ item }</li>
</using>
```

```jsx
<repeat collection={ fruits } as={ item() }>
    <li>{ item() }</li>
</repeat>
```

```js
// Assumes a .twistrc file that includes only @twist/core
@Stooore
class MyStore {
}
```


## When Not To Use It

If you are not using the structural components or auto-imported decorators of Twist.
