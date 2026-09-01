import { glossaryStates } from '@/components/glossary/glossary-state.svelte'

function onOpen(handler: (el: HTMLElement, slug: string) => void) {
  $effect(() => {
    if (
      glossaryStates.isOpen &&
      glossaryStates.trigger &&
      glossaryStates.slug
    ) {
      handler(glossaryStates.trigger, glossaryStates.slug)
    }
  })
}

export function useGlossaryEvents() {
  return {
    onOpen,
  }
}
