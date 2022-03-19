<template>
  <div class="verse">
    <button @click="newVerse">New verse</button>

    <div v-for="(verse, index) in strophe" :key="index">
      <p>-----------------------</p>

      <input type="text" />
    </div>
  </div>
</template>

<script>
export default {
  name: "Verse",

  data() {
    return {
      strophe: 1,
    };
  },

  methods: {
    newVerse() {
      this.strophe++;
    },
  },
};
</script>

<style lang="scss"></style>
