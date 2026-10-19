<template>
  <div class="home" @click="newContent">
    <div id="song" class="home__song">
      <TabHeader />

      <VueDraggable
        :model-value="song"
        @update:model-value="setSong"
        handle=".song-content__move"
      >
        <SongContent
          v-for="(part, index) in song"
          :key="part.id"
          :contentIndex="index"
          :type="part.type"
          :showCloseButton="checkPart(part)"
        >
          <component
            :is="componentFor(part.type)"
            :partId="part.id"
            :info="part.info"
            :songIndex="index"
            @newTextField="newTextField"
            @moveCursor="moveCursor"
          ></component>
        </SongContent>
      </VueDraggable>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { VueDraggable } from "vue-draggable-plus";
import TabHeader from "@/components/tab-header/index.vue";
import Tab from "@/components/tab/index.vue";
import Verse from "@/components/verse/index.vue";
import TextField from "@/components/text-field/index.vue";

// FORA DO data(): COMPONENTES NÃO DEVEM VIRAR OBJETOS REATIVOS NO VUE 3
const componentList = {
  tab: Tab,
  verse: Verse,
  textField: TextField,
};

export default {
  name: "Home",

  components: {
    VueDraggable,
    TabHeader,
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

    componentFor(type) {
      return componentList[type];
    },

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
