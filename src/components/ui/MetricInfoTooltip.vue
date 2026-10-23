<script setup lang="ts">
import { ref } from 'vue';
import { Info, Sparkles } from '@lucide/vue';

const props = withDefaults(
  defineProps<{
    title?: string;
    text: string;
    impact?: string;
    align?: 'left' | 'center' | 'right';
    position?: 'top' | 'bottom';
  }>(),
  {
    align: 'center',
    position: 'top',
  }
);

const isOpen = ref(false);
</script>

<template>
  <div
    class="relative inline-flex items-center"
    @mouseenter="isOpen = true"
    @mouseleave="isOpen = false"
  >
    <button
      type="button"
      class="p-0.5 text-neutral-400 hover:text-emerald-400 transition-colors rounded hover:bg-neutral-800/80 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer inline-flex items-center justify-center"
      title="O que significa para o SEO Local"
      aria-label="O que significa para o SEO Local"
      @click.stop="isOpen = !isOpen"
      @focus="isOpen = true"
      @blur="isOpen = false"
    >
      <Info class="w-3.5 h-3.5" />
    </button>

    <div
      v-if="isOpen"
      role="tooltip"
      class="absolute z-50 w-72 p-3 bg-neutral-950/95 text-neutral-200 border border-neutral-700/80 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none select-none text-left"
      :class="[
        props.position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
        props.align === 'left'
          ? 'left-0'
          : props.align === 'right'
            ? 'right-0'
            : 'left-1/2 -translate-x-1/2',
      ]"
    >
      <div
        v-if="props.title"
        class="flex items-center gap-1.5 pb-1.5 mb-1.5 border-b border-neutral-800 text-[11px] font-bold text-white tracking-wide"
      >
        <Sparkles class="w-3 h-3 text-emerald-400 shrink-0" />
        <span>{{ props.title }}</span>
      </div>
      <p class="text-xs text-neutral-300 leading-relaxed font-normal">
        {{ props.text }}
      </p>
      <div
        v-if="props.impact"
        class="mt-2 pt-1.5 border-t border-neutral-800 flex items-start gap-1 text-[11px]"
      >
        <span class="font-semibold text-emerald-400 shrink-0">Impacto no SEO Local:</span>
        <span class="text-neutral-300">{{ props.impact }}</span>
      </div>
      <div
        class="absolute w-2 h-2 bg-neutral-950 border-neutral-700/80 rotate-45"
        :class="[
          props.position === 'top'
            ? 'top-full -mt-1 border-r border-b'
            : 'bottom-full -mb-1 border-l border-t',
          props.align === 'left'
            ? 'left-3'
            : props.align === 'right'
              ? 'right-3'
              : 'left-1/2 -translate-x-1/2',
        ]"
      />
    </div>
  </div>
</template>
