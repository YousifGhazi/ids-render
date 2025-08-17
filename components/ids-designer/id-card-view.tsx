import React, { useMemo, useCallback, useState } from 'react';

// Type definitions for better type safety
type ObjectType = 'Rect' | 'IText' | 'Image';
type TextAlign = 'left' | 'center' | 'right' | 'justify';
type Direction = 'ltr' | 'rtl';
type FontWeight = 'normal' | 'bold' | 'lighter' | 'bolder' | number;
type FontStyle = 'normal' | 'italic' | 'oblique';
type CardSide = 'front' | 'back';

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

interface Canvas {
  objects: CanvasObject[];
}

interface TemplateData {
  canvasWidth: number;
  canvasHeight: number;
  frontCanvas: Canvas;
  backCanvas?: Canvas;
}

interface IDCardViewProps {
  templateData: TemplateData;
  className?: string;
  showBothSides?: boolean;
  defaultSide?: CardSide;
  onSideChange?: (side: CardSide) => void;
}

// Constants
const CARD_DIMENSIONS = {
  WIDTH: 400,
  HEIGHT: 250,
} as const;

const DEFAULT_VALUES = {
  FONT_SIZE: 16,
  SCALE: 1,
  OPACITY: 1,
  STROKE_WIDTH: 1,
} as const;

const SIDE_LABELS = {
  front: 'Front',
  back: 'Back',
} as const;

const IDCardView: React.FC<IDCardViewProps> = ({
  templateData,
  className = '',
  showBothSides = false,
  defaultSide = 'front',
  onSideChange,
}) => {
  const [activeSide, setActiveSide] = useState<CardSide>(defaultSide);
  const { canvasWidth, canvasHeight, frontCanvas, backCanvas } = templateData;

  // Memoize scale calculation for performance
  const scale = useMemo(() => {
    if (!canvasWidth || !canvasHeight) return 1;
    const scaleX = CARD_DIMENSIONS.WIDTH / canvasWidth;
    const scaleY = CARD_DIMENSIONS.HEIGHT / canvasHeight;
    return Math.min(scaleX, scaleY); // Maintain aspect ratio
  }, [canvasWidth, canvasHeight]);

  // Handle side change with callback
  const handleSideChange = useCallback((side: CardSide) => {
    setActiveSide(side);
    onSideChange?.(side);
  }, [onSideChange]);

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
      key={`rect-${index}`}
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
      key={`text-${index}`}
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
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
        wordBreak: 'break-word',
      }}
    >
      {obj.text}
    </div>
  ), [getBaseStyle, scale, getTextJustification]);

  const renderImageObject = useCallback((obj: ImageObject, index: number) => (
    <img
      key={`image-${index}`}
      src={obj.src}
      alt={`Card element ${index + 1}`}
      style={{
        ...getBaseStyle(obj),
        objectFit: 'cover',
      }}
      onError={(e) => {
        // Handle broken images gracefully
        const target = e.currentTarget;
        target.style.display = 'none';
        console.warn(`Failed to load image: ${obj.src}`);
      }}
      loading="lazy"
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
        console.warn(`Unknown object type: ${(obj as CanvasObject).type}`);
        return null;
    }
  }, [renderRectObject, renderTextObject, renderImageObject]);

  // Get current canvas based on active side
  const getCurrentCanvas = useCallback((): Canvas | null => {
    if (activeSide === 'front') return frontCanvas;
    if (activeSide === 'back' && backCanvas) return backCanvas;
    return null;
  }, [activeSide, frontCanvas, backCanvas]);

  // Render card side content
  const renderCardSide = useCallback((canvas: Canvas, side: CardSide) => (
    <div
      key={side}
      className="relative overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
      style={{
        width: CARD_DIMENSIONS.WIDTH,
        height: CARD_DIMENSIONS.HEIGHT,
      }}
    >
      {canvas.objects.map((obj, index) => renderObject(obj, index))}
      {/* Side label overlay */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        {SIDE_LABELS[side]}
      </div>
    </div>
  ), [renderObject]);

  // Render side toggle buttons
  const renderSideToggle = useCallback(() => {
    if (!backCanvas) return null;

    return (
      <div className="flex gap-2 mb-4">
        {(['front', 'back'] as const).map((side) => (
          <button
            key={side}
            onClick={() => handleSideChange(side)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSide === side
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            type="button"
          >
            {SIDE_LABELS[side]}
          </button>
        ))}
      </div>
    );
  }, [activeSide, backCanvas, handleSideChange]);

  // Validate input data
  if (!templateData?.frontCanvas?.objects || !canvasWidth || !canvasHeight) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}
           style={{ width: CARD_DIMENSIONS.WIDTH, height: CARD_DIMENSIONS.HEIGHT }}>
        <div className="text-center text-gray-500">
          <div className="text-lg mb-2">⚠️</div>
          <div className="text-sm">Invalid template data</div>
        </div>
      </div>
    );
  }

  const currentCanvas = getCurrentCanvas();
  
  if (!currentCanvas) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}
           style={{ width: CARD_DIMENSIONS.WIDTH, height: CARD_DIMENSIONS.HEIGHT }}>
        <div className="text-center text-gray-500">
          <div className="text-lg mb-2">📄</div>
          <div className="text-sm">No {activeSide} side data</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-block ${className}`}>
      {/* Side toggle buttons */}
      {!showBothSides && renderSideToggle()}
      
      {/* Card display */}
      {showBothSides ? (
        <div className="flex gap-6">
          {renderCardSide(frontCanvas, 'front')}
          {backCanvas && renderCardSide(backCanvas, 'back')}
        </div>
      ) : (
        renderCardSide(currentCanvas, activeSide)
      )}
    </div>
  );
};

export default IDCardView;
export type { IDCardViewProps, TemplateData, CardSide };