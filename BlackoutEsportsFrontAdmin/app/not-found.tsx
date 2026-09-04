import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col items-start px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">404</p>
      <h1 className="mt-4 text-3xl font-medium text-paper">
        No encontramos esa configuración.
      </h1>
      <p className="mt-2 text-sm text-mute">
        Revisa la URL o vuelve al listado de juegos.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-sm border border-line px-4 py-2 text-sm text-paper hover:border-signal hover:text-signal"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
