<template>
  <Modal
    v-if="loginOpen"
    :title="$t('components.login.title')"
    :showFooter="false"
    @close="close"
  >
    <div class="login">
      <p class="login__description">
        {{ $t("components.login.description") }}
      </p>

      <p v-if="signingIn" class="login__status">
        {{ $t("components.login.signingIn") }}
      </p>
      <GoogleButton v-else @credential="signIn" />

      <p v-if="failed" class="login__status login__status--error">
        {{ $t("components.login.failed") }}
      </p>
    </div>
  </Modal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useLibraryStore } from "@/stores/library";
import { useUiStore } from "@/stores/ui";
import GoogleButton from "./google-button.vue";

export default defineComponent({
  name: "TheLogin",

  components: {
    GoogleButton,
  },

  data() {
    return {
      signingIn: false,
      failed: false,
    };
  },

  computed: {
    ...mapState(useUiStore, ["loginOpen"]),
  },

  watch: {
    loginOpen(open: boolean) {
      if (open) this.failed = false;
    },
  },

  methods: {
    ...mapActions(useAuthStore, ["login"]),
    ...mapActions(useUiStore, ["setLoginOpen", "showFlash"]),

    async signIn(credential: string) {
      const library = useLibraryStore();

      this.signingIn = true;
      this.failed = false;

      try {
        await this.login(credential);
      } catch {
        this.failed = true;
        return;
      } finally {
        this.signingIn = false;
      }

      this.setLoginOpen(false);

      // ENTROU PELO "SALVAR": TERMINA O QUE O USUÁRIO PEDIU
      if (library.pendingSave) {
        library.pendingSave = false;
        await library.save();
      } else {
        this.showFlash("components.login.welcome");
      }
    },

    close() {
      useLibraryStore().pendingSave = false;
      this.setLoginOpen(false);
    },
  },
});
</script>

<style lang="scss">
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-2) 0;
  text-align: center;

  &__description {
    color: var(--color-text-muted);
  }

  &__status {
    color: var(--color-text-muted);
    font-size: var(--text-sm);

    &--error {
      color: var(--color-danger);
    }
  }
}
</style>
