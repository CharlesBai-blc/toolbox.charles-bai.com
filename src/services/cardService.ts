import { supabase } from '../lib/supabase';
import type { Card } from '../types/card';
import { allCards } from '../data/cards';

// Database schema type (snake_case)
interface DatabaseCard {
  id: string;
  title: string;
  classification: string;
  difficulty: string | null;
  code: string;
  explanation: string;
  time_complexity: string | null;
  space_complexity: string | null;
  tags: string[];
  use_cases: string[] | null;
  related_problems: string[] | null;
  date_added: string | null;
  created_at: string;
  updated_at: string;
}

// Transform database card to Card interface
function dbToCard(dbCard: DatabaseCard): Card {
  return {
    id: dbCard.id,
    title: dbCard.title,
    classification: dbCard.classification as Card['classification'],
    difficulty: dbCard.difficulty as Card['difficulty'] || undefined,
    code: dbCard.code,
    explanation: dbCard.explanation,
    timeComplexity: dbCard.time_complexity || undefined,
    spaceComplexity: dbCard.space_complexity || undefined,
    tags: dbCard.tags,
    useCases: dbCard.use_cases || undefined,
    relatedProblems: dbCard.related_problems || undefined,
    dateAdded: dbCard.date_added || undefined,
  };
}

// Transform Card interface to database format
function cardToDb(card: Omit<Card, 'id'> & { id?: string }): Omit<DatabaseCard, 'id' | 'created_at' | 'updated_at'> {
  return {
    title: card.title,
    classification: card.classification,
    difficulty: card.difficulty || null,
    code: card.code,
    explanation: card.explanation,
    time_complexity: card.timeComplexity || null,
    space_complexity: card.spaceComplexity || null,
    tags: card.tags,
    use_cases: card.useCases || null,
    related_problems: card.relatedProblems || null,
    date_added: card.dateAdded || null,
  };
}

// Fetch all cards from Supabase
export async function getAllCards(): Promise<Card[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cards:', error);
    throw new Error(`Failed to fetch cards: ${error.message}`);
  }

  return (data || []).map(dbToCard);
}

// Create a new card
export async function createCard(card: Omit<Card, 'id' | 'dateAdded'>): Promise<Card> {
  const dbCard = cardToDb(card);
  
  const { data, error } = await supabase
    .from('cards')
    .insert(dbCard)
    .select()
    .single();

  if (error) {
    console.error('Error creating card:', error);
    throw new Error(`Failed to create card: ${error.message}`);
  }

  return dbToCard(data);
}

// Update an existing card
export async function updateCard(id: string, updates: Partial<Omit<Card, 'id'>>): Promise<Card> {
  const updateData: Partial<DatabaseCard> = {};
  
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.classification !== undefined) updateData.classification = updates.classification;
  if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty || null;
  if (updates.code !== undefined) updateData.code = updates.code;
  if (updates.explanation !== undefined) updateData.explanation = updates.explanation;
  if (updates.timeComplexity !== undefined) updateData.time_complexity = updates.timeComplexity || null;
  if (updates.spaceComplexity !== undefined) updateData.space_complexity = updates.spaceComplexity || null;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.useCases !== undefined) updateData.use_cases = updates.useCases || null;
  if (updates.relatedProblems !== undefined) updateData.related_problems = updates.relatedProblems || null;
  if (updates.dateAdded !== undefined) updateData.date_added = updates.dateAdded || null;

  const { data, error } = await supabase
    .from('cards')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating card:', error);
    throw new Error(`Failed to update card: ${error.message}`);
  }

  return dbToCard(data);
}

// Delete a card
export async function deleteCard(id: string): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting card:', error);
    throw new Error(`Failed to delete card: ${error.message}`);
  }
}

// Check if migration has already run
const MIGRATION_KEY = 'toolbox_cards_migrated';

export function hasMigrationRun(): boolean {
  return localStorage.getItem(MIGRATION_KEY) === 'true';
}

export function setMigrationComplete(): void {
  localStorage.setItem(MIGRATION_KEY, 'true');
}

// Migrate hardcoded cards to Supabase
export async function migrateHardcodedCards(): Promise<void> {
  if (hasMigrationRun()) {
    console.log('Migration already completed');
    return;
  }

  try {
    // Check if cards already exist in database
    const { data: existingCards } = await supabase
      .from('cards')
      .select('id')
      .limit(1);

    if (existingCards && existingCards.length > 0) {
      console.log('Cards already exist in database, skipping migration');
      setMigrationComplete();
      return;
    }

    // Migrate all hardcoded cards
    const cardsToInsert = allCards.map(card => cardToDb(card));
    
    const { error } = await supabase
      .from('cards')
      .insert(cardsToInsert);

    if (error) {
      console.error('Error migrating cards:', error);
      throw new Error(`Failed to migrate cards: ${error.message}`);
    }

    console.log(`Successfully migrated ${allCards.length} cards to Supabase`);
    setMigrationComplete();
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

