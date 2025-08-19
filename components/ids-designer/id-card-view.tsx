import React, { useMemo, useCallback, useState } from "react";
import { Tabs } from "@mantine/core";
import {
  CanvasObject,
  Canvas,
  TemplateData,
  CardSide,
  TextAlign,
  TextObject,
  ImageObject,
  RectObject,
} from "../../features/templates/interfaces";

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
  front: "الوجه الامامي للهوية",
  back: "الوجه الخلفي للهوية",
} as const;

interface IDCardViewProps {
  templateData: TemplateData;
  className?: string;
  showBothSides?: boolean;
  defaultSide?: CardSide;
  data: Record<string, string | number | null | undefined>;
  onSideChange?: (side: CardSide) => void;
}

const IDCardView: React.FC<IDCardViewProps> = ({
  templateData,
  className = "",
  showBothSides = false,
  defaultSide = "front",
  data,
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
  const handleSideChange = useCallback(
    (side: CardSide) => {
      setActiveSide(side);
      onSideChange?.(side);
    },
    [onSideChange]
  );

  // Memoize base style calculation
  const getBaseStyle = useCallback(
    (obj: CanvasObject): React.CSSProperties => ({
      position: "absolute",
      left: obj.left * scale,
      top: obj.top * scale,
      width: obj.width * (obj.scaleX ?? DEFAULT_VALUES.SCALE) * scale,
      height: obj.height * (obj.scaleY ?? DEFAULT_VALUES.SCALE) * scale,
      transform: obj.angle ? `rotate(${obj.angle}deg)` : undefined,
      opacity: obj.opacity ?? DEFAULT_VALUES.OPACITY,
    }),
    [scale]
  );

  // Memoize text alignment calculation
  const getTextJustification = useCallback(
    (textAlign?: TextAlign): React.CSSProperties["justifyContent"] => {
      switch (textAlign) {
        case "right":
          return "flex-end";
        case "center":
          return "center";
        case "justify":
          return "space-between";
        default:
          return "flex-start";
      }
    },
    []
  );

  // Optimized render functions for each object type
  const renderRectObject = useCallback(
    (obj: RectObject, index: number) => (
      <div
        key={index}
        style={{
          ...getBaseStyle(obj),
          backgroundColor: obj.fill,
          border: obj.stroke
            ? `${obj.strokeWidth ?? DEFAULT_VALUES.STROKE_WIDTH}px solid ${
                obj.stroke
              }`
            : undefined,
          borderRadius: obj.rx ?? 0,
        }}
      />
    ),
    [getBaseStyle]
  );

  const renderTextObject = useCallback(
    (obj: TextObject, index: number) => (
      <div key={index}>
        <div
          style={{
            ...getBaseStyle(obj),
            color: obj.fill,
            fontSize: (obj.fontSize ?? DEFAULT_VALUES.FONT_SIZE) * scale,
            fontFamily: obj.fontFamily,
            fontWeight: obj.fontWeight,
            fontStyle: obj.fontStyle,
            textAlign: obj.textAlign,
            direction: obj.direction,
            display: "flex",
            alignItems: "center",
            justifyContent: getTextJustification(obj.textAlign),
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {obj.text}
        </div>

        {obj.smartFieldType && data[obj.smartFieldType] && (
          <div
            style={{
              ...getBaseStyle(obj),
              right:
                Number(getBaseStyle(obj).width) +
                (data[obj.smartFieldType]?.toString().length ?? 0) + 7,
              width: '100%',
              color: obj.fill,
              fontSize: (obj.fontSize ?? DEFAULT_VALUES.FONT_SIZE) * scale,
              fontFamily: obj.fontFamily,
              fontWeight: obj.fontWeight,
              fontStyle: obj.fontStyle,
              textAlign: obj.textAlign,
              direction: obj.direction,
            }}
          >
            {data[obj.smartFieldType]}
          </div>
        )}
      </div>
    ),
    [getBaseStyle, scale, getTextJustification]
  );

  const renderImageObject = useCallback(
    (obj: ImageObject, index: number) => (
      <img
        key={index}
        src={obj.src}
        alt="Template image"
        style={{
          ...getBaseStyle(obj),
          objectFit: "cover",
        }}
        onError={(e) => {
          // Handle broken images gracefully
          e.currentTarget.style.display = "none";
        }}
      />
    ),
    [getBaseStyle]
  );

  // Main render function with type-safe object rendering
  const renderObject = useCallback(
    (obj: CanvasObject, index: number) => {
      if (obj.visible === false) return null;

      switch (obj.type) {
        case "Rect":
          return renderRectObject(obj, index);
        case "IText":
          return renderTextObject(obj, index);
        case "Image":
          return renderImageObject(obj, index);
        default:
          // This should never happen with proper typing
          return null;
      }
    },
    [renderRectObject, renderTextObject, renderImageObject]
  );

  // Get current canvas based on active side
  const getCurrentCanvas = useCallback((): Canvas | null => {
    if (activeSide === "front") return frontCanvas;
    if (activeSide === "back" && backCanvas) return backCanvas;
    return null;
  }, [activeSide, frontCanvas, backCanvas]);

  // Render card side content
  const renderCardSide = useCallback(
    (canvas: Canvas, side: CardSide) => (
      <div
        key={side}
        style={{
          position: "relative",
          overflow: "hidden",
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          width: CARD_DIMENSIONS.WIDTH,
          height: CARD_DIMENSIONS.HEIGHT,
        }}
      >
        {canvas.objects.map((obj, index) => renderObject(obj, index))}
        {/* Side label overlay */}
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            color: "white",
            fontSize: "12px",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
        >
          {SIDE_LABELS[side]}
        </div>
      </div>
    ),
    [renderObject]
  );

  // Validate input data
  if (!templateData?.frontCanvas?.objects || !canvasWidth || !canvasHeight) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f3f4f6",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          width: CARD_DIMENSIONS.WIDTH,
          height: CARD_DIMENSIONS.HEIGHT,
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              marginBottom: "8px",
            }}
          >
            ⚠️
          </div>
          <div
            style={{
              fontSize: "14px",
            }}
          >
            Invalid template data
          </div>
        </div>
      </div>
    );
  }

  const currentCanvas = getCurrentCanvas();

  if (!currentCanvas) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f3f4f6",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          width: CARD_DIMENSIONS.WIDTH,
          height: CARD_DIMENSIONS.HEIGHT,
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              marginBottom: "8px",
            }}
          >
            📄
          </div>
          <div
            style={{
              fontSize: "14px",
            }}
          >
            No {activeSide} side data
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: "inline-block",
      }}
    >
      {/* Card display */}
      {showBothSides ? (
        <div
          style={{
            display: "flex",
            gap: "24px",
          }}
        >
          {renderCardSide(frontCanvas, "front")}
          {backCanvas && renderCardSide(backCanvas, "back")}
        </div>
      ) : backCanvas ? (
        <Tabs
          value={activeSide}
          onChange={(value) => handleSideChange(value as CardSide)}
        >
          <Tabs.List style={{ marginBottom: "16px" }}>
            <Tabs.Tab value="front">{SIDE_LABELS.front}</Tabs.Tab>
            <Tabs.Tab value="back">{SIDE_LABELS.back}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="front">
            {renderCardSide(frontCanvas, "front")}
          </Tabs.Panel>

          <Tabs.Panel value="back">
            {renderCardSide(backCanvas, "back")}
          </Tabs.Panel>
        </Tabs>
      ) : (
        renderCardSide(currentCanvas, activeSide)
      )}
    </div>
  );
};

export default IDCardView;
export type { IDCardViewProps, TemplateData, CardSide };
