<script lang="ts">
  import { fly } from 'svelte/transition';
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
        class="absolute inset-0 z-10 flex h-full w-full flex-col"
        in:fly={{ x: 300, duration: 350 }}
        out:fly={{ x: 300, duration: 300 }}
      >
        {@render detail()}
      </div>
    {/if}
  {:else}
    <div class="flex h-full w-[320px] min-w-[280px] flex-shrink-0 flex-col">
      {@render sidebar()}
    </div>
    <div class="flex h-full flex-1 flex-col">
      {@render detail()}
    </div>
  {/if}
</div>
