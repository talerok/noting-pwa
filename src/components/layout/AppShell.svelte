<script lang="ts">
  import { fly } from 'svelte/transition';
  import { linear } from 'svelte/easing';
  import type { Snippet } from 'svelte';

  interface Props {
    isMobile: boolean;
    showDetail: boolean;
    sidebar: Snippet;
    detail: Snippet;
  }

  let { isMobile, showDetail, sidebar, detail }: Props = $props();
</script>

<div class="relative flex h-full w-full overflow-hidden">
  {#if isMobile}
    <div class="flex h-full w-full flex-col">
      {@render sidebar()}
    </div>
    {#if showDetail}
      <div
        class="absolute inset-0 z-10 flex h-full w-full flex-col bg-[#E8E8ED] dark:bg-[#1A1A1A]"
        in:fly={{ x: 300, duration: 250, opacity: 1, easing: linear }}
        out:fly={{ x: 300, duration: 250, opacity: 1, easing: linear }}
      >
        {@render detail()}
      </div>
    {/if}
  {:else}
    <div class="flex h-full w-[320px] min-w-[280px] flex-shrink-0 flex-col border-r border-ios-separator dark:border-ios-separator-dark">
      {@render sidebar()}
    </div>
    <div class="flex h-full flex-1 flex-col">
      {@render detail()}
    </div>
  {/if}
</div>
