<script lang='ts'>
  import { Popover } from 'bits-ui'
  import { glossaryPreference } from '@/lib/stores/glossary-preferences.svelte'

  const enabled = $derived(glossaryPreference.current)
  const menuId = 'reading-options'

  function toggleGlossary() {
    glossaryPreference.current = !enabled
  }

</script>

<Popover.Root>
  <Popover.Trigger aria-controls={menuId}>
    <slot />
  </Popover.Trigger>
  <Popover.Portal>
    <Popover.Content side='bottom' align='end' sideOffset={12} class='z-40'>
      <div
        id={menuId}
        role='menu'
        class='rounded-md border border-border bg-panel p-1 text-sm text-foreground'
      >
        <button
          class='flex w-full items-center justify-between gap-3 rounded-sm px-4 py-1 transition-colors hover:bg-white/5'
          onclick={toggleGlossary}
        >
          Aktifkan Glosarium
          <span
            class={{
              'flex size-4 items-center justify-center': true,
              'text-transparent': !enabled,
            }}
            aria-hidden='true'
          >
            <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'>
              <path fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M5 14.5s1.5 0 3.5 3.5c0 0 5.559-9.167 10.5-11' />
            </svg>
          </span>
        </button>
      </div>
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
