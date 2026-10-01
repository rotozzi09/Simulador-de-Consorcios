export type TipoPlano = '50%' | '75%' | '100%';
export type TipoLance = 'Livre' | 'Fixo';

export interface GermanicaParams {
  credito: number; // ex: 90000
  prazoMeses: number; // ex: 84
  taxaAdmPercent: number; // ex: 17.0
  tipoPlano: TipoPlano; // ex: '75%'
  vendaComSeguro: boolean; // ex: true
  seguroPercentMensal: number; // ex: 0.08168%

  // Lance
  lanceProprioValor: number; // R$
  lanceProprioPercent: number; // %
  tipoLance: TipoLance; // 'Livre' | 'Fixo'
  usarLanceEmbutido: boolean; // Sim | Nao
  embutidoPercent: number; // ex: 25%
  parcelasPagasAteLance: number; // ex: 1
}

export interface GermanicaCalculationResult {
  params: GermanicaParams;
  
  // Base Categoria & Taxas
  valorTaxaAdm: number;
  valorCategoria: number;
  valorSeguroMensal: number;
  seguroTotal: number;
  valorCategoriaMaisSeguro: number;
  creditoReduzido: number;
  
  // Parcela Inicial
  parcelaIntegral: number;
  parcelaSimulacao: number; // com plano reduzido (75% ou 50%) e seguro
  limite50Percent: number;

  // Lances
  lanceEmbutidoValor: number;
  lanceProprioEfetivo: number;
  lanceTotalCalculo: number;
  lanceTotalPercentSobreCredito: number;
  creditoPosContemplacao: number;

  // Regras Disal 25%
  regra25LanceProprio: number;
  embutidoLivre: number; // 25% sobre Crédito
  embutidoFixo: number; // 25% sobre Categoria
  difLanceSobreCategoria: number;
  lanceSiteDisalPercent: number;

  // Pós Contemplação
  saldoDevedorAposParcelasPagas: number;
  saldoDevedorAposLance: number;
  
  // Opção 1: Manter Mesmo Prazo (Reduzir Parcela)
  prazoRestante: number;
  parcelaPosContemplacaoMesmoPrazo: number;

  // Opção 2: Reduzir Prazo (Manter Parcela)
  novoPrazoPosLance: number;
  mesesEconomizados: number;
}
