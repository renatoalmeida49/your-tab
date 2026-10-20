<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger
      class="the-button the-button--ghost the-button--md language-menu__trigger"
      :aria-label="$t('components.menu.language')"
      :title="$t('components.menu.language')"
    >
      <Languages :size="18" />
      <span class="language-menu__code">{{ current.short }}</span>
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent class="dropdown" align="end" :sideOffset="6">
        <DropdownMenuRadioGroup
          :modelValue="$i18n.locale"
          @update:modelValue="changeLanguage"
        >
          <DropdownMenuRadioItem
            v-for="language in languages"
            :key="language.key"
            :value="language.key"
            class="dropdown__item language-menu__item"
          >
            <img :src="language.icon" height="18" alt="" />
            {{ language.name }}
            <DropdownMenuItemIndicator class="dropdown__indicator">
              <Check :size="16" />
            </DropdownMenuItemIndicator>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  type AcceptableValue,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "reka-ui";
import { Check, Languages } from "lucide-vue-next";
import { setLanguage, type Language } from "@/core/plugins/i18n";
import brazilFlag from "@/assets/flags/brazil.png";
import unitedStatesFlag from "@/assets/flags/united-states.png";

// O NOME DE CADA IDIOMA FICA NO PRÓPRIO IDIOMA, SEM TRADUÇÃO
const languages: {
  key: Language;
  name: string;
  short: string;
  icon: string;
}[] = [
  { key: "ptBR", name: "Português (Brasil)", short: "PT", icon: brazilFlag },
  { key: "enUS", name: "English", short: "EN", icon: unitedStatesFlag },
];

export default defineComponent({
  name: "LanguageMenu",

  components: {
    Check,
    DropdownMenuContent,
    DropdownMenuItemIndicator,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuRoot,
    DropdownMenuTrigger,
    Languages,
  },

  data() {
    return {
      languages,
    };
  },

  computed: {
    current() {
      return (
        languages.find((language) => language.key == this.$i18n.locale) ??
        languages[0]
      );
    },
  },

  methods: {
    changeLanguage(language: AcceptableValue) {
      setLanguage(language as Language);
    },
  },
});
</script>

<style lang="scss">
.language-menu {
  &__trigger {
    gap: var(--space-1);
    padding: 0 var(--space-2);
  }

  &__code {
    font-size: var(--text-xs);
    font-weight: 700;

    @include tablet {
      display: none;
    }
  }

  &__item img {
    border-radius: 50%;
  }
}
</style>
