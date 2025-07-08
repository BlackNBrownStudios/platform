'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  SelectChangeEvent,
} from '@mui/material';
import dynamicImport from 'next/dynamic';
import { HistoricalEvent } from '@history-time/data-access';
import { sharedApiService } from '../../services/sharedAdapter';

// Force dynamic rendering since this page uses Material-UI hooks
export const dynamic = 'force-dynamic';

// Dynamically import the map component with no SSR
// This is necessary because Leaflet requires window object
const HistoricalEventsMap = dynamicImport(() => import('@/components/HistoricalEventsMap'), {
  ssr: false,
});

const categories = [
  'All Categories',
  'Ancient History',
  'Medieval History',
  'Modern History',
  'Science',
  'Technology',
  'Transportation',
  'War',
  'Politics',
  'Medicine',
  'Art',
  'Music',
  'Religion',
  'Philosophy',
  'Literature',
  'World History',
];

const timeperiods = [
  { label: 'All Time Periods', value: [null, null] },
  { label: 'Ancient Era (3000 BCE - 500 CE)', value: [-3000, 500] },
  { label: 'Medieval Era (500 - 1500)', value: [500, 1500] },
  { label: 'Early Modern Era (1500 - 1800)', value: [1500, 1800] },
  { label: 'Modern Era (1800 - 1945)', value: [1800, 1945] },
  { label: 'Contemporary Era (1945 - Present)', value: [1945, 2025] },
];

const EventsMapPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<[number | null, number | null]>([
    null,
    null,
  ]);
  const [customTimeRange, setCustomTimeRange] = useState<[number, number]>([-3000, 2025]);
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);
  const [mapHeight, setMapHeight] = useState(600);

  // Handle category change
  const handleCategoryChange = (event: any) => {
    setSelectedCategory(event.target.value as string);
  };

  // Handle time period change
  const handleTimePeriodChange = (event: SelectChangeEvent) => {
    const value = event.target.value as string;

    if (value === 'custom') {
      // Custom time range selected
      setSelectedTimePeriod(customTimeRange);
    } else {
      // Find the selected time period
      const period = timeperiods.find((p) => p.label === value);
      setSelectedTimePeriod((period?.value as [number | null, number | null]) || [null, null]);
    }
  };

  // Handle custom time range change
  const handleCustomTimeRangeChange = (event: Event, newValue: number | number[]) => {
    setCustomTimeRange(newValue as [number, number]);
    setSelectedTimePeriod(newValue as [number, number]);
  };

  // Handle event selection from map
  const handleEventSelect = (event: HistoricalEvent) => {
    setSelectedEvent(event);
  };

  // Format year display (handles BCE/CE)
  const formatYear = (year: number) => {
    if (year < 0) return `${Math.abs(year)} BCE`;
    return `${year} CE`;
  };

  // Get filter parameters for API
  const getFilterParams = () => {
    const filters: Record<string, any> = {
      limit: 200,
      hasLocation: true,
    };

    if (selectedCategory !== 'All Categories') {
      filters.category = selectedCategory;
    }

    if (selectedTimePeriod[0] !== null) {
      filters.yearStart = selectedTimePeriod[0];
    }

    if (selectedTimePeriod[1] !== null) {
      filters.yearEnd = selectedTimePeriod[1];
    }

    return filters;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Historical Events Map
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Explore historical events geographically across different time periods
      </Typography>

      <Grid container spacing={3}>
        {/* Filters */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={selectedCategory}
                label="Category"
                onChange={handleCategoryChange}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="timeperiod-select-label">Time Period</InputLabel>
              <Select
                labelId="timeperiod-select-label"
                id="timeperiod-select"
                value={selectedTimePeriod[0] === null ? 'All Time Periods' : 'custom'}
                label="Time Period"
                onChange={handleTimePeriodChange}
              >
                {timeperiods.map((period) => (
                  <MenuItem key={period.label} value={period.label}>
                    {period.label}
                  </MenuItem>
                ))}
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 4, px: 2 }}>
              <Typography id="year-range-slider" gutterBottom>
                Year Range: {formatYear(customTimeRange[0])} to {formatYear(customTimeRange[1])}
              </Typography>
              <Slider
                value={customTimeRange}
                onChange={handleCustomTimeRangeChange}
                valueLabelDisplay="auto"
                valueLabelFormat={formatYear}
                min={-5000}
                max={2025}
                step={50}
                disabled={selectedTimePeriod[0] === null}
              />
            </Box>
          </Paper>

          {/* Selected Event Details */}
          {selectedEvent && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Event Details
              </Typography>

              <Typography variant="subtitle1" component="h3">
                {selectedEvent.title}
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedEvent.year < 0
                  ? `${Math.abs(selectedEvent.year)} BCE`
                  : `${selectedEvent.year} CE`}
                {selectedEvent.month &&
                  `, ${new Date(0, selectedEvent.month - 1).toLocaleString('default', {
                    month: 'long',
                  })}`}
                {selectedEvent.day && ` ${selectedEvent.day}`}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <Typography variant="body2" paragraph>
                {selectedEvent.description}
              </Typography>

              <Typography variant="caption" component="div">
                <strong>Location:</strong> {selectedEvent.location?.name || 'Unknown'}
              </Typography>

              <Typography variant="caption" component="div">
                <strong>Category:</strong> {selectedEvent.category}
                {selectedEvent.subcategory && ` › ${selectedEvent.subcategory}`}
              </Typography>

              {selectedEvent.sources && selectedEvent.sources.length > 0 && (
                <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                  <strong>Source:</strong>{' '}
                  <a href={selectedEvent.sources[0].url} target="_blank" rel="noopener noreferrer">
                    {selectedEvent.sources[0].name}
                  </a>
                </Typography>
              )}
            </Paper>
          )}
        </Grid>

        {/* Map */}
        <Grid item xs={12} md={9}>
          <Paper
            sx={{
              width: '100%',
              height: isMobile ? 400 : mapHeight,
              overflow: 'hidden',
              borderRadius: 1,
            }}
          >
            <HistoricalEventsMap
              height={isMobile ? 400 : mapHeight}
              width="100%"
              standalone={true}
              onEventSelect={handleEventSelect}
              filterByCategory={
                selectedCategory !== 'All Categories' ? selectedCategory : undefined
              }
              filterByYear={
                selectedTimePeriod[0] !== null
                  ? (selectedTimePeriod as [number, number])
                  : undefined
              }
              maxEvents={200}
            />
          </Paper>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => setMapHeight(mapHeight === 600 ? 800 : 600)}
              size="small"
            >
              {mapHeight === 600 ? 'Expand Map' : 'Reduce Map'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventsMapPage;
