import React from 'react';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
  total?: number;
  loadingProgress?: number; // For direct percentage value
  loadingImages?: boolean; // Whether currently loading images
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading game...',
  progress,
  total,
  loadingProgress,
  loadingImages,
}) => {
  // Calculate percentage if progress and total are provided
  // Or use loadingProgress directly if provided
  const percentage =
    loadingProgress !== undefined
      ? loadingProgress
      : progress !== undefined && total !== undefined
        ? Math.round((progress / total) * 100)
        : undefined;

  // Update message based on loading state
  const displayMessage = loadingImages ? 'Preparing images for all cards...' : message;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 z-50">
      <div className="max-w-md w-full mx-auto px-4">
        {/* Logo or game title */}
        <h1 className="text-4xl font-bold text-center text-white mb-8">History Time</h1>

        {/* Loading animation */}
        <div className="relative mb-6">
          <div className="h-2 bg-gray-700 rounded-full">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: percentage ? `${percentage}%` : '100%' }}
            ></div>
          </div>

          {percentage !== undefined && (
            <div className="absolute right-0 -top-6 text-blue-400">{percentage}%</div>
          )}
        </div>

        {/* Loading message */}
        <p className="text-gray-300 text-center mb-4">{displayMessage}</p>

        {/* Historical fact while loading */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mt-8">
          <h3 className="text-lg font-medium text-yellow-400 mb-2">Did you know?</h3>
          <p className="text-gray-300 italic">{getRandomHistoricalFact()}</p>
        </div>
      </div>
    </div>
  );
};

// Array of interesting historical facts to display during loading
const historicalFacts = [
  'The Great Wall of China is not visible from space with the naked eye, contrary to popular belief.',
  'Ancient Egyptians used to use crocodile dung as a contraceptive.',
  'The shortest war in history was between Britain and Zanzibar in 1896, lasting only 38 minutes.',
  'Vikings used melted snow with crushed ant eggs to make soap for washing their hair.',
  'The first human heart transplant was performed in 1967 by Dr. Christiaan Barnard in South Africa.',
  'Napoleon was once attacked by thousands of rabbits when hunting, as they mistook him for their caretaker.',
  'Ancient Romans used crushed mouse brains as toothpaste.',
  'Cleopatra lived closer in time to the moon landing than to the building of the Great Pyramid.',
  "The world's oldest known living tree is over 5,000 years old.",
  'During World War II, the Oscar statuette was made of painted plaster due to metal shortages.',
  'Humans share about 60% of their DNA with bananas.',
  'The first known contraceptive was used in Ancient Egypt around 1850 BC.',
  "The most expensive historical artifact ever sold was Leonardo da Vinci's Salvator Mundi for $450.3 million.",
];

// Get a random historical fact
const getRandomHistoricalFact = (): string => {
  const randomIndex = Math.floor(Math.random() * historicalFacts.length);
  return historicalFacts[randomIndex];
};

export default LoadingScreen;
