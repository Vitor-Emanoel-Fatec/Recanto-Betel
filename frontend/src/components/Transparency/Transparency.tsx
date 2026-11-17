import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  FileCheck2,
  FileText,
  Eye,
  Download,
  Search,
} from 'lucide-react';
import {
  TRANSPARENCY_FINANCIAL,
  DOCUMENTS_DATA,
  DocumentItem,
} from '../../data/mockData';
import { Modal } from '../Common/Modal';
import styles from './Transparency.module.scss';

interface TransparencyProps {
  onShowToast: (message: string, type?: 'success' | 'info') => void;
}

export const Transparency: React.FC<TransparencyProps> = ({ onShowToast }) => {
  const [activeFilter, setActiveFilter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const filterOptions = ['Todos', '2025', '2026', 'Financeiro', 'Jurídico', 'Certificações'];

  // Filtragem dos documentos
  const filteredDocuments = DOCUMENTS_DATA.filter((doc) => {
    // Filtro por pílula
    const matchesFilter =
      activeFilter === 'Todos' ||
      doc.year === activeFilter ||
      doc.category === activeFilter;

    // Filtro por busca de texto
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleDownload = (doc: DocumentItem) => {
    onShowToast(`✓ Download iniciado: ${doc.title} (${doc.fileSize})`, 'success');
  };

  // SVG Donut calculation
  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  return (
    <section id="transparencia" className={styles.transparencySection}>
      <div className="section-container">
        {/* Cabeçalho da Seção */}
        <div className="section-header">
          <span className="section-tag">Prestação de Contas</span>
          <h2 className="section-title">Você tem o direito de saber</h2>
          <p className="section-subtitle">
            Transparência também é uma forma de cuidado. Conheça como cada recurso público e doação é
            gerido com rigor ético e aplicado em prol das crianças e adolescentes.
          </p>
        </div>

        {/* 1. Cards de Resumo Financeiro (Topo) */}
        <div className={styles.financialSummaryGrid}>
          <div className={styles.summaryCard}>
            <div className={`${styles.cardIconWrapper} ${styles['cardIconWrapper--navy']}`}>
              <DollarSign size={26} />
            </div>
            <div className={styles.summaryData}>
              <span className={styles.summaryValue}>{TRANSPARENCY_FINANCIAL.totalRevenue2025}</span>
              <span className={styles.summaryLabel}>Receitas Totais 2025</span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={`${styles.cardIconWrapper} ${styles['cardIconWrapper--green']}`}>
              <TrendingUp size={26} />
            </div>
            <div className={styles.summaryData}>
              <span className={styles.summaryValue}>{TRANSPARENCY_FINANCIAL.publicFunds2026}</span>
              <span className={styles.summaryLabel}>Recursos Públicos 2026 Pactuados</span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={`${styles.cardIconWrapper} ${styles['cardIconWrapper--gold']}`}>
              <FileCheck2 size={26} />
            </div>
            <div className={styles.summaryData}>
              <span className={styles.summaryValue}>{TRANSPARENCY_FINANCIAL.activeLegalInstruments}</span>
              <span className={styles.summaryLabel}>Instrumentos Jurídicos Vigentes</span>
            </div>
          </div>
        </div>

        {/* 2. Gráfico e Barras de Despesas */}
        <div className={styles.expensesPanel}>
          {/* Esquerda: Donut Chart SVG */}
          <div className={styles.chartColumn}>
            <h3 className={styles.chartTitle}>Composição das despesas 2025</h3>
            <div className={styles.donutWrapper}>
              <svg className={styles.donutSvg} viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke="#E2E8F0"
                  strokeWidth="24"
                />
                {TRANSPARENCY_FINANCIAL.expenseBreakdown.map((item, idx) => {
                  const strokeDasharray = `${(item.percent / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((cumulativePercent / 100) * circumference);
                  cumulativePercent += item.percent;

                  return (
                    <circle
                      key={idx}
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth="24"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      style={{ transition: 'stroke-dasharray 0.5s ease' }}
                    />
                  );
                })}
              </svg>

              <div className={styles.donutCenter}>
                <span className={styles.centerYear}>Exercício 2025</span>
                <span className={styles.centerTotal}>100%</span>
              </div>
            </div>
          </div>

          {/* Direita: Barras de Progresso Horizontais */}
          <div className={styles.barsColumn}>
            {TRANSPARENCY_FINANCIAL.expenseBreakdown.map((item, idx) => (
              <div key={idx} className={styles.barRow}>
                <div className={styles.barHeader}>
                  <div className={styles.barLabelGroup}>
                    <span className={styles.colorDot} style={{ backgroundColor: item.color }} />
                    <span className={styles.barName}>{item.name}</span>
                  </div>
                  <span className={styles.barValues}>
                    {item.percent}% · <small style={{ fontWeight: 400, color: '#64748B' }}>{item.amount}</small>
                  </span>
                </div>
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Biblioteca de Documentos */}
        <div className={styles.libraryHeader}>
          <div className={styles.libraryTitleGroup}>
            <h3>Biblioteca de Documentos Oficiais</h3>
            <p>Acesse balanços, relatórios anuais, termos de parceria e certidões</p>
          </div>

          {/* Campo de Busca */}
          <div className={styles.searchInputWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar documento ou ano..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Buscar documentos na biblioteca"
            />
          </div>
        </div>

        {/* Filtros em Pílulas */}
        <div className={styles.documentFilterPills} role="tablist" aria-label="Filtros de documentos">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`${styles.pillBtn} ${
                activeFilter === opt ? styles['pillBtn--active'] : ''
              }`}
              onClick={() => setActiveFilter(opt)}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Lista de Documentos */}
        <div className={styles.documentsList}>
          {filteredDocuments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
              Nenhum documento encontrado para a busca selecionada.
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div key={doc.id} className={styles.documentCard}>
                <div className={styles.docLeft}>
                  <div className={styles.docIconBox} aria-hidden="true">
                    <FileText size={22} />
                  </div>
                  <div className={styles.docMeta}>
                    <div className={styles.badgeRow}>
                      <span className={styles.categoryBadge}>{doc.category}</span>
                      <span className={styles.yearBadge}>{doc.year}</span>
                      <span className={styles.sizeBadge}>({doc.fileSize} · {doc.fileType})</span>
                    </div>
                    <div className={styles.docTitle}>{doc.title}</div>
                    <div className={styles.docDesc}>{doc.description}</div>
                  </div>
                </div>

                <div className={styles.docActions}>
                  <button
                    type="button"
                    className={styles.viewBtn}
                    onClick={() => setPreviewDoc(doc)}
                    aria-label={`Visualizar ${doc.title}`}
                  >
                    <Eye size={16} />
                    <span>Visualizar</span>
                  </button>

                  <button
                    type="button"
                    className={styles.downloadBtn}
                    onClick={() => handleDownload(doc)}
                    aria-label={`Baixar arquivo de ${doc.title}`}
                  >
                    <Download size={16} />
                    <span>Baixar</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Prévia de Documento */}
      <Modal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.title || ''}
        tag={previewDoc ? `${previewDoc.category} · ${previewDoc.year}` : ''}
        size="lg"
        footer={
          <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-end' }}>
            <button
              type="button"
              style={{
                padding: '10px 20px',
                borderRadius: '9999px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#093273',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={() => setPreviewDoc(null)}
            >
              Fechar
            </button>
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: '#F4C542',
                color: '#061E46',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              onClick={() => {
                if (previewDoc) handleDownload(previewDoc);
                setPreviewDoc(null);
              }}
            >
              <Download size={16} />
              <span>Baixar Arquivo Completo ({previewDoc?.fileSize})</span>
            </button>
          </div>
        }
      >
        {previewDoc && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <h4 style={{ color: '#093273', fontSize: '1rem', marginBottom: '8px' }}>
                Resumo do Documento Registrado
              </h4>
              <p style={{ color: '#53697D', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {previewDoc.description}
              </p>
              <div
                style={{
                  marginTop: '14px',
                  display: 'flex',
                  gap: '16px',
                  fontSize: '0.85rem',
                  color: '#64748B',
                }}
              >
                <span><strong>Formato:</strong> {previewDoc.fileType}</span>
                <span><strong>Tamanho:</strong> {previewDoc.fileSize}</span>
                <span><strong>Exercício:</strong> {previewDoc.year}</span>
                <span><strong>Situação:</strong> Regular e Arquivado</span>
              </div>
            </div>

            <div
              style={{
                height: '180px',
                border: '2px dashed #CBD5E1',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                backgroundColor: '#FAFBFC',
                gap: '8px',
              }}
            >
              <FileCheck2 size={36} color="#79B98A" />
              <span style={{ fontWeight: 600, color: '#093273' }}>
                Documento Oficial Autenticado digitalmente
              </span>
              <span style={{ fontSize: '0.8125rem' }}>
                Associação Recanto Betel — CNPJ 47.818.778/0001-76
              </span>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};
