<svelte:options customElement={{ tag: 'glossary-term', shadow: 'none' }} />

<script lang='ts'>
  import { useEventListener } from 'runed'
  import { glossaryStates as states } from './glossary-state.svelte'

  const { slug = '' } = $props()

  function openGlossary() {
    states.trigger = $host()
    states.slug = slug
    states.isOpen = true
  }

  useEventListener($host(), 'click', openGlossary)
  useEventListener($host(), 'keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openGlossary()
    }
  })
</script>

<slot />
