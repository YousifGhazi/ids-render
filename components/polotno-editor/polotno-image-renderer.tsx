"use client";
import { jsonToSVG } from "polotno/utils/to-svg";
import { svgToURL } from "polotno/utils/svg";
import React from "react";
import { PolotnoImageRendererProps } from "./types";

<<<<<<< HEAD
/**
 * Replaces {variableName} patterns with actual data values in a text string
 * @param text - The text containing variable patterns
 * @param data - The data object with variable values
 * @returns The text with variables replaced
 */
=======
>>>>>>> upstream/main
function replaceVariables(text: string, data: Record<string, string>): string {
  if (!text || !data) return text;

  return text.replace(/\{([^}]+)\}/g, (match, variableName) => {
    const value = data[variableName.trim()];
    return value !== undefined ? value : match; // Keep original if no replacement found
  });
}

<<<<<<< HEAD
/**
 * Deep clones and processes a template to replace variables with data
 * @param template - The template object to process
 * @param data - The data object with variable values
 * @returns A new template with variables replaced
 */
=======
>>>>>>> upstream/main
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
<<<<<<< HEAD
=======
          console.log(`Replacing image variable `);
>>>>>>> upstream/main
          // Replace variables in text elements
          if (child.type === "text" && child.text) {
            child.text = replaceVariables(child.text, data);
          }
<<<<<<< HEAD
=======

          // Replace variables in image elements
          if (child.type === "image" && child.custom) {
            const { variable, variableType } = child.custom;

            // Check if this is an image variable and we have data for it
            if (variableType === "image" && variable && data[variable]) {
              // Set the image src to the URL value from data
              child.src = data[variable];
            }
          }
>>>>>>> upstream/main
        });
      }
    });
  }

  return processedTemplate;
}

/**
 * A component that renders an image from a Polotno JSON template
 */
export default function PolotnoImageRenderer({
  template,
  data,
  alt = "Polotno template preview",
  style,
  className,
  loading = false,
  errorMessage = "Failed to load template",
  onLoad,
  onError,
}: PolotnoImageRendererProps) {
  const [url, setUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function generateImage() {
      if (!template) {
        setError("No template provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Process template with data to replace variables
        const processedTemplate = processTemplateWithData(template, data);

        // Default elementHook function for polotno jsonToSVG
        const elementHook = () => null;

        const svgString = await jsonToSVG({
          json: processedTemplate,
          elementHook,
          // fontEmbedding: "base64",
        });
        const imageUrl = svgToURL(svgString);

        if (isMounted) {
          setUrl(imageUrl);
          setIsLoading(false);
          onLoad?.();
        }
      } catch (err) {
        if (isMounted) {
          console.log("Error generating image:", err);

          const errorMsg = err instanceof Error ? err.message : errorMessage;
          setError(errorMsg);
          setIsLoading(false);
          onError?.(err instanceof Error ? err : new Error(errorMsg));
        }
      }
    }

    generateImage();

    return () => {
      isMounted = false;
      // Cleanup the URL object to prevent memory leaks
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [template, data, errorMessage, onLoad, onError]);

  // Cleanup URL on unmount
  React.useEffect(() => {
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  if (loading || isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100px",
          ...style,
        }}
        className={className}
      >
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100px",
          color: "red",
          ...style,
        }}
        className={className}
      >
        {error}
      </div>
    );
  }

  if (!url) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100px",
          ...style,
        }}
        className={className}
      >
        No image available
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      style={style}
      className={className}
      onError={() => setError("Failed to load image")}
    />
  );
}
