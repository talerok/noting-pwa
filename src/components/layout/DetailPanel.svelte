<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="flex h-full w-full flex-col bg-ios-bg dark:bg-ios-bg-dark">
  {@render children()}
</div>
