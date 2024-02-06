// import React, { useState } from 'react';

// const PlacementComponent = () => {
//   const [bgImage, setBgImage] = useState(null);
//   const [orgImage, setOrgImage] = useState(null);
//   const [height, setHeight] = useState(0);
//   const [width, setWidth] = useState(0);
//   const [xCoordinate, setXCoordinate] = useState(0);
//   const [yCoordinate, setYCoordinate] = useState(0);
//   const [tilt, setTilt] = useState(0);
//   const [resultImage, setResultImage] = useState('');
//   const [statusMessage, setStatusMessage] = useState('');
//   const [placeable, setPlaceable] = useState('');
//   const resolution = 10;
//   const [heightFeet, setHeightFeet] = useState(0);
//   const [widthFeet, setWidthFeet] = useState(0);
//   const imageWidthMeters = 105;
//   const imageHeightMeters = 50;

//   const handleBgImageChange = (event) => {
//     setBgImage(event.target.files[0]);
//   };
 
//   const feetToMeters = (feet) => {
//     return feet * 0.3048; // 1 foot is approximately 0.3048 meters
//   };

//   const feetToPixels = (feet) => {
//     const meters = feetToMeters(feet);
//     return meters * resolution;
//   };

//   const handleOrgImageChange = (event) => {
//     setOrgImage(event.target.files[0]);
//   };

//   const handlePlacement = () => {
//     // Implement your placement logic here...
//     const heightPixels = feetToPixels(heightFeet);
//     const widthPixels = feetToPixels(widthFeet);

//     // Example result, update this based on your actual placement logic
//     const resultData = {
//       image: 'base64_image_data', // Replace with the actual base64 image data
//       status_message: 'Placement successful',
//       placeable: 'Object is placeable',
//     };

//     setResultImage(resultData.image);
//     setStatusMessage(resultData.status_message);
//     setPlaceable(resultData.placeable);
//   };
  

//   const drawRectangle = (ctx) => {
//     // Convert feet to pixels
//     const heightPixels = feetToPixels(height);
//     const widthPixels = feetToPixels(width);
  
//     // Draw the rectangle on the canvas
//     ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
//     ctx.translate(xCoordinate, yCoordinate);
//     ctx.rotate((tilt * Math.PI) / 180); // Convert degrees to radians
//     ctx.fillRect(-widthPixels / 2, -heightPixels / 2, widthPixels, heightPixels);
//     ctx.rotate((-tilt * Math.PI) / 180); // Reset rotation
//     ctx.translate(-xCoordinate, -yCoordinate);
//   };


//   const handleCanvasClick = () => {
//     const canvas = document.getElementById('orgCanvas');
//     const ctx = canvas.getContext('2d');
  
//     // Clear the canvas
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
  
//     // Draw the original image
//     const orgImg = new Image();
//     orgImg.src = URL.createObjectURL(orgImage);
//     orgImg.onload = () => {
//       // Resize the original image to (848, 480)
//       ctx.drawImage(orgImg, 0, 0, 848, 480);
  
//       // Draw the rectangle
//       drawRectangle(ctx);
//     };
//   };
 
  

//   return (
//     <div>
//       <input type="file" accept="image/*" onChange={handleBgImageChange} />
//       <input type="file" accept="image/*" onChange={handleOrgImageChange} />

//       <div>
//         <label>Height:</label>
//         <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
//       </div>
//       <div>
//         <label>Width:</label>
//         <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} />
//       </div>
//       <div>
//         <label>X Coordinate:</label>
//         <input type="number" value={xCoordinate} onChange={(e) => setXCoordinate(e.target.value)} />
//       </div>
//       <div>
//         <label>Y Coordinate:</label>
//         <input type="number" value={yCoordinate} onChange={(e) => setYCoordinate(e.target.value)} />
//       </div>
//       <div>
//         <label>Tilt:</label>
//         <input type="number" value={tilt} onChange={(e) => setTilt(e.target.value)} />
//       </div>

