# The arrays.js Explanation

When we  use **_conditional rendering_** (_rendering nodes only when a condition is met_), some `children` may be `null` in the array, which means that they shouldn’t be `rendered`. We want to remove these `null` values from the array of `children`.
This `null` value means that the dom type element shouldn’t be added to the DOM. The simplest way to make this process work is to filter out `null` values from the `children` `array` when a new `virtual node` is created so that a `null` `node` isn’t passed around the **_framework_**:

## The withoutNulls function

function called `withoutNulls()` that takes an array and `returns` a new array with all the null values removed:

```
export function withoutNulls(arr) {
    return arr.filter((item) => item != null)
}
