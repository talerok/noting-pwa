<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import type { Snippet } from 'svelte';

  interface Props {
    open: boolean;
    onclose: () => void;
    children: Snippet;
    class?: string;
  }

  let { open, onclose, children, class: className = '' }: Props = $props();

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
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    onclick={handleBackdrop}
    transition:fade={{ duration: 200 }}
  >
    <div
      class="w-[90%] max-w-[340px] rounded-ios-lg bg-ios-bg-elevated p-6 shadow-xl dark:bg-ios-bg-elevated-dark {className}"
      transition:scale={{ start: 0.85, duration: 200 }}
    >
      {@render children()}
    </div>
  </div>
{/if}
