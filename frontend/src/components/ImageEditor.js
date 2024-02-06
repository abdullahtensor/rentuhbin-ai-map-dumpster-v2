import React, { useState, useRef, useEffect } from 'react';
import ApiService from './ApiService';
import '../index.css';
import axios from 'axios';

const ImageEditor = () => {
  const [coordinates, setCoordinates] = useState({ x: null, y: null });
  const [image, setImage] = useState(null);
  const [rectangleTilt, setRectangleTilt] = useState(0);
  const [file, setFile] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [result, setResult] = useState({ status_message: '', placeable: '' });

  const [inputValues, setInputValues] = useState({
    height_in_feet: 22,
    width_in_feet: 8,
    x_coordinate: null,
    y_coordinate: null,
    tilt: null,
  });

  const canvasRef = useRef(null);

  const imageInputRef = useRef(null);

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];

    const img = new Image();
    img.src = URL.createObjectURL(selectedImage);

    const canvas = document.createElement('canvas');
    canvas.width = 491;
    canvas.height = 255;

    const context = canvas.getContext('2d');

    img.onload = () => {
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      const resizedImageUrl = canvas.toDataURL('image/jpeg');
      setImage(resizedImageUrl);
    };

    img.onerror = (error) => {
      console.error('Error loading image:', error);
    };

    setFile(selectedImage);
  };

  const handleMouseMove = (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setCoordinates({ x, y });
  };

  const handleImageClick = async () => {
    if (!file) {
      console.error('No image file selected.');
      return;
    }
  
    const w = 10;
    const h = 39;
  
    const adjustedX = Math.round(coordinates.x - w / 2);
    const adjustedY = Math.round(coordinates.y - h / 2);
    const tiltForApi = (rectangleTilt + 90) % 360;
    console.log("OX",adjustedX)
    console.log("OY",adjustedY)
  
    try {
      const formData = new FormData();
      formData.append('org_image', file);
      formData.append('height_in_feet', 22);
      formData.append('width_in_feet', 8);
      formData.append('x_coordinate', adjustedX);
      formData.append('y_coordinate', adjustedY);
      formData.append('tilt', tiltForApi);
  
      const response = await fetch('http://0.0.0.0:8080/api/v1/combined', {
        method: 'POST',
        body: formData,
      });
  
      const resultData = await response.json();
      setResult(resultData);
    //   const adjustedX=adjustedX+5
    //   const adjustedY=adjustedY+19
  
      if (resultData.placeable === 'True') {
        // Draw rectangle on a new canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
  
        const rectWidth = 42;
        const rectHeight = 16;
 

  
        const img = new Image();
        img.src = URL.createObjectURL(file); // Use original image URL
  
        img.onload = () => {
            // Set canvas size to match the original image size
            canvas.width = 491;
            canvas.height = 255;
            
            console.log("IX",adjustedX)
            console.log("IY",adjustedY)
          
            // Draw the image
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
          
            // Apply transformations and draw the rectangle
            context.translate(adjustedX, adjustedY);
            context.rotate((rectangleTilt * Math.PI) / 180);
            context.strokeStyle = 'rgb(0, 255, 0, 1)';
            context.lineWidth = 1.5;
            context.strokeRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
          
            // Convert canvas to data URL and set it as processed image
            const processedImageUrl = canvas.toDataURL('image/jpeg');
            setProcessedImageUrl(processedImageUrl);
          };
      }
      else {
        // Handle the case when resultData.placeable is not 'True'
        // For example, clear the processed image
        setProcessedImageUrl(null);
      }
      
    } catch (error) {
      console.error('Error from server:', error.response);
      // Handle the error here
    }
  };
  
  
  
  
  
  
  
          useEffect(() => {
            // Draw the processed image on the canvas if available
            if (processedImageUrl) {
              const canvas = canvasRef.current;
              const context = canvas.getContext('2d');
        
              const img = new Image();  // <-- Define 'img'
              img.src = processedImageUrl;  // <-- Use 'processedImageUrl' or another source if applicable

              img.onload = () => {
                canvas.width = 491;
                canvas.height = 255;
                context.drawImage(img, 0, 0, canvas.width, canvas.height);
              };
            }
          }, [processedImageUrl]);

  const handleRectangleTiltChange = (event) => {
    setRectangleTilt(Number(event.target.value));
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.3)',
      padding: '20px',
      borderRadius: '14px',
      boxShadow: '0 4px 8px rgba(10, 10, 10, 0.5)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }}>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        ref={imageInputRef}
      />

      {image && (
        <div>
          <img
            src={image}
            alt="Resized Image"
            style={{
              maxWidth: '100%',
              marginTop: '20px',
            }}
          />
        </div>
      )}

      <div>
        Rectangle Tilt:
        <input
          type="range"
          style={{ marginTop: '30px' }}
          className="tilt-slider"
          min="-90"
          max="90"
          value={rectangleTilt}
          onChange={handleRectangleTiltChange}
        />

        Tilt Value: {rectangleTilt}°
      </div>

      {image && (
        <div style={{ position: 'relative', display: 'inline-block', marginTop: '50px' }}>
          <img
            src={image}
            alt="Uploaded Image"
            onMouseMove={handleMouseMove}
            onClick={handleImageClick}
            style={{
              maxWidth: '100%',
              cursor: 'crosshair',
            }}
          />
          {coordinates.x !== null && (
            <div style={{
              position: 'absolute',
              border: '2px solid red',
              width: '42px',
              height: '16px',
              top: coordinates.y - 30,
              left: coordinates.x - 25,
              transform: `rotate(${rectangleTilt}deg)`,
            }}></div>
          )}
        </div>
      )}

      {coordinates.x !== null && (
        <div>
          Coordinates: X: {coordinates.x}, Y: {coordinates.y}
        </div>
      )}

      {inputValues.x_coordinate !== null && (
        <div>
          <h2>Input Values:</h2>
          <p>Height (feet): {inputValues.height_in_feet}</p>
          <p>Width (feet): {inputValues.width_in_feet}</p>
          <p>X-coordinate: {inputValues.x_coordinate}</p>
          <p>Y-coordinate: {inputValues.y_coordinate}</p>
          <p>Tilt: {inputValues.tilt}°</p>
        </div>
      )}

