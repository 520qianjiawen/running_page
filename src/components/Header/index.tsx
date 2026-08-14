import { Link, NavLink } from 'react-router-dom';
import useSiteMetadata from '@/hooks/useSiteMetadata';

const isInternal = (url: string) => url.startsWith('/');

const Header = () => {
  const { logo, siteTitle, navLinks } = useSiteMetadata();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="brand">
          <picture>
            <img alt={siteTitle} src={logo} />
          </picture>
          <span className="brand-copy">
            <span className="brand-kicker">Running Journal</span>
            <span className="brand-title">{siteTitle}</span>
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
      </div>
    </header>
  );
};

export default Header;
