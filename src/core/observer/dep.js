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
  addSub: function (sub) {
    this.subs.push(sub);
  },

  removeSub: function (sub) {
    var index = this.subs.indexOf(sub);
    if (index != -1) {
      this.subs.splice(index, 1);
    }
  },

  // 数据对象 注入 comipler 的 watcher
  // 如果是计算属性的 watcher, 则会多个数据对象 注入一个watcher
  depend: function () {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  },

  notify: function () {
    this.subs.forEach(function (sub) {
      sub.update();
    });
  }
};

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null;

const targetStack = [];

export function pushTarget (_target) {
  if (Dep.target) {
    targetStack.push(Dep.target);
  }
  Dep.target = _target;
}

export function popTarget () {
  Dep.target = targetStack.pop();
}

export default Dep;
