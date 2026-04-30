<script lang="ts">
  import { t } from '../../lib/i18n/index.svelte.js';
  import { fade, fly } from 'svelte/transition';
  import type { Snippet } from 'svelte';

  interface Props {
    open: boolean;
    onclose: () => void;
    children: Snippet;
    title?: string;
  }

  let { open, onclose, children, title = '' }: Props = $props();

  function handleBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) onclose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
    onclick={handleBackdrop}
    transition:fade={{ duration: 200 }}
  ></div>
  <div
    class="fixed inset-0 z-50 flex items-end justify-center pointer-events-none md:items-center"
  >
    <div
      class="pointer-events-auto w-full max-h-[85vh] overflow-y-auto rounded-t-[16px] bg-ios-bg-elevated safe-area-bottom dark:bg-ios-bg-elevated-dark md:max-w-[420px] md:rounded-ios-lg md:rounded-b-ios-lg"
      transition:fly={{ y: 300, duration: 300 }}
    >
      {#if title}
        <div class="flex items-center justify-between px-4 py-3 border-b border-ios-separator dark:border-ios-separator-dark">
          <h2 class="text-[17px] font-semibold text-ios-label dark:text-ios-label-dark">{title}</h2>
          <button
            class="text-ios-blue text-[17px] font-normal active:opacity-60"
            onclick={onclose}
          >{t('done')}</button>
        </div>
      {/if}

      <div class="p-4">
        {@render children()}
      </div>
    </div>
  </div>
{/if}
