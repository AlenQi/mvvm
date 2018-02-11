import MVVM from './instance/index'

// add prototype
Object.defineProperty(MVVM.prototype, '$isServer', {
  get () {
    return typeof window === 'undefined'
  }
})

MVVM.version = '1.0.0';

export default MVVM;
