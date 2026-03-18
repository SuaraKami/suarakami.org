import { glossaryStates } from '@/components/glossary/glossary-state.svelte'

export function useGlossaryEvents() {
  const onOpen = (handler: (el: HTMLElement, slug: string) => void) => {
    $effect(() => {
      if (
        glossaryStates.isOpen
        && glossaryStates.trigger
        && glossaryStates.slug
      ) {
        handler(glossaryStates.trigger, glossaryStates.slug)
      }
    })
  }

  return {
    onOpen,
  }
}
