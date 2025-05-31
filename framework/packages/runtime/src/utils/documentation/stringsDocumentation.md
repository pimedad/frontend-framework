# The strings.js Documentation

This function takes a string as an argument; it returns true if the string is neither blank nor empty and false otherwise.
`isNotBlankOrEmptyString()` uses the former function, passing it a trimmed version of the string. 

```javascript
export function isNotEmptyString(str) {
  return str !== '';
}

export function isNotBlankOrEmptyString(str) {
  return isNotEmptyString(str.trim());
}
```