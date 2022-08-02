<template>
  <form @submit.prevent="submitTunning" class="ukulele">
    <div class="guitar__form-group">
      <input type="text" required placeholder="A" value="A" />
      <input type="text" required placeholder="E" value="E" />
      <input type="text" required placeholder="C" value="C" />
      <input type="text" required placeholder="G" value="G" />
    </div>

    <TheButton type="submit">Confirmar</TheButton>
  </form>
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
  text-align: center;

  input {
    width: 5ch;
    text-align: center;
    margin: 0 5px;
  }

  &__form-group {
    margin-bottom: 20px;
  }
}
</style>
