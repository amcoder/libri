import { UploadButton } from './books/upload-button'
import './header.css'

export function Header() {
  return (
    <header id='main-header'>
      <h1>Libri</h1>
      <form>
        <input type='text' placeholder='Search' />
      </form>
      <menu>
        <li>
          <a href='#'>User</a>
        </li>
        <li>
          <a href='#'>Settings</a>
        </li>
        <li>
          <a href='#'>Help</a>
        </li>
        <li>
          <UploadButton />
        </li>
      </menu>
    </header>
  )
}
