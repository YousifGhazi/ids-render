"use client";
import React from "react";
import { Button, ButtonProps } from "@mantine/core";
import { createStore } from "polotno/model/store";
import { jsonToSVG } from "polotno/utils/to-svg";
import { svgToURL } from "polotno/utils/svg";

// Export format types
export type ExportFormat = "png" | "jpeg" | "svg" | "pdf" | "json";

// Props for the export button component
interface PolotnoExportButtonProps extends Omit<ButtonProps, 'onClick'> {
  /** Polotno JSON template to convert */
  template: Record<string, any>;
  /** Export format - png, jpeg, svg, pdf, or json */
  format: ExportFormat;
  /** Optional data for variable replacement */
  data?: Record<string, string>;
  /** Optional filename (without extension) */
  filename?: string;
  /** Quality for image formats (0.1 to 1.0) */
  quality?: number;
  /** DPI for image formats */
  dpi?: number;
  /** Callback function to handle the exported files (now returns array for multiple pages) */
  onClick: (files: File[], format: ExportFormat) => void | Promise<void>;
  /** Optional loading state */
  loading?: boolean;
  /** Store key for Polotno (optional, uses default if not provided) */
  storeKey?: string;
}

/**
 * Replaces variables in text with actual data values
 */
function replaceVariables(text: string, data: Record<string, string>): string {
  if (!text || !data) return text;
  return text.replace(/\{([^}]+)\}/g, (match, variableName) => {
    const value = data[variableName.trim()];
    return value !== undefined ? value : match;
  });
}

/**
 * Processes template with variable data replacement
 */
function processTemplateWithData(
  template: any,
  data?: Record<string, string>
): any {
  if (!data || Object.keys(data).length === 0) {
    return template;
  }

  // Deep clone the template to avoid mutating the original
  const processedTemplate = JSON.parse(JSON.stringify(template));

  // Process each page in the template
  if (processedTemplate.pages && Array.isArray(processedTemplate.pages)) {
    processedTemplate.pages.forEach((page: any) => {
      if (page.children && Array.isArray(page.children)) {
        page.children.forEach((child: any) => {
          // Replace variables in text elements
          if (child.type === "text" && child.text) {
            child.text = replaceVariables(child.text, data);
          }

          // Replace variables in image elements
          if (child.type === "image" && child.custom) {
            const { variable, variableType } = child.custom;
            if (variableType === "image" && variable && data[variable]) {
              child.src = data[variable];
            }
          }
        });
      }
    });
  }

  return processedTemplate;
}

/**
 * Converts SVG string to PNG/JPEG using canvas
 */
async function svgToImageFile(
  svgString: string,
  format: "png" | "jpeg",
  quality: number = 0.9,
  dpi: number = 300
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate canvas size based on DPI
      const scale = dpi / 72; // 72 is the default DPI
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      if (ctx) {
        // Set white background for JPEG (PNG supports transparency)
        if (format === "jpeg") {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Scale context to match DPI
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `export.${format}`, {
                type: `image/${format}`,
              });
              resolve(file);
            } else {
              reject(new Error(`Failed to create ${format} blob`));
            }
          },
          `image/${format}`,
          quality
        );
      } else {
        reject(new Error("Canvas context not available"));
      }
    };

    img.onerror = () => reject(new Error("Failed to load SVG image"));
    
    // Convert SVG to data URL
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
    const svgUrl = URL.createObjectURL(svgBlob);
    img.src = svgUrl;
  });
}

/**
 * Note: PDF export is implemented as high-resolution PNG with PDF extension
 * For true PDF export, consider integrating with jsPDF or similar libraries
 */

