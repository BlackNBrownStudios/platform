/**
 * Mock Historical Events Data
 * Provides seed data for testing and development
 */
import { HistoricalEvent, EventFilters, EventsResponse, EventSignificance } from '../shared/types';

// Generate a unique ID for mock data
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Mock data categories
export const mockCategories = [
  'Politics',
  'War',
  'Science',
  'Technology',
  'Art',
  'Religion',
  'Social',
  'Economic',
];

// Mock historical events data
export const mockHistoricalEvents: HistoricalEvent[] = [
  {
    id: generateId(),
    title: 'Apollo 11 Moon Landing',
    description:
      'Neil Armstrong and Edwin "Buzz" Aldrin became the first humans to land on the Moon, while Michael Collins orbited above.',
    year: 1969,
    month: 7,
    day: 20,
    category: 'Science',
    tags: ['Space', 'NASA', 'Cold War'],
    significance: 'pivotal',
    imageUrl: 'https://example.com/apollo11.jpg',
    sources: [
      {
        name: 'NASA',
        url: 'https://www.nasa.gov/mission_pages/apollo/apollo11.html',
        retrievalDate: new Date('2023-01-15'),
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-15'),
    dateUpdated: new Date('2023-01-15'),
  },
  {
    id: generateId(),
    title: 'World War II Begins',
    description:
      'Germany invaded Poland, prompting declarations of war from France and the United Kingdom, marking the beginning of World War II.',
    year: 1939,
    month: 9,
    day: 1,
    category: 'War',
    tags: ['World War II', 'Germany', 'Poland'],
    significance: 'pivotal',
    imageUrl: 'https://example.com/ww2.jpg',
    sources: [
      {
        name: 'History Channel',
        url: 'https://www.history.com/topics/world-war-ii/world-war-ii-history',
        retrievalDate: new Date('2023-01-15'),
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-15'),
    dateUpdated: new Date('2023-01-15'),
  },
  {
    id: generateId(),
    title: 'The Declaration of Independence',
    description:
      "The Continental Congress adopted the Declaration of Independence, announcing the colonies' separation from Great Britain.",
    year: 1776,
    month: 7,
    day: 4,
    category: 'Politics',
    tags: ['American Revolution', 'Independence', 'Founding Documents'],
    significance: 'pivotal',
    imageUrl: 'https://example.com/independence.jpg',
    sources: [
      {
        name: 'National Archives',
        url: 'https://www.archives.gov/founding-docs/declaration',
        retrievalDate: new Date('2023-01-15'),
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-15'),
    dateUpdated: new Date('2023-01-15'),
  },
  {
    id: generateId(),
    title: 'The World Wide Web is Invented',
    description:
      'Tim Berners-Lee invented the World Wide Web while working at CERN, revolutionizing information sharing globally.',
    year: 1989,
    month: 3,
    day: 12,
    category: 'Technology',
    tags: ['Internet', 'Computing', 'Information Age'],
    significance: 'pivotal',
    imageUrl: 'https://example.com/www.jpg',
    sources: [
      {
        name: 'CERN',
        url: 'https://home.cern/science/computing/birth-web',
        retrievalDate: new Date('2023-01-15'),
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-15'),
    dateUpdated: new Date('2023-01-15'),
  },
  {
    id: generateId(),
    title: 'Renaissance Begins',
    description:
      'The Renaissance, a period of cultural, artistic, political, and economic rebirth, began in Italy.',
    year: 1400,
    category: 'Art',
    tags: ['Culture', 'Art', 'Europe'],
    significance: 'high',
    imageUrl: 'https://example.com/renaissance.jpg',
    sources: [
      {
        name: 'Metropolitan Museum of Art',
        url: 'https://www.metmuseum.org/toah/hd/ren/hd_ren.htm',
        retrievalDate: new Date('2023-01-15'),
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-15'),
    dateUpdated: new Date('2023-01-15'),
  },
  {
    id: generateId(),
    title: 'First Industrial Revolution',
    description:
      'The transition to new manufacturing processes in Europe and the United States, beginning with mechanized textile production.',
    year: 1760,
    category: 'Economic',
    tags: ['Industry', 'Technology', 'Manufacturing'],
    significance: 'pivotal',
    imageUrl: 'https://example.com/industrial.jpg',
    sources: [
      {
        name: 'Britannica',
        url: 'https://www.britannica.com/event/Industrial-Revolution',
        retrievalDate: new Date('2023-01-15'),
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-15'),
    dateUpdated: new Date('2023-01-15'),
  },
  {
    id: generateId(),
    title: 'Printing Press Invented',
    description:
      'Johannes Gutenberg invented the movable-type printing press, revolutionizing the spread of knowledge and literacy in Europe.',
    year: 1440,
    category: 'Technology',
    tags: ['Books', 'Communication', 'Education'],
    significance: 'pivotal',
    imageUrl: 'https://example.com/printing.jpg',
    sources: [
      {
        name: 'History.com',
        url: 'https://www.history.com/topics/inventions/printing-press',
        retrievalDate: new Date('2023-01-15'),
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-15'),
    dateUpdated: new Date('2023-01-15'),
  },
  {
    id: generateId(),
    title: 'Fall of the Berlin Wall',
    description:
      'The fall of the Berlin Wall marked the end of the Cold War and the beginning of German reunification.',
    year: 1989,
    month: 11,
    day: 9,
    category: 'Politics',
    tags: ['Cold War', 'Germany', 'Communism'],
    significance: 'high',
    imageUrl: 'https://example.com/berlinwall.jpg',
    sources: [
      {
        name: 'BBC',
        url: 'https://www.bbc.com/news/world-europe-50013048',
        retrievalDate: new Date('2023-01-15'),
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-15'),
    dateUpdated: new Date('2023-01-15'),
  },
  {
    id: generateId(),
    title: 'Invention of Penicillin',
    description:
      'Alexander Fleming discovered penicillin, the first true antibiotic, revolutionizing medicine and saving countless lives.',
    year: 1928,
    month: 9,
    category: 'Science',
    tags: ['Medicine', 'Health', 'Antibiotics'],
    significance: 'high',
    imageUrl: 'https://example.com/penicillin.jpg',
    sources: [
      {
        name: 'Science History Institute',
        url: 'https://www.sciencehistory.org/historical-profile/alexander-fleming',
        retrievalDate: new Date('2023-01-15'),
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-15'),
    dateUpdated: new Date('2023-01-15'),
  },
  {
    id: generateId(),
    title: 'Protestant Reformation Begins',
    description:
      'Martin Luther nailed his 95 Theses to the door of Wittenberg Castle Church, sparking the Protestant Reformation.',
    year: 1517,
    month: 10,
    day: 31,
    category: 'Religion',
    tags: ['Christianity', 'Europe', 'Religious Change'],
    significance: 'pivotal',
    imageUrl: 'https://example.com/reformation.jpg',
    sources: [
      {
        name: 'Christianity Today',
        url: 'https://www.christianitytoday.com/history/people/theologians/martin-luther.html',
        retrievalDate: new Date('2023-01-15'),
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-15'),
    dateUpdated: new Date('2023-01-15'),
  },
];

// Mock service class for historical events
export class MockHistoricalEventsService {
  private events: HistoricalEvent[] = [...mockHistoricalEvents];

  /**
   * Get historical events based on filters
   */
  getHistoricalEvents(filters?: EventFilters): Promise<EventsResponse> {
    // Apply filters
    let filteredEvents = [...this.events];

    if (filters) {
      // Filter by category
      if (filters.category) {
        filteredEvents = filteredEvents.filter((event) => event.category === filters.category);
      }

      // Filter by categories (array)
      if (filters.categories && filters.categories.length > 0) {
        // eslint-disable-next-line prettier/prettier
        filteredEvents = filteredEvents.filter((event) =>
          filters.categories?.includes(event.category)
        );
      }

      // Filter by year range
      if (filters.startYear) {
        filteredEvents = filteredEvents.filter((event) => event.year >= (filters.startYear || 0));
      }

      if (filters.endYear) {
        filteredEvents = filteredEvents.filter((event) => event.year <= (filters.endYear || 3000));
      }

      // Filter by significance
      if (filters.significance) {
        const significance =
          typeof filters.significance === 'string' ? filters.significance : filters.significance[0];

        filteredEvents = filteredEvents.filter((event) => event.significance === significance);
      }

      // Filter by tags
      if (filters.tags && filters.tags.length > 0) {
        // eslint-disable-next-line prettier/prettier
        filteredEvents = filteredEvents.filter((event) =>
          event.tags?.some((tag) => filters.tags?.includes(tag))
        );
      }

      // Filter by search term
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredEvents = filteredEvents.filter(
          (event) =>
            event.title.toLowerCase().includes(term) ||
            event.description.toLowerCase().includes(term)
        );
      }

      // Filter by verification status
      if (filters.verified !== undefined) {
        filteredEvents = filteredEvents.filter((event) => event.verified === filters.verified);
      }
    }

    // Sort events by year (default)
    filteredEvents.sort((a, b) => a.year - b.year);

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    return Promise.resolve({
      results: paginatedEvents,
      page,
      limit,
      totalPages: Math.ceil(filteredEvents.length / limit),
      totalResults: filteredEvents.length,
    });
  }

  /**
   * Get a historical event by ID
   */
  getHistoricalEventById(id: string): Promise<HistoricalEvent> {
    const event = this.events.find((e) => e.id === id);

    if (!event) {
      return Promise.reject(new Error('Event not found'));
    }

    return Promise.resolve(event);
  }

  /**
   * Get historical events by category
   */
  getHistoricalEventsByCategory(category: string): Promise<EventsResponse> {
    return this.getHistoricalEvents({ category });
  }

  /**
   * Get historical events by time period
   */
  getHistoricalEventsByTimePeriod(startYear: number, endYear: number): Promise<EventsResponse> {
    return this.getHistoricalEvents({ startYear, endYear });
  }

  /**
   * Get all available historical event categories
   */
  getHistoricalEventCategories(): Promise<string[]> {
    return Promise.resolve([...mockCategories]);
  }

  /**
   * Get historical event year range (min and max years)
   */
  getHistoricalEventYearRange(): Promise<[number, number]> {
    const years = this.events.map((event) => event.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    return Promise.resolve([minYear, maxYear]);
  }

  /**
   * Get random historical events
   */
  getRandomHistoricalEvents(params: {
    count?: number;
    categories?: string[];
    difficulty?: string;
  }): Promise<HistoricalEvent[]> {
    let availableEvents = [...this.events];

    // Apply category filter if provided
    if (params.categories && params.categories.length > 0) {
      // eslint-disable-next-line prettier/prettier
      availableEvents = availableEvents.filter((event) =>
        params.categories?.includes(event.category)
      );
    }

    // Apply difficulty filter (map to significance in mock data)
    if (params.difficulty) {
      let significance: EventSignificance;

      switch (params.difficulty) {
        case 'easy':
          significance = 'low';
          break;
        case 'medium':
          significance = 'medium';
          break;
        case 'hard':
          significance = 'high';
          break;
        case 'expert':
          significance = 'pivotal';
          break;
        default:
          significance = 'medium';
      }

      availableEvents = availableEvents.filter((event) => event.significance === significance);
    }

    // Get random events
    const count = params.count || 5;
    const randomEvents: HistoricalEvent[] = [];

    // If we have fewer available events than requested, return all available
    if (availableEvents.length <= count) {
      return Promise.resolve([...availableEvents]);
    }

    // Select random events
    const selectedIndexes = new Set<number>();

    while (randomEvents.length < count && randomEvents.length < availableEvents.length) {
      const randomIndex = Math.floor(Math.random() * availableEvents.length);

      if (!selectedIndexes.has(randomIndex)) {
        selectedIndexes.add(randomIndex);
        randomEvents.push(availableEvents[randomIndex]);
      }
    }

    return Promise.resolve(randomEvents);
  }

  /**
   * Submit a historical event
   */
  submitHistoricalEvent(event: Partial<HistoricalEvent>): Promise<HistoricalEvent> {
    const newEvent: HistoricalEvent = {
      id: generateId(),
      title: event.title || 'Untitled Event',
      description: event.description || 'No description provided',
      year: event.year || new Date().getFullYear(),
      month: event.month,
      day: event.day,
      date: event.date,
      category: event.category || 'Uncategorized',
      subcategory: event.subcategory,
      tags: event.tags || [],
      significance: event.significance || 'medium',
      imageUrl: event.imageUrl,
      sources: event.sources || [],
      verified: false, // New submissions are unverified by default
      dateCreated: new Date(),
      dateUpdated: new Date(),
    };

    this.events.push(newEvent);

    return Promise.resolve(newEvent);
  }
}

// Create a singleton instance
export const mockHistoricalEventsService = new MockHistoricalEventsService();
