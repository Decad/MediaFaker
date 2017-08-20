# Media Faker

Treat an element as if its the viewport for css. Making media queries work without an iframe.

## Usage

```JavaScript
var mf = new mediafaker({
  // The target element as a selector or dom referrence
  element: '.stage',
});
```

### Note

Currently Media Faker removes all media queries in any active stylesheet, soon this will be configurable.

## Use Cases

This is a pretty obscure library so Why use this? MediaFaker was created for use in documentation for a component library. Allowing users to see how the component works at different viewport sizes without having to resize their browser.

## Examples

See the examples folder for examples

### Bootstrap

Running bootstrap media queries inside a resizable div without using an Iframe

![example](/example/mediafaker-example.gif)


## License
MIT
