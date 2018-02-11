import { initState } from './state'
import Compile from 'src/compiler/index'

let uid = 0;

export default function initMixin (MVVM) {

  MVVM.prototype._init = function (options) {
    const vm = this;
    vm._uid = uid++;
    vm._isMVVM = true;
    vm.$options = options || {};
    
    initState(vm);
    this.$compile = new Compile(this.$options.el || document.body, this)
  }
  
}
