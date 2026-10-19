<template>
  <div class="tab-header">
    <span
      class="tab-header__title"
      ref="title"
      role="textbox"
      @keydown="validate"
      @input="saveField('title', $event)"
      contenteditable
      :placeholder="$t('components.tabHeader.songName')"
    ></span>
    <span
      class="tab-header__artist"
      ref="artist"
      role="textbox"
      @keydown="validate"
      @input="saveField('artist', $event)"
      contenteditable
      :placeholder="$t('components.tabHeader.artistName')"
    ></span>
    <div>
      <span>{{ $t("components.tabHeader.tone") }}: </span>
      <span
        class="tab-header__tone"
        ref="tone"
        role="textbox"
        @keydown="validate"
        @input="newTone($event.target.innerText)"
        contenteditable
      ></span>
    </div>
    <div>
      <div>
        <span>{{ $t("components.tabHeader.tunning") }}: </span>
        <span class="tab-header__tuning">
          {{ getTuning }}
        </span>
        <TheButton id="changeTuningBtn" @click="toggleModal('showModalTuning')">
          <img
            src="@/assets/icons/edit.png"
            :alt="$t('components.tabHeader.tunningButton')"
            height="14px"
          />
        </TheButton>
      </div>
    </div>

    <Modal v-if="showModalTuning" @close="toggleModal('showModalTuning')">
      <div class="tab-header__modalTuning">
        <header>
          <h3>{{ $t("components.tabHeader.tunningButton") }}</h3>
        </header>

        <Tuning />
      </div>
    </Modal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Tuning from "@/components/tuning";

export default {
  name: "TabHeader",

  components: {
    Tuning,
  },

  data() {
    return {
      showModalTuning: false,
    };
  },

  mounted() {
    this.syncField("title", this.title);
    this.syncField("artist", this.artist);
    this.syncField("tone", this.tone);
  },

  // CONTENTEDITABLE NÃO É REATIVO: ATUALIZA QUANDO O STORE MUDA POR FORA
  // (EX: NOVA MÚSICA). SE O TEXTO JÁ É O MESMO, NÃO MEXE PARA NÃO MOVER O CURSOR
  watch: {
    title(value) {
      this.syncField("title", value);
    },

    artist(value) {
      this.syncField("artist", value);
    },

    tone(value) {
      this.syncField("tone", value);
    },
  },

  computed: {
    ...mapGetters("instrument", ["tuning", "tone"]),
    ...mapGetters("songStructure", ["title", "artist"]),

    getTuning() {
      return this.tuning.join(" - ");
    },
  },

  methods: {
    ...mapActions("instrument", ["newTone"]),
    ...mapActions("songStructure", ["setSongInfo"]),

    syncField(ref, value) {
      if (this.$refs[ref].innerText != value) this.$refs[ref].innerText = value;
    },

    saveField(field, event) {
      this.setSongInfo({ field, value: event.target.innerText });
    },

    toggleModal(modal) {
      this[modal] = !this[modal];
    },

    validate(event) {
      if (event.keyCode == 13) event.preventDefault();
    },
  },
};
</script>

<style lang="scss">
.tab-header {
  width: 100%;
  padding: 20px 27px;

  &__title {
    display: block;
    color: $primary;
    font-size: 2rem;
    font-family: "title";
    cursor: text;

    &[placeholder]:empty:before {
      content: attr(placeholder);
      color: $primary;
      opacity: 0.5;
    }
  }

  &__artist {
    display: block;
    color: $terciary;
    font-size: 1.5rem;
    cursor: text;

    &[placeholder]:empty:before {
      content: attr(placeholder);
      color: $terciary;
      opacity: 0.5;
    }
  }

  &__tone {
    display: inline-block;
    width: 100px;
    color: $primary;
    font-family: "title";
    margin-right: 10px;
  }

  &__tuning {
    color: $primary;
    font-family: "title";
    margin-right: 10px;
  }
}
</style>
