<template>
  <div class="home">
    <div id="song" class="home__song">
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
import { mapGetters } from "vuex";
import Draggable from "vuedraggable";

export default {
  name: "Home",

  components: {
    Draggable,
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
    forceRender() {
      this.render++;
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
  min-height: calc(100vh - 77px);
  padding: 0 60px;
  position: relative;
}
</style>
