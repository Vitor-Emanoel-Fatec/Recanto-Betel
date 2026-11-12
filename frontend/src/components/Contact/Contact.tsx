import React, { useState } from 'react';
import {
  MapPin,
  FileBadge,
  User,
  Phone,
  Mail,
  Send,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { CONTACT_INFO } from '../../data/mockData';
import { FacebookIcon, InstagramIcon, YoutubeIcon, WhatsAppIcon } from '../Common/SocialIcons';
import styles from './Contact.module.scss';

interface ContactProps {
  onShowToast: (message: string, type?: 'success' | 'info') => void;
}

export const Contact: React.FC<ContactProps> = ({ onShowToast }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    assunto: 'Dúvidas Gerais',
    mensagem: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulação de envio com feedback IHC
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      onShowToast('✓ Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
      setFormData({
        nome: '',
        email: '',
        assunto: 'Dúvidas Gerais',
        mensagem: '',
      });
      setTimeout(() => setIsSent(false), 5000);
    }, 600);
  };

  return (
    <section id="contato" className={styles.contactSection}>
      <div className="section-container">
        {/* Cabeçalho da Seção */}
        <div className="section-header">
          <span className="section-tag section-tag-navy">Fale Conosco</span>
          <h2 className="section-title">Entre em contato</h2>
          <p className="section-subtitle">
            Estamos de portas abertas para receber sua família, esclarecer dúvidas, receber doações
            e construir novas parcerias por Tatuí.
          </p>
        </div>

        <div className={styles.contactLayout}>
          {/* Coluna Esquerda: Informações Institucionais */}
          <div className={styles.infoColumn}>
            <div>
              <h3 className={styles.infoTitle}>Informações de Atendimento</h3>
              <p className={styles.infoLead}>
                Venha conhecer a nossa sede no Bairro Valinho ou fale com nossa equipe pelos canais oficiais.
              </p>
            </div>

            <div className={styles.detailsList}>
              {/* Endereço */}
              <div className={styles.detailItem}>
                <div className={styles.iconCircle}>
                  <MapPin size={20} />
                </div>
                <div className={styles.detailText}>
                  <strong>Endereço Sede</strong>
                  <span>{CONTACT_INFO.address.full}</span>
                </div>
              </div>

              {/* CNPJ */}
              <div className={styles.detailItem}>
                <div className={styles.iconCircle}>
                  <FileBadge size={20} />
                </div>
                <div className={styles.detailText}>
                  <strong>CNPJ</strong>
                  <span>{CONTACT_INFO.cnpj} (OSC sem fins lucrativos)</span>
                </div>
              </div>

              {/* Presidente */}
              <div className={styles.detailItem}>
                <div className={styles.iconCircle}>
                  <User size={20} />
                </div>
                <div className={styles.detailText}>
                  <strong>Presidente Institucional</strong>
                  <span>{CONTACT_INFO.president}</span>
                </div>
              </div>

              {/* Telefone e WhatsApp
              <div className={styles.detailItem}>
                <div className={styles.iconCircle}>
                  <Phone size={20} />
                </div>
                <div className={styles.detailText}>
                  <strong>Telefone & WhatsApp</strong>
                  <span>{CONTACT_INFO.phone} · {CONTACT_INFO.whatsapp}</span>
                </div>
              </div> */}

              {/* E-mail */}
              <div className={styles.detailItem}>
                <div className={styles.iconCircle}>
                  <Mail size={20} />
                </div>
                <div className={styles.detailText}>
                  <strong>E-mail Institucional</strong>
                  <span>{CONTACT_INFO.email}</span>
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div>
              <strong style={{ display: 'block', fontSize: '0.85rem', color: '#174A6E', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                Nossas Redes Sociais
              </strong>
              <div className={styles.socialRow}>
                <a
                  href={CONTACT_INFO.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Facebook do Recanto Betel"
                >
                  <FacebookIcon size={20} />
                </a>
                <a
                  href={CONTACT_INFO.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Instagram do Recanto Betel"
                >
                  <InstagramIcon size={20} />
                </a>
                {/* <a
                  href={CONTACT_INFO.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="YouTube do Recanto Betel"
                >
                  <YoutubeIcon size={20} />
                </a> */}
                {/* <a
                  href={`https://wa.me/5515998765432?text=Olá,%20gostaria%20de%20informações%20sobre%20a%20Associação%20Recanto%20Betel`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="WhatsApp do Recanto Betel"
                >
                  <WhatsAppIcon size={20} />
                </a> */}
              </div>
            </div>

            {/* Card Azul Claro de Localização */}
            <div className={styles.locationCard}>
              <div className={styles.locHeader}>
                <MapPin size={22} color="#174A6E" />
                <span>Localização no Bairro Valinho</span>
              </div>
              <p className={styles.locAddress}>
                Rua Prefeito Manoel Luiz da Silva Sá, 438 — Vila Paulina/Valinho, Tatuí/SP.
                Próximo ao centro esportivo e escolas locais.
              </p>
              <a
                href="https://maps.google.com/?q=Rua+Prefeito+Manoel+Luiz+da+Silva+Sa+438+Tatui+SP"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mapsBtn}
              >
                <span>Ver no Google Maps</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* Coluna Direita: Formulário */}
          <div className={styles.formCard}>
            <h3 className={styles.formTitle}>Envie uma mensagem</h3>
            <p className={styles.formSubtitle}>
              Preencha o formulário abaixo e nosso time responderá em até 2 dias úteis.
            </p>

            {isSent && (
              <div
                style={{
                  backgroundColor: '#EEF8F1',
                  border: '1px solid #79B98A',
                  color: '#2F7A43',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '16px',
                  fontSize: '0.9rem',
                }}
              >
                <CheckCircle2 size={20} />
                <span>Mensagem enviada com sucesso! Obrigado pelo contato.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <div className={styles.formGroup}>
                <label htmlFor="contact-nome">Nome completo *</label>
                <input
                  id="contact-nome"
                  type="text"
                  required
                  placeholder="Seu nome ou da sua instituição"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact-email">E-mail para resposta *</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact-assunto">Assunto</label>
                <select
                  id="contact-assunto"
                  value={formData.assunto}
                  onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                >
                  <option value="Dúvidas Gerais">Dúvidas Gerais sobre Atendimentos</option>
                  <option value="Doações e Apoio">Doações e Apoio Financeiro / Pix</option>
                  <option value="Voluntariado">Voluntariado e Apoio Pedagógico</option>
                  <option value="Parcerias e Empresas">Parcerias Institucionais e Empresas</option>
                  <option value="Imprensa e Comunicação">Imprensa e Comunicação</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact-mensagem">Mensagem *</label>
                <textarea
                  id="contact-mensagem"
                  required
                  rows={4}
                  placeholder="Como podemos te ajudar?"
                  value={formData.mensagem}
                  onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitBtn}
                id="submit-contact-btn"
              >
                <span>{isSubmitting ? 'Enviando...' : 'Enviar mensagem'}</span>
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
