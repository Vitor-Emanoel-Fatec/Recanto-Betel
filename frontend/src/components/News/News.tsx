import React, { useState } from 'react';
import { Calendar, ChevronRight, Clock } from 'lucide-react';
import { CONTACT_INFO, NEWS_DATA, NewsItem } from '../../data/mockData';
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

        {/* <section className={styles.facebookFeed} aria-labelledby="facebook-feed-title">
          <div className={styles.facebookFeedIntro}>
            <span className={styles.newsTag}>Rede social oficial</span>
            <h2 id="facebook-feed-title">Acompanhe o Recanto Betel no Facebook</h2>
            <p>Veja as publicações da página oficial e acesse cada conteúdo diretamente no Facebook.</p>
            <a className={styles.facebookExternalLink} href={CONTACT_INFO.social.facebook} target="_blank" rel="noopener noreferrer">
              Abrir página oficial
            </a>
            <p className={styles.facebookFallback}>Se as publicações não aparecerem, consulte a página oficial.</p>
          </div>
          <FacebookPageFeed pageUrl={CONTACT_INFO.social.facebook} />
        </section> */}
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
                <Calendar size={16} color="#093273" />
                <span>{selectedArticle.date}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="#093273" />
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

// function FacebookPageFeed({ pageUrl }: { pageUrl: string }) {
//   const [isAllowed, setIsAllowed] = useState(false);
//   const embedUrl = new URL('https://www.facebook.com/plugins/page.php');
//   embedUrl.searchParams.set('href', pageUrl);
//   embedUrl.searchParams.set('tabs', 'timeline');
//   embedUrl.searchParams.set('width', '500');
//   embedUrl.searchParams.set('height', '500');
//   embedUrl.searchParams.set('small_header', 'true');
//   embedUrl.searchParams.set('adapt_container_width', 'true');
//   embedUrl.searchParams.set('hide_cover', 'true');
//   embedUrl.searchParams.set('show_facepile', 'false');
//   embedUrl.searchParams.set('locale', 'pt_BR');

//   return (
//     <div className={styles.facebookFeedContent}>
//       {!isAllowed ? (
//         <div className={styles.facebookConsent}>
//           <p>O conteúdo será carregado do Facebook somente após sua autorização. A Meta poderá receber informações do seu navegador.</p>
//           <button type="button" className={styles.facebookLoadButton} onClick={() => setIsAllowed(true)}>
//             Carregar publicações
//           </button>
//         </div>
//       ) : (
//         <iframe
//           className={styles.facebookIframe}
//           src={embedUrl.toString()}
//           title="Publicações da página oficial do Recanto Betel no Facebook"
//           loading="lazy"
//           scrolling="no"
//           allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
//           referrerPolicy="strict-origin-when-cross-origin"
//         />
//       )}
//     </div>
//   );
// }
