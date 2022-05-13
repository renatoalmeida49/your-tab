<template>
  <div class="tuning">
    <header>
      <ul class="tuning__menu">
        <li @click="newTab('Guitar')">Violão/Guitarra</li>
        <li @click="newTab('Ukulele')">Ukelele</li>
        <li @click="newTab('Bass')">Baixo</li>
      </ul>
    </header>

    <section>
      <component :is="selectedComponent" />
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
  },
};
</script>

<style lang="scss">
.tuning {
  &__menu {
    list-style: none;
    display: flex;
    gap: 20px;

    li {
      cursor: pointer;
    }
  }
}
</style>
