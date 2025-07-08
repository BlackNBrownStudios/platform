import React, { useState } from 'react';
import { TimelineWithControls } from './TimelineWithControls';
import { TimelineEvent } from './types';

const sampleEvents: TimelineEvent[] = [
  {
    id: '1',
    title: 'American Revolution',
    description: 'Declaration of Independence signed',
    date: new Date('1776-07-04'),
    color: '#ff6b6b',
    category: 'politics',
  },
  {
    id: '2',
    title: 'French Revolution',
    description: 'Storming of the Bastille',
    date: new Date('1789-07-14'),
    color: '#4ecdc4',
    category: 'politics',
  },
  {
    id: '3',
    title: 'Industrial Revolution',
    description: 'Steam engine invention',
    date: new Date('1712-01-01'),
    color: '#45b7d1',
    category: 'technology',
  },
  {
    id: '4',
    title: 'American Civil War',
    description: 'War begins at Fort Sumter',
    date: new Date('1861-04-12'),
    color: '#f7b731',
    category: 'war',
  },
  {
    id: '5',
    title: 'World War I',
    description: 'Assassination of Archduke Franz Ferdinand',
    date: new Date('1914-06-28'),
    color: '#5f27cd',
    category: 'war',
  },
  {
    id: '6',
    title: 'World War II',
    description: 'Germany invades Poland',
    date: new Date('1939-09-01'),
    color: '#00d2d3',
    category: 'war',
  },
  {
    id: '7',
    title: 'Moon Landing',
    description: 'Apollo 11 lands on the moon',
    date: new Date('1969-07-20'),
    color: '#54a0ff',
    category: 'technology',
  },
  {
    id: '8',
    title: 'Fall of Berlin Wall',
    description: 'End of Cold War era',
    date: new Date('1989-11-09'),
    color: '#48dbfb',
    category: 'politics',
  },
];

export const TimelineDemo: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Historical Timeline Demo</h1>

      <TimelineWithControls
        events={sampleEvents}
        startDate={new Date('1700-01-01')}
        endDate={new Date('2000-01-01')}
        height={400}
        onEventClick={handleEventClick}
        showGrid={true}
        gridInterval="year"
      />

      {selectedEvent && (
        <div
          style={{
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
          }}
        >
          <h2 style={{ marginBottom: '10px' }}>{selectedEvent.title}</h2>
          <p style={{ marginBottom: '5px' }}>
            <strong>Date:</strong> {selectedEvent.date.toLocaleDateString()}
          </p>
          {selectedEvent.description && (
            <p style={{ marginBottom: '5px' }}>
              <strong>Description:</strong> {selectedEvent.description}
            </p>
          )}
          {selectedEvent.category && (
            <p style={{ marginBottom: '5px' }}>
              <strong>Category:</strong> {selectedEvent.category}
            </p>
          )}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h3>Instructions:</h3>
        <ul>
          <li>Use mouse wheel to zoom in/out</li>
          <li>Click and drag to pan the timeline</li>
          <li>Click on events to see details</li>
          <li>Use keyboard arrows to navigate (Tab for events, Arrow keys for pan)</li>
          <li>Press + / - keys to zoom</li>
        </ul>
      </div>
    </div>
  );
};

export default TimelineDemo;
