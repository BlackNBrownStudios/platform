'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card as CardType } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

interface CardProps {
  card: CardType;
  draggable?: boolean;
  placed?: boolean;
  position?: number | null;
  onDragStart?: (event: React.DragEvent, card: CardType) => void;
  onClick?: (card: CardType) => void;
  isSelected?: boolean;
}

// Helper functions for text processing
const cleanTitle = (title: string): string => {
  if (!title) return '';

  // Remove dates, brackets, and parentheses
  let cleaned = title
    // Remove year patterns like (1942) or [1500-1600]
    .replace(/\s*\(\d{4}(?:-\d{4})?\)\s*/g, ' ')
    .replace(/\s*\[\d{4}(?:-\d{4})?\]\s*/g, ' ')
    // Remove any other parenthetical content
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s*\[[^\]]*\]\s*/g, ' ')
    // Remove special characters but keep basic punctuation
    .replace(/[^\w\s.,;:!?-]/g, ' ')
    // Replace multiple spaces with a single space
    .replace(/\s+/g, ' ')
    .trim();

  // Ensure the title starts with a capital letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const cleanDescription = (description: string): string => {
  if (!description) return '';

  // Remove dates, brackets, and parentheses
  let cleaned = description
    // Remove any parenthetical content
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s*\[[^\]]*\]\s*/g, ' ')
    // Replace multiple spaces with a single space
    .replace(/\s+/g, ' ')
    .trim();

  // Ensure the description starts with a capital letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

// Get font size class based on text length
const getFontSizeClass = (text: string, type: 'title' | 'description'): string => {
  if (!text) return '';

  const length = text.length;

  if (type === 'title') {
    if (length > 40) return 'text-sm';
    if (length > 30) return 'text-base';
    return 'text-lg';
  } else {
    // Description
    if (length > 200) return 'text-xs';
    if (length > 100) return 'text-sm';
    return 'text-base';
  }
};

const Card: React.FC<CardProps> = ({
  card,
  draggable = false,
  placed = false,
  position = null,
  onDragStart,
  onClick,
  isSelected = false,
}) => {
  const { styles } = useTheme();

  // Process cleaned text for display
  const [cleanedTitle, setCleanedTitle] = useState('');
  const [cleanedDescription, setCleanedDescription] = useState('');

  useEffect(() => {
    setCleanedTitle(cleanTitle(card.title));
    setCleanedDescription(cleanDescription(card.description));
  }, [card.title, card.description]);

  // Normalize category name for fallback image path
  const normalizeCategoryName = (category?: string): string => {
    if (!category) return 'history-default';

    // Convert to lowercase and replace spaces with hyphens
    return category.toLowerCase().replace(/\s+/g, '-');
  };

  // Get static image for category
  const getStaticImageUrl = (category?: string): string => {
    const normalizedCategory = normalizeCategoryName(category);

    // Map categories to our static images
    const categoryImageMap: Record<string, string> = {
      // Direct category names
      scientific: '/images/categories/science.svg',
      technological: '/images/categories/technology.svg',
      military: '/images/categories/war.svg',
      political: '/images/categories/politics.svg',
      cultural: '/images/categories/history-default.svg',
      // Alternative spellings
      science: '/images/categories/science.svg',
      technology: '/images/categories/technology.svg',
      war: '/images/categories/war.svg',
      politics: '/images/categories/politics.svg',
      'history-default': '/images/categories/history-default.svg',
    };

    // Return specific category image or default
    return categoryImageMap[normalizedCategory] || categoryImageMap['history-default'];
  };

  const handleDragStart = (event: React.DragEvent) => {
    if (onDragStart && draggable) {
      onDragStart(event, card);
    }
  };

  const handleClick = () => {
    if (onClick && draggable) {
      onClick(card);
    }
  };

  // Get font size classes based on text length
  const titleFontClass = getFontSizeClass(cleanedTitle, 'title');
  const descriptionFontClass = getFontSizeClass(cleanedDescription, 'description');

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg shadow-md transition-all 
        ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} 
        ${placed ? 'opacity-50' : 'hover:shadow-lg'}
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
      style={{
        backgroundColor: styles.surface,
        borderColor: 'rgba(0,0,0,0.1)',
        color: styles.text,
      }}
      draggable={draggable}
      onDragStart={handleDragStart}
      onClick={handleClick}
    >
      {position !== null && (
        <div
          className="absolute top-0 right-0 w-8 h-8 rounded-bl-lg flex items-center justify-center font-bold"
          style={{ backgroundColor: styles.primary, color: '#ffffff' }}
        >
          {position}
        </div>
      )}

      <div className="relative h-40 w-full">
        <Image
          src={getStaticImageUrl(card.category)}
          alt={cleanedTitle || card.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-4">
        <h3
          className={`font-semibold mb-1 ${titleFontClass}`}
          style={{ color: styles.text }}
          title={card.title} // Show original title on hover
        >
          {cleanedTitle || card.title}
        </h3>

        <div className="flex justify-between items-center mb-2">
          {placed && card.year ? (
            <span className="font-medium text-sm" style={{ color: styles.primary }}>
              {card.year}
            </span>
          ) : (
            <span className="font-medium text-sm opacity-50">{placed ? 'Unknown Date' : '?'}</span>
          )}

          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: styles.primary + '20',
              color: styles.primary,
            }}
          >
            {card.category}
          </span>
        </div>

        {placed && (
          <p
            className={`mt-2 ${descriptionFontClass}`}
            style={{ color: styles.text }}
            title={card.description} // Show original description on hover
          >
            {cleanedDescription || card.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default Card;
