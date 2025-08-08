import React from 'react';

interface CustomToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const CustomToggle: React.FC<CustomToggleProps> = ({ 
  id, 
  checked, 
  onChange, 
  className = "" 
}) => {
  // Determine if compact mode is enabled
  const isCompact = className.includes('toggler-compact');
  
  // Set dimensions based on compact mode
  const containerWidth = isCompact ? '48px' : '56px';
  const containerHeight = isCompact ? '24px' : '28px';
  const circleSize = isCompact ? '16px' : '20px';
  const leftPosition = checked ? (isCompact ? 'calc(100% - 20px)' : 'calc(100% - 24px)') : '4px';

  return (
    <div className={`toggler ${className}`} style={{ display: 'block', position: 'relative' }}>
      <input 
        id={id} 
        name={id} 
        type="checkbox" 
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ display: 'none' }}
      />
      <label htmlFor={id} style={{ 
        display: 'block', 
        position: 'relative', 
        width: containerWidth, 
        height: containerHeight, 
        border: '1px solid #d1d5db', 
        borderRadius: containerHeight, 
        background: '#f3f4f6', 
        cursor: 'pointer',
        transition: 'all 0.15s ease-in-out'
      }}>
        <svg className="toggler-on" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2" style={{ 
          position: 'absolute', 
          top: '50%', 
          left: checked ? (isCompact ? 'calc(100% - 20px)' : 'calc(100% - 24px)') : '4px', 
          width: circleSize, 
          height: circleSize, 
          transform: 'translateY(-50%)', 
          opacity: checked ? 1 : 0, 
          transition: 'all 0.15s ease-in-out' 
        }}>
          <polyline className="path check" points="100.2,40.2 51.5,88.8 29.8,67.5" style={{ fill: 'none', stroke: '#ffffff', strokeWidth: '4px', strokeLinecap: 'round', strokeMiterlimit: 10 }}></polyline>
        </svg>
        <svg className="toggler-off" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2" style={{ 
          position: 'absolute', 
          top: '50%', 
          left: checked ? (isCompact ? 'calc(100% - 20px)' : 'calc(100% - 24px)') : '4px', 
          width: circleSize, 
          height: circleSize, 
          transform: 'translateY(-50%)', 
          opacity: checked ? 0 : 1, 
          transition: 'all 0.15s ease-in-out' 
        }}>
          <line className="path line" x1="34.4" y1="34.4" x2="95.8" y2="95.8" style={{ fill: 'none', stroke: '#ffffff', strokeWidth: '4px', strokeLinecap: 'round', strokeMiterlimit: 10 }}></line>
          <line className="path line" x1="95.8" y1="34.4" x2="34.4" y2="95.8" style={{ fill: 'none', stroke: '#ffffff', strokeWidth: '4px', strokeLinecap: 'round', strokeMiterlimit: 10 }}></line>
        </svg>
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: leftPosition, 
          width: circleSize, 
          height: circleSize, 
          borderRadius: '50%', 
          background: checked ? '#22c55e' : '#ef4444', 
          transform: 'translateY(-50%)', 
          transition: 'all 0.15s ease-in-out' 
        }}></div>
      </label>
    </div>
  );
};
