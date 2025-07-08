export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  color?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface TimelineProps {
  events: TimelineEvent[];
  startDate: Date;
  endDate: Date;
  height?: number;
  width?: number;
  onEventClick?: (event: TimelineEvent) => void;
  onZoomChange?: (scale: number) => void;
  onPanChange?: (offset: number) => void;
  className?: string;
  showGrid?: boolean;
  gridInterval?: 'year' | 'month' | 'day';
}

export interface EventMarkerProps {
  event: TimelineEvent;
  onClick?: (event: TimelineEvent) => void;
  selected?: boolean;
  style?: React.CSSProperties;
}
