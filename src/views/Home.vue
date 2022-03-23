<template>
  <div class="home">
    <div class="home__buttons">
      <!-- <button @click="download('tab.txt')">Download TXT</button> -->
      <button @click="generateReport">Download PDF</button>
      <button @click="add('tab')">Tab</button>
      <button @click="add('verse')">Verso</button>
    </div>

    <div id="song" class="home__song">
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
      :pdf-content-width="widthPDF"
      :paginate-elements-by-height="1100"
      :pdf-quality="2"
    >
      <section class="pdf-content" slot="pdf-content">
        <div id="pdf-content"></div>
      </section>
    </vue-html2pdf>
  </div>
</template>

<script>
import VueHtml2pdf from "vue-html2pdf";
import Tab from "@/components/tab";
import Verse from "@/components/verse";

const componentList = {
  tab: Tab,
  verse: Verse,
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

  computed: {
    widthPDF() {
      return "800px";
    },
  },

  methods: {
    add(component) {
      console.log(component);
      this.songStructure.push(component);
    },

    download(filename) {
      // let element = document.createElement("a");
      let content = document.getElementById("song");
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
      const cifra = document.getElementById("song");
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
#pdf-content {
  margin: 40px;
}
.home {
  background: $white;
  min-height: 200vh;
  padding: 40px 60px;
  position: relative;

  &__buttons {
    text-align: center;
    position: sticky;
    top: 0px;
  }
}
</style>
