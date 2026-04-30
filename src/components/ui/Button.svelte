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

  const base = 'inline-flex items-center justify-center rounded-ios px-4 py-2.5 text-[17px] font-medium transition-opacity active:opacity-60 disabled:opacity-40';
  const variants: Record<string, string> = {
    primary: 'glass text-ios-blue',
    secondary: 'glass-input text-ios-label dark:text-ios-label-dark',
    destructive: 'glass text-ios-red',
    ghost: 'bg-transparent text-ios-blue',
  };
</script>

<button class="{base} {variants[variant]} {className}" {disabled} onclick={onclick}>
  {@render children()}
</button>
