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
          :type="part.type"
          :showCloseButton="checkPart(part)"
        >
          <component
            :is="part.component"
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
    ...mapGetters("songStructure", ["song", "focusTextField"]),
  },

  methods: {
    ...mapActions("songStructure", [
      "addContent",
      "addTextFiled",
      "focusTextFieldIndex",
    ]),

    forceRender() {
      this.render++;
    },

    checkPart(part) {
      if (part.type == "textField") return false;

      return true;
    },

    moveCursor(payload) {
      let id = payload.id.split("-")[1];

      this.focusTextFieldIndex(id);

      if (id == 0 && payload.direction == "up") {
        return;
      }

      if (payload.direction == "up") {
        id = id - 1;
      }

      if (payload.direction == "down") {
        id = parseInt(id) + 1;
      }

      if (!document.getElementById(`input-${id}`)) return;

      this.$nextTick(() => {
        document.getElementById(`input-${id}`).focus();
        // setTimeout(() => {
        //   console.log(document.querySelector(`#input-${indexToFocus}`));
        // }, 200);
      });

      this.focusTextFieldIndex(null);
    },

    newTextField(payload) {
      this.focusTextFieldIndex(payload.index);

      this.addTextFiled({
        index: payload.index + 1,
        component: {
          type: "textField",
          component: TextField,
          info: { text: "", type: "text" },
        },
      });

      // VERIFICA NO VUEX SE HÁ INDICE SALVO.
      // SE HOUVER SETA O FOCUS PRA ELE
      // SE NAO HOUVER, SETA ALEATORIO MESMO
      if (this.focusTextField >= 0) {
        const indexToFocus = this.focusTextField + 1;

        this.$nextTick(() => {
          document.getElementById(`input-${indexToFocus}`).focus();
          // setTimeout(() => {
          //   console.log(document.querySelector(`#input-${indexToFocus}`));
          // }, 200);
        });

        this.focusTextFieldIndex(null);
      }

      this.forceRender();
    },

    newContent(event) {
      if (event.target === event.currentTarget) {
        if (this.song.length > 0) {
          if (this.song[this.song.length - 1].type == "textField") {
            if (this.song[this.song.length - 1].info.text == "") {
              this.song.pop();
              return;
            }
          }
        }

        this.addContent({
          component: "textField",
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
