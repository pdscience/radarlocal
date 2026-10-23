<script setup lang="ts">
defineProps<{ modelValue: string }>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  close: [];
  import: [];
}>();

const placeholder = `Exemplo:
Visualizações: 4.141
Interações: 588
Avaliação no Google: 5,0
Avaliações: 96
Chamadas: 151
Orientações: 434
Cliques no website: 3
Agendamentos: 0`;
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
      <div class="flex justify-between items-center">
        <h4 class="text-base font-bold text-white">Colar Dados do Painel do Google</h4>
        <button class="text-neutral-400 hover:text-white" @click="emit('close')">
          ✕
        </button>
      </div>

      <p class="text-xs text-neutral-400">
        Copie e cole aqui os dados fornecidos pelo proprietário do negócio (Google Meu Negócio/Google Ads). Estes dados não são públicos. Serão marcados como "importados pelo usuário".
      </p>

      <textarea
        :value="modelValue"
        rows="8"
        :placeholder="placeholder"
        class="w-full p-3 text-xs font-mono bg-neutral-950 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      />

      <div class="flex justify-end gap-3 pt-2">
        <button class="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white" @click="emit('close')">
          Cancelar
        </button>
        <button class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm" @click="emit('import')">
          Importar e Atualizar Radar
        </button>
      </div>
    </div>
  </div>
</template>
