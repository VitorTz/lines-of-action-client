import { Code2, GitBranch } from 'lucide-react';
import './Footer.css';


const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <p className="brand">&copy; 2025 Lines of Action</p>
      <nav className="links">
        <a
          href="https://github.com/vitortz/draynor-api"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Code2 size={18} />
          <span>API Repository</span>
        </a>
        <a
          href="https://github.com/vitortz"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitBranch size={18} />
          <span>GitHub Profile</span>
        </a>
      </nav>
    </div>
  </footer>
);

export default Footer;
