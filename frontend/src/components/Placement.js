// import React, { useState } from 'react';

// const DrawRectangle = () => {
//   const [bgImage, setBgImage] = useState(null);
//   const [orgImage, setOrgImage] = useState(null);
//   const [height, setHeight] = useState('');
//   const [width, setWidth] = useState('');
//   const [xCoordinate, setXCoordinate] = useState('');
//   const [yCoordinate, setYCoordinate] = useState('');
//   const [tilt, setTilt] = useState('');
//   const [result, setResult] = useState({ image: '', status_message: '', placeable: '' });

//   const handleBgImageChange = (e) => {
//     setBgImage(e.target.files[0]);
//   };

//   const handleOrgImageChange = (e) => {
//     setOrgImage(e.target.files[0]);
//   };

//   const drawRectangle = async () => {
//     const formData = new FormData();
//     formData.append('bg_image_path', bgImage);
//     formData.append('org_path', orgImage);
//     formData.append('height_in_feet', height);
//     formData.append('width_in_feet', width);
//     formData.append('x_coordinate', xCoordinate);
//     formData.append('y_coordinate', yCoordinate);
//     formData.append('tilt', tilt);

//     try {
//       const response = await fetch('http://127.0.0.1:8080/api/v1/placement', {
//         method: 'POST',
//         body: formData,
//       });

//       const resultData = await response.json();
//       setResult(resultData);
//     } catch (error) {
//       console.error('Error:', error.message);
//     }
//   };

//   return (
//     <div
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',  // Center align the items horizontally
//         gap: '20px',  // Add a gap of 10 pixels between child elements
//         background: 'rgba(255, 255, 255, 0.3)',
//         padding: '20px',
//         borderRadius: '14px',
//         boxShadow: '0 4px 8px rgba(10, 10, 10, 0.5)',
//         backdropFilter: 'blur(10px)',
//         WebkitBackdropFilter: 'blur(10px)',
//       }}
//     >
//       <h1>Draw Rectangle</h1>
//       <input type="file" accept="image/*" onChange={handleBgImageChange} />
//       <input type="file" accept="image/*" onChange={handleOrgImageChange} />
//       <input type="number" placeholder="Height" value={height} onChange={(e) => setHeight(e.target.value)} />
//       <input type="number" placeholder="Width" value={width} onChange={(e) => setWidth(e.target.value)} />
//       <input type="number" placeholder="X-coordinate" value={xCoordinate} onChange={(e) => setXCoordinate(e.target.value)} />
//       <input type="number" placeholder="Y-coordinate" value={yCoordinate} onChange={(e) => setYCoordinate(e.target.value)} />
//       <input type="number" placeholder="Tilt" value={tilt} onChange={(e) => setTilt(e.target.value)} />
//       <button   style={{
//     backgroundColor: '#4CAF50',  // Green color (you can change this)
//     color: 'white',
//     padding: '10px 20px',
//     borderRadius: '16px',  // Adjust the border radius as needed
//     border: 'none',
//     cursor: 'pointer',
//   }} onClick={drawRectangle}>Draw Rectangle</button>
//   <div>
//       <div>
//         <h2>Status Message:</h2>
//         <p     style={{
//       color: '#555',  // Change this to the desired color
//       fontSize: '16px',  // Adjust the font size as needed
//     }}>{result.status_message}</p>
//       </div>
//       <div>
//         <h2>Placeable:</h2>
//         <p     style={{
//       color: '#555',  // Change this to the desired color
//       fontSize: '16px',  // Adjust the font size as needed
//     }}>{result.placeable}</p>
//       </div>
//       <div>
//         <h2>Image:</h2>
//         <img src={`data:image/png;base64,${result.image}`}  />
//       </div>
//     </div>
//     </div>
//   );
  
// };

// export default DrawRectangle;

import React, { useState, useRef, useEffect } from 'react';

