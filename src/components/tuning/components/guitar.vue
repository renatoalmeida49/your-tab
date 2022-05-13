<template>
  <div class="guitar">
    <form @submit.prevent="submitTuning">
      <input type="text" required v-model="tuningModel[0]" placeholder="e" />
      <input type="text" required v-model="tuningModel[1]" placeholder="B" />
      <input type="text" required v-model="tuningModel[2]" placeholder="G" />
      <input type="text" required v-model="tuningModel[3]" placeholder="D" />
      <input type="text" required v-model="tuningModel[4]" placeholder="A" />
      <input type="text" required v-model="tuningModel[5]" placeholder="E" />

      <button type="submit">Confirmar</button>
    </form>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Guitar",

  data() {
    return {
      tuningModel: [],
    };
  },

  mounted() {
    this.$set(this, "tuningModel", Object.assign([], this.tuning));
  },

  computed: {
    ...mapGetters("instrument", ["tuning"]),
  },

  methods: {
    ...mapActions("instrument", ["newTuning"]),

    submitTuning() {
      this.newTuning(this.tuningModel);

      this.close();
    },

    close() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss">
.guitar {
  display: flex;
  justify-content: space-between;

  input {
    width: 5ch;
    text-align: center;
  }
}
</style>
