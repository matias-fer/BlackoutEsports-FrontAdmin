import Link from "next/link";
import { games } from "@/data/players";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-sm border border-signal text-signal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v6M12 16v6M2 12h6M16 12h6" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <span className="font-mono text-sm tracking-tight text-paper">
            Blackout <span className="text-signal">Esports</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-xs text-mute sm:gap-5 sm:text-sm">
          {games.map((g) => (
            <Link key={g.id} href={`/${g.id}`} className="hover:text-paper transition-colors">
              {g.name}
            </Link>
          ))}
          <Link href="/login" className="border-l border-line pl-2 hover:text-paper transition-colors sm:pl-5">
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded-sm bg-signal px-2 py-2 font-medium text-white transition-colors hover:bg-signal2 sm:px-3"
          >
            Registrarse
          </Link>
        </nav>
      </div>
    </header>
  );
}
