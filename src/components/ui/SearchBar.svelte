<script lang="ts">
  import { t } from '../../lib/i18n/index.svelte.js';

  interface Props {
    value: string;
    oninput: (value: string) => void;
  }

  let { value, oninput }: Props = $props();
</script>

<div class="relative mx-4 mb-2">
  <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-ios-gray" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
  <input
    type="text"
    placeholder={t('search')}
    class="w-full rounded-ios glass-input py-2 pl-9 pr-3 text-[16px] text-ios-label outline-none placeholder:text-ios-gray dark:text-ios-label-dark dark:placeholder:text-ios-gray"
    {value}
    oninput={(e) => oninput(e.currentTarget.value)}
  />
  {#if value}
    <button
      class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-ios-gray3/80 text-white dark:bg-ios-gray/80"
      onclick={() => oninput('')}
      aria-label="Clear search"
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
    </button>
  {/if}
</div>