<div>
  <h2>Status Message:</h2>
  <p style={{ color: 'grey', display: 'inline' }}>{result && result.status_message}</p>
  <h2>Placeable:</h2>
  <p style={{ color: 'grey', display: 'inline' }}>{result && result.placeable}</p>
  
</div>
<canvas
        ref={canvasRef}
        style={{
          display: processedImageUrl ? 'block' : 'none',
          maxWidth: '100%',
          marginTop: '20px',
        }}
      />

    </div>
  );
};

export default ImageEditor;










// import React, { useState, useRef } from 'react';

// import ApiService from './ApiService';
// import '../index.css';

// const ImageEditor = () => {
//   const [coordinates, setCoordinates] = useState({ x: null, y: null });
//   const [image, setImage] = useState(null);
//   const [rectangleTilt, setRectangleTilt] = useState(0);
//   const [file, setFile] = useState(null);
//   const [processedImageUrl, setProcessedImageUrl] = useState(null);
//   const [apiResult, setApiResult] = useState(null);
//   const [inputValues, setInputValues] = useState({
//     height_in_feet: 22,
//     width_in_feet: 8,
//     x_coordinate: null,
//     y_coordinate: null,
//     tilt: null,
    
//   });



//   const imageInputRef = useRef(null);

//   const handleImageChange = (event) => {
//     const selectedImage = event.target.files[0];

//     // Load the original image into a new Image element
//     const img = new Image();
//     img.src = URL.createObjectURL(selectedImage);

//     // Create a canvas element to draw the resized image
//     const canvas = document.createElement('canvas');
//     canvas.width = 491; // Set the desired width
//     canvas.height = 255; // Set the desired height

//     const context = canvas.getContext('2d');

//     // Wait for the image to load before drawing it on the canvas
//     img.onload = () => {
//       // Draw the resized image on the canvas
//       context.drawImage(img, 0, 0, canvas.width, canvas.height);

//       // Convert the canvas content back to a data URL
//       const resizedImageUrl = canvas.toDataURL('image/jpeg');

//       // Set the resized image URL to state
//       setImage(resizedImageUrl);
//     };

//     // Handle errors during image loading
//     img.onerror = (error) => {
//       console.error('Error loading image:', error);
//     };

//     // Use the original file in the ApiService.processImage function
//     setFile(selectedImage);
//   };
// //   const handleButtonClick = () => {
// //     // Trigger click on the hidden file input
// //     imageInputRef.current.click();
// //   };

//     const handleMouseMove = (event) => {
//         const rect = event.target.getBoundingClientRect();
//         const x = event.clientX - rect.left;
//         const y = event.clientY - rect.top;

//         setCoordinates({ x, y });
//     };
//   const handleImageClick = async () => {
//     if (!file) {
//       console.error('No image file selected.');
//       return;
//     }

//     const w = 10;
//     const h = 39;

//     const adjustedX = Math.round(coordinates.x - w / 2);
//     const adjustedY = Math.round(coordinates.y - h / 2);

//     const tiltForApi = (rectangleTilt + 90) % 360;

//     console.log('Adjusted Coordinates:', adjustedX, adjustedY);
//     console.log('Tilt for API:', tiltForApi);

//     try {
//       const imageUrl = await ApiService.processImage(file, {
//         height_in_feet: 22,
//         width_in_feet: 8,
//         x_coordinate: adjustedX,
//         y_coordinate: adjustedY,
//         tilt: tiltForApi,
//       });

//       setProcessedImageUrl(imageUrl);

//       // Store input values for display
//       setInputValues({
//         height_in_feet: 22,
//         width_in_feet: 8,
//         x_coordinate: adjustedX,
//         y_coordinate: adjustedY,
//         tilt: tiltForApi,
//       });

