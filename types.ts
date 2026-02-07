
export interface EditState {
  status: 'idle' | 'processing' | 'success' | 'error';
  originalImage: string | null;
  editedImage: string | null;
  error?: string;
}

export interface ProcessingStep {
  id: string;
  label: string;
  isComplete: boolean;
}
