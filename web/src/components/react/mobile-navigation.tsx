import type { ComponentProps, ReactNode } from 'react'

import { Dialog } from '@base-ui/react/dialog'
import Menu from '~icons/lucide/menu'
import X from '~icons/lucide/x'

import type { LanguageKeys } from '@/i18n'

import { getTranslations } from '@/i18n'
import { siteConfig } from '@/site.config'

interface Props {
  lang: LanguageKeys
  languages?: ReactNode
  logo?: ReactNode
  navItems: { href: string; label: string }[]
}

const { email, socialMediaLinks } = siteConfig

const CloseLink = ({ children, ...props }: ComponentProps<'a'>) => (
  <Dialog.Close
    nativeButton={false}
    render={(closeProps) => (
      <a {...closeProps} {...props}>
        {children}
      </a>
    )}
  />
)

const MobileNavigation = ({ lang, languages, logo, navItems }: Props) => {
  const t = getTranslations(lang)

  return (
    <Dialog.Root>
      <Dialog.Trigger
        aria-label={t('nav.openMenu')}
        className="inline-flex min-h-11 items-center md:hidden"
      >
        <Menu className="size-6" strokeWidth={1.5} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/10" />
        <Dialog.Popup className="fixed inset-0 z-50 flex flex-col bg-background">
          <Dialog.Title className="sr-only">{t('nav.main')}</Dialog.Title>
          <Dialog.Description className="sr-only">
            {t('nav.description')}
          </Dialog.Description>
          <div className="flex shrink-0 items-center justify-between border-b border-border-dark px-6 py-8">
            {logo}
            <Dialog.Close
              aria-label={t('nav.closeMenu')}
              className="inline-flex min-h-11 items-center"
            >
              <X className="size-6" strokeWidth={1.5} />
            </Dialog.Close>
          </div>
          <div className="flex flex-1 flex-col justify-between gap-12 px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <nav aria-label={t('nav.main')}>
              {navItems.map((item) => (
                <CloseLink
                  key={item.href}
                  href={item.href}
                  className="flex min-h-20 items-center justify-between gap-6 border-b border-border-dark py-4 text-[clamp(2.5rem,1.5rem+6vw,4rem)] leading-[1.15] tracking-[-0.035em] underline-offset-[0.15em] last:border-b-0 hover:underline hover:decoration-1"
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true" className="text-2xl font-normal">
                    ↘
                  </span>
                </CloseLink>
              ))}
            </nav>
            <div>
              <dl className="grid gap-y-6 border-t border-border-dark pt-6">
                <div>
                  <dt className="text-xs font-medium tracking-[0.18em] text-foreground/40 uppercase">
                    {t('contact.email')}
                  </dt>
                  <dd>
                    <CloseLink
                      href={`mailto:${email}`}
                      className="mt-2 inline-flex min-h-11 items-center text-xl tracking-tight underline-offset-4 hover:underline"
                    >
                      {email}
                    </CloseLink>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-[0.18em] text-foreground/40 uppercase">
                    {t('contact.follow')}
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                    {socialMediaLinks.map((social) => (
                      <CloseLink
                        key={social.label}
                        href={social.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-1 text-base underline-offset-4 hover:underline"
                      >
                        {social.label}
                        <span aria-hidden="true">↗</span>
                      </CloseLink>
                    ))}
                  </dd>
                </div>
              </dl>
              <div className="mt-6 flex items-center justify-between gap-6 border-t border-border-dark pt-6">
                <p className="text-xs font-medium tracking-[0.18em] text-foreground/40 uppercase">
                  {t('nav.language')}
                </p>
                {languages}
              </div>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default MobileNavigation
