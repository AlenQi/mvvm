import Watcher from '../core/observer/watcher'

function Compile(el, vm) {
  this.$vm = vm;
  this.$el = this.isElementNode(el) ? el : document.querySelector(el);
  this.$template = vm.$options.template;

  if (this.$el) {
    this.$fragment = this.$template ?
      this.template2Fragment(this.$template) : this.node2Fragment(this.$el);
    this.init();
    this.$el.appendChild(this.$fragment);
  }
}

Compile.prototype = {
  constructor: Compile,
  createFragment: function (html) {
    var child;
    var fragment = document.createDocumentFragment();
    var el = document.createElement('div');

    el.innerHTML = html;
    while (child = el.firstChild) {
      fragment.appendChild(child);
    }
    return fragment;
  },
  template2Fragment: function (template) {
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
  node2Fragment: function (el) {
    var fragment = document.createDocumentFragment(),
      child;

    // 将原生节点拷贝到fragment
    while (child = el.firstChild) {
      fragment.appendChild(child);
    }
    return fragment;
  },

  init: function () {
    this.compileElement(this.$fragment);
  },

  compileElement: function (el) {
    var childNodes = el.childNodes;
    [].slice.call(childNodes).forEach((node) => {
      var text = node.textContent;
      // 文本插值表达式 {{}}
      var reg = /\{\{(.*?)\}\}/;

      if (this.isElementNode(node)) {
        this.compile(node);

      } else if (this.isTextNode(node) && reg.test(text)) {
        this.compileText(node, RegExp.$1);
      }

      if (node.childNodes && node.childNodes.length) {
        this.compileElement(node);
      }
    });
  },

  compile: function (node) {
    var nodeAttrs = node.attributes;

    [].slice.call(nodeAttrs).forEach((attr) => {
      var attrName = attr.name;
      if (this.isDirective(attrName)) {
        var exp = attr.value;
        var dir = attrName.substring(2);
        // 事件指令
        if (this.isEventDirective(dir)) {
          compileUtil.eventHandler(node, this.$vm, exp, dir);
          // 普通指令
        } else {
          compileUtil[dir] && compileUtil[dir](node, this.$vm, exp);
        }

        node.removeAttribute(attrName);
      }
    });
  },

  compileText: function (node, exp) {
    compileUtil.text(node, this.$vm, exp);
  },

  isDirective: function (attr) {
    return attr.indexOf('v-') == 0;
  },

  isEventDirective: function (dir) {
    return dir.indexOf('on') === 0;
  },

  isElementNode: function (node) {
    return node.nodeType == 1;
  },

  isTextNode: function (node) {
    return node.nodeType == 3;
  }
};

// 指令处理集合
var compileUtil = {
  text: function (node, vm, exp) {
    this.bind(node, vm, exp, 'text');
  },

  html: function (node, vm, exp) {
    this.bind(node, vm, exp, 'html');
  },

  model: function (node, vm, exp) {
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

  class: function (node, vm, exp) {
    this.bind(node, vm, exp, 'class');
  },

  bind: function (node, vm, exp, dir) {
    // 策略模式
    var updaterFn = updater[dir + 'Updater'];

    // 直接运行获取结果
    updaterFn && updaterFn(node, this._getVMVal(vm, exp));

    // 新增订阅者
    // watcher数据变化后执行更新视图指令
    new Watcher(vm, exp, function (value, oldValue) {
      updaterFn && updaterFn(node, value, oldValue);
    });
  },

  // 事件处理
  eventHandler: function (node, vm, exp, dir) {
    var eventType = dir.split(':')[1],
      fn = vm.$options.methods && vm.$options.methods[exp];

    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false);
    }
  },

  _getVMVal: function (vm, exp) {
    var val = vm;
    exp = exp.split('.');
    exp.forEach(function (k) {
      val = val[k];
    });
    return val;
  },

  _setVMVal: function (vm, exp, value) {
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
  textUpdater: function (node, value) {
    node.textContent = typeof value == 'undefined' ? '' : value;
  },

  htmlUpdater: function (node, value) {
    node.innerHTML = typeof value == 'undefined' ? '' : value;
  },

  classUpdater: function (node, value, oldValue) {
    var className = node.className;
    className = className.replace(oldValue, '').replace(/\s$/, '');

    var space = className && String(value) ? ' ' : '';

    node.className = className + space + value;
  },

  modelUpdater: function (node, value, oldValue) {
    node.value = typeof value == 'undefined' ? '' : value;
  }
};

export default Compile;
