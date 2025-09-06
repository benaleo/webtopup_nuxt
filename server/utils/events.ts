type Listener = (data: any) => void

class EventBus {
  private listeners: Map<string, Set<Listener>> = new Map()

  on(event: string, fn: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(fn)
    return () => this.off(event, fn)
  }

  off(event: string, fn: Listener) {
    this.listeners.get(event)?.delete(fn)
  }

  emit(event: string, data: any) {
    const ls = this.listeners.get(event)
    if (!ls || ls.size === 0) return
    for (const fn of ls) {
      try { fn(data) } catch {}
    }
  }
}

export const eventBus = new EventBus()
