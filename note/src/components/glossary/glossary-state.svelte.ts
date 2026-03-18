interface GlossaryState {
  trigger: HTMLElement | null
  isOpen: boolean
  slug: string | null
}

export const glossaryStates = $state<GlossaryState>({
  isOpen: false,
  slug: null,
  trigger: null,
})
