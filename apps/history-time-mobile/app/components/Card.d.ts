/**
 * Type definitions for Card component
 */
export interface CardItemProps {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl?: string;
  position?: number | null;
  isPlaced?: boolean;
  isRevealed?: boolean;
  isCorrect?: boolean;
  backgroundColor?: string;
  textColor?: string;
  onPress?: () => void;
  testID?: string;
}

export interface CardListProps {
  cards: CardItemProps[];
  onCardPress?: (card: CardItemProps) => void;
  highlightedCardId?: string;
  testID?: string;
}

export interface CardPlacementData {
  cardId: string;
  position: number;
  isCorrect?: boolean;
}
