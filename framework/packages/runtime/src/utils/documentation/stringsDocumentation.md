# The isNotBlankOrEmptyString() function

This function takes a string as an argument; it returns true if the string is neither blank nor empty and false otherwise.
`isNotBlankOrEmptyString()` uses the former function, passing it a trimmed version of the string. 

```
export function isNotEmptyString(str) {
  return str !== '';
}

export function isNotBlankOrEmptyString(str) {
  return isNotEmptyString(str.trim());
}
```