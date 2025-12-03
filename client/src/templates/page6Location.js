
export function generatePage6Location(data) {
  const {
    locationImages = [],
  } = data;

  // Ensure locationImages is an array
  const images = Array.isArray(locationImages) ? locationImages : [];

  return `
<!-- ===== PAGE 6: LOCATION ===== -->
<div class="page">
  <div class="content">
    <!-- Location Header -->
    <div class="section-header" style="margin-bottom: 8px;">LOCATION</div>
    
    <!-- Location Images Section -->
    ${images.length > 0 ? `
      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px;">
        ${images.map((img) => `
          <div style="text-align: center; padding: 4px; border: 1px solid #ccc;">
            <img src="${img.url}" style="max-width: 100%; height: auto; max-height: 280px;" alt="Location"/>
          </div>
        `).join('')}
      </div>
    ` : ''}
    
  </div>
</div>
  `;
}
