"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import * as fabric from "fabric";
import {
  Box,
  Button,
  Group,
  Stack,
  Text,
  ColorInput,
  NumberInput,
  TextInput,
  Paper,
  ActionIcon,
  Divider,
  Select,
  Slider,
  Checkbox,
} from "@mantine/core";
import {
  IconSquare,
  IconCircle,
  IconLetterT,
  IconPhoto,
  IconTrash,
  IconCopy,
  IconFlipHorizontal,
  IconFlipVertical,
  IconSettings,
  IconShape,
  IconAccessible,
  IconEye,
  IconRotate,
  IconColorPicker,
  IconBold,
  IconItalic,
  IconUnderline,
  IconDownload,
  IconDeviceFloppy,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconTriangle,
  IconStar,
  IconMinus,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignBoxTopCenter,
  IconAlignBoxCenterMiddle,
  IconAlignBoxBottomCenter,
  IconLayoutDistributeHorizontal,
  IconLayoutDistributeVertical,
  IconZoomIn,
  IconZoomOut,
  IconZoom,
} from "@tabler/icons-react";
import { useTranslations, useLocale } from "next-intl";

interface IDCardDesignerProps {
  width?: number;
  height?: number;
  onSave: (data: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
}

// Constants for better performance
const DEFAULT_CANVAS_SETTINGS = {
  backgroundColor: "#ffffff",
  selection: true,
  selectionKey: "ctrlKey",
  selectionColor: "rgba(100, 149, 237, 0.3)",
  selectionBorderColor: "rgba(100, 149, 237, 0.8)",
  selectionLineWidth: 2,
} as const;

const CUSTOM_PROPS = [
  "dataType",
  "isSmartField",
  "smartFieldType",
  "objectType",
  "textAlign",
  "direction",
] as const;

const DEFAULT_OBJECT_POSITION = { left: 100, top: 100 } as const;

export default function IDCardDesigner({
  width = 800,
  height = 500,
  onSave,
  initialData,
}: IDCardDesignerProps) {
  const t = useTranslations("idsDesigner");
  const locale = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(
    null
  );
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  const [transparency, setTransparency] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [objectWidth, setObjectWidth] = useState(288);
  const [objectHeight, setObjectHeight] = useState(70);
  const [currentSide, setCurrentSide] = useState<"front" | "back">("front");
  const [frontCanvasData, setFrontCanvasData] = useState<string | null>(null);
  const [backCanvasData, setBackCanvasData] = useState<string | null>(null);
  const [showFieldPanel, setShowFieldPanel] = useState(false);
  const [showTextTypePanel, setShowTextTypePanel] = useState(false);
  const [showShapePanel, setShowShapePanel] = useState(false);
  const [objectUpdateTrigger, setObjectUpdateTrigger] = useState(0);
  const [canvasOrientation, setCanvasOrientation] = useState<
    "horizontal" | "vertical"
  >("horizontal");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isRTL, setIsRTL] = useState(locale === "ar");
  const [canvasSelected, setCanvasSelected] = useState(false);
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState("#ffffff");
  const [canvasBackgroundImage, setCanvasBackgroundImage] = useState<
    string | null
  >(null);

  // Memoized field texts for better performance
  const fieldTexts = useMemo(
    () => ({
      name: locale === "ar" ? "الاسم:" : "Name:",
      id: locale === "ar" ? "رقم الهوية:" : "ID:",
      date: locale === "ar" ? "تاريخ الميلاد:" : "Date of Birth:",
      department: locale === "ar" ? "القسم:" : "Department:",
      age: locale === "ar" ? "العمر:" : "Age:",
    }),
    [locale]
  );

  // Helper functions for field types
  const getDataType = useCallback((fieldType: string) => {
    switch (fieldType) {
      case "id":
      case "department":
      case "name":
        return "text";
      case "date":
        return "date";
      case "age":
      default:
        return "text";
    }
  }, []);

  const getObjectType = useCallback((fieldType: string) => {
    switch (fieldType) {
      case "name":
        return "person";
      case "id":
        return "identifier";
      case "date":
        return "temporal";
      case "department":
        return "organization";
      case "age":
        return "demographic";
      default:
        return "general";
    }
  }, []);

