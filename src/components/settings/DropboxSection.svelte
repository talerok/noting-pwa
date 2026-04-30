<script lang="ts">
  import { t } from '../../lib/i18n/index.svelte.js';
  import type { SyncStore } from '../../lib/stores/sync.svelte.js';
  import type { OPFSStorage } from '../../lib/services/storage.js';
  import Button from '../ui/Button.svelte';
  import Icon from '../ui/Icon.svelte';

  interface Props {
    syncStore: SyncStore;
    storage: OPFSStorage;
    activeNoteId: string | null;
  }

  let { syncStore, storage, activeNoteId }: Props = $props();

  let connecting = $state(false);

  async function handleConnect() {
    connecting = true;
    try {
      await syncStore.connect();
    } catch (err) {
      console.error('Dropbox connect failed:', err);
      connecting = false;
    }
  }

  async function handleSync() {
    await syncStore.sync(storage, activeNoteId);
  }

  function statusLabel(): string {
    switch (syncStore.status) {
      case 'syncing': return t('syncing');
      case 'synced': return t('synced');
      case 'pendingSync': return t('syncing');
      case 'error': return t('syncError');
      default: return '';
    }
  }
</script>

<div class="space-y-3">
  <h3 class="text-[13px] font-medium uppercase text-ios-label-secondary dark:text-ios-label-secondary-dark">
    Dropbox
  </h3>

  {#if syncStore.isConnected}
    <div class="rounded-ios glass">
      <!-- Status -->
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-2">
          <Icon
            name={syncStore.status === 'error' ? 'cloudOff' : 'cloud'}
            size={20}
            class={syncStore.status === 'error' ? 'text-ios-red' : 'text-ios-green'}
          />
          <span class="text-[17px] text-ios-label dark:text-ios-label-dark">
            {statusLabel()}
          </span>
        </div>
        <Button variant="secondary" onclick={handleSync}>{t('syncNow')}</Button>
      </div>

      {#if syncStore.errorMessage}
        <p class="px-4 pb-3 text-[14px] text-ios-red">{syncStore.errorMessage}</p>
      {/if}

      <div class="border-t border-ios-separator dark:border-ios-separator-dark px-4 py-3">
        <Button variant="destructive" onclick={() => syncStore.disconnect()} class="w-full">
          {t('disconnect')}
        </Button>
      </div>
    </div>
  {:else}
    <Button variant="secondary" onclick={handleConnect} disabled={connecting} class="w-full">
      {connecting ? t('connectingDropbox') : t('connectDropbox')}
    </Button>
  {/if}
</div>
