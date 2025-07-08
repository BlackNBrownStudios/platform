import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TimelineProps, TimelineEvent } from './types';
import EventMarker from './EventMarker';

export const TimelineWithControls: React.FC<TimelineProps> = ({
  events = [],
  startDate,
  endDate,
  height = 600,
  width,
  onEventClick,
  onZoomChange,
  onPanChange,
  className = '',
  showGrid = true,
  gridInterval = 'year',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(width || 0);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, offset: 0 });
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

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
    return (eventTime / timeSpan) * effectiveWidth;
  };

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      const newScale = Math.min(Math.max(0.5, scale + delta), 5);

      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const scaleDiff = newScale - scale;
        const newOffset = offset - mouseX * scaleDiff;

        setScale(newScale);
        setOffset(newOffset);
        onZoomChange?.(newScale);
        onPanChange?.(newOffset);
      }
    },
    [scale, offset, onZoomChange, onPanChange]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX, offset });
    },
    [offset]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const newOffset = dragStart.offset + deltaX;
        setOffset(newOffset);
        onPanChange?.(newOffset);
      }
    },
    [isDragging, dragStart, onPanChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event.id);
    onEventClick?.(event);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = 50;
    switch (e.key) {
      case 'ArrowLeft':
        setOffset(offset + step);
        break;
      case 'ArrowRight':
        setOffset(offset - step);
        break;
      case '+':
      case '=':
        setScale(Math.min(5, scale + 0.1));
        break;
      case '-':
        setScale(Math.max(0.5, scale - 0.1));
        break;
    }
  };

  const renderGrid = () => {
    const gridLines = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const position = getEventPosition(currentDate);
      gridLines.push(
        <div
          key={currentDate.getTime()}
          style={{
            position: 'absolute',
            left: position,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: 'rgba(200, 200, 200, 0.3)',
          }}
        >
          <span
            style={{
              position: 'absolute',
              bottom: 70,
              left: 4,
              fontSize: '12px',
              color: '#666',
            }}
          >
            {currentDate.getFullYear()}
          </span>
        </div>
      );

      currentDate.setFullYear(currentDate.getFullYear() + 1);
    }

    return gridLines;
  };

  return (
    <div className={`timeline-with-controls ${className}`}>
      <div
        className="timeline-controls"
        style={{
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          marginBottom: '10px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => setScale(Math.min(5, scale + 0.5))}
          aria-label="Zoom in"
          style={{
            padding: '5px 10px',
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
          }}
        >
          +
        </button>
        <button
          onClick={() => setScale(Math.max(0.5, scale - 0.5))}
          aria-label="Zoom out"
          style={{
            padding: '5px 10px',
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
          }}
        >
          -
        </button>
        <button
          onClick={() => {
            setScale(1);
            setOffset(0);
          }}
          aria-label="Reset view"
          style={{
            padding: '5px 10px',
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
          }}
        >
          Reset
        </button>
        <span style={{ fontSize: '14px', color: '#666' }}>Zoom: {Math.round(scale * 100)}%</span>
      </div>

      <div
        ref={containerRef}
        className="timeline-container"
        style={{
          height,
          width,
          overflow: 'hidden',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#fff',
        }}
        role="region"
        aria-label="Interactive historical timeline with zoom and pan controls"
        tabIndex={0}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onKeyDown={handleKeyDown}
      >
        <div
          className="timeline-content"
          style={{
            transform: `translateX(${offset}px) scaleX(${scale})`,
            transformOrigin: 'left center',
            height: '100%',
            position: 'relative',
            transition: isDragging ? 'none' : 'transform 0.1s ease',
          }}
        >
          {showGrid && renderGrid()}

          <div
            className="timeline-axis"
            style={{
              position: 'absolute',
              bottom: 100,
              left: 0,
              width: effectiveWidth,
              height: 2,
              backgroundColor: '#333',
            }}
          />

          {events.map((event) => (
            <div
              key={event.id}
              style={{
                position: 'absolute',
                left: getEventPosition(event.date),
                bottom: 90,
                transform: 'translateX(-50%)',
              }}
            >
              <EventMarker
                event={event}
                onClick={handleEventClick}
                selected={selectedEvent === event.id}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineWithControls;
