export interface ValidationCallback {
  (error: Error | null, result: boolean): void;
}
