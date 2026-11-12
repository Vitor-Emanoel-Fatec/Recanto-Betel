import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { WhatsAppIcon } from './SocialIcons';
import styles from './FloatingActions.module.scss';

export const FloatingActions: React.FC = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside className={styles.floatingWrapper} aria-label="Ações rápidas">
      {/* Botão de WhatsApp
      <a
        href="https://wa.me/5515998765432?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20a%20Associação%20Recanto%20Betel"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappFloating}
        aria-label="Falar conosco via WhatsApp"
        title="Falar no WhatsApp"
      >
        <WhatsAppIcon size={26} color="#FFFFFF" />
      </a> */}

      {/* Botão de Voltar ao Topo */}
      <button
        type="button"
        className={`${styles.backToTopBtn} ${showBackToTop ? styles['backToTopBtn--visible'] : ''}`}
        onClick={scrollToTop}
        aria-label="Voltar ao topo da página"
        title="Voltar ao topo"
      >
        <ChevronUp size={22} />
      </button>
    </aside>
  );
};
