<template>
  <div class="home">
    <button @click="download('tab.txt')">Download TXT</button>
    <button @click="generateReport">Download PDF</button>

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

    <vue-html2pdf
      ref="html2Pdf"
      :show-layout="false"
      :enable-download="true"
      :preview-modal="false"
      filename="tab-pdf"
      pdf-format="a4"
      pdf-orientation="portrait"
      :paginate-elements-by-height="1400"
    >
      <section slot="pdf-content">
        <div id="pdf-content"></div>
      </section>
    </vue-html2pdf>
  </div>
</template>

<script>
import VueHtml2pdf from "vue-html2pdf";
import Tab from "@/components/tab";
import Strophe from "@/components/strophe";

const componentList = {
  tab: Tab,
  strophe: Strophe,
};

export default {
  name: "Home",

  components: {
    VueHtml2pdf,
  },

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

    generateReport() {
      const cifra = document.getElementById("all-tabs");
      const pdf = document.getElementById("pdf-content");

      pdf.innerHTML = cifra.innerHTML;

      const dashes = pdf.querySelectorAll(".verse-dash");
      const inputs = pdf.querySelectorAll(".verse-input");

      dashes.forEach((item) => {
        item.style.visibility = "hidden";
      });

      inputs.forEach((item) => {
        item.style.display = "none";
      });

      this.$refs.html2Pdf.generatePdf();
    },

    typeComponent(component) {
      return componentList[component];
    },
  },
};
</script>

<style lang="scss">
.menu {
  background: $primary;
  font-family: "title";
  color: $secondary;
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
