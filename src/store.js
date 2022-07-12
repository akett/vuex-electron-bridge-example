import Vuex from "vuex"
import { createPlugin } from "vuex-electron-bridge"

const types = {
  INCREMENT_COUNTER: 'INCREMENT_COUNTER',
  DECREMENT_COUNTER: 'DECREMENT_COUNTER',
  SET_COUNTER: 'SET_COUNTER',
  LOCAL_INCREMENT_COUNTER: 'LOCAL_INCREMENT_COUNTER',
  LOCAL_DECREMENT_COUNTER: 'LOCAL_DECREMENT_COUNTER',
  LOCAL_SET_COUNTER: 'LOCAL_SET_COUNTER',
}

const store = new Vuex.Store({
  plugins: [
    createPlugin(),
  ],
  state: {
    counter: 0,
  },
  mutations: {
    [types.INCREMENT_COUNTER]: (state) => state.counter++,
    [types.DECREMENT_COUNTER]: (state) => state.counter--,
    [types.SET_COUNTER]: (state, value) => state.counter = value,
  },
  actions: {
    [types.INCREMENT_COUNTER]: (context) => context.shareCommit(types.INCREMENT_COUNTER),
    [types.DECREMENT_COUNTER]: (context) => context.shareCommit(types.DECREMENT_COUNTER),
    [types.SET_COUNTER]: (context, payload) => context.shareCommit(types.SET_COUNTER, payload),
    [types.LOCAL_INCREMENT_COUNTER]: (context) => context.localCommit(types.INCREMENT_COUNTER),
    [types.LOCAL_DECREMENT_COUNTER]: (context) => context.localCommit(types.DECREMENT_COUNTER),
    [types.LOCAL_SET_COUNTER]: (context, payload) => context.localCommit(types.SET_COUNTER, payload),
  },
})

export {
  store,
  types,
}

export default store