import React, { useState } from 'react';
import {
  QrCode,
  Copy,
  Receipt,
  HeartHandshake,
  UserPlus,
  ArrowRight,
  Sparkles,
  Check,
  Send,
} from 'lucide-react';
import { CONTACT_INFO } from '../../data/mockData';
import { Modal } from '../Common/Modal';
import styles from './Support.module.scss';

interface SupportProps {
  onShowToast: (message: string, type?: 'success' | 'info') => void;
}

export const Support: React.FC<SupportProps> = ({ onShowToast }) => {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [nfpModalOpen, setNfpModalOpen] = useState(false);
  const [volunteerModalOpen, setVolunteerModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);

  // Volunteer form state
  const [volName, setVolName] = useState('');
  const [volEmail, setVolEmail] = useState('');
  const [volPhone, setVolPhone] = useState('');
  const [volArea, setVolArea] = useState('Pedagógico / Reforço');

  const copyPixKey = () => {
    navigator.clipboard.writeText(CONTACT_INFO.pixKey);
    onShowToast('✓ Chave Pix copiada com sucesso!', 'success');
  };

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('✓ Cadastro de voluntário enviado! Entraremos em contato.', 'success');
    setVolunteerModalOpen(false);
    setVolName('');
    setVolEmail('');
    setVolPhone('');
  };

  const transformationSteps = [
    { label: 'Você contribui', icon: <HeartHandshake size={18} /> },
    { label: 'Recursos sustentam as ações', icon: <Receipt size={18} /> },
    { label: 'Equipe executa os projetos', icon: <Sparkles size={18} /> },
    { label: 'Crianças participam ativamente', icon: <UserPlus size={18} /> },
    { label: 'Vínculos familiares fortalecidos', icon: <Check size={18} /> },
    { label: 'A comunidade se transforma', icon: <Sparkles size={18} /> },
  ];

  return (
    <section id="apoiar" className={styles.supportSection}>
      <div className="section-container">
        {/* Cabeçalho da Seção */}
        <div className="section-header">
          <span className="section-tag section-tag-gold">Como Apoiar</span>
          <h2 className="section-title">Você também pode fazer parte dessa história</h2>
          <p className="section-subtitle">
            Toda contribuição ajuda a manter ações de proteção, educação, alimentação balanceada,
            esporte, cultura e convivência para centenas de crianças e jovens em Tatuí.
          </p>
        </div>

        {/* 4 Cards de Apoio */}
        <div className={styles.supportGrid}>
          {/* 1. Pix */}
          <div className={styles.supportCard}>
            <div className={`${styles.cardIconCircle} ${styles['cardIconCircle--gold']}`}>
              <QrCode size={28} />
            </div>
            <h3 className={styles.cardTitle}>Doação via Pix</h3>
            <p className={styles.cardDesc}>
              Doação direta, rápida e sem taxas para a manutenção diária das oficinas e refeições.
            </p>
            <div className={styles.pixKeyBox} title="Chave Pix CNPJ">
              CNPJ: {CONTACT_INFO.pixKey}
            </div>
            <div className={styles.cardBtnGroup}>
              <button
                type="button"
                className={`${styles.btnAction} ${styles['btnAction--primary']}`}
                onClick={copyPixKey}
                id="copy-pix-btn"
              >
                <Copy size={16} />
                <span>Copiar chave Pix</span>
              </button>
              <button
                type="button"
                className={`${styles.btnAction} ${styles['btnAction--outline']}`}
                onClick={() => setQrModalOpen(true)}
              >
                <QrCode size={16} />
                <span>Ver QR Code</span>
              </button>
            </div>
          </div>

          {/* 2. Nota Fiscal Paulista */}
          <div className={styles.supportCard}>
            <div className={`${styles.cardIconCircle} ${styles['cardIconCircle--green']}`}>
              <Receipt size={28} />
            </div>
            <h3 className={styles.cardTitle}>Nota Fiscal Paulista</h3>
            <p className={styles.cardDesc}>
              Doe seus cupons fiscais de compras sem CPF diretamente pelo aplicativo oficial da NFP.
            </p>
            <div className={styles.cardBtnGroup}>
              <button
                type="button"
                className={`${styles.btnAction} ${styles['btnAction--secondary']}`}
                onClick={() => setNfpModalOpen(true)}
              >
                <span>Quero contribuir</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* 3. Voluntariado */}
          <div className={styles.supportCard}>
            <div className={`${styles.cardIconCircle} ${styles['cardIconCircle--navy']}`}>
              <HeartHandshake size={28} />
            </div>
            <h3 className={styles.cardTitle}>Voluntariado</h3>
            <p className={styles.cardDesc}>
              Compartilhe seu tempo, talento profissional, ensino ou carinho com nossos educandos.
            </p>
            <div className={styles.cardBtnGroup}>
              <button
                type="button"
                className={`${styles.btnAction} ${styles['btnAction--secondary']}`}
                onClick={() => setVolunteerModalOpen(true)}
              >
                <span>Quero ser voluntário</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* 4. Torne-se Associado */}
          <div className={styles.supportCard}>
            <div className={`${styles.cardIconCircle} ${styles['cardIconCircle--blue']}`}>
              <UserPlus size={28} />
            </div>
            <h3 className={styles.cardTitle}>Torne-se Associado</h3>
            <p className={styles.cardDesc}>
              Contribua mensalmente de forma recorrente e participe das assembleias e decisões da OSC.
            </p>
            <div className={styles.cardBtnGroup}>
              <button
                type="button"
                className={`${styles.btnAction} ${styles['btnAction--outline']}`}
                onClick={() => setMemberModalOpen(true)}
              >
                <span>Quero ser associado</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Como o Apoio se Transforma (Fluxo Visual) */}
        <div className={styles.transformationSection}>
          <h3 className={styles.transTitle}>Como o apoio se transforma</h3>
          <p className={styles.transSubtitle}>
            Veja o ciclo virtuoso que conecta sua generosidade ao desenvolvimento humano sustentável
            em nossa cidade.
          </p>

          <div className={styles.transformationFlow}>
            {transformationSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className={styles.flowStep}>
                  <div className={styles.stepIcon}>{step.icon}</div>
                  <div className={styles.stepText}>{step.label}</div>
                </div>
                {idx < transformationSteps.length - 1 && (
                  <span className={styles.flowArrow} aria-hidden="true">
                    →
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Modal QR Code Pix */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Doação rápida via Pix"
        tag="Associação Recanto Betel"
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div
            style={{
              width: '200px',
              height: '200px',
              margin: '0 auto 16px auto',
              backgroundColor: '#FFFFFF',
              border: '2px solid #E2E8F0',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            }}
          >
            {/* SVG Simulado de QR Code Pix */}
            <svg width="160" height="160" viewBox="0 0 100 100" fill="#0D2B40">
              <rect width="30" height="30" x="5" y="5" rx="3" />
              <rect width="20" height="20" x="10" y="10" fill="#FFFFFF" />
              <rect width="10" height="10" x="15" y="15" />
              
              <rect width="30" height="30" x="65" y="5" rx="3" />
              <rect width="20" height="20" x="70" y="10" fill="#FFFFFF" />
              <rect width="10" height="10" x="75" y="15" />
              
              <rect width="30" height="30" x="5" y="65" rx="3" />
              <rect width="20" height="20" x="10" y="70" fill="#FFFFFF" />
              <rect width="10" height="10" x="15" y="75" />

              <rect width="10" height="10" x="45" y="15" />
              <rect width="15" height="10" x="45" y="35" />
              <rect width="10" height="15" x="65" y="45" />
              <rect width="15" height="15" x="40" y="65" />
              <rect width="10" height="10" x="70" y="75" />
            </svg>
          </div>

          <p style={{ fontSize: '0.925rem', color: '#53697D', marginBottom: '8px' }}>
            Aponte a câmera do seu aplicativo de banco para ler o QR Code ou use a chave CNPJ:
          </p>
          <div
            style={{
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: '1rem',
              color: '#174A6E',
              backgroundColor: '#EDF5FA',
              padding: '8px 14px',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            {CONTACT_INFO.pixKey}
          </div>

          <button
            type="button"
            onClick={copyPixKey}
            style={{
              backgroundColor: '#F4C542',
              color: '#0D2B40',
              fontWeight: 700,
              padding: '12px 24px',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Copy size={16} />
            <span>Copiar Chave Pix</span>
          </button>
        </div>
      </Modal>

      {/* Modal Nota Fiscal Paulista */}
      <Modal
        isOpen={nfpModalOpen}
        onClose={() => setNfpModalOpen(false)}
        title="Como Doar pela Nota Fiscal Paulista"
        tag="Passo a Passo"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', color: '#132E43' }}>
          <p style={{ lineHeight: '1.6' }}>
            Você pode doar os créditos de suas compras sem gastar nada a mais, escolhendo a
            <strong> Associação Recanto Betel</strong> como sua entidade beneficiária oficial!
          </p>

          <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>Acesse o app da <strong>Nota Fiscal Paulista</strong> no celular;</li>
            <li>Faça login com seu CPF e senha da Secretaria da Fazenda de SP;</li>
            <li>No menu lateral, selecione <strong>Doação de Cupons com Automática</strong>;</li>
            <li>Busque pelo CNPJ: <strong>47.818.778/0001-76</strong>;</li>
            <li>Confirme a Associação Recanto Betel. Pronto! Em cada compra informando seu CPF, parte do ICMS é repassada automaticamente à instituição.</li>
          </ol>
        </div>
      </Modal>

      {/* Modal Cadastro de Voluntário */}
      <Modal
        isOpen={volunteerModalOpen}
        onClose={() => setVolunteerModalOpen(false)}
        title="Seja um Voluntário do Recanto"
        tag="Faça a Diferença"
      >
        <form onSubmit={handleVolunteerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '0.925rem', color: '#53697D' }}>
            Preencha seus dados e nossa equipe de coordenação entrará em contato para agendar uma
            visita e alinhar sua disponibilidade com as necessidades dos projetos.
          </p>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#174A6E', marginBottom: '4px' }}>
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={volName}
              onChange={(e) => setVolName(e.target.value)}
              placeholder="Seu nome"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#174A6E', marginBottom: '4px' }}>
              E-mail *
            </label>
            <input
              type="email"
              required
              value={volEmail}
              onChange={(e) => setVolEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#174A6E', marginBottom: '4px' }}>
              WhatsApp / Telefone *
            </label>
            <input
              type="tel"
              required
              value={volPhone}
              onChange={(e) => setVolPhone(e.target.value)}
              placeholder="(15) 99999-9999"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#174A6E', marginBottom: '4px' }}>
              Área de Interesse
            </label>
            <select
              value={volArea}
              onChange={(e) => setVolArea(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
            >
              <option value="Pedagógico / Reforço">Acompanhamento Pedagógico / Reforço</option>
              <option value="Oficinas Culturais / Música">Oficinas Culturais / Música / Artes</option>
              <option value="Esporte e Lazer">Esporte, Recreação e Lazer</option>
              <option value="Administrativo / Apoio">Apoio Administrativo / Eventos</option>
              <option value="Horta e Meio Ambiente">Horta Educativa e Meio Ambiente</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: '#174A6E',
              color: '#FFFFFF',
              fontWeight: 700,
              padding: '12px',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Send size={16} />
            <span>Enviar Cadastro de Voluntário</span>
          </button>
        </form>
      </Modal>

      {/* Modal Torne-se Associado */}
      <Modal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        title="Torne-se um Associado Contribuinte"
        tag="Sustentabilidade Continuada"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', color: '#132E43' }}>
          <p style={{ lineHeight: '1.6' }}>
            Como associado da Associação Recanto Betel, você contribui mensalmente com um valor fixo
            e passa a integrar a comunidade formal que acompanha as prestações de contas e o futuro da entidade.
          </p>
          <div
            style={{
              backgroundColor: '#F8FAFC',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
            }}
          >
            <strong style={{ color: '#174A6E' }}>Planos sugeridos:</strong>
            <ul style={{ marginTop: '8px', paddingLeft: '18px', color: '#53697D' }}>
              <li>Sócio Amigo: R$ 30,00 / mês</li>
              <li>Sócio Protetor: R$ 50,00 / mês</li>
              <li>Sócio Transformador: R$ 100,00 / mês</li>
            </ul>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#53697D' }}>
            Para formalizar seu termo de filiação, entre em contato via WhatsApp ou envie uma mensagem no formulário de contato abaixo.
          </p>
          <button
            type="button"
            onClick={() => {
              setMemberModalOpen(false);
              const contactEl = document.getElementById('contato');
              if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              backgroundColor: '#F4C542',
              color: '#0D2B40',
              fontWeight: 700,
              padding: '12px 20px',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            Ir para formulário de contato
          </button>
        </div>
      </Modal>
    </section>
  );
};
