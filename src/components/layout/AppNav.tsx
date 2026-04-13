'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import SoundToggle from '@/components/sound/SoundToggle'

interface AppNavProps {
  userName?: string | null
}

export default function AppNav({ userName }: AppNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/profile/new', label: 'New Profile' },
    { href: '/compare', label: 'Compare' },
    { href: '/pricing', label: 'Premium' },
    { href: '/about', label: 'About' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-midnight/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-serif text-xl gold-text">
          Cosmic Mirror
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap',
                pathname === link.href || pathname.startsWith(link.href + '/')
                  ? 'text-celestial-gold bg-celestial-gold/10'
                  : 'text-soft-silver/60 hover:text-soft-silver hover:bg-white/5'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <SoundToggle />
          {userName && (
            <span className="text-soft-silver/50 text-sm hidden sm:block">
              {userName}
            </span>
          )}
          <Link href="/settings" className="text-xs text-soft-silver/40 hover:text-soft-silver/70 transition-colors hidden sm:block">
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="text-xs text-soft-silver/40 hover:text-soft-silver/70 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
