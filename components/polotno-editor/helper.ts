import { TemplateConfig } from "./template-config-modal";

// ID card dimensions
export const ID_CARD_WIDTH = 323; // 85.6mm in pixels
export const ID_CARD_HEIGHT = 204; // 53.98mm in pixels

// Function to validate template JSON structure
export const isValidTemplateJSON = (templateJson: any): boolean => {
  if (!templateJson || typeof templateJson !== "object") {
    return false;
  }

  // Check for required polotno structure
  const hasPages = Array.isArray(templateJson.pages);
  const hasWidth = typeof templateJson.width === "number";
  const hasHeight = typeof templateJson.height === "number";

  return hasPages && hasWidth && hasHeight;
};

// Function to check if store is ready for operations
export const isStoreReady = (store: any): boolean => {
  return !!(
    store &&
    typeof store.loadJSON === "function" &&
    typeof store.toJSON === "function" &&
    typeof store.addPage === "function" &&
    store.pages &&
    Array.isArray(store.pages)
  );
};

// Function to extract variables from all elements across all pages
export const extractVariables = (json: any) => {
  const variables: any[] = [];
  const seenVariables = new Set<string>(); // To avoid duplicates

  // Traverse all pages
  if (json.pages && Array.isArray(json.pages)) {
    json.pages.forEach((page: any) => {
      if (page.children && Array.isArray(page.children)) {
        // Traverse all elements in the page
        page.children.forEach((element: any) => {
          // Check if element has custom property with variable information
          if (element.custom && element.custom.variable) {
            const variableKey = element.custom.variable;
            // Avoid duplicate variables
            if (!seenVariables.has(variableKey)) {
              seenVariables.add(variableKey);
              variables.push(element.custom);
            }
          }
        });
      }
    });
  }

  return variables;
};

// Function to save template to API (create new template)
export const saveTemplateToAPI = async (
  store: any,
  config: TemplateConfig,
  createTemplateFn: any
) => {
  const json = store.toJSON();

  // Extract variables and add to top level
  const variables = extractVariables(json);
  const enhancedJson = {
    ...json,
    vars: variables,
  };

  // Prepare template data for API
  const templateData = {
    title: config.title,
    description: config.description,
    price: config.price.toString(), // API expects string
    // phone: "", // Set empty for now, can be added to form later if needed
    template: enhancedJson, // Store the full template JSON
    is_enabled: 1, // Set to enabled as requested
  };

  try {
    await createTemplateFn.mutateAsync(templateData);
  } catch (error) {
    console.error("Failed to create template:", error);
    throw error;
  }
};

// Function to update existing template
export const updateTemplateAPI = async (
  store: any,
  config: TemplateConfig,
  templateId: number,
  updateTemplateFn: any
) => {
  const json = store.toJSON();

  // Extract variables and add to top level
  const variables = extractVariables(json);
  const enhancedJson = {
    ...json,
    vars: variables,
  };

  // Prepare template data for API
  const templateData = {
    title: config.title,
    description: config.description,
    price: config.price.toString(), // API expects string
    // phone: "", // Set empty for now, can be added to form later if needed
    template: enhancedJson, // Store the full template JSON
    is_enabled: "1", // API expects string for update
  };

  try {
    await updateTemplateFn.mutateAsync({ id: templateId, data: templateData });
  } catch (error) {
    console.error("Failed to update template:", error);
    throw error;
  }
};

