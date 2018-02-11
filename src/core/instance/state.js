import {observe} from '../observer/index'
import Watcher from '../observer/watcher'
import Dep from '../observer/dep'
import {
  handleError, 
  isPlainObject,
  hasOwn,
  noop,
  isReserved
} from '../util/index'

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};

/**
 * 属性代理
 * target[sourceKey].key => target.key
 */
export function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key];
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val;
  }
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

export function initState (vm) {
  const opts = vm.$options;

  // new Watcher(vm) to push vm._watchers
  vm._watchers = [];

  if (opts.data) {
    initData(vm);
  } else {
    observe(vm._data = {}, true /* asRootData */);
  }

  if(opts.computed) {
    initComputed(vm, opts.computed);
  }
}

/**
 * 代理 vm._data.xxx 属性 为 vm.xxx
 * 给 vm._data 属性遍历, 设置为观察者
 */
function initData (vm) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    );
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]

    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          `method "${key}" has already been defined as a data property.`,
          vm
        );
      }
    }

    // 优先处理prop属性
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      );
    } else if (!isReserved(key)) {
      // 非 $ 或 _ 开头属性
      proxy(vm, `_data`, key);
    }
  }
  // observe data
  observe(data, true /* asRootData */);
}


const computedWatcherOptions = { lazy: true }

/**
 * 初始化计算属性
 * 
 * @param {MVVM} vm 
 * @param {object} computed 
 */
function initComputed (vm, computed) {
  const watchers = vm._computedWatchers = Object.create(null);

  // computed key
  for (const key in computed) {
    
    // 获取计算属性声明
    const userDef = computed[key];
    // 检测声明是否符合要求
    const getter = typeof userDef === 'function' ? userDef : userDef.get;
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      );
    }
    
    // create key watchers
    watchers[key] = new Watcher(
      vm,
      getter || noop,
      noop,
      computedWatcherOptions
    );
    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    } 
    
  }
}

export function defineComputed (target, key, userDef) {
  const shouldCache = true;
  if (typeof userDef === 'function') {
    // 只设置getter
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : userDef
    sharedPropertyDefinition.set = noop;
  } else {
    // 同时设置 getter setter
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : userDef.get
      : noop;

    sharedPropertyDefinition.set = userDef.set
      ? userDef.set
      : noop;
  }

  if (process.env.NODE_ENV !== 'production' &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      );
    }
  }
  // 定义 计算属性 
  Object.defineProperty(target, key, sharedPropertyDefinition)
}


// 创建 计算属性的 getter
function createComputedGetter (key) {
  
  return function computedGetter () {
    // this => vm
    const watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      // dirty => true 立即计算
      if (watcher.dirty) {
        watcher.evaluate();
      }

      // 如果存在视图指令引用计算属性
      if (Dep.target) {
        // 将当前计算属性的依赖数据对象集 添加 当前的视图指令的 watcher
        // 如果计算属性内部的数据依赖发生变化, 通知视图指令进行更新
        watcher.depend();
      }

      return watcher.value;
    }
  }
}

function getData (data, vm) {
  try {
    return data.call(vm);
  } catch (e) {
    handleError(e, vm, `data()`);
    return {};
  }
}
