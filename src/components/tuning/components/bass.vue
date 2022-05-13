<template>
  <div class="bass">
    <form @submit.prevent="submitTunning">
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

      <button type="submit">Confirmar</button>
    </form>
  </div>
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
  display: flex;
  justify-content: space-between;

  input {
    width: 5ch;
    text-align: center;
  }
}
</style>
