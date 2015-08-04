# Havana browser

[![Build Status](https://travis-ci.org/colinmeinke/havana-browser.svg?branch=master)](https://travis-ci.org/colinmeinke/havana-browser)

A client-side request/response dispatcher.

Havana browser intercepts `click` and `popstate` events,
publishes a `request.received` event and subscribes to
`response.send` events published by a response handler.
When a `response.send` event is received Havana browser
patches the DOM with the response content using
[virtual dom](https://github.com/Matt-Esch/virtual-dom).

## How to install

```
npm install havana-browser
```

## How to use

```javascript
import Browser from 'havana-browser';
import Event from 'havana-event';

const event = new Event();

const reporting = {
  'level': 2,
  'reporter': console.log.bind( console ),
};

const browser = new Browser({
  'event': event,
  'reporting': reporting,
});

// Add a response handler here

browser.listen();
```

## Event list

Events take the form of
[Havana event](https://github.com/colinmeinke/havana-event)
or a library with an interchangeable API.

### Publish

- `request.listening`: Signifies that Havana browser will now
  attempt to intercept `click` and `popstate` events.
- `request.received`: Signifies that Havana browser has
  intercepted a `click` or `popstate` event, publishing
  the request data for consumption by response handlers.
- `response.error`: Signifies that all registered response
  handlers have failed to provide a response, and Havana
  browser will not take any further action.

### Subscribe

- `response.handler.register`: Allows a response handler to
  notify Havana browser that they will attempt to handle
  requests.
- `response.handler.error`: Allows a response handler to
  notify Havana browser that they have not been able to
  handle a request.
- `response.send`: Allows a response handler to send a
  response to Havana browser.

## ES2015+

Havana browser is written using ES2015+ syntax.

However, by default this module will use an ES5
compatible file that has been compiled using
[Babel](https://babeljs.io).

Havana browser currently requires the 
[Babel polyfill](https://babeljs.io/docs/usage/polyfill).
In the `dist` directory there are two files, the default
`browser.js` and `browser.with-polyfill.js` that includes
the Babel browser polyfill.
