/**
 * Polotno Template Variable Replacement Utilities
 *
 * These utilities help replace template variables with actual data
 * following Polotno's dynamic template variable patterns.
 */

interface VariableData {
  [key: string]: string | number;
}

interface ImageVariableData {
  [key: string]: string; // URL to the image
}

/**
 * Replace text variables in a Polotno JSON template
 * Follows the {variableName} pattern from Polotno documentation
 */
export function replaceTextVariables(
  templateJson: any,
  variableData: VariableData
): any {
  const jsonString = JSON.stringify(templateJson);
  let replacedString = jsonString;

  // Replace all {variableName} patterns with actual values
  Object.entries(variableData).forEach(([variableName, value]) => {
    const pattern = new RegExp(`\\{${variableName}\\}`, "g");
    replacedString = replacedString.replace(pattern, String(value));
  });

  return JSON.parse(replacedString);
}

/**
 * Replace image variables in a Polotno JSON template
 * Finds elements with custom.variable property and updates their src
 */
export function replaceImageVariables(
  templateJson: any,
  imageData: ImageVariableData
): any {
  const processedJson = JSON.parse(JSON.stringify(templateJson)); // Deep clone

  // Utility function to handle deep traversal of JSON
  const forEveryChild = (node: any, callback: (child: any) => void) => {
    if (node.children) {
      node.children.forEach((child: any) => {
        callback(child);
        forEveryChild(child, callback);
      });
    }
  };

  // Process each page
  if (processedJson.pages) {
    processedJson.pages.forEach((page: any) => {
      forEveryChild(page, (child: any) => {
        if (
          child.type === "image" &&
          child.custom?.variable &&
          child.custom?.variableType === "image" &&
          imageData[child.custom.variable]
        ) {
          // Replace the src with actual image URL
          child.src = imageData[child.custom.variable];
        }
      });
    });
  }

  return processedJson;
}

/**
 * Replace both text and image variables in a Polotno JSON template
 */
export function replaceAllVariables(
  templateJson: any,
  textData: VariableData,
  imageData: ImageVariableData
): any {
  let processedJson = replaceTextVariables(templateJson, textData);
  processedJson = replaceImageVariables(processedJson, imageData);
  return processedJson;
}

/**
 * Extract all variables from a Polotno JSON template
 * Returns information about variables found in the template
 */
export function extractVariables(templateJson: any): {
  textVariables: string[];
  imageVariables: Array<{ name: string; label: string; type: string }>;
} {
  const textVariables: Set<string> = new Set();
  const imageVariables: Array<{ name: string; label: string; type: string }> =
    [];

  // Find text variables using regex
  const jsonString = JSON.stringify(templateJson);
  const textMatches = jsonString.match(/\{([^}]+)\}/g);
  if (textMatches) {
    textMatches.forEach((match) => {
      const variableName = match.slice(1, -1); // Remove { and }
      textVariables.add(variableName);
    });
  }

  // Find image variables
  const forEveryChild = (node: any, callback: (child: any) => void) => {
    if (node.children) {
      node.children.forEach((child: any) => {
        callback(child);
        forEveryChild(child, callback);
      });
    }
  };

  if (templateJson.pages) {
    templateJson.pages.forEach((page: any) => {
      forEveryChild(page, (child: any) => {
        if (
          child.type === "image" &&
          child.custom?.variable &&
          child.custom?.variableType === "image"
        ) {
          imageVariables.push({
            name: child.custom.variable,
            label: child.custom.variableLabel || child.custom.variable,
            type: child.custom.variableType,
          });
        }
      });
    });
  }

  return {
    textVariables: Array.from(textVariables),
    imageVariables,
  };
}

/**
 * Validate that all required variables have data
 */
export function validateVariableData(
  templateJson: any,
  textData: VariableData,
  imageData: ImageVariableData
): {
  isValid: boolean;
  missingTextVariables: string[];
  missingImageVariables: string[];
} {
  const extracted = extractVariables(templateJson);

  const missingTextVariables = extracted.textVariables.filter(
    (variable) => !(variable in textData)
  );

  const missingImageVariables = extracted.imageVariables
    .map((img) => img.name)
    .filter((variable) => !(variable in imageData));

  return {
    isValid:
      missingTextVariables.length === 0 && missingImageVariables.length === 0,
    missingTextVariables,
    missingImageVariables,
  };
}

// Example usage:
/*
const templateJson = store.toJSON(); // Get JSON from Polotno store

const textData = {
  firstName: "John",
  lastName: "Doe",
  age: 30,
  position: "Software Engineer"
};

const imageData = {
  profilePhoto: "https://example.com/john-doe.jpg",
  companyLogo: "https://example.com/company-logo.png"
};

// Replace variables
const finalJson = replaceAllVariables(templateJson, textData, imageData);

// Load the final JSON back into Polotno for export
store.loadJSON(finalJson);
const dataURL = await store.toDataURL();
*/
