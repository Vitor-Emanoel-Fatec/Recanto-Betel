import React from 'react';
import { ArrowRight } from 'lucide-react';
import { IMPACT_STATS } from '../../data/mockData';
import styles from './Impact.module.scss';

export const Impact: React.FC = () => {
  const handleScrollToProjects = () => {
    const el = document.getElementById('servicos');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="impacto" className={styles.impactSection}>
      <div className="section-container">
        {/* Cabeçalho da Seção */}
        <div className="section-header">
          <span className="section-tag">Nosso Impacto</span>
          <h2 className="section-title">50 anos deixando marcas positivas</h2>
          <p className="section-subtitle">
            Cada indicador representa trajetórias reais acolhidas, famílias fortalecidas e futuros
            transformados em Tatuí.
          </p>
        </div>

        {/* Estatísticas: 4 Colunas com Números Enormes Azuis */}
        <div className={styles.statsGrid}>
          {IMPACT_STATS.map((stat) => (
            <div key={stat.id} className={styles.statCard}>
              <div className={styles.statNumber}>{stat.formatted}</div>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statSublabel}>{stat.sublabel}</div>
            </div>
          ))}
        </div>

        {/* Citação com Barra Lateral Amarela */}
        <div className={styles.quoteBlock}>
          <blockquote className={styles.quoteText}>
            “Números contam parte da história. As pessoas contam o restante.”
          </blockquote>
          <button
            type="button"
            className={styles.quoteLink}
            onClick={handleScrollToProjects}
            aria-label="Conheça nosso trabalho e serviços"
          >
            <span>Conheça nosso trabalho</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};
