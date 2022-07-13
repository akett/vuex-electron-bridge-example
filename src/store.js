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
    // You may want to 'import { createPlugin as someUniqueName } ...'
    // in case of ambiguity or a naming conflict in your application.
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

    // - We will use the additional types to create actions that clearly indicate use of localCommit().
    //   The idea is that these extra types/actions will help avoid confusion later.
    [types.LOCAL_INCREMENT_COUNTER]: (context) => context.localCommit(types.INCREMENT_COUNTER),
    [types.LOCAL_DECREMENT_COUNTER]: (context) => context.localCommit(types.DECREMENT_COUNTER),
    [types.LOCAL_SET_COUNTER]: (context, payload) => context.localCommit(types.SET_COUNTER, payload),
    // - You don't have to do this, you could just call localCommit() directly elsewhere,
    //   or you could require some data in the action payload that would indicates usage of
    //   either shareCommit or localCommit.

    // - I prefer the extra types/actions approach, and so with this approach, if I were to have
    //   logic that's needed by both actions that I don't want to duplicate, I could break out
    //   that logic into separate functions that I could then call from both actions.

    // - Of course, this library just provides you with shareCommit() / localCommit()...
    //   it's up to you to decide how you will use them!
  },
})

export {
  store,
  types,
}

export default store