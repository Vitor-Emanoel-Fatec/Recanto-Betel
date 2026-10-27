import React from 'react';
import { TIMELINE_DATA } from '../../data/mockData';
import styles from './Timeline.module.scss';

export const Timeline: React.FC = () => {
  return (
    <section id="historia" className={styles.timelineSection}>
      <div className="section-container">
        {/* Cabeçalho da Seção */}
        <div className="section-header">
          <span className="section-tag">Nossa Trajetória</span>
          <h2 className="section-title">50 anos de história</h2>
          <p className="section-subtitle">
            Uma linha do tempo construída com dedicação, acolhimento e compromisso com o futuro de
            crianças e adolescentes em Tatuí.
          </p>
        </div>

        {/* Linha do Tempo Alternada */}
        <div className={styles.timelineWrapper}>
          {TIMELINE_DATA.map((item, index) => {
            const isEven = index % 2 === 0;
            const sideClass = isEven ? styles['timelineItem--left'] : styles['timelineItem--right'];
            const highlightClass = item.highlight ? styles['timelineItem--highlight'] : '';

            return (
              <div
                key={item.year}
                className={`${styles.timelineItem} ${sideClass} ${highlightClass}`}
              >
                {/* Ponto / Nó na Linha */}
                <div className={styles.timelineNode} aria-hidden="true" />

                {/* Card de Conteúdo */}
                <div
                  className={`${styles.timelineCard} ${
                    item.highlight ? styles['timelineCard--highlight'] : ''
                  }`}
                >
                  <div className={styles.badgeGroup}>
                    <span className={styles.yearBadge}>{item.year}</span>
                    {item.badge && <span className={styles.categoryTag}>{item.badge}</span>}
                  </div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardDesc}>{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
