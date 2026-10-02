import React, { useState, useEffect, useRef } from 'react';
import {
  Calculator,
  Lock,
  Edit3,
  Coins,
  Zap,
  Clock,
  Printer,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  X,
  User,
  FileText,
  Download,
  Share2,
  Copy,
  Building2,
  BadgePercent,
  Calendar,
  Sparkles,
  Smartphone,
  Globe,
  Link,
  MessageCircle,
  HelpCircle,
  Send,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { GermanicaParams, TipoPlano, TipoLance } from './types/germanica';
import { calculateGermanica, formatBRL, formatPercent } from './utils/germanicaCalculations';
import { generateGermanicaPdf, createGermanicaPdfDoc } from './utils/generateGermanicaPdf';
import { PWAInstallModal } from './components/PWAInstallModal';
import { BRLCurrencyInput } from './components/BRLCurrencyInput';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('simulador_germanica_theme');
      return saved !== null ? saved === 'dark' : true;
    } catch {
      return true;
    }
  });

  // Modais
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>('');
  const [consultantName, setConsultantName] = useState<string>('Especialista Germânica');
  const [proposalNotes, setProposalNotes] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);
  const [copiedLinkMessage, setCopiedLinkMessage] = useState<boolean>(false);

  const clientInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('simulador_germanica_theme', isDark ? 'dark' : 'light');
    } catch (e) {
      console.error(e);
    }
  }, [isDark]);

  useEffect(() => {
    if (isPdfModalOpen) {
      setTimeout(() => {
        clientInputRef.current?.focus();
      }, 100);
    }
  }, [isPdfModalOpen]);

  // Apenas estes campos em LARANJA são os campos editáveis preenchidos pelo usuário
  const [params, setParams] = useState<GermanicaParams>({
    credito: 90000,
    prazoMeses: 84,
    taxaAdmPercent: 17.0,
    tipoPlano: '75%',
    vendaComSeguro: true,
    seguroPercentMensal: 0.0816801,

    // LANCE
    lanceProprioValor: 0,
    lanceProprioPercent: 0,
    tipoLance: 'Livre',
    usarLanceEmbutido: false,
    embutidoPercent: 25,
    parcelasPagasAteLance: 1,
  });

  const res = calculateGermanica(params);

  const handleUpdate = <K extends keyof GermanicaParams>(
    key: K,
    value: GermanicaParams[K]
  ) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Texto formatado da proposta
  const getProposalFormattedText = () => {
    const cleanClient = clientName.trim() || 'Cliente';
    const cleanConsultant = consultantName.trim() || 'Especialista Germânica';
    
    return `📋 *PROPOSTA OFICIAL - CONSÓRCIO GERMÂNICA / DISAL*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${cleanClient}
💼 *Consultor:* ${cleanConsultant}

💰 *1. Valor do Crédito:* ${formatBRL(params.credito)}
💵 *2. Parcela Inicial (${params.tipoPlano}):* ${formatBRL(res.parcelaSimulacao)}
📅 *3. Prazo Total:* ${params.prazoMeses} meses
🎯 *4. Valor do Lance Total:* ${formatBRL(res.lanceTotalCalculo)} ${res.lanceEmbutidoValor > 0 ? `(${formatBRL(res.lanceEmbutidoValor)} embutido)` : ''}
🚀 *5. Nova Parcela Pós-Contemplação (${res.prazoRestante}m):* ${formatBRL(res.parcelaPosContemplacaoMesmoPrazo)} / mês
━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Crédito Líquido na Mão:* ${formatBRL(res.creditoPosContemplacao)}
${proposalNotes ? `📌 *Observação:* ${proposalNotes}\n` : ''}
Grupo Germânica · Consórcio Disal`;
  };

  // GERAÇÃO E DOWNLOAD DO PDF (baixa e ativa imediatamente as opções de compartilhamento social)
  const handleDownloadDirectPdf = (openNativeShare = false) => {
    setIsGeneratingPdf(true);

    try {
      generateGermanicaPdf(res, {
        clientName,
        consultantName,
        proposalNotes,
      });

      setDownloadSuccess(true);

      if (openNativeShare) {
        handleSharePdf();
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // COMPARTILHAMENTO UNIVERSAL / REDES SOCIAIS (Menu nativo do celular com o arquivo PDF)
  const handleSharePdf = async () => {
    setIsGeneratingPdf(true);
    const cleanClient = clientName.trim() || 'Cliente';
    const text = getProposalFormattedText();

    try {
      const { blob, filename } = createGermanicaPdfDoc(res, {
        clientName,
        consultantName,
        proposalNotes,
      });

      setDownloadSuccess(true);

      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        console.warn(e);
      }

      const file = new File([blob], filename, { type: 'application/pdf' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Proposta Consórcio Germânica - ${cleanClient}`,
          text: `Olá ${cleanClient}, segue a sua Proposta Comercial do Consórcio Germânica / Disal.`,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 4000);
      } else if (navigator.share) {
        await navigator.share({
          title: `Proposta Consórcio Germânica - ${cleanClient}`,
          text: text,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 4000);
      } else {
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        const win = window.open(whatsappUrl, '_blank');
        if (!win) {
          window.location.href = whatsappUrl;
        }
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 4000);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', error);
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Enviar direto no WhatsApp (1 clique)
  const handleDirectWhatsApp = () => {
    const text = getProposalFormattedText();
    generateGermanicaPdf(res, { clientName, consultantName, proposalNotes });
    setDownloadSuccess(true);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    const win = window.open(whatsappUrl, '_blank');
    if (!win) {
      window.location.href = whatsappUrl;
    }
  };

  // Enviar no Telegram (1 clique)
  const handleDirectTelegram = () => {
    const text = getProposalFormattedText();
    generateGermanicaPdf(res, { clientName, consultantName, proposalNotes });
    setDownloadSuccess(true);
    const telegramUrl = `https://t.me/share/url?text=${encodeURIComponent(text)}`;
    const win = window.open(telegramUrl, '_blank');
    if (!win) {
      window.location.href = telegramUrl;
    }
  };

  // Enviar por E-mail
  const handleDirectEmail = () => {
    const cleanClient = clientName.trim() || 'Cliente';
    const text = getProposalFormattedText();
    generateGermanicaPdf(res, { clientName, consultantName, proposalNotes });
    setDownloadSuccess(true);
    const subject = encodeURIComponent(`Proposta Comercial Consórcio Germânica - ${cleanClient}`);
    const body = encodeURIComponent(text);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Copiar o resumo da proposta
  const handleCopyProposalText = async () => {
    const text = getProposalFormattedText();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 3000);
    } catch (err) {
      console.warn(err);
    }
  };

  // Copiar o link do app para enviar para outra pessoa
  const handleCopyAppLink = () => {
    const appUrl = window.location.origin;
    navigator.clipboard.writeText(appUrl);
    setCopiedLinkMessage(true);
    setTimeout(() => setCopiedLinkMessage(false), 3000);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 overflow-x-hidden ${
        isDark
          ? 'bg-[#0b1320] text-slate-100 selection:bg-amber-500 selection:text-slate-950'
          : 'bg-slate-100 text-slate-900 selection:bg-amber-400 selection:text-slate-900'
      }`}
    >
      {/* Top Header - Totalmente Responsivo para Celular (Sem transbordar) */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b px-2.5 sm:px-6 py-2 sm:py-3 no-print transition-colors ${
          isDark
            ? 'bg-[#0b1320]/95 border-slate-800/80'
            : 'bg-white/95 border-slate-200 shadow-xs'
        }`}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Logo & Nome Completo "Simulador Germânica" */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                isDark
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'bg-amber-100 border-amber-400 text-amber-800'
              }`}
            >
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className={`text-xs sm:text-base font-black tracking-tight whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Simulador Germânica
                </span>
                <span
                  className={`text-[8px] sm:text-[9px] uppercase font-black px-1 py-0.2 rounded border tracking-wider shrink-0 ${
                    isDark
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  DISAL
                </span>
              </div>
              <span className={`text-[10px] hidden sm:block leading-none mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Campos com <strong className={isDark ? 'text-amber-400' : 'text-amber-800'}>borda laranja</strong> são editáveis
              </span>
            </div>
          </div>

          {/* Ações: Link + Offline + Tema + Botão Gerar PDF */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Copiar Link */}
            <button
              onClick={handleCopyAppLink}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900'
              }`}
              title="Copiar link do simulador"
            >
              <Link className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />
              <span className="hidden lg:inline text-[11px]">{copiedLinkMessage ? 'Copiado!' : 'Link'}</span>
            </button>

            {/* Instalar App / Offline */}
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900'
              }`}
              title="Instalar App / Offline"
            >
              <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span className="hidden lg:inline text-[11px]">Offline</span>
            </button>

            {/* Alternar Tema */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-1.5 sm:px-2 sm:py-1.5 rounded-xl border text-xs font-bold flex items-center transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900'
              }`}
              title={isDark ? 'Tema Claro' : 'Tema Escuro'}
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 shrink-0" />
              )}
            </button>

            {/* BOTÃO GERAR PDF */}
            <button
              onClick={() => {
                setDownloadSuccess(false);
                setShareSuccess(false);
                setIsPdfModalOpen(true);
              }}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="font-black text-xs whitespace-nowrap">Gerar PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 space-y-4 sm:space-y-5">
        {/* Banner Informativo */}
        <div
          className={`p-3 sm:p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 no-print ${
            isDark
              ? 'bg-[#101b2d]/80 border-amber-500/30 text-amber-300'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shrink-0 animate-pulse"></span>
            <span>
              <strong>Campos em Laranja (Editáveis):</strong> Preencha o Crédito, Prazo, Taxa Adm, Tipo de Plano, Seguro e Lance.
            </span>
          </div>
          <div className={`flex items-center gap-1.5 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>Campos em cinza/verde são fórmulas automáticas.</span>
          </div>
        </div>

        {/* ESTRUTURA PRINCIPAL EM 2 COLUNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* SEÇÃO 1: DADOS DO PLANO */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border space-y-4 shadow-lg transition-colors ${
              isDark ? 'bg-[#101b2d] border-slate-800/90' : 'bg-white border-slate-200'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-3 border-b ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h2 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Dados do Plano
                </h2>
              </div>
              <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Simulador Germânica
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* CAMPO EDITÁVEL 1: Crédito R$ */}
              <div
                className={`p-3.5 rounded-2xl border-2 border-amber-500 space-y-1.5 transition-all ${
                  isDark ? 'bg-[#0b1320] shadow-md shadow-amber-500/5' : 'bg-amber-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className={`font-bold flex items-center gap-1.5 text-xs ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Crédito R$ (Preenchimento)</span>
                  </label>
                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Valor da Carta
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    R$
                  </span>
                  <BRLCurrencyInput
                    value={params.credito}
                    onChange={(val) => handleUpdate('credito', val)}
                    placeholder="0,00"
                    className={`w-full border-2 border-amber-500/70 rounded-xl px-3.5 py-2 text-base font-black font-num focus:outline-none focus:border-amber-400 ${
                      isDark ? 'bg-[#15233a] text-white' : 'bg-white text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* CAMPO EDITÁVEL 2 & 3: Prazo e Taxa Adm */}
              <div className="grid grid-cols-2 gap-3">
                {/* Prazo em meses */}
                <div
                  className={`p-3 rounded-2xl border-2 border-amber-500 space-y-1 ${
                    isDark ? 'bg-[#0b1320]' : 'bg-amber-50/50'
                  }`}
                >
                  <label className={`font-bold flex items-center gap-1 text-[11px] ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                    <Edit3 className="w-3 h-3 text-amber-400" />
                    <span>Prazo em meses</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={params.prazoMeses === 0 ? '' : params.prazoMeses}
                    placeholder="0"
                    onChange={(e) => handleUpdate('prazoMeses', e.target.value === '' ? 0 : Number(e.target.value))}
                    onFocus={(e) => e.target.select()}
                    className={`w-full border-2 border-amber-500/70 rounded-xl px-3 py-1.5 text-sm font-black font-num text-center focus:outline-none focus:border-amber-400 ${
                      isDark ? 'bg-[#15233a] text-white' : 'bg-white text-slate-900'
                    }`}
                  />
                </div>

                {/* Taxa Adm em % */}
                <div
                  className={`p-3 rounded-2xl border-2 border-amber-500 space-y-1 ${
                    isDark ? 'bg-[#0b1320]' : 'bg-amber-50/50'
                  }`}
                >
                  <label className={`font-bold flex items-center gap-1 text-[11px] ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                    <Edit3 className="w-3 h-3 text-amber-400" />
                    <span>Taxa Adm em %</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={params.taxaAdmPercent === 0 ? '' : params.taxaAdmPercent}
                      placeholder="0"
                      onChange={(e) => handleUpdate('taxaAdmPercent', e.target.value === '' ? 0 : Number(e.target.value))}
                      onFocus={(e) => e.target.select()}
                      className={`w-full border-2 border-amber-500/70 rounded-xl px-3 py-1.5 text-sm font-black font-num text-center focus:outline-none focus:border-amber-400 ${
                        isDark ? 'bg-[#15233a] text-white' : 'bg-white text-slate-900'
                      }`}
                    />
                    <span className={`font-black ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>%</span>
                  </div>
                </div>
              </div>

              {/* CAMPO EDITÁVEL 4: Tipo de Plano */}
              <div
                className={`p-3 rounded-2xl border-2 border-amber-500 space-y-2 ${
                  isDark ? 'bg-[#0b1320]' : 'bg-amber-50/50'
                }`}
              >
                <label className={`font-bold flex items-center gap-1 text-xs ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                  <Edit3 className="w-3 h-3 text-amber-400" />
                  <span>Tipo de Plano</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['50%', '75%', '100%'] as TipoPlano[]).map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => handleUpdate('tipoPlano', tipo)}
                      className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        params.tipoPlano === tipo
                          ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                          : isDark
                          ? 'bg-[#15233a] text-slate-300 hover:text-white border border-slate-700'
                          : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-300'
                      }`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              {/* CAMPO EDITÁVEL 5: Venda Com Seguro? */}
              <div
                className={`p-3 rounded-2xl border-2 border-amber-500 flex items-center justify-between ${
                  isDark ? 'bg-[#0b1320]' : 'bg-amber-50/50'
                }`}
              >
                <div>
                  <label className={`font-bold flex items-center gap-1 text-xs ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                    <Edit3 className="w-3 h-3 text-amber-400" />
                    <span>Venda Com Seguro?</span>
                  </label>
                  <span className={`text-[11px] font-num ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Taxa: {params.seguroPercentMensal}% a.m.
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1 p-1 rounded-xl border ${
                    isDark ? 'bg-[#15233a] border-slate-700' : 'bg-white border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleUpdate('vendaComSeguro', true)}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition-colors cursor-pointer ${
                      params.vendaComSeguro
                        ? 'bg-amber-400 text-slate-950'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate('vendaComSeguro', false)}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition-colors cursor-pointer ${
                      !params.vendaComSeguro
                        ? 'bg-amber-400 text-slate-950'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Não
                  </button>
                </div>
              </div>

              {/* RESULTADO CALCULADO: Parcela Simulação */}
              <div
                className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
                  isDark
                    ? 'bg-gradient-to-r from-emerald-950/40 to-slate-900 border-emerald-500/70 shadow-lg shadow-emerald-500/5'
                    : 'bg-emerald-50 border-emerald-400 shadow-xs'
                }`}
              >
                <div>
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider block ${
                      isDark ? 'text-emerald-400' : 'text-emerald-800'
                    }`}
                  >
                    Parcela Simulação ({params.tipoPlano})
                  </span>
                  <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Fórmula Calculada Automática
                  </span>
                </div>
                <div
                  className={`text-2xl font-black font-num ${
                    isDark ? 'text-white' : 'text-emerald-950'
                  }`}
                >
                  {formatBRL(res.parcelaSimulacao)}
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: LANCE */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border space-y-4 shadow-lg transition-colors ${
              isDark ? 'bg-[#101b2d] border-slate-800/90' : 'bg-white border-slate-200'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-3 border-b ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h2 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  LANCE
                </h2>
              </div>
              <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Configuração de Oferta
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* CAMPO EDITÁVEL 6: Lance Recursos Próprios R$ */}
              <div
                className={`p-3.5 rounded-2xl border-2 border-amber-500 space-y-1.5 transition-all ${
                  isDark ? 'bg-[#0b1320] shadow-md shadow-amber-500/5' : 'bg-amber-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className={`font-bold flex items-center gap-1.5 text-xs ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Lance Recursos Próprios</span>
                  </label>
                  <span className={`text-[11px] font-black font-num ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {params.credito > 0
                      ? ((res.lanceProprioEfetivo / params.credito) * 100).toFixed(4)
                      : '0,0000'}
                    %
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    R$
                  </span>
                  <BRLCurrencyInput
                    value={params.lanceProprioValor}
                    onChange={(val) => handleUpdate('lanceProprioValor', val)}
                    placeholder="0,00"
                    max={params.credito}
                    className={`w-full border-2 border-amber-500/70 rounded-xl px-3.5 py-2 text-sm font-black font-num focus:outline-none focus:border-amber-400 ${
                      isDark ? 'bg-[#15233a] text-white' : 'bg-white text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* CAMPO EDITÁVEL 7: Tipo de Lance (Livre / Fixo) */}
              <div
                className={`p-3 rounded-2xl border-2 border-amber-500 space-y-1.5 ${
                  isDark ? 'bg-[#0b1320]' : 'bg-amber-50/50'
                }`}
              >
                <label className={`font-bold flex items-center gap-1 text-xs ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                  <Edit3 className="w-3 h-3 text-amber-400" />
                  <span>Tipo de lance</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Livre', 'Fixo'] as TipoLance[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleUpdate('tipoLance', t)}
                      className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        params.tipoLance === t
                          ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                          : isDark
                          ? 'bg-[#15233a] text-slate-300 hover:text-white border border-slate-700'
                          : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-300'
                      }`}
                    >
                      Lance {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* CAMPO EDITÁVEL 8: Usar Lance Embutido? */}
              <div
                className={`p-3 rounded-2xl border-2 border-amber-500 flex items-center justify-between ${
                  isDark ? 'bg-[#0b1320]' : 'bg-amber-50/50'
                }`}
              >
                <div>
                  <label className={`font-bold flex items-center gap-1 text-xs ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                    <Edit3 className="w-3 h-3 text-amber-400" />
                    <span>Usar Lance Embutido?</span>
                  </label>
                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Lance em Valores (% Embutido: 25%)
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1 p-1 rounded-xl border ${
                    isDark ? 'bg-[#15233a] border-slate-700' : 'bg-white border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleUpdate('usarLanceEmbutido', true)}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition-colors cursor-pointer ${
                      params.usarLanceEmbutido
                        ? 'bg-amber-400 text-slate-950'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate('usarLanceEmbutido', false)}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition-colors cursor-pointer ${
                      !params.usarLanceEmbutido
                        ? 'bg-amber-400 text-slate-950'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Não
                  </button>
                </div>
              </div>

              {/* RESULTADOS CALCULADOS DO LANCE */}
              <div className="space-y-2 pt-1 font-num">
                <div
                  className={`p-2.5 rounded-xl border flex justify-between items-center ${
                    isDark ? 'bg-[#0b1320] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                    Lance Embutido R$:
                  </span>
                  <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {formatBRL(res.lanceEmbutidoValor)} ({params.usarLanceEmbutido ? '25,0000%' : '0,0000%'})
                  </span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border flex justify-between items-center ${
                    isDark ? 'bg-[#0b1320] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                    Lance para Cálculo:
                  </span>
                  <span className="font-black text-amber-500">
                    {formatBRL(res.lanceTotalCalculo)}
                  </span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border flex justify-between items-center ${
                    isDark
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-emerald-50 border-emerald-300'
                  }`}
                >
                  <span className={`font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                    Crédito Pós Contempl.:
                  </span>
                  <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-emerald-950'}`}>
                    {formatBRL(res.creditoPosContemplacao)}{' '}
                    <span className={`text-[10px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      (Aproximado)
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: SIMULAÇÃO PARCELAS PÓS CONTEMPLAÇÃO */}
        <div
          className={`p-4 sm:p-6 rounded-2xl border space-y-4 shadow-lg transition-colors ${
            isDark ? 'bg-[#101b2d] border-slate-800/90' : 'bg-white border-slate-200'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-3 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h3 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                SIMULAÇÃO PARCELAS PÓS CONTEMPLAÇÃO
              </h3>
            </div>
            {/* CAMPO EDITÁVEL: Parcelas pagas até a contemplação */}
            <div className="flex items-center gap-2 text-xs">
              <span className={`font-bold flex items-center gap-1 ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                <Edit3 className="w-3 h-3 text-amber-400" />
                Parcelas Pagas no Prazo:
              </span>
              <input
                type="number"
                min="0"
                max={params.prazoMeses - 1}
                value={params.parcelasPagasAteLance === 0 ? '' : params.parcelasPagasAteLance}
                placeholder="0"
                onChange={(e) => handleUpdate('parcelasPagasAteLance', e.target.value === '' ? 0 : Number(e.target.value))}
                onFocus={(e) => e.target.select()}
                className={`w-14 border-2 border-amber-500 rounded-xl px-2 py-1 text-xs font-black font-num text-center ${
                  isDark ? 'bg-[#0b1320] text-white' : 'bg-white text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opção A: Manter mesmo prazo */}
            <div
              className={`p-4 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#0b1320] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div
                className={`text-xs font-black uppercase tracking-wider ${
                  isDark ? 'text-emerald-400' : 'text-emerald-800'
                }`}
              >
                Contemplação com redução das parcelas
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Manter mesmo prazo:
                </span>
                <span className={`text-xl font-black font-num ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {formatBRL(res.parcelaPosContemplacaoMesmoPrazo)}
                </span>
              </div>
              <div className={`text-[11px] font-num ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                Prazo restante: <strong>{res.prazoRestante} meses</strong>
              </div>
            </div>

            {/* Opção B: Redução do prazo */}
            <div
              className={`p-4 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#0b1320] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div
                className={`text-xs font-black uppercase tracking-wider ${
                  isDark ? 'text-blue-400' : 'text-blue-800'
                }`}
              >
                Contemplação com redução do prazo
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Novo prazo pós-lance:
                </span>
                <span className={`text-xl font-black font-num ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {res.novoPrazoPosLance} meses
                </span>
              </div>
              <div className={`text-[11px] font-num ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                Valor das parcelas: <strong>{formatBRL(res.parcelaPosContemplacaoMesmoPrazo)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO 4: MEMÓRIA DE CÁLCULO & REGRAS GERMANICA DISAL */}
        <div
          className={`p-4 sm:p-6 rounded-2xl border space-y-4 shadow-lg transition-colors ${
            isDark ? 'bg-[#101b2d] border-slate-800/90' : 'bg-white border-slate-200'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-3 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Lock className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
              <h3 className={`text-xs sm:text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Quadro de Fórmulas e Regras (Cálculos Automáticos da Planilha)
              </h3>
            </div>
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Valores Exatos Germânica
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs font-num">
            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#0b1320] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Valor Taxa adm R$:
              </span>
              <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatBRL(res.valorTaxaAdm)}
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#0b1320] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Valor Categoria:
              </span>
              <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatBRL(res.valorCategoria)}
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#0b1320] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                % do Seguro:
              </span>
              <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {params.seguroPercentMensal}%
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#0b1320] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Valor Seguro Mensal:
              </span>
              <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatBRL(res.valorSeguroMensal)}
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#0b1320] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Seguro Total R$:
              </span>
              <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatBRL(res.seguroTotal)}
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#0b1320] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                VL Categoria + Seguro:
              </span>
              <span className="font-black text-emerald-500">
                {formatBRL(res.valorCategoriaMaisSeguro)}
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#0b1320] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Credito Reduzido*:
              </span>
              <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatBRL(res.creditoReduzido)}
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#0b1320] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                25% Embutido:
              </span>
              <span className="font-black text-amber-400">
                {formatBRL(res.embutidoLivre)}
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#0b1320] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Regra 25% lance próprio:
              </span>
              <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatBRL(res.regra25LanceProprio)}
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#0b1320] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Dif lance sobre categoria:
              </span>
              <span className="font-black text-rose-500">
                {formatBRL(res.difLanceSobreCategoria)}
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#0b1320] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Embutido - Livre:
              </span>
              <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatBRL(res.embutidoLivre)}
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#0b1320] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Embutido - Fixo:
              </span>
              <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatBRL(res.embutidoFixo)}
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#0b1320] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Red. Saldo Devedor:
              </span>
              <span className="font-black text-emerald-500">
                {formatBRL(res.saldoDevedorAposParcelasPagas)}
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#0b1320] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Parcela Integral:
              </span>
              <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatBRL(res.parcelaIntegral)}
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#0b1320] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Limite dos 50%:
              </span>
              <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatBRL(res.limite50Percent)}
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#0b1320] border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Novo Prazo pós Lance:
              </span>
              <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {res.prazoRestante}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DE GUIA DE INSTALAÇÃO OFFLINE (ANDROID E IPHONE) */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* MODAL DE PROPOSTA COM COMPARTILHAMENTO DIRETO */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 no-print overflow-y-auto">
          <div
            className={`w-full max-w-lg rounded-2xl border p-5 sm:p-6 space-y-4 shadow-2xl transition-all my-auto ${
              isDark ? 'bg-[#101b2d] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Gerar Proposta Oficial</h3>
                  <p className="text-xs text-slate-400">Personalize os dados do cliente e consultor</p>
                </div>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Nome do Cliente */}
              <div className="space-y-1">
                <label className="font-bold flex items-center gap-1.5 text-amber-400">
                  <User className="w-3.5 h-3.5" />
                  <span>Nome do Cliente:</span>
                </label>
                <input
                  ref={clientInputRef}
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  className={`w-full border-2 border-amber-500 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:border-amber-400 ${
                    isDark ? 'bg-[#0b1320] text-white placeholder-slate-600' : 'bg-white text-slate-900 placeholder-slate-400'
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDownloadDirectPdf();
                  }}
                />
              </div>

              {/* Nome do Consultor */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">
                  Nome do Consultor / Especialista Germânica:
                </label>
                <input
                  type="text"
                  value={consultantName}
                  onChange={(e) => setConsultantName(e.target.value)}
                  placeholder="Ex: Consultor Especialista Germânica"
                  className={`w-full border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400 ${
                    isDark ? 'bg-[#0b1320] text-white placeholder-slate-600' : 'bg-white text-slate-900 placeholder-slate-400'
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDownloadDirectPdf();
                  }}
                />
              </div>

              {/* CARD DOS 5 PONTOS ESSENCIAIS ALIMENTADOS NO PDF */}
              <div className={`p-4 rounded-xl border space-y-2.5 font-num ${isDark ? 'bg-[#0b1320] border-slate-800' : 'bg-amber-50/50 border-amber-200'}`}>
                <div className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>5 Dados Oficiais da Proposta:</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">1. Valor do Crédito:</span>
                    <strong className="text-white text-sm">{formatBRL(params.credito)}</strong>
                  </div>

                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">2. Parcela Inicial:</span>
                    <strong className="text-emerald-400 text-sm">{formatBRL(res.parcelaSimulacao)}</strong>
                  </div>

                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">3. Prazo Total:</span>
                    <strong className="text-white text-sm">{params.prazoMeses} meses</strong>
                  </div>

                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">4. Valor do Lance:</span>
                    <strong className="text-amber-400 text-sm">{formatBRL(res.lanceTotalCalculo)}</strong>
                  </div>

                  <div className="col-span-2 p-2.5 rounded bg-emerald-950/30 border border-emerald-500/40 flex justify-between items-center">
                    <div>
                      <span className="text-emerald-300 block text-[10px] font-bold">5. Nova Parcela Pós-Contemplação:</span>
                      <span className="text-[10px] text-slate-400">{res.prazoRestante} meses restantes</span>
                    </div>
                    <strong className="text-emerald-300 text-base">{formatBRL(res.parcelaPosContemplacaoMesmoPrazo)}</strong>
                  </div>
                </div>
              </div>

              {/* FEEDBACKS E PAINEL DE COMPARTILHAMENTO RÁPIDO PARA REDES SOCIAIS */}
              {downloadSuccess && (
                <div className="p-4 rounded-2xl border-2 border-emerald-500/70 bg-gradient-to-b from-emerald-500/15 to-emerald-950/20 space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-emerald-400">PDF Gerado e Baixado com Sucesso!</h4>
                        <p className="text-[10px] text-slate-300">Escolha onde deseja enviar agora:</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-amber-300 bg-amber-400/15 px-2.5 py-1 rounded-lg border border-amber-400/30">
                      Pronto
                    </span>
                  </div>

                  {/* GRID DE BOTÕES DAS REDES SOCIAIS */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={handleDirectWhatsApp}
                      className="py-2.5 px-2 rounded-xl text-xs font-black bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 flex flex-col items-center justify-center gap-1 shadow-md shadow-emerald-900/30 active:scale-95 transition-all cursor-pointer"
                      title="Enviar pelo WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </button>

                    {/* Redes Sociais / Compartilhar Arquivo */}
                    <button
                      type="button"
                      onClick={handleSharePdf}
                      className="py-2.5 px-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
                      title="Menu do celular (Instagram, WhatsApp, Drive, etc.)"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Redes / Apps</span>
                    </button>

                    {/* Telegram */}
                    <button
                      type="button"
                      onClick={handleDirectTelegram}
                      className="py-2.5 px-2 rounded-xl text-xs font-bold bg-[#0088cc] hover:bg-[#0077b5] text-white flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
                      title="Enviar no Telegram"
                    >
                      <Send className="w-4 h-4" />
                      <span>Telegram</span>
                    </button>

                    {/* E-mail */}
                    <button
                      type="button"
                      onClick={handleDirectEmail}
                      className="py-2.5 px-2 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
                      title="Enviar por E-mail"
                    >
                      <Mail className="w-4 h-4" />
                      <span>E-mail</span>
                    </button>
                  </div>

                  {/* Copiar Resumo em Texto */}
                  <button
                    type="button"
                    onClick={handleCopyProposalText}
                    className={`w-full py-2 px-3 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      copiedMessage
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                        : isDark
                        ? 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white'
                        : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedMessage ? '✓ Resumo copiado com sucesso!' : 'Copiar Resumo em Texto'}</span>
                  </button>
                </div>
              )}

              {shareSuccess && (
                <div className="p-3 bg-blue-500/20 border border-blue-500/40 rounded-xl text-blue-300 text-center font-bold text-xs flex items-center justify-center gap-2 animate-in fade-in">
                  <Share2 className="w-4 h-4 text-blue-400" />
                  <span>Proposta enviada com sucesso!</span>
                </div>
              )}
            </div>

            {/* BOTÕES PRINCIPAIS DE AÇÃO */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-700/50">
              {/* Botão Direto WhatsApp */}
              <button
                type="button"
                onClick={handleDirectWhatsApp}
                className="py-2.5 px-3 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                title="Abrir diretamente no WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              {/* Botão Compartilhar Geral */}
              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={handleSharePdf}
                className="py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Compartilhar nas Redes Sociais"
              >
                <Share2 className="w-4 h-4" />
                <span>Redes Sociais</span>
              </button>

              {/* Botão Baixar PDF */}
              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={() => handleDownloadDirectPdf()}
                className="py-2.5 px-3 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{downloadSuccess ? 'Baixar Novamente' : 'Baixar PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
