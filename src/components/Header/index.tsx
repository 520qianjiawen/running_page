import { Link, NavLink } from 'react-router-dom';
import useSiteMetadata from '@/hooks/useSiteMetadata';

const isInternal = (url: string) => url.startsWith('/');

const Header = () => {
  const { siteTitle, navLinks } = useSiteMetadata();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" role="presentation">
              <path d="M7 22.5c4.5-1.2 5.4-8.6 10.2-9.7 3.1-.7 4.5 2.5 7.8 1.1" />
              <circle cx="7" cy="22.5" r="2.1" />
              <circle cx="25" cy="13.9" r="2.1" />
            </svg>
          </span>
          <span className="brand-copy">
            <span className="brand-title">{siteTitle}</span>
            <span className="brand-kicker">RUNNING ARCHIVE</span>
          </span>
        </Link>
        <nav className="nav-links">
          {navLinks.map((n) =>
            isInternal(n.url) ? (
              <NavLink
                key={n.url}
                to={n.url}
                end={n.url === '/' || n.url === ''}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                {n.name}
              </NavLink>
            ) : (
              <a key={n.url + n.name} href={n.url}>
                {n.name}
              </a>
            )
          )}
        </nav>
        <div className="archive-status">
          <span aria-hidden="true" />
          轨迹已同步
        </div>
      </div>
    </header>
  );
};

export default Header;
