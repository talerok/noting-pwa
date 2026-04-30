<script lang="ts">
  import { t } from '../../lib/i18n/index.svelte.js';
  import type { Appearance } from '../../lib/types/settings.js';
  import SegmentedControl from '../ui/SegmentedControl.svelte';

  interface Props {
    selected: Appearance;
    onchange: (value: Appearance) => void;
  }

  let { selected, onchange }: Props = $props();

  const options = $derived([
    { value: 'system', label: t('appearanceSystem') },
    { value: 'light', label: t('appearanceLight') },
    { value: 'dark', label: t('appearanceDark') },
  ]);
</script>

<div class="space-y-2">
  <h3 class="text-[13px] font-medium uppercase text-ios-label-secondary dark:text-ios-label-secondary-dark">
    {t('appearance')}
  </h3>
  <SegmentedControl {options} {selected} onchange={(v) => onchange(v as Appearance)} />
</div>
