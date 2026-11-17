import React, { useState } from 'react';
import {
  BookOpen,
  Palette,
  Trophy,
  HeartPulse,
  Users,
  Building2,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { SERVICES_DATA, ServiceItem } from '../../data/mockData';
import { Modal } from '../Common/Modal';
import styles from './Services.module.scss';

export const Services: React.FC = () => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Dynamic Icon Mapping
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen size={28} />;
      case 'Palette':
        return <Palette size={28} />;
      case 'Trophy':
        return <Trophy size={28} />;
      case 'HeartPulse':
        return <HeartPulse size={28} />;
      case 'Users':
        return <Users size={28} />;
      case 'Building2':
        return <Building2 size={28} />;
      default:
        return <HelpCircle size={28} />;
    }
  };

  return (
    <section id="servicos" className={styles.servicesSection}>
      <div className="section-container">
        {/* Cabeçalho da Seção */}
        <div className="section-header">
          <span className="section-tag">O Que Oferecemos</span>
          <h2 className="section-title">Nossos serviços</h2>
          <p className="section-subtitle">
            Ações socioassistenciais integradas para o desenvolvimento cognitivo, emocional, físico e
            cidadão de crianças e adolescentes.
          </p>
        </div>

        {/* Grade de 3 Colunas */}
        <div className={styles.servicesGrid}>
          {SERVICES_DATA.map((service) => (
            <div key={service.id} className={styles.serviceCard}>
              <div className={styles.cardTop}>
                <div className={styles.iconBadge} aria-hidden="true">
                  {renderIcon(service.iconName)}
                </div>
                <h3 className={styles.title}>{service.title}</h3>
                <p className={styles.desc}>{service.shortDesc}</p>
              </div>

              <div className={styles.cardBottom}>
                <button
                  type="button"
                  className={styles.learnMoreBtn}
                  onClick={() => setSelectedService(service)}
                  aria-label={`Saiba mais sobre ${service.title}`}
                >
                  <span>Saiba mais</span>
                  <ChevronRight size={16} className={styles.arrowIcon} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Interativo com Detalhes do Serviço */}
      <Modal
        isOpen={Boolean(selectedService)}
        onClose={() => setSelectedService(null)}
        title={selectedService?.title || ''}
        tag="Serviço Socioassistencial"
        size="lg"
        footer={
          <button
            type="button"
            className="btn-primary"
            style={{
              backgroundColor: '#F4C542',
              color: '#061E46',
              fontWeight: 700,
              padding: '12px 24px',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => {
              setSelectedService(null);
              const contactEl = document.getElementById('contato');
              if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Tirar dúvidas sobre vagas
          </button>
        }
      >
        {selectedService && (
          <div className={styles.modalServiceDetails}>
            <p className={styles.modalLead}>{selectedService.fullDesc}</p>

            <div className={styles.metaBox}>
              <div className={styles.metaRow}>
                <strong>Público Atendido:</strong>
                <span>{selectedService.targetAudience}</span>
              </div>
              <div className={styles.metaRow}>
                <strong>Horários & Dias:</strong>
                <span>{selectedService.schedule}</span>
              </div>
            </div>

            <div>
              <h4
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#093273',
                  marginBottom: '10px',
                }}
              >
                Principais Atividades:
              </h4>
              <ul className={styles.highlightsList}>
                {selectedService.highlights.map((h, i) => (
                  <li key={i}>
                    <CheckCircle2 size={18} className={styles.bulletCheck} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};
