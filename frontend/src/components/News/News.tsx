import React, { useState } from 'react';
import { Calendar, ChevronRight, Clock } from 'lucide-react';
import { NEWS_DATA, NewsItem } from '../../data/mockData';
import { Modal } from '../Common/Modal';
import styles from './News.module.scss';

export const News: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  return (
    <section id="noticias" className={styles.newsSection}>
      <div className="section-container">
        {/* Cabeçalho da Seção com Botão Ver Todas à Direita */}
        <div className={styles.newsHeaderRow}>
          <div className={styles.headerLeft}>
            <span className={styles.newsTag}>Novidades</span>
            <h2 className={styles.newsTitle}>Notícias e Acontecimentos</h2>
          </div>

          <button
            type="button"
            className={styles.viewAllLink}
            onClick={() => {
              if (NEWS_DATA.length > 0) setSelectedArticle(NEWS_DATA[0]);
            }}
          >
            <span>Ver todas as notícias</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Grade de 3 Colunas dos Cards de Notícias */}
        <div className={styles.newsGrid}>
          {NEWS_DATA.slice(0, 3).map((item) => (
            <article key={item.id} className={styles.newsCard}>
              <div className={styles.cardImageWrapper}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className={styles.cardImg}
                  loading="lazy"
                />
                <span className={styles.categoryBadge}>{item.category}</span>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.metaDate}>
                  <span>{item.date}</span>
                </div>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.excerpt}>{item.excerpt}</p>

                <button
                  type="button"
                  className={styles.readMoreBtn}
                  onClick={() => setSelectedArticle(item)}
                  aria-label={`Ler notícia completa: ${item.title}`}
                >
                  <span>Ler mais</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Modal Leitor de Notícia */}
      <Modal
        isOpen={Boolean(selectedArticle)}
        onClose={() => setSelectedArticle(null)}
        title={selectedArticle?.title || ''}
        tag={selectedArticle?.category}
        size="lg"
      >
        {selectedArticle && (
          <div className={styles.modalArticle}>
            <img
              src={selectedArticle.imageUrl}
              alt={selectedArticle.title}
              className={styles.modalCover}
            />

            <div className={styles.articleMetaRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} color="#174A6E" />
                <span>{selectedArticle.date}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="#174A6E" />
                <span>{selectedArticle.readTime}</span>
              </div>
            </div>

            <div className={styles.articleBody}>
              <p style={{ marginBottom: '16px', fontWeight: 500 }}>{selectedArticle.excerpt}</p>
              <p>{selectedArticle.content}</p>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};
