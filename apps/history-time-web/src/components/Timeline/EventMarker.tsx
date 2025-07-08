import React from 'react';
import { EventMarkerProps } from './types';

export const EventMarker: React.FC<EventMarkerProps> = ({
  event,
  onClick,
  selected = false,
  style = {},
}) => {
  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onClick?.(event);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <div
      className={`event-marker-container ${selected ? 'selected' : ''}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        ...style,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="event-marker"
        aria-label={`${event.title} - ${event.date.toLocaleDateString()}`}
        aria-pressed={selected}
        style={{
          width: selected ? 16 : 12,
          height: selected ? 16 : 12,
          borderRadius: '50%',
          backgroundColor: event.color || '#007bff',
          border: selected ? '2px solid #fff' : 'none',
          boxShadow: selected ? '0 0 0 2px #007bff' : '0 2px 4px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          transform: selected ? 'scale(1.2)' : 'scale(1)',
        }}
      />

      <div
        className="event-tooltip"
        role="tooltip"
        style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%) translateY(-8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '14px',
          whiteSpace: 'nowrap',
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.2s ease',
        }}
      >
        <div style={{ fontWeight: 'bold' }}>{event.title}</div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>{event.date.toLocaleDateString()}</div>
        {event.description && (
          <div
            style={{ fontSize: '12px', marginTop: '4px', maxWidth: '200px', whiteSpace: 'normal' }}
          >
            {event.description}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid rgba(0, 0, 0, 0.9)',
          }}
        />
      </div>
    </div>
  );
};

export default EventMarker;