  const initializeCanvas = useCallback(() => {
    if (canvasRef.current) {
      // Configure fabric.js to include custom properties in serialization
      fabric.Object.prototype.toObject = (function (toObject) {
        return function (this: fabric.Object, propertiesToInclude?: string[]) {
          const allProps = propertiesToInclude
            ? [...propertiesToInclude, ...CUSTOM_PROPS]
            : [...CUSTOM_PROPS];
          return toObject.call(this, allProps);
        };
      })(fabric.Object.prototype.toObject);

      const canvasWidth = canvasOrientation === "horizontal" ? width : height;
      const canvasHeight = canvasOrientation === "horizontal" ? height : width;

      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        ...DEFAULT_CANVAS_SETTINGS,
      });

      // Add selection event listeners
      const handleSelectionChange = (e: { selected?: fabric.Object[] }) => {
        if (e.selected && e.selected.length > 0) {
          setSelectedObjects(e.selected);
          if (e.selected.length === 1) {
            const obj = e.selected[0];
            setSelectedObject(obj);
            updateControlsFromObject(obj);
          } else {
            setSelectedObject(null);
          }
        }
      };

      const handleSelectionCleared = () => {
        setSelectedObject(null);
        setSelectedObjects([]);
        setCanvasSelected(false);
        resetControls();
      };

      fabricCanvas.on("selection:created", handleSelectionChange);
      fabricCanvas.on("selection:updated", handleSelectionChange);
      fabricCanvas.on("selection:cleared", handleSelectionCleared);

      // Add canvas click listener for canvas selection
      fabricCanvas.on("mouse:down", (e: { target?: fabric.Object }) => {
        if (!e.target) {
          setCanvasSelected(true);
          setSelectedObject(null);
          setSelectedObjects([]);
          fabricCanvas.discardActiveObject();
          fabricCanvas.renderAll();
        } else {
          setCanvasSelected(false);
        }
      });

      // Add object modification listeners
      fabricCanvas.on("object:modified", (e: { target?: fabric.Object }) => {
        if (e.target && e.target === selectedObject) {
          updateControlsFromObject(e.target);
        }
      });

      fabricCanvas.on("object:scaling", (e: { target?: fabric.Object }) => {
        if (e.target && e.target === selectedObject) {
          updateControlsFromObject(e.target);
        }
      });

      fabricCanvas.on("object:rotating", (e: { target?: fabric.Object }) => {
        if (e.target && e.target === selectedObject) {
          setRotation(Math.round(e.target.angle || 0));
        }
      });

      setCanvas(fabricCanvas);
      return fabricCanvas;
    }
    return null;
  }, [canvasOrientation, width, height]);

  useEffect(() => {
    const fabricCanvas = initializeCanvas();
    return () => {
      if (fabricCanvas) {
        fabricCanvas.dispose();
      }
    };
  }, [width, height, canvasOrientation]);

  // Auto-save canvas data when objects are modified
  useEffect(() => {
    if (!canvas) return;

    if(initialData) {
      importTemplate(initialData);
    }

    let saveTimeout: NodeJS.Timeout;
    const handleCanvasChange = () => {
      // Clear any pending save operation
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      // Debounce the save operation
      saveTimeout = setTimeout(() => {
        if (canvas) {
          const canvasData = JSON.stringify(canvas.toJSON());
          if (currentSide === "front") {
            setFrontCanvasData(canvasData);
          } else {
            setBackCanvasData(canvasData);
          }
        }
      }, 300);
    };

    canvas.on("object:added", handleCanvasChange);
    canvas.on("object:removed", handleCanvasChange);
    canvas.on("object:modified", handleCanvasChange);
    canvas.on("path:created", handleCanvasChange);

    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      canvas.off("object:added", handleCanvasChange);
      canvas.off("object:removed", handleCanvasChange);
      canvas.off("object:modified", handleCanvasChange);
      canvas.off("path:created", handleCanvasChange);
    };
  }, [canvas, currentSide]);

  const saveCurrentSideData = useCallback(() => {
    if (!canvas) return;
    const canvasData = JSON.stringify(canvas.toJSON());
    if (currentSide === "front") {
      setFrontCanvasData(canvasData);
    } else {
      setBackCanvasData(canvasData);
    }
  }, [canvas, currentSide]);

  const loadSideData = useCallback(
    (side: "front" | "back") => {
      if (!canvas) return;

      const data = side === "front" ? frontCanvasData : backCanvasData;
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          canvas.loadFromJSON(parsedData, () => {
            // Restore background settings from canvas data
            const bgColor = canvas.backgroundColor || "#ffffff";
            const bgImage = canvas.backgroundImage;

            setCanvasBackgroundColor(
              typeof bgColor === "string" ? bgColor : "#ffffff"
            );
            setCanvasBackgroundImage(bgImage ? "applied" : null);

            // Force multiple renders to ensure visibility
            canvas.renderAll();
            setTimeout(() => {
              canvas.renderAll();
              canvas.requestRenderAll();
            }, 10);

            setSelectedObject(null);
            setCanvasSelected(false);
            resetControls();
          });
        } catch (error) {
          console.error("Error loading canvas data:", error);
          canvas.clear();
          canvas.backgroundColor = "#ffffff";
          canvas.renderAll();
          setSelectedObject(null);
          resetControls();
        }
      } else {
        canvas.clear();
        canvas.backgroundColor = "#ffffff";
        canvas.renderAll();
        setSelectedObject(null);
        resetControls();
      }
    },
    [canvas, frontCanvasData, backCanvasData]
  );

  const switchSide = useCallback(
    (side: "front" | "back") => {
      if (currentSide === side) return;

      // Save current side data
      saveCurrentSideData();

      // Switch to new side
      setCurrentSide(side);

      // Use setTimeout to ensure the save operation completes before loading
      setTimeout(() => {
        loadSideData(side);
      }, 50);
    },
    [currentSide, saveCurrentSideData, loadSideData]
  );

  const addText = useCallback(() => {
    setShowTextTypePanel(true);
  }, []);

  const addShape = useCallback(() => {
    setShowShapePanel(true);
  }, []);

  const addStaticText = useCallback(
    (type: "single" | "multi") => {
      if (!canvas) return;

      const text = new fabric.IText(
        type === "single"
          ? t("textTypes.singleLine")
          : t("textTypes.multiLine"),
        {
          ...DEFAULT_OBJECT_POSITION,
          fontFamily: "Arial",
          fontSize: 20,
          fill: "#000000",
          dataType: "text",
          textAlign: isRTL ? "right" : "left",
          direction: isRTL ? "rtl" : "ltr",
        }
      );

      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
      setShowTextTypePanel(false);
    },
    [canvas, t, isRTL]
  );

  const addVariableText = useCallback(
    (type: string) => {
      if (!canvas) return;

      const text = new fabric.Text(
        fieldTexts[type as keyof typeof fieldTexts] || type,
        {
          ...DEFAULT_OBJECT_POSITION,
          fontFamily: "Arial",
          fontSize: 16,
          fill: "#000000",
          selectable: true,
          editable: false,
          isSmartField: true,
          smartFieldType: type,
          dataType: getDataType(type),
          objectType: getObjectType(type),
          backgroundColor: "#e3f2fd",
          padding: 4,
          textAlign: isRTL ? "right" : "left",
          direction: isRTL ? "rtl" : "ltr",
        }
      );

      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
      setShowTextTypePanel(false);
    },
    [canvas, fieldTexts, getDataType, getObjectType, isRTL]
  );

  // Helper function for common shape properties
  const createShapeWithDefaults = useCallback(
    (shape: fabric.Object) => {
      if (!canvas) return;
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
      setShowShapePanel(false);
    },
    [canvas]
  );

  const addSquare = useCallback(() => {
    const square = new fabric.Rect({
      ...DEFAULT_OBJECT_POSITION,
      width: 80,
      height: 80,
      fill: "#3b82f6",
      stroke: "#1e40af",
      strokeWidth: 2,
    });
    createShapeWithDefaults(square);
  }, [createShapeWithDefaults]);

  const addRectangle = useCallback(() => {
    const rect = new fabric.Rect({
      ...DEFAULT_OBJECT_POSITION,
      width: 120,
      height: 60,
      fill: "#ef4444",
      stroke: "#dc2626",
      strokeWidth: 2,
    });
    createShapeWithDefaults(rect);
  }, [createShapeWithDefaults]);

  const addTriangle = useCallback(() => {
    const triangle = new fabric.Triangle({
      ...DEFAULT_OBJECT_POSITION,
      width: 80,
      height: 80,
      fill: "#10b981",
      stroke: "#059669",
      strokeWidth: 2,
    });
    createShapeWithDefaults(triangle);
  }, [createShapeWithDefaults]);

  const addCircle = useCallback(() => {
    const circle = new fabric.Circle({
      ...DEFAULT_OBJECT_POSITION,
      radius: 40,
      fill: "#f59e0b",
      stroke: "#d97706",
      strokeWidth: 2,
    });
    createShapeWithDefaults(circle);
  }, [createShapeWithDefaults]);

  // Memoized star points for better performance
  const starPoints = useMemo(
    () => [
      { x: 0, y: -50 },
      { x: 14.7, y: -15.4 },
      { x: 47.6, y: -15.4 },
      { x: 23.8, y: 6.2 },
      { x: 29.4, y: 40.4 },
      { x: 0, y: 20 },
      { x: -29.4, y: 40.4 },
      { x: -23.8, y: 6.2 },
      { x: -47.6, y: -15.4 },
      { x: -14.7, y: -15.4 },
    ],
    []
  );

  const addStar = useCallback(() => {
    const star = new fabric.Polygon(starPoints, {
      ...DEFAULT_OBJECT_POSITION,
      fill: "#8b5cf6",
      stroke: "#7c3aed",
      strokeWidth: 2,
    });
    createShapeWithDefaults(star);
  }, [starPoints, createShapeWithDefaults]);

  const addLine = useCallback(() => {
    const line = new fabric.Line([50, 100, 200, 100], {
      ...DEFAULT_OBJECT_POSITION,
      stroke: "#374151",
      strokeWidth: 3,
    });
    createShapeWithDefaults(line);
  }, [createShapeWithDefaults]);

  const addImage = useCallback(() => {
    if (!canvas) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imgUrl = event.target?.result as string;
          fabric.FabricImage.fromURL(imgUrl).then((img) => {
            img.set({
              ...DEFAULT_OBJECT_POSITION,
              scaleX: 0.5,
              scaleY: 0.5,
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
          });
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  }, [canvas]);

  const resetControls = useCallback(() => {
    setTransparency(0);
    setRotation(0);
    setObjectWidth(288);
    setObjectHeight(70);
  }, []);

  const deleteSelected = useCallback(() => {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    setSelectedObject(null);
    resetControls();
    canvas.renderAll();
  }, [canvas, selectedObject, resetControls]);

  const duplicateSelected = useCallback(() => {
    if (!canvas || !selectedObject) return;

    selectedObject.clone().then((cloned: fabric.Object) => {
      cloned.set({
        left: (selectedObject.left || 0) + 10,
        top: (selectedObject.top || 0) + 10,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  }, [canvas, selectedObject]);

  const flipHorizontal = useCallback(() => {
    if (!canvas || !selectedObject) return;
    selectedObject.set("flipX", !selectedObject.flipX);
    canvas.renderAll();
  }, [canvas, selectedObject]);

  const flipVertical = useCallback(() => {
    if (!canvas || !selectedObject) return;
    selectedObject.set("flipY", !selectedObject.flipY);
    canvas.renderAll();
  }, [canvas, selectedObject]);

  const updateObjectProperty = useCallback(
    (property: string, value: string | number | boolean) => {
      if (!canvas || !selectedObject) return;
      selectedObject.set(property, value);
      canvas.renderAll();
      setObjectUpdateTrigger((prev) => prev + 1);
    },
    [canvas, selectedObject]
  );

  const updateControlsFromObject = useCallback((obj: fabric.Object) => {
    setTransparency(Math.round((1 - (obj.opacity || 1)) * 100));
    setRotation(Math.round(obj.angle || 0));

    const width = Math.round((obj.width || 0) * (obj.scaleX || 1));
    const height = Math.round((obj.height || 0) * (obj.scaleY || 1));
    setObjectWidth(width);
    setObjectHeight(height);
  }, []);

  const handleTransparencyChange = useCallback(
    (value: number) => {
      setTransparency(value);
      if (selectedObject && canvas) {
        selectedObject.set("opacity", 1 - value / 100);
        canvas.renderAll();
      }
    },
    [selectedObject, canvas]
  );

  const handleRotationChange = useCallback(
    (value: number) => {
      setRotation(value);
      if (selectedObject && canvas) {
        selectedObject.set("angle", value);
        canvas.renderAll();
      }
    },
    [selectedObject, canvas]
  );

  const handleWidthChange = useCallback(
    (value: number | string) => {
      const width = typeof value === "string" ? parseInt(value) || 0 : value;
      setObjectWidth(width);
      if (selectedObject && canvas) {
        if (selectedObject.type === "circle") {
          selectedObject.set("radius", width / 2);
        } else if (
          selectedObject.type === "i-text" ||
          selectedObject.type === "text"
        ) {
          const scaleX = width / (selectedObject.width || 1);
          selectedObject.set("scaleX", scaleX);
        } else {
          selectedObject.set("width", width);
        }
        canvas.renderAll();
      }
    },
    [selectedObject, canvas]
  );

  const handleHeightChange = useCallback(
    (value: number | string) => {
      const height = typeof value === "string" ? parseInt(value) || 0 : value;
      setObjectHeight(height);
      if (selectedObject && canvas) {
        if (selectedObject.type === "circle") {
          selectedObject.set("radius", height / 2);
        } else if (
          selectedObject.type === "i-text" ||
          selectedObject.type === "text"
        ) {
          const scaleY = height / (selectedObject.height || 1);
          selectedObject.set("scaleY", scaleY);
        } else {
          selectedObject.set("height", height);
        }
        canvas.renderAll();
      }
    },
    [selectedObject, canvas]
  );

  const handleSmartFieldSelect = useCallback(
    (value: string | null) => {
      if (!canvas) return;

      // If there's a selected text object
      if (
        selectedObject &&
        (selectedObject.type === "i-text" || selectedObject.type === "text")
      ) {
        const textObj = selectedObject as fabric.Text;

        if (value) {
          // Convert to smart field
          textObj.set({
            isSmartField: true,
            smartFieldType: value,
            dataType: getDataType(value),
            objectType: getObjectType(value),
            backgroundColor: "#e3f2fd",
            padding: 4,
            editable: false,
          });
        } else {
          // Clear smart field (convert back to regular text)
          textObj.set({
            isSmartField: false,
            smartFieldType: "",
            dataType: "text",
            objectType: "general",
            backgroundColor: "transparent",
            padding: 0,
            editable: true,
          });
        }

        canvas.renderAll();
        setObjectUpdateTrigger((prev) => prev + 1);
      } else if (value) {
        // If no text object is selected and value is provided, create a new smart field
        const text = new fabric.IText(
          fieldTexts[value as keyof typeof fieldTexts] || value,
          {
            ...DEFAULT_OBJECT_POSITION,
            fontFamily: "Arial",
            fontSize: 16,
            fill: "#000000",
            isSmartField: true,
            smartFieldType: value,
            dataType: getDataType(value),
            objectType: getObjectType(value),
            backgroundColor: "#e3f2fd",
            padding: 4,
            editable: false,
            textAlign: isRTL ? "right" : "left",
            direction: isRTL ? "rtl" : "ltr",
          }
        );

        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
      }
    },
    [canvas, selectedObject, getDataType, getObjectType, fieldTexts, isRTL]
  );

  const toggleBold = useCallback(() => {
    if (selectedObject?.type === "i-text" || selectedObject?.type === "text") {
      const currentWeight = (selectedObject as fabric.Text).fontWeight;
      const newWeight = currentWeight === "bold" ? "normal" : "bold";
      updateObjectProperty("fontWeight", newWeight);
    }
  }, [selectedObject, updateObjectProperty]);

  const toggleItalic = useCallback(() => {
    if (selectedObject?.type === "i-text" || selectedObject?.type === "text") {
      const currentStyle = (selectedObject as fabric.Text).fontStyle;
      const newStyle = currentStyle === "italic" ? "normal" : "italic";
      updateObjectProperty("fontStyle", newStyle);
    }
  }, [selectedObject, updateObjectProperty]);

  const toggleUnderline = useCallback(() => {
    if (selectedObject?.type === "i-text" || selectedObject?.type === "text") {
      const currentUnderline = (selectedObject as fabric.Text).underline;
      const newUnderline = !currentUnderline;
      updateObjectProperty("underline", newUnderline);
    }
  }, [selectedObject, updateObjectProperty]);

  const toggleRTL = useCallback(() => {
    setIsRTL(!isRTL);
    if (selectedObject?.type === "i-text" || selectedObject?.type === "text") {
      const newDirection = !isRTL ? "rtl" : "ltr";
      const newAlign = !isRTL ? "right" : "left";
      updateObjectProperty("direction", newDirection);
      updateObjectProperty("textAlign", newAlign);
    }
  }, [isRTL, selectedObject, updateObjectProperty]);

  const alignLeft = useCallback(() => {
    if (selectedObject?.type === "i-text" || selectedObject?.type === "text") {
      updateObjectProperty("textAlign", "left");
    }
  }, [selectedObject, updateObjectProperty]);

  const alignCenter = useCallback(() => {
    if (selectedObject?.type === "i-text" || selectedObject?.type === "text") {
      updateObjectProperty("textAlign", "center");
    }
  }, [selectedObject, updateObjectProperty]);

  const alignRight = useCallback(() => {
    if (selectedObject?.type === "i-text" || selectedObject?.type === "text") {
      updateObjectProperty("textAlign", "right");
    }
  }, [selectedObject, updateObjectProperty]);

  const changeCanvasBackgroundColor = useCallback(
    (color: string) => {
      if (!canvas) return;
      setCanvasBackgroundColor(color);
      setCanvasBackgroundImage(null);
      canvas.backgroundColor = color;
      canvas.renderAll();

      setTimeout(() => {
        const canvasData = JSON.stringify(canvas.toJSON());
        if (currentSide === "front") {
          setFrontCanvasData(canvasData);
        } else {
          setBackCanvasData(canvasData);
        }
      }, 100);
    },
    [canvas, currentSide]
  );

  // Helper function for saving canvas data after background changes
  const saveCanvasDataAfterBackgroundChange = useCallback(() => {
    if (!canvas) return;
    setTimeout(() => {
      const canvasData = JSON.stringify(canvas.toJSON());
      if (currentSide === "front") {
        setFrontCanvasData(canvasData);
      } else {
        setBackCanvasData(canvasData);
      }
    }, 100);
  }, [canvas, currentSide]);

  const changeCanvasBackgroundImage = useCallback(() => {
    if (!canvas) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imgUrl = event.target?.result as string;
          setCanvasBackgroundImage(imgUrl);
          fabric.FabricImage.fromURL(imgUrl).then((img) => {
            const canvasWidth = canvas.getWidth();
            const canvasHeight = canvas.getHeight();
            const scaleX = canvasWidth / (img.width || 1);
            const scaleY = canvasHeight / (img.height || 1);

            img.set({ scaleX, scaleY });
            canvas.backgroundImage = img;
            canvas.renderAll();
            saveCanvasDataAfterBackgroundChange();
          });
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  }, [canvas, saveCanvasDataAfterBackgroundChange]);

  const removeCanvasBackground = useCallback(() => {
    if (!canvas) return;
    setCanvasBackgroundImage(null);
    setCanvasBackgroundColor("#ffffff");
    canvas.backgroundColor = "#ffffff";
    canvas.backgroundImage = undefined;
    canvas.renderAll();
    saveCanvasDataAfterBackgroundChange();
  }, [canvas, saveCanvasDataAfterBackgroundChange]);

  const undoAction = useCallback(() => {
    if (canvas && canvas.getObjects().length > 0) {
      const objects = canvas.getObjects();
      canvas.remove(objects[objects.length - 1]);
      canvas.renderAll();
    }
  }, [canvas]);

  const redoAction = useCallback(() => {
    // Placeholder for redo functionality - would need proper history management
  }, []);

  const saveDesign = useCallback(() => {
    if (!canvas) return;

    saveCurrentSideData();

    const templateData = {
      version: "1.0",
      canvasOrientation,
      canvasWidth: canvasOrientation === "horizontal" ? width : height,
      canvasHeight: canvasOrientation === "horizontal" ? height : width,
      frontCanvas: frontCanvasData
        ? JSON.parse(frontCanvasData)
        : currentSide === "front"
        ? canvas.toJSON()
        : null,
      backCanvas: backCanvasData
        ? JSON.parse(backCanvasData)
        : currentSide === "back"
        ? canvas.toJSON()
        : null,
      createdAt: new Date().toISOString(),
    };

    if (onSave) {
      onSave(templateData);
    }
  }, [
    canvas,
    saveCurrentSideData,
    canvasOrientation,
    width,
    height,
    frontCanvasData,
    currentSide,
    backCanvasData,
    onSave,
  ]);

  const importTemplate = (jsonData: any) => {
    if (!canvas) return;


    try {
      const parsedData = jsonData;

      // Check if this is a new comprehensive template format
      if (parsedData.version && parsedData.canvasOrientation) {
        // Handle new template format

        // Clear current data
        setFrontCanvasData(null);
        setBackCanvasData(null);

        // Load front and back canvas data
        if (parsedData.frontCanvas) {
          setFrontCanvasData(JSON.stringify(parsedData.frontCanvas));
        }
        if (parsedData.backCanvas) {
          setBackCanvasData(JSON.stringify(parsedData.backCanvas));
        }

        // Set canvas dimensions based on template orientation
        const templateCanvasWidth =
          parsedData.canvasOrientation === "horizontal" ? width : height;
        const templateCanvasHeight =
          parsedData.canvasOrientation === "horizontal" ? height : width;

        // Update canvas orientation if different
        if (parsedData.canvasOrientation !== canvasOrientation) {
          setCanvasOrientation(parsedData.canvasOrientation);
        }

        // Set canvas dimensions immediately
        canvas.setDimensions({
          width: templateCanvasWidth,
          height: templateCanvasHeight,
        });

        // Load the front canvas by default
        if (parsedData.frontCanvas) {
          canvas.loadFromJSON(parsedData.frontCanvas, () => {
            canvas.backgroundColor = "#ffffff";
            // Force multiple renders to ensure objects are visible
            canvas.renderAll();
            setTimeout(() => {
              canvas.renderAll();
              canvas.requestRenderAll();
            }, 100);
            setCurrentSide("front");
            setSelectedObject(null);
            setSelectedObjects([]);
            resetControls();
            console.log("Comprehensive template imported successfully");
          });
        } else {
          // No front canvas data, just clear and set orientation
          canvas.clear();
          canvas.backgroundColor = "#ffffff";
          canvas.renderAll();
          setCurrentSide("front");
          setSelectedObject(null);
          setSelectedObjects([]);
          resetControls();
        }
      } else {
        // Handle legacy template format (single canvas)
        canvas.clear();

        // Check if template has canvas dimensions and adjust if needed
        const currentCanvasWidth =
          canvasOrientation === "horizontal" ? width : height;
        const currentCanvasHeight =
          canvasOrientation === "horizontal" ? height : width;

        // If template has different dimensions, we might need to adjust
        if (parsedData.width && parsedData.height) {
          const templateWidth = parsedData.width;
          const templateHeight = parsedData.height;

          // Calculate scale factors if dimensions don't match
          const scaleX = currentCanvasWidth / templateWidth;
          const scaleY = currentCanvasHeight / templateHeight;

          // If dimensions are significantly different, scale objects
          if (Math.abs(scaleX - 1) > 0.1 || Math.abs(scaleY - 1) > 0.1) {
            if (parsedData.objects) {
              parsedData.objects.forEach((obj: Record<string, unknown>) => {
                if (typeof obj.left === "number") obj.left *= scaleX;
                if (typeof obj.top === "number") obj.top *= scaleY;
                if (typeof obj.width === "number") obj.width *= scaleX;
                if (typeof obj.height === "number") obj.height *= scaleY;
                if (typeof obj.scaleX === "number") obj.scaleX *= scaleX;
                if (typeof obj.scaleY === "number") obj.scaleY *= scaleY;
              });
            }
          }

          // Update canvas dimensions in the data
          parsedData.width = currentCanvasWidth;
          parsedData.height = currentCanvasHeight;
        }

        // Load the imported template
        canvas.loadFromJSON(parsedData, () => {
          // Ensure canvas dimensions are correct
          canvas.setDimensions({
            width: currentCanvasWidth,
            height: currentCanvasHeight,
          });
          canvas.backgroundColor = "#ffffff";
          // Force multiple renders to ensure objects are visible
          canvas.renderAll();
          setTimeout(() => {
            canvas.renderAll();
            canvas.requestRenderAll();
          }, 100);
          setSelectedObject(null);
          setSelectedObjects([]);
          resetControls();
          console.log("Legacy template imported successfully");
        });
      }
    } catch (error) {
      console.error("Error importing template:", error);
      alert(
        "Error importing template. Please make sure the file is a valid JSON template."
      );
    }
  };

  const alignObjects = useCallback(
    (alignment: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
      if (!canvas || selectedObjects.length < 2) return;

      const objects = selectedObjects;
      let referenceValue: number;

      switch (alignment) {
        case "left":
          referenceValue = Math.min(...objects.map((obj) => obj.left || 0));
          objects.forEach((obj) => obj.set("left", referenceValue));
          break;
        case "right":
          referenceValue = Math.max(
            ...objects.map(
              (obj) => (obj.left || 0) + (obj.width || 0) * (obj.scaleX || 1)
            )
          );
          objects.forEach((obj) => {
            const objWidth = (obj.width || 0) * (obj.scaleX || 1);
            obj.set("left", referenceValue - objWidth);
          });
          break;
        case "center":
          const leftMost = Math.min(...objects.map((obj) => obj.left || 0));
          const rightMost = Math.max(
            ...objects.map(
              (obj) => (obj.left || 0) + (obj.width || 0) * (obj.scaleX || 1)
            )
          );
          referenceValue = (leftMost + rightMost) / 2;
          objects.forEach((obj) => {
            const objWidth = (obj.width || 0) * (obj.scaleX || 1);
            obj.set("left", referenceValue - objWidth / 2);
          });
          break;
        case "top":
          referenceValue = Math.min(...objects.map((obj) => obj.top || 0));
          objects.forEach((obj) => obj.set("top", referenceValue));
          break;
        case "bottom":
          referenceValue = Math.max(
            ...objects.map(
              (obj) => (obj.top || 0) + (obj.height || 0) * (obj.scaleY || 1)
            )
          );
          objects.forEach((obj) => {
            const objHeight = (obj.height || 0) * (obj.scaleY || 1);
            obj.set("top", referenceValue - objHeight);
          });
          break;
        case "middle":
          const topMost = Math.min(...objects.map((obj) => obj.top || 0));
          const bottomMost = Math.max(
            ...objects.map(
              (obj) => (obj.top || 0) + (obj.height || 0) * (obj.scaleY || 1)
            )
          );
          referenceValue = (topMost + bottomMost) / 2;
          objects.forEach((obj) => {
            const objHeight = (obj.height || 0) * (obj.scaleY || 1);
            obj.set("top", referenceValue - objHeight / 2);
          });
          break;
      }

      canvas.renderAll();
    },
    [canvas, selectedObjects]
  );

  const distributeObjects = useCallback(
    (direction: "horizontal" | "vertical") => {
      if (!canvas || selectedObjects.length < 3) return;

      const objects = [...selectedObjects];

      if (direction === "horizontal") {
        objects.sort((a, b) => (a.left || 0) - (b.left || 0));

        const leftMost = objects[0].left || 0;
        const rightMost =
          (objects[objects.length - 1].left || 0) +
          (objects[objects.length - 1].width || 0) *
            (objects[objects.length - 1].scaleX || 1);
        const totalSpace = rightMost - leftMost;
        const spacing = totalSpace / (objects.length - 1);

        objects.forEach((obj, index) => {
          if (index > 0 && index < objects.length - 1) {
            obj.set("left", leftMost + spacing * index);
          }
        });
      } else {
        objects.sort((a, b) => (a.top || 0) - (b.top || 0));

        const topMost = objects[0].top || 0;
        const bottomMost =
          (objects[objects.length - 1].top || 0) +
          (objects[objects.length - 1].height || 0) *
            (objects[objects.length - 1].scaleY || 1);
        const totalSpace = bottomMost - topMost;
        const spacing = totalSpace / (objects.length - 1);

        objects.forEach((obj, index) => {
          if (index > 0 && index < objects.length - 1) {
            obj.set("top", topMost + spacing * index);
          }
        });
      }

      canvas.renderAll();
    },
  );

  const saveBothSides = async () => {
    if (!canvas) return;

    // Save current side data
    saveCurrentSideData();

    // Save front side
    if (frontCanvasData || currentSide === "front") {
      const frontDataURL =
        currentSide === "front"
          ? canvas.toDataURL({ format: "png", quality: 1, multiplier: 1 })
          : await generateImageFromData(frontCanvasData);

      if (frontDataURL) {
        const frontLink = document.createElement("a");
        frontLink.download = "id-card-front.png";
        frontLink.href = frontDataURL;
        frontLink.click();
      }
    }

    // Save back side with a small delay
    setTimeout(async () => {
      if (backCanvasData || currentSide === "back") {
        const backDataURL =
          currentSide === "back"
            ? canvas.toDataURL({ format: "png", quality: 1, multiplier: 1 })
            : await generateImageFromData(backCanvasData);

        if (backDataURL) {
          const backLink = document.createElement("a");
          backLink.download = "id-card-back.png";
          backLink.href = backDataURL;
          backLink.click();
        }
      }
    }, 500);
  };

  const generateImageFromData = async (
    canvasData: string | null
  ): Promise<string | null> => {
    if (!canvasData || !canvas) return null;

    return new Promise((resolve) => {
      const tempCanvas = new fabric.Canvas(document.createElement("canvas"), {
        width: width,
        height: height,
        backgroundColor: "#ffffff",
      });

      tempCanvas.loadFromJSON(canvasData, () => {
        const dataURL = tempCanvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 1,
        });
        tempCanvas.dispose();
        resolve(dataURL);
      });
    });
  };

  return (
    <Box
      style={{ display: "flex", height: "100vh", backgroundColor: "#fafbfc" }}
    >
      {/* Left Sidebar */}
      <Box
        style={{
          width: 72,
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e9ecef",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px 0",
          boxShadow: "0 0 10px rgba(0,0,0,0.05)",
        }}
      >
        <Stack gap="lg" align="center">
          <ActionIcon
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
            size="xl"
            onClick={addText}
            style={{ borderRadius: "12px" }}
          >
            <IconLetterT size={22} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            size="xl"
            onClick={addImage}
            style={{ borderRadius: "12px", color: "#495057" }}
          >
            <IconPhoto size={22} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            size="xl"
            onClick={addShape}
            style={{ borderRadius: "12px", color: "#495057" }}
          >
            <IconShape size={22} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            size="xl"
            style={{ borderRadius: "12px", color: "#495057" }}
          >
            <IconSettings size={22} />
          </ActionIcon>

          <ActionIcon
            variant="subtle"
            size="xl"
            style={{ borderRadius: "12px", color: "#495057" }}
          >
            <IconAccessible size={22} />
          </ActionIcon>
        </Stack>
      </Box>

      {/* Text Type Selection Panel - Left */}
      {showTextTypePanel && (
        <Paper
          style={{
            width: 280,
            borderRadius: 0,
            borderRight: "1px solid #e9ecef",
            backgroundColor: "#ffffff",
            boxShadow: "0 0 15px rgba(0,0,0,0.05)",
          }}
        >
          <Box p="lg">
            <Group justify="space-between" align="center" mb="lg">
              <Text size="lg" fw={700} c="#212529">
                {t("panels.objects")}
              </Text>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => setShowTextTypePanel(false)}
              >
                <Text size="lg" c="#6c757d">
                  ×
                </Text>
              </ActionIcon>
            </Group>

            <Stack gap="lg">
              {/* Static Text Section */}
              <div>
                <Text size="md" fw={600} c="#495057" mb="md">
                  {t("addText")}
                </Text>
                <Stack gap="sm">
                  <Button
                    variant="light"
                    size="md"
                    fullWidth
                    onClick={() => addStaticText("single")}
                    leftSection={<Text size="lg">T</Text>}
                    styles={{
                      root: {
                        justifyContent: "flex-start",
                        paddingLeft: "16px",
                        height: "48px",
                      },
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <Text size="sm" fw={500}>
                        {t("textTypes.singleLine")}
                      </Text>
                    </div>
                  </Button>
                  <Button
                    variant="light"
                    size="md"
                    fullWidth
                    onClick={() => addStaticText("multi")}
                    leftSection={<Text size="lg">≡</Text>}
                    styles={{
                      root: {
                        justifyContent: "flex-start",
                        paddingLeft: "16px",
                        height: "48px",
                      },
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <Text size="sm" fw={500}>
                        {t("textTypes.multiLine")}
                      </Text>
                    </div>
                  </Button>
                </Stack>
              </div>

              {/* Variable Text Section */}
              <div>
                <Group gap="xs" mb="md">
                  <Text size="md" fw={600} c="#495057">
                    {t("textTypes.smartFields")}
                  </Text>
                  <ActionIcon size="xs" variant="subtle">
                    <Text size="xs" c="#6c757d">
                      ?
                    </Text>
                  </ActionIcon>
                </Group>
                <Stack gap="sm">
                  <Button
                    variant="light"
                    size="md"
                    fullWidth
                    onClick={() => addVariableText("name")}
                    styles={{
                      root: {
                        justifyContent: "flex-start",
                        paddingLeft: "16px",
                        height: "48px",
                      },
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <Text size="sm" fw={500}>
                        {t("smartFields.name")}
                      </Text>
                    </div>
                  </Button>
                  <Button
                    variant="light"
                    size="md"
                    fullWidth
                    onClick={() => addVariableText("id")}
                    styles={{
                      root: {
                        justifyContent: "flex-start",
                        paddingLeft: "16px",
                        height: "48px",
                      },
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <Text size="sm" fw={500}>
                        {t("smartFields.id")}
                      </Text>
                    </div>
                  </Button>
                  <Button
                    variant="light"
                    size="md"
                    fullWidth
                    onClick={() => addVariableText("date")}
                    styles={{
                      root: {
                        justifyContent: "flex-start",
                        paddingLeft: "16px",
                        height: "48px",
                      },
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <Text size="sm" fw={500}>
                        {t("smartFields.date")}
                      </Text>
                    </div>
                  </Button>
                  <Button
                    variant="light"
                    size="md"
                    fullWidth
                    onClick={() => addVariableText("department")}
                    styles={{
                      root: {
                        justifyContent: "flex-start",
                        paddingLeft: "16px",
                        height: "48px",
                      },
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <Text size="sm" fw={500}>
                        {t("smartFields.department")}
                      </Text>
                    </div>
                  </Button>
                </Stack>
              </div>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Field Selection Panel - Left */}
      {showFieldPanel && (
        <Paper
          style={{
            width: 280,
            borderRadius: 0,
            borderRight: "1px solid #e9ecef",
            backgroundColor: "#ffffff",
            boxShadow: "0 0 15px rgba(0,0,0,0.05)",
          }}
        >
          <Box p="lg">
            <Group justify="space-between" align="center" mb="lg">
              <Text size="lg" fw={700} c="#212529">
                {t("panels.smartFields")}
              </Text>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => setShowFieldPanel(false)}
              >
                <Text size="lg" c="#6c757d">
                  ×
                </Text>
              </ActionIcon>
            </Group>

            <Stack gap="sm">
              {[
                { value: "name", label: t("smartFields.name"), icon: "👤" },
                { value: "id", label: t("smartFields.id"), icon: "🆔" },
                { value: "date", label: t("smartFields.date"), icon: "📅" },
                {
                  value: "department",
                  label: t("smartFields.department"),
                  icon: "🏢",
                },
              ].map((field) => (
                <Button
                  key={field.value}
                  variant="light"
                  size="md"
                  fullWidth
                  onClick={() => {
                    handleSmartFieldSelect(field.value);
                    setShowFieldPanel(false);
                  }}
                  leftSection={<Text size="lg">{field.icon}</Text>}
                  styles={{
                    root: {
                      justifyContent: "flex-start",
                      paddingLeft: "16px",
                      height: "48px",
                    },
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <Text size="sm" fw={500}>
                      {field.label}
                    </Text>
                  </div>
                </Button>
              ))}
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Shape Selection Panel - Left */}
      {showShapePanel && (
        <Paper
          style={{
            width: 280,
            borderRadius: 0,
            borderRight: "1px solid #e9ecef",
            backgroundColor: "#ffffff",
            boxShadow: "0 0 15px rgba(0,0,0,0.05)",
          }}
        >
          <Box p="lg">
            <Group justify="space-between" align="center" mb="lg">
              <Text size="lg" fw={700} c="#212529">
                {t("panels.shapes")}
              </Text>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => setShowShapePanel(false)}
              >
                <Text size="lg" c="#6c757d">
                  ×
                </Text>
              </ActionIcon>
            </Group>

            <Stack gap="lg">
              {/* Basic Shapes */}
              <div>
                <Text size="md" fw={600} c="#495057" mb="md">
                  {t("shapes.basicShapes")}
                </Text>
                <Stack gap="sm">
                  <Button
                    variant="light"
                    size="md"
                    fullWidth
                    onClick={addSquare}
                    leftSection={<IconSquare size={18} />}
                    styles={{
                      root: {
                        justifyContent: "flex-start",
                        paddingLeft: "16px",
                        height: "48px",
                      },
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <Text size="sm" fw={500}>
                        {t("shapes.square")}
                      </Text>
                    </div>
                  </Button>
                  <Button
                    variant="light"
                    size="md"
                    fullWidth
                    onClick={addRectangle}
                    leftSection={<IconSquare size={18} />}
                    styles={{
                      root: {
                        justifyContent: "flex-start",
                        paddingLeft: "16px",
                        height: "48px",
                      },
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <Text size="sm" fw={500}>
                        {t("shapes.rectangle")}
                      </Text>
                    </div>
                  </Button>
                  <Button
                    variant="light"
                    size="md"
                    fullWidth
                    onClick={addTriangle}
                    leftSection={<IconTriangle size={18} />}
                    styles={{
                      root: {
                        justifyContent: "flex-start",
                        paddingLeft: "16px",
                        height: "48px",
                      },
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <Text size="sm" fw={500}>
                        {t("shapes.triangle")}
                      </Text>
                    </div>
                  </Button>
                  <Button
                    variant="light"
                    size="md"
                    fullWidth
                    onClick={addCircle}
                    leftSection={<IconCircle size={18} />}
                    styles={{
                      root: {
                        justifyContent: "flex-start",
                        paddingLeft: "16px",
                        height: "48px",
                      },
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <Text size="sm" fw={500}>
                        {t("shapes.circle")}
                      </Text>
                    </div>
                  </Button>
                  <Button
                    variant="light"
                    size="md"
                    fullWidth
                    onClick={addStar}
                    leftSection={<IconStar size={18} />}
                    styles={{
                      root: {
                        justifyContent: "flex-start",
                        paddingLeft: "16px",
                        height: "48px",
                      },
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <Text size="sm" fw={500}>
                        {t("shapes.star")}
                      </Text>
                    </div>
                  </Button>
                  <Button
                    variant="light"
                    size="md"
                    fullWidth
                    onClick={addLine}
                    leftSection={<IconMinus size={18} />}
                    styles={{
                      root: {
                        justifyContent: "flex-start",
                        paddingLeft: "16px",
                        height: "48px",
                      },
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <Text size="sm" fw={500}>
                        {t("shapes.line")}
                      </Text>
                    </div>
                  </Button>
                </Stack>
              </div>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Main Canvas Area */}
      <Box
        style={{ flex: 1, backgroundColor: "#ffffff", position: "relative" }}
      >
        {/* Top Toolbar */}
        <Box
          style={{
            height: 60,
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e9ecef",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Group gap="sm">
            <ActionIcon
              variant="subtle"
              size="md"
              radius="sm"
              onClick={undoAction}
            >
              <IconArrowBackUp size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="md"
              radius="sm"
              onClick={redoAction}
            >
              <IconArrowForwardUp size={16} />
            </ActionIcon>

            {/* Canvas Orientation Controls */}
            <Divider orientation="vertical" />
            <Group gap="xs">
              <Text size="xs" c="#6c757d">
                {t("canvas.orientation")}:
              </Text>
              <Button.Group>
                <Button
                  variant={
                    canvasOrientation === "horizontal" ? "filled" : "outline"
                  }
                  size="xs"
                  onClick={() => setCanvasOrientation("horizontal")}
                >
                  {t("canvas.horizontal")}
                </Button>
                <Button
                  variant={
                    canvasOrientation === "vertical" ? "filled" : "outline"
                  }
                  size="xs"
                  onClick={() => setCanvasOrientation("vertical")}
                >
                  {t("canvas.vertical")}
                </Button>
              </Button.Group>
            </Group>

            {/* Zoom Controls */}
            <Divider orientation="vertical" />
            <Group gap="xs">
              <Text size="xs" c="#6c757d">
                {t("canvas.zoom")}:
              </Text>
              <ActionIcon
                variant="subtle"
                size="md"
                radius="sm"
                onClick={() => setZoomLevel((prev) => Math.max(25, prev - 25))}
                disabled={zoomLevel <= 25}
                title={t("canvas.zoomOut")}
              >
                <IconZoomOut size={16} />
              </ActionIcon>
              <Text
                size="xs"
                c="#495057"
                style={{ minWidth: "40px", textAlign: "center" }}
              >
                {zoomLevel}%
              </Text>
              <ActionIcon
                variant="subtle"
                size="md"
                radius="sm"
                onClick={() => setZoomLevel((prev) => Math.min(200, prev + 25))}
                disabled={zoomLevel >= 200}
                title={t("canvas.zoomIn")}
              >
                <IconZoomIn size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                size="md"
                radius="sm"
                onClick={() => setZoomLevel(100)}
                title={t("canvas.resetZoom")}
              >
                <IconZoom size={16} />
              </ActionIcon>
            </Group>

            {/* Alignment Controls - Show when multiple objects are selected */}
            {selectedObjects.length > 1 && (
              <>
                <Divider orientation="vertical" />
                <Group gap="xs">
                  <Text size="xs" c="#6c757d">
                    {t("alignment.title")}:
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    radius="sm"
                    onClick={() => alignObjects("left")}
                    title={t("alignment.left")}
                  >
                    <IconAlignLeft size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    radius="sm"
                    onClick={() => alignObjects("center")}
                    title={t("alignment.center")}
                  >
                    <IconAlignCenter size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    radius="sm"
                    onClick={() => alignObjects("right")}
                    title={t("alignment.right")}
                  >
                    <IconAlignRight size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    radius="sm"
                    onClick={() => alignObjects("top")}
                    title={t("alignment.top")}
                  >
                    <IconAlignBoxTopCenter size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    radius="sm"
                    onClick={() => alignObjects("middle")}
                    title={t("alignment.middle")}
                  >
                    <IconAlignBoxCenterMiddle size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    radius="sm"
                    onClick={() => alignObjects("bottom")}
                    title={t("alignment.bottom")}
                  >
                    <IconAlignBoxBottomCenter size={16} />
                  </ActionIcon>
                  {selectedObjects.length >= 3 && (
                    <>
                      <ActionIcon
                        variant="subtle"
                        size="md"
                        radius="sm"
                        onClick={() => distributeObjects("horizontal")}
                        title={t("alignment.distributeHorizontal")}
                      >
                        <IconLayoutDistributeHorizontal size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        size="md"
                        radius="sm"
                        onClick={() => distributeObjects("vertical")}
                        title={t("alignment.distributeVertical")}
                      >
                        <IconLayoutDistributeVertical size={16} />
                      </ActionIcon>
                    </>
                  )}
                </Group>
              </>
            )}
          </Group>

          <Group gap="sm">
            {/* <ActionIcon
              variant="subtle"
              size="md"
              radius="sm"
              onClick={importTemplate}
              title={t('actions.importTemplate')}
              color="green"
            >
              <IconUpload size={16} />
            </ActionIcon> */}
            <ActionIcon
              variant="gradient"
              gradient={{ from: "blue", to: "cyan" }}
              size="md"
              radius="sm"
              onClick={saveBothSides}
            >
              <IconDownload size={16} />
            </ActionIcon>
            <ActionIcon
              variant="outline"
              size="md"
              radius="sm"
              onClick={saveDesign}
              color="blue"
            >
              <IconDeviceFloppy size={16} />
            </ActionIcon>
          </Group>
        </Box>

        {/* Canvas Container */}
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100vh - 120px)",
            padding: 16,
            backgroundColor: "#fafbfc",
            overflow: "auto",
          }}
        >
          <Paper
            style={{
              position: "relative",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                border: "2px solid #dee2e6",
                borderRadius: 12,
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
              }}
            />

            {/* Canvas Tabs */}
            <Box
              style={{
                position: "absolute",
                bottom: -60,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#ffffff",
                borderRadius: "6px",
                padding: "4px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e9ecef",
              }}
            >
              <Group gap="xs">
                <Button
                  variant={currentSide === "front" ? "gradient" : "subtle"}
                  gradient={{ from: "blue", to: "cyan" }}
                  size="sm"
                  radius="sm"
                  onClick={() => switchSide("front")}
                  style={{
                    backgroundColor:
                      currentSide !== "front" ? "#f8f9fa" : undefined,
                    color: currentSide !== "front" ? "#495057" : undefined,
                    border:
                      currentSide !== "front" ? "1px solid #dee2e6" : undefined,
                  }}
                >
                  {t("canvas.front")}
                </Button>
                <Button
                  variant={currentSide === "back" ? "gradient" : "subtle"}
                  gradient={{ from: "blue", to: "cyan" }}
                  size="sm"
                  radius="sm"
                  onClick={() => switchSide("back")}
                  style={{
                    backgroundColor:
                      currentSide !== "back" ? "#f8f9fa" : undefined,
                    color: currentSide !== "back" ? "#495057" : undefined,
                    border:
                      currentSide !== "back" ? "1px solid #dee2e6" : undefined,
                  }}
                >
                  {t("canvas.back")}
                </Button>
              </Group>
            </Box>
          </Paper>
        </Box>
      </Box>
      {/* Properties Panel */}
      {!showFieldPanel && !showTextTypePanel && (
        <Paper
          style={{
            width: 320,
            height: "100vh",
            borderRadius: 0,
            borderRight: "1px solid #e9ecef",
            backgroundColor: "#ffffff",
            boxShadow: "0 0 15px rgba(0,0,0,0.05)",
            overflowY: "auto",
          }}
        >
          <Box p="xl">
            <Text size="lg" fw={700} mb="xl" c="#212529">
              {t("panels.properties")}
            </Text>

            {/* Canvas Selection Indicator */}
            {canvasSelected && (
              <Paper
                p="sm"
                mb="xl"
                style={{
                  backgroundColor: "#e3f2fd",
                  border: "1px solid #2196f3",
                }}
              >
                <Group gap="xs">
                  <Text size="sm" fw={600} c="#1976d2">
                    🎨 {t("canvas.selectCanvas")}
                  </Text>
                </Group>
                <Text size="xs" c="#1976d2" mt={4}>
                  انقر على عنصر لتحرير خصائصه، أو قم بتعديل خلفية اللوحة أدناه.
                </Text>
              </Paper>
            )}

            {/* Add Text Section */}
            <Stack gap="md" mb="xl">
              <Text size="sm" fw={600} c="#495057">
                {t("labels.textContent")}
              </Text>
              {selectedObject &&
              (
                selectedObject as fabric.Text & {
                  isSmartField?: boolean;
                  smartFieldType?: string;
                }
              ).isSmartField ? (
                <Box>
                  <TextInput
                    placeholder={t("placeholders.smartField")}
                    size="xs"
                    radius="xs"
                    value={(selectedObject as fabric.Text).text || ""}
                    disabled={true}
                    styles={{
                      input: {
                        backgroundColor: "#e3f2fd",
                        border: "1px solid #2196f3",
                        color: "#1976d2",
                        fontWeight: 500,
                      },
                    }}
                  />
                  <Text size="xs" c="#1976d2" mt={4}>
                    🔒 {t("smartFields.indicator")}:{" "}
                    {(
                      selectedObject as fabric.Text & {
                        smartFieldType?: string;
                      }
                    ).smartFieldType || t("smartFields.unknown")}
                  </Text>
                </Box>
              ) : (
                <TextInput
                  placeholder={t("placeholders.enterTextHere")}
                  size="xs"
                  radius="xs"
                  value={
                    selectedObject?.type === "i-text"
                      ? (selectedObject as fabric.IText).text
                      : ""
                  }
                  onChange={(e) => {
                    if (selectedObject?.type === "i-text" && canvas) {
                      (selectedObject as fabric.IText).set(
                        "text",
                        e.target.value
                      );
                      canvas.renderAll();
                    }
                  }}
                  disabled={selectedObject?.type !== "i-text"}
                  styles={{
                    input: {
                      backgroundColor:
                        selectedObject?.type !== "i-text"
                          ? "#f8f9fa"
                          : "#ffffff",
                      border: "1px solid #dee2e6",
                      "&:focus": {
                        borderColor: "#339af0",
                      },
                    },
                  }}
                />
              )}
            </Stack>

            {/* Smart Field Section */}
            <Stack gap="md" mb="xl">
              <Group justify="space-between" align="center">
                <Text size="sm" fw={600} c="#495057">
                  {t("smartFields.title")}
                </Text>
                <ActionIcon size="sm" variant="subtle" radius="md">
                  <Text size="sm" c="#6c757d">
                    ?
                  </Text>
                </ActionIcon>
              </Group>
              <Select
                placeholder={t("placeholders.selectSmartField")}
                size="xs"
                radius="xs"
                data={[
                  { value: "name", label: "👤 الاسم" },
                  { value: "id", label: "🆔 رقم الهوية" },
                  { value: "date", label: "📅 التاريخ" },
                  { value: "department", label: "🏢 القسم" },
                  { value: "age", label: "🔢 العمر" },
                ]}
                value={
                  selectedObject &&
                  (selectedObject.type === "i-text" ||
                    selectedObject.type === "text") &&
                  (
                    selectedObject as fabric.Text & {
                      isSmartField?: boolean;
                      smartFieldType?: string;
                    }
                  )?.isSmartField
                    ? (
                        selectedObject as fabric.Text & {
                          smartFieldType?: string;
                        }
                      )?.smartFieldType || null
                    : null
                }
                onChange={handleSmartFieldSelect}
                clearable
                styles={{
                  input: {
                    backgroundColor: "#ffffff",
                    border: "1px solid #dee2e6",
                    "&:focus": {
                      borderColor: "#339af0",
                    },
                  },
                }}
              />
            </Stack>

            {/* Text Style Section */}
            <Stack gap="md" mb="xl">
              <Text size="sm" fw={600} c="#495057">
                {t("labels.typography")}
              </Text>
              <Group gap="md">
                <Select
                  placeholder={t("placeholders.fontFamily")}
                  size="xs"
                  radius="xs"
                  style={{ flex: 1 }}
                  data={[
                    { value: "Arial", label: "Arial" },
                    { value: "Fira Sans", label: "Fira Sans" },
                    { value: "Helvetica", label: "Helvetica" },
                    { value: "Times New Roman", label: "Times New Roman" },
                    { value: "Georgia", label: "Georgia" },
                  ]}
                  value={
                    selectedObject?.type === "i-text" ||
                    selectedObject?.type === "text"
                      ? (selectedObject as fabric.Text).fontFamily
                      : undefined
                  }
                  onChange={(value) => {
                    if (
                      (selectedObject?.type === "i-text" ||
                        selectedObject?.type === "text") &&
                      canvas &&
                      value
                    ) {
                      (selectedObject as fabric.Text).set("fontFamily", value);
                      canvas.renderAll();
                      setObjectUpdateTrigger((prev) => prev + 1);
                    }
                  }}
                  disabled={
                    selectedObject?.type !== "i-text" &&
                    selectedObject?.type !== "text"
                  }
                  styles={{
                    input: {
                      backgroundColor:
                        selectedObject?.type !== "i-text" &&
                        selectedObject?.type !== "text"
                          ? "#f8f9fa"
                          : "#ffffff",
                      border: "1px solid #dee2e6",
                    },
                  }}
                />
                <NumberInput
                  size="xs"
                  radius="xs"
                  w={60}
                  placeholder={t("placeholders.fontSize")}
                  value={
                    selectedObject?.type === "i-text" ||
                    selectedObject?.type === "text"
                      ? (selectedObject as fabric.Text).fontSize
                      : undefined
                  }
                  onChange={(value) => {
                    if (
                      (selectedObject?.type === "i-text" ||
                        selectedObject?.type === "text") &&
                      canvas &&
                      value
                    ) {
                      const numValue =
                        typeof value === "string"
                          ? parseInt(value) || 16
                          : value;
                      (selectedObject as fabric.Text).set("fontSize", numValue);
                      canvas.renderAll();
                      setObjectUpdateTrigger((prev) => prev + 1);
                    }
                  }}
                  min={8}
                  max={72}
                  disabled={
                    selectedObject?.type !== "i-text" &&
                    selectedObject?.type !== "text"
                  }
                  styles={{
                    input: {
                      backgroundColor:
                        selectedObject?.type !== "i-text" &&
                        selectedObject?.type !== "text"
                          ? "#f8f9fa"
                          : "#ffffff",
                      border: "1px solid #dee2e6",
                    },
                  }}
                />
              </Group>

              {/* Text formatting buttons */}
              <Group gap="xs" mt="xs">
                <ActionIcon
                  variant={
                    (selectedObject?.type === "i-text" ||
                      selectedObject?.type === "text") &&
                    (selectedObject as fabric.Text).fontWeight === "bold"
                      ? "gradient"
                      : "subtle"
                  }
                  gradient={{ from: "blue", to: "cyan" }}
                  size="sm"
                  radius="sm"
                  onClick={toggleBold}
                  disabled={
                    selectedObject?.type !== "i-text" &&
                    selectedObject?.type !== "text"
                  }
                >
                  <IconBold size={14} />
                </ActionIcon>
                <ActionIcon
                  variant={
                    (selectedObject?.type === "i-text" ||
                      selectedObject?.type === "text") &&
                    (selectedObject as fabric.Text).fontStyle === "italic"
                      ? "gradient"
                      : "subtle"
                  }
                  gradient={{ from: "blue", to: "cyan" }}
                  size="sm"
                  radius="sm"
                  onClick={toggleItalic}
                  disabled={
                    selectedObject?.type !== "i-text" &&
                    selectedObject?.type !== "text"
                  }
                >
                  <IconItalic size={14} />
                </ActionIcon>
                <ActionIcon
                  variant={
                    (selectedObject?.type === "i-text" ||
                      selectedObject?.type === "text") &&
                    (selectedObject as fabric.Text).underline
                      ? "gradient"
                      : "subtle"
                  }
                  gradient={{ from: "blue", to: "cyan" }}
                  size="sm"
                  radius="sm"
                  onClick={toggleUnderline}
                  disabled={
                    selectedObject?.type !== "i-text" &&
                    selectedObject?.type !== "text"
                  }
                >
                  <IconUnderline size={14} />
                </ActionIcon>
              </Group>

              {/* Text alignment and direction controls */}
              <Group gap="xs" mt="xs">
                <ActionIcon
                  variant={
                    (selectedObject?.type === "i-text" ||
                      selectedObject?.type === "text") &&
                    (selectedObject as fabric.Text).textAlign === "left"
                      ? "gradient"
                      : "subtle"
                  }
                  gradient={{ from: "blue", to: "cyan" }}
                  size="sm"
                  radius="sm"
                  onClick={alignLeft}
                  disabled={
                    selectedObject?.type !== "i-text" &&
                    selectedObject?.type !== "text"
                  }
                >
                  <IconAlignLeft size={14} />
                </ActionIcon>
                <ActionIcon
                  variant={
                    (selectedObject?.type === "i-text" ||
                      selectedObject?.type === "text") &&
                    (selectedObject as fabric.Text).textAlign === "center"
                      ? "gradient"
                      : "subtle"
                  }
                  gradient={{ from: "blue", to: "cyan" }}
                  size="sm"
                  radius="sm"
                  onClick={alignCenter}
                  disabled={
                    selectedObject?.type !== "i-text" &&
                    selectedObject?.type !== "text"
                  }
                >
                  <IconAlignCenter size={14} />
                </ActionIcon>
                <ActionIcon
                  variant={
                    (selectedObject?.type === "i-text" ||
                      selectedObject?.type === "text") &&
                    (selectedObject as fabric.Text).textAlign === "right"
                      ? "gradient"
                      : "subtle"
                  }
                  gradient={{ from: "blue", to: "cyan" }}
                  size="sm"
                  radius="sm"
                  onClick={alignRight}
                  disabled={
                    selectedObject?.type !== "i-text" &&
                    selectedObject?.type !== "text"
                  }
                >
                  <IconAlignRight size={14} />
                </ActionIcon>
                <Divider orientation="vertical" />
                <ActionIcon
                  variant={isRTL ? "gradient" : "subtle"}
                  gradient={{ from: "orange", to: "red" }}
                  size="sm"
                  radius="sm"
                  onClick={toggleRTL}
                  disabled={
                    selectedObject?.type !== "i-text" &&
                    selectedObject?.type !== "text"
                  }
                  title={t("messages.toggleRTL")}
                >
                  <Text size="xs" fw={600}>
                    RTL
                  </Text>
                </ActionIcon>
              </Group>
            </Stack>

            {/* Data Type Section */}
            {(selectedObject?.type === "i-text" ||
              selectedObject?.type === "text") && (
              <Stack gap="md" mb="xl">
                <Text size="sm" fw={600} c="#495057">
                  {t("labels.dataType")}
                </Text>
                <Select
                  placeholder={t("placeholders.selectDataType")}
                  size="xs"
                  radius="xs"
                  data={[
                    { value: "text", label: `📝 ${t("dataTypes.text")}` },
                    { value: "number", label: `🔢 ${t("dataTypes.number")}` },
                    { value: "date", label: `📅 ${t("dataTypes.date")}` },
                  ]}
                  value={
                    (selectedObject as fabric.Text & { dataType?: string })
                      ?.dataType || "text"
                  }
                  onChange={(value) => {
                    if (
                      (selectedObject?.type === "i-text" ||
                        selectedObject?.type === "text") &&
                      canvas &&
                      value
                    ) {
                      updateObjectProperty("dataType", value);
                    }
                  }}
                  styles={{
                    input: {
                      backgroundColor: "#ffffff",
                      border: "1px solid #dee2e6",
                      "&:focus": {
                        borderColor: "#339af0",
                      },
                    },
                  }}
                />
              </Stack>
            )}

            {/* Variable Section */}
            {(selectedObject?.type === "i-text" ||
              selectedObject?.type === "text") && (
              <Stack gap="md" mb="xl">
                <Text size="sm" fw={600} c="#495057">
                  {t("labels.variableSettings")}
                </Text>
                <Checkbox
                  label={t("labels.markAsVariable")}
                  size="xs"
                  checked={(() => {
                    // Force re-evaluation when objectUpdateTrigger changes
                    const _ = objectUpdateTrigger;
                    return (
                      (
                        selectedObject as fabric.Text & {
                          isSmartField?: boolean;
                        }
                      )?.isSmartField || false
                    );
                  })()}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    if (
                      (selectedObject?.type === "i-text" ||
                        selectedObject?.type === "text") &&
                      canvas
                    ) {
                      const isVariable = event.currentTarget.checked;
                      const textObj = selectedObject as fabric.Text;

                      if (isVariable) {
                        // Mark as smart field with default styling
                        textObj.set({
                          isSmartField: true,
                          backgroundColor: "#e3f2fd",
                          padding: 4,
                          editable: false,
                        });
                      } else {
                        // Remove smart field properties
                        textObj.set({
                          isSmartField: false,
                          smartFieldType: "",
                          dataType: "text",
                          objectType: "general",
                          backgroundColor: "transparent",
                          padding: 0,
                          editable: true,
                        });
                      }

                      canvas.renderAll();
                      setObjectUpdateTrigger((prev) => prev + 1);
                    }
                  }}
                  styles={{
                    label: {
                      color: "#495057",
                      fontSize: "12px",
                    },
                  }}
                />
                {(() => {
                  // Force re-evaluation when objectUpdateTrigger changes
                  const _ = objectUpdateTrigger;
                  return (
                    selectedObject as fabric.Text & { isSmartField?: boolean }
                  )?.isSmartField;
                })() && (
                  <TextInput
                    placeholder={t("placeholders.enterVariableName")}
                    size="xs"
                    radius="xs"
                    value={(() => {
                      // Force re-evaluation when objectUpdateTrigger changes
                      const _ = objectUpdateTrigger;
                      return (
                        (
                          selectedObject as fabric.Text & {
                            smartFieldType?: string;
                          }
                        )?.smartFieldType || ""
                      );
                    })()}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      if (
                        (selectedObject?.type === "i-text" ||
                          selectedObject?.type === "text") &&
                        canvas
                      ) {
                        updateObjectProperty(
                          "smartFieldType",
                          event.currentTarget.value
                        );
                      }
                    }}
                    styles={{
                      input: {
                        backgroundColor: "#ffffff",
                        border: "1px solid #dee2e6",
                        "&:focus": {
                          borderColor: "#339af0",
                        },
                      },
                    }}
                  />
                )}
              </Stack>
            )}

            {/* Canvas Background Section */}
            {canvasSelected && (
              <Stack gap="md" mb="xl">
                <Text size="sm" fw={600} c="#495057">
                  {t("labels.canvasBackground")}
                </Text>
                <Group gap="xs">
                  <ColorInput
                    placeholder={t("placeholders.backgroundColor")}
                    size="xs"
                    radius="xs"
                    value={canvasBackgroundColor}
                    onChange={changeCanvasBackgroundColor}
                    style={{ flex: 1 }}
                    styles={{
                      input: {
                        backgroundColor: "#ffffff",
                        border: "1px solid #dee2e6",
                        "&:focus": {
                          borderColor: "#339af0",
                        },
                      },
                    }}
                  />
                </Group>
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="outline"
                    leftSection={<IconPhoto size={14} />}
                    onClick={changeCanvasBackgroundImage}
                    style={{ flex: 1 }}
                  >
                    {t("buttons.setImage")}
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={removeCanvasBackground}
                  >
                    {t("buttons.clear")}
                  </Button>
                </Group>
                {canvasBackgroundImage && (
                  <Text size="xs" c="#6c757d">
                    📷 {t("messages.backgroundImageApplied")}
                  </Text>
                )}
              </Stack>
            )}

            {/* Fill Color Section */}
            <Stack gap="xs" mb="sm">
              <Group gap="xs">
                <IconColorPicker size={12} color="#495057" />
                <Text size="xs" fw={600} c="#495057">
                  {t("labels.fillColor")}
                </Text>
              </Group>
              <ColorInput
                placeholder={t("placeholders.fillColor")}
                size="xs"
                radius="xs"
                value={
                  selectedObject
                    ? selectedObject.type === "i-text" ||
                      selectedObject.type === "text"
                      ? ((selectedObject as fabric.Text).fill as string) ||
                        "#000000"
                      : (selectedObject.fill as string) || "#000000"
                    : "#000000"
                }
                onChange={(value) => {
                  if (selectedObject && canvas) {
                    if (
                      selectedObject.type === "i-text" ||
                      selectedObject.type === "text"
                    ) {
                      (selectedObject as fabric.Text).set("fill", value);
                    } else {
                      selectedObject.set("fill", value);
                    }
                    canvas.renderAll();
                    setObjectUpdateTrigger((prev) => prev + 1);
                  }
                }}
                disabled={!selectedObject}
                swatches={[
                  "#000000",
                  "#ffffff",
                  "#ff0000",
                  "#00ff00",
                  "#0000ff",
                  "#ffff00",
                  "#ff00ff",
                  "#00ffff",
                ]}
                styles={{
                  input: {
                    backgroundColor: !selectedObject ? "#f8f9fa" : "#ffffff",
                    border: "1px solid #dee2e6",
                    "&:focus": {
                      borderColor: "#339af0",
                    },
                  },
                }}
              />
            </Stack>

            {/* Stroke Color Section - Only for shapes */}
            {selectedObject &&
              selectedObject.type !== "i-text" &&
              selectedObject.type !== "text" &&
              selectedObject.type !== "image" && (
                <Stack gap="xs" mb="sm">
                  <Group gap="xs">
                    <IconColorPicker size={12} color="#495057" />
                    <Text size="xs" fw={600} c="#495057">
                      {t("labels.strokeColor")}
                    </Text>
                  </Group>
                  <ColorInput
                    placeholder={t("placeholders.strokeColor")}
                    size="xs"
                    radius="xs"
                    value={
                      selectedObject
                        ? (selectedObject.stroke as string) || "#000000"
                        : "#000000"
                    }
                    onChange={(value) => {
                      if (selectedObject && canvas) {
                        selectedObject.set("stroke", value);
                        canvas.renderAll();
                        setObjectUpdateTrigger((prev) => prev + 1);
                      }
                    }}
                    swatches={[
                      "#000000",
                      "#ffffff",
                      "#ff0000",
                      "#00ff00",
                      "#0000ff",
                      "#ffff00",
                      "#ff00ff",
                      "#00ffff",
                    ]}
                    styles={{
                      input: {
                        backgroundColor: "#ffffff",
                        border: "1px solid #dee2e6",
                        "&:focus": {
                          borderColor: "#339af0",
                        },
                      },
                    }}
                  />
                </Stack>
              )}

            {/* Stroke Width Section - Only for shapes */}
            {selectedObject &&
              selectedObject.type !== "i-text" &&
              selectedObject.type !== "text" &&
              selectedObject.type !== "image" && (
                <Stack gap="xs" mb="sm">
                  <Group gap="xs">
                    <Text size="xs" fw={600} c="#495057">
                      {t("labels.strokeWidth")}
                    </Text>
                  </Group>
                  <NumberInput
                    placeholder={t("placeholders.strokeWidth")}
                    size="xs"
                    radius="xs"
                    value={selectedObject ? selectedObject.strokeWidth || 0 : 0}
                    onChange={(value) => {
                      if (
                        selectedObject &&
                        canvas &&
                        typeof value === "number"
                      ) {
                        selectedObject.set("strokeWidth", value);
                        canvas.renderAll();
                        setObjectUpdateTrigger((prev) => prev + 1);
                      }
                    }}
                    min={0}
                    max={20}
                    styles={{
                      input: {
                        backgroundColor: "#ffffff",
                        border: "1px solid #dee2e6",
                        "&:focus": {
                          borderColor: "#339af0",
                        },
                      },
                    }}
                  />
                </Stack>
              )}

            {/* Transparency Section */}
            <Stack gap="xs" mb="sm">
              <Group gap="xs">
                <IconEye size={12} color="#495057" />
                <Text size="xs" fw={600} c="#495057">
                  {t("labels.transparency")}
                </Text>
              </Group>
              <Slider
                size="xs"
                radius="xs"
                min={0}
                max={100}
                value={transparency}
                color="blue"
                onChange={handleTransparencyChange}
                disabled={!selectedObject}
                styles={{
                  track: {
                    backgroundColor: "#e9ecef",
                  },
                  thumb: {
                    backgroundColor: "#339af0",
                    border: "2px solid #ffffff",
                    boxShadow: "0 2px 8px rgba(51, 154, 240, 0.3)",
                  },
                }}
              />
            </Stack>

            {/* Rotation Section */}
            <Stack gap="xs" mb="sm">
              <Group gap="xs">
                <IconRotate size={12} color="#495057" />
                <Text size="xs" fw={600} c="#495057">
                  {t("labels.rotation")}
                </Text>
              </Group>
              <Slider
                size="xs"
                radius="xs"
                min={0}
                max={360}
                value={rotation}
                color="blue"
                onChange={handleRotationChange}
                disabled={!selectedObject}
                styles={{
                  track: {
                    backgroundColor: "#e9ecef",
                  },
                  thumb: {
                    backgroundColor: "#339af0",
                    border: "2px solid #ffffff",
                    boxShadow: "0 2px 8px rgba(51, 154, 240, 0.3)",
                  },
                }}
              />
            </Stack>

            {/* Dimensions Section */}
            <Stack gap="xs" mb="sm">
              <Text size="xs" fw={600} c="#495057">
                {t("labels.dimensions")}
              </Text>
              <Group gap="xs">
                <NumberInput
                  label={t("labels.width")}
                  size="xs"
                  radius="xs"
                  value={objectWidth}
                  onChange={handleWidthChange}
                  disabled={!selectedObject}
                  min={1}
                  max={2000}
                  style={{ flex: 1 }}
                  styles={{
                    input: {
                      backgroundColor: !selectedObject ? "#f8f9fa" : "#ffffff",
                      border: "1px solid #dee2e6",
                      "&:focus": {
                        borderColor: "#339af0",
                      },
                    },
                    label: {
                      color: "#495057",
                      fontWeight: 500,
                      fontSize: "14px",
                    },
                  }}
                />
                <NumberInput
                  label={t("labels.height")}
                  size="xs"
                  radius="xs"
                  value={objectHeight}
                  onChange={handleHeightChange}
                  disabled={!selectedObject}
                  min={1}
                  max={2000}
                  style={{ flex: 1 }}
                  styles={{
                    input: {
                      backgroundColor: !selectedObject ? "#f8f9fa" : "#ffffff",
                      border: "1px solid #dee2e6",
                      "&:focus": {
                        borderColor: "#339af0",
                      },
                    },
                    label: {
                      color: "#495057",
                      fontWeight: 500,
                      fontSize: "14px",
                    },
                  }}
                />
              </Group>
            </Stack>

            {/* Object Actions */}
            <Stack gap="xs">
              <Group gap="xs">
                <IconSettings size={12} color="#495057" />
                <Text size="xs" fw={600} c="#495057">
                  {t("labels.objectActions")}
                </Text>
              </Group>
              <Group gap="xs">
                <ActionIcon
                  size="xs"
                  radius="xs"
                  variant="subtle"
                  onClick={duplicateSelected}
                  disabled={!selectedObject}
                >
                  <IconCopy size={14} />
                </ActionIcon>
                <ActionIcon
                  size="xs"
                  radius="xs"
                  variant="subtle"
                  onClick={deleteSelected}
                  disabled={!selectedObject}
                  color="red"
                >
                  <IconTrash size={12} />
                </ActionIcon>
                <ActionIcon
                  size="xs"
                  radius="xs"
                  variant="subtle"
                  onClick={flipHorizontal}
                  disabled={!selectedObject}
                >
                  <IconFlipHorizontal size={12} />
                </ActionIcon>
                <ActionIcon
                  size="xs"
                  radius="xs"
                  variant="subtle"
                  onClick={flipVertical}
                  disabled={!selectedObject}
                >
                  <IconFlipVertical size={12} />
                </ActionIcon>
              </Group>
            </Stack>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
