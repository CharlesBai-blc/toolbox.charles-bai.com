import { useState } from 'react';
import type { Card } from '../types/card';
import { useAuth } from '../hooks/useAuth';
import { CardFormModal } from './CardFormModal';
import { AuthModal } from './AuthModal';
import { deleteCard } from '../services/cardService';
import { CodeEditor } from './CodeEditor';
import './CardDetail.css';

interface CardDetailProps {
  card: Card;
  onClose: () => void;
  onCardUpdated?: () => void;
}

type Section = 'code' | 'explanation' | 'leetcode' | 'examples' | 'related';

export function CardDetail({ card, onClose, onCardUpdated }: CardDetailProps) {
  const { isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('code');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return '#3eb870';
      case 'medium': return '#c99a1c';
      case 'hard': return '#c65a5a';
      default: return '#6b7280';
    }
  };

  const getClassificationLabel = (classification: string) => {
    return classification.charAt(0).toUpperCase() + classification.slice(1);
  };

  const handleEdit = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCard(card.id);
      onClose();
      if (onCardUpdated) {
        onCardUpdated();
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Failed to delete card. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCardUpdated = async () => {
    setShowEditModal(false);
    if (onCardUpdated) {
      onCardUpdated();
    }
  };

  const sections: { id: Section; label: string }[] = [
    { id: 'code', label: 'Code Snippet' },
    { id: 'explanation', label: 'Explanation' },
    { id: 'leetcode', label: 'LeetCode Links' },
    { id: 'examples', label: 'Examples' },
    { id: 'related', label: 'Related Topics' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'code':
        return (
          <div className="card-detail-content-section">
            <h2>Code Implementation</h2>
            <div className="card-detail-code">
              <div className="mt-4">
                <CodeEditor 
                  initialCode={card.code} 
                  // Fallback to python if language is missing
                  language={card.language || 'python'} 
                  // Optional: Add logic to save changes if you want users to edit permanently
                  // onChange={(newCode) => console.log(newCode)} 
                />
              </div>
            </div>
            {card.classification === 'data-structures' && card.methods && card.methods.length > 0 ? (
              <div className="card-detail-complexity">
                <h3 style={{ marginBottom: '12px', fontSize: '1.1em' }}>Common Methods</h3>
                <div className="card-detail-methods">
                  {card.methods.map((method, idx) => (
                    <div key={idx} className="complexity-item" style={{ marginBottom: '8px' }}>
                      <strong>{method.name}:</strong> {method.timeComplexity}
                    </div>
                  ))}
                </div>
                {card.spaceComplexity && (
                  <div className="complexity-item" style={{ marginTop: '12px' }}>
                    <strong>Space Complexity:</strong> {card.spaceComplexity}
                  </div>
                )}
              </div>
            ) : (
              (card.timeComplexity || card.spaceComplexity) && (
                <div className="card-detail-complexity">
                  {card.timeComplexity && (
                    <div className="complexity-item">
                      <strong>Time Complexity:</strong> {card.timeComplexity}
                    </div>
                  )}
                  {card.spaceComplexity && (
                    <div className="complexity-item">
                      <strong>Space Complexity:</strong> {card.spaceComplexity}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        );

      case 'explanation':
        return (
          <div className="card-detail-content-section">
            <h2>Explanation</h2>
            <div className="card-detail-explanation">
              <p>{card.explanation}</p>
            </div>
          </div>
        );

      case 'leetcode':
        return (
          <div className="card-detail-content-section">
            <h2>LeetCode Problems</h2>
            {card.relatedProblems && card.relatedProblems.length > 0 ? (
              <div className="card-detail-leetcode">
                <ul>
                  {card.relatedProblems.map((problem, idx) => (
                    <li key={idx}>{problem}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="card-detail-empty">No LeetCode problems linked yet.</p>
            )}
          </div>
        );

      case 'examples':
        return (
          <div className="card-detail-content-section">
            <h2>Use Cases & Examples</h2>
            {card.useCases && card.useCases.length > 0 ? (
              <div className="card-detail-examples">
                <ul>
                  {card.useCases.map((useCase, idx) => (
                    <li key={idx}>{useCase}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="card-detail-empty">No examples provided yet.</p>
            )}
          </div>
        );

      case 'related':
        return (
          <div className="card-detail-content-section">
            <h2>Related Topics</h2>
            <div className="card-detail-tags">
              {card.tags.map(tag => (
                <span key={tag} className="card-detail-tag">{tag}</span>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="card-detail-overlay" onClick={onClose}>
      <div className="card-detail-container" onClick={(e) => e.stopPropagation()}>
        <div className="card-detail-header">
          <div className="card-detail-title-section">
            <h1>{card.title}</h1>
            <div className="card-detail-badges">
              <span className="card-detail-classification">
                {getClassificationLabel(card.classification)}
              </span>
              {card.difficulty && (
                <span
                  className="card-detail-difficulty"
                  style={{ backgroundColor: getDifficultyColor(card.difficulty) }}
                >
                  {card.difficulty}
                </span>
              )}
            </div>
          </div>
          <div className="card-detail-actions">
            {isAuthenticated && (
              <>
                <button
                  className="card-detail-button card-detail-edit"
                  onClick={handleEdit}
                >
                  Edit
                </button>
                <button
                  className="card-detail-button card-detail-delete"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {showDeleteConfirm ? (isDeleting ? 'Deleting...' : 'Confirm Delete') : 'Delete'}
                </button>
              </>
            )}
            <button className="card-detail-close" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="card-detail-body">
          <nav className="card-detail-sidebar">
            {sections.map(section => (
              <button
                key={section.id}
                className={`card-detail-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>

          <div className="card-detail-content">
            {renderContent()}
          </div>
        </div>
      </div>

      {showEditModal && (
        <CardFormModal
          card={card}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleCardUpdated}
        />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

