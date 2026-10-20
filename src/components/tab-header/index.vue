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

    <div class="tab-header__meta">
      <label class="chip">
        <span class="chip__label">{{ $t("components.tabHeader.tone") }}</span>
        <span
          class="chip__value tab-header__tone"
          ref="tone"
          role="textbox"
          @keydown="validate"
          @input="saveTone"
          contenteditable
        ></span>
      </label>

      <button
        id="changeTuningBtn"
        class="chip chip--button"
        :title="$t('components.tabHeader.tuningButton')"
        @click="toggleModal('showModalTuning')"
      >
        <span class="chip__label">{{ $t("components.tabHeader.tuning") }}</span>
        <span class="chip__value tab-header__tuning">{{ getTuning }}</span>
        <span class="chip__hint tab-header__instrument">
          {{ $t(`components.tuning.${instrument}`) }}
        </span>
        <Pencil :size="14" class="chip__icon" data-pdf-hide />
      </button>
    </div>

    <Modal
      v-if="showModalTuning"
      :title="$t('components.tabHeader.tuningButton')"
      @close="toggleModal('showModalTuning')"
    >
      <Tuning @close="toggleModal('showModalTuning')" />
    </Modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { useInstrumentStore } from "@/stores/instrument";
import { useSongStore, type SongField } from "@/stores/song";
import Tuning from "@/components/tuning/index.vue";
import { Pencil } from "lucide-vue-next";

type HeaderField = SongField | "tone";

export default defineComponent({
  name: "TabHeader",

  components: {
    Pencil,
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
    ...mapState(useInstrumentStore, ["tuning", "tone", "instrument"]),
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
  padding-bottom: var(--space-5);
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);

  [contenteditable]:focus {
    outline: none;
  }

  &__title {
    display: block;
    color: var(--color-text);
    font-size: var(--text-2xl);
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.2;
    cursor: text;

    &[placeholder]:empty:before {
      content: attr(placeholder);
      color: var(--color-text-subtle);
    }
  }

  &__artist {
    display: block;
    margin-top: var(--space-1);
    color: var(--color-text-muted);
    font-size: var(--text-lg);
    cursor: text;

    &[placeholder]:empty:before {
      content: attr(placeholder);
      color: var(--color-text-subtle);
    }
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-4);
  }
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 32px;
  padding: 0 var(--space-3);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  cursor: text;

  &:focus-within {
    border-color: var(--color-accent);
  }

  &--button {
    cursor: pointer;

    &:hover {
      background: var(--color-surface-hover);
    }
  }

  &__label {
    color: var(--color-text-muted);
  }

  &__value {
    min-width: 1ch;
    color: var(--color-accent);
    font-weight: 700;
  }

  &__hint {
    color: var(--color-text-subtle);
    font-size: var(--text-xs);
  }

  &__icon {
    color: var(--color-text-muted);
  }
}
</style>
