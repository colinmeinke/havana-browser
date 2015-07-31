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

var Browser = (function () {
  function Browser(config) {
    _classCallCheck(this, Browser);

    this.event = config.event;
    this.reporting = config.reporting;

    this.handlers = [];
    this.id = 1;
    this.listeners = [];
    this.navigateRef = this.navigate.bind(this);
    this.requests = new Map();

    this.init();
  }

  _createClass(Browser, [{
    key: 'init',
    value: function init() {
      var _this = this;

      this.event.subscribe('response.handler.register', function (data) {
        _this.handlers.push(data.name);
      });

      this.event.subscribe('response.handler.error', function (data) {
        var request = _this.requests.get(data.id);

        if (request) {
          request.handlerErrors++;

          if (request.handlerErrors === _this.handlers.length) {
            _this.event.publish('response.error', data);
          }
        }
      });

      this.event.subscribe('response.send', function (data) {
        if (data.content) {
          var content = new DOMParser().parseFromString(data.content, 'text/html');
          var currentTree = (0, _vdomVirtualize2['default'])(document.documentElement);
          var newTree = (0, _vdomVirtualize2['default'])(content.documentElement);
          var patches = (0, _virtualDomDiff2['default'])(currentTree, newTree);

          (0, _virtualDomPatch2['default'])(document.documentElement, patches);

          _this.addListeners();
        }

        _this.requests['delete'](data.id);
      });

      window.addEventListener('popstate', function () {
        _this.request(document.location.pathname);
      }, false);
    }
  }, {
    key: 'listen',
    value: function listen() {
      this.addListeners();

      if (this.reporting.level > 0) {
        this.reporting.reporter('-- Listening for requests in the browser');
      }

      this.event.publish('request.listening', {
        'location': 'browser'
      });
    }
  }, {
    key: 'removeListeners',
    value: function removeListeners() {
      var _this2 = this;

      this.listeners.forEach(function (listener) {
        listener.removeEventListener('click', _this2.navigateRef);
      });

      this.listeners = [];
    }
  }, {
    key: 'addListeners',
    value: function addListeners() {
      this.removeListeners();

      var links = document.getElementsByTagName('a');
      var l = links.length;
      var i = 0;

      for (; i < l; i++) {
        this.listeners.push(links[i]);
        links[i].addEventListener('click', this.navigateRef);
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
      var id = this.id++;

      this.requests.set(id, {
        'handlerErrors': 0
      });

      if (this.reporting.level > 0) {
        this.reporting.reporter('-- GET request received: ' + url);
      }

      this.event.publish('request.received', {
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