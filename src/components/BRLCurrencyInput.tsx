import React, { useState, useEffect, useRef } from 'react';

interface BRLCurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  autoSelectOnFocus?: boolean;
  'aria-label'?: string;
}

/**
 * Formata um número para o padrão de moeda brasileiro (BRL)
 * Ex: 90000 -> "90.000,00"
 */
export function formatToBRL(val: number, includeDecimals = true): string {
  if (val === undefined || val === null || isNaN(val) || val === 0) return '';
  return val.toLocaleString('pt-BR', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Converte string digitada com pontos e vírgula para número Float
 * Ex: "90.000,50" -> 90000.5
 */
export function parseBRLToNumber(str: string): number {
  if (!str) return 0;
  // Remove tudo exceto números e vírgula/ponto
  const cleaned = str.replace(/[^\d.,]/g, '');
  if (!cleaned) return 0;

  // Se tiver vírgula, tratamos como separador decimal
  if (cleaned.includes(',')) {
    const parts = cleaned.split(',');
    const integerPart = parts[0].replace(/\./g, '');
    const decimalPart = (parts[1] || '').slice(0, 2);
    const combined = `${integerPart || '0'}.${decimalPart}`;
    const num = parseFloat(combined);
    return isNaN(num) ? 0 : num;
  }

  // Se tiver apenas ponto e for formato de milhar (ex: 90.000)
  const integerOnly = cleaned.replace(/\./g, '');
  const num = parseFloat(integerOnly);
  return isNaN(num) ? 0 : num;
}

/**
 * Formata enquanto o usuário digita (adicionando pontos de milhar e mantendo vírgula decimal)
 */
function formatWhileTyping(rawInput: string): { formatted: string; numericValue: number } {
  if (!rawInput || rawInput.trim() === '') {
    return { formatted: '', numericValue: 0 };
  }

  // Substitui ponto por vírgula se o usuário digitou ponto no final (ex: "90000.")
  let normalized = rawInput.replace(/\./g, (match, offset, fullStr) => {
    // Se for o último caractere ou próximo do final com 1 ou 2 dígitos, pode ser decimal digitado com ponto
    if (offset === fullStr.length - 1 || offset >= fullStr.length - 3) {
      return ',';
    }
    return '';
  });

  // Se houver mais de uma vírgula, mantém só a primeira
  const commaIndex = normalized.indexOf(',');
  let integerDigits = '';
  let decimalDigits: string | null = null;

  if (commaIndex !== -1) {
    integerDigits = normalized.slice(0, commaIndex).replace(/\D/g, '');
    decimalDigits = normalized.slice(commaIndex + 1).replace(/\D/g, '').slice(0, 2);
  } else {
    integerDigits = normalized.replace(/\D/g, '');
  }

  if (!integerDigits && decimalDigits === null) {
    return { formatted: '', numericValue: 0 };
  }

  // Formata a parte inteira com pontos de milhar
  let formattedInteger = '';
  if (integerDigits) {
    const numInt = parseInt(integerDigits, 10);
    if (!isNaN(numInt)) {
      formattedInteger = numInt.toLocaleString('pt-BR');
    }
  }

  let formatted = formattedInteger;
  let numericValue = 0;

  if (decimalDigits !== null) {
    formatted = `${formattedInteger || '0'},${decimalDigits}`;
    numericValue = parseFloat(`${integerDigits || '0'}.${decimalDigits}`);
  } else {
    numericValue = integerDigits ? parseInt(integerDigits, 10) : 0;
  }

  return {
    formatted,
    numericValue: isNaN(numericValue) ? 0 : numericValue,
  };
}

export const BRLCurrencyInput: React.FC<BRLCurrencyInputProps> = ({
  value,
  onChange,
  placeholder = '0,00',
  className = '',
  min,
  max,
  autoSelectOnFocus = true,
  'aria-label': ariaLabel,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    return value && value > 0 ? formatToBRL(value, true) : '';
  });
  const isFocusedRef = useRef(false);

  // Sincroniza se o valor externo mudar enquanto o input não estiver focado
  useEffect(() => {
    if (!isFocusedRef.current) {
      setDisplayValue(value && value > 0 ? formatToBRL(value, true) : '');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    
    // Se o campo foi completamente apagado
    if (!raw || raw.trim() === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    const { formatted, numericValue } = formatWhileTyping(raw);
    
    // Valida limites se fornecidos
    let finalValue = numericValue;
    if (max !== undefined && finalValue > max) {
      finalValue = max;
    }

    setDisplayValue(formatted);
    onChange(finalValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = true;
    if (autoSelectOnFocus) {
      e.target.select();
    }
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    // Ao sair do campo, formata com as 2 casas decimais completas se houver valor
    if (value && value > 0) {
      setDisplayValue(formatToBRL(value, true));
    } else {
      setDisplayValue('');
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      placeholder={placeholder}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-label={ariaLabel}
      className={className}
    />
  );
};
