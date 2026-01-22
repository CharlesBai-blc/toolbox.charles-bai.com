import { useState, useMemo } from 'react';

import { useCards } from './hooks/useCards';
import { useFilters } from './hooks/useFilters';
import { useAuth } from './hooks/useAuth';

import { FilterBar } from './components/FilterBar';
import { CardGrid } from './components/CardGrid';
import { Pagination } from './components/Pagination';
import { CardDetail } from './components/CardDetail';
import { CardFormModal } from './components/CardFormModal';
import { AuthModal } from './components/AuthModal';

import type { Card } from './types/card';

function App() {
  const { cards, allTags, loading, error, refetch } = useCards();
  const { filters, filteredAndSortedCards, updateFilters, resetFilters } = useFilters(cards);
  const { user, isAuthenticated } = useAuth();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Calculate pagination
  const paginatedCards = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedCards.slice(startIndex, endIndex);
  }, [filteredAndSortedCards, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  const handleFiltersChange = (updates: Parameters<typeof updateFilters>[0]) => {
    updateFilters(updates);
    setCurrentPage(1);
  };

  const handleReset = () => {
    resetFilters();
    setCurrentPage(1);
  };

  const handleCardCreated = async () => {
    await refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b-0 text-text-primary py-8 px-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.3)] md:px-4 md:py-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-4">
            <div className="text-left w-full md:w-auto">
              <h1 className="text-text-primary">
                TOOLBOX
              </h1>
              <p className="m-0 text-sm md:text-sm text-text-tertiary font-normal">A collection of algorithms, patterns, and techniques for LeetCode-style problems</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto md:justify-end justify-between">
            {isAuthenticated ? (
              <>
                <button
                  className="px-6 py-3 bg-accent text-background border-none rounded text-sm font-medium cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-accent-hover"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Create Card
                </button>
                <button
                  className="p-2 bg-transparent border border-border rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center w-10 h-10 hover:bg-[#3c4043] hover:border-accent"
                  onClick={() => setShowAuthModal(true)}
                  title={user?.email || 'Account'}
                >
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.email || 'User'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl leading-none">👤</span>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  className="px-6 py-3 bg-accent text-background border-none rounded text-sm font-medium cursor-pointer transition-all duration-200 whitespace-nowrap opacity-60 hover:opacity-80 hover:bg-accent w-full md:w-auto"
                  onClick={() => setShowAuthModal(true)}
                  title="Sign in to create cards"
                >
                  + Create Card
                </button>
                <button
                  className="px-6 py-3 bg-transparent border border-border rounded text-sm font-medium cursor-pointer transition-all duration-200 text-text-primary hover:bg-[#3c4043] hover:border-accent w-full md:w-auto"
                  onClick={() => setShowAuthModal(true)}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 md:p-6">
        {loading && (
          <div className="text-center py-12 text-text-secondary">
            <p>Loading cards...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-[#f28b82]">
            <p>Error: {error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-accent text-background border-none rounded cursor-pointer text-sm hover:bg-accent-hover"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <FilterBar
              filters={filters}
              allTags={allTags}
              onFiltersChange={handleFiltersChange}
              onReset={handleReset}
            />

            <CardGrid cards={paginatedCards} onCardClick={setSelectedCard} />

            <Pagination
              totalItems={filteredAndSortedCards.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </main>

      {selectedCard && (
        <CardDetail
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onCardUpdated={handleCardCreated}
        />
      )}

      {showCreateModal && (
        <CardFormModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCardCreated}
        />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

export default App;
