import api from "./axios";

const handleError = (error, defaultMessage) => {
  let errorMessage = defaultMessage;
  
  if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error?.message) {
    errorMessage = error.message;
  }
  
  throw new Error(errorMessage);
};

/**
 * Upload images to Cloudinary via server
 * @param {File[]} files - Array of image files
 * @param {String} folderPath - Cloudinary folder path (e.g., 'valuations/properties')
 * @returns {Promise} Response with uploaded images data
 */
export const uploadImages = async (files, folderPath) => {
  try {
    const formData = new FormData();
    
    // Append all files
    if (Array.isArray(files)) {
      files.forEach((file) => {
        if (file) {
          formData.append('images', file);
        }
      });
    } else {
      formData.append('images', files);
    }
    
    formData.append('folderPath', folderPath);

    const response = await api.post("/images/upload", formData);
    return response.data;
  } catch (error) {
    handleError(error, "Failed to upload images");
  }
};

/**
 * Upload base64 image to Cloudinary
 * @param {String} base64String - Base64 encoded image string
 * @param {String} folderPath - Cloudinary folder path
 * @param {String} fileName - Original file name
 * @returns {Promise} Response with uploaded image data
 */
export const uploadBase64Image = async (base64String, folderPath, fileName = "") => {
  try {
    const response = await api.post("/images/upload-base64", {
      base64String,
      folderPath,
      fileName
    });
    return response.data;
  } catch (error) {
    handleError(error, "Failed to upload image");
  }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID of the image
 * @returns {Promise} Response confirming deletion
 */
export const deleteImage = async (publicId) => {
  try {
    const response = await api.post("/images/delete", {
      publicId
    });
    return response.data;
  } catch (error) {
    handleError(error, "Failed to delete image");
  }
};

/**
 * Upload multiple images and return array of results
 * @param {Object[]} imageArray - Array of image objects with file property
 * @param {String} folderPath - Cloudinary folder path
 * @returns {Promise} Array of uploaded image data
 */
export const uploadMultipleImages = async (imageArray, folderPath) => {
  try {
    const files = imageArray
      .filter(img => img && img.file)
      .map(img => img.file);

    if (files.length === 0) {
      return [];
    }

    const result = await uploadImages(files, folderPath);
    return result.images || [];
  } catch (error) {
    handleError(error, "Failed to upload multiple images");
  }
};

/**
 * Upload images from file inputs and maintain structure
 * @param {Object[]} imagePreviews - Array of preview objects with file property
 * @param {String} baseFolder - Base folder path in Cloudinary
 * @returns {Promise} Array of uploaded image data with original structure
 */
export const uploadPropertyImages = async (imagePreviews, uniqueId) => {
  try {
    const uploadedImages = [];

    for (let i = 0; i < imagePreviews.length; i++) {
      const imagePreview = imagePreviews[i];
      
      if (!imagePreview || !imagePreview.file) {
        continue;
      }

      const formData = new FormData();
      formData.append('images', imagePreview.file);
      formData.append('folderPath', `valuations/${uniqueId}/property_images`);

      const response = await api.post("/images/upload", formData);
      
      if (response.data.images && response.data.images.length > 0) {
        uploadedImages.push({
          ...response.data.images[0],
          inputNumber: imagePreview.inputNumber || i + 1
        });
      }
    }

    return uploadedImages;
  } catch (error) {
    handleError(error, "Failed to upload property images");
  }
};

/**
 * Upload location images
 * @param {Object[]} locationImagePreviews - Array of location image preview objects
 * @param {String} uniqueId - Unique ID for the valuation
 * @returns {Promise} Array of uploaded location images
 */
export const uploadLocationImages = async (locationImagePreviews, uniqueId) => {
  try {
    const uploadedImages = [];

    for (let i = 0; i < locationImagePreviews.length; i++) {
      const imagePreview = locationImagePreviews[i];
      
      if (!imagePreview || !imagePreview.file) {
        continue;
      }

      const formData = new FormData();
      formData.append('images', imagePreview.file);
      formData.append('folderPath', `valuations/${uniqueId}/location_images`);

      const response = await api.post("/images/upload", formData);
      
      if (response.data.images && response.data.images.length > 0) {
        uploadedImages.push(response.data.images[0]);
      }
    }

    return uploadedImages;
  } catch (error) {
    handleError(error, "Failed to upload location images");
  }
};
