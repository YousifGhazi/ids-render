export function objectToFormData(
  obj: Record<string, unknown>,
  formData?: FormData,
  parentKey?: string
): FormData {
  const form = formData || new FormData();

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const formKey = parentKey ? `${parentKey}[${key}]` : key;

      if (value === null || value === undefined) {
        // Skip null/undefined values
        continue;
      } else if (value instanceof File || value instanceof Blob) {
        // Handle File/Blob objects
        form.append(formKey, value);
      } else if (Array.isArray(value)) {
        // Handle arrays
        value.forEach((item, index) => {
          const arrayKey = `${formKey}[${index}]`;
          if (
            item &&
            typeof item === "object" &&
            !(item instanceof File) &&
            !(item instanceof Blob)
          ) {
            objectToFormData(item as Record<string, unknown>, form, arrayKey);
          } else {
            form.append(arrayKey, item?.toString() || "");
          }
        });
      } else if (typeof value === "object" && !(value instanceof Date)) {
        // Handle nested objects (excluding Date objects)
        objectToFormData(value as Record<string, unknown>, form, formKey);
      } else {
        // Handle primitive values and Date objects
        form.append(formKey, value?.toString() || "");
      }
    }
  }

  return form;
}
