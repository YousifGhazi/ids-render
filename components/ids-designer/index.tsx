'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { Box, Button, Group, Stack, Text, ColorInput, NumberInput, TextInput, Paper, ActionIcon, Divider, Select, Slider, Switch, Tabs, Checkbox } from '@mantine/core';
import { IconSquare, IconCircle, IconLetterT, IconPhoto, IconTrash, IconCopy, IconFlipHorizontal, IconFlipVertical, IconSettings, IconPalette, IconShape, IconAccessible, IconEye, IconRotate, IconColorPicker, IconBold, IconItalic, IconUnderline, IconDownload, IconDeviceFloppy, IconArrowBackUp, IconArrowForwardUp, IconTriangle, IconStar, IconMinus, IconAlignLeft, IconAlignCenter, IconAlignRight, IconAlignBoxTopCenter, IconAlignBoxCenterMiddle, IconAlignBoxBottomCenter, IconLayoutDistributeHorizontal, IconLayoutDistributeVertical, IconZoomIn, IconZoomOut, IconZoom, IconUpload } from '@tabler/icons-react';
import { useTranslations, useLocale } from 'next-intl';

interface IDCardDesignerProps {
  width?: number;
  height?: number;
}

export default function IDCardDesigner({ width = 800, height = 500 }: IDCardDesignerProps) {
  const t = useTranslations('idsDesigner');
  const locale = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  const [transparency, setTransparency] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [objectWidth, setObjectWidth] = useState(288);
  const [objectHeight, setObjectHeight] = useState(70);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');
  const [frontCanvasData, setFrontCanvasData] = useState<string | null>(null);
  const [backCanvasData, setBackCanvasData] = useState<string | null>(null);
  const [showFieldPanel, setShowFieldPanel] = useState(false);
  const [showTextTypePanel, setShowTextTypePanel] = useState(false);
  const [showShapePanel, setShowShapePanel] = useState(false);
  const [objectUpdateTrigger, setObjectUpdateTrigger] = useState(0);
  const [canvasOrientation, setCanvasOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isRTL, setIsRTL] = useState(locale === 'ar');
  const [canvasSelected, setCanvasSelected] = useState(false);
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState('#ffffff');
  const [canvasBackgroundImage, setCanvasBackgroundImage] = useState<string | null>(null);

  const initializeCanvas = () => {
    if (canvasRef.current) {
      // Configure fabric.js to include custom properties in serialization
      fabric.Object.prototype.toObject = (function(toObject) {
        return function(this: fabric.Object, propertiesToInclude?: string[]) {
          const customProps = ['dataType', 'isSmartField', 'smartFieldType', 'objectType', 'textAlign', 'direction'];
          const allProps = propertiesToInclude ? [...propertiesToInclude, ...customProps] : customProps;
          return toObject.call(this, allProps);
        };
      })(fabric.Object.prototype.toObject);

      const canvasWidth = canvasOrientation === 'horizontal' ? width : height;
      const canvasHeight = canvasOrientation === 'horizontal' ? height : width;
      
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: '#ffffff',
        selection: true, // Enable multiple selection
        selectionKey: 'ctrlKey', // Allow Ctrl+click for multiple selection
        selectionColor: 'rgba(100, 149, 237, 0.3)',
        selectionBorderColor: 'rgba(100, 149, 237, 0.8)',
        selectionLineWidth: 2,
      });

      // Add selection event listeners
      fabricCanvas.on('selection:created', (e: { selected?: fabric.Object[] }) => {
        console.log('selection:created', e.selected?.length || 0, 'objects');
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
      });

      fabricCanvas.on('selection:updated', (e: { selected?: fabric.Object[] }) => {
        console.log('selection:updated', e.selected?.length || 0, 'objects');
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
      });

      fabricCanvas.on('selection:cleared', () => {
        console.log('selection:cleared');
        setSelectedObject(null);
        setSelectedObjects([]);
        setCanvasSelected(false);
        resetControls();
      });

      // Add canvas click listener for canvas selection
      fabricCanvas.on('mouse:down', (e) => {
        if (!e.target) {
          // Clicked on empty canvas area
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
      fabricCanvas.on('object:modified', (e) => {
        if (e.target && e.target === selectedObject) {
          updateControlsFromObject(e.target);
        }
      });

      fabricCanvas.on('object:scaling', (e) => {
        if (e.target && e.target === selectedObject) {
          updateControlsFromObject(e.target);
        }
      });

      fabricCanvas.on('object:rotating', (e) => {
        if (e.target && e.target === selectedObject) {
          setRotation(Math.round(e.target.angle || 0));
        }
      });

      setCanvas(fabricCanvas);
      return fabricCanvas;
    }
    return null;
  };

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
          if (currentSide === 'front') {
            setFrontCanvasData(canvasData);
          } else {
            setBackCanvasData(canvasData);
          }
        }
      }, 300);
    };

    canvas.on('object:added', handleCanvasChange);
    canvas.on('object:removed', handleCanvasChange);
    canvas.on('object:modified', handleCanvasChange);
    canvas.on('path:created', handleCanvasChange);

    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      canvas.off('object:added', handleCanvasChange);
      canvas.off('object:removed', handleCanvasChange);
      canvas.off('object:modified', handleCanvasChange);
      canvas.off('path:created', handleCanvasChange);
    };
  }, [canvas, currentSide]);

  const saveCurrentSideData = () => {
    if (!canvas) return;
    const canvasData = JSON.stringify(canvas.toJSON());
    if (currentSide === 'front') {
      setFrontCanvasData(canvasData);
    } else {
      setBackCanvasData(canvasData);
    }
  };

  const loadSideData = (side: 'front' | 'back') => {
    if (!canvas) return;
    
    const data = side === 'front' ? frontCanvasData : backCanvasData;
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        canvas.loadFromJSON(parsedData, () => {
          // Restore background settings from canvas data
          const bgColor = canvas.backgroundColor || '#ffffff';
          const bgImage = canvas.backgroundImage;
          
          setCanvasBackgroundColor(typeof bgColor === 'string' ? bgColor : '#ffffff');
          setCanvasBackgroundImage(bgImage ? 'applied' : null);
          
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
        console.error('Error loading canvas data:', error);
        canvas.clear();
        canvas.backgroundColor = '#ffffff';
        canvas.renderAll();
        setSelectedObject(null);
        resetControls();
      }
    } else {
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
      setSelectedObject(null);
      resetControls();
    }
  };

  const switchSide = (side: 'front' | 'back') => {
    if (currentSide === side) return;
    
    // Save current side data
    saveCurrentSideData();
    
    // Switch to new side
    setCurrentSide(side);
    
    // Use setTimeout to ensure the save operation completes before loading
    setTimeout(() => {
      loadSideData(side);
    }, 50);
  };

  const addText = () => {
    setShowTextTypePanel(true);
  };

  const addShape = () => {
    setShowShapePanel(true);
  };

  const addStaticText = (type: 'single' | 'multi') => {
    if (!canvas) return;
    
    const text = new fabric.IText(type === 'single' ? t('textTypes.singleLine') : t('textTypes.multiLine'), {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: '#000000',
      dataType: 'text', // Default data type
      textAlign: isRTL ? 'right' : 'left',
      direction: isRTL ? 'rtl' : 'ltr',
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    setShowTextTypePanel(false);
  };

  const addVariableText = (type: string) => {
    if (!canvas) return;
    
    const fieldTexts = {
      'name': locale === 'ar' ? 'أحمد محمد' : 'Ahmed Mohammed',
      'id': '263.7487.1278B',
      'date': new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US'),
      'department': locale === 'ar' ? 'علوم الحاسوب' : 'Computer Science',
      'age': '25',
      'salary': locale === 'ar' ? '50,000 ريال' : '$50,000'
    };
    
    // Determine data type based on field type
    const getDataType = (fieldType: string) => {
      switch (fieldType) {
        case 'id':
        case 'department':
        case 'name':
          return 'text';
        case 'date':
          return 'date';
        case 'age':
        case 'salary':
          return 'number';
        default:
          return 'text';
      }
    };
    
    // Determine object type based on field type
    const getObjectType = (fieldType: string) => {
      switch (fieldType) {
        case 'name':
          return 'person';
        case 'id':
          return 'identifier';
        case 'date':
          return 'temporal';
        case 'department':
          return 'organization';
        case 'age':
          return 'demographic';
        case 'salary':
          return 'financial';
        default:
          return 'general';
      }
    };
    
    const text = new fabric.Text(fieldTexts[type as keyof typeof fieldTexts] || type, {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fontSize: 16,
      fill: '#000000',
      selectable: true,
      editable: false,
      isSmartField: true,
      smartFieldType: type,
      dataType: getDataType(type),
      objectType: getObjectType(type),
      backgroundColor: '#e3f2fd',
      padding: 4,
      textAlign: isRTL ? 'right' : 'left',
      direction: isRTL ? 'rtl' : 'ltr',
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    setShowTextTypePanel(false);
  };

  const addSquare = () => {
    if (!canvas) return;
    
    const square = new fabric.Rect({
      left: 100,
      top: 100,
      width: 80,
      height: 80,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
    });
    
    canvas.add(square);
    canvas.setActiveObject(square);
    canvas.renderAll();
    setShowShapePanel(false);
  };

  const addRectangle = () => {
    if (!canvas) return;
    
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 120,
      height: 60,
      fill: '#ef4444',
      stroke: '#dc2626',
      strokeWidth: 2,
    });
    
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    setShowShapePanel(false);
  };

  const addTriangle = () => {
    if (!canvas) return;
    
    const triangle = new fabric.Triangle({
      left: 100,
      top: 100,
      width: 80,
      height: 80,
      fill: '#10b981',
      stroke: '#059669',
      strokeWidth: 2,
    });
    
    canvas.add(triangle);
    canvas.setActiveObject(triangle);
    canvas.renderAll();
    setShowShapePanel(false);
  };

  const addCircle = () => {
    if (!canvas) return;
    
    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 40,
      fill: '#f59e0b',
      stroke: '#d97706',
      strokeWidth: 2,
    });
    
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
    setShowShapePanel(false);
  };

  const addStar = () => {
    if (!canvas) return;
    
    // Create a star using polygon points
    const starPoints = [
      { x: 0, y: -50 },
      { x: 14.7, y: -15.4 },
      { x: 47.6, y: -15.4 },
      { x: 23.8, y: 6.2 },
      { x: 29.4, y: 40.4 },
      { x: 0, y: 20 },
      { x: -29.4, y: 40.4 },
      { x: -23.8, y: 6.2 },
      { x: -47.6, y: -15.4 },
      { x: -14.7, y: -15.4 }
    ];
    
    const star = new fabric.Polygon(starPoints, {
      left: 100,
      top: 100,
      fill: '#8b5cf6',
      stroke: '#7c3aed',
      strokeWidth: 2,
    });
    
    canvas.add(star);
    canvas.setActiveObject(star);
    canvas.renderAll();
    setShowShapePanel(false);
  };

  const addLine = () => {
    if (!canvas) return;
    
    const line = new fabric.Line([50, 100, 200, 100], {
      left: 100,
      top: 100,
      stroke: '#374151',
      strokeWidth: 3,
    });
    
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.renderAll();
    setShowShapePanel(false);
  };

  const addImage = () => {
    if (!canvas) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imgUrl = event.target?.result as string;
          fabric.FabricImage.fromURL(imgUrl).then((img) => {
            img.set({
              left: 100,
              top: 100,
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
  };

  const deleteSelected = () => {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    setSelectedObject(null);
    resetControls();
    canvas.renderAll();
  };

  const duplicateSelected = () => {
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
  };

  const flipHorizontal = () => {
    if (!canvas || !selectedObject) return;
    selectedObject.set('flipX', !selectedObject.flipX);
    canvas.renderAll();
  };

  const flipVertical = () => {
    if (!canvas || !selectedObject) return;
    selectedObject.set('flipY', !selectedObject.flipY);
    canvas.renderAll();
  };

  const updateObjectProperty = (property: string, value: string | number | boolean) => {
    if (!canvas || !selectedObject) return;
    selectedObject.set(property, value);
    canvas.renderAll();
    // Trigger re-render to update UI controls
    setObjectUpdateTrigger(prev => prev + 1);
  };

  const updateControlsFromObject = (obj: fabric.Object) => {
    setTransparency(Math.round((1 - (obj.opacity || 1)) * 100));
    setRotation(Math.round(obj.angle || 0));
    
    // Get scaled dimensions for proper display
    const width = Math.round((obj.width || 0) * (obj.scaleX || 1));
    const height = Math.round((obj.height || 0) * (obj.scaleY || 1));
    setObjectWidth(width);
    setObjectHeight(height);
  };

  const resetControls = () => {
    setTransparency(0);
    setRotation(0);
    setObjectWidth(288);
    setObjectHeight(70);
  };

  const handleTransparencyChange = (value: number) => {
    setTransparency(value);
    if (selectedObject && canvas) {
      selectedObject.set('opacity', 1 - (value / 100));
      canvas.renderAll();
    }
  };

  const handleRotationChange = (value: number) => {
    setRotation(value);
    if (selectedObject && canvas) {
      selectedObject.set('angle', value);
      canvas.renderAll();
    }
  };

  const handleWidthChange = (value: number | string) => {
    const width = typeof value === 'string' ? parseInt(value) || 0 : value;
    setObjectWidth(width);
    if (selectedObject && canvas) {
      // Handle different object types properly
      if (selectedObject.type === 'circle') {
        const radius = width / 2;
        selectedObject.set('radius', radius);
      } else if (selectedObject.type === 'i-text' || selectedObject.type === 'text') {
        // For text objects, adjust scale instead of width
        const currentWidth = (selectedObject.width || 1) * (selectedObject.scaleX || 1);
        const scaleX = width / (selectedObject.width || 1);
        selectedObject.set('scaleX', scaleX);
      } else {
        // For rectangles and other shapes
        selectedObject.set('width', width);
      }
      canvas.renderAll();
    }
  };

  const handleHeightChange = (value: number | string) => {
    const height = typeof value === 'string' ? parseInt(value) || 0 : value;
    setObjectHeight(height);
    if (selectedObject && canvas) {
      // Handle different object types properly
      if (selectedObject.type === 'circle') {
        const radius = height / 2;
        selectedObject.set('radius', radius);
      } else if (selectedObject.type === 'i-text' || selectedObject.type === 'text') {
        // For text objects, adjust scale instead of height
        const currentHeight = (selectedObject.height || 1) * (selectedObject.scaleY || 1);
        const scaleY = height / (selectedObject.height || 1);
        selectedObject.set('scaleY', scaleY);
      } else {
        // For rectangles and other shapes
        selectedObject.set('height', height);
      }
      canvas.renderAll();
    }
  };

  const handleSmartFieldSelect = (value: string | null) => {
    if (!value || !canvas) return;
    
    const fieldTexts = {
      'name': locale === 'ar' ? 'أحمد محمد' : 'Ahmed Mohammed',
      'id': '263.7487.1278B',
      'date': new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US'),
      'department': locale === 'ar' ? 'علوم الحاسوب' : 'Computer Science',
      'age': '25',
      'salary': locale === 'ar' ? '50,000 ريال' : '$50,000'
    };
    
    // Determine data type based on field type
    const getDataType = (fieldType: string) => {
      switch (fieldType) {
        case 'id':
        case 'department':
        case 'name':
          return 'text';
        case 'date':
          return 'date';
        case 'age':
        case 'salary':
          return 'number';
        default:
          return 'text';
      }
    };
    
    // Determine object type based on field type
    const getObjectType = (fieldType: string) => {
      switch (fieldType) {
        case 'name':
          return 'person';
        case 'id':
          return 'identifier';
        case 'date':
          return 'temporal';
        case 'department':
          return 'organization';
        case 'age':
          return 'demographic';
        case 'salary':
          return 'financial';
        default:
          return 'general';
      }
    };
    
    // If there's a selected text object, convert it to a smart field
     if (selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
       const textObj = selectedObject as fabric.Text;
       
       // Update the existing text object to become a smart field (keep original text)
       textObj.set({
         isSmartField: true,
         smartFieldType: value,
         dataType: getDataType(value),
         objectType: getObjectType(value),
         backgroundColor: '#e3f2fd',
         padding: 4,
         editable: false
       });
       
       canvas.renderAll();
       setObjectUpdateTrigger(prev => prev + 1);
    } else {
      // If no text object is selected, create a new smart field
      const text = new fabric.IText(fieldTexts[value as keyof typeof fieldTexts] || value, {
        left: 100,
        top: 100,
        fontFamily: 'Arial',
        fontSize: 16,
        fill: '#000000',
        isSmartField: true,
        smartFieldType: value,
        dataType: getDataType(value),
        objectType: getObjectType(value),
        backgroundColor: '#e3f2fd',
        padding: 4,
        editable: false,
        textAlign: isRTL ? 'right' : 'left',
        direction: isRTL ? 'rtl' : 'ltr',
      });
      
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
    }
  };

  const toggleBold = () => {
    if (selectedObject?.type === 'i-text' || selectedObject?.type === 'text') {
      const currentWeight = (selectedObject as fabric.Text).fontWeight;
      const newWeight = currentWeight === 'bold' ? 'normal' : 'bold';
      updateObjectProperty('fontWeight', newWeight);
    }
  };

  const toggleItalic = () => {
    if (selectedObject?.type === 'i-text' || selectedObject?.type === 'text') {
      const currentStyle = (selectedObject as fabric.Text).fontStyle;
      const newStyle = currentStyle === 'italic' ? 'normal' : 'italic';
      updateObjectProperty('fontStyle', newStyle);
    }
  };

  const toggleUnderline = () => {
    if (selectedObject?.type === 'i-text' || selectedObject?.type === 'text') {
      const currentUnderline = (selectedObject as fabric.Text).underline;
      const newUnderline = !currentUnderline;
      updateObjectProperty('underline', newUnderline);
    }
  };

  const toggleRTL = () => {
    setIsRTL(!isRTL);
    if (selectedObject?.type === 'i-text' || selectedObject?.type === 'text') {
      const newDirection = !isRTL ? 'rtl' : 'ltr';
      const newAlign = !isRTL ? 'right' : 'left';
      updateObjectProperty('direction', newDirection);
      updateObjectProperty('textAlign', newAlign);
    }
  };

  const alignLeft = () => {
    if (selectedObject?.type === 'i-text' || selectedObject?.type === 'text') {
      updateObjectProperty('textAlign', 'left');
    }
  };

  const alignCenter = () => {
    if (selectedObject?.type === 'i-text' || selectedObject?.type === 'text') {
      updateObjectProperty('textAlign', 'center');
    }
  };

  const alignRight = () => {
    if (selectedObject?.type === 'i-text' || selectedObject?.type === 'text') {
      updateObjectProperty('textAlign', 'right');
    }
  };

  const changeCanvasBackgroundColor = (color: string) => {
    if (!canvas) return;
    setCanvasBackgroundColor(color);
    setCanvasBackgroundImage(null);
    canvas.backgroundColor = color;
    canvas.renderAll();
    
    // Manually trigger save since background changes don't fire canvas events
    setTimeout(() => {
      const canvasData = JSON.stringify(canvas.toJSON());
      if (currentSide === 'front') {
        setFrontCanvasData(canvasData);
      } else {
        setBackCanvasData(canvasData);
      }
    }, 100);
  };

  const changeCanvasBackgroundImage = () => {
    if (!canvas) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imgUrl = event.target?.result as string;
          setCanvasBackgroundImage(imgUrl);
          fabric.FabricImage.fromURL(imgUrl).then((img) => {
            // Scale image to fit canvas
            const canvasWidth = canvas.getWidth();
            const canvasHeight = canvas.getHeight();
            const scaleX = canvasWidth / (img.width || 1);
            const scaleY = canvasHeight / (img.height || 1);
            
            img.set({
              scaleX: scaleX,
              scaleY: scaleY,
            });
            
            canvas.backgroundImage = img;
            canvas.renderAll();
            
            // Manually trigger save since background changes don't fire canvas events
            setTimeout(() => {
              const canvasData = JSON.stringify(canvas.toJSON());
              if (currentSide === 'front') {
                setFrontCanvasData(canvasData);
              } else {
                setBackCanvasData(canvasData);
              }
            }, 100);
          });
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const removeCanvasBackground = () => {
    if (!canvas) return;
    setCanvasBackgroundImage(null);
    setCanvasBackgroundColor('#ffffff');
    canvas.backgroundColor = '#ffffff';
    canvas.backgroundImage = undefined;
    canvas.renderAll();
    
    // Manually trigger save since background changes don't fire canvas events
    setTimeout(() => {
      const canvasData = JSON.stringify(canvas.toJSON());
      if (currentSide === 'front') {
        setFrontCanvasData(canvasData);
      } else {
        setBackCanvasData(canvasData);
      }
    }, 100);
  };

  const undoAction = () => {
    // Basic undo functionality - could be enhanced with proper history management
    if (canvas && canvas.getObjects().length > 0) {
      const objects = canvas.getObjects();
      canvas.remove(objects[objects.length - 1]);
      canvas.renderAll();
    }
  };

  const redoAction = () => {
    // Placeholder for redo functionality
    console.log('Redo action - would need proper history management');
  };

  const saveDesign = () => {
    if (!canvas) return;
    
    // Save current side data first
    saveCurrentSideData();
    
    // Create comprehensive template data
    const templateData = {
      version: '1.0',
      canvasOrientation: canvasOrientation,
      canvasWidth: canvasOrientation === 'horizontal' ? width : height,
      canvasHeight: canvasOrientation === 'horizontal' ? height : width,
      frontCanvas: frontCanvasData ? JSON.parse(frontCanvasData) : (currentSide === 'front' ? canvas.toJSON() : null),
      backCanvas: backCanvasData ? JSON.parse(backCanvasData) : (currentSide === 'back' ? canvas.toJSON() : null),
      createdAt: new Date().toISOString()
    };
    
    // Create and download JSON file
    const jsonString = JSON.stringify(templateData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `id-card-template-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    
    console.log('Template saved successfully');
  };

  const importTemplate = () => {
    if (!canvas) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const jsonData = event.target?.result as string;
            const parsedData = JSON.parse(jsonData);
            
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
              const templateCanvasWidth = parsedData.canvasOrientation === 'horizontal' ? width : height;
              const templateCanvasHeight = parsedData.canvasOrientation === 'horizontal' ? height : width;
              
              // Update canvas orientation if different
              if (parsedData.canvasOrientation !== canvasOrientation) {
                setCanvasOrientation(parsedData.canvasOrientation);
              }
              
              // Set canvas dimensions immediately
              canvas.setDimensions({
                width: templateCanvasWidth,
                height: templateCanvasHeight
              });
              
              // Load the front canvas by default
              if (parsedData.frontCanvas) {
                canvas.loadFromJSON(parsedData.frontCanvas, () => {
                  canvas.backgroundColor = '#ffffff';
                  // Force multiple renders to ensure objects are visible
                  canvas.renderAll();
                  setTimeout(() => {
                    canvas.renderAll();
                    canvas.requestRenderAll();
                  }, 100);
                  setCurrentSide('front');
                  setSelectedObject(null);
                  setSelectedObjects([]);
                  resetControls();
                  console.log('Comprehensive template imported successfully');
                });
              } else {
                // No front canvas data, just clear and set orientation
                canvas.clear();
                canvas.backgroundColor = '#ffffff';
                canvas.renderAll();
                setCurrentSide('front');
                setSelectedObject(null);
                setSelectedObjects([]);
                resetControls();
              }
            } else {
              // Handle legacy template format (single canvas)
              canvas.clear();
              
              // Check if template has canvas dimensions and adjust if needed
              const currentCanvasWidth = canvasOrientation === 'horizontal' ? width : height;
              const currentCanvasHeight = canvasOrientation === 'horizontal' ? height : width;
              
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
                      if (typeof obj.left === 'number') obj.left *= scaleX;
                      if (typeof obj.top === 'number') obj.top *= scaleY;
                      if (typeof obj.width === 'number') obj.width *= scaleX;
                      if (typeof obj.height === 'number') obj.height *= scaleY;
                      if (typeof obj.scaleX === 'number') obj.scaleX *= scaleX;
                      if (typeof obj.scaleY === 'number') obj.scaleY *= scaleY;
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
                  height: currentCanvasHeight
                });
                canvas.backgroundColor = '#ffffff';
                // Force multiple renders to ensure objects are visible
                canvas.renderAll();
                setTimeout(() => {
                  canvas.renderAll();
                  canvas.requestRenderAll();
                }, 100);
                setSelectedObject(null);
                setSelectedObjects([]);
                resetControls();
                console.log('Legacy template imported successfully');
              });
            }
          } catch (error) {
            console.error('Error importing template:', error);
            alert('Error importing template. Please make sure the file is a valid JSON template.');
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  };

  // Alignment functions for multiple objects
  const alignObjects = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    console.log('alignObjects called with:', alignment, 'selectedObjects:', selectedObjects.length);
    if (!canvas || selectedObjects.length < 2) {
      console.log('Alignment cancelled - canvas:', !!canvas, 'selectedObjects.length:', selectedObjects.length);
      return;
    }
    
    const objects = selectedObjects;
    let referenceValue: number;
    
    // Calculate reference value based on alignment type
    switch (alignment) {
      case 'left':
        referenceValue = Math.min(...objects.map(obj => obj.left || 0));
        objects.forEach(obj => obj.set('left', referenceValue));
        break;
      case 'right':
        referenceValue = Math.max(...objects.map(obj => (obj.left || 0) + (obj.width || 0) * (obj.scaleX || 1)));
        objects.forEach(obj => {
          const objWidth = (obj.width || 0) * (obj.scaleX || 1);
          obj.set('left', referenceValue - objWidth);
        });
        break;
      case 'center':
        const leftMost = Math.min(...objects.map(obj => obj.left || 0));
        const rightMost = Math.max(...objects.map(obj => (obj.left || 0) + (obj.width || 0) * (obj.scaleX || 1)));
        referenceValue = (leftMost + rightMost) / 2;
        objects.forEach(obj => {
          const objWidth = (obj.width || 0) * (obj.scaleX || 1);
          obj.set('left', referenceValue - objWidth / 2);
        });
        break;
      case 'top':
        referenceValue = Math.min(...objects.map(obj => obj.top || 0));
        objects.forEach(obj => obj.set('top', referenceValue));
        break;
      case 'bottom':
        referenceValue = Math.max(...objects.map(obj => (obj.top || 0) + (obj.height || 0) * (obj.scaleY || 1)));
        objects.forEach(obj => {
          const objHeight = (obj.height || 0) * (obj.scaleY || 1);
          obj.set('top', referenceValue - objHeight);
        });
        break;
      case 'middle':
        const topMost = Math.min(...objects.map(obj => obj.top || 0));
        const bottomMost = Math.max(...objects.map(obj => (obj.top || 0) + (obj.height || 0) * (obj.scaleY || 1)));
        referenceValue = (topMost + bottomMost) / 2;
        objects.forEach(obj => {
          const objHeight = (obj.height || 0) * (obj.scaleY || 1);
          obj.set('top', referenceValue - objHeight / 2);
        });
        break;
    }
    
    canvas.renderAll();
  };
  
  const distributeObjects = (direction: 'horizontal' | 'vertical') => {
    console.log('distributeObjects called with:', direction, 'selectedObjects:', selectedObjects.length);
    if (!canvas || selectedObjects.length < 3) {
      console.log('Distribution cancelled - canvas:', !!canvas, 'selectedObjects.length:', selectedObjects.length);
      return;
    }
    
    const objects = [...selectedObjects];
    
    if (direction === 'horizontal') {
      // Sort by left position
      objects.sort((a, b) => (a.left || 0) - (b.left || 0));
      
      const leftMost = objects[0].left || 0;
      const rightMost = (objects[objects.length - 1].left || 0) + 
                       (objects[objects.length - 1].width || 0) * (objects[objects.length - 1].scaleX || 1);
      const totalSpace = rightMost - leftMost;
      const spacing = totalSpace / (objects.length - 1);
      
      objects.forEach((obj, index) => {
        if (index > 0 && index < objects.length - 1) {
          obj.set('left', leftMost + spacing * index);
        }
      });
    } else {
      // Sort by top position
      objects.sort((a, b) => (a.top || 0) - (b.top || 0));
      
      const topMost = objects[0].top || 0;
      const bottomMost = (objects[objects.length - 1].top || 0) + 
                        (objects[objects.length - 1].height || 0) * (objects[objects.length - 1].scaleY || 1);
      const totalSpace = bottomMost - topMost;
      const spacing = totalSpace / (objects.length - 1);
      
      objects.forEach((obj, index) => {
        if (index > 0 && index < objects.length - 1) {
          obj.set('top', topMost + spacing * index);
        }
      });
    }
    
    canvas.renderAll();
  };

  const saveBothSides = async () => {
    if (!canvas) return;
    
    // Save current side data
    saveCurrentSideData();
    
    // Save front side
    if (frontCanvasData || currentSide === 'front') {
      const frontDataURL = currentSide === 'front' ? 
        canvas.toDataURL({ format: 'png', quality: 1, multiplier: 1 }) :
        await generateImageFromData(frontCanvasData);
      
      if (frontDataURL) {
        const frontLink = document.createElement('a');
        frontLink.download = 'id-card-front.png';
        frontLink.href = frontDataURL;
        frontLink.click();
      }
    }
    
    // Save back side with a small delay
    setTimeout(async () => {
      if (backCanvasData || currentSide === 'back') {
        const backDataURL = currentSide === 'back' ? 
          canvas.toDataURL({ format: 'png', quality: 1, multiplier: 1 }) :
          await generateImageFromData(backCanvasData);
        
        if (backDataURL) {
          const backLink = document.createElement('a');
          backLink.download = 'id-card-back.png';
          backLink.href = backDataURL;
          backLink.click();
        }
      }
    }, 500);
  };

  const generateImageFromData = async (canvasData: string | null): Promise<string | null> => {
    if (!canvasData || !canvas) return null;
    
    return new Promise((resolve) => {
      const tempCanvas = new fabric.Canvas(document.createElement('canvas'), {
        width: width,
        height: height,
        backgroundColor: '#ffffff',
      });
      
      tempCanvas.loadFromJSON(canvasData, () => {
        const dataURL = tempCanvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 1
        });
        tempCanvas.dispose();
        resolve(dataURL);
      });
    });
  };

  return (
    <Box style={{ display: 'flex', height: '100vh', backgroundColor: '#fafbfc' }}>
      {/* Left Sidebar */}
      <Box style={{ 
        width: 72, 
        backgroundColor: '#ffffff', 
        borderRight: '1px solid #e9ecef',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '20px 0',
        boxShadow: '0 0 10px rgba(0,0,0,0.05)'
      }}>
        <Stack gap="lg" align="center">
          <ActionIcon 
            variant="gradient" 
            gradient={{ from: 'blue', to: 'cyan' }}
            size="xl" 
            onClick={addText}
            style={{ borderRadius: '12px' }}
          >
            <IconLetterT size={22} />
          </ActionIcon>
          <ActionIcon 
            variant="subtle" 
            size="xl" 
            onClick={addImage}
            style={{ borderRadius: '12px', color: '#495057' }}
          >
            <IconPhoto size={22} />
          </ActionIcon>
          <ActionIcon 
            variant="subtle" 
            size="xl" 
            onClick={addShape}
            style={{ borderRadius: '12px', color: '#495057' }}
          >
            <IconShape size={22} />
          </ActionIcon>
          <ActionIcon 
            variant="subtle" 
            size="xl"
            style={{ borderRadius: '12px', color: '#495057' }}
          >
            <IconSettings size={22} />
          </ActionIcon>

          <ActionIcon 
            variant="subtle" 
            size="xl"
            style={{ borderRadius: '12px', color: '#495057' }}
          >
            <IconAccessible size={22} />
          </ActionIcon>
        </Stack>
      </Box>

      
      {/* Text Type Selection Panel - Left */}
      {showTextTypePanel && (
        <Paper style={{ 
          width: 280, 
          borderRadius: 0, 
          borderRight: '1px solid #e9ecef',
          backgroundColor: '#ffffff',
          boxShadow: '0 0 15px rgba(0,0,0,0.05)'
        }}>
          <Box p="lg">
            <Group justify="space-between" align="center" mb="lg">
              <Text size="lg" fw={700} c="#212529">{t('panels.objects')}</Text>
              <ActionIcon 
                variant="subtle" 
                size="sm" 
                onClick={() => setShowTextTypePanel(false)}
              >
                <Text size="lg" c="#6c757d">×</Text>
              </ActionIcon>
            </Group>
            
            <Stack gap="lg">
              {/* Static Text Section */}
              <div>
                <Text size="md" fw={600} c="#495057" mb="md">{t('addText')}</Text>
                <Stack gap="sm">
                  <Button 
                    variant="light" 
                    size="md" 
                    fullWidth 
                    onClick={() => addStaticText('single')}
                    leftSection={<Text size="lg">T</Text>}
                    styles={{
                      root: {
                        justifyContent: 'flex-start',
                        paddingLeft: '16px',
                        height: '48px'
                      }
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <Text size="sm" fw={500}>{t('textTypes.singleLine')}</Text>
                    </div>
                  </Button>
                  <Button 
                    variant="light" 
                    size="md" 
                    fullWidth 
                    onClick={() => addStaticText('multi')}
                    leftSection={<Text size="lg">≡</Text>}
                    styles={{
                      root: {
                        justifyContent: 'flex-start',
                        paddingLeft: '16px',
                        height: '48px'
                      }
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <Text size="sm" fw={500}>{t('textTypes.multiLine')}</Text>
                    </div>
                  </Button>
                </Stack>
              </div>
              
              {/* Variable Text Section */}
              <div>
                <Group gap="xs" mb="md">
                  <Text size="md" fw={600} c="#495057">{t('textTypes.smartFields')}</Text>
                  <ActionIcon size="xs" variant="subtle">
                    <Text size="xs" c="#6c757d">?</Text>
                  </ActionIcon>
                </Group>
                <Stack gap="sm">
                  <Button 
                    variant="light" 
                    size="md" 
                    fullWidth 
                    onClick={() => addVariableText('name')}
                    styles={{
                      root: {
                        justifyContent: 'flex-start',
                        paddingLeft: '16px',
                        height: '48px'
                      }
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <Text size="sm" fw={500}>{t('smartFields.name')}</Text>
                    </div>
                  </Button>
                  <Button 
                    variant="light" 
                    size="md" 
                    fullWidth 
                    onClick={() => addVariableText('id')}
                    styles={{
                      root: {
                        justifyContent: 'flex-start',
                        paddingLeft: '16px',
                        height: '48px'
                      }
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <Text size="sm" fw={500}>{t('smartFields.id')}</Text>
                    </div>
                  </Button>
                  <Button 
                    variant="light" 
                    size="md" 
                    fullWidth 
                    onClick={() => addVariableText('date')}
                    styles={{
                      root: {
                        justifyContent: 'flex-start',
                        paddingLeft: '16px',
                        height: '48px'
                      }
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <Text size="sm" fw={500}>{t('smartFields.date')}</Text>
                    </div>
                  </Button>
                  <Button 
                    variant="light" 
                    size="md" 
                    fullWidth 
                    onClick={() => addVariableText('department')}
                    styles={{
                      root: {
                        justifyContent: 'flex-start',
                        paddingLeft: '16px',
                        height: '48px'
                      }
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <Text size="sm" fw={500}>{t('smartFields.department')}</Text>
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
        <Paper style={{ 
          width: 280, 
          borderRadius: 0, 
          borderRight: '1px solid #e9ecef',
          backgroundColor: '#ffffff',
          boxShadow: '0 0 15px rgba(0,0,0,0.05)'
        }}>
          <Box p="lg">
            <Group justify="space-between" align="center" mb="lg">
              <Text size="lg" fw={700} c="#212529">{t('panels.smartFields')}</Text>
              <ActionIcon 
                variant="subtle" 
                size="sm" 
                onClick={() => setShowFieldPanel(false)}
              >
                <Text size="lg" c="#6c757d">×</Text>
              </ActionIcon>
            </Group>
            
            <Stack gap="sm">
              {[
                { value: 'name', label: t('smartFields.name'), icon: '👤' },
                { value: 'id', label: t('smartFields.id'), icon: '🆔' },
                { value: 'date', label: t('smartFields.date'), icon: '📅' },
                { value: 'department', label: t('smartFields.department'), icon: '🏢' }
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
                      justifyContent: 'flex-start',
                      paddingLeft: '16px',
                      height: '48px'
                    }
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <Text size="sm" fw={500}>{field.label}</Text>
                  </div>
                </Button>
              ))}
            </Stack>
          </Box>
        </Paper>
      )}
      
      {/* Shape Selection Panel - Left */}
      {showShapePanel && (
        <Paper style={{ 
          width: 280, 
          borderRadius: 0, 
          borderRight: '1px solid #e9ecef',
          backgroundColor: '#ffffff',
          boxShadow: '0 0 15px rgba(0,0,0,0.05)'
        }}>
          <Box p="lg">
            <Group justify="space-between" align="center" mb="lg">
              <Text size="lg" fw={700} c="#212529">{t('panels.shapes')}</Text>
              <ActionIcon 
                variant="subtle" 
                size="sm" 
                onClick={() => setShowShapePanel(false)}
              >
                <Text size="lg" c="#6c757d">×</Text>
              </ActionIcon>
            </Group>
            
            <Stack gap="lg">
              {/* Basic Shapes */}
              <div>
                <Text size="md" fw={600} c="#495057" mb="md">{t('shapes.basicShapes')}</Text>
                <Stack gap="sm">
                  <Button 
                    variant="light" 
                    size="md" 
                    fullWidth 
                    onClick={addSquare}
                    leftSection={<IconSquare size={18} />}
                    styles={{
                      root: {
                        justifyContent: 'flex-start',
                        paddingLeft: '16px',
                        height: '48px'
                      }
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <Text size="sm" fw={500}>{t('shapes.square')}</Text>
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
                        justifyContent: 'flex-start',
                        paddingLeft: '16px',
                        height: '48px'
                      }
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <Text size="sm" fw={500}>{t('shapes.rectangle')}</Text>
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
                        justifyContent: 'flex-start',
                        paddingLeft: '16px',
                        height: '48px'
                      }
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <Text size="sm" fw={500}>{t('shapes.triangle')}</Text>
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
                        justifyContent: 'flex-start',
                        paddingLeft: '16px',
                        height: '48px'
                      }
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <Text size="sm" fw={500}>{t('shapes.circle')}</Text>
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
                        justifyContent: 'flex-start',
                        paddingLeft: '16px',
                        height: '48px'
                      }
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <Text size="sm" fw={500}>{t('shapes.star')}</Text>
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
                        justifyContent: 'flex-start',
                        paddingLeft: '16px',
                        height: '48px'
                      }
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <Text size="sm" fw={500}>{t('shapes.line')}</Text>
                    </div>
                  </Button>
                </Stack>
              </div>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Main Canvas Area */}
      <Box style={{ flex: 1, backgroundColor: '#ffffff', position: 'relative' }}>
        {/* Top Toolbar */}
        <Box style={{ 
          height: 60, 
          backgroundColor: '#ffffff', 
          borderBottom: '1px solid #e9ecef', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
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
              <Text size="xs" c="#6c757d">{t('canvas.orientation')}:</Text>
              <Button.Group>
                <Button
                  variant={canvasOrientation === 'horizontal' ? 'filled' : 'outline'}
                  size="xs"
                  onClick={() => setCanvasOrientation('horizontal')}
                >
                  {t('canvas.horizontal')}
                </Button>
                <Button
                  variant={canvasOrientation === 'vertical' ? 'filled' : 'outline'}
                  size="xs"
                  onClick={() => setCanvasOrientation('vertical')}
                >
                  {t('canvas.vertical')}
                </Button>
              </Button.Group>
            </Group>
             
             {/* Zoom Controls */}
             <Divider orientation="vertical" />
             <Group gap="xs">
               <Text size="xs" c="#6c757d">{t('canvas.zoom')}:</Text>
               <ActionIcon
                 variant="subtle"
                 size="md"
                 radius="sm"
                 onClick={() => setZoomLevel(prev => Math.max(25, prev - 25))}
                 disabled={zoomLevel <= 25}
                 title={t('canvas.zoomOut')}
               >
                 <IconZoomOut size={16} />
               </ActionIcon>
               <Text size="xs" c="#495057" style={{ minWidth: '40px', textAlign: 'center' }}>
                 {zoomLevel}%
               </Text>
               <ActionIcon
                 variant="subtle"
                 size="md"
                 radius="sm"
                 onClick={() => setZoomLevel(prev => Math.min(200, prev + 25))}
                 disabled={zoomLevel >= 200}
                 title={t('canvas.zoomIn')}
               >
                 <IconZoomIn size={16} />
               </ActionIcon>
               <ActionIcon
                 variant="subtle"
                 size="md"
                 radius="sm"
                 onClick={() => setZoomLevel(100)}
                 title={t('canvas.resetZoom')}
               >
                 <IconZoom size={16} />
               </ActionIcon>
             </Group>
             
             {/* Alignment Controls - Show when multiple objects are selected */}
            {selectedObjects.length > 1 && (
              <>
                <Divider orientation="vertical" />
                <Group gap="xs">
                  <Text size="xs" c="#6c757d">{t('alignment.title')}:</Text>
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    radius="sm"
                    onClick={() => alignObjects('left')}
                    title={t('alignment.left')}
                  >
                    <IconAlignLeft size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    radius="sm"
                    onClick={() => alignObjects('center')}
                    title={t('alignment.center')}
                  >
                    <IconAlignCenter size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    radius="sm"
                    onClick={() => alignObjects('right')}
                    title={t('alignment.right')}
                  >
                    <IconAlignRight size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    radius="sm"
                    onClick={() => alignObjects('top')}
                    title={t('alignment.top')}
                  >
                    <IconAlignBoxTopCenter size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    radius="sm"
                    onClick={() => alignObjects('middle')}
                    title={t('alignment.middle')}
                  >
                    <IconAlignBoxCenterMiddle size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    radius="sm"
                    onClick={() => alignObjects('bottom')}
                    title={t('alignment.bottom')}
                  >
                    <IconAlignBoxBottomCenter size={16} />
                  </ActionIcon>
                  {selectedObjects.length >= 3 && (
                    <>
                      <ActionIcon
                        variant="subtle"
                        size="md"
                        radius="sm"
                        onClick={() => distributeObjects('horizontal')}
                        title={t('alignment.distributeHorizontal')}
                      >
                        <IconLayoutDistributeHorizontal size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        size="md"
                        radius="sm"
                        onClick={() => distributeObjects('vertical')}
                        title={t('alignment.distributeVertical')}
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
            <ActionIcon
              variant="subtle"
              size="md"
              radius="sm"
              onClick={importTemplate}
              title={t('actions.importTemplate')}
              color="green"
            >
              <IconUpload size={16} />
            </ActionIcon>
            <ActionIcon
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              size="md"
              radius="sm"
              onClick={saveDesign}
            >
              <IconDownload size={16} />
            </ActionIcon>
            <ActionIcon
              variant="outline"
              size="md"
              radius="sm"
              onClick={saveBothSides}
              color="blue"
            >
              <IconDeviceFloppy size={16} />
            </ActionIcon>
          </Group>
        </Box>

        {/* Canvas Container */}
        <Box style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 120px)', 
          padding: 16,
          backgroundColor: '#fafbfc',
          overflow: 'auto'
        }}>
          <Paper 
              shadow="xl" 
              style={{ 
                display: 'inline-block', 
                position: 'relative',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #e9ecef',
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'center',
                transition: 'transform 0.2s ease-in-out'
              }}
            >
            <canvas 
              ref={canvasRef} 
              style={{ 
                border: '2px solid #dee2e6', 
                borderRadius: 12,
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
              }} 
            />
            
            {/* Canvas Tabs */}
            <Box style={{ 
              position: 'absolute', 
              bottom: -40, 
              left: '50%', 
              transform: 'translateX(-50%)',
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              padding: '4px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e9ecef'
            }}>
              <Group gap="xs">
                <Button 
                  variant={currentSide === 'front' ? 'gradient' : 'subtle'} 
                  gradient={{ from: 'blue', to: 'cyan' }}
                  size="sm" 
                  radius="sm"
                  onClick={() => switchSide('front')}
                  style={{
                    backgroundColor: currentSide !== 'front' ? '#f8f9fa' : undefined,
                    color: currentSide !== 'front' ? '#495057' : undefined,
                    border: currentSide !== 'front' ? '1px solid #dee2e6' : undefined
                  }}
                >
                  {t('canvas.front')}
                </Button>
                <Button 
                  variant={currentSide === 'back' ? 'gradient' : 'subtle'} 
                  gradient={{ from: 'blue', to: 'cyan' }}
                  size="sm" 
                  radius="sm"
                  onClick={() => switchSide('back')}
                  style={{
                    backgroundColor: currentSide !== 'back' ? '#f8f9fa' : undefined,
                    color: currentSide !== 'back' ? '#495057' : undefined,
                    border: currentSide !== 'back' ? '1px solid #dee2e6' : undefined
                  }}
                >
                  {t('canvas.back')}
                </Button>
              </Group>
            </Box>
          </Paper>
        </Box>
      </Box>
      {/* Properties Panel */}
      {!showFieldPanel && !showTextTypePanel && (
        <Paper style={{ 
          width: 320, 
          height: '100vh',
          borderRadius: 0, 
          borderRight: '1px solid #e9ecef',
          backgroundColor: '#ffffff',
          boxShadow: '0 0 15px rgba(0,0,0,0.05)',
          overflowY: 'auto'
        }}>
        <Box p="xl">
          <Text size="lg" fw={700} mb="xl" c="#212529">{t('panels.properties')}</Text>
          
          {/* Canvas Selection Indicator */}
          {canvasSelected && (
            <Paper p="sm" mb="xl" style={{ backgroundColor: '#e3f2fd', border: '1px solid #2196f3' }}>
              <Group gap="xs">
                <Text size="sm" fw={600} c="#1976d2">🎨 تم تحديد اللوحة</Text>
              </Group>
              <Text size="xs" c="#1976d2" mt={4}>
انقر على عنصر لتحرير خصائصه، أو قم بتعديل خلفية اللوحة أدناه.
              </Text>
            </Paper>
          )}
          
          {/* Add Text Section */}
          <Stack gap="md" mb="xl">
            <Text size="sm" fw={600} c="#495057">محتوى النص</Text>
            {selectedObject && (selectedObject as fabric.Text & { isSmartField?: boolean; smartFieldType?: string }).isSmartField ? (
              <Box>
                <TextInput
                  placeholder="حقل ذكي"
                  size="xs"
                  radius="xs"
                  value={(selectedObject as fabric.Text).text || ''}
                  disabled={true}
                  styles={{
                    input: {
                      backgroundColor: '#e3f2fd',
                      border: '1px solid #2196f3',
                      color: '#1976d2',
                      fontWeight: 500
                    }
                  }}
                />
                <Text size="xs" c="#1976d2" mt={4}>
                  🔒 {t('smartFields.indicator')}: {(selectedObject as fabric.Text & { smartFieldType?: string }).smartFieldType || t('smartFields.unknown')}
                </Text>
              </Box>
            ) : (
              <TextInput
                placeholder="أدخل النص هنا..."
                size="xs"
                radius="xs"
                value={selectedObject?.type === 'i-text' ? (selectedObject as fabric.IText).text : ''}
                onChange={(e) => {
                  if (selectedObject?.type === 'i-text' && canvas) {
                    (selectedObject as fabric.IText).set('text', e.target.value);
                    canvas.renderAll();
                  }
                }}
                disabled={selectedObject?.type !== 'i-text'}
                styles={{
                  input: {
                    backgroundColor: selectedObject?.type !== 'i-text' ? '#f8f9fa' : '#ffffff',
                    border: '1px solid #dee2e6',
                    '&:focus': {
                      borderColor: '#339af0'
                    }
                  }
                }}
              />
            )}
          </Stack>

          {/* Smart Field Section */}
          <Stack gap="md" mb="xl">
            <Group justify="space-between" align="center">
              <Text size="sm" fw={600} c="#495057">الحقول الذكية</Text>
              <ActionIcon size="sm" variant="subtle" radius="md">
                <Text size="sm" c="#6c757d">?</Text>
              </ActionIcon>
            </Group>
            <Select
              placeholder="اختر حقلاً لإدراجه..."
              size="xs"
              radius="xs"
              data={[
                { value: 'name', label: '👤 الاسم' },
                { value: 'id', label: '🆔 رقم الهوية' },
                { value: 'date', label: '📅 التاريخ' },
                { value: 'department', label: '🏢 القسم' },
                { value: 'age', label: '🔢 العمر' },
                { value: 'salary', label: '💰 الراتب' }
              ]}
              onChange={handleSmartFieldSelect}
              styles={{
                input: {
                  backgroundColor: '#ffffff',
                  border: '1px solid #dee2e6',
                  '&:focus': {
                    borderColor: '#339af0'
                  }
                }
              }}
            />
          </Stack>

          {/* Text Style Section */}
          <Stack gap="md" mb="xl">
            <Text size="sm" fw={600} c="#495057">Typography</Text>
            <Group gap="md">
              <Select
                placeholder="Font Family"
                size="xs"
                radius="xs"
                style={{ flex: 1 }}
                data={[
                  { value: 'Arial', label: 'Arial' },
                  { value: 'Fira Sans', label: 'Fira Sans' },
                  { value: 'Helvetica', label: 'Helvetica' },
                  { value: 'Times New Roman', label: 'Times New Roman' },
                  { value: 'Georgia', label: 'Georgia' }
                ]}
                value={(selectedObject?.type === 'i-text' || selectedObject?.type === 'text') ? (selectedObject as fabric.Text).fontFamily : undefined}
                onChange={(value) => {
                  if ((selectedObject?.type === 'i-text' || selectedObject?.type === 'text') && canvas && value) {
                    (selectedObject as fabric.Text).set('fontFamily', value);
                    canvas.renderAll();
                    setObjectUpdateTrigger(prev => prev + 1);
                  }
                }}
                disabled={selectedObject?.type !== 'i-text' && selectedObject?.type !== 'text'}
                styles={{
                  input: {
                    backgroundColor: (selectedObject?.type !== 'i-text' && selectedObject?.type !== 'text') ? '#f8f9fa' : '#ffffff',
                    border: '1px solid #dee2e6'
                  }
                }}
              />
              <NumberInput
                size="xs"
                radius="xs"
                w={60}
                placeholder="الحجم"
                value={(selectedObject?.type === 'i-text' || selectedObject?.type === 'text') ? (selectedObject as fabric.Text).fontSize : undefined}
                onChange={(value) => {
                  if ((selectedObject?.type === 'i-text' || selectedObject?.type === 'text') && canvas && value) {
                    const numValue = typeof value === 'string' ? parseInt(value) || 16 : value;
                    (selectedObject as fabric.Text).set('fontSize', numValue);
                    canvas.renderAll();
                    setObjectUpdateTrigger(prev => prev + 1);
                  }
                }}
                min={8}
                max={72}
                disabled={selectedObject?.type !== 'i-text' && selectedObject?.type !== 'text'}
                styles={{
                  input: {
                    backgroundColor: (selectedObject?.type !== 'i-text' && selectedObject?.type !== 'text') ? '#f8f9fa' : '#ffffff',
                    border: '1px solid #dee2e6'
                  }
                }}
              />
            </Group>
            
            {/* Text formatting buttons */}
            <Group gap="xs" mt="xs">
              <ActionIcon
                variant={(selectedObject?.type === 'i-text' || selectedObject?.type === 'text') && (selectedObject as fabric.Text).fontWeight === 'bold' ? 'gradient' : 'subtle'}
                gradient={{ from: 'blue', to: 'cyan' }}
                size="sm"
                radius="sm"
                onClick={toggleBold}
                disabled={selectedObject?.type !== 'i-text' && selectedObject?.type !== 'text'}
              >
                <IconBold size={14} />
              </ActionIcon>
              <ActionIcon
                variant={(selectedObject?.type === 'i-text' || selectedObject?.type === 'text') && (selectedObject as fabric.Text).fontStyle === 'italic' ? 'gradient' : 'subtle'}
                gradient={{ from: 'blue', to: 'cyan' }}
                size="sm"
                radius="sm"
                onClick={toggleItalic}
                disabled={selectedObject?.type !== 'i-text' && selectedObject?.type !== 'text'}
              >
                <IconItalic size={14} />
              </ActionIcon>
              <ActionIcon
                variant={(selectedObject?.type === 'i-text' || selectedObject?.type === 'text') && (selectedObject as fabric.Text).underline ? 'gradient' : 'subtle'}
                gradient={{ from: 'blue', to: 'cyan' }}
                size="sm"
                radius="sm"
                onClick={toggleUnderline}
                disabled={selectedObject?.type !== 'i-text' && selectedObject?.type !== 'text'}
              >
                <IconUnderline size={14} />
              </ActionIcon>
            </Group>
            
            {/* Text alignment and direction controls */}
            <Group gap="xs" mt="xs">
              <ActionIcon
                variant={(selectedObject?.type === 'i-text' || selectedObject?.type === 'text') && (selectedObject as fabric.Text).textAlign === 'left' ? 'gradient' : 'subtle'}
                gradient={{ from: 'blue', to: 'cyan' }}
                size="sm"
                radius="sm"
                onClick={alignLeft}
                disabled={selectedObject?.type !== 'i-text' && selectedObject?.type !== 'text'}
              >
                <IconAlignLeft size={14} />
              </ActionIcon>
              <ActionIcon
                variant={(selectedObject?.type === 'i-text' || selectedObject?.type === 'text') && (selectedObject as fabric.Text).textAlign === 'center' ? 'gradient' : 'subtle'}
                gradient={{ from: 'blue', to: 'cyan' }}
                size="sm"
                radius="sm"
                onClick={alignCenter}
                disabled={selectedObject?.type !== 'i-text' && selectedObject?.type !== 'text'}
              >
                <IconAlignCenter size={14} />
              </ActionIcon>
              <ActionIcon
                variant={(selectedObject?.type === 'i-text' || selectedObject?.type === 'text') && (selectedObject as fabric.Text).textAlign === 'right' ? 'gradient' : 'subtle'}
                gradient={{ from: 'blue', to: 'cyan' }}
                size="sm"
                radius="sm"
                onClick={alignRight}
                disabled={selectedObject?.type !== 'i-text' && selectedObject?.type !== 'text'}
              >
                <IconAlignRight size={14} />
              </ActionIcon>
              <Divider orientation="vertical" />
              <ActionIcon
                variant={isRTL ? 'gradient' : 'subtle'}
                gradient={{ from: 'orange', to: 'red' }}
                size="sm"
                radius="sm"
                onClick={toggleRTL}
                disabled={selectedObject?.type !== 'i-text' && selectedObject?.type !== 'text'}
                title="Toggle RTL (Right-to-Left)"
              >
                <Text size="xs" fw={600}>RTL</Text>
              </ActionIcon>
            </Group>
          </Stack>

          {/* Data Type Section */}
          {(selectedObject?.type === 'i-text' || selectedObject?.type === 'text') && (
            <Stack gap="md" mb="xl">
              <Text size="sm" fw={600} c="#495057">Data Type</Text>
              <Select
                placeholder="Select data type"
                size="xs"
                radius="xs"
                data={[
                  { value: 'text', label: '📝 Text' },
                  { value: 'number', label: '🔢 Number' },
                  { value: 'date', label: '📅 Date' }
                ]}
                value={(selectedObject as fabric.Text & { dataType?: string })?.dataType || 'text'}
                onChange={(value) => {
                  if ((selectedObject?.type === 'i-text' || selectedObject?.type === 'text') && canvas && value) {
                    updateObjectProperty('dataType', value);
                  }
                }}
                styles={{
                  input: {
                    backgroundColor: '#ffffff',
                    border: '1px solid #dee2e6',
                    '&:focus': {
                      borderColor: '#339af0'
                    }
                  }
                }}
              />
            </Stack>
          )}

          {/* Variable Section */}
          {(selectedObject?.type === 'i-text' || selectedObject?.type === 'text') && (
            <Stack gap="md" mb="xl">
              <Text size="sm" fw={600} c="#495057">Variable Settings</Text>
              <Checkbox
                 label="Mark as Variable"
                 size="xs"
                 checked={(selectedObject as fabric.Text & { isSmartField?: boolean })?.isSmartField || false}
                 onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                   if ((selectedObject?.type === 'i-text' || selectedObject?.type === 'text') && canvas) {
                     const isVariable = event.currentTarget.checked;
                     updateObjectProperty('isSmartField', isVariable);
                     if (!isVariable) {
                       updateObjectProperty('smartFieldType', '');
                     }
                   }
                 }}
                styles={{
                  label: {
                    color: '#495057',
                    fontSize: '12px'
                  }
                }}
              />
              {(selectedObject as fabric.Text & { isSmartField?: boolean })?.isSmartField && (
                <TextInput
                  placeholder="Enter variable name"
                  size="xs"
                  radius="xs"
                  value={(selectedObject as fabric.Text & { smartFieldType?: string })?.smartFieldType || ''}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                     if ((selectedObject?.type === 'i-text' || selectedObject?.type === 'text') && canvas) {
                       updateObjectProperty('smartFieldType', event.currentTarget.value);
                     }
                   }}
                  styles={{
                    input: {
                      backgroundColor: '#ffffff',
                      border: '1px solid #dee2e6',
                      '&:focus': {
                        borderColor: '#339af0'
                      }
                    }
                  }}
                />
              )}
            </Stack>
          )}



          {/* Canvas Background Section */}
          {canvasSelected && (
            <Stack gap="md" mb="xl">
              <Text size="sm" fw={600} c="#495057">خلفية اللوحة</Text>
              <Group gap="xs">
                <ColorInput
                  placeholder="لون الخلفية"
                  size="xs"
                  radius="xs"
                  value={canvasBackgroundColor}
                  onChange={changeCanvasBackgroundColor}
                  style={{ flex: 1 }}
                  styles={{
                    input: {
                      backgroundColor: '#ffffff',
                      border: '1px solid #dee2e6',
                      '&:focus': {
                        borderColor: '#339af0'
                      }
                    }
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
                  تعيين صورة
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={removeCanvasBackground}
                >
                  مسح
                </Button>
              </Group>
              {canvasBackgroundImage && (
                <Text size="xs" c="#6c757d">
                  📷 تم تطبيق صورة الخلفية
                </Text>
              )}
            </Stack>
          )}

          {/* Fill Color Section */}
          <Stack gap="xs" mb="sm">
            <Group gap="xs">
              <IconColorPicker size={12} color="#495057" />
              <Text size="xs" fw={600} c="#495057">لون التعبئة</Text>
            </Group>
            <ColorInput
              placeholder="اختر لون التعبئة"
              size="xs"
              radius="xs"
              value={selectedObject ? (
                (selectedObject.type === 'i-text' || selectedObject.type === 'text') 
                  ? (selectedObject as fabric.Text).fill as string || '#000000'
                  : selectedObject.fill as string || '#000000'
              ) : '#000000'}
              onChange={(value) => {
                if (selectedObject && canvas) {
                  if (selectedObject.type === 'i-text' || selectedObject.type === 'text') {
                    (selectedObject as fabric.Text).set('fill', value);
                  } else {
                    selectedObject.set('fill', value);
                  }
                  canvas.renderAll();
                  setObjectUpdateTrigger(prev => prev + 1);
                }
              }}
              disabled={!selectedObject}
              swatches={['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']}
              styles={{
                input: {
                  backgroundColor: !selectedObject ? '#f8f9fa' : '#ffffff',
                  border: '1px solid #dee2e6',
                  '&:focus': {
                    borderColor: '#339af0'
                  }
                }
              }}
            />
          </Stack>

          {/* Stroke Color Section - Only for shapes */}
          {selectedObject && selectedObject.type !== 'i-text' && selectedObject.type !== 'text' && selectedObject.type !== 'image' && (
            <Stack gap="xs" mb="sm">
              <Group gap="xs">
                <IconColorPicker size={12} color="#495057" />
                <Text size="xs" fw={600} c="#495057">لون الحدود</Text>
              </Group>
              <ColorInput
                placeholder="اختر لون الحدود"
                size="xs"
                radius="xs"
                value={selectedObject ? (selectedObject.stroke as string || '#000000') : '#000000'}
                onChange={(value) => {
                  if (selectedObject && canvas) {
                    selectedObject.set('stroke', value);
                    canvas.renderAll();
                    setObjectUpdateTrigger(prev => prev + 1);
                  }
                }}
                swatches={['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']}
                styles={{
                  input: {
                    backgroundColor: '#ffffff',
                    border: '1px solid #dee2e6',
                    '&:focus': {
                      borderColor: '#339af0'
                    }
                  }
                }}
              />
            </Stack>
          )}

          {/* Stroke Width Section - Only for shapes */}
          {selectedObject && selectedObject.type !== 'i-text' && selectedObject.type !== 'text' && selectedObject.type !== 'image' && (
            <Stack gap="xs" mb="sm">
              <Group gap="xs">
                <Text size="xs" fw={600} c="#495057">عرض الحدود</Text>
              </Group>
              <NumberInput
                placeholder="عرض الحدود"
                size="xs"
                radius="xs"
                value={selectedObject ? (selectedObject.strokeWidth || 0) : 0}
                onChange={(value) => {
                  if (selectedObject && canvas && typeof value === 'number') {
                    selectedObject.set('strokeWidth', value);
                    canvas.renderAll();
                    setObjectUpdateTrigger(prev => prev + 1);
                  }
                }}
                min={0}
                max={20}
                styles={{
                  input: {
                    backgroundColor: '#ffffff',
                    border: '1px solid #dee2e6',
                    '&:focus': {
                      borderColor: '#339af0'
                    }
                  }
                }}
              />
            </Stack>
          )}

          {/* Transparency Section */}
          <Stack gap="xs" mb="sm">
            <Group gap="xs">
              <IconEye size={12} color="#495057" />
              <Text size="xs" fw={600} c="#495057">الشفافية</Text>
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
                  backgroundColor: '#e9ecef'
                },
                thumb: {
                  backgroundColor: '#339af0',
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 8px rgba(51, 154, 240, 0.3)'
                }
              }}
            />
          </Stack>

          {/* Rotation Section */}
          <Stack gap="xs" mb="sm">
            <Group gap="xs">
              <IconRotate size={12} color="#495057" />
              <Text size="xs" fw={600} c="#495057">Rotation</Text>
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
                  backgroundColor: '#e9ecef'
                },
                thumb: {
                  backgroundColor: '#339af0',
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 8px rgba(51, 154, 240, 0.3)'
                }
              }}
            />
          </Stack>

          {/* Dimensions Section */}
          <Stack gap="xs" mb="sm">
            <Text size="xs" fw={600} c="#495057">Dimensions</Text>
            <Group gap="xs">
              <NumberInput
                label="W"
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
                    backgroundColor: !selectedObject ? '#f8f9fa' : '#ffffff',
                    border: '1px solid #dee2e6',
                    '&:focus': {
                      borderColor: '#339af0'
                    }
                  },
                  label: {
                    color: '#495057',
                    fontWeight: 500,
                    fontSize: '14px'
                  }
                }}
              />
              <NumberInput
                label="H"
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
                    backgroundColor: !selectedObject ? '#f8f9fa' : '#ffffff',
                    border: '1px solid #dee2e6',
                    '&:focus': {
                      borderColor: '#339af0'
                    }
                  },
                  label: {
                    color: '#495057',
                    fontWeight: 500,
                    fontSize: '14px'
                  }
                }}
              />
            </Group>
          </Stack>

          {/* Object Actions */}
          <Stack gap="xs">
            <Group gap="xs">
              <IconSettings size={12} color="#495057" />
              <Text size="xs" fw={600} c="#495057">Actions</Text>
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