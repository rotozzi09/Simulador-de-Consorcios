import { GermanicaParams, GermanicaCalculationResult } from '../types/germanica';

export function formatBRL(value: number): string {
  if (value === 0) return 'R$ -';
  if (isNaN(value) || !isFinite(value)) return 'R$ -';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 4): string {
  if (isNaN(value) || !isFinite(value)) return '0,0000%';
  return `${value.toFixed(decimals).replace('.', ',')}%`;
}

export function calculateGermanica(params: GermanicaParams): GermanicaCalculationResult {
  const {
    credito,
    prazoMeses,
    taxaAdmPercent,
    tipoPlano,
    vendaComSeguro,
    seguroPercentMensal,
    lanceProprioValor,
    lanceProprioPercent,
    tipoLance,
    usarLanceEmbutido,
    embutidoPercent,
    parcelasPagasAteLance,
  } = params;

  // 1. Taxa Adm e Valor Categoria
  const valorTaxaAdm = credito * (taxaAdmPercent / 100);
  const valorCategoria = credito + valorTaxaAdm;

  // 2. Seguro (Exatamente 0,0816801% ao mês sobre a categoria)
  const percentSeguroEfetivo = seguroPercentMensal || 0.0816801;
  const valorSeguroMensal = vendaComSeguro
    ? valorCategoria * (percentSeguroEfetivo / 100)
    : 0;
  const seguroTotal = valorSeguroMensal * prazoMeses;
  const valorCategoriaMaisSeguro = valorCategoria + seguroTotal;

  // 3. Plano Reduzido (50%, 75% ou 100%)
  const planoFator = tipoPlano === '50%' ? 0.5 : tipoPlano === '75%' ? 0.75 : 1.0;
  const creditoReduzido = credito * planoFator;

  // 4. Parcela Simulação Inicial
  const parcelaFundoComumInicial = creditoReduzido / prazoMeses;
  const parcelaTaxaAdmInicial = valorTaxaAdm / prazoMeses;
  const parcelaSimulacao = parcelaFundoComumInicial + parcelaTaxaAdmInicial + valorSeguroMensal;

  // Parcela Integral e Limite dos 50%
  const parcelaIntegral = valorCategoria / prazoMeses;
  const limite50Percent = parcelaIntegral * 0.5;

  // 5. Lances
  const lanceEmbutidoValor = usarLanceEmbutido ? credito * ((embutidoPercent || 25) / 100) : 0;
  
  const lanceProprioEfetivo =
    lanceProprioValor > 0
      ? lanceProprioValor
      : lanceProprioPercent > 0
      ? (credito * lanceProprioPercent) / 100
      : 0;

  const lanceTotalCalculo = lanceProprioEfetivo + lanceEmbutidoValor;
  const lanceTotalPercentSobreCredito = credito > 0 ? (lanceTotalCalculo / credito) * 100 : 0;

  // Crédito Pós Contemplação (Aproximado)
  const creditoPosContemplacao = credito - lanceEmbutidoValor;

  // 6. Regras Específicas Germânica / Disal
  const regra25LanceProprio = credito * 0.25;
  const embutidoLivre = credito * 0.25; // 25% sobre Crédito
  const embutidoFixo = valorCategoria * 0.25; // 25% sobre Categoria
  const difLanceSobreCategoria = lanceProprioEfetivo - embutidoFixo;
  const lanceSiteDisalPercent = valorCategoria > 0 ? (lanceTotalCalculo / valorCategoria) * 100 : 0;

  // 7. Saldo Devedor & Pós Contemplação
  const parcelasPagas = Math.max(1, parcelasPagasAteLance || 1);
  const totalJaPago = parcelaSimulacao * parcelasPagas;
  const saldoDevedorAposParcelasPagas = Math.max(0, valorCategoriaMaisSeguro - totalJaPago);
  const saldoDevedorAposLance = Math.max(0, saldoDevedorAposParcelasPagas - lanceTotalCalculo);

  // Opção 1: Manter mesmo prazo
  const prazoRestante = Math.max(1, prazoMeses - parcelasPagas);
  const parcelaPosContemplacaoMesmoPrazo =
    prazoRestante > 0 ? saldoDevedorAposLance / prazoRestante : 0;

  // Opção 2: Reduzir prazo
  const novoPrazoPosLance =
    parcelaPosContemplacaoMesmoPrazo > 0
      ? Math.round(saldoDevedorAposLance / parcelaPosContemplacaoMesmoPrazo)
      : prazoRestante;
  const mesesEconomizados = Math.max(0, prazoRestante - novoPrazoPosLance);

  return {
    params,
    valorTaxaAdm,
    valorCategoria,
    valorSeguroMensal,
    seguroTotal,
    valorCategoriaMaisSeguro,
    creditoReduzido,
    parcelaIntegral,
    parcelaSimulacao,
    limite50Percent,
    lanceEmbutidoValor,
    lanceProprioEfetivo,
    lanceTotalCalculo,
    lanceTotalPercentSobreCredito,
    creditoPosContemplacao,
    regra25LanceProprio,
    embutidoLivre,
    embutidoFixo,
    difLanceSobreCategoria,
    lanceSiteDisalPercent,
    saldoDevedorAposParcelasPagas,
    saldoDevedorAposLance,
    prazoRestante,
    parcelaPosContemplacaoMesmoPrazo,
    novoPrazoPosLance,
    mesesEconomizados,
  };
}
