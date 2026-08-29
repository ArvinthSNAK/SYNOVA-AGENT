import React, { useState } from 'react';

// Maps various naming patterns from API/mock gateways to asset IDs
export const getInsurerAssetId = (insurerName = '') => {
  const name = String(insurerName).toLowerCase();
  if (name.includes('icici')) return 'icici';
  if (name.includes('tata')) return 'tata';
  if (name.includes('hdfc')) return 'hdfc';
  if (name.includes('acko')) return 'acko';
  if (name.includes('bajaj')) return 'bajaj';
  if (name.includes('niva') || name.includes('bupa')) return 'niva';
  if (name.includes('star')) return 'star';
  if (name.includes('care') || name.includes('religare')) return 'care';
  if (name.includes('aditya') || name.includes('birla')) return 'aditya';
  if (name.includes('max')) return 'max';
  if (name.includes('sbi')) return 'sbi';
  if (name.includes('digit')) return 'digit';
  if (name.includes('reliance')) return 'reliance';
  if (name.includes('sompo') || name.includes('universal')) return 'sompo';
  if (name.includes('generali') || name.includes('future')) return 'generali';
  return 'default';
};

export default function InsurerLogoBadge({ insurerName = '', size = 36, rounded = 10, style = {}, showBorder = true }) {
  const [useFallback, setUseFallback] = useState(false);
  const [hasError, setHasError] = useState(false);
  const id = getInsurerAssetId(insurerName);

  // Exact official insurer brand logo - use official vector SVGs for crisp precision
  const primaryExt = (id === 'acko' || id === 'icici' || id === 'hdfc' || id === 'tata') ? 'svg' : 'png';
  const fallbackExt = primaryExt === 'svg' ? 'png' : 'svg';
  const src = useFallback ? `/assets/insurers/${id}.${fallbackExt}` : `/assets/insurers/${id}.${primaryExt}`;

  if (!hasError && id !== 'default') {
    return (
      <div
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          borderRadius: rounded,
          background: '#FFFFFF',
          border: showBorder ? '1px solid rgba(11, 31, 58, 0.12)' : 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
          padding: size > 40 ? 4 : 2,
          ...style,
        }}
        title={insurerName}
      >
        <img
          src={src}
          alt={insurerName}
          onError={() => {
            if (!useFallback) {
              setUseFallback(true);
            } else {
              setHasError(true);
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
    );
  }

  // Fallback initial badge with distinctive brand gradients
  const getGradient = () => {
    switch (id) {
      case 'icici': return 'linear-gradient(135deg, #9C1D27 0%, #E65100 100%)';
      case 'tata': return 'linear-gradient(135deg, #005088 0%, #0077C8 100%)';
      case 'hdfc': return 'linear-gradient(135deg, #ED1C24 0%, #002D62 100%)';
      case 'acko': return 'linear-gradient(135deg, #5B5FEF 0%, #3B82F6 100%)';
      case 'bajaj': return 'linear-gradient(135deg, #005696 0%, #0088D4 100%)';
      case 'niva': return 'linear-gradient(135deg, #0079C1 0%, #78BE20 100%)';
      case 'star': return 'linear-gradient(135deg, #0B3082 0%, #FFC72C 100%)';
      case 'care': return 'linear-gradient(135deg, #E64A19 0%, #F57C00 100%)';
      case 'aditya': return 'linear-gradient(135deg, #A6192E 0%, #F58220 100%)';
      case 'max': return 'linear-gradient(135deg, #002855 0%, #F37021 100%)';
      case 'digit': return 'linear-gradient(135deg, #FF9800 0%, #212121 100%)';
      case 'sbi': return 'linear-gradient(135deg, #0A4C86 0%, #00A5E3 100%)';
      case 'reliance': return 'linear-gradient(135deg, #0D47A1 0%, #D32F2F 100%)';
      case 'sompo': return 'linear-gradient(135deg, #D91E2A 0%, #FFC72C 100%)';
      case 'generali': return 'linear-gradient(135deg, #C8102E 0%, #8A001A 100%)';
      default: return 'linear-gradient(135deg, #0B1F3A 0%, #1565C0 100%)';
    }
  };

  const initials = (insurerName || 'IN')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: rounded,
        background: getGradient(),
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: Math.max(10, Math.floor(size * 0.38)),
        letterSpacing: '-0.02em',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        ...style,
      }}
      title={insurerName}
    >
      {initials}
    </div>
  );
}
