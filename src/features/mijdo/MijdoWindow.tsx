import { profile } from '../../data/profile'
import { useDraggableWindow } from '../../hooks/useDraggableWindow'

function ProfileList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="mijdo-empty-value">No records available.</p>
  }

  return (
    <ul className="mijdo-profile-list">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  )
}

export function MijdoWindow({ onClose }: { onClose: () => void }) {
  const { position, isDragging, startDragging } = useDraggableWindow({ x: 96, y: 78 })

  return (
    <section
      className={`mijdo-window mijdo-profile-window${isDragging ? ' is-dragging' : ''}`}
      style={{ left: position.x, top: position.y }}
      aria-label="Mijdo.exe portfolio window"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <header className="mijdo-titlebar" onPointerDown={startDragging}>
        <span className="mijdo-window-title">Mijdo.exe</span>
        <button
          className="mijdo-window-control"
          type="button"
          aria-label="Close Mijdo.exe"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onClose}
        >
          X
        </button>
      </header>

      <div className="mijdo-profile-content">
        <div className="mijdo-profile-heading">
          <h1>{profile.name}</h1>
          <p>{profile.location}</p>
        </div>

        <section className="mijdo-profile-section">
          <h2>ABOUT</h2>
          <p>{profile.about}</p>
        </section>

        <section className="mijdo-profile-section">
          <h2>EDUCATION</h2>
          <p>{profile.education.degree}</p>
          <p>{profile.education.computerScience}</p>
        </section>

        <section className="mijdo-profile-section">
          <h2>SKILLS</h2>
          <ProfileList items={profile.skills} />
        </section>

        <section className="mijdo-profile-section">
          <h2>EXPERIENCE</h2>
          <ProfileList items={profile.experience} />
        </section>

        <section className="mijdo-profile-section">
          <h2>PROJECTS</h2>
          <ProfileList items={profile.projects} />
        </section>

        <section className="mijdo-profile-section">
          <h2>CONTACT</h2>
          <p>{profile.links.email || 'Contact details not available.'}</p>
        </section>
      </div>
    </section>
  )
}