import { useState, useMemo } from 'react';
import { useCards } from './hooks/useCards';
import { useFilters } from './hooks/useFilters';
import { FilterBar } from './components/FilterBar';
import { CardGrid } from './components/CardGrid';
import { Pagination } from './components/Pagination';
import { CardDetail } from './components/CardDetail';
import { CardFormModal } from './components/CardFormModal';
import type { Card } from './types/card';
import './App.css';

function App() {
  const { cards, allTags, loading, error, refetch } = useCards();
  const { filters, filteredAndSortedCards, updateFilters, resetFilters } = useFilters(cards);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <div>
            <h1>Chuck's Programming Toolbox</h1>
            <p className="app-subtitle">A collection of algorithms, patterns, and techniques for LeetCode-style problems</p>
          </div>
          <button
            className="app-create-button"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Card
          </button>
        </div>
      </header>

      <main className="app-main">
        {loading && (
          <div className="app-loading">
            <p>Loading cards...</p>
          </div>
        )}

        {error && (
          <div className="app-error">
            <p>Error: {error}</p>
            <button onClick={() => refetch()}>Retry</button>
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
    </div>
  );
}

export default App;
