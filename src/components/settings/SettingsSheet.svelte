<script lang="ts">
  import { t } from '../../lib/i18n/index.svelte.js';
  import type { SettingsStore } from '../../lib/stores/settings.svelte.js';
  import type { SyncStore } from '../../lib/stores/sync.svelte.js';
  import type { OPFSStorage } from '../../lib/services/storage.js';
  import type { Locale } from '../../lib/types/settings.js';
  import BottomSheet from '../ui/BottomSheet.svelte';
  import AppearancePicker from './AppearancePicker.svelte';
  import DropboxSection from './DropboxSection.svelte';
  import SegmentedControl from '../ui/SegmentedControl.svelte';

  interface Props {
    open: boolean;
    onclose: () => void;
    settingsStore: SettingsStore;
    syncStore: SyncStore;
    storage: OPFSStorage;
    activeNoteId: string | null;
  }

  let { open, onclose, settingsStore, syncStore, storage, activeNoteId }: Props = $props();

  const langOptions = [
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Русский' },
  ];
</script>

<BottomSheet {open} {onclose} title={t('settings')}>
  <div class="space-y-6">
    <AppearancePicker
      selected={settingsStore.appearance}
      onchange={(v) => settingsStore.setAppearance(v)}
    />

    <div class="space-y-2">
      <h3 class="text-[13px] font-medium uppercase text-ios-label-secondary dark:text-ios-label-secondary-dark">
        {t('language')}
      </h3>
      <SegmentedControl
        options={langOptions}
        selected={settingsStore.locale}
        onchange={(v) => settingsStore.setLocaleValue(v as Locale)}
      />
    </div>

    <DropboxSection {syncStore} {storage} {activeNoteId} />
  </div>
</BottomSheet>
