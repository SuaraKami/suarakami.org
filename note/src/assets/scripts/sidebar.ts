function setupSidebarControls() {
  const sidebar = document.querySelector('#sidebar')
  const overlay = document.querySelector('#sidebar-overlay')

  if (!(sidebar && overlay)) {
    return
  }

  let isOpen = !sidebar.classList.contains('-translate-x-full')

  const applyState = () => {
    if (isOpen) {
      sidebar.classList.remove('-translate-x-full')
      overlay.classList.remove('opacity-0', 'pointer-events-none')
      overlay.classList.add('opacity-100')
    } else {
      sidebar.classList.add('-translate-x-full')
      overlay.classList.add('opacity-0', 'pointer-events-none')
      overlay.classList.remove('opacity-100')
    }

    for (const btn of document.querySelectorAll<HTMLButtonElement>(
      '[data-sidebar-toggle]'
    )) {
      if (btn.dataset.sidebarToggle === 'close') {
        continue
      }
      btn.setAttribute('aria-expanded', String(isOpen))
    }
  }

  const setOpen = (open: boolean) => {
    if (isOpen === open) {
      return
    }
    isOpen = open
    applyState()
  }

  const handleClick = (e: MouseEvent) => {
    const btn = e.currentTarget as HTMLButtonElement
    const action = btn.dataset.sidebarToggle ?? 'toggle'
    if (action === 'open') {
      setOpen(true)
    } else if (action === 'close') {
      setOpen(false)
    } else {
      setOpen(!isOpen)
    }
  }

  for (const btn of document.querySelectorAll<HTMLButtonElement>(
    '[data-sidebar-toggle]'
  )) {
    if (btn.dataset.sidebarBound === 'true') {
      continue
    }
    btn.addEventListener('click', handleClick)
    btn.dataset.sidebarBound = 'true'
  }

  applyState()
}

document.addEventListener('astro:page-load', setupSidebarControls)
