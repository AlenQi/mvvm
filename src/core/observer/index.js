import Dep from './dep'
import {
  def,
  hasOwn,
  isObject
} from '../util/index'


function Observer(value) {
  this.value = value;

  // value 对象观察类,
  this.dep = new Dep();

  this.vmCount = 0; // number of vms that has this object as root $data
  def(value, '__ob__', this);

  if (Array.isArray(value)) {
    // TODO: observeArray
  } else {
    this.walk(value);
  }
}

Observer.prototype = {
  constructor: Observer,
  walk: function (obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]]);
    }
  }
};

/**
 * Define a reactive property on an Object.
 */
export function defineReactive(obj, key, val) {

  // 非对象属性观察类
  const dep = new Dep();

  const property = Object.getOwnPropertyDescriptor(obj, key);

  if (property && property.configurable === false) {
    return;
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get;
  const setter = property && property.set;

  // 深度观察
  let childOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
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
      // val ---> newVal
      const value = getter ? getter.call(obj) : val;
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return;
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }

      // 如果为对象，则创建新的 __ob__ 对象
      childOb = observe(newVal);
      dep.notify(); // 通知所有订阅者
    }
  });
}

/**
 * 为 对象 内置 __ob__ 观察员
 * 已存在观察员
 */
export function observe(value, asRootData /* 是否为rootData */) {
  if (!isObject(value)) {
    return;
  }
  let ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob;
};

export default Observer;
