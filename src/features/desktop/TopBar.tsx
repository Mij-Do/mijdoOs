const menuItems = ['SYSTEM', 'File', 'View', 'Special', 'Run', 'Help']

export function TopBar() {
  return (
    <header className="mijdo-command-bar mijdo-top-bar" aria-label="System command bar">
      {menuItems.map((item) => (
        <span className="mijdo-command-item" key={item}>
          {item}
        </span>
      ))}
    </header>
  )
}