<template>
  <div class="home">
    <h1>Home page</h1>

    <button @click="download('tab.txt')">Download</button>

    <div id="all-tabs" class="tabs">
      <Tab />
      <!-- <Verse /> -->
    </div>
  </div>
</template>

<script>
import Tab from "@/components/tab";
// import Verse from "@/components/verse";

export default {
  name: "Home",

  components: {
    Tab,
    // Verse,
  },

  methods: {
    download(filename) {
      // let element = document.createElement("a");
      let content = document.getElementById("all-tabs");
      const teste = content.innerText.replaceAll("|\n", "|");

      const blob = new Blob([teste], { type: "text/txt" });

      const elem = window.document.createElement("a");

      elem.href = window.URL.createObjectURL(blob);

      elem.download = filename;
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    },
  },
};
</script>

<style lang="scss">
.tabs {
  font-family: monospace;
  font-size: 20px;

  .tab__string {
    display: flex;

    span {
      cursor: pointer;
    }
  }
}
</style>
