import React, { useState, useEffect } from 'react';
import { Heart, Menu, X, ChevronRight } from 'lucide-react';
import { AuthPopover } from './AuthPopover';
import styles from './Header.module.scss';

interface HeaderProps {
  onOpenSupportModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSupportModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['inicio', 'historia', 'servicos', 'projetos', 'impacto', 'transparencia', 'noticias', 'contato'];
      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Início', href: '#inicio', id: 'inicio' },
    { label: 'Nossa História', href: '#historia', id: 'historia' },
    { label: 'Serviços', href: '#servicos', id: 'servicos' },
    // { label: 'Projetos', href: '#projetos', id: 'projetos' },
    { label: 'Impacto', href: '#impacto', id: 'impacto' },
    // { label: 'Transparência', href: '#transparencia', id: 'transparencia' },
    { label: 'Notícias', href: '#noticias', id: 'noticias' },
    { label: 'Contato', href: '#contato', id: 'contato' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles['header--scrolled'] : ''}`}>
      <div className={styles.inner}>
        {/* Esquerda: Logo com ícone de coração e texto */}
        <a href="#inicio" className={styles.logo} onClick={(e) => { e.preventDefault(); handleNavClick('#inicio'); }}>
          <div className={styles.logoIconWrapper} aria-hidden="true">
            <Heart className={styles.heartIcon} size={22} fill="#F4C542" />
          </div>
          <div className={styles.logoTextGroup}>
            <span className={styles.associationPrefix}>ASSOCIAÇÃO</span>
            <span className={styles.brandName}>Recanto Betel</span>
          </div>
        </a>

        {/* Centro: Links de Navegação Desktop */}
        <nav className={styles.desktopNav} aria-label="Navegação principal">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`${styles.navLink} ${activeSection === item.id ? styles['navLink--active'] : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.href);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Direita: acesso do responsável, botão de apoio e menu mobile */}
        <div className={styles.headerActions}>
          <AuthPopover />

          <button
            type="button"
            className={styles.supportButton}
            onClick={() => {
              if (onOpenSupportModal) {
                onOpenSupportModal();
              } else {
                handleNavClick('#apoiar');
              }
            }}
            id="nav-apoie-btn"
          >
            <Heart className={styles.heartOutline} size={18} strokeWidth={2.5} />
            <span>Apoie o Recanto</span>
          </button>

          <button
            type="button"
            className={styles.hamburgerBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`${styles.mobileDrawer} ${mobileMenuOpen ? styles['mobileDrawer--open'] : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <ul className={styles.mobileNavList}>
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                className={styles.mobileNavLink}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
              >
                <span>{item.label}</span>
                <ChevronRight size={18} color="#174A6E" />
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={styles.mobileSupportBtn}
          onClick={() => {
            setMobileMenuOpen(false);
            if (onOpenSupportModal) {
              onOpenSupportModal();
            } else {
              handleNavClick('#apoiar');
            }
          }}
        >
          <Heart size={18} strokeWidth={2.5} />
          <span>Apoie o Recanto</span>
        </button>
      </div>
    </header>
  );
};