import React from 'react';
import { Target, Compass, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { INSTITUTIONAL_INFO } from '../../data/mockData';
import styles from './MissionJourney.module.scss';

export const MissionJourney: React.FC = () => {
  return (
    <section className={styles.missionSection}>
      <div className="section-container">
        {/* Missão, Visão e Valores (3 Cards) */}
        <div className={styles.mvvGrid}>
          {/* Missão */}
          <div className={`${styles.mvvCard} ${styles['mvvCard--mission']}`}>
            <div className={styles.iconHeader}>
              <Target size={26} />
            </div>
            <h3 className={styles.cardTitle}>Nossa Missão</h3>
            <p className={styles.cardText}>{INSTITUTIONAL_INFO.mission}</p>
          </div>

          {/* Visão */}
          <div className={`${styles.mvvCard} ${styles['mvvCard--vision']}`}>
            <div className={styles.iconHeader}>
              <Compass size={26} />
            </div>
            <h3 className={styles.cardTitle}>Nossa Visão</h3>
            <p className={styles.cardText}>{INSTITUTIONAL_INFO.vision}</p>
          </div>

          {/* Valores */}
          <div className={`${styles.mvvCard} ${styles['mvvCard--values']}`}>
            <div className={styles.iconHeader}>
              <ShieldCheck size={26} />
            </div>
            <h3 className={styles.cardTitle}>Nossos Valores</h3>
            <ul className={styles.valuesList}>
              {INSTITUTIONAL_INFO.values.map((val, idx) => (
                <li key={idx}>
                  <Check size={16} className={styles.checkIcon} />
                  <span>{val}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Jornada do Recanto: O que acontece no Recanto? */}
        <div className={styles.journeyBlock}>
          <div className={styles.journeyHeader}>
            <span className={styles.journeyTag}>Metodologia Socioassistencial</span>
            <h2 className={styles.journeyTitle}>O que acontece no Recanto?</h2>
          </div>

          <div className={styles.journeyStepsWrapper}>
            {INSTITUTIONAL_INFO.journeySteps.map((step) => (
              <div key={step.step} className={styles.stepCard}>
                <div className={styles.stepNumber}>
                  <span>{step.step}</span>
                  <Sparkles size={18} color="#F4C542" />
                </div>
                <h4 className={styles.stepTitle}>{step.title}</h4>
                <p className={styles.stepDesc}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
