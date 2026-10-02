import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  X,
  WifiOff,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, promptInstall } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>(isIOS ? 'ios' : 'android');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto no-print">
      <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-[#0f172a] text-white p-5 sm:p-6 space-y-5 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src="/icon-192.png"
              alt="Volkswagen Germânica"
              className="w-11 h-11 object-contain drop-shadow-md shrink-0"
            />
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <span>Instalar App & Uso Offline</span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PWA OFFLINE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Acesse o Simulador Germânica sem internet no Android e iPhone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Offline */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-0.5">
            <strong className="text-emerald-300 block font-bold">Suporte Offline 100% Ativo:</strong>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Todos os cálculos, fórmulas Germânica/Disal e a geração de PDF funcionam diretamente no seu aparelho, mesmo sem sinal ou no modo avião.
            </p>
          </div>
        </div>

        {/* Seletor Android / iPhone */}
        <div className="flex rounded-xl p-1 bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'android'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📱 Celular Android</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🍏 iPhone / iPad (iOS)</span>
          </button>
        </div>

        {/* Conteúdo Android */}
        {activeTab === 'android' && (
          <div className="space-y-4 text-xs">
            {isInstallable && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-slate-900 border border-amber-500/40 space-y-2.5">
                <div className="font-black text-amber-300 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Instalação Automática em 1 Clique</span>
                </div>
                <p className="text-slate-300 text-xs">
                  Seu navegador permite instalar o aplicativo diretamente na tela inicial com ícone próprio:
                </p>
                <button
                  onClick={async () => {
                    await promptInstall();
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar Aplicativo Agora</span>
                </button>
              </div>
            )}

            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Passo a Passo Manual no Android (Google Chrome):
              </h4>
              <ol className="space-y-2 text-slate-300 text-xs list-none">
                <li className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                  <span>Abra este link no navegador <strong>Google Chrome</strong> do seu Android.</span>
                </li>
                <li className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                  <span>Toque no <strong>menu de 3 pontinhos (⋮)</strong> no canto superior direito.</span>
                </li>
                <li className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                  <span>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Conteúdo iPhone (iOS Safari) */}
        {activeTab === 'ios' && (
          <div className="space-y-3.5 text-xs">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
              Passo a Passo no iPhone / iPad (Navegador Safari):
            </h4>
            <ol className="space-y-2 text-slate-300 text-xs list-none">
              <li className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                <div>
                  Abra este link no <strong>Safari</strong> do iPhone e toque no botão <strong>Compartilhar</strong> (ícone com uma seta para cima <Share2 className="w-3.5 h-3.5 inline text-amber-400 mx-1" /> na barra inferior).
                </div>
              </li>
              <li className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                <div>
                  Role o menu para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-amber-400 mx-1" />).
                </div>
              </li>
              <li className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                <div>
                  Toque em <strong>"Adicionar"</strong> no canto superior direito. O ícone <strong>Germânica</strong> ficará salvo como app nativo!
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Rodapé do Modal */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
