(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["MVVM"] = factory();
	else
		root["MVVM"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__dep__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_index__ = __webpack_require__(2);



/**
 * 
 * 观察员
 * @param {any} vm 
 * @param {any} expOrFn 
 * @param {any} cb 
 * @param {any} options 
 */
function Watcher(vm, expOrFn, cb) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  this.cb = cb;
  this.vm = vm;
  this.expOrFn = expOrFn;
  this.depIds = {};
  this.newDepIds = {};

  vm._watchers.push(this);
  this.lazy = !!options.lazy;
  this.dirty = this.lazy;

  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = this.parseGetter(expOrFn);
  }

  // 观察员 value
  this.value = this.lazy ? undefined : this.get();
}

Watcher.prototype = {
  constructor: Watcher,
  update: function update() {
    // 如果为计算属性的watcher，则延缓更新。设置数据为dirty
    if (this.lazy) {
      this.dirty = true;
    } else {
      // 数据对象直接更新
      this.run();
    }
  },
  // 非计算属性获取value
  run: function run() {
    var value = this.get();
    var oldVal = this.value;
    if (value !== oldVal) {
      this.value = value;
      // 更新视图的指令
      this.cb.call(this.vm, value, oldVal);
    }
  },

  /**
   * watcher 观察员 加入到某个被观察数据集合中
   * @param {Dep} dep
   */
  addDep: function addDep(dep) {
    // 1. 每次调用run()的时候会触发相应属性的getter
    // getter里面会触发dep.depend()，继而触发这里的addDep
    // 2. 假如相应属性的dep.id已经在当前watcher的depIds里，说明不是一个新的属性，仅仅是改变了其值而已
    // 则不需要将当前watcher添加到该属性的dep里
    // 3. 假如相应属性是新的属性，则将当前watcher添加到新属性的dep里
    // 如通过 vm.child = {name: 'a'} 改变了 child.name 的值，child.name 就是个新属性
    // 则需要将当前watcher(child.name)加入到新的 child.name 的dep里
    // 因为此时 child.name 是个新值，之前的 setter、dep 都已经失效，如果不把 watcher 加入到新的 child.name 的dep中
    // 通过 child.name = xxx 赋值的时候，对应的 watcher 就收不到通知，等于失效了
    // 4. 每个子属性的watcher在添加到子属性的dep的同时，也会添加到父属性的dep
    // 监听子属性的同时监听父属性的变更，这样，父属性改变时，子属性的watcher也能收到通知进行update
    // 这一步是在 this.get() --> this.getVMVal() 里面完成，forEach时会从父级开始取值，间接调用了它的getter
    // 触发了addDep(), 在整个forEach过程，当前wacher都会加入到每个父级过程属性的dep
    // 例如：当前watcher的是'child.child.name', 那么child, child.child, child.child.name这三个属性的dep都会加入当前watcher
    if (!Object(__WEBPACK_IMPORTED_MODULE_1__util_index__["c" /* hasOwn */])(this.newDepIds, dep.id)) {
      this.newDepIds[dep.id] = dep;
      if (!Object(__WEBPACK_IMPORTED_MODULE_1__util_index__["c" /* hasOwn */])(this.depIds, dep.id)) {
        dep.addSub(this);
        this.depIds[dep.id] = dep;
      }
    }
  },

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get: function get() {
    // 设置当前的 Watcher 
    Object(__WEBPACK_IMPORTED_MODULE_0__dep__["c" /* pushTarget */])(this);
    var vm = this.vm;

    // 获取value的同时
    // 为数据的观察者添加watcher
    // 如果为computed 计算属性, 则会出发内部多次的 getter 调用
    // 则内部的数据观察对象会收集同一个 watcher
    var value = this.getter && this.getter.call(vm, vm);

    Object(__WEBPACK_IMPORTED_MODULE_0__dep__["b" /* popTarget */])();
    this.cleanupDeps();
    return value;
  },
  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  evaluate: function evaluate() {
    this.value = this.get();
    this.dirty = false;
  },

  /**
   * Depend on all deps collected by this watcher.
   */
  depend: function depend() {
    var _this = this;

    var maps = Object.keys(this.depIds);
    maps.forEach(function (key) {
      _this.depIds[key].depend();
    });
  },
  /**
   * Clean up for dependency collection.
   */
  cleanupDeps: function cleanupDeps() {
    var _this2 = this;

    var keys = Object.keys(this.depIds);
    keys.forEach(function (key) {
      var dep = _this2.depIds[key];
      // 删除旧的观察者依赖
      if (!Object(__WEBPACK_IMPORTED_MODULE_1__util_index__["c" /* hasOwn */])(_this2.newDepIds, dep.id)) {
        dep.removeSub(_this2);
      }
    });

    this.depIds = this.newDepIds;
    this.newDepIds = Object.create(null);
  },
  parseGetter: function parseGetter(exp) {
    if (/[^\w.$]/.test(exp)) {
      return;
    }
    var exps = exp.split('.');

    /**
     * @param {object} obj
     */
    return function (obj) {
      for (var i = 0, len = exps.length; i < len; i++) {
        if (!obj) return;
        obj = obj[exps[i]];
      }
      return obj;
    };
  }
};

