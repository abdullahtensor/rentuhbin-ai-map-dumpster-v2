// SAM

import React, { useState } from 'react';

const ImageProcessing = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);

    // Optionally, you can preview the selected image
    const reader = new FileReader();
    reader.onload = () => {
      // Display the selected image preview
      const preview = document.getElementById('imagePreview');
      preview.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!selectedImage) {
      alert('Please select an image.');
      return;
    }

    const formData = new FormData();
    formData.append('org_image_cv2', selectedImage);

    try {
      const response = await fetch('http://0.0.0.0:8080/api/v1/sam', {
        method: 'POST',
        body: formData,
      });
      

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail}`);
        return;
      }

      const imageData = await response.json();
      setProcessedImage(`data:image/png;base64, ${imageData.image}`);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',  // Make child elements flex items
        flexDirection: 'column',  // Stack child elements vertically
        background: 'rgba(255, 255, 255, 0.3)',
        padding: '20px',
        borderRadius: '14px',
        boxShadow: '0 4px 8px rgba(10, 10, 10, 0.5)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <input type="file" onChange={handleImageChange} />
      <button style={{
    backgroundColor: '#4CAF50',  // Green color (you can change this)
    color: 'white',
    padding: '5px 100px',
    whiteSpace: 'nowrap',
    borderRadius: '16px',  // Adjust the border radius as needed
    border: 'none',
    cursor: 'pointer',
    width: '300px',
    textAlign: 'right',
    marginBottom: '20px',
    marginTop:'20px',
  }}onClick={processImage}>Segment Image</button>

      {selectedImage && (
        <div>
          <h2>Selected Image Preview</h2>
          <img id="imagePreview" alt="Selected Image Preview" />
        </div>
      )}

      {processedImage && (
        <div>
          <h2>Processed Image</h2>
          <img src={processedImage} alt="Processed Image" />
        </div>
      )}
    </div>
  );
};

export default ImageProcessing;
