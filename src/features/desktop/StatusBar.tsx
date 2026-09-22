import { useEffect, useState } from 'react'

function getCurrentTime() {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

export function StatusBar({ isMijdoOpen }: { isMijdoOpen: boolean }) {
  const [time, setTime] = useState(getCurrentTime)

  useEffect(() => {
    const clock = window.setInterval(() => setTime(getCurrentTime()), 1000)

    return () => window.clearInterval(clock)
  }, [])

  return (
    <footer className="mijdo-status-bar">
      {isMijdoOpen && <span className="mijdo-status-item">[Mijdo.exe]</span>}
      <time dateTime={new Date().toISOString()}>{time}</time>
    </footer>
  )
}