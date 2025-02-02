'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var snippet = function snippet(_ref) {
  var orgId = _ref.orgId,
      _ref$namespace = _ref.namespace,
      namespace = _ref$namespace === void 0 ? "FS" : _ref$namespace,
      _ref$debug = _ref.debug,
      _ref$host = _ref.host,
      host = _ref$host === void 0 ? "fullstory.com" : _ref$host,
      _ref$script = _ref.script,
      script = _ref$script === void 0 ? "edge.fullstory.com/s/fs.js" : _ref$script;

  if (!orgId) {
    throw new Error("FullStory orgId is a required parameter");
  }

  window["_fs_host"] = host;
  window["_fs_script"] = script;
  window["_fs_org"] = orgId;
  window["_fs_namespace"] = namespace;

  (function (m, n, e, t, l, o, g, y) {
    if (e in m) {
      if (m.console && m.console.log) {
        m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].');
      }

      return;
    }

    g = m[e] = function (a, b, s) {
      g.q ? g.q.push([a, b, s]) : g._api(a, b, s);
    };

    g.q = [];
    o = n.createElement(t);
    o.async = 1;
    o.crossOrigin = "anonymous";
    o.src = _fs_script;
    y = n.getElementsByTagName(t)[0];
    y.parentNode.insertBefore(o, y);

    g.identify = function (i, v, s) {
      g(l, {
        uid: i
      }, s);
      if (v) g(l, v, s);
    };

    g.setUserVars = function (v, s) {
      g(l, v, s);
    };

    g.event = function (i, v, s) {
      g("event", {
        n: i,
        p: v
      }, s);
    };

    g.anonymize = function () {
      g.identify(!!0);
    };

    g.shutdown = function () {
      g("rec", !1);
    };

    g.restart = function () {
      g("rec", !0);
    };

    g.log = function (a, b) {
      g("log", [a, b]);
    };

    g.consent = function (a) {
      g("consent", !arguments.length || a);
    };

    g.identifyAccount = function (i, v) {
      o = "account";
      v = v || {};
      v.acctId = i;
      g(o, v);
    };

    g.clearUserCookie = function () {};

    g.setVars = function (n, p) {
      g("setVars", [n, p]);
    };

    g._w = {};
    y = "XMLHttpRequest";
    g._w[y] = m[y];
    y = "fetch";
    g._w[y] = m[y];
    if (m[y]) m[y] = function () {
      return g._w[y].apply(this, arguments);
    };
    g._v = "1.3.0";
  })(window, document, window["_fs_namespace"], "script", "user");
};

var fs = function fs() {
  return window[window._fs_namespace];
};

var ensureSnippetLoaded = function ensureSnippetLoaded() {
  var snippetLoaded = !!fs();

  if (!snippetLoaded) {
    throw Error('FullStory is not loaded, please ensure the init function is invoked before calling FullStory API functions');
  }
};

var hasFullStoryWithFunction = function hasFullStoryWithFunction() {
  ensureSnippetLoaded();

  for (var _len = arguments.length, testNames = new Array(_len), _key = 0; _key < _len; _key++) {
    testNames[_key] = arguments[_key];
  }

  return testNames.every(function (current) {
    return fs()[current];
  });
};

var guard = function guard(name) {
  return function () {
    if (window._fs_dev_mode) {
      var message = "FullStory is in dev mode and is not recording: ".concat(name, " method not executed");
      console.warn(message);
      return message;
    }

    if (hasFullStoryWithFunction(name)) {
      var _fs;

      return (_fs = fs())[name].apply(_fs, arguments);
    }

    console.warn("FS.".concat(name, " not ready"));
    return null;
  };
};

var event = guard('event');
var log = guard('log');
var getCurrentSessionURL = guard('getCurrentSessionURL');
var identify = guard('identify');
var setUserVars = guard('setUserVars');
var consent = guard('consent');
var shutdown = guard('shutdown');
var restart = guard('restart');
var anonymize = guard('anonymize');
var setVars = guard('setVars');

var _init = function _init(inputOptions, readyCallback) {
  var options = _objectSpread2({}, inputOptions);

  if (fs()) {
    console.warn('The FullStory snippet has already been defined elsewhere (likely in the <head> element)');
    return;
  }

  if (options.recordCrossDomainIFrames) {
    window._fs_run_in_iframe = true;
  }

  if (options.recordOnlyThisIFrame) {
    window._fs_is_outer_script = true;
  }

  if (options.debug === true) {
    if (!options.script) {
      options.script = 'edge.fullstory.com/s/fs-debug.js';
    } else {
      console.warn('Ignoring `debug = true` because `script` is set');
    }
  }

  snippet(options);

  if (readyCallback) {
    fs()('observe', {
      type: 'start',
      callback: readyCallback
    });
  }

  if (options.devMode === true) {
    var message = 'FullStory was initialized in devMode and will stop recording';
    event('FullStory Dev Mode', {
      message_str: message
    });
    shutdown();
    window._fs_dev_mode = true;
    console.warn(message);
  }
};

var initOnce = function initOnce(fn, message) {
  return function () {
    if (window._fs_initialized) {
      if (message) console.warn(message);
      return;
    }

    fn.apply(void 0, arguments);
    window._fs_initialized = true;
  };
};

var init = initOnce(_init, 'FullStory init has already been called once, additional invocations are ignored');
var isInitialized = function isInitialized() {
  return !!window._fs_initialized;
};

exports.anonymize = anonymize;
exports.consent = consent;
exports.event = event;
exports.getCurrentSessionURL = getCurrentSessionURL;
exports.identify = identify;
exports.init = init;
exports.isInitialized = isInitialized;
exports.log = log;
exports.restart = restart;
exports.setUserVars = setUserVars;
exports.setVars = setVars;
exports.shutdown = shutdown;
