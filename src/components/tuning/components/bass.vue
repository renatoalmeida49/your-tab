<template>
  <form @submit.prevent="submitTunning" class="bass">
    <div class="bass__form-group">
      <input
        type="text"
        required
        v-model="tuningModel[0]"
        placeholder="G"
        value="G"
      />
      <input
        type="text"
        required
        v-model="tuningModel[1]"
        placeholder="D"
        value="D"
      />
      <input
        type="text"
        required
        v-model="tuningModel[2]"
        placeholder="A"
        value="A"
      />
      <input
        type="text"
        required
        v-model="tuningModel[3]"
        placeholder="E"
        value="E"
      />
    </div>

    <button type="submit">Confirmar</button>
  </form>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

const defaultTuning = ["G", "D", "A", "E"];

export default {
  name: "Bass",

  data() {
    return {
      tuningModel: [],
    };
  },

  mounted() {
    if (this.instrument == "bass") {
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
      this.newInstrument("bass");
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
.bass {
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
