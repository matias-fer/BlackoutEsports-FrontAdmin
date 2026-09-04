export default function LoginPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">Blackout Esports</p>
      <h1 className="mt-4 text-3xl font-medium text-paper">Iniciar sesión</h1>
      <form className="mt-8 space-y-4">
        <label className="block text-sm text-mute">
          Email
          <input type="email" required className="mt-2 w-full rounded-sm border border-line bg-panel px-4 py-3 text-paper" />
        </label>
        <label className="block text-sm text-mute">
          Contraseña
          <input type="password" required className="mt-2 w-full rounded-sm border border-line bg-panel px-4 py-3 text-paper" />
        </label>
        <button type="submit" className="w-full rounded-sm bg-signal px-4 py-3 font-medium text-white hover:bg-signal2">
          Entrar
        </button>
      </form>
    </main>
  );
}