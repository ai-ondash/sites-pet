import { useEffect, useRef } from 'react'

const MAP = {
  KeyW: 'forward', ArrowUp: 'forward',
  KeyS: 'backward', ArrowDown: 'backward',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  ShiftLeft: 'run', ShiftRight: 'run',
}

/**
 * 키보드 입력 상태를 ref 객체로 반환 (리렌더 없이 useFrame에서 읽음)
 */
export function useKeyboard() {
  const keys = useRef({
    forward: false, backward: false, left: false, right: false, run: false,
  })

  useEffect(() => {
    const down = (e) => {
      const action = MAP[e.code]
      if (action) keys.current[action] = true
    }
    const up = (e) => {
      const action = MAP[e.code]
      if (action) keys.current[action] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  return keys.current
}
