import React from 'react';
import { Calendar, Award, Mail, HeartHandshake, Sparkles } from 'lucide-react';
import styles from './Highlights.module.scss';

export const Highlights: React.FC = () => {
  const highlightsCards = [
    {
      icon: <Award size={24} />,
      title: 'Certificados de Mérito',
      desc: 'Reconhecimento solene de cada conquista e evolução escolar alcançada.',
    },
    {
      icon: <Mail size={24} />,
      title: 'Cartinhas & Depoimentos',
      desc: 'Mensagens de afeto e gratidão redigidas pelos próprios educandos.',
    },
    {
      icon: <HeartHandshake size={24} />,
      title: 'Equipe Dedicada',
      desc: 'Corpo pedagógico e assistentes sociais engajados no desenvolvimento integral.',
    },
    {
      icon: <Sparkles size={24} />,
      title: 'Confraternização Comunitária',
      desc: 'Encontro festivo unindo famílias, lideranças de Tatuí e parceiros da causa.',
    },
  ];

  return (
    <section className={styles.highlightsSection}>
      <div className="section-container">
        {/* Banner Especial de Destaque */}
        <div className={styles.bannerCard}>
          <div className={styles.bannerTop}>
            <div className={styles.dateTag}>
              <Calendar size={15} />
              <span>07 / 07 / 2026</span>
            </div>
            <span className={styles.editionBadge}>Edição Jubileu de Ouro</span>
          </div>

          <h3 className={styles.bannerTitle}>
            Rosa de Saron — <span>Alunos Destaque 2026</span>
          </h3>

          <p className={styles.bannerLead}>
            Celebramos conquistas, valorizamos trajetórias e reconhecemos a evolução de cada criança
            e adolescente atendido pelo Recanto Betel em Tatuí.
          </p>
        </div>

        {/* 4 Cards com os Elementos do Evento */}
        <div className={styles.highlightsGrid}>
          {highlightsCards.map((card, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featureIcon}>{card.icon}</div>
              <h4 className={styles.featureTitle}>{card.title}</h4>
              <p className={styles.featureDesc}>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
