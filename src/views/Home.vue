<template>
  <div class="home">
    <h1>Home page</h1>

    <div class="tab">
      <div class="tab__string">
        <span>e</span>

        <span v-for="n in 40" :key="n" @click="changeContent">-</span>
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
export default {
  name: "Home",

  methods: {
    changeContent(event) {
      console.log(event);
      event.target.innerHTML = prompt(event.target.innerHTML) || "-";
    },
  },
};
</script>

<style lang="scss">
.tab {
  font-family: monospace;
}
</style>
