import { jsPDF } from 'jspdf';
import { GermanicaCalculationResult } from '../types/germanica';
import { formatBRL } from './germanicaCalculations';

interface GeneratePdfOptions {
  clientName?: string;
  consultantName?: string;
  proposalNotes?: string;
}

export interface GeneratedPdfResult {
  doc: jsPDF;
  blob: Blob;
  filename: string;
}

export function createGermanicaPdfDoc(
  res: GermanicaCalculationResult,
  options: GeneratePdfOptions = {}
): GeneratedPdfResult {
  const { params } = res;
  const client = (options.clientName || '').trim() || 'Cliente';
  const consultant = (options.consultantName || '').trim() || 'Especialista Germânica';
  const notes = (options.proposalNotes || '').trim();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm

  // --- 1. TOPO DECORATIVO (BARRA PREMIUM AZUL & DOURADA) ---
  doc.setFillColor(11, 28, 56); // #0b1c38
  doc.rect(margin, 12, contentWidth, 3, 'F');
  doc.setFillColor(234, 179, 8); // #eab308 (Dourado)
  doc.rect(margin + 50, 12, contentWidth - 100, 3, 'F');

  // --- 2. CABEÇALHO CORPORATIVO (TOTALMENTE ESPAÇADO, SEM SOBREPOSIÇÃO) ---
  let yPos = 22;

  // Linha 1 do Cabeçalho: Badges à esquerda + Data e Plano à direita
  doc.setFillColor(11, 28, 56); // Azul Germânica
  doc.roundedRect(margin, yPos, 38, 6, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('GRUPO GERMÂNICA', margin + 3.5, yPos + 4.2);

  doc.setFillColor(245, 158, 11); // Âmbar Disal
  doc.roundedRect(margin + 41, yPos, 34, 6, 1.5, 1.5, 'F');
  doc.setTextColor(11, 28, 56);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CONSÓRCIO DISAL', margin + 43.5, yPos + 4.2);

  // Informações de Data e Plano alinhadas à direita (Texto limpo)
  const dataFormatada = new Date().toLocaleDateString('pt-BR');
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Emissão: ${dataFormatada}`, pageWidth - margin, yPos + 2.5, { align: 'right' });

  doc.setTextColor(180, 83, 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  const planoLabel = params.tipoPlano === '100%' ? 'PLANO NORMAL' : 'PLANO LIGHT';
  doc.text(planoLabel, pageWidth - margin, yPos + 6.5, { align: 'right' });

  yPos += 12;

  // Linha 2 do Cabeçalho: TÍTULO PRINCIPAL (Largura total livre)
  doc.setTextColor(11, 28, 56);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PROPOSTA COMERCIAL DE CONSÓRCIO', margin, yPos);

  yPos += 5.5;

  // Linha 3 do Cabeçalho: Subtítulo
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Simulação financeira oficial e planejamento de contemplação', margin, yPos);

  yPos += 4.5;

  // Linha divisória
  doc.setDrawColor(11, 28, 56);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 4;

  // --- 3. IDENTIFICAÇÃO DO CLIENTE & CONSULTOR ---
  const idBoxH = 18;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPos, contentWidth, idBoxH, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, contentWidth, idBoxH, 2, 2, 'S');

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CLIENTE TITULAR:', margin + 5, yPos + 6);
  doc.setTextColor(11, 28, 56);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(client, margin + 5, yPos + 13);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CONSULTOR RESPONSÁVEL:', margin + 95, yPos + 6);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(consultant, margin + 95, yPos + 13);

  yPos += idBoxH + 8;

  // --- 4. OS 5 PILARES DA PROPOSTA (CARDS EXECUTIVOS EM DESTAQUE) ---
  doc.setTextColor(11, 28, 56);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('RESUMO EXECUTIVO DA OPERAÇÃO', margin, yPos);

  yPos += 5;

  const cardW = (contentWidth - 8) / 2; // 86mm
  const cardH = 26;

  // CARD 1: VALOR DO CRÉDITO
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, yPos, cardW, cardH, 2.5, 2.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, yPos, cardW, cardH, 2.5, 2.5, 'S');

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('1. VALOR DO CRÉDITO', margin + 5, yPos + 6.5);

  doc.setTextColor(11, 28, 56);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(formatBRL(params.credito), margin + 5, yPos + 15.5);

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Carta de Crédito Integral', margin + 5, yPos + 21.5);

  // CARD 2: PARCELA INICIAL
  const card2X = margin + cardW + 8;
  doc.setFillColor(240, 253, 244); // Verde claro #f0fdf4
  doc.roundedRect(card2X, yPos, cardW, cardH, 2.5, 2.5, 'F');
  doc.setDrawColor(34, 197, 94); // Verde borda
  doc.setLineWidth(0.5);
  doc.roundedRect(card2X, yPos, cardW, cardH, 2.5, 2.5, 'S');

  doc.setTextColor(22, 101, 52);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  const card2Title = params.tipoPlano === '100%' ? '2. PARCELA INICIAL (PLANO NORMAL)' : '2. PARCELA INICIAL (PLANO LIGHT)';
  doc.text(card2Title, card2X + 5, yPos + 6.5);

  doc.setTextColor(21, 128, 61);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(formatBRL(res.parcelaSimulacao), card2X + 5, yPos + 15.5);

  doc.setTextColor(22, 101, 52);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    params.vendaComSeguro ? 'Com Seguro Prestamista incluso' : 'Sem Seguro',
    card2X + 5,
    yPos + 21.5
  );

  yPos += cardH + 5;

  // CARD 3: PRAZO TOTAL
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, yPos, cardW, cardH, 2.5, 2.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, yPos, cardW, cardH, 2.5, 2.5, 'S');

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('3. PRAZO DO PLANO', margin + 5, yPos + 6.5);

  doc.setTextColor(11, 28, 56);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(`${params.prazoMeses} Meses`, margin + 5, yPos + 15.5);

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Duração total do grupo', margin + 5, yPos + 21.5);

  // CARD 4: VALOR DO LANCE TOTAL
  doc.setFillColor(254, 243, 199); // Âmbar claro #fef3c7
  doc.roundedRect(card2X, yPos, cardW, cardH, 2.5, 2.5, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.5);
  doc.roundedRect(card2X, yPos, cardW, cardH, 2.5, 2.5, 'S');

  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('4. VALOR DO LANCE TOTAL', card2X + 5, yPos + 6.5);

  doc.setTextColor(180, 83, 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(formatBRL(res.lanceTotalCalculo), card2X + 5, yPos + 15.5);

  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const lanceDet =
    res.lanceEmbutidoValor > 0
      ? `Próprio: ${formatBRL(res.lanceProprioEfetivo)} | Embutido: ${formatBRL(res.lanceEmbutidoValor)}`
      : 'Recursos Próprios';
  doc.text(lanceDet, card2X + 5, yPos + 21.5);

  yPos += cardH + 6;

  // CARD 5: NOVA PARCELA PÓS-CONTEMPLAÇÃO (DESTAQUE MÁXIMO)
  const card5H = 32;
  doc.setFillColor(11, 28, 56); // Azul Marinho escuro
  doc.roundedRect(margin, yPos, contentWidth, card5H, 3, 3, 'F');
  doc.setDrawColor(234, 179, 8); // Borda Dourada
  doc.setLineWidth(0.7);
  doc.roundedRect(margin, yPos, contentWidth, card5H, 3, 3, 'S');

  doc.setFillColor(245, 158, 11);
  doc.roundedRect(margin + 5, yPos + 5, 68, 6, 1.5, 1.5, 'F');
  doc.setTextColor(11, 28, 56);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('5. NOVA PARCELA PÓS-CONTEMPLAÇÃO', margin + 7, yPos + 9.2);

  doc.setTextColor(226, 232, 240);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    `Mantendo o mesmo prazo (${res.prazoRestante} meses restantes pós-lance)`,
    margin + 5,
    yPos + 18
  );

  doc.setTextColor(134, 239, 172); // Verde suave
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`Crédito Líquido na mão: ${formatBRL(res.creditoPosContemplacao)}`, margin + 5, yPos + 26);

  // Valor da nova parcela em destaque à direita
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  const parcelaText = formatBRL(res.parcelaPosContemplacaoMesmoPrazo);
  doc.text(parcelaText, pageWidth - margin - 6, yPos + 17, { align: 'right' });

  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('/ mês fixada', pageWidth - margin - 6, yPos + 24, { align: 'right' });

  yPos += card5H + 12;

  if (notes) {
    doc.setFillColor(254, 249, 195);
    doc.roundedRect(margin, yPos, contentWidth, 10, 1.5, 1.5, 'F');
    doc.setTextColor(133, 77, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`Observação: ${notes}`, margin + 4, yPos + 6.5);
    yPos += 18;
  } else {
    yPos += 8;
  }

  // --- 5. RODAPÉ DE VALIDAÇÃO & ASSINATURAS ---
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(
    '* Valores simulados com base nas tabelas vigentes da Administradora de Consórcios Disal / Grupo Germânica. O crédito e as parcelas são atualizados conforme índice contratual do bem referenciado. Proposta sujeita à aprovação cadastral e disponibilidade de cotas no grupo.',
    margin,
    yPos,
    { maxWidth: contentWidth }
  );

  yPos += 22;

  // Linhas de assinatura
  const sigW = 75;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);

  // Consultor
  doc.line(margin + 5, yPos, margin + 5 + sigW, yPos);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(consultant, margin + 5 + sigW / 2, yPos + 4.5, { align: 'center' });
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Consultor Especialista Germânica', margin + 5 + sigW / 2, yPos + 8.5, { align: 'center' });

  // Cliente
  const sigClientX = margin + contentWidth - sigW - 5;
  doc.line(sigClientX, yPos, sigClientX + sigW, yPos);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(client, sigClientX + sigW / 2, yPos + 4.5, { align: 'center' });
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Ciente e De Acordo', sigClientX + sigW / 2, yPos + 8.5, { align: 'center' });

  const filename = `Proposta_Germanica_${client.replace(/[/\\?%*:|"<>]/g, '_')}_${params.credito}.pdf`;
  const blob = doc.output('blob');

  return {
    doc,
    blob,
    filename,
  };
}

export function generateGermanicaPdf(
  res: GermanicaCalculationResult,
  options: GeneratePdfOptions = {}
): void {
  const { doc, filename } = createGermanicaPdfDoc(res, options);
  doc.save(filename);
}
