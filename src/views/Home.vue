<template>
  <div class="home">
    <h1>Home page</h1>

    <button @click="download('tab.txt')">Download</button>

    <ul class="menu">
      <li @click="add('tab')">Tab</li>
      <li @click="add('strophe')">Estrofe</li>
    </ul>

    <div id="all-tabs" class="tabs">
      <component
        :is="typeComponent(part)"
        v-for="(part, index) in songStructure"
        :key="index"
      ></component>
    </div>
  </div>
</template>

<script>
import Tab from "@/components/tab";
import Strophe from "@/components/strophe";

const componentList = {
  tab: Tab,
  strophe: Strophe,
};

export default {
  name: "Home",

  data() {
    return {
      songStructure: [],
    };
  },

  methods: {
    add(component) {
      console.log(component);
      this.songStructure.push(component);
    },

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

    typeComponent(component) {
      return componentList[component];
    },
  },
};
</script>

<style lang="scss">
.menu {
  background: red;
  list-style: none;

  position: fixed;
  padding: 20px;
}
.tabs {
  padding: 0px 120px;
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
