import { noop } from 'src/shared/util'

export let warn = noop

if (process.env.NODE_ENV !== 'production') {

  warn = (msg, vm) => {
    if (hasConsole && (!config.silent)) {
      console.error(`[MVVM warn]: ${msg}`)
    }
  }

}
