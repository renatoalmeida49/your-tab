<template>
  <div class="tab" :key="render">
    <div class="tab__container">
      <template v-for="(string, indexString) in info">
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
  name: "Tab",

  components: {
    Draggable,
  },

  props: {
    info: { type: Object, required: true },
    songIndex: { type: Number, required: true },
  },

  data() {
    return {
      render: 0,
    };
  },

  watch: {
    info: {
      handler() {
        this.emitChange();
      },
      deep: true,
    },
  },

  methods: {
    changeContent(indexString, index) {
      this.info[indexString].string[index] = prompt(
        this.info[indexString].string[index] || "-"
      );
      this.emitChange();
      this.forceRender();
    },

    forceRender() {
      this.render++;
    },

    handleDragEndItem() {
      if (this.originalList === this.futureList) {
        this.movingItem = this.info[this.futureList].string[this.originalIndex];
        this.futureItem = this.info[this.futureList].string[this.futureIndex];

        if (this.movingItem && this.futureItem) {
          let _list = Object.assign([], this.info[this.futureList].string);

          _list[this.futureIndex] = this.movingItem;
          _list[this.originalIndex] = this.futureItem;

          this.info[this.futureList].string = _list;
        }
      } else {
        this.movingItem =
          this.info[this.originalList].string[this.originalIndex];
        this.futureItem = this.info[this.futureList].string[this.futureIndex];

        if (this.movingItem && this.futureItem) {
          let _listFrom = Object.assign(
            [],
            this.info[this.originalList].string
          );
          let _listTo = Object.assign([], this.info[this.futureList].string);

          _listTo[this.futureIndex] = this.movingItem;
          _listFrom[this.originalIndex] = this.futureItem;

          this.info[this.originalList].string = _listFrom;
          this.info[this.futureList].string = _listTo;
        }
      }

      this.emitChange();
    },

    handleMoveItem(event) {
      const { index, futureIndex } = event.draggedContext;

      this.originalIndex = index;
      this.futureIndex = futureIndex;

      this.originalList = event.from.getAttribute("data-list");
      this.futureList = event.to.getAttribute("data-list");

      return false;
    },

    emitChange() {
      this.$emit("changeContent", {
        content: this.info,
        index: this.songIndex,
      });
    },
  },
};
</script>

<style lang="scss">
.tab {
  font-family: monospace;

  &__container {
    margin-bottom: $margin-bottom;
  }

  &__string {
    display: flex;

    span {
      cursor: pointer;
    }
  }
}
</style>
