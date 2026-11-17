import React, { useState } from 'react';
import { Users, ChevronRight, MapPin, CheckCircle } from 'lucide-react';
import { PROJECTS_DATA, ProjectItem } from '../../data/mockData';
import { Modal } from '../Common/Modal';
import styles from './Projects.module.scss';

export const Projects: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const categories = ['Todos', 'Assistência Social', 'Esporte e Lazer', 'Educação', 'Cultura'];

  const filteredProjects =
    activeCategory === 'Todos'
      ? PROJECTS_DATA
      : PROJECTS_DATA.filter((p) => p.category === activeCategory);

  return (
    <section id="projetos" className={styles.projectsSection}>
      <div className="section-container">
        {/* Cabeçalho da Seção */}
        <div className="section-header">
          <span className="section-tag section-tag-gold">Em Ação</span>
          <h2 className="section-title">Nossos projetos</h2>
          <p className="section-subtitle">
            Iniciativas concretas que abrem oportunidades reais, transformam realidades e valorizam
            as potencialidades das crianças e adolescentes de Tatuí.
          </p>
        </div>

        {/* Filtros de Categoria */}
        <div className={styles.categoryFilters} role="tablist" aria-label="Categorias de projetos">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat}
              className={`${styles.filterBtn} ${
                activeCategory === cat ? styles['filterBtn--active'] : ''
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de 3 Colunas dos Projetos */}
        <div className={styles.projectsGrid}>
          {filteredProjects.map((project) => (
            <div key={project.id} className={styles.projectCard}>
              {/* Imagem com Tag Flutuante */}
              <div className={styles.imageWrapper}>
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className={styles.cardImage}
                  loading="lazy"
                />
                <span className={styles.categoryTag}>{project.category}</span>
              </div>

              {/* Corpo do Card */}
              <div className={styles.cardBody}>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <p className={styles.projectDesc}>{project.description}</p>
              </div>

              {/* Rodapé do Card com Beneficiados e Link Conhecer */}
              <div className={styles.cardFooter}>
                <div className={styles.beneficiariesBadge}>
                  <Users size={15} className={styles.icon} />
                  <span>{project.beneficiaries}</span>
                </div>
                <button
                  type="button"
                  className={styles.actionLink}
                  onClick={() => setSelectedProject(project)}
                  aria-label={`Conhecer mais sobre o ${project.title}`}
                >
                  <span>Conhecer</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Detalhe do Projeto */}
      <Modal
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.title || ''}
        tag={selectedProject?.category}
        size="lg"
        footer={
          <button
            type="button"
            style={{
              backgroundColor: '#093273',
              color: '#FFFFFF',
              fontWeight: 600,
              padding: '12px 24px',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setSelectedProject(null)}
          >
            Fechar detalhes
          </button>
        }
      >
        {selectedProject && (
          <div className={styles.modalProjectDetails}>
            <img
              src={selectedProject.imageUrl}
              alt={selectedProject.title}
              className={styles.modalImage}
            />

            <div className={styles.locationRow}>
              <MapPin size={16} color="#F4C542" />
              <span>{selectedProject.location}</span>
              <span>•</span>
              <strong>{selectedProject.beneficiaries}</strong>
            </div>

            <p className={styles.fullStory}>{selectedProject.fullStory}</p>

            <div className={styles.goalsBox}>
              <h4>Objetivos do Projeto:</h4>
              <ul>
                {selectedProject.goals.map((g, idx) => (
                  <li key={idx}>
                    <CheckCircle size={16} className={styles.checkIcon} />
                    <span>{g}</span>
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
