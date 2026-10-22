<template>
  <div class="google-button">
    <div ref="button" class="google-button__slot" />

    <p v-if="status == 'loading'" class="google-button__status">
      <LoaderCircle :size="18" class="google-button__spinner" />
      {{ $t("components.login.loading") }}
    </p>
    <p
      v-else-if="status != 'ready'"
      class="google-button__status google-button__status--error"
    >
      {{ $t(`components.login.${status}`) }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { LoaderCircle } from "lucide-vue-next";
import { api } from "@/core/api";
import { renderGoogleButton } from "@/core/google";

type Status =
  "loading" | "ready" | "notConfigured" | "offline" | "scriptFailed";

// O BOTÃO OFICIAL DO GOOGLE, DESENHADO PELO SCRIPT DELES DENTRO DO <div>
export default defineComponent({
  name: "GoogleButton",

  components: {
    LoaderCircle,
  },

  emits: {
    credential: (credential: string) => !!credential,
  },

  data() {
    return {
      status: "loading" as Status,
    };
  },

  async mounted() {
    let clientId: string;

    try {
      clientId = (await api.config()).googleClientId;
    } catch {
      this.status = "offline";
      return;
    }

    if (!clientId) {
      this.status = "notConfigured";
      return;
    }

    const root = getComputedStyle(document.documentElement);

    try {
      await renderGoogleButton({
        element: this.$refs.button as HTMLElement,
        clientId,
        locale: this.$i18n.locale == "enUS" ? "en" : "pt-BR",
        theme: root.colorScheme == "dark" ? "dark" : "light",
        onCredential: (credential) => this.$emit("credential", credential),
      });
      this.status = "ready";
    } catch {
      this.status = "scriptFailed";
    }
  },
});
</script>

<style lang="scss">
.google-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);

  &__slot:empty {
    display: none;
  }

  &__status {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    text-align: center;

    &--error {
      color: var(--color-danger);
    }
  }

  &__spinner {
    animation: export-spin 0.9s linear infinite;
  }
}
</style>
