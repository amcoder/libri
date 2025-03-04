import { Link } from '@tanstack/react-router'

export function Navigation() {
  return (
    <nav>
      <menu>
        <li className='book-list'>
          <Link to='/books'>Books</Link>
        </li>
        <li className='series-list'>
          <Link to='/series'>Series</Link>
        </li>
        <li className='author-list'>
          <Link to='/authors'>Authors</Link>
        </li>
        <li className='tag-list'>
          <Link to='/tags'>Tags</Link>
        </li>
        <li className='upload'>
          <Link to='/upload'>Upload</Link>
        </li>
        <li className='style-guide'>
          <Link to='/style-guide'>Style Guide</Link>
        </li>
      </menu>
    </nav>
  )
}
