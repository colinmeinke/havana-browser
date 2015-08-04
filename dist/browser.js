'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _virtualDomDiff = require('virtual-dom/diff');

var _virtualDomDiff2 = _interopRequireDefault(_virtualDomDiff);

var _virtualDomPatch = require('virtual-dom/patch');

var _virtualDomPatch2 = _interopRequireDefault(_virtualDomPatch);

var _vdomVirtualize = require('vdom-virtualize');

var _vdomVirtualize2 = _interopRequireDefault(_vdomVirtualize);

var _ = new WeakMap();

var Browser = (function () {
  function Browser(config) {
    _classCallCheck(this, Browser);

    var props = {
      'event': config.event,
      'handlers': [],
      'id': 1,
      'listeners': [],
      'navigateRef': this.navigate.bind(this),
      'reporting': config.reporting,
      'requests': new Map()
    };

    _.set(this, props);

    this.init();
  }

  _createClass(Browser, [{
    key: 'init',
    value: function init() {
      var _this = this;

      var event = _.get(this).event;
      var handlers = _.get(this).handlers;
      var requests = _.get(this).requests;

      event.subscribe('response.handler.register', function (data) {
        handlers.push(data.name);
      });

      event.subscribe('response.handler.error', function (data) {
        var request = requests.get(data.id);

        if (request) {
          request.handlerErrors++;

          if (request.handlerErrors === handlers.length) {
            event.publish('response.error', data);
          }
        }
      });

      event.subscribe('response.send', function (data) {
        if (data.content) {
          var content = new DOMParser().parseFromString(data.content, 'text/html');
          var currentTree = (0, _vdomVirtualize2['default'])(document.documentElement);
          var newTree = (0, _vdomVirtualize2['default'])(content.documentElement);
          var patches = (0, _virtualDomDiff2['default'])(currentTree, newTree);

          (0, _virtualDomPatch2['default'])(document.documentElement, patches);

          _this.addListeners();
        }

        requests['delete'](data.id);
      });

      window.addEventListener('popstate', function () {
        _this.request(document.location.pathname);
      }, false);
    }
  }, {
    key: 'listen',
    value: function listen() {
      var event = _.get(this).event;
      var reporting = _.get(this).reporting;

      this.addListeners();

      if (reporting.level > 0) {
        reporting.reporter('-- Listening for requests in the browser');
      }

      event.publish('request.listening', {
        'location': 'browser'
      });
    }
  }, {
    key: 'removeListeners',
    value: function removeListeners() {
      var listeners = _.get(this).listeners;
      var navigateRef = _.get(this).navigateRef;

      listeners.forEach(function (listener) {
        listener.removeEventListener('click', navigateRef);
      });

      _.get(this).listeners = [];
    }
  }, {
    key: 'addListeners',
    value: function addListeners() {
      this.removeListeners();

      var links = document.getElementsByTagName('a');
      var l = links.length;
      var listeners = _.get(this).listeners;
      var navigateRef = _.get(this).navigateRef;

      var i = 0;

      for (; i < l; i++) {
        listeners.push(links[i]);
        links[i].addEventListener('click', navigateRef);
      }
    }
  }, {
    key: 'navigate',
    value: function navigate(e) {
      var url = e.target.pathname;

      e.preventDefault();

      window.history.pushState({}, '', url);

      this.request(url);
    }
  }, {
    key: 'request',
    value: function request(url) {
      var event = _.get(this).event;
      var id = _.get(this).id++;
      var reporting = _.get(this).reporting;
      var requests = _.get(this).requests;

      requests.set(id, {
        'handlerErrors': 0
      });

      if (reporting.level > 0) {
        reporting.reporter('-- GET request received: ' + url);
      }

      event.publish('request.received', {
        'id': id,
        'time': Date.now(),
        'method': 'GET',
        'url': url
      });
    }
  }]);

  return Browser;
})();

exports['default'] = Browser;
module.exports = exports['default'];