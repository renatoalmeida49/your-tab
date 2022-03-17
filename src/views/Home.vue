<template>
  <div class="home">
    <h1>Home page</h1>

    <div class="tab" :key="render">
      <template v-for="(string, indexString) in guitar">
        <div class="tab__string" :key="indexString">
          <span>{{ string.note }}|</span>

          <Draggable v-model="string.string" group="tablatura">
            <span
              v-for="(note, index) in string.string"
              @dblclick="changeContent(indexString, index)"
              :key="`${note}-${index}`"
              >{{ note }}</span
            >
          </Draggable>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import Draggable from "vuedraggable";

export default {
  name: "Home",

  components: {
    Draggable,
  },

  data() {
    const string = () => {
      return [
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
        "-",
        "-",
        "-",
      ];
    };

    return {
      render: 0,
      guitar: {
        eString: {
          note: "e",
          string: string(),
        },
        BString: {
          note: "B",
          string: string(),
        },
        GString: {
          note: "G",
          string: string(),
        },
        DString: {
          note: "D",
          string: string(),
        },
        AString: {
          note: "A",
          string: string(),
        },
        EString: {
          note: "E",
          string: string(),
        },
      },
    };
  },

  methods: {
    changeContent(string, index) {
      this.guitar[string].string[index] = prompt(
        this.guitar[string].string[index] || "-"
      );
      this.forceRender();
    },

    forceRender() {
      this.render++;
    },

    check(event) {
      console.log(event);
    },
  },
};
</script>

<style lang="scss">
.tab {
  font-family: monospace;
  font-size: 20px;

  .tab__string {
    display: flex;
  }
}
</style>
