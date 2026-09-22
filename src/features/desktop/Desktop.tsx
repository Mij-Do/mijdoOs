import { MijdoWindow } from '../mijdo/MijdoWindow'

type DesktopProps = {
  isMijdoOpen: boolean
  onOpenMijdo: () => void
  onCloseMijdo: () => void
}

export function Desktop({ isMijdoOpen, onOpenMijdo, onCloseMijdo }: DesktopProps) {
  return (
    <main className="mijdo-desktop" onPointerDown={onOpenMijdo}>
      <button
        className="mijdo-desktop-icon"
        type="button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={onOpenMijdo}
      >
        <span className="mijdo-desktop-icon-art" aria-hidden="true">
          EXE
        </span>
        <span>Mijdo.exe</span>
      </button>

      {isMijdoOpen && <MijdoWindow onClose={onCloseMijdo} />}
    </main>
  )
}