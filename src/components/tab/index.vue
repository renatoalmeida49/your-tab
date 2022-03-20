<template>
  <div class="tab-index" :key="render">
    <!-- <button @click="newTab">New tab</button> -->

    <template v-for="(tab, indexTab) in tabs">
      <div class="tab" :key="indexTab">
        <p>{{ indexTab }}</p>
        <template v-for="(string, indexString) in tab">
          <div class="tab__string" :key="indexString">
            <span>{{ string.note }}|</span>
            <Draggable
              :list="string.string"
              :move="handleMoveItem"
              @end="handleDragEndItem"
              group="tablatura"
              :data-list="indexString"
              :data-tab="indexTab"
            >
              <span
                :data-list="indexString"
                class="note"
                v-for="(note, index) in string.string"
                @dblclick="changeContent(indexTab, indexString, index)"
                :key="`${note}-${index}`"
                >{{ note }}</span
              >
            </Draggable>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import Draggable from "vuedraggable";

export default {
  name: "Tab",

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

    const tab = () => {
      return {
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
      };
    };

    return {
      render: 0,
      blankTab: tab(),
      tabs: [],
    };
  },

  mounted() {
    this.newTab();
  },

  methods: {
    changeContent(indexTab, indexString, index) {
      this.tabs[indexTab][indexString].string[index] = prompt(
        this.tabs[indexTab][indexString].string[index] || "-"
      );
      this.forceRender();
    },

    forceRender() {
      this.render++;
    },

    newTab() {
      this.tabs.push(JSON.parse(JSON.stringify(this.blankTab)));
    },

    handleDragEndItem() {
      if (this.originalList === this.futureList) {
        this.movingItem =
          this.tabs[this.originalTab][this.futureList].string[
            this.originalIndex
          ];
        this.futureItem =
          this.tabs[this.futureTab][this.futureList].string[this.futureIndex];

        if (this.movingItem && this.futureItem) {
          let _list = Object.assign(
            [],
            this.tabs[this.futureTab][this.futureList].string
          );

          _list[this.futureIndex] = this.movingItem;
          _list[this.originalIndex] = this.futureItem;

          this.tabs[this.futureTab][this.futureList].string = _list;
        }
      } else {
        this.movingItem =
          this.tabs[this.originalTab][this.originalList].string[
            this.originalIndex
          ];
        this.futureItem =
          this.tabs[this.futureTab][this.futureList].string[this.futureIndex];

        if (this.movingItem && this.futureItem) {
          let _listFrom = Object.assign(
            [],
            this.tabs[this.originalTab][this.originalList].string
          );
          let _listTo = Object.assign(
            [],
            this.tabs[this.futureTab][this.futureList].string
          );

          _listTo[this.futureIndex] = this.movingItem;
          _listFrom[this.originalIndex] = this.futureItem;

          this.tabs[this.originalTab][this.originalList].string = _listFrom;
          this.tabs[this.futureTab][this.futureList].string = _listTo;
        }
      }
    },

    handleMoveItem(event) {
      const { index, futureIndex } = event.draggedContext;

      this.originalIndex = index;
      this.futureIndex = futureIndex;

      this.originalTab = event.from.getAttribute("data-tab");
      this.futureTab = event.to.getAttribute("data-tab");

      this.originalList = event.from.getAttribute("data-list");
      this.futureList = event.to.getAttribute("data-list");

      return false;
    },
  },
};
</script>

<style lang="scss">
.tab-index {
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
