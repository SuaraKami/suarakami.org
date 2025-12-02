interface GlossaryState {
  trigger: HTMLElement | null
  isOpen: boolean
  slug: string | null
}

export const glossaryStates = $state<GlossaryState>({
  trigger: null,
  isOpen: false,
  slug: null,
})

export function useOnOpenGlossary(handler: (el: HTMLElement, slug: string) => void) {
  $effect(() => {
    if (glossaryStates.isOpen && glossaryStates.trigger && glossaryStates.slug) {
      handler(glossaryStates.trigger, glossaryStates.slug)
    }
  })
}
