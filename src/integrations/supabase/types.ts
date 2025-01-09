import { Database as GeneratedDatabase } from './generated-types';

export type Database = GeneratedDatabase;

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export type { Json } from './generated-types';