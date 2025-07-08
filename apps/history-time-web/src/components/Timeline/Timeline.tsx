import React, { useRef, useState, useEffect } from 'react';
import { TimelineProps, TimelineEvent } from './types';
import styles from './Timeline.module.css';

export const Timeline: React.FC<TimelineProps> = ({
  events = [],
  startDate,
  endDate,
  height = 600,
  width,
  onEventClick,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(width || 0);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!width && containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });

      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [width]);

  const effectiveWidth = width || containerWidth;
  const timeSpan = endDate.getTime() - startDate.getTime();

  const getEventPosition = (date: Date): number => {
    const eventTime = date.getTime() - startDate.getTime();
    return (eventTime / timeSpan) * effectiveWidth * scale + offset;
  };

  return (
    <div
      ref={containerRef}
      className={`timeline-container ${className}`}
      style={{ height, width, overflow: 'hidden', position: 'relative' }}
      role="region"
      aria-label="Historical timeline"
    >
      <div
        className="timeline-content"
        style={{
          transform: `translateX(${offset}px) scaleX(${scale})`,
          transformOrigin: 'left center',
          height: '100%',
          position: 'relative',
        }}
      >
        <div
          className="timeline-axis"
          style={{
            position: 'absolute',
            bottom: 100,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: '#333',
          }}
        />

        {events.map((event) => (
          <div
            key={event.id}
            className="timeline-event"
            style={{
              position: 'absolute',
              left: getEventPosition(event.date),
              bottom: 90,
              transform: 'translateX(-50%)',
            }}
            onClick={() => onEventClick?.(event)}
            role="button"
            tabIndex={0}
            aria-label={`Event: ${event.title} on ${event.date.toLocaleDateString()}`}
          >
            <div
              className="event-marker"
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: event.color || '#007bff',
                cursor: 'pointer',
              }}
            />
            <div
              className="event-label"
              style={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                fontSize: '12px',
                pointerEvents: 'none',
              }}
            >
              {event.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
