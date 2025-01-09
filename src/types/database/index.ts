export * from './user';
export * from './employee';
export * from './task';
export * from './leave';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];