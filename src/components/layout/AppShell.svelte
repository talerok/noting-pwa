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

<div class="flex h-full w-full overflow-hidden bg-ios-bg-secondary dark:bg-ios-bg-grouped-dark">
  {#if isMobile}
    {#if showDetail}
      <div class="flex h-full w-full flex-col" in:fly={{ x: 300, duration: 250 }} out:fly={{ x: 300, duration: 200 }}>
        {@render detail()}
      </div>
    {:else}
      <div class="flex h-full w-full flex-col">
        {@render sidebar()}
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
