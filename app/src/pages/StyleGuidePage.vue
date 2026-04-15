<script setup lang="ts">
import StyleGuide from '@/components/StyleGuide.vue'
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <div class="mb-6">
      <router-link
        to="/catalogue"
        class="text-sm text-gray-400 hover:text-gray-200 transition-colors"
      >
        &larr; Back to Catalogue
      </router-link>
    </div>
    <StyleGuide />
  </div>
</template>