/* harmony default export */ __webpack_exports__["a"] = (Watcher);

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["c"] = pushTarget;
/* harmony export (immutable) */ __webpack_exports__["b"] = popTarget;
var uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 * 观察员允许多个指令订阅者订阅
 */

function Dep(name) {
  this.id = uid++;
  this.subs = [];
}

Dep.prototype = {

  constructor: Dep,

  /**
   * @param {Wathcer} sub
   */
  addSub: function addSub(sub) {
    this.subs.push(sub);
  },

  removeSub: function removeSub(sub) {
    var index = this.subs.indexOf(sub);
    if (index != -1) {
      this.subs.splice(index, 1);
    }
  },

  // 数据对象 注入 comipler 的 watcher
  // 如果是计算属性的 watcher, 则会多个数据对象 注入一个watcher
  depend: function depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  },

  notify: function notify() {
    this.subs.forEach(function (sub) {
      sub.update();
    });
  }
};

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null;

var targetStack = [];

function pushTarget(_target) {
  if (Dep.target) {
    targetStack.push(Dep.target);
  }
  Dep.target = _target;
}

function popTarget() {
  Dep.target = targetStack.pop();
}

/* harmony default export */ __webpack_exports__["a"] = (Dep);

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lang__ = __webpack_require__(9);
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__lang__["a"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "f", function() { return __WEBPACK_IMPORTED_MODULE_0__lang__["b"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__debug__ = __webpack_require__(3);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__env__ = __webpack_require__(5);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__error__ = __webpack_require__(10);
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_3__error__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_src_shared_util__ = __webpack_require__(4);
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "c", function() { return __WEBPACK_IMPORTED_MODULE_4_src_shared_util__["a"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "d", function() { return __WEBPACK_IMPORTED_MODULE_4_src_shared_util__["b"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "e", function() { return __WEBPACK_IMPORTED_MODULE_4_src_shared_util__["c"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "g", function() { return __WEBPACK_IMPORTED_MODULE_4_src_shared_util__["d"]; });







/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return warn; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_src_shared_util__ = __webpack_require__(4);


var warn = __WEBPACK_IMPORTED_MODULE_0_src_shared_util__["d" /* noop */];

if ("production".NODE_ENV !== 'production') {

  warn = function warn(msg, vm) {
    if (hasConsole && !config.silent) {
      console.error('[MVVM warn]: ' + msg);
    }
  };
}

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export extend */
/* harmony export (immutable) */ __webpack_exports__["c"] = isPlainObject;
/* harmony export (immutable) */ __webpack_exports__["b"] = isObject;
/* harmony export (immutable) */ __webpack_exports__["d"] = noop;
/* unused harmony export makeMap */
/* harmony export (immutable) */ __webpack_exports__["a"] = hasOwn;
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/** @module shared/util */

var _toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Mix properties into target object.
 */
function extend(to, _from) {
  for (var key in _from) {
    to[key] = _from[key];
  }
  return to;
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]';
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject(obj) {
  return obj !== null && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object';
}

/**
 * Perform no operation.
 */
function noop() {}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap(str, expectsLowerCase) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase ? function (val) {
    return map[val.toLowerCase()];
  } : function (val) {
    return map[val];
  };
}

/**
 * Check whether the object has the property.
 */
function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return inBrowser; });
// Browser environment sniffing
var inBrowser = typeof window !== 'undefined';

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export defineReactive */
/* harmony export (immutable) */ __webpack_exports__["a"] = observe;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__dep__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_index__ = __webpack_require__(2);



function Observer(value) {
  this.value = value;

  // value 对象观察类, 
  this.dep = new __WEBPACK_IMPORTED_MODULE_0__dep__["a" /* default */]();

  this.vmCount = 0; // number of vms that has this object as root $data
  Object(__WEBPACK_IMPORTED_MODULE_1__util_index__["a" /* def */])(value, '__ob__', this);

  if (Array.isArray(value)) {
    // TODO: observeArray
  } else {
    this.walk(value);
  }
}

Observer.prototype = {
  constructor: Observer,
  walk: function walk(obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]]);
    }
  }
};

/**
 * Define a reactive property on an Object.
 */
function defineReactive(obj, key, val) {

  // 非对象属性观察类
  var dep = new __WEBPACK_IMPORTED_MODULE_0__dep__["a" /* default */]();

  var property = Object.getOwnPropertyDescriptor(obj, key);

  if (property && property.configurable === false) {
    return;
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get;
  var setter = property && property.set;

  // 深度观察
  var childOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      var value = getter ? getter.call(obj) : val;
      if (__WEBPACK_IMPORTED_MODULE_0__dep__["a" /* default */].target) {
        // 将当前的 watcher 观察员 传递至数据对象的观察集合中
        // 如果已经存在于数据集合中, 则忽略
        dep.depend();
        if (childOb) {
          // 将当前的 watcher 传递给子对象的 数据对象的观察员集合
          childOb.dep.depend();
        }
      }
      return val;
    },
    set: function reactiveSetter(newVal) {
      var value = getter ? getter.call(obj) : val;
      if (newVal === value || newVal !== newVal && value !== value) {
        return;
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }

      // 如果为对象，则创建新的 __ob__ 对象
      childOb = observe(newVal);
      dep.notify();
    }
  });
}

