<template>
  <div class="home">
    <h1>Home page</h1>

    <div class="tab" :key="render">
      <div class="tab__string">
        <span>e</span>
        <Draggable v-model="eString">
          <span
            v-for="(note, index) in eString"
            @dblclick="changeContent('eString', index)"
            :key="`${note}-${index}`"
            >{{ note }}</span
          >
        </Draggable>
      </div>
      <div class="tab__string">
        <span>B</span>

        <span v-for="n in 40" :key="n" @click="changeContent">-</span>
      </div>
      <div class="tab__string">
        <span>G</span>

        <span v-for="n in 40" :key="n" @click="changeContent">-</span>
      </div>
      <div class="tab__string">
        <span>D</span>

        <span v-for="n in 40" :key="n" @click="changeContent">-</span>
      </div>
      <div class="tab__string">
        <span>A</span>

        <span v-for="n in 40" :key="n" @click="changeContent">-</span>
      </div>
      <div class="tab__string">
        <span>E</span>

        <span v-for="n in 40" :key="n" @click="changeContent">-</span>
      </div>
    </div>
  </div>
</template>

<script>
import Draggable from "vuedraggable";

export default {
  name: "Home",

  components: {
    Draggable,
  },

  data() {
    return {
      render: 0,
      eString: ["-", "-", "3", "-", "-", "-", "-", "-", "-", "-", "-"],
    };
  },

  methods: {
    changeContent(string, index) {
      this[string][index] = prompt(this[string][index]);
      // event.target.innerHTML = prompt(event.target.innerHTML) || "-";
      this.forceRender();
    },

    forceRender() {
      this.render++;
    },

    check(event) {
      console.log(event);
    },
  },
};
</script>

<style lang="scss">
.tab {
  font-family: monospace;
}
</style>
