<template>
  <div class="verse">
    <!-- <button @click="newVerse">New verse</button> -->

    <div v-for="(verse, index) in verse" :key="index">
      <Draggable :list="verse.chords">
        <span
          v-for="(dash, index) in verse.chords"
          :key="index"
          @dblclick="changeContent(index)"
          >{{ dash }}</span
        >
      </Draggable>
      <p>{{ verse.verse }}</p>
      <input type="text" v-model="verse.verse" />
    </div>
  </div>
</template>

<script>
import Draggable from "vuedraggable";

export default {
  name: "Verse",

  components: {
    Draggable,
  },

  data() {
    const chordsLine = () => {
      return [
        "-",
        "-",
        "5",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
      ];
    };

    const line = () => {
      return {
        chords: chordsLine(),
        verse: "",
      };
    };

    return {
      chords: chordsLine(),
      blankLine: line(),
      verse: [],
    };
  },

  mounted() {
    this.newVerse();

    console.log(this.verse);
  },

  methods: {
    newVerse() {
      this.verse.push(JSON.parse(JSON.stringify(this.blankLine)));
    },

    changeContent(index) {
      console.log(index, this.verse);
    },
  },
};
</script>

<style lang="scss"></style>