//       <button onClick={handleCanvasClick}>Place Object</button>

//       <canvas id="orgCanvas" width="848" height="480"></canvas>

//       <div>
//         <img src={`data:image/png;base64,${resultImage}`} alt="Result" />
//         <h2>Status Message:</h2>
//         <p>{statusMessage}</p>
//         <h2>Placeable:</h2>
//         <p>{placeable}</p>
      
//       </div>
//     </div>
//   );
// };

// export default PlacementComponent;






// import React, { useState } from 'react';

// const PlacementComponent = () => {
//   const [bgImage, setBgImage] = useState(null);
//   const [orgImage, setOrgImage] = useState(null);
//   const [heightFeet, setHeightFeet] = useState(0);
//   const [widthFeet, setWidthFeet] = useState(0);
//   const [xCoordinate, setXCoordinate] = useState(0);
//   const [yCoordinate, setYCoordinate] = useState(0);
//   const [tilt, setTilt] = useState(0);
//   const [statusMessage, setStatusMessage] = useState('');
//   const [placeable, setPlaceable] = useState('');
//   const [resultImage, setResultImage] = useState('');
//   const resolution = 10;
//   const lowerPurple = [120, 50, 50];  // HSV values for purple
//   const upperPurple = [150, 255, 255];

//   const feetToMeters = (feet) => {
//     return feet * 0.3048; // 1 foot is approximately 0.3048 meters
//   };
//   const isPurple = (hsv) => {
//     const [h, s, v] = hsv;
//     const [lowerH, lowerS, lowerV] = lowerPurple;
//     const [upperH, upperS, upperV] = upperPurple;
  
//     return (
//       h >= lowerH && h <= upperH &&
//       s >= lowerS && s <= upperS &&
//       v >= lowerV && v <= upperV
//     );
//   };

//   const feetToPixels = (feet) => {
//     const meters = feetToMeters(feet);
//     return meters * resolution;
//   };
  

//   const calculateAreas = (pixels) => {
//     const objectHeightPixels = feetToPixels(heightFeet);
//     const objectWidthPixels = feetToPixels(widthFeet);
  
//     const objectAreaPixels = objectHeightPixels * objectWidthPixels;
//     const purpleArea = calculatePurpleArea(pixels, objectHeightPixels, objectWidthPixels, xCoordinate, yCoordinate);
  
//     return { objectAreaPixels, purpleArea };
//   };
//   const calculatePurpleArea = (ctx, objectHeight, objectWidth, objectX, objectY) => {
//     const imageData = ctx.getImageData(0, 0, 848, 480);
//     const pixels = imageData.data;
//     let purpleArea = 0;
  
//     for (let i = 0; i < pixels.length; i += 4) {
//       // Extract HSV values from the pixel data
//       const r = pixels[i];
//       const g = pixels[i + 1];
//       const b = pixels[i + 2];
//       const hsv = rgbToHsv(r, g, b);
  
//       // Check if the pixel is purple
//       if (isPurple(hsv)) {
//         const pixelX = (i / 4) % 848;
//         const pixelY = Math.floor((i / 4) / 848);
  
//         // Check if the pixel is within the object boundaries
//         if (
//           pixelX >= objectX - objectWidth / 2 &&
//           pixelX <= objectX + objectWidth / 2 &&
//           pixelY >= objectY - objectHeight / 2 &&
//           pixelY <= objectY + objectHeight / 2
//         ) {
//           purpleArea++;
//         }
//       }
//     }
  
//     return purpleArea;
//   };
// //   const calculatePurpleArea = (ctx, objectHeight, objectWidth, objectX, objectY) => {
// //   const imageData = ctx.getImageData(0, 0, 848, 480); // Assuming canvas size is 848x480
// //   const pixels = imageData.data;
// //   let purpleArea = 0;

// //   for (let i = 0; i < pixels.length; i += 4) {
// //     const isPurple =
// //       pixels[i] >= 120 && pixels[i] <= 150 && pixels[i + 1] >= 50 && pixels[i + 2] >= 50;

