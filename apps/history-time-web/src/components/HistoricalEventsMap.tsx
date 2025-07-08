/**
 * Historical Events Map Component
 * Displays historical events on an interactive map
 */
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, useTheme, Paper, Chip, Button } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { sharedApiService } from '@/services/sharedAdapter';
import { HistoricalEvent } from '@history-time/data-access';
import useMediaQuery from '@mui/material/useMediaQuery';

// Fix Leaflet marker icon issue in Next.js
// This is needed because Next.js handles assets differently
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface HistoricalEventsMapProps {
  initialEvents?: HistoricalEvent[];
  height?: string | number;
  width?: string | number;
  standalone?: boolean;
  onEventSelect?: (event: HistoricalEvent) => void;
  filterByCategory?: string;
  filterByYear?: number | [number, number];
  maxEvents?: number;
}

/**
 * Color mapping for event categories
 */
const getCategoryColor = (category: string): string => {
  const categoryColors: Record<string, string> = {
    'Ancient History': '#8b5cf6',
    'Medieval History': '#6366f1',
    'Modern History': '#3b82f6',
    Science: '#06b6d4',
    Technology: '#10b981',
    Art: '#f59e0b',
    Music: '#f97316',
    War: '#ef4444',
    Politics: '#dc2626',
    Religion: '#7c3aed',
    Philosophy: '#8b5cf6',
    Literature: '#ec4899',
    'World History': '#0ea5e9',
    Transportation: '#14b8a6',
    Medicine: '#22c55e',
  };

  return categoryColors[category] || '#6b7280';
};

/**
 * Get marker size based on event significance
 */
const getMarkerSize = (significance: string): number => {
  switch (significance) {
    case 'pivotal':
      return 15;
    case 'high':
      return 12;
    case 'medium':
      return 9;
    case 'low':
      return 6;
    default:
      return 8;
  }
};

/**
 * Returns a timeframe label based on year or year range
 */
const getTimeframeLabel = (year?: number | [number, number]): string => {
  if (!year) return 'All Time Periods';

  if (Array.isArray(year)) {
    const [startYear, endYear] = year;
    const startLabel = startYear < 0 ? `${Math.abs(startYear)} BCE` : `${startYear} CE`;
    const endLabel = endYear < 0 ? `${Math.abs(endYear)} BCE` : `${endYear} CE`;
    return `${startLabel} to ${endLabel}`;
  }

  return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
};

/**
 * Historical Events Map Component
 */
const HistoricalEventsMap: React.FC<HistoricalEventsMapProps> = ({
  initialEvents,
  height = 500,
  width = '100%',
  standalone = false,
  onEventSelect,
  filterByCategory,
  filterByYear,
  maxEvents = 100,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [events, setEvents] = useState<HistoricalEvent[]>(initialEvents || []);
  const [loading, setLoading] = useState(!initialEvents);
  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState<[number, number]>([30, 10]);
  const [zoom, setZoom] = useState(2);

  // Fetch events if not provided
  useEffect(() => {
    if (initialEvents) {
      setEvents(initialEvents);
      return;
    }

    const fetchEvents = async () => {
      try {
        setLoading(true);

        // Prepare filter parameters
        const filters: Record<string, any> = {
          limit: maxEvents,
          hasLocation: true, // Only get events with location data
        };

        // Add category filter if specified
        if (filterByCategory) {
          filters.category = filterByCategory;
        }

        // Add year filter if specified
        if (filterByYear) {
          if (Array.isArray(filterByYear)) {
            const [startYear, endYear] = filterByYear;
            filters.yearStart = startYear;
            filters.yearEnd = endYear;
          } else {
            filters.year = filterByYear;
          }
        }

        const eventsData = await sharedApiService.getHistoricalEvents(filters);

        if (eventsData && Array.isArray(eventsData.events)) {
          // Filter to only include events with valid coordinates
          const eventsWithLocations = eventsData.events.filter(
            (event) => event.location?.latitude && event.location?.longitude
          );

          setEvents(eventsWithLocations);

          // Adjust map center if we have events
          if (eventsWithLocations.length > 0) {
            // Use the average of all coordinates for center
            const totalLat = eventsWithLocations.reduce(
              (sum, event) => sum + event.location!.latitude!,
              0
            );
            const totalLng = eventsWithLocations.reduce(
              (sum, event) => sum + event.location!.longitude!,
              0
            );

            if (eventsWithLocations.length > 0) {
              setCenter([
                totalLat / eventsWithLocations.length,
                totalLng / eventsWithLocations.length,
              ]);
            }
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch historical events for map:', err);
        setError('Failed to load historical events');
        setLoading(false);
      }
    };

    fetchEvents();
  }, [initialEvents, filterByCategory, filterByYear, maxEvents]);

  // Handle event selection
  const handleEventClick = (event: HistoricalEvent) => {
    if (onEventSelect) {
      onEventSelect(event);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={height}
        width={width}
        bgcolor={theme.palette.background.paper}
        borderRadius={1}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={height}
        width={width}
        bgcolor={theme.palette.background.paper}
        borderRadius={1}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (events.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={height}
        width={width}
        bgcolor={theme.palette.background.paper}
        borderRadius={1}
        padding={3}
        textAlign="center"
      >
        <Typography>
          No historical events with location data found
          {filterByCategory && ` in the ${filterByCategory} category`}
          {filterByYear && ` from ${getTimeframeLabel(filterByYear)}`}.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height,
        width,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 1,
        boxShadow: standalone ? theme.shadows[3] : 'none',
      }}
    >
      {standalone && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 1000,
            p: 1,
            m: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <Typography variant="h6" component="div" fontSize={isMobile ? '0.9rem' : '1rem'}>
            Historical Events
            {filterByCategory && ` - ${filterByCategory}`}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            fontSize={isMobile ? '0.7rem' : '0.8rem'}
          >
            {getTimeframeLabel(filterByYear)}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
            Showing {events.length} events
          </Typography>
        </Box>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '4px' }}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {events.map((event) => {
          if (!event.location?.latitude || !event.location?.longitude) {
            return null;
          }

          const position: [number, number] = [event.location.latitude, event.location.longitude];

          return (
            <CircleMarker
              key={event.id || `event-${event.year}-${event.title}`}
              center={position}
              radius={getMarkerSize(event.significance || 'medium')}
              pathOptions={{
                fillColor: getCategoryColor(event.category),
                color: '#fff',
                weight: 1,
                opacity: 0.8,
                fillOpacity: 0.6,
              }}
              eventHandlers={{
                click: () => handleEventClick(event),
              }}
            >
              <Popup>
                <Box>
                  <Typography variant="subtitle1" component="h3">
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.year < 0 ? `${Math.abs(event.year)} BCE` : `${event.year} CE`}
                    {event.month &&
                      `, ${new Date(0, event.month - 1).toLocaleString('default', {
                        month: 'long',
                      })}`}
                    {event.day && ` ${event.day}`}
                  </Typography>
                  <Typography variant="body2" component="div" mt={1}>
                    {event.description}
                  </Typography>
                  <Box mt={1}>
                    <Chip
                      size="small"
                      label={event.category}
                      sx={{
                        fontSize: '0.7rem',
                        backgroundColor: getCategoryColor(event.category),
                        color: '#fff',
                        mr: 0.5,
                      }}
                    />
                    {event.subcategory && (
                      <Chip
                        size="small"
                        label={event.subcategory}
                        sx={{ fontSize: '0.7rem', mr: 0.5 }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" display="block" mt={1}>
                    {event.location?.name || 'Unknown Location'}
                  </Typography>
                </Box>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </Box>
  );
};

export default HistoricalEventsMap;
