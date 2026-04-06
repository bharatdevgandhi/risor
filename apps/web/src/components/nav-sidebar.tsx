'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '⚡' },
  { href: '/inbox', label: 'Inbox', icon: '📥' },
  { href: '/matrix', label: 'Matrix', icon: '🎯' },
  { href: '/goals', label: 'Goals', icon: '🏔' },
  { href: '/focus', label: 'Focus', icon: '🔬' },
  { href: '/review', label: 'Review', icon: '📊' },
];

export function NavSidebar({ inboxCount = 0 }: { inboxCount?: number }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-zinc-800 md:bg-zinc-950 md:px-3 md:py-6">
        <Link href="/" className="mb-8 px-3 text-xl font-bold tracking-tight text-white">
          RISOR
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.href === '/inbox' && inboxCount > 0 && (
                  <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                    {inboxCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-zinc-800 bg-zinc-950 md:hidden">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
                active ? 'text-white' : 'text-zinc-500'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