// Function to download template as JSON (backup functionality)
export const downloadTemplateAsJSON = async (
  store: any,
  config: TemplateConfig
) => {
  const json = store.toJSON();

  // Extract variables and add to top level
  const variables = extractVariables(json);
  const enhancedJson = {
    ...json,
    vars: variables,
    templateConfig: config, // Include template configuration
  };

  const dataStr = JSON.stringify(enhancedJson, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
  const exportFileDefaultName = `${config.title || "id-card-template"}-${
    new Date().toISOString().split("T")[0]
  }.json`;
  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
};

// Function to save template as SVG
export const saveTemplateAsSVG = async (store: any, config: TemplateConfig) => {
  const svg = await store.toSVG(); // returns an SVG string
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const exportFileDefaultName = `${config.title || "id-card-template"}-${
    new Date().toISOString().split("T")[0]
  }.svg`;
  const linkElement = document.createElement("a");
  linkElement.href = url;
  linkElement.download = exportFileDefaultName;
  linkElement.click();
  URL.revokeObjectURL(url);
};

// Function to lock store changes to maintain ID card constraints
export const lockStoreChanges = (store: any) => {
  try {
    if (!store) {
      console.error("Store is undefined in lockStoreChanges");
      return;
    }

    // Lock size changes
      // NOTE: previously we overrode `store.setSize` to prevent size changes
      // which blocked Polotno's resize section/form from appearing. Removing
      // that override so the resize controls can function normally. If you
      // need to enforce size constraints in the future, consider validating
      // sizes in event handlers instead of replacing the API method.

    // Override addPage to prevent adding more than 2 pages
    if (store.addPage && store.pages) {
      const originalAddPage = store.addPage;
      store.addPage = () => {
        if (store.pages.length >= 2) {
          console.warn("Maximum 2 pages allowed for ID card template");
          return store.pages[store.pages.length - 1]; // Return last page instead
        }
        return originalAddPage.call(store);
      };
    }

    // Override deletePages to prevent deleting if it would leave less than 2 pages
    if (store.deletePages && store.pages) {
      const originalDeletePages = store.deletePages;
      store.deletePages = (ids: string[]) => {
        if (store.pages.length - ids.length < 1) {
          console.warn("Minimum 2 pages required for ID card template");
          return; // Do nothing - keep minimum 2 pages
        }
        return originalDeletePages.call(store, ids);
      };
    }
  } catch (error) {
    console.error("Error in lockStoreChanges:", error);
  }
};

// Function to add basic template elements to pages
export const addTemplateElements = (store: any) => {
  try {
    // Check if store and pages exist and are properly initialized
    if (
      store &&
      store.pages &&
      Array.isArray(store.pages) &&
      store.pages.length >= 2
    ) {
      // Front page template elements
      const frontPage = store.pages[0];
      if (frontPage && frontPage.children && frontPage.children.length === 0) {
        if (typeof frontPage.addElement === "function") {
          frontPage.addElement({
            type: "text",
            text: "FRONT",
            x: 10,
            y: 10,
            fontSize: 16,
            fontWeight: "bold",
            fill: "#000000",
          });

          // Add a placeholder rectangle using 'figure' type instead of 'rect'
          frontPage.addElement({
            type: "figure",
            x: ID_CARD_WIDTH - 80,
            y: 10,
            width: 70,
            height: 70,
            fill: "#f0f0f0",
            stroke: "#cccccc",
            strokeWidth: 1,
          });
        }
      }

      // Back page template elements
      const backPage = store.pages[1];
      if (backPage && backPage.children && backPage.children.length === 0) {
        if (typeof backPage.addElement === "function") {
          backPage.addElement({
            type: "text",
            text: "BACK",
            x: 10,
            y: 10,
            fontSize: 16,
            fontWeight: "bold",
            fill: "#000000",
          });
        }
      }
    }
  } catch (error) {
    console.error("Error adding template elements:", error);
  }
};

// Function to flip orientation (swap width and height) for all pages
export const flipOrientation = (store: any) => {
  try {
    if (!store || !store.pages || !Array.isArray(store.pages)) {
      console.error("Store or pages not available for orientation flip");
      return;
    }

    // Get current dimensions from the first page to determine if we need to flip
    const firstPage = store.pages[0];
    if (!firstPage) {
      console.error("No pages available for orientation flip");
      return;
    }

    const currentWidth = firstPage.width || ID_CARD_WIDTH;
    const currentHeight = firstPage.height || ID_CARD_HEIGHT;

    // Calculate new dimensions (swap width and height)
    const newWidth = currentHeight;
    const newHeight = currentWidth;

    // Update all pages with new dimensions
    store.pages.forEach((page: any) => {
      if (page && typeof page.set === "function") {
        page.set({
          width: newWidth,
          height: newHeight,
        });
      }
    });

    // Update the store size
    if (typeof store.setSize === "function") {
      store.setSize(newWidth, newHeight);
    }

    console.log(
      `Orientation flipped: ${currentWidth}x${currentHeight} -> ${newWidth}x${newHeight}`
    );
  } catch (error) {
    console.error("Error flipping orientation:", error);
  }
};

// Function to initialize the store with proper configuration
export const initializeStore = (storeKey: string, createStoreFunction: any) => {
  try {
    const newStore = createStoreFunction({
      key: storeKey,
      showCredit: false,
    });

    if (!newStore) {
      throw new Error("Failed to create Polotno store");
    }

    // Clear the default page and create ID card template
    if (typeof newStore.clear === "function") {
      newStore.clear();
    }

    // Create front page (page 1)
    if (typeof newStore.addPage === "function") {
      const frontPage = newStore.addPage({
        id: "front-page",
      });

      if (frontPage && typeof frontPage.set === "function") {
        frontPage.set({
          width: ID_CARD_WIDTH,
          height: ID_CARD_HEIGHT,
        });
      }

      // Create back page (page 2)
      const backPage = newStore.addPage({
        id: "back-page",
      });

      if (backPage && typeof backPage.set === "function") {
        backPage.set({
          width: ID_CARD_WIDTH,
          height: ID_CARD_HEIGHT,
        });
      }
    }

    // Set the store size to ID card dimensions
    if (typeof newStore.setSize === "function") {
      newStore.setSize(ID_CARD_WIDTH, ID_CARD_HEIGHT);
    }

    return newStore;
  } catch (error) {
    console.error("Error initializing Polotno store:", error);
    // Return a basic store if initialization fails
    return createStoreFunction({
      key: storeKey,
      showCredit: false,
    });
  }
};
