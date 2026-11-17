import React from 'react';
import styles from './Footer.module.scss';
import logoRecanto from '../../assets/Logo-Reverse.svg';

interface FooterProps {
  onOpenSupportModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSupportModal }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className={styles.footer}>
      <div className="section-container">
        {/* Layout Principal: 3 Colunas */}
        <div className={styles.mainGrid}>
          {/* Coluna 1 (Esquerda): Logo institucional + descrição + badge */}
          <div className={styles.brandCol}>
            <a href="#inicio" className={styles.footerLogo} onClick={(e) => { e.preventDefault(); scrollTo('inicio'); }}>
              <img className={styles.footerLogoImage} src={logoRecanto} alt="" aria-hidden="true" />
              <div className={styles.logoTextGroup}>
                <span className={styles.associationPrefix}>ASSOCIAÇÃO</span>
                <span className={styles.brandName}>Recanto Betel</span>
              </div>
            </a>

            <p className={styles.brandDesc}>
              Desde 1976, promovendo proteção social, convivência, desenvolvimento e cidadania para
              crianças e adolescentes em Tatuí/SP.
            </p>

            <div className={styles.jubileeBadge}>
              <span className={styles.badgeNumber}>50</span>
              <span className={styles.badgeText}>Anos · 1976–2026</span>
            </div>
          </div>

          {/* Coluna 2 (Centro - NAVEGAÇÃO) */}
          <div className={styles.navCol}>
            <h4 className={styles.colTitle}>Navegação</h4>
            <ul className={styles.linkList}>
              <li>
                <button type="button" onClick={() => scrollTo('historia')}>
                  Nossa História
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('servicos')}>
                  Serviços
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('projetos')}>
                  Projetos
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('impacto')}>
                  Impacto
                </button>
              </li>
              {/* <li>
                <button type="button" onClick={() => scrollTo('transparencia')}>
                  Transparência
                </button>
              </li> */}
              <li>
                <button type="button" onClick={() => scrollTo('noticias')}>
                  Notícias
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 3 (Direita - CONTRIBUA) */}
          <div className={styles.navCol}>
            <h4 className={styles.colTitle}>Contribua</h4>
            <ul className={styles.linkList}>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenSupportModal) onOpenSupportModal();
                    else scrollTo('apoiar');
                  }}
                >
                  Doação via Pix
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('apoiar')}>
                  Nota Fiscal Paulista
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('apoiar')}>
                  Voluntariado
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('apoiar')}>
                  Torne-se Associado
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Base do Rodapé */}
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            © 2026 Associação Recanto Betel — Todos os direitos reservados
          </div>
          <div className={styles.cnpjTag}>
            CNPJ 47.818.778/0001-76 · OSC sem fins lucrativos
          </div>
        </div>
      </div>
    </footer>
  );
};
