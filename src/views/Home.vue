<template>
  <div class="home" @click="newContent">
    <div id="song" class="home__song">
      <TabHeader />

      <Draggable :value="song" @input="setSong" handle=".song-content__move">
        <SongContent
          v-for="(part, index) in song"
          :key="part.id"
          :contentIndex="index"
          :type="part.type"
          :showCloseButton="checkPart(part)"
        >
          <component
            :is="componentList[part.type]"
            :partId="part.id"
            :info="part.info"
            :songIndex="index"
            @newTextField="newTextField"
            @moveCursor="moveCursor"
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
import Tab from "@/components/tab";
import Verse from "@/components/verse";
import TextField from "@/components/text-field";

export default {
  name: "Home",

  components: {
    Draggable,
    TabHeader,
  },

  data() {
    return {
      componentList: {
        tab: Tab,
        verse: Verse,
        textField: TextField,
      },
    };
  },

  computed: {
    ...mapGetters("songStructure", ["song"]),
  },

  methods: {
    ...mapActions("songStructure", [
      "addContent",
      "addContentBetweenParts",
      "removeContent",
      "setSong",
    ]),

    checkPart(part) {
      if (part.type == "textField") return false;

      return true;
    },

    moveCursor(payload) {
      const step = payload.direction == "up" ? -1 : 1;
      const target = this.song[payload.index + step];

      if (!target || target.type != "textField") return;

      document.getElementById(`input-${target.id}`).focus();
    },

    newTextField(payload) {
      this.addContentBetweenParts({
        component: "textField",
        index: payload.index + 1,
      });
    },

    newContent(event) {
      if (event.target === event.currentTarget) {
        const lastIndex = this.song.length - 1;
        const last = this.song[lastIndex];

        if (last && last.type == "textField" && last.info.text == "") {
          this.removeContent(lastIndex);
          return;
        }

        this.addContent("textField");
      }
    },
  },
};
</script>

<style lang="scss">
.home {
  min-height: calc(100vh - 167px);
  padding: 0 60px;
  position: relative;

  @include tablet {
    padding: 0;
  }
}
</style>