// //     if (isPurple) {
// //       const pixelX = (i / 4) % 848;
// //       const pixelY = Math.floor((i / 4) / 848);

// //       if (
// //         pixelX >= objectX - objectWidth / 2 &&
// //         pixelX <= objectX + objectWidth / 2 &&
// //         pixelY >= objectY - objectHeight / 2 &&
// //         pixelY <= objectY + objectHeight / 2
// //       ) {
// //         purpleArea++;
// //       }
// //     }
// //   }

// //   return purpleArea;
// // };

// const rgbToHsv = (r, g, b) => {
//     const max = Math.max(r, g, b);
//     const min = Math.min(r, g, b);
//     const d = max - min;
//     let h, s, v;
  
//     v = max / 255;
  
//     if (max === 0) {
//       s = 0;
//     } else {
//       s = d / max;
//     }
  
//     if (max === min) {
//       h = 0;
//     } else {
//       switch (max) {
//         case r:
//           h = (g - b) / d + (g < b ? 6 : 0);
//           break;
//         case g:
//           h = (b - r) / d + 2;
//           break;
//         case b:
//           h = (r - g) / d + 4;
//           break;
//       }
  
//       h /= 6;
//     }
  
//     return [h * 360, s * 100, v * 100];
//   };
// const drawRectangleOnImage = (ctx, objectX, objectY, objectWidth, objectHeight) => {
//     // Draw the rectangle
//     ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
//     ctx.translate(objectX, objectY);
//     ctx.rotate((tilt * Math.PI) / 180);
//     ctx.fillRect(-objectWidth / 2, -objectHeight / 2, objectWidth, objectHeight);
//     ctx.rotate((-tilt * Math.PI) / 180);
//     ctx.translate(-objectX, -objectY);
//   };

//   const handleCanvasClick = () => {
//     const canvas = document.getElementById('orgCanvas');
//     const ctx = canvas.getContext('2d');
  
//     // Draw the original image
//     const orgImg = new Image();
//     orgImg.src = URL.createObjectURL(orgImage);
//     orgImg.onload = () => {
//       // Resize the original image to (848, 480)
//       ctx.drawImage(orgImg, 0, 0, 848, 480);
  
//       // Get image data
//       const imageData = ctx.getImageData(0, 0, 848, 480);
//       const pixels = imageData.data;
  
//       // Calculate areas
//       const { objectAreaPixels, purpleArea } = calculateAreas(pixels);
  
//       // Decide whether to place the object
//       if (purpleArea >= objectAreaPixels) {
//         // Draw the rectangle on the image
//         drawRectangleOnImage(ctx, xCoordinate, yCoordinate, feetToPixels(widthFeet), feetToPixels(heightFeet));
  
//         // Set the result data
//         setStatusMessage('Placement successful');
//         setPlaceable('Object is placeable');
//       } else {
//         // Do not place the object
//         setStatusMessage('Object cannot be placed due to insufficient purple area');
//         setPlaceable('False');
//       }
//     };
//   };

//   return (
//     <div>
//       <input type="file" accept="image/*" onChange={(e) => setBgImage(e.target.files[0])} />
//       <input type="file" accept="image/*" onChange={(e) => setOrgImage(e.target.files[0])} />

//       <div>
//         <label>Height (feet):</label>
//         <input type="number" value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} />
//       </div>
//       <div>
//         <label>Width (feet):</label>
//         <input type="number" value={widthFeet} onChange={(e) => setWidthFeet(e.target.value)} />
//       </div>
//       <div>
//         <label>X Coordinate:</label>
//         <input type="number" value={xCoordinate} onChange={(e) => setXCoordinate(e.target.value)} />
//       </div>
//       <div>
//         <label>Y Coordinate:</label>
//         <input type="number" value={yCoordinate} onChange={(e) => setYCoordinate(e.target.value)} />
//       </div>
//       <div>
//         <label>Tilt:</label>
//         <input type="number" value={tilt} onChange={(e) => setTilt(e.target.value)} />
//       </div>