//       // Assuming the API result is an image URL, update the state
//       setApiResult(imageUrl);
//     } catch (error) {
//         console.error('Error processing image:', error);
    
//         // Handle the error by displaying an error message
//         setApiResult(null);
//         setProcessedImageUrl(null);
    
//         // You can add more detailed error handling here based on the actual error received
//         alert('Error processing image. Please try again.');
//       }
//   };

//   const handleRectangleTiltChange = (event) => {
//     setRectangleTilt(Number(event.target.value));};

//   return (
//     <div
//     style={{
//         background: 'rgba(255, 255, 255, 0.3)', // Transparent white background
//         padding: '20px',
//         borderRadius: '14px',
//         boxShadow: '0 4px 8px rgba(10, 10, 10, 0.5)',
//         backdropFilter: 'blur(10px)', // Adjust the blur intensity as needed
//         WebkitBackdropFilter: 'blur(10px)', // For compatibility with some browsers
//       }}
//   >
    
//     {/* <input type="file" accept="image/*" onChange={handleImageChange} /> */}
//     <input
//         type="file"
//         accept="image/*"
//         onChange={handleImageChange}

//         ref={imageInputRef}
//       />

// {image && (
//         <div>
//           <img
//             src={image}
//             alt="Resized Image"
//             style={{
//               maxWidth: '100%',
//               marginTop: '20px',
//             }}
//           />
          
//         </div>
//       )}

//       <div >
//         Rectangle Tilt:
//         <input
//             type="range"
//             style={{marginTop:'30px'}}
//             className="tilt-slider"  // Add a class name
//             min="-90"
//             max="90"
//             value={rectangleTilt}
//             onChange={handleRectangleTiltChange}
//             />
        
//         Tilt Value: {rectangleTilt}°
        
//       </div> 



      
//       {image && (
//         <div style={{ position: 'relative', display: 'inline-block', marginTop: '50px' }}>
            
//           <img 
//             src={image}
//             alt="Uploaded Image"
//             onMouseMove={handleMouseMove}
//             onClick={handleImageClick}
//             style={{
//               maxWidth: '100%',
//               cursor: 'crosshair',
//             }}
//           />
//           {coordinates.x !== null && (
//             <div
//             style={{
//                 position: 'absolute',
//                 border: '2px solid red',
//                 width: '42px',
//                 height: '16px',
//                 top: coordinates.y - 30,
//                 left: coordinates.x - 25,
//                 transform: `rotate(${rectangleTilt}deg)`,
//               }}
//             ></div>
//           )}
//         </div>
//       )}
//       {coordinates.x !== null && (
//         <div>
//           Coordinates: X: {coordinates.x}, Y: {coordinates.y}
//         </div>
//       )}
//       {inputValues.x_coordinate !== null && (
//         <div>
//           <h2>Input Values:</h2>
//           <p>Height (feet): {inputValues.height_in_feet}</p>
//           <p>Width (feet): {inputValues.width_in_feet}</p>
//           <p>X-coordinate: {inputValues.x_coordinate}</p>
//           <p>Y-coordinate: {inputValues.y_coordinate}</p>
//           <p>Tilt: {inputValues.tilt}°</p>
//         </div>
//       )}
//       {processedImageUrl && (
//         <div>
//           <h2>Processed Image:</h2>
//           <img src={processedImageUrl} alt="Processed" />
//         </div>
//       )}
//       {apiResult && (
//         <div>
//           <h2>API Result:</h2>
//           <img src={apiResult} alt="API Result" />
//         </div>
        
//       )}
      
//     </div>
    
//   );
// };

// export default ImageEditor;





















// use below div if you want to use IOSSlider
{/* <div>
    Rectangle Tilt:
    <IOSSlider
        type="range"
        min='-90'
        max={90}
        value={rectangleTilt}
        onChange={handleRectangleTiltChange}
    //   ValueLabelComponent={({ children, value }) => (
    //     <Tooltip enterTouchDelay={0} placement="top" title={value}>
    //       {children}
    //     </Tooltip>
    //   )}
    />
    Tilt Value: {rectangleTilt}°
    </div> */}


//   const handleMouseMove = (event) => {
//     const rect = event.target.getBoundingClientRect();
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;
  
//     // Get the dimensions of the image
//     const imageWidth = event.target.width;
//     const imageHeight = event.target.height;
  
//     // Calculate the rectangle boundaries
//     const rectangleWidth = 40; // Adjust the rectangle size as needed
//     const rectangleHeight = 15; // Adjust the rectangle size as needed
  
//     // Restrict the x-coordinate within the image boundaries
//     const minX = 0;
//     const maxX = imageWidth - rectangleWidth;
//     const restrictedX = Math.max(minX, Math.min(x - rectangleWidth / 2, maxX)+16);
  
//     // Restrict the y-coordinate within the image boundaries
//     const minY = 0;
//     const maxY = imageHeight - rectangleHeight;
//     const restrictedY = Math.max(minY, Math.min(y - rectangleHeight / 2, maxY)+25);
  
//     setCoordinates({ x: restrictedX, y: restrictedY });
//   };