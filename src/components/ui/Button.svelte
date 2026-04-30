<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
    disabled?: boolean;
    onclick?: () => void;
    children: Snippet;
    class?: string;
  }

  let { variant = 'primary', disabled = false, onclick, children, class: className = '' }: Props = $props();

  const base = 'inline-flex items-center justify-center rounded-ios px-4 py-2 text-[17px] font-normal transition-opacity active:opacity-60 disabled:opacity-40';
  const variants: Record<string, string> = {
    primary: 'bg-ios-blue text-white',
    secondary: 'bg-ios-gray5 text-ios-label dark:bg-ios-bg-elevated2-dark dark:text-ios-label-dark',
    destructive: 'bg-ios-red text-white',
    ghost: 'bg-transparent text-ios-blue',
  };
</script>

<button class="{base} {variants[variant]} {className}" {disabled} onclick={onclick}>
  {@render children()}
</button>
