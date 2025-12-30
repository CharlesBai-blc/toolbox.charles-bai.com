import { useState } from 'react';
import type { Card, CardClassification, CardDifficulty } from '../types/card';
import { createCard, updateCard } from '../services/cardService';
import './CardFormModal.css';

interface CardFormModalProps {
  card?: Card; // If provided, we're editing; otherwise, creating
  onClose: () => void;
  onSuccess: () => void;
}

const classifications: CardClassification[] = ['sorts', 'searches', 'algorithms', 'heuristics', 'patterns', 'data-structures'];
const difficulties: CardDifficulty[] = ['easy', 'medium', 'hard'];

export function CardFormModal({ card, onClose, onSuccess }: CardFormModalProps) {
  const isEditing = !!card;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: card?.title || '',
    classification: card?.classification || 'algorithms' as CardClassification,
    difficulty: card?.difficulty || '' as CardDifficulty | '',
    code: card?.code || '',
    explanation: card?.explanation || '',
    timeComplexity: card?.timeComplexity || '',
    spaceComplexity: card?.spaceComplexity || '',
    tags: card?.tags.join(', ') || '',
    useCases: card?.useCases?.join('\n') || '',
    relatedProblems: card?.relatedProblems?.join('\n') || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Parse tags, useCases, and relatedProblems
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const useCases = formData.useCases
        .split('\n')
        .map(uc => uc.trim())
        .filter(uc => uc.length > 0);
      
      const relatedProblems = formData.relatedProblems
        .split('\n')
        .map(rp => rp.trim())
        .filter(rp => rp.length > 0);

      const cardData: Omit<Card, 'id' | 'dateAdded'> = {
        title: formData.title.trim(),
        classification: formData.classification,
        difficulty: formData.difficulty || undefined,
        code: formData.code.trim(),
        explanation: formData.explanation.trim(),
        timeComplexity: formData.timeComplexity.trim() || undefined,
        spaceComplexity: formData.spaceComplexity.trim() || undefined,
        tags,
        useCases: useCases.length > 0 ? useCases : undefined,
        relatedProblems: relatedProblems.length > 0 ? relatedProblems : undefined,
      };

      if (isEditing && card) {
        await updateCard(card.id, cardData);
      } else {
        await createCard(cardData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save card');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="card-form-overlay" onClick={onClose}>
      <div className="card-form-container" onClick={(e) => e.stopPropagation()}>
        <div className="card-form-header">
          <h2>{isEditing ? 'Edit Card' : 'Create New Card'}</h2>
          <button className="card-form-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="card-form">
          {error && (
            <div className="card-form-error">
              {error}
            </div>
          )}

          <div className="card-form-section">
            <label className="card-form-label">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              className="card-form-input"
            />
          </div>

          <div className="card-form-row">
            <div className="card-form-section">
              <label className="card-form-label">
                Classification <span className="required">*</span>
              </label>
              <select
                value={formData.classification}
                onChange={(e) => handleChange('classification', e.target.value)}
                required
                className="card-form-select"
              >
                {classifications.map(cls => (
                  <option key={cls} value={cls}>
                    {cls === 'data-structures' ? 'Data Structures' : cls.charAt(0).toUpperCase() + cls.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="card-form-section">
              <label className="card-form-label">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleChange('difficulty', e.target.value)}
                className="card-form-select"
              >
                <option value="">None</option>
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card-form-section">
            <label className="card-form-label">
              Code <span className="required">*</span>
            </label>
            <textarea
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value)}
              required
              rows={10}
              className="card-form-textarea"
              placeholder="Enter your code here..."
            />
          </div>

          <div className="card-form-section">
            <label className="card-form-label">
              Explanation <span className="required">*</span>
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => handleChange('explanation', e.target.value)}
              required
              rows={5}
              className="card-form-textarea"
              placeholder="Explain the algorithm, pattern, or concept..."
            />
          </div>

          <div className="card-form-row">
            <div className="card-form-section">
              <label className="card-form-label">Time Complexity</label>
              <input
                type="text"
                value={formData.timeComplexity}
                onChange={(e) => handleChange('timeComplexity', e.target.value)}
                className="card-form-input"
                placeholder="e.g., O(n log n)"
              />
            </div>

            <div className="card-form-section">
              <label className="card-form-label">Space Complexity</label>
              <input
                type="text"
                value={formData.spaceComplexity}
                onChange={(e) => handleChange('spaceComplexity', e.target.value)}
                className="card-form-input"
                placeholder="e.g., O(1)"
              />
            </div>
          </div>

          <div className="card-form-section">
            <label className="card-form-label">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              className="card-form-input"
              placeholder="Comma-separated tags (e.g., array, search, divide-conquer)"
            />
          </div>

          <div className="card-form-section">
            <label className="card-form-label">Use Cases</label>
            <textarea
              value={formData.useCases}
              onChange={(e) => handleChange('useCases', e.target.value)}
              rows={3}
              className="card-form-textarea"
              placeholder="One use case per line..."
            />
          </div>

          <div className="card-form-section">
            <label className="card-form-label">Related Problems</label>
            <textarea
              value={formData.relatedProblems}
              onChange={(e) => handleChange('relatedProblems', e.target.value)}
              rows={3}
              className="card-form-textarea"
              placeholder="One problem per line (e.g., LeetCode 704: Binary Search)..."
            />
          </div>

          <div className="card-form-actions">
            <button
              type="button"
              onClick={onClose}
              className="card-form-button card-form-button-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="card-form-button card-form-button-submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditing ? 'Update Card' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

