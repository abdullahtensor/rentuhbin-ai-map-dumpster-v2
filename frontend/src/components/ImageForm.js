// // src/components/ImageForm.js
import React, { useState } from 'react';
import ApiService from '../ApiService';

const ImageForm = () => {
  const [file, setFile] = useState(null);
  const [parameters, setParameters] = useState({
    height_in_feet: 18,
    width_in_feet: 7.5,
    x_coordinate: 97,
    y_coordinate: 133,
    tilt: -15,
  });
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const [responseStatus, setResponseStatus] = useState({ code: null, text: null,  detail: null });


  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleParameterChange = (event) => {
    const { name, value } = event.target;
    setParameters((prevParameters) => ({ ...prevParameters, [name]: value }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const imageUrl = await ApiService.processImage(file, parameters);
      setProcessedImageUrl(imageUrl);
      setResponseStatus({ code: 200, text: 'Image processed successfully', detail: null });
    } catch (error) {
      console.error('Error processing image:', error);
  
      if (error.response) {
        const { status, statusText, data } = error.response;
        setResponseStatus({
          code: status,
          text: statusText,
          detail: data ? data.detail : null,
          errorResponse: data, // Store the entire error response
        });
      } 
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Upload Image:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <div>
          <label>Height (feet):</label>
          <input
            type="number"
            name="height_in_feet"
            value={parameters.height_in_feet}
            onChange={handleParameterChange}
          />
        </div>
        <div>
          <label>Width (feet):</label>
          <input
            type="number"
            name="width_in_feet"
            value={parameters.width_in_feet}
            onChange={handleParameterChange}
          />
        </div>
        <div>
          <label>X-coordinate:</label>
          <input
            type="number"
            name="x_coordinate"
            value={parameters.x_coordinate}
            onChange={handleParameterChange}
          />
        </div>
        <div>
          <label>Y-coordinate:</label>
          <input
            type="number"
            name="y_coordinate"
            value={parameters.y_coordinate}
            onChange={handleParameterChange}
          />
        </div>
        <div>
          <label>Tilt:</label>
          <input
            type="number"
            name="tilt"
            value={parameters.tilt}
            onChange={handleParameterChange}
          />
        </div>
        <div>
          <button type="submit">Process Image</button>
        </div>
      </form>
      {responseStatus.code !== null && (
        <div>
          <h2>Response Status:</h2>
          <p>Code: {responseStatus.code}</p>
          <p>Status: {responseStatus.text}</p>
          <p>Detail: {responseStatus.detail}</p>
        </div>
      )}
      {processedImageUrl && (
        <div>
          <h2>Processed Image:</h2>
          <img src={processedImageUrl} alt="Processed" />
        </div>
      )}
    </div>
  );
};

export default ImageForm;




