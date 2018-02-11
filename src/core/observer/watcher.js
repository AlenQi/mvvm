import Dep, {pushTarget, popTarget} from './dep'
import {
  hasOwn
} from '../util/index'

/**
 * 
 * 观察员
 * @param {any} vm 
 * @param {any} expOrFn 
 * @param {any} cb 
 * @param {any} options 
 */
function Watcher(vm, expOrFn, cb, options = {}) {
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
  this.value = this.lazy
  ? undefined
  : this.get();
}

Watcher.prototype = {
  constructor: Watcher,
  update: function () {
    // 如果为计算属性的watcher，则延缓更新。设置数据为dirty
    if (this.lazy) {
      this.dirty = true;
    } else {
      // 数据对象直接更新
      this.run();
    }
  },
  // 非计算属性获取value
  run: function () {
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
  addDep: function (dep) {
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
    if (!hasOwn(this.newDepIds, dep.id)) {
      this.newDepIds[dep.id] = dep;
      if (!hasOwn(this.depIds, dep.id)) {
        dep.addSub(this);
        this.depIds[dep.id] = dep;
      }
    }
  },

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get: function () {
    // 设置当前的 Watcher 
    pushTarget(this);
    const vm = this.vm;

    // 获取value的同时
    // 为数据的观察者添加watcher
    // 如果为computed 计算属性, 则会出发内部多次的 getter 调用
    // 则内部的数据观察对象会收集同一个 watcher
    let value = this.getter && this.getter.call(vm, vm);

    popTarget();
    this.cleanupDeps();
    return value;
  },
  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  evaluate: function () {
    this.value = this.get();
    this.dirty = false;
  },

  /**
   * Depend on all deps collected by this watcher.
   */
  depend: function () {
    let maps = Object.keys(this.depIds);
    maps.forEach((key) => {
      this.depIds[key].depend();
    });
  },
  /**
   * Clean up for dependency collection.
   */
  cleanupDeps: function () {
    let keys = Object.keys(this.depIds);
    keys.forEach((key) => {
      const dep = this.depIds[key];
      // 删除旧的观察者依赖
      if (!hasOwn(this.newDepIds, dep.id)) {
        dep.removeSub(this);
      }
    });

    this.depIds = this.newDepIds;
    this.newDepIds = Object.create(null);
  },
  parseGetter: function (exp) {
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
    }
  }
};

export default Watcher;
