import L from "leaflet";

// Custom organization marker icon
export const createOrganizationIcon = (color = "#ff8c00", isHovered = false) => {
  const size = isHovered ? 35 : 30;
  const shadowSize = isHovered ? 42 : 36;
  
  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        transform: ${isHovered ? 'scale(1.1)' : 'scale(1)'};
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
        </svg>
      </div>
    `,
    className: 'organization-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    shadowUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAYAAACoYAD2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIcSURBVFhH7ZjLSsNAFIafWi+4cBG3UnHjRtwILhQX3fgKIojgO7hyJS58BxfikhdQN4KCCxe6URe6sK0t1Qpe2uJCF/r/k5mTTCZJSzot/vDBTM6c+f85yUlmkkopKXiZUlJKSf//dUqHNNgz5ZQOabBnyjGJSEyWkX3XFNdkNLKKtLdfY1zJmHctu0dBPGVsbS1XPKSWnz/Bka0tYX66t4jvN9jOJjI9natoSA0/fxTKOeKyaGF8LIZ2hEkbslU8pJaf+38e8rHj1fEJD5nG5a5u6nt4CNrAzX5CKPeHFFOk9bXhcyYPW7cGa2YKyU8Z3sEJ75tLtpJtTWRZo2TU7zQdQNPpMVP1eAFBwQk7Z9OHzFnZuoK8gvKQCrh5/pAa5f0hNYDWJKvR3m5Q6p0QOQV5BeUhFfT2QZQUlVRHQ7Mte8goKCspD6ng7YO0FBWJdNdOaShKmQ3Z0sE+eDti7BwSy8H+vQXWnHF9H5JxvBpZRVpf26yRh8j+JmQrKQ+p4O2DtBQV0XSFRbfX8x8U5BWUh1Tw9kFaiopE2lc7pKJo5sxZm4edS6xZN24vN0/tgCy8fZCWrAZvF5aHVPD2QVqKCt4uLA+p4O2DtBQVvF1YHlLB2wdpKSpOu7A8pCJh5xvNGZr9nJOHNOGE+8JSQAFO5QoI3R5FJ8hIHpyKOZXrcJO4UlJKSv9dqFT/AAnaDmUlQFGHAAAAAElFTkSuQmCC',
    shadowSize: [shadowSize, shadowSize],
    shadowAnchor: [shadowSize / 2, shadowSize / 2]
  });
};

// Custom branch marker icon
export const createBranchIcon = (color = "#ff8c00", isHovered = false) => {
  const size = isHovered ? 25 : 20;
  const shadowSize = isHovered ? 30 : 24;
  
  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        transform: ${isHovered ? 'scale(1.1)' : 'scale(1)'};
      ">
        <div style="
          width: ${size - 8}px;
          height: ${size - 8}px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'branch-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    shadowUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAYAAACoYAD2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIcSURBVFhH7ZjLSsNAFIafWi+4cBG3UnHjRtwILhQX3fgKIojgO7hyJS58BxfikhdQN4KCCxe6URe6sK0t1Qpe2uJCF/r/k5mTTCZJSzot/vDBTM6c+f85yUlmkkopKXiZUlJKSf//dUqHNNgz5ZQOabBnyjGJSEyWkX3XFNdkNLKKtLdfY1zJmHctu0dBPGVsbS1XPKSWnz/Bka0tYX66t4jvN9jOJjI9natoSA0/fxTKOeKyaGF8LIZ2hEkbslU8pJaf+38e8rHj1fEJD5nG5a5u6nt4CNrAzX5CKPeHFFOk9bXhcyYPW7cGa2YKyU8Z3sEJ75tLtpJtTWRZo2TU7zQdQNPpMVP1eAFBwQk7Z9OHzFnZuoK8gvKQCrh5/pAa5f0hNYDWJKvR3m5Q6p0QOQV5BeUhFfT2QZQUlVRHQ7Mte8goKCspD6ng7YO0FBWJdNdOaShKmQ3Z0sE+eDti7BwSy8H+vQXWnHF9H5JxvBpZRVpf26yRh8j+JmQrKQ+p4O2DtBQV0XSFRbfX8x8U5BWUh1Tw9kFaiopE2lc7pKJo5sxZm4edS6xZN24vN0/tgCy8fZCWrAZvF5aHVPD2QVqKCt4uLA+p4O2DtBQVvF1YHlLB2wdpKSpOu7A8pCJh5xvNGZr9nJOHNOGE+8JSQAFO5QoI3R5FJ8hIHpyKOZXrcJO4UlJKSv9dqFT/AAnaDmUlQFGHAAAAAElFTkSuQmCC',
    shadowSize: [shadowSize, shadowSize],
    shadowAnchor: [shadowSize / 2, shadowSize / 2]
  });
};
