// Type definitions for better type safety
export type ObjectType = 'Rect' | 'IText' | 'Image';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type Direction = 'ltr' | 'rtl';
export type FontWeight = 'normal' | 'bold' | 'lighter' | 'bolder' | number;
export type FontStyle = 'normal' | 'italic' | 'oblique';
export type CardSide = 'front' | 'back';

// Base interface for all canvas objects
export interface BaseCanvasObject {
  type: ObjectType;
  version?: string;
  originX?: string;
  originY?: string;
  left: number;
  top: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
  strokeLineCap?: string;
  strokeDashOffset?: number;
  strokeLineJoin?: string;
  strokeUniform?: boolean;
  strokeMiterLimit?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  flipX?: boolean;
  flipY?: boolean;
  opacity?: number;
  shadow?: object;
  visible?: boolean;
  backgroundColor?: string;
  fillRule?: string;
  paintFirst?: string;
  globalCompositeOperation?: string;
  skewX?: number;
  skewY?: number;
  dataType?: string;
  isSmartField?: boolean;
  smartFieldType?: string;
  objectType?: string;
  filters?: object[];
}

// Text object interface
export interface TextObject extends BaseCanvasObject {
  type: 'IText';
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  lineHeight?: number;
  charSpacing?: number;
  textAlign?: TextAlign;
  direction?: Direction;
  styles?: object[];
  pathStartOffset?: number;
  pathSide?: string;
  pathAlign?: string;
  underline?: boolean;
  overline?: boolean;
  linethrough?: boolean;
  textBackgroundColor?: string;
  textDecorationThickness?: number;
}

// Image object interface
export interface ImageObject extends BaseCanvasObject {
  type: 'Image';
  src?: string;
  cropX?: number;
  cropY?: number;
  crossOrigin?: string | null;
}

// Rectangle object interface
export interface RectObject extends BaseCanvasObject {
  type: 'Rect';
  rx?: number;
  ry?: number;
}

// Union type for all canvas objects
export type CanvasObject = TextObject | ImageObject | RectObject;

// Canvas interface
export interface Canvas {
  version?: string;
  objects: CanvasObject[];
  background?: string;
}

// Template data interface
export interface TemplateData {
  canvasWidth: number;
  canvasHeight: number;
  frontCanvas: Canvas;
  backCanvas?: Canvas;
}

// ID Card view props interface

// Legacy interfaces for backward compatibility
export interface IIDCardTemplate {
  version: string;
  canvasOrientation: string;
  canvasWidth: number;
  canvasHeight: number;
  frontCanvas: FrontCanvas;
  backCanvas: BackCanvas;
  createdAt: string;
}

export interface FrontCanvas {
  version: string;
  objects: CanvasObject[];
  background: string;
}

export interface BackCanvas {
  version: string;
  objects: CanvasObject[];
  background: string;
}

// Legacy interface - deprecated, use CanvasObject union type instead
/** @deprecated Use CanvasObject union type instead */
export interface ICanvasObject extends Omit<BaseCanvasObject, 'type'> {
  type: string;
  rx?: number;
  ry?: number;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  fontStyle?: string;
  lineHeight?: number;
  text?: string;
  charSpacing?: number;
  textAlign?: string;
  styles?: object[];
  pathStartOffset?: number;
  pathSide?: string;
  pathAlign?: string;
  underline?: boolean;
  overline?: boolean;
  linethrough?: boolean;
  textBackgroundColor?: string;
  direction?: string;
  textDecorationThickness?: number;
  cropX?: number;
  cropY?: number;
  src?: string;
  crossOrigin?: string | null;
}