//       <button onClick={handleCanvasClick}>Place Object</button>

//       <canvas id="orgCanvas" width="848" height="480"></canvas>

//       <div>
//         {resultImage && (
//           <div>
//             <h2>Result Image:</h2>
//             <img src={resultImage} alt="Result" />
//             <h2>Status Message:</h2>
//             <p>{statusMessage}</p>
//             <h2>Placeable:</h2>
//             <p>{placeable}</p>
//             <h2>Object Dimensions:</h2>
//             <p>Height: {heightFeet} feet</p>
//             <p>Width: {widthFeet} feet</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PlacementComponent;
import React, { useState } from 'react';

const PlacementComponent = () => {
  const [bgImage, setBgImage] = useState(null);
  const [orgImage, setOrgImage] = useState(null);
  const [heightFeet, setHeightFeet] = useState(0);
  const [widthFeet, setWidthFeet] = useState(0);
  const [xCoordinate, setXCoordinate] = useState(0);
  const [yCoordinate, setYCoordinate] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [placeable, setPlaceable] = useState('');
  const [resultImage, setResultImage] = useState('');
  const resolution = 10;
  const lowerPurple = [128, 128, 128];  // Adjusted lower limit of HSV values for purple
  const upperPurple = [255, 255, 255];  // Adjusted upper limit of HSV values for purple
  
  const feetToMeters = (feet) => {
    return feet * 0.3048; // 1 foot is approximately 0.3048 meters
  };
  const kMeans = (pixels, k) => {
    const clusters = Array.from({ length: k }, () => []);
  
    // Initialize centroids randomly
    const centroids = Array.from({ length: k }, () => [
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
    ]);
  
    // Assign each pixel to the nearest centroid
    for (const pixel of pixels) {
      let minDistance = Number.MAX_SAFE_INTEGER;
      let assignedCluster = 0;
  
      for (let i = 0; i < k; i++) {
        const distance = colorDistance(pixel, centroids[i]);
        if (distance < minDistance) {
          minDistance = distance;
          assignedCluster = i;
        }
      }
  
      clusters[assignedCluster].push(pixel);
    }
  
    // Update centroids based on the assigned pixels
    for (let i = 0; i < k; i++) {
      if (clusters[i].length > 0) {
        centroids[i] = calculateMean(clusters[i]);
      }
    }
  
    return centroids;
  };
  const colorDistance = (color1, color2) => {
    const [r1, g1, b1] = color1;
    const [r2, g2, b2] = Array.isArray(color2) && color2.length === 3 ? color2 : [0, 0, 0];;
  
    const dr = r2 - r1;
    const dg = g2 - g1;
    const db = b2 - b1;
  
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };
  
  const calculateMean = (pixels) => {
    const sum = pixels.reduce((acc, pixel) => {
      const [r, g, b] = pixel;
      return [acc[0] + r, acc[1] + g, acc[2] + b];
    }, [0, 0, 0]);
  
    const mean = pixels.length > 0 ? [sum[0] / pixels.length, sum[1] / pixels.length, sum[2] / pixels.length] : [0, 0, 0];
  
    return mean;
  };

const isPurple = (centroid) => {
    // Adjust these thresholds based on the characteristics of your images
    const redThreshold = 150;
    const greenThreshold = 50;
    const blueThreshold = 50;
  
    return centroid[0] > redThreshold && centroid[1] > greenThreshold && centroid[2] > blueThreshold;
  };
  

  const feetToPixels = (feet) => {
    const meters = feetToMeters(feet);
    return meters * resolution;
  };




const calculatePurpleArea = (image, objectHeight, objectWidth, objectX, objectY) => {
    const canvas = document.createElement('canvas');
    canvas.width = 848;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
  
    // Draw the background image
    ctx.drawImage(image, 0, 0, 848, 480);
  
    const imageData = ctx.getImageData(0, 0, 848, 480);
    const pixels = [];
  
    // Collect all pixels within the object boundaries
    for (let i = 0; i < imageData.data.length; i += 4) {
      const pixelX = (i / 4) % 848;
      const pixelY = Math.floor((i / 4) / 848);
  
      if (
        pixelX >= objectX - objectWidth / 2 &&
        pixelX <= objectX + objectWidth / 2 &&
        pixelY >= objectY - objectHeight / 2 &&
        pixelY <= objectY + objectHeight / 2
      ) {
        pixels.push([imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]]);
      }
    }
  
    // Use k-means clustering with k=2 to separate pixels into two clusters
    const centroids = kMeans(pixels, 2);
  
    // Check if the cluster representing purple is dominant
    const purpleCentroid = centroids.find((centroid) => isPurple(centroid));
    const dominantClusterSize = pixels.filter((pixel) => colorDistance(pixel, purpleCentroid) < 5).length;

  
    console.log("purpleArea", dominantClusterSize);
    return dominantClusterSize;
  };


  const rgbToHsv = (r, g, b) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h, s, v;
  
    v = max / 255;
  
    if (max === 0) {
      s = 0;
    } else {
      s = d / max;
    }
  
    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
  
      h /= 6;
    }
  
    return [h * 360, s * 100, v * 100];
  };

  const drawRectangleOnImage = (ctx, objectX, objectY, objectWidth, objectHeight) => {
    // Draw the rectangle
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.translate(objectX, objectY);
    ctx.rotate((tilt * Math.PI) / 180);
    ctx.fillRect(-objectWidth / 2, -objectHeight / 2, objectWidth, objectHeight);
    ctx.rotate((-tilt * Math.PI) / 180);
    ctx.translate(-objectX, -objectY);
  };

  const handleCanvasClick = () => {
    const canvas = document.getElementById('orgCanvas');
    const ctx = canvas.getContext('2d');

    // Draw the original image
    const orgImg = new Image();
    orgImg.src = URL.createObjectURL(orgImage);
    orgImg.onload = () => {
        // Resize the original image to (848, 480)
        ctx.drawImage(orgImg, 0, 0, 848, 480);
      
        // Calculate areas
        const purpleArea = calculatePurpleArea(orgImg, feetToPixels(heightFeet), feetToPixels(widthFeet), xCoordinate, yCoordinate);
      
        // Decide whether to place the object
        const objectAreaPixels = feetToPixels(heightFeet) * feetToPixels(widthFeet);
        console.log("",objectAreaPixels)
        if (purpleArea >= objectAreaPixels) {
          // Draw the rectangle on the image
          drawRectangleOnImage(ctx, xCoordinate, yCoordinate, feetToPixels(widthFeet), feetToPixels(heightFeet));
      
          // Set the result data
          setStatusMessage('Placement successful');
          setPlaceable('Object is placeable');
        } else {
          // Do not place the object
          setStatusMessage('Object cannot be placed due to insufficient purple area');
          setPlaceable('False');
        }
      };
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={(e) => setBgImage(e.target.files[0])} />
      <input type="file" accept="image/*" onChange={(e) => setOrgImage(e.target.files[0])} />

      <div>
        <label>Height (feet):</label>
        <input type="number" value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} />
      </div>
      <div>
        <label>Width (feet):</label>
        <input type="number" value={widthFeet} onChange={(e) => setWidthFeet(e.target.value)} />
      </div>
      <div>
        <label>X Coordinate:</label>
        <input type="number" value={xCoordinate} onChange={(e) => setXCoordinate(e.target.value)} />
      </div>
      <div>
        <label>Y Coordinate:</label>
        <input type="number" value={yCoordinate} onChange={(e) => setYCoordinate(e.target.value)} />
      </div>
      <div>
        <label>Tilt:</label>
        <input type="number" value={tilt} onChange={(e) => setTilt(e.target.value)} />
      </div>

      <button onClick={handleCanvasClick}>Place Object</button>

      <canvas id="orgCanvas" width="848" height="480"></canvas>

      <div>
        {resultImage && (
          <div>
            <h2>Result Image:</h2>
            <img src={resultImage} alt="Result" />
            <h2>Status Message:</h2>
            <p>{statusMessage}</p>
            <h2>Placeable:</h2>
            <p>{placeable}</p>
            <h2>Object Dimensions:</h2>
            <p>Height: {heightFeet} feet</p>
            <p>Width: {widthFeet} feet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementComponent;
//   const calculatePurpleArea = (image, objectHeight, objectWidth, objectX, objectY) => {
//     const canvas = document.createElement('canvas');
//     canvas.width = 848;
//     canvas.height = 480;
//     const ctx = canvas.getContext('2d');
  
//     // Draw the background image
//     ctx.drawImage(image, 0, 0, 848, 480);
  
//     const imageData = ctx.getImageData(0, 0, 848, 480);
//     const pixels = imageData.data;
//     console.log('pixels',pixels)
//     let purpleArea = 0;
  
//     for (let i = 0; i < pixels.length; i += 4) {
//       const pixelX = (i / 4) % 848;
//       const pixelY = Math.floor((i / 4) / 848);
  
//       // Check if the pixel is within the object boundaries
//       if (
//         pixelX >= objectX - objectWidth / 2 &&
//         pixelX <= objectX + objectWidth / 2 &&
//         pixelY >= objectY - objectHeight / 2 &&
//         pixelY <= objectY + objectHeight / 2
//       ) {
//         // Check if the pixel is purple based on intensity
//         if (isPurple([pixels[i], pixels[i + 1], pixels[i + 2]])) {
//           purpleArea++;
//         }
//       }
//     }
  
//     console.log("purpleArea", purpleArea);
//     return purpleArea;
//   };


// const calculatePurpleArea = (image, objectHeight, objectWidth, objectX, objectY) => {
//     const canvas = document.createElement('canvas');
//     canvas.width = 848;
//     canvas.height = 480;
//     const ctx = canvas.getContext('2d');

//     // Draw the background image
//     ctx.drawImage(image, 0, 0, 848, 480);

//     const imageData = ctx.getImageData(0, 0, 848, 480);
//     const pixels = imageData.data;
//     let purpleArea = 0;

//     for (let i = 0; i < pixels.length; i += 4) {
//       // Extract HSV values from the pixel data
//       const r = pixels[i];
//       const g = pixels[i + 1];
//       const b = pixels[i + 2];
//       const hsv = rgbToHsv(r, g, b);

//       // Check if the pixel is purple
//       if (isPurple(hsv)) {
//         const pixelX = (i / 4) % 848;
//         const pixelY = Math.floor((i / 4) / 848);

//         // Check if the pixel is within the object boundaries
//         if (
//           pixelX >= objectX - objectWidth / 2 &&
//           pixelX <= objectX + objectWidth / 2 &&
//           pixelY >= objectY - objectHeight / 2 &&
//           pixelY <= objectY + objectHeight / 2
//         ) {
//           purpleArea++;
//         }
//       }
//     }
//     console.log("purpleArea",purpleArea)
//     return purpleArea;
//   };
  //   const isPurple = (pixel) => {
//     // Assuming purple pixels have a higher intensity than black pixels
//     const intensityThreshold = 80; // Adjust this threshold as needed
  
//     // Extract intensity (brightness) from the pixel data
//     const intensity = (pixel[0] + pixel[1] + pixel[2]) / 3;
//     // console.log('intensity',intensity )
//     // console.log('intensityThreshold',intensityThreshold )
  
//     return intensity > intensityThreshold;
//   };
// const isPurple = (hsv) => {
//     const [h, s, v] = hsv;
//     const [lowerH, lowerS, lowerV] = lowerPurple;
//     const [upperH, upperS, upperV] = upperPurple;
  
//     return (
//       h >= lowerH && h <= upperH &&
//       s >= lowerS && s <= upperS &&
//       v >= lowerV && v <= upperV
//     );
//   };