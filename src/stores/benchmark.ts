import { atom, map } from 'nanostores'

export let benchmarking = atom(false)

if (location.search === '?bench') {
  benchmarking.set(true)
}
benchmarking.listen(value => {
  history.pushState(null, '', location.pathname + (value ? '?bench' : ''))
})

function keyUp(e: KeyboardEvent): void {
  if (e.key === 'b' && e.target === document.body) {
    benchmarking.set(!benchmarking.get())
  }
}
document.body.addEventListener('keyup', keyUp)

export let lastBenchmark = map({ freeze: 0, paint: 0 })

let bound = false
export function bindFreezeToPaint(): void {
  bound = true
}

let initializing = true
let initFreeze = 0
let initPaint = 0
export function reportFreeze(ms: number): void {
  if (benchmarking.get()) {
    if (initializing) {
      initFreeze += ms
    } else if (bound) {
      lastBenchmark.set({ freeze: ms, paint: ms })
    } else {
      lastBenchmark.setKey('freeze', ms)
    }
  }
}

export function reportPaint(ms: number): void {
  if (benchmarking.get()) {
    if (initializing) {
      initPaint += ms
    } else {
      lastBenchmark.setKey('paint', ms)
    }
  }
}

setTimeout(() => {
  initializing = false
  if (initPaint + initFreeze > 0) {
    if (bound) {
      lastBenchmark.set({ freeze: initFreeze, paint: initFreeze })
    } else {
      lastBenchmark.set({ freeze: initFreeze, paint: initPaint })
    }
  }
}, 1)