/**
 * 为 对象 内置 __ob__ 观察员
 * 已存在观察员
 */
function observe(value, asRootData /* 是否为rootData */) {
  if (!Object(__WEBPACK_IMPORTED_MODULE_1__util_index__["d" /* isObject */])(value)) {
    return;
  }
  var ob = void 0;
  if (Object(__WEBPACK_IMPORTED_MODULE_1__util_index__["c" /* hasOwn */])(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob;
};

/* unused harmony default export */ var _unused_webpack_default_export = (Observer);

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__instance_index__ = __webpack_require__(8);


// add prototype
Object.defineProperty(__WEBPACK_IMPORTED_MODULE_0__instance_index__["a" /* default */].prototype, '$isServer', {
  get: function get() {
    return typeof window === 'undefined';
  }
});

__WEBPACK_IMPORTED_MODULE_0__instance_index__["a" /* default */].version = '1.0.0';

/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_0__instance_index__["a" /* default */]);

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_src_core_observer_watcher__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_src_core_observer__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__init__ = __webpack_require__(11);




/**
 * Create a MVVM
 * @class
 */
function MVVM(options) {
    if ("production".NODE_ENV !== 'production' && !(this instanceof MVVM)) {
        console.warn('Vue is a constructor and should be called with the `new` keyword');
    }
    this._init(options);
}

MVVM.prototype = {
    constructor: MVVM,
    $watch: function $watch(key, cb, options) {
        new __WEBPACK_IMPORTED_MODULE_0_src_core_observer_watcher__["a" /* default */](this, key, cb);
    }
};

Object(__WEBPACK_IMPORTED_MODULE_2__init__["a" /* default */])(MVVM);

/* harmony default export */ __webpack_exports__["a"] = (MVVM);

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = isReserved;
/* harmony export (immutable) */ __webpack_exports__["a"] = def;

/**
 * Check if a string starts with $ or _
 */
function isReserved(str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F;
}

/**
 * Define a property.
 */
function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = handleError;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__env__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__debug__ = __webpack_require__(3);



function handleError(err, vm, info) {

  if ("production".NODE_ENV !== 'production') {
    Object(__WEBPACK_IMPORTED_MODULE_1__debug__["a" /* warn */])('Error in ' + info + ': "' + err.toString() + '"', vm);
  }
  /* istanbul ignore else */
  if (__WEBPACK_IMPORTED_MODULE_0__env__["a" /* inBrowser */] && typeof console !== 'undefined') {
    console.error(err);
  } else {
    throw err;
  }
}

/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = initMixin;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__state__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_src_compiler_index__ = __webpack_require__(13);



var uid = 0;

function initMixin(MVVM) {

  MVVM.prototype._init = function (options) {
    var vm = this;
    vm._uid = uid++;
    vm._isMVVM = true;
    vm.$options = options || {};

    Object(__WEBPACK_IMPORTED_MODULE_0__state__["a" /* initState */])(vm);
    this.$compile = new __WEBPACK_IMPORTED_MODULE_1_src_compiler_index__["a" /* default */](this.$options.el || document.body, this);
  };
}

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export proxy */
/* harmony export (immutable) */ __webpack_exports__["a"] = initState;
/* unused harmony export defineComputed */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__observer_index__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__observer_watcher__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__observer_dep__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__util_index__ = __webpack_require__(2);





var sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: __WEBPACK_IMPORTED_MODULE_3__util_index__["g" /* noop */],
  set: __WEBPACK_IMPORTED_MODULE_3__util_index__["g" /* noop */]
};

