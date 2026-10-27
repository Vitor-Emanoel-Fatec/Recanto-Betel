import React from 'react';
import { PARTNERS_DATA } from '../../data/mockData';
import styles from './Partners.module.scss';

export const Partners: React.FC = () => {
  return (
    <section className={styles.partnersSection}>
      <div className="section-container">
        <div className="section-header">
          <span className="section-tag section-tag-navy">Rede de Apoio</span>
          <h2 className="section-title">Quem caminha com o Recanto</h2>
          <p className="section-subtitle">
            A união entre poder público, conselhos municipais, empresas e sociedade civil viabiliza
            a continuidade de meio século de transformação social em Tatuí.
          </p>
        </div>

        <div className={styles.partnersGrid}>
          {PARTNERS_DATA.map((partner, index) => (
            <div key={index} className={styles.partnerCard}>
              <span className={styles.partnerType}>{partner.type}</span>
              <h3 className={styles.partnerName}>{partner.name}</h3>
              <p className={styles.partnerDesc}>{partner.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
