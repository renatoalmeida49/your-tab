<template>
  <div class="home">
    <h1>Home page</h1>

    <button @click="download('tab.txt')">Download</button>

    <div id="all-tabs" class="tab" :key="render">
      <template v-for="(string, indexString) in guitar">
        <div class="tab__string" :key="indexString">
          <span>{{ string.note }}|</span>
          <Draggable
            :list="string.string"
            :move="handleMoveItem"
            @end="handleDragEndItem"
            group="tablatura"
            :data-list="indexString"
          >
            <span
              :data-list="indexString"
              class="note"
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

    forceRender() {
      this.render++;
    },

    handleDragEndItem() {
      if (this.originalList === this.futureList) {
        this.movingItem =
          this.guitar[this.futureList].string[this.originalIndex];
        this.futureItem = this.guitar[this.futureList].string[this.futureIndex];

        if (this.movingItem && this.futureItem) {
          let _list = Object.assign([], this.guitar[this.futureList].string);

          _list[this.futureIndex] = this.movingItem;
          _list[this.originalIndex] = this.futureItem;

          this.guitar[this.futureList].string = _list;
        }
      } else {
        this.movingItem =
          this.guitar[this.originalList].string[this.originalIndex];
        this.futureItem = this.guitar[this.futureList].string[this.futureIndex];

        if (this.movingItem && this.futureItem) {
          let _listFrom = Object.assign(
            [],
            this.guitar[this.originalList].string
          );
          let _listTo = Object.assign([], this.guitar[this.futureList].string);

          _listTo[this.futureIndex] = this.movingItem;
          _listFrom[this.originalIndex] = this.futureItem;

          this.guitar[this.originalList].string = _listFrom;
          this.guitar[this.futureList].string = _listTo;
        }
      }
    },

    handleMoveItem(event) {
      const { index, futureIndex } = event.draggedContext;

      this.originalIndex = index;
      this.futureIndex = futureIndex;

      this.originalList = event.from.getAttribute("data-list");
      this.futureList = event.to.getAttribute("data-list");

      return false;
    },
  },
};
</script>

<style lang="scss">
.tab {
  font-family: monospace;
  font-size: 20px;

  &__string {
    display: flex;

    span {
      cursor: pointer;
    }
  }
}
</style>
