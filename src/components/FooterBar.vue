<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<template>
  <footer class="border-t border-neutral-800/80 py-6 text-center text-xs text-neutral-500">
    <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p>Radar Local © {{ year }} · Auditor de Google Meu Negócio & Google Ads</p>
      <div class="flex items-center gap-4 text-neutral-400">
        <span>Google Ads</span>
        <span>·</span>
        <span>Google Maps</span>
        <span>·</span>
        <span>Auditoria Local</span>
      </div>
    </div>
  </footer>
</template>