/**
 * 属性代理
 * target[sourceKey].key => target.key
 */
function proxy(target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key];
  };
  sharedPropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val;
  };
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function initState(vm) {
  var opts = vm.$options;

  // new Watcher(vm) to push vm._watchers
  vm._watchers = [];

  if (opts.data) {
    initData(vm);
  } else {
    Object(__WEBPACK_IMPORTED_MODULE_0__observer_index__["a" /* observe */])(vm._data = {}, true /* asRootData */);
  }

  if (opts.computed) {
    initComputed(vm, opts.computed);
  }
}

/**
 * 代理 vm._data.xxx 属性 为 vm.xxx
 * 给 vm._data 属性遍历, 设置为观察者
 */
function initData(vm) {
  var data = vm.$options.data;
  data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {};
  if (!Object(__WEBPACK_IMPORTED_MODULE_3__util_index__["e" /* isPlainObject */])(data)) {
    data = {};
    "production".NODE_ENV !== 'production' && warn('data functions should return an object:\n' + 'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function', vm);
  }
  // proxy data on instance
  var keys = Object.keys(data);
  var props = vm.$options.props;
  var methods = vm.$options.methods;
  var i = keys.length;
  while (i--) {
    var key = keys[i];

    if ("production".NODE_ENV !== 'production') {
      if (methods && Object(__WEBPACK_IMPORTED_MODULE_3__util_index__["c" /* hasOwn */])(methods, key)) {
        warn('method "' + key + '" has already been defined as a data property.', vm);
      }
    }

    // 优先处理prop属性
    if (props && Object(__WEBPACK_IMPORTED_MODULE_3__util_index__["c" /* hasOwn */])(props, key)) {
      "production".NODE_ENV !== 'production' && warn('The data property "' + key + '" is already declared as a prop. ' + 'Use prop default value instead.', vm);
    } else if (!Object(__WEBPACK_IMPORTED_MODULE_3__util_index__["f" /* isReserved */])(key)) {
      // 非 $ 或 _ 开头属性
      proxy(vm, '_data', key);
    }
  }
  // observe data
  Object(__WEBPACK_IMPORTED_MODULE_0__observer_index__["a" /* observe */])(data, true /* asRootData */);
}

