<template>
  <div class="tuning">
    <header>
      <ul class="tuning__menu">
        <li
          @click="newTab('Guitar')"
          :class="{ active: selectedComponent == 'Guitar' }"
        >
          Violão/Guitarra
        </li>
        <li
          @click="newTab('Ukulele')"
          :class="{ active: selectedComponent == 'Ukulele' }"
        >
          Ukelele
        </li>
        <li
          @click="newTab('Bass')"
          :class="{ active: selectedComponent == 'Bass' }"
        >
          Baixo
        </li>
      </ul>
    </header>

    <section>
      <component :is="selectedComponent" @close="close" />
    </section>
  </div>
</template>

<script>
import Bass from "./components/bass.vue";
import Guitar from "./components/guitar.vue";
import Ukulele from "./components/ukulele.vue";

export default {
  name: "Tuning",

  components: {
    Bass,
    Guitar,
    Ukulele,
  },

  data() {
    return {
      selectedComponent: "Guitar",
    };
  },

  methods: {
    newTab(component) {
      this.selectedComponent = component;
    },

    close() {
      this.$parent.$emit("close");
    },
  },
};
</script>

<style lang="scss">
.tuning {
  > header {
    padding-top: 20px;
  }

  > section {
    padding: 20px;
    border: 1px solid black;
    border-top: none;
    padding-top: 30px;
  }

  &__menu {
    list-style: none;
    display: flex;

    li {
      cursor: pointer;
      text-align: center;
      padding: 10px;
      border-bottom: 1px solid black;
      flex: 1;

      &.active {
        border: 1px solid black;
        border-bottom: none;
      }
    }
  }
}
</style>
