<template>
  <div class="home" @click="newContent">
    <div id="song" class="home__song">
      <TabHeader />

      <Draggable
        :list="song"
        @change="forceRender"
        @remove="forceRender"
        :key="render"
      >
        <SongContent
          v-for="(part, index) in song"
          :key="index"
          :contentIndex="index"
          :showOptions="isTabHeader(index)"
        >
          <component
            :is="part.component"
            :info="part.info"
            :songIndex="index"
          ></component>
        </SongContent>
      </Draggable>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Draggable from "vuedraggable";
import TabHeader from "@/components/tab-header";
import TextField from "@/components/text-field";

export default {
  name: "Home",

  components: {
    Draggable,
    TabHeader,
    TextField,
  },

  data() {
    return {
      render: 1,
    };
  },

  watch: {
    song() {
      this.forceRender();
    },
  },

  computed: {
    ...mapGetters("songStructure", ["song"]),
  },

  methods: {
    ...mapActions("songStructure", ["addContent"]),

    forceRender() {
      this.render++;
    },

    isTabHeader(index) {
      if (index == 0) return false;

      return true;
    },

    newContent(event) {
      if (event.target === event.currentTarget) {
        if (this.song.length > 0) {
          if (this.song[this.song.length - 1].type == "textField") {
            return;
          }
        }

        this.addContent({
          type: "textField",
          component: TextField,
          info: { text: "", type: "text" },
        });
      }
    },
  },
};
</script>

<style lang="scss">
#pdf-content {
  margin: 40px;
  font-family: monospace;
}
.home {
  min-height: calc(100vh - 167px);
  padding: 0 60px;
  position: relative;
}
</style>
