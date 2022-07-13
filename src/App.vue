<template>
  <div>
    <h2>
      <kbd>vuex-electron-bridge-example</kbd>
      <button @click="$electron.spawnRenderer()" style="float: right;">Spawn Renderer*</button>
    </h2>

    <h3>A Simple Counter</h3>

    <p>Edit directly for shared mutations, or use the buttons below.</p>

    <p>
      <input type="number" style="font-size: 1.5em; font-weight: 700; text-align: center"
             @input="$store.dispatch(types.SET_COUNTER, Number($event.target.value) || $store.state.counter)"
             :value="$store.state.counter" />
    </p>

    <h4>Increment/Decrement using SHARED mutations:</h4>

    <p>
      <button @click="$store.dispatch(types.DECREMENT_COUNTER)">Renderer --</button>
      <button @click="$store.dispatch(types.INCREMENT_COUNTER)">Renderer ++</button>
      <br />
      <button @click="$electron.dispatch(types.DECREMENT_COUNTER)">Main --</button>
      <button @click="$electron.dispatch(types.INCREMENT_COUNTER)">Main ++</button>
      (calls dispatch on main process)
    </p>

    <h4>Increment/Decrement using LOCAL mutations:</h4>

    <p>
      <button @click="$store.dispatch(types.LOCAL_DECREMENT_COUNTER)">Renderer --</button>
      <button @click="$store.dispatch(types.LOCAL_INCREMENT_COUNTER)">Renderer ++</button>
      <br />
      <button @click="$electron.dispatch(types.LOCAL_DECREMENT_COUNTER)">Main --</button>
      <button @click="$electron.dispatch(types.LOCAL_INCREMENT_COUNTER)">Main ++</button>
      (these won't change the renderers)
    </p>

    <p>
      <button @click="$store.dispatch(types.SET_COUNTER, 0)">Reset all to 0</button>
    </p>

    <hr />

    <p>
      - Note that local mutations cause state to desync between processes.
      <br />
      &nbsp; <strong>Be careful of this!</strong> Only use local mutations if you have good reason.
      <br />
      * Renderers are hydrated with the state of the main process
    </p>

  </div>
</template>

<script>
// note the '$electron' variable used above is defined in main.js

import { types } from "./store"

export default {
  name: 'App',
  data: () => ({ types }),
}
</script>