var computedWatcherOptions = { lazy: true

  /**
   * 初始化计算属性
   * 
   * @param {MVVM} vm 
   * @param {object} computed 
   */
};function initComputed(vm, computed) {
  var watchers = vm._computedWatchers = Object.create(null);

  // computed key
  for (var key in computed) {

    // 获取计算属性声明
    var userDef = computed[key];
    // 检测声明是否符合要求
    var getter = typeof userDef === 'function' ? userDef : userDef.get;
    if ("production".NODE_ENV !== 'production' && getter == null) {
      warn('Getter is missing for computed property "' + key + '".', vm);
    }

    // create key watchers
    watchers[key] = new __WEBPACK_IMPORTED_MODULE_1__observer_watcher__["a" /* default */](vm, getter || __WEBPACK_IMPORTED_MODULE_3__util_index__["g" /* noop */], __WEBPACK_IMPORTED_MODULE_3__util_index__["g" /* noop */], computedWatcherOptions);
    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      defineComputed(vm, key, userDef);
    }
  }
}

function defineComputed(target, key, userDef) {
  var shouldCache = true;
  if (typeof userDef === 'function') {
    // 只设置getter
    sharedPropertyDefinition.get = shouldCache ? createComputedGetter(key) : userDef;
    sharedPropertyDefinition.set = __WEBPACK_IMPORTED_MODULE_3__util_index__["g" /* noop */];
  } else {
    // 同时设置 getter setter
    sharedPropertyDefinition.get = userDef.get ? shouldCache && userDef.cache !== false ? createComputedGetter(key) : userDef.get : __WEBPACK_IMPORTED_MODULE_3__util_index__["g" /* noop */];

    sharedPropertyDefinition.set = userDef.set ? userDef.set : __WEBPACK_IMPORTED_MODULE_3__util_index__["g" /* noop */];
  }

  if ("production".NODE_ENV !== 'production' && sharedPropertyDefinition.set === __WEBPACK_IMPORTED_MODULE_3__util_index__["g" /* noop */]) {
    sharedPropertyDefinition.set = function () {
      warn('Computed property "' + key + '" was assigned to but it has no setter.', this);
    };
  }
  // 定义 计算属性 
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

// 创建 计算属性的 getter
function createComputedGetter(key) {

  return function computedGetter() {
    // this => vm
    var watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      // dirty => true 立即计算
      if (watcher.dirty) {
        watcher.evaluate();
      }

      // 如果存在视图指令引用计算属性
      if (__WEBPACK_IMPORTED_MODULE_2__observer_dep__["a" /* default */].target) {
        // 将当前计算属性的依赖数据对象集 添加 当前的视图指令的 watcher
        // 如果计算属性内部的数据依赖发生变化, 通知视图指令进行更新
        watcher.depend();
      }

      return watcher.value;
    }
  };
}

function getData(data, vm) {
  try {
    return data.call(vm);
  } catch (e) {
    Object(__WEBPACK_IMPORTED_MODULE_3__util_index__["b" /* handleError */])(e, vm, 'data()');
    return {};
  }
}

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_observer_watcher__ = __webpack_require__(0);


function Compile(el, vm) {
  this.$vm = vm;
  this.$el = this.isElementNode(el) ? el : document.querySelector(el);
  this.$template = vm.$options.template;

  if (this.$el) {
    this.$fragment = this.$template ? this.template2Fragment(this.$template) : this.node2Fragment(this.$el);
    this.init();
    this.$el.appendChild(this.$fragment);
  }
}

