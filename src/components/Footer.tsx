import { GitBranch } from 'lucide-react';
import './Footer.css';


const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <p className="brand">Lines of Action</p>
      <nav className="links">
        <a
          href="https://github.com/VitorTz/lines-of-action-client"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitBranch size={18} />
          <span>GitHub</span>
        </a>
      </nav>
    </div>
  </footer>
);

export default Footer;
