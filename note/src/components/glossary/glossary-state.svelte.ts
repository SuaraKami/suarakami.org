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
