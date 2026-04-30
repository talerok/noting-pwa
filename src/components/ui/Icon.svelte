<script lang="ts">
  interface Props {
    name: 'pin' | 'lock' | 'plus' | 'chevronLeft' | 'ellipsis' | 'gear' | 'trash' | 'pencil' | 'cloud' | 'cloudOff' | 'check' | 'xmark';
    size?: number;
    class?: string;
  }

  let { name, size = 20, class: className = '' }: Props = $props();

  const paths: Record<string, string> = {
    pin: 'M16 12V4h1V2H7v2h1v8l-2 2v2h5.5v6H13v-6h5.5v-2z',
    lock: 'M12 2C9.24 2 7 4.24 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.76-2.24-5-5-5zm0 2c1.65 0 3 1.35 3 3v3H9V7c0-1.65 1.35-3 3-3zm0 10a2 2 0 110 4 2 2 0 010-4z',
    plus: 'M12 4v16m-8-8h16',
    chevronLeft: 'M15 19l-7-7 7-7',
    ellipsis: 'M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z',
    gear: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
    trash: 'M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z',
    pencil: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    cloud: 'M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z',
    cloudOff: 'M22.61 16.95A5 5 0 0018 10h-1.26a8 8 0 00-7.05-6M5 5a8 8 0 004 15h9a5 5 0 001.7-.3 M1 1l22 22',
    check: 'M20 6L9 17l-5-5',
    xmark: 'M18 6L6 18M6 6l12 12',
  };

  const strokeIcons = new Set(['plus', 'chevronLeft', 'gear', 'trash', 'pencil', 'cloud', 'cloudOff', 'check', 'xmark']);
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  class={className}
  stroke={strokeIcons.has(name) ? 'currentColor' : 'none'}
  stroke-width={strokeIcons.has(name) ? 2 : 0}
  stroke-linecap="round"
  stroke-linejoin="round"
>
  {#if !strokeIcons.has(name)}
    <path d={paths[name]} fill="currentColor" />
  {:else}
    <path d={paths[name]} />
  {/if}
</svg>
