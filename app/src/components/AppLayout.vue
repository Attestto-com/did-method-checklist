<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMethodsData } from '@/composables/useMethodsData'
import MethodologyNote from '@/components/MethodologyNote.vue'

const route = useRoute()
const { loading, error, loadAll } = useMethodsData()

const NAV_ITEMS = [
  { name: 'catalogue', label: 'Catalogue' },
  { name: 'ecosystem', label: 'Ecosystem' },
  { name: 'self-assessment', label: 'Self-Assessment' },
  { name: 'requirements', label: 'Requirements Matrix' },
]

onMounted(loadAll)
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background: var(--color-bg-base); color: var(--color-text-secondary);">
    <!-- Header -->
    <header class="shell-header">
      <div class="layout-page text-center">
        <router-link to="/" class="inline-block">
          <h1 class="shell-header__title">
            DID Method <span class="shell-header__accent">Catalogue</span>
          </h1>
        </router-link>
        <p class="shell-header__subtitle">
          A development catalogue for DID method visibility — not a registry, not an endorsement
        </p>
      </div>
    </header>

    <!-- Navigation (hidden on pages that opt out) -->
    <nav
      v-if="!route.meta.hideNav"
      class="shell-nav"
    >
      <div class="layout-page flex gap-6">
        <router-link
          v-for="item in NAV_ITEMS"
          :key="item.name"
          :to="{ name: item.name }"
          class="shell-nav__link"
          :class="route.name === item.name
            ? 'shell-nav__link--active'
            : 'shell-nav__link--inactive'"
        >
          {{ item.label }}
        </router-link>
      </div>
    </nav>

    <!-- Main content -->
    <main
      class="mx-auto layout-content layout-sections flex-1 w-full"
      :class="route.meta.fullWidth ? 'layout-page-full' : 'layout-page'"
    >
      <MethodologyNote v-if="!route.meta.hideNav" />

      <div v-if="loading" class="state-loading">Loading method data...</div>
      <div v-else-if="error" class="state-error">{{ error }}</div>

      <router-view v-else />
    </main>

    <!-- Footer -->
    <footer class="shell-footer">
      <div class="layout-page flex items-center justify-between shell-footer__text">
        <span>DID Method Landscape Explorer &middot; beta v1</span>
        <div class="flex items-center gap-4">
          <router-link to="/llm-prompt" class="shell-footer__link underline">
            LLM Prompt
          </router-link>
          <router-link to="/style-guide" class="shell-footer__link underline">
            Style Guide
          </router-link>
          <a href="https://www.w3.org/TR/did-core/" target="_blank" class="shell-footer__link">
            W3C DID Core
          </a>
          <a href="https://www.w3.org/TR/did-spec-registries/" target="_blank" class="shell-footer__link">
            DID Spec Registries
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>
