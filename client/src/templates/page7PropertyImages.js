
export function generatePage7PropertyImages(data) {
  const {
    propertyImages = [],
  } = data;

  // Ensure we have an array of images
  const images = Array.isArray(propertyImages) ? propertyImages : [];

  // If no images, don't render the page
  if (images.length === 0) {
    return '';
  }

  return `
<!-- ===== PAGE 7: PROPERTY PHOTOGRAPHS ===== -->
<div class="page">
  <div class="content">
    <!-- Header -->
    <div class="section-header" style="margin-bottom: 8px;">PROPERTY PHOTOGRAPHS</div>
    
    <!-- Images Grid -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
      ${images.map((img, index) => `
        <div style="text-align: center; border: 1px solid #ccc; padding: 4px; display: flex; align-items: center; justify-content: center;">
          <img src="${img.url}" style="max-width: 100%; max-height: 180px; height: auto;" alt="Property Image ${img.inputNumber || index + 1}"/>
        </div>
      `).join('')}
    </div>
  </div>
</div>
  `;
}
