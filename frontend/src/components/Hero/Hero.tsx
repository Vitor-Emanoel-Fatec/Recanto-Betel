import React from 'react';
import { MapPin, Heart, ArrowRight, Award } from 'lucide-react';
import styles from './Hero.module.scss';

interface HeroProps {
  onOpenSupportModal?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenSupportModal }) => {
  const handleScrollTo = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="inicio" className={styles.hero}>
      {/* Background com Imagem e Overlay Escurecido Azul Profundo */}
      <div className={styles.bgWrapper} aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1920&q=80"
          alt="Crianças sorrindo e convivendo em comunidade"
          className={styles.bgImage}
          loading="eager"
        />
        <div className={styles.bgOverlay} />
        <div className={styles.patternOverlay} />
      </div>

      {/* Conteúdo Centralizado */}
      <div className={styles.contentWrapper}>
        {/* Tag no topo */}
        <div className={styles.locationTag}>
          <MapPin size={16} className={styles.pinIcon} />
          <span>Organização da Sociedade Civil · Tatuí/SP</span>
        </div>

        {/* Título H1 Grande com Destaques em Amarelo */}
        <h1 className={styles.title}>
          50 anos cuidando de{' '}
          <span className={styles.highlight}>histórias</span> que ainda estão{' '}
          <span className={styles.highlight}>começando</span>.
        </h1>

        {/* Subtítulo */}
        <p className={styles.subtitle}>
          Desde 1976, o Recanto Betel promove proteção social, convivência, desenvolvimento e cidadania
          para crianças e adolescentes em Tatuí.
        </p>

        {/* Botões de Ação */}
        <div className={styles.ctaGroup}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => handleScrollTo('historia')}
            id="hero-conheca-historia-btn"
          >
            <span>Conheça nossa história</span>
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => {
              if (onOpenSupportModal) {
                onOpenSupportModal();
              } else {
                handleScrollTo('apoiar');
              }
            }}
            id="hero-quero-apoiar-btn"
          >
            <Heart size={20} fill="#0D2B40" color="#0D2B40" />
            <span>Quero apoiar</span>
          </button>
        </div>

        {/* Rodapé do Hero: Card Flutuante Centralizado */}
        <div className={styles.floatingBadge}>
          <div className={styles.badgeHighlight}>
            <Award size={20} color="#F4C542" />
            <span>50 ANOS</span>
          </div>
          <div className={styles.badgeText}>
            <strong>1976 → 2026</strong> Atuação socioassistencial ininterrupta
          </div>
        </div>
      </div>
    </section>
  );
};
