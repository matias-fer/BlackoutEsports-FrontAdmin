import { Component } from 'react'

class AppErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-error" role="alert">
          <p className="page-eyebrow">Blackout Esports</p>
          <h1>No pudimos cargar esta vista</h1>
          <button type="button" onClick={() => window.location.reload()}>Recargar</button>
        </main>
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary
