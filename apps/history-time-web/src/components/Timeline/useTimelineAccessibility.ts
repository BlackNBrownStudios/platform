import { useEffect, useRef, useCallback } from 'react';
import { TimelineEvent } from './types';

interface UseTimelineAccessibilityProps {
  events: TimelineEvent[];
  onEventSelect?: (event: TimelineEvent) => void;
  containerRef: React.RefObject<HTMLElement>;
}

export const useTimelineAccessibility = ({
  events,
  onEventSelect,
  containerRef,
}: UseTimelineAccessibilityProps) => {
  const currentEventIndex = useRef(0);
  const announcementRef = useRef<HTMLDivElement | null>(null);

  const announceEvent = useCallback((event: TimelineEvent) => {
    if (announcementRef.current) {
      const announcement = `${event.title}, ${event.date.toLocaleDateString()}${
        event.description ? `, ${event.description}` : ''
      }`;
      announcementRef.current.textContent = announcement;
    }
  }, []);

  const navigateToEvent = useCallback(
    (direction: 'next' | 'previous') => {
      if (events.length === 0) return;

      if (direction === 'next') {
        currentEventIndex.current = (currentEventIndex.current + 1) % events.length;
      } else {
        currentEventIndex.current =
          currentEventIndex.current === 0 ? events.length - 1 : currentEventIndex.current - 1;
      }

      const event = events[currentEventIndex.current];
      announceEvent(event);
      onEventSelect?.(event);

      // Focus the event marker
      const eventElement = containerRef.current?.querySelector(
        `[aria-label*="${event.title}"]`
      ) as HTMLElement;
      eventElement?.focus();
    },
    [events, announceEvent, onEventSelect, containerRef]
  );

  const handleKeyboardNavigation = useCallback(
    (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case 'Tab':
          if (e.shiftKey) {
            e.preventDefault();
            navigateToEvent('previous');
          } else {
            e.preventDefault();
            navigateToEvent('next');
          }
          break;
        case 'Home':
          e.preventDefault();
          currentEventIndex.current = 0;
          const firstEvent = events[0];
          if (firstEvent) {
            announceEvent(firstEvent);
            onEventSelect?.(firstEvent);
          }
          break;
        case 'End':
          e.preventDefault();
          currentEventIndex.current = events.length - 1;
          const lastEvent = events[events.length - 1];
          if (lastEvent) {
            announceEvent(lastEvent);
            onEventSelect?.(lastEvent);
          }
          break;
        case 'Escape':
          e.preventDefault();
          containerRef.current?.focus();
          break;
      }
    },
    [events, navigateToEvent, announceEvent, onEventSelect, containerRef]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardNavigation);
    return () => document.removeEventListener('keydown', handleKeyboardNavigation);
  }, [handleKeyboardNavigation]);

  // Create screen reader announcement element
  useEffect(() => {
    if (!announcementRef.current) {
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.style.width = '1px';
      announcement.style.height = '1px';
      announcement.style.overflow = 'hidden';
      document.body.appendChild(announcement);
      announcementRef.current = announcement;
    }

    return () => {
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current);
        announcementRef.current = null;
      }
    };
  }, []);

  return {
    navigateToEvent,
    announceEvent,
    currentEventIndex: currentEventIndex.current,
  };
};
