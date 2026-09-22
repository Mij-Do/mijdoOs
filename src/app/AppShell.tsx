import { useState } from 'react'
import { Desktop } from '../features/desktop/Desktop'
import { StatusBar } from '../features/desktop/StatusBar'
import { TopBar } from '../features/desktop/TopBar'

export function AppShell() {
  const [isMijdoOpen, setIsMijdoOpen] = useState(true)

  return (
    <div className="mijdo-app-shell">
      <TopBar />
      <Desktop
        isMijdoOpen={isMijdoOpen}
        onOpenMijdo={() => setIsMijdoOpen(true)}
        onCloseMijdo={() => setIsMijdoOpen(false)}
      />
      <StatusBar isMijdoOpen={isMijdoOpen} />
    </div>
  )
}