export default function PolotnoExportButton({
  template,
  format,
  data,
  filename = "polotno-export",
  quality = 0.9,
  dpi = 300,
  onClick,
  loading: externalLoading = false,
  storeKey = "polotno-export-button",
  children,
  ...buttonProps
}: PolotnoExportButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleExport = async () => {
    if (!template) {
      console.error("No template provided");
      return;
    }

    setIsLoading(true);

    try {
      // Process template with data
      const processedTemplate = processTemplateWithData(template, data);
      
      // Check if template has multiple pages
      const pages = processedTemplate.pages || [];
      const files: File[] = [];

      if (format === "json") {
        // Export as JSON - single file regardless of page count
        const jsonString = JSON.stringify(processedTemplate, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const file = new File([blob], `${filename}.json`, { type: "application/json" });
        files.push(file);
      } else {
        // Export each page as a separate file
        for (let i = 0; i < pages.length; i++) {
          const pageTemplate = {
            ...processedTemplate,
            pages: [pages[i]] // Single page template
          };
          
          const pageSuffix = pages.length > 1 ? (i === 0 ? "-front" : "-back") : "";
          let file: File;

          switch (format) {
            case "svg": {
              // Export as SVG
              const svgString = await jsonToSVG({
                json: pageTemplate,
                elementHook: () => null,
              });
              const blob = new Blob([svgString], { type: "image/svg+xml" });
              file = new File([blob], `${filename}${pageSuffix}.svg`, { type: "image/svg+xml" });
              break;
            }

            case "png":
            case "jpeg": {
              // Export as PNG/JPEG
              const svgString = await jsonToSVG({
                json: pageTemplate,
                elementHook: () => null,
              });
              file = await svgToImageFile(svgString, format, quality, dpi);
              // Update filename
              file = new File([file], `${filename}${pageSuffix}.${format}`, { type: file.type });
              break;
            }

            case "pdf": {
              // Export as PDF - use high quality PNG as fallback since Polotno doesn't have built-in PDF
              // Create temporary store for export
              const { createStore } = await import("polotno/model/store");
              const tempStore = createStore({
                key: `${storeKey}-pdf-${i}`,
                showCredit: false,
              });
              
              // Load template into temporary store
              tempStore.loadJSON(pageTemplate);
              
              // Get high-resolution data URL
              const dataURL = await tempStore.toDataURL({
                pixelRatio: 3, // High resolution
              });
              
              // Convert to blob and then to file
              const response = await fetch(dataURL);
              const blob = await response.blob();
              file = new File([blob], `${filename}${pageSuffix}.pdf`, { 
                type: "application/pdf" // Note: This is actually PNG data with PDF extension
              });
              break;
            }

            default:
              throw new Error(`Unsupported export format: ${format}`);
          }

          files.push(file);
        }
      }

      // Call the onClick handler with the generated files array
      await onClick(files, format);

    } catch (error) {
      console.error(`Failed to export as ${format}:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading || externalLoading) {
      return `Exporting as ${format.toUpperCase()}...`;
    }
    return children || `Export as ${format.toUpperCase()}`;
  };

  return (
    <Button
      {...buttonProps}
      onClick={handleExport}
      loading={isLoading || externalLoading}
      disabled={isLoading || externalLoading || !template}
    >
      {getButtonText()}
    </Button>
  );
}

// Utility function to download files (convenience helper)
export function downloadFiles(files: File[]) {
  files.forEach((file) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

// Backward compatibility - download single file
export function downloadFile(file: File) {
  downloadFiles([file]);
}

// Utility function to create multiple export buttons for common formats
export function createExportButtons(
  template: Record<string, any>,
  options: {
    data?: Record<string, string>;
    filename?: string;
    onExport?: (files: File[], format: ExportFormat) => void | Promise<void>;
    buttonProps?: Omit<ButtonProps, 'onClick'>;
  } = {}
) {
  const { data, filename, onExport = downloadFiles, buttonProps = {} } = options;

  const formats: ExportFormat[] = ["png", "jpeg", "svg", "json"];

  return formats.map((format) => (
    <PolotnoExportButton
      key={format}
      template={template}
      format={format}
      data={data}
      filename={filename}
      onClick={onExport}
      {...buttonProps}
    />
  ));
}