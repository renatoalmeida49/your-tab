<template>
  <div class="ukulele">
    <form @submit.prevent="submitTunning">
      <input type="text" required placeholder="A" value="A" />
      <input type="text" required placeholder="E" value="E" />
      <input type="text" required placeholder="C" value="C" />
      <input type="text" required placeholder="G" value="G" />

      <button type="submit">Confirmar</button>
    </form>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

const defaultTuning = ["A", "E", "C", "G"];

export default {
  name: "Ukelele",

  data() {
    return {
      tuningModel: [],
    };
  },

  mounted() {
    if (this.instrument == "ukulele") {
      this.$set(this, "tuningModel", Object.assign([], this.tuning));
    } else {
      this.tuningModel = defaultTuning;
    }
  },

  computed: {
    ...mapGetters("instrument", ["tuning", "instrument"]),
  },

  methods: {
    ...mapActions("instrument", ["newTuning", "newInstrument"]),

    submitTunning() {
      this.newInstrument("ukulele");
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
.ukulele {
  display: flex;
  justify-content: space-between;

  input {
    width: 5ch;
    text-align: center;
  }
}
</style>
