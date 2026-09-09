"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="text-2xl text-paper">No pudimos cargar los jugadores</h1>
      <p className="mt-3 text-mute">El servicio no está disponible en este momento. Inténtalo de nuevo.</p>
      <button onClick={reset} className="mt-6 rounded-sm border border-line px-4 py-2 text-signal">Reintentar</button>
    </main>
  );
}