const DrawRectangle = () => {
  const [bgImage, setBgImage] = useState(null);
  const [orgImage, setOrgImage] = useState(null);
  const [tilt, setTilt] = useState(0);
  const [height, setHeight] = useState(2);
  const [width, setWidth] = useState(2);
  const [image, setImage] = useState(null);
  const [rectangleTilt, setRectangleTilt] = useState(0);
  const [rectangleCoordinates, setRectangleCoordinates] = useState({ startX: null, startY: null });
  const [hoverCoordinates, setHoverCoordinates] = useState({ x: null, y: null });
  const [result, setResult] = useState({ image: '', status_message: '', placeable: '' });
  const [coordinates, setCoordinates] = useState({ x: null, y: null });
  const [file, setFile] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const [inputValues, setInputValues] = useState({
    height_in_feet: 22,
    width_in_feet: 8,
    x_coordinate: null,
    y_coordinate: null,
    tilt: null,
    
  });

  // Canvas references
  const orgCanvasRef = useRef(null);

  const handleBgImageChange = (e) => {
    setBgImage(e.target.files[0]);
  };

  const handleOrgImageChange = (e) => {
    setOrgImage(e.target.files[0]);
  };
const drawRectangle = () => {
    // Check if click coordinates are available
    if (rectangleCoordinates.startX !== null) {
      // Perform API call using orgImage and rectangleCoordinates
      // Add your API call logic here
      try {
        const formData = new FormData();
        formData.append('bg_image_path', bgImage);
        formData.append('org_path', orgImage);
        formData.append('height_in_feet', height);
        formData.append('width_in_feet', width);
        formData.append('x_coordinate', rectangleCoordinates.startX);
        formData.append('y_coordinate', rectangleCoordinates.startY);
        formData.append('tilt', tilt);
  
        fetch('http://0.0.0.0:8080/api/v1/placement', {
          method: 'POST',
          body: formData,
        })
          .then((response) => response.json())
          .then((resultData) => {
            setResult(resultData);
  
            // Update orgCanvas with the new image
            const orgCanvas = orgCanvasRef.current;
            const ctxOrg = orgCanvas.getContext('2d');
            const image = new Image();
            image.src = `data:image/png;base64, ${resultData.image}`;
            image.onload = () => {
              ctxOrg.clearRect(0, 0, orgCanvas.width, orgCanvas.height);
              ctxOrg.drawImage(image, 0, 0, orgCanvas.width, orgCanvas.height);
            };
          })
          .catch((error) => {
            console.error('Error:', error.message);
          });
      } catch (error) {
        console.error('Error:', error.message);
      }
    }
  };

  const handleMouseMove = (e) => {
    const rect = orgCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHoverCoordinates({ x, y });

    // Call the drawRectangle function when the mouse is clicked
    if (e.buttons === 1) {
      drawRectangle(x, y);
    }
  };

  const handleMouseClick = (e) => {
    // Get the click coordinates relative to the canvas
    const rect = orgCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update the state with the click coordinates
    setRectangleCoordinates({ startX: x, startY: y });

    // Call the drawRectangle function to perform API call
    drawRectangle();
  };
  const handleRectangleTiltChange = (event) => {
    setRectangleTilt(Number(event.target.value));};
//   const handleMouseMove = (event) => {
//     const rect = event.target.getBoundingClientRect();
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;

//     setCoordinates({ x, y });
// };
  useEffect(() => {
    // Load orgImage onto the canvas after rendering
    if (orgImage) {
      const orgCanvas = orgCanvasRef.current;
      const ctxOrg = orgCanvas.getContext('2d');

      const image = new Image();
      image.src = URL.createObjectURL(orgImage);

      image.onload = () => {
        // Resize canvas to a fixed size (848x480)
        orgCanvas.width = 848;
        orgCanvas.height = 480;

        // Draw the image on the canvas
        ctxOrg.drawImage(image, 0, 0, 848, 480);
      };
    }
  }, [orgImage]);

  return (
    <div 
          style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',  // Center align the items horizontally
                gap: '20px',  // Add a gap of 10 pixels between child elements
                background: 'rgba(255, 255, 255, 0.3)',
                padding: '20px',
                borderRadius: '14px',
                boxShadow: '0 4px 8px rgba(10, 10, 10, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}>
      <input type="file" accept="image/*" onChange={handleBgImageChange} />
      <input type="file" accept="image/*" onChange={handleOrgImageChange} />

      {/* Input fields for tilt, height, and width */}
      <div>
        <label>Tilt:</label>
        <input type="number" value={tilt} onChange={(e) => setTilt(e.target.value)} />
      </div>
      <div>
        <label>Height:</label>
        <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
      </div>
      <div>
        <label>Width:</label>
        <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} />
      </div>
      {/* Display orgCanvas below the file input fields */}
      <canvas
        ref={orgCanvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleMouseClick}
        style={{ border: '1px solid #ddd', cursor: 'crosshair', position: 'relative', marginBottom: '10px' }}
      ></canvas>

      {/* Display hover coordinates under the canvas */}
      {hoverCoordinates.x !== null && (
        <div style={{ position: 'relative', top: '0', left: '0', marginBottom: '10px' }}>
          Hover Coordinates: X: {hoverCoordinates.x}, Y: {hoverCoordinates.y}
        </div>
      )}

      {/* Display result and coordinates */}
      <div>
      <img src={`data:image/png;base64,${result.image}`} />
        <h2>Status Message:</h2>
        <p>{result.status_message}</p>
        <h2>Placeable:</h2>
        <p>{result.placeable}</p>
      </div>
    </div>
  );
};

export default DrawRectangle;

