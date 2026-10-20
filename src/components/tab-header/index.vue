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
        @input="saveTone"
        contenteditable
      ></span>
    </div>
    <div>
      <div>
        <span>{{ $t("components.tabHeader.tuning") }}: </span>
        <span class="tab-header__tuning">
          {{ getTuning }}
        </span>
        <TheButton id="changeTuningBtn" @click="toggleModal('showModalTuning')">
          <img
            src="@/assets/icons/edit.png"
            :alt="$t('components.tabHeader.tuningButton')"
            height="14px"
          />
        </TheButton>
      </div>
    </div>

    <Modal v-if="showModalTuning" @close="toggleModal('showModalTuning')">
      <div class="tab-header__modalTuning">
        <header>
          <h3>{{ $t("components.tabHeader.tuningButton") }}</h3>
        </header>

        <Tuning @close="toggleModal('showModalTuning')" />
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { useInstrumentStore } from "@/stores/instrument";
import { useSongStore, type SongField } from "@/stores/song";
import Tuning from "@/components/tuning/index.vue";

type HeaderField = SongField | "tone";

export default defineComponent({
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
    title(value: string) {
      this.syncField("title", value);
    },

    artist(value: string) {
      this.syncField("artist", value);
    },

    tone(value: string) {
      this.syncField("tone", value);
    },
  },

  computed: {
    ...mapState(useInstrumentStore, ["tuning", "tone"]),
    ...mapState(useSongStore, ["title", "artist"]),

    getTuning() {
      return this.tuning.join(" - ");
    },
  },

  methods: {
    ...mapActions(useInstrumentStore, ["newTone"]),
    ...mapActions(useSongStore, ["setSongInfo"]),

    syncField(ref: HeaderField, value: string) {
      const element = this.$refs[ref] as HTMLElement;

      if (element.innerText != value) element.innerText = value;
    },

    saveField(field: SongField, event: Event) {
      this.setSongInfo({
        field,
        value: (event.target as HTMLElement).innerText,
      });
    },

    saveTone(event: Event) {
      this.newTone((event.target as HTMLElement).innerText);
    },

    toggleModal(modal: "showModalTuning") {
      this[modal] = !this[modal];
    },

    validate(event: KeyboardEvent) {
      if (event.key == "Enter") event.preventDefault();
    },
  },
});
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
    color: $tertiary;
    font-size: 1.5rem;
    cursor: text;

    &[placeholder]:empty:before {
      content: attr(placeholder);
      color: $tertiary;
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
