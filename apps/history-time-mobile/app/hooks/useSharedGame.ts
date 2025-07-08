/**
 * Adapter for the shared game hook
 * This ensures consistent game behavior between web and mobile
 */
import { useGame } from '../../../../shared/src/hooks/useGame';
import { useSharedAdapter } from '../services/sharedAdapter';

/**
 * Mobile-specific implementation of the shared game hook
 */
export function useSharedGame() {
  // Use our shared adapter
  const adapter = useSharedAdapter();

  // Create the API object expected by the shared hook
  const gameApi = {
    createGameApi: (data: { difficulty: string; cardCount?: number; categories?: string[] }) =>
      adapter.createGame({
        difficulty: data.difficulty,
        cardCount: data.cardCount,
        categories: data.categories,
      }),

    getGameApi: (id: string) => {
      return adapter.getGame(id).then((game) => {
        // Ensure card IDs are always strings to prevent id.substring errors
        if (game && game.cards) {
          game.cards = game.cards.map((card) => ({
            ...card,
            cardId: typeof card.cardId === 'string' ? card.cardId : String(card.cardId),
          }));
        }
        return game;
      });
    },

    updateCardPlacementApi: (gameId: string, data: any) =>
      adapter.updateCardPlacement(gameId, data.cardId, data.placementPosition, data.timeTaken),

    endGameApi: (gameId: string) => adapter.endGame(gameId),

    abandonGameApi: (gameId: string) => adapter.abandonGame(gameId),
  };

  // Use the shared hook with our mobile-specific API implementation
  return useGame(gameApi);
}

export default useSharedGame;
