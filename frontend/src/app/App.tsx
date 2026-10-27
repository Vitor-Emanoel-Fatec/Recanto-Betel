import React, { useState } from 'react';
import { Header } from '../components/Navbar/Header';
import { Hero } from '../components/Hero/Hero';
import { Timeline } from '../components/Timeline/Timeline';
import { MissionJourney } from '../components/MissionJourney/MissionJourney';
import { Services } from '../components/Services/Services';
import { Projects } from '../components/Projects/Projects';
import { Impact } from '../components/Impact/Impact';
import { Highlights } from '../components/Highlights/Highlights';
import { WebRadio } from '../components/WebRadio/WebRadio';
import { Transparency } from '../components/Transparency/Transparency';
import { Partners } from '../components/Partners/Partners';
import { Support } from '../components/Support/Support';
import { News } from '../components/News/News';
import { Contact } from '../components/Contact/Contact';
import { Footer } from '../components/Footer/Footer';
import { DonationModal } from '../components/Support/DonationModal';
import { FloatingActions } from '../components/Common/FloatingActions';
import { Toast } from '../components/Common/Toast';
import toastStyles from '../components/Common/Toast.module.scss';
import { PortalApp } from '../portal/PortalApp';
import styles from './App.module.scss';

export const App: React.FC = () => {
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
  };

  if (window.location.pathname.startsWith('/portal') || window.location.pathname.startsWith('/admin')) {
    return <PortalApp />;
  }

  return (
    <div className={styles.layout}>
      {/* Skip Link para acessibilidade por teclado (WCAG) */}
      <a href="#inicio" className="skip-link">
        Pular para o conteúdo principal
      </a>

      {/* 1. Cabeçalho (Navbar) Fixo no Topo */}
      <Header onOpenSupportModal={() => setDonationModalOpen(true)} />

      {/* Conteúdo Principal */}
      <main id="main-content">
        {/* 2. Hero Section (Início) */}
        <Hero onOpenSupportModal={() => setDonationModalOpen(true)} />

        {/* 3. Nossa Trajetória (Linha do Tempo dos 50 Anos) */}
        <Timeline />

        {/* Missão, Visão, Valores & A Jornada do Recanto */}
        <MissionJourney />

        {/* 4. Nossos Serviços */}
        <Services />

        {/* 5. Nossos Projetos */}
        <Projects />

        {/* 6. Nosso Impacto */}
        <Impact />

        {/* Destaque 2026: Rosa de Saron — Alunos Destaque 2026 */}
        <Highlights />

        {/* Web Rádio Recanto Betel */}
        <WebRadio />

        {/* 7. Transparência & Prestação de Contas */}
        <Transparency onShowToast={showToast} />

        {/* Parcerias Institucionais */}
        <Partners />

        {/* Como Apoiar & Como o Apoio se Transforma */}
        <Support onShowToast={showToast} />

        {/* 8. Notícias */}
        <News />

        {/* 9. Contato (Fale Conosco) */}
        <Contact onShowToast={showToast} />
      </main>

      {/* 10. Rodapé (Footer) */}
      <Footer onOpenSupportModal={() => setDonationModalOpen(true)} />

      {/* Modal Rápido de Doação Pix e Conta Bancária */}
      <DonationModal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Ações Flutuantes (WhatsApp e Voltar ao Topo) */}
      <FloatingActions />

      {/* Sistema Global de Notificações Toast */}
      {toast && (
        <div className={toastStyles.toastContainer}>
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
};

export default App;