Compile.prototype = {
  constructor: Compile,
  createFragment: function createFragment(html) {
    var child;
    var fragment = document.createDocumentFragment();
    var el = document.createElement('div');

    el.innerHTML = html;
    while (child = el.firstChild) {
      fragment.appendChild(child);
    }
    return fragment;
  },
  template2Fragment: function template2Fragment(template) {
    var el = template.charAt(0) === '#' ? document.body.querySelector(template) : null;
    if (!el) {
      return this.createFragment(template);
    }
    if (el.tagName === 'SCRIPT') {
      return this.createFragment(el.innerHTML);
    } else {
      return this.node2Fragment(el);
    }
  },
  node2Fragment: function node2Fragment(el) {
    var fragment = document.createDocumentFragment(),
        child;

    // 将原生节点拷贝到fragment
    while (child = el.firstChild) {
      fragment.appendChild(child);
    }
    return fragment;
  },

  init: function init() {
    this.compileElement(this.$fragment);
  },

  compileElement: function compileElement(el) {
    var _this = this;

    var childNodes = el.childNodes;
    [].slice.call(childNodes).forEach(function (node) {
      var text = node.textContent;
      // 文本插值表达式 {{}}
      var reg = /\{\{(.*?)\}\}/;

      if (_this.isElementNode(node)) {
        _this.compile(node);
      } else if (_this.isTextNode(node) && reg.test(text)) {
        _this.compileText(node, RegExp.$1);
      }

      if (node.childNodes && node.childNodes.length) {
        _this.compileElement(node);
      }
    });
  },

  compile: function compile(node) {
    var _this2 = this;

    var nodeAttrs = node.attributes;

    [].slice.call(nodeAttrs).forEach(function (attr) {
      var attrName = attr.name;
      if (_this2.isDirective(attrName)) {
        var exp = attr.value;
        var dir = attrName.substring(2);
        // 事件指令
        if (_this2.isEventDirective(dir)) {
          compileUtil.eventHandler(node, _this2.$vm, exp, dir);
          // 普通指令
        } else {
          compileUtil[dir] && compileUtil[dir](node, _this2.$vm, exp);
        }

        node.removeAttribute(attrName);
      }
    });
  },

  compileText: function compileText(node, exp) {
    compileUtil.text(node, this.$vm, exp);
  },

  isDirective: function isDirective(attr) {
    return attr.indexOf('v-') == 0;
  },

  isEventDirective: function isEventDirective(dir) {
    return dir.indexOf('on') === 0;
  },

  isElementNode: function isElementNode(node) {
    return node.nodeType == 1;
  },

  isTextNode: function isTextNode(node) {
    return node.nodeType == 3;
  }
};

// 指令处理集合
var compileUtil = {
  text: function text(node, vm, exp) {
    this.bind(node, vm, exp, 'text');
  },

  html: function html(node, vm, exp) {
    this.bind(node, vm, exp, 'html');
  },

  model: function model(node, vm, exp) {
    this.bind(node, vm, exp, 'model');

    var me = this,
        val = this._getVMVal(vm, exp);
    node.addEventListener('input', function (e) {
      var newValue = e.target.value;
      if (val === newValue) {
        return;
      }

      me._setVMVal(vm, exp, newValue);
      val = newValue;
    });
  },

  class: function _class(node, vm, exp) {
    this.bind(node, vm, exp, 'class');
  },

  bind: function bind(node, vm, exp, dir) {
    // 策略模式
    var updaterFn = updater[dir + 'Updater'];

    // 直接运行获取结果
    updaterFn && updaterFn(node, this._getVMVal(vm, exp));

    // 新增订阅者
    // watcher数据变化后执行更新视图指令
    new __WEBPACK_IMPORTED_MODULE_0__core_observer_watcher__["a" /* default */](vm, exp, function (value, oldValue) {
      updaterFn && updaterFn(node, value, oldValue);
    });
  },

  // 事件处理
  eventHandler: function eventHandler(node, vm, exp, dir) {
    var eventType = dir.split(':')[1],
        fn = vm.$options.methods && vm.$options.methods[exp];

    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false);
    }
  },

  _getVMVal: function _getVMVal(vm, exp) {
    var val = vm;
    exp = exp.split('.');
    exp.forEach(function (k) {
      val = val[k];
    });
    return val;
  },

  _setVMVal: function _setVMVal(vm, exp, value) {
    var val = vm;
    exp = exp.split('.');
    exp.forEach(function (k, i) {
      // 非最后一个key，更新val的值
      if (i < exp.length - 1) {
        val = val[k];
      } else {
        val[k] = value;
      }
    });
  }
};

var updater = {
  textUpdater: function textUpdater(node, value) {
    node.textContent = typeof value == 'undefined' ? '' : value;
  },

  htmlUpdater: function htmlUpdater(node, value) {
    node.innerHTML = typeof value == 'undefined' ? '' : value;
  },

  classUpdater: function classUpdater(node, value, oldValue) {
    var className = node.className;
    className = className.replace(oldValue, '').replace(/\s$/, '');

    var space = className && String(value) ? ' ' : '';

    node.className = className + space + value;
  },

  modelUpdater: function modelUpdater(node, value, oldValue) {
    node.value = typeof value == 'undefined' ? '' : value;
  }
};

/* harmony default export */ __webpack_exports__["a"] = (Compile);

/***/ })
/******/ ]);
});