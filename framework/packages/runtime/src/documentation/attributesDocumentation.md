# The attributes.js Documentation

When set an attribute on an HTML element in code, we update its corresponding property, like `id` or `class`. This change is reflected in the HTML markup shown in the browser. For example, if we have a `<p>` element with `id="foo"` and change it to `p.id = "bar"`, the HTML updates to `<p id="bar">`. Most properties work this way, but some, like the value attribute of an `<input>`, don’t show in the HTML even when set. For instance, setting `input.value = "yolo"` shows `"yolo"` in the input, but the HTML stays `<input type="text">`. We can read the current `input` value from the value property.

In framework, we handle `class` and `style` attributes specially because they need extra care. The `setAttributes()` function splits attributes into `class`, `style`, and `others`, using other `functions` to set them correctly.


# The setAttributes() function

The `setAttributes()` function is the main function for applying attributes to a DOM element. It’s like a manager that takes all the attributes from a virtual node and decides how to handle each one, splitting them into special cases (`class` and `style`) and regular attributes.

This function is needed because elements in your webpage need attributes to work properly, like having a specific class for styling or an `id` for identification. It checks if there’s a `class` or `style` attribute and uses special functions (`setClass()` and `setStyle()`) to handle them, since they need extra care. All other attributes are passed to `setAttribute()` to be applied directly. This setup makes sure all attributes are set correctly and efficiently.

```javascript
export function setAttributes(el, attrs) {
  const { class: className, style, ...otherAttrs } = attrs; // Splits attributes into class, style, and others

  if (className) {
    setClass(el, className); // Sets the class attribute
  }

  if (style) {
    Object.entries(style).forEach(([prop, value]) => {
      setStyle(el, prop, value); // Sets each style property
    });
  }

  for (const [name, value] of Object.entries(otherAttrs)) {
    setAttribute(el, name, value); // Sets all other attributes
  }
}
```

# The setClass() function

The `setClass()` function sets the `class` attribute on a DOM element. Classes are used to style elements with CSS, and this function makes sure you can set them either as a single string (like `"foo bar"`) or as an array of strings (like `["foo", "bar"]`).

This function is important because developers often need flexibility when adding classes to elements. It clears any existing classes first to avoid conflicts, then checks if the input is a string or an array. If it’s a string, it sets the `className` property directly. If it’s an array, it uses `classList.add()` to add each class. This flexibility lets developers choose the format that works best for them, making your framework easier to use.

```javascript
function setClass(el, className) {
  el.className = ""; // Clears existing classes

  if (typeof className === "string") {
    el.className = className; // Sets classes as a string
  }

  if (Array.isArray(className)) {
    el.classList.add(...className); // Adds classes from an array
  }
}
```

# The setStyle() function

The `setStyle()` function sets a single CSS style property on a DOM element, like `color` or `font-family`. It’s like telling an element exactly how it should look, such as making text red or setting a specific font.

This function is needed because styles are a common way to customize how elements appear on a webpage. It takes the style property name and value, then applies them to the element’s `style` property. This updates the element’s appearance and reflects the style in the HTML, like `style="color: red;"`. It’s simple but essential for making your webpage look the way you want.

```javascript
export function setStyle(el, name, value) {
  el.style[name] = value; // Sets a single style property
}
```

# The removeStyle() function

The `removeStyle()` function removes a specific CSS style property from a DOM element. It’s like erasing one style rule, such as removing the `color` or `font-family` setting, so the element goes back to its default appearance for that property.

This function is important for cleaning up styles when they’re no longer needed, like when updating or removing an element. It sets the style property to `null`, which removes it from the element’s `style` attribute. This keeps the DOM clean and ensures the element doesn’t keep outdated styles.

```javascript
export function removeStyle(el, name) {
  el.style[name] = null; // Removes a single style property
}
```

# The setAttribute() function

The `setAttribute()` function sets a single attribute on a DOM element, like `id`, `type`, or a custom `data-*` attribute. It’s like giving an element a specific setting or label that controls its behavior or appearance.

This function is needed because not all attributes are as complex as `class` or `style`. For most attributes, you can simply set the element’s property (like `el.id = "foo"`) to update the HTML. However, it handles special cases: if the value is `null`, it removes the attribute; if the attribute starts with `data-`, it uses the DOM’s `setAttribute()` method to ensure proper handling. This makes the function versatile and safe for all kinds of attributes.

```javascript
export function setAttribute(el, name, value) {
  if (value == null) {
    removeAttribute(el, name); // Removes the attribute if value is null
  } else if (name.startsWith("data-")) {
    el.setAttribute(name, value); // Sets data-* attributes using setAttribute()
  } else {
    el[name] = value; // Sets other attributes directly
  }
}
```

# The removeAttribute() function

The `removeAttribute()` function removes a single attribute from a DOM element. It’s like deleting a setting from an element, such as removing its `id` or a custom `data-*` attribute, so it no longer applies.

This function is responsible for cleaning up elements when their attributes are no longer needed, like when updating or destroying the DOM. It sets the element’s property to `null` and calls the DOM’s `removeAttribute()` method to ensure the attribute is completely removed from the HTML. This prevents leftover attributes from causing issues in your webpage.

```javascript
export function removeAttribute(el, name) {
  el[name] = null; // Clears the property
  el.removeAttribute(name); // Removes the attribute from the HTML
}
```