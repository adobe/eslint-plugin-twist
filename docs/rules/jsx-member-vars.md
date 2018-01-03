# Prevent Import members and variables used in JSX to be marked as 'no-unused'

ESLint `no-unused-vars` rule does not detect variables used in JSX. This rule will locate variables used
within JSX and mark them as used.

*NOTE!:* This rule only has an effect when the `no-unused-vars` rule is enabled.

## Rule Details

The following patterns are considered errors:

```js
import Member from './Member';
```

```js
const Member;
```

The following patterns are no longer considered errors:

```jsx
import Member from '.Member';

<Member />;
```

```jsx
const Member;

<Member />;
```

## When Not To Use It

If you are not using Twist and JSX and if `no-unused-vars` rule is disabled.
