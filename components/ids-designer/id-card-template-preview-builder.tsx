import React, { useMemo, useCallback } from 'react';

// Type definitions for better type safety
type ObjectType = 'Rect' | 'IText' | 'Image';
type TextAlign = 'left' | 'center' | 'right' | 'justify';
type Direction = 'ltr' | 'rtl';
type FontWeight = 'normal' | 'bold' | 'lighter' | 'bolder' | number;
type FontStyle = 'normal' | 'italic' | 'oblique';

interface BaseCanvasObject {
  type: ObjectType;
  left: number;
  top: number;
  width: number;
  height: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  visible?: boolean;
}

interface TextObject extends BaseCanvasObject {
  type: 'IText';
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  textAlign?: TextAlign;
  direction?: Direction;
}

interface ImageObject extends BaseCanvasObject {
  type: 'Image';
  src?: string;
}

interface RectObject extends BaseCanvasObject {
  type: 'Rect';
  rx?: number;
  ry?: number;
}

type CanvasObject = TextObject | ImageObject | RectObject;

interface FrontCanvas {
  objects: CanvasObject[];
}

interface TemplateData {
  canvasWidth: number;
  canvasHeight: number;
  frontCanvas: FrontCanvas;
}

interface PreviewBuilderProps {
  templateData: TemplateData;
  className?: string;
}

// Constants
const PREVIEW_DIMENSIONS = {
  WIDTH: 310,
  HEIGHT: 200,
} as const;

const DEFAULT_VALUES = {
  FONT_SIZE: 16,
  SCALE: 1,
  OPACITY: 1,
  STROKE_WIDTH: 1,
} as const;

const IDCardTemplatePreviewBuilder: React.FC<PreviewBuilderProps> = ({ templateData, className = '' }) => {
  const { canvasWidth, canvasHeight, frontCanvas } = templateData;

  // Memoize scale calculation for performance
  const scale = useMemo(() => {
    if (!canvasWidth || !canvasHeight) return 1;
    const scaleX = PREVIEW_DIMENSIONS.WIDTH / canvasWidth;
    const scaleY = PREVIEW_DIMENSIONS.HEIGHT / canvasHeight;
    return Math.min(scaleX, scaleY); // Maintain aspect ratio
  }, [canvasWidth, canvasHeight]);

  // Memoize base style calculation
  const getBaseStyle = useCallback((obj: CanvasObject): React.CSSProperties => ({
    position: 'absolute',
    left: obj.left * scale,
    top: obj.top * scale,
    width: obj.width * (obj.scaleX ?? DEFAULT_VALUES.SCALE) * scale,
    height: obj.height * (obj.scaleY ?? DEFAULT_VALUES.SCALE) * scale,
    transform: obj.angle ? `rotate(${obj.angle}deg)` : undefined,
    opacity: obj.opacity ?? DEFAULT_VALUES.OPACITY,
  }), [scale]);

  // Memoize text alignment calculation
  const getTextJustification = useCallback((textAlign?: TextAlign): React.CSSProperties['justifyContent'] => {
    switch (textAlign) {
      case 'right': return 'flex-end';
      case 'center': return 'center';
      case 'justify': return 'space-between';
      default: return 'flex-start';
    }
  }, []);

  // Optimized render functions for each object type
  const renderRectObject = useCallback((obj: RectObject, index: number) => (
    <div
      key={index}
      style={{
        ...getBaseStyle(obj),
        backgroundColor: obj.fill,
        border: obj.stroke ? `${obj.strokeWidth ?? DEFAULT_VALUES.STROKE_WIDTH}px solid ${obj.stroke}` : undefined,
        borderRadius: obj.rx ?? 0,
      }}
    />
  ), [getBaseStyle]);

  const renderTextObject = useCallback((obj: TextObject, index: number) => (
    <div
      key={index}
      style={{
        ...getBaseStyle(obj),
        color: obj.fill,
        fontSize: (obj.fontSize ?? DEFAULT_VALUES.FONT_SIZE) * scale,
        fontFamily: obj.fontFamily,
        fontWeight: obj.fontWeight,
        fontStyle: obj.fontStyle,
        textAlign: obj.textAlign,
        direction: obj.direction,
        display: 'flex',
        alignItems: 'center',
        justifyContent: getTextJustification(obj.textAlign),
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      {obj.text}
    </div>
  ), [getBaseStyle, scale, getTextJustification]);

  const renderImageObject = useCallback((obj: ImageObject, index: number) => (
    <img
      key={index}
      src={obj.src}
      alt="Template image"
      style={{
        ...getBaseStyle(obj),
        objectFit: 'cover',
      }}
      onError={(e) => {
        // Handle broken images gracefully
        e.currentTarget.style.display = 'none';
      }}
    />
  ), [getBaseStyle]);

  // Main render function with type-safe object rendering
  const renderObject = useCallback((obj: CanvasObject, index: number) => {
    if (obj.visible === false) return null;

    switch (obj.type) {
      case 'Rect':
        return renderRectObject(obj, index);
      case 'IText':
        return renderTextObject(obj, index);
      case 'Image':
        return renderImageObject(obj, index);
      default:
        // This should never happen with proper typing
        return null;
    }
  }, [renderRectObject, renderTextObject, renderImageObject]);

  // Validate input data after hooks
  if (!templateData?.frontCanvas?.objects || !canvasWidth || !canvasHeight) {
    return (
      <div className={`relative bg-gray-100 flex items-center justify-center ${className}`}
           style={{ width: PREVIEW_DIMENSIONS.WIDTH, height: PREVIEW_DIMENSIONS.HEIGHT }}>
        <span className="text-gray-500 text-sm">Invalid template data</span>
      </div>
    );
  }

  return (
    <div className={`relative bg-white ${className}`}>
      <div
        className="relative overflow-hidden"
        style={{
          width: PREVIEW_DIMENSIONS.WIDTH,
          height: PREVIEW_DIMENSIONS.HEIGHT,
        }}
      >
        {frontCanvas.objects.map((obj, index) => renderObject(obj, index))}
      </div>
    </div>
  );
};

export default IDCardTemplatePreviewBuilder;
