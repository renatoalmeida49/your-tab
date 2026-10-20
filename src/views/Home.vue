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
            :ref="partRef(part.id)"
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

<script lang="ts">
import { defineComponent, markRaw } from "vue";
import { mapActions, mapState } from "pinia";
import { useSongStore } from "@/stores/song";
import type { Part, PartType } from "@/types/song";
import type {
  FocusablePart,
  MoveCursorPayload,
  NewTextFieldPayload,
} from "@/types/editor";
import { VueDraggable } from "vue-draggable-plus";
import TabHeader from "@/components/tab-header/index.vue";
import Tab from "@/components/tab/index.vue";
import Verse from "@/components/verse/index.vue";
import TextField from "@/components/text-field/index.vue";

// FORA DO data(): COMPONENTES NÃO DEVEM VIRAR OBJETOS REATIVOS NO VUE 3
const componentList: Record<PartType, unknown> = {
  tab: Tab,
  verse: Verse,
  textField: TextField,
};

export default defineComponent({
  name: "Home",

  components: {
    VueDraggable,
    TabHeader,
  },

  data() {
    return {
      // REFERÊNCIAS AOS COMPONENTES DAS PARTES, PARA MOVER O CURSOR ENTRE ELAS
      partRefs: markRaw({}) as Record<string, FocusablePart>,
    };
  },

  computed: {
    ...mapState(useSongStore, { song: "parts" }),
  },

  methods: {
    ...mapActions(useSongStore, [
      "addContent",
      "addContentBetweenParts",
      "removeContent",
      "setSong",
    ]),

    componentFor(type: PartType) {
      return componentList[type];
    },

    partRef(id: string) {
      return (component: unknown) => {
        if (component) this.partRefs[id] = component as FocusablePart;
        else delete this.partRefs[id];
      };
    },

    checkPart(part: Part) {
      if (part.type == "textField") return false;

      return true;
    },

    // SETAS PASSAM POR TODAS AS PARTES (TEXTO, VERSO E TAB), MANTENDO A COLUNA
    moveCursor(payload: MoveCursorPayload) {
      const step = payload.direction == "up" ? -1 : 1;
      const target = this.song[payload.index + step];

      if (!target) return;

      this.partRefs[target.id].focusAt({
        direction: payload.direction,
        column: payload.column,
      });
    },

    newTextField(payload: NewTextFieldPayload) {
      this.addContentBetweenParts({
        component: "textField",
        index: payload.index + 1,
      });
    },

    newContent(event: MouseEvent) {
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
});
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
