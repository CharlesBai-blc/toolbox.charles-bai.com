import { useState } from 'react';
import type { Card, CardClassification, CardDifficulty, CardLanguage, Method } from '../types/card';
import { useAuth } from '../hooks/useAuth';
import { createCard, updateCard } from '../services/cardService';
import { AuthModal } from './AuthModal';
import { getBoilerplate, isBoilerplateOnly } from '../utils/codeBoilerplate';
import './CardFormModal.css';

interface CardFormModalProps {
  card?: Card; // If provided, we're editing; otherwise, creating
  onClose: () => void;
  onSuccess: () => void;
}

const classifications: CardClassification[] = ['sorts', 'searches', 'algorithms', 'heuristics', 'patterns', 'data-structures'];
const difficulties: CardDifficulty[] = ['easy', 'medium', 'hard'];
const languages: CardLanguage[] = ['python', 'javascript', 'java', 'cpp', 'c', 'go', 'rust'];

export function CardFormModal({ card, onClose, onSuccess }: CardFormModalProps) {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isEditing = !!card;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialLanguage: CardLanguage = card?.language || 'python';
  const [formData, setFormData] = useState({
    title: card?.title || '',
    classification: card?.classification || 'algorithms' as CardClassification,
    difficulty: card?.difficulty || '' as CardDifficulty | '',
    language: initialLanguage,
    code: card?.code || (isEditing ? '' : getBoilerplate(initialLanguage)),
    explanation: card?.explanation || '',
    timeComplexity: card?.timeComplexity || '',
    spaceComplexity: card?.spaceComplexity || '',
    methods: card?.methods || [] as Method[],
    tags: card?.tags.join(', ') || '',
    useCases: card?.useCases?.join('\n') || '',
    relatedProblems: card?.relatedProblems?.join('\n') || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

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
        language: formData.language,
        code: formData.code.trim(),
        explanation: formData.explanation.trim(),
        timeComplexity: formData.classification === 'data-structures' ? undefined : (formData.timeComplexity.trim() || undefined),
        spaceComplexity: formData.spaceComplexity.trim() || undefined,
        methods: formData.classification === 'data-structures' && formData.methods.length > 0 ? formData.methods : undefined,
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

  const handleClassificationChange = (classification: CardClassification) => {
    setFormData(prev => {
      const newData = { ...prev, classification };
      // Clear methods if switching away from data-structures
      if (classification !== 'data-structures') {
        newData.methods = [];
      }
      return newData;
    });
  };

  const handleLanguageChange = (language: CardLanguage) => {
    setFormData(prev => {
      // If code is empty or just boilerplate, replace with new boilerplate
      if (!prev.code.trim() || isBoilerplateOnly(prev.code, prev.language)) {
        return { ...prev, language, code: getBoilerplate(language) };
      }
      // Otherwise, just update the language
      return { ...prev, language };
    });
  };

  const addMethod = () => {
    setFormData(prev => ({
      ...prev,
      methods: [...prev.methods, { name: '', timeComplexity: '' }]
    }));
  };

  const updateMethod = (index: number, field: 'name' | 'timeComplexity', value: string) => {
    setFormData(prev => ({
      ...prev,
      methods: prev.methods.map((method, i) => 
        i === index ? { ...method, [field]: value } : method
      )
    }));
  };

  const removeMethod = (index: number) => {
    setFormData(prev => ({
      ...prev,
      methods: prev.methods.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="card-form-overlay" onClick={onClose}>
      <div className="card-form-container" onClick={(e) => e.stopPropagation()}>
        <div className="card-form-header">
          <h2>{isEditing ? 'Edit Card' : 'Create New Card'}</h2>
          <button className="card-form-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="card-form">
          {!isAuthenticated && (
            <div className="card-form-auth-prompt">
              <p>You must be signed in to {isEditing ? 'edit' : 'create'} cards.</p>
              <button
                type="button"
                className="card-form-auth-button"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In with Google
              </button>
            </div>
          )}

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
                onChange={(e) => handleClassificationChange(e.target.value as CardClassification)}
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

            <div className="card-form-section">
              <label className="card-form-label">
                Language <span className="required">*</span>
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleLanguageChange(e.target.value as CardLanguage)}
                required
                className="card-form-select"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang === 'cpp' ? 'C++' : lang === 'c' ? 'C' : lang.charAt(0).toUpperCase() + lang.slice(1)}
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

          {formData.classification === 'data-structures' ? (
            <div className="card-form-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <label className="card-form-label" style={{ marginBottom: 0 }}>
                  Common Methods
                </label>
                <button
                  type="button"
                  onClick={addMethod}
                  className="card-form-add-method"
                  style={{ padding: '4px 12px', fontSize: '0.9em', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  + Add Method
                </button>
              </div>
              {formData.methods.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '0.9em', marginTop: '8px' }}>
                  Click "+ Add Method" to add common methods (e.g., get, put, set) with their time complexities.
                </p>
              ) : (
                <div className="card-form-methods-list" style={{ marginTop: '8px' }}>
                  {formData.methods.map((method, index) => (
                    <div key={index} className="card-form-method-row" style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={method.name}
                        onChange={(e) => updateMethod(index, 'name', e.target.value)}
                        className="card-form-input"
                        placeholder="Method name (e.g., get)"
                        style={{ flex: '1' }}
                      />
                      <input
                        type="text"
                        value={method.timeComplexity}
                        onChange={(e) => updateMethod(index, 'timeComplexity', e.target.value)}
                        className="card-form-input"
                        placeholder="Time complexity (e.g., O(1))"
                        style={{ flex: '1' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeMethod(index)}
                        className="card-form-button-remove"
                        style={{ padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="card-form-section" style={{ marginTop: '16px' }}>
                <label className="card-form-label">Space Complexity</label>
                <input
                  type="text"
                  value={formData.spaceComplexity}
                  onChange={(e) => handleChange('spaceComplexity', e.target.value)}
                  className="card-form-input"
                  placeholder="e.g., O(n)"
                />
              </div>
            </div>
          ) : (
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
          )}

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
              disabled={loading || !isAuthenticated}
            >
              {loading ? 'Saving...' : isEditing ? 'Update Card' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

