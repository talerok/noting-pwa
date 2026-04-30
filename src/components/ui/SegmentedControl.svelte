<script lang="ts">
  interface Option {
    value: string;
    label: string;
  }

  interface Props {
    options: Option[];
    selected: string;
    onchange: (value: string) => void;
  }

  let { options, selected, onchange }: Props = $props();

  let selectedIndex = $derived(options.findIndex((o) => o.value === selected));
</script>

<div class="relative flex rounded-[10px] glass-input p-[2px]">
  <!-- Sliding pill -->
  <div
    class="absolute top-[2px] bottom-[2px] rounded-[9px] glass shadow-sm transition-transform duration-300 ease-out"
    style="width: calc({100 / options.length}% - {options.length > 1 ? 0 : 0}px); transform: translateX({selectedIndex * 100}%);"
  ></div>

  {#each options as opt}
    <button
      class="relative z-10 flex-1 rounded-[9px] px-3 py-[6px] text-[13px] font-medium transition-colors duration-200
        {selected === opt.value
          ? 'text-ios-label dark:text-ios-label-dark'
          : 'text-ios-label-secondary dark:text-ios-label-secondary-dark'}"
      onclick={() => onchange(opt.value)}
    >
      {opt.label}
    </button>
  {/each}
</div>
