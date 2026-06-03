import React from 'react'

/**
 * LoanSparkline - A lightweight, pure SVG sparkline component for CredLayer AI.
 * 
 * Props:
 * @param {number[]} data - Array of numerical values to plot
 * @param {string} [color="green"] - Color theme: "green", "amber", or "red"
 * @param {string} [label] - Optional metric label (renders inside a card container if passed)
 * @param {string|number} [value] - Optional metric value (renders inside a card container if passed)
 * @param {string} [delta] - Optional delta percentage badge, e.g. "↑ 8.3%" (renders inside a card container if passed)
 */
const LoanSparkline = ({
  data = [],
  color = 'green',
  label,
  value,
  delta,
  className = ''
}) => {
  // Parse and validate data array
  const parsedData = Array.isArray(data) ? data : [];
  if (parsedData.length === 0) {
    return null;
  }
  
  // Handle single-item arrays by duplicating the value to render a flat line
  const finalData = parsedData.length === 1 ? [parsedData[0], parsedData[0]] : parsedData;

  // Determine min, max and range for normalization
  const minVal = Math.min(...finalData);
  const maxVal = Math.max(...finalData);
  const range = maxVal - minVal;

  // Color tokens and theme configurations compatible with light/dark modes
  const colorConfig = {
    green: {
      stroke: '#1D9E75',
      gradient: '#1D9E75',
      badgeBg: 'rgba(29, 158, 117, 0.08)',
      badgeText: '#1D9E75'
    },
    amber: {
      stroke: '#EF9F27',
      gradient: '#EF9F27',
      badgeBg: 'rgba(239, 159, 39, 0.08)',
      badgeText: '#EF9F27'
    },
    red: {
      stroke: '#E24B4A',
      gradient: '#E24B4A',
      badgeBg: 'rgba(226, 75, 74, 0.08)',
      badgeText: '#E24B4A'
    }
  };

  const config = colorConfig[color] || colorConfig.green;

  // Normalization parameters: Map data values to Y-range [4, 50] inside viewBox Y [0, 54]
  // Note: Y=0 is the top of the SVG viewport, and Y=54 is the bottom.
  const points = finalData.map((val, idx) => {
    const x = (idx * 220) / (finalData.length - 1);
    const y = range === 0 ? 27 : 50 - ((val - minVal) / range) * 46;
    return { x, y };
  });

  // Construct SVG paths
  const linePath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');
  
  const areaPath = `${linePath} L 220 54 L 0 54 Z`;
  const lastPoint = points[points.length - 1];

  // Generate unique gradient ID to avoid collisions
  const gradientId = React.useMemo(
    () => `sparkline-gradient-${color}-${Math.random().toString(36).substr(2, 9)}`,
    [color]
  );

  const renderSparkline = () => (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg
        viewBox="0 0 220 54"
        width="100%"
        style={{ overflow: 'visible', display: 'block', marginBottom: '8px' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={config.gradient} stopOpacity={0.18} />
            <stop offset="100%" stopColor={config.gradient} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Shaded Area Under Sparkline */}
        <path
          d={areaPath}
          fill={`url(#${gradientId})`}
        />

        {/* Stroke Line */}
        <path
          d={linePath}
          fill="none"
          stroke={config.stroke}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current/Last Point Indicator Dot */}
        {lastPoint && (
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={3}
            fill={config.stroke}
          />
        )}

        {/* X-Axis Labels */}
        <text x="0" y="66" fontSize="9" fill="var(--color-text-secondary, #71717a)" style={{ opacity: 0.6, fontWeight: 500 }} textAnchor="start">0h</text>
        <text x="110" y="66" fontSize="9" fill="var(--color-text-secondary, #71717a)" style={{ opacity: 0.6, fontWeight: 500 }} textAnchor="middle">12h</text>
        <text x="220" y="66" fontSize="9" fill="var(--color-text-secondary, #71717a)" style={{ opacity: 0.6, fontWeight: 500 }} textAnchor="end">24h</text>
      </svg>
    </div>
  );

  // Check if we should wrap in the premium card style
  const isCard = label !== undefined || value !== undefined || delta !== undefined;

  if (isCard) {
    return (
      <article
        className={`loan-stat-card ${className}`}
        style={{
          background: 'var(--color-background-primary, #ffffff)',
          border: '0.5px solid var(--color-border-tertiary, rgba(0, 0, 0, 0.08))',
          borderRadius: '12px',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.01)'
        }}
      >
        {label && (
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary, #71717a)',
              letterSpacing: '0.05em',
              fontWeight: 700,
              marginBottom: '6px'
            }}
          >
            {label}
          </span>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}
        >
          {value && (
            <span
              style={{
                fontSize: '22px',
                fontWeight: 600,
                color: 'var(--color-text-primary, #0f172a)',
                letterSpacing: '-0.02em'
              }}
            >
              {value}
            </span>
          )}
          {delta && (
            <span
              style={{
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '20px',
                backgroundColor: config.badgeBg,
                color: config.badgeText,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              {delta}
            </span>
          )}
        </div>
        <div style={{ width: '100%', marginTop: '12px', paddingBottom: '16px' }}>
          {renderSparkline()}
        </div>
      </article>
    );
  }

  return renderSparkline();
};

export default LoanSparkline;
