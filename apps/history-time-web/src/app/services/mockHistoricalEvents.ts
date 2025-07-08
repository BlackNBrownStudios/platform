/**
 * Mock Historical Events
 * Provides mock data for historical events when not connected to the API
 */
import { HistoricalEvent, EventFilters, EventsResponse } from '@history-time/data-access';

const mockEvents: HistoricalEvent[] = [
  {
    id: '1',
    title: 'Declaration of Independence',
    year: 1776,
    description:
      'The United States Declaration of Independence was adopted by the Second Continental Congress at the Pennsylvania State House in Philadelphia on July 4, 1776.',
    category: 'Political',
    significance: 'pivotal',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/United_States_Declaration_of_Independence.jpg/800px-United_States_Declaration_of_Independence.jpg',
    sources: [
      {
        name: 'Library of Congress',
        url: 'https://www.loc.gov/item/today-in-history/july-04/',
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-01'),
    dateUpdated: new Date('2023-01-01'),
  },
  {
    id: '2',
    title: 'Moon Landing',
    year: 1969,
    description:
      'Apollo 11 was the spaceflight that first landed humans on the Moon. Commander Neil Armstrong and lunar module pilot Buzz Aldrin formed the American crew that landed the Apollo Lunar Module Eagle.',
    category: 'Science',
    significance: 'high',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Buzz_salutes_the_U.S._Flag.jpg/800px-Buzz_salutes_the_U.S._Flag.jpg',
    sources: [
      {
        name: 'NASA',
        url: 'https://www.nasa.gov/mission_pages/apollo/apollo11.html',
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-01'),
    dateUpdated: new Date('2023-01-01'),
  },
  {
    id: '3',
    title: 'World Wide Web Invented',
    year: 1989,
    description:
      'Tim Berners-Lee invented the World Wide Web in 1989 while working at CERN. The web was originally conceived as a way to facilitate information-sharing between scientists around the world.',
    category: 'Technology',
    significance: 'pivotal',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/First_Web_Server.jpg/800px-First_Web_Server.jpg',
    sources: [
      {
        name: 'CERN',
        url: 'https://home.cern/science/computing/birth-web',
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-01'),
    dateUpdated: new Date('2023-01-01'),
  },
  {
    id: '4',
    title: 'Fall of the Berlin Wall',
    year: 1989,
    description:
      'The Berlin Wall fell after the East German government announced that its citizens could visit West Berlin and West Germany. This marked the beginning of the end of the Cold War.',
    category: 'Political',
    significance: 'high',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Berlin_Wall_1989.jpg/800px-Berlin_Wall_1989.jpg',
    sources: [
      {
        name: 'German Federal Archives',
        url: 'https://www.bundesarchiv.de/EN/Navigation/Home/home.html',
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-01'),
    dateUpdated: new Date('2023-01-01'),
  },
  {
    id: '5',
    title: 'Printing Press Invented',
    year: 1440,
    description:
      'Johannes Gutenberg introduced the printing press to Europe, which allowed for mass production of books and ultimately revolutionized society by democratizing knowledge.',
    category: 'Technology',
    significance: 'pivotal',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Gutenberg_press.jpg/800px-Gutenberg_press.jpg',
    sources: [
      {
        name: 'Mainz Gutenberg Museum',
        url: 'https://www.gutenberg-museum.de/en/',
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-01'),
    dateUpdated: new Date('2023-01-01'),
  },
  {
    id: '6',
    title: 'French Revolution Begins',
    year: 1789,
    description:
      'The French Revolution began with the storming of the Bastille on July 14, 1789, and eventually led to the end of the monarchy and the rise of Napoleon Bonaparte.',
    category: 'Political',
    significance: 'high',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Anonymous_-_Prise_de_la_Bastille.jpg/800px-Anonymous_-_Prise_de_la_Bastille.jpg',
    sources: [
      {
        name: 'Bibliothèque nationale de France',
        url: 'https://www.bnf.fr/en',
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-01'),
    dateUpdated: new Date('2023-01-01'),
  },
  {
    id: '7',
    title: 'Penicillin Discovered',
    year: 1928,
    description:
      'Alexander Fleming discovered penicillin, the first true antibiotic, which has saved countless lives and revolutionized medicine.',
    category: 'Science',
    significance: 'high',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Fleming_discovering_penicillin.jpg/800px-Fleming_discovering_penicillin.jpg',
    sources: [
      {
        name: 'Alexander Fleming Laboratory Museum',
        url: 'https://www.imperial.nhs.uk/about-us/who-we-are/fleming-museum',
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-01'),
    dateUpdated: new Date('2023-01-01'),
  },
  {
    id: '8',
    title: 'Construction of the Great Wall of China',
    year: -220,
    description:
      'The Great Wall of China was built to protect Chinese states and empires against raids and invasions. Multiple walls were built from the 7th century BC, with selective stretches later joined by Qin Shi Huang (220–206 BC).',
    category: 'Architecture',
    significance: 'high',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/800px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg',
    sources: [
      {
        name: 'UNESCO',
        url: 'https://whc.unesco.org/en/list/438/',
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-01'),
    dateUpdated: new Date('2023-01-01'),
  },
  {
    id: '9',
    title: 'American Civil War',
    year: 1861,
    description:
      "The American Civil War was fought between the Union and the Confederacy from 1861 to 1865, primarily over the issues of slavery and states' rights.",
    category: 'Military',
    significance: 'high',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Battle_of_Gettysburg%2C_by_Currier_and_Ives.png/800px-Battle_of_Gettysburg%2C_by_Currier_and_Ives.png',
    sources: [
      {
        name: 'Library of Congress',
        url: 'https://www.loc.gov/collections/civil-war/',
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-01'),
    dateUpdated: new Date('2023-01-01'),
  },
  {
    id: '10',
    title: 'Steam Engine Improved',
    year: 1769,
    description:
      'James Watt improved the Newcomen steam engine, creating a more efficient design that was crucial to the Industrial Revolution.',
    category: 'Technology',
    significance: 'high',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Maquina_vapor_Watt_ETSIIM.jpg/800px-Maquina_vapor_Watt_ETSIIM.jpg',
    sources: [
      {
        name: 'Science Museum Group',
        url: 'https://www.sciencemuseum.org.uk/objects-and-stories/james-watt-and-steam-age',
      },
    ],
    verified: true,
    dateCreated: new Date('2023-01-01'),
    dateUpdated: new Date('2023-01-01'),
  },
];

// Mock categories extracted from the events
const mockCategories = Array.from(new Set(mockEvents.map((event) => event.category)));

/**
 * Get mock historical events filtered by the provided criteria
 */
export function getMockHistoricalEvents(filters: EventFilters): EventsResponse {
  let filteredEvents = [...mockEvents];

  // Apply year range filter
  if (filters.startYear !== undefined) {
    filteredEvents = filteredEvents.filter((event) => event.year >= filters.startYear!);
  }

  if (filters.endYear !== undefined) {
    filteredEvents = filteredEvents.filter((event) => event.year <= filters.endYear!);
  }

  // Apply category filter
  if (filters.category) {
    filteredEvents = filteredEvents.filter((event) => event.category === filters.category);
  }

  // Sort by year (ascending)
  filteredEvents.sort((a, b) => a.year - b.year);

  // Apply pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  return {
    events: paginatedEvents,
    totalCount: filteredEvents.length,
    hasMore: page * limit < filteredEvents.length,
  };
}

/**
 * Get mock historical event categories
 */
export function getMockHistoricalEventCategories(): string[] {
  return mockCategories;
}
