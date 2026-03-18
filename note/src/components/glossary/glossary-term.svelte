<svelte:options customElement='glossary-term' />

<script lang='ts'>
  import { glossaryPreference } from '@/lib/stores/glossary-preferences.svelte'
  import { glossaryStates as states } from './glossary-state.svelte'

  const { slug = '' } = $props()
  const isEnabled = $derived(glossaryPreference.current)

  function openGlossary() {
    if (!isEnabled)
      {return}
    states.trigger = $host()
    states.slug = slug
    states.isOpen = true
  }
</script>

{#if isEnabled}
  <button class='glossary-trigger' onclick={openGlossary}>
    <slot />
  </button>
{:else}
  <slot />
{/if}

<style>
  .glossary-trigger {
    background: transparent;
    border: none;
    border-bottom: 1px dashed var(--color-link);
    color: var(--color-link);
    cursor: pointer;
    font: inherit;
    line-height: 1.2;
    padding: 0;
  }

  .glossary-trigger:hover {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }
</style>
