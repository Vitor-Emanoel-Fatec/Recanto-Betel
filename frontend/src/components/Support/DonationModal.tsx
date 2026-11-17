import React, { useState } from 'react';
import { Heart, Copy, Check, ShieldCheck } from 'lucide-react';
import { CONTACT_INFO } from '../../data/mockData';
import { Modal } from '../Common/Modal';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: 'success' | 'info') => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONTACT_INFO.pixKey);
    setCopied(true);
    onShowToast('✓ Chave Pix copiada com sucesso!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apoie a Associação Recanto Betel"
      tag="Transforme Vidas em Tatuí"
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.95rem', color: '#53697D', lineHeight: '1.6' }}>
          Sua doação garante a continuidade das refeições diárias, material pedagógico e oficinas
          para mais de 200 crianças e adolescentes em situação de vulnerabilidade.
        </p>

        {/* Card Pix Destaque */}
        <div
          style={{
            backgroundColor: '#FAFBFC',
            border: '2px solid #F4C542',
            borderRadius: '16px',
            padding: '24px 18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FEF9EC',
              color: '#946800',
              fontWeight: 700,
              fontSize: '0.8125rem',
              padding: '4px 12px',
              borderRadius: '9999px',
            }}
          >
            <Heart size={14} fill="#946800" />
            <span>Chave Pix Oficial (CNPJ)</span>
          </div>

          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '1.2rem',
              fontWeight: 800,
              color: '#093273',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              padding: '10px 18px',
              borderRadius: '8px',
              letterSpacing: '0.05em',
            }}
          >
            {CONTACT_INFO.pixKey}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            style={{
              backgroundColor: copied ? '#79B98A' : '#F4C542',
              color: copied ? '#FFFFFF' : '#061E46',
              fontWeight: 700,
              fontSize: '0.95rem',
              padding: '12px 28px',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(244, 197, 66, 0.35)',
              transition: 'all 0.2s',
            }}
            id="donation-modal-copy-btn"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span>{copied ? 'Chave copiada!' : 'Copiar Chave Pix'}</span>
          </button>
        </div>

        {/* Dados Bancários Complementares */}
        <div
          style={{
            backgroundColor: '#EDF2F9',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '0.875rem',
            color: '#093273',
            textAlign: 'left',
            lineHeight: '1.5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 700 }}>
            <ShieldCheck size={18} color="#164B91" />
            <span>Dados da Conta Bancária Institucional:</span>
          </div>
          <div><strong>Favorecido:</strong> Associação Recanto Betel</div>
          <div><strong>CNPJ:</strong> 47.818.778/0001-76</div>
          <div><strong>Banco:</strong> Banco do Brasil (001)</div>
          <div><strong>Agência:</strong> 0325-5 · <strong>Conta Corrente:</strong> 14.520-8</div>
        </div>
      </div>
    </Modal>
  );
};
