import { Link } from '@tanstack/react-router'

export function Navigation() {
  return (
    <nav>
      <menu>
        <li>
          <Link to='/books'>Books</Link>
        </li>
        <li>
          <Link to='/books/$id' params={{ id: '1' }}>
            Book 1
          </Link>
        </li>
        <li>
          <Link to='/books/$id' params={{ id: '2' }}>
            Book 2
          </Link>
        </li>
        <li>
          <a href='#'>Contact</a>
        </li>
        <li>
          <a href='#'>About</a>
        </li>
      </menu>
    </nav>
  )
}
