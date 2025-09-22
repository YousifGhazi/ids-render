export interface PolotnoPage {
  id: string;
  children: Record<string, unknown>[];
  width: number;
  height: number;
  background: string;
  bleed: number;
  duration: number;
}

export interface PolotnoTemplate {
  width: number;
  height: number;
  fonts: any[];
  pages: PolotnoPage[];
  audios: any[];
  unit: string;
  dpi: number;
  custom: any;
  schemaVersion: number;
}

export interface PolotnoImageRendererProps {
  template: Record<string, any>;
  data?: Record<string, string>; // Optional data for variable replacement
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
  loading?: boolean;
  errorMessage?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}
