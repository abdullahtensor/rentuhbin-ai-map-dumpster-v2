// src/ApiService.js
import axios from 'axios';

const API_BASE_URL = 'http://0.0.0.0:8080/api/v1/combined'; // Change this to your FastAPI server address
// const API_BASE_URL ="hhst3vuvqt.loclx.io";
// const API_BASE_URL ="http://umtbkm9icn.loclx.io";

const ApiService = {
    processImage: async (file, parameters) => {
      const formData = new FormData();
      formData.append('org_image', file);
      formData.append('height_in_feet', parameters.height_in_feet);
      formData.append('width_in_feet', parameters.width_in_feet);
      formData.append('x_coordinate', parameters.x_coordinate);
      formData.append('y_coordinate', parameters.y_coordinate);
      formData.append('tilt', parameters.tilt);
  
      try {
        const response = await axios.post(`${API_BASE_URL}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'arraybuffer',
        });
  
        console.log('Response Status:', response.status); // Log the status code
        console.log('Response Headers:', response.headers); // Log the headers
  
        const imageBlob = new Blob([response.data], { type: 'image/png' });
        return URL.createObjectURL(imageBlob);
      } catch (error) {
        console.error('Error processing image:', error.response); // Log the full error response
  
        // Create a new error object with additional details
        const enhancedError = new Error('Image processing error');
        enhancedError.response = error.response;
  
        throw enhancedError; // Re-throw the error to handle it in the component
      }
    },
  };
  
  export default ApiService;




// const ApiService = {
//     processImage: async (file, parameters) => {
//       const formData = new FormData();
//       formData.append('org_image', file);
//       formData.append('height_in_feet', parameters.height_in_feet);
//       formData.append('width_in_feet', parameters.width_in_feet);
//       formData.append('x_coordinate', parameters.x_coordinate);
//       formData.append('y_coordinate', parameters.y_coordinate);
//       formData.append('tilt', parameters.tilt);
  
//       try {
//         const response = await axios.post(`${API_BASE_URL}`, formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//           responseType: 'arraybuffer',
//         });
  
//         console.log('Response Status:', response.status); // Log the status code
//         console.log('Response Headers:', response.headers); // Log the headers
  
//         // Log the response.data to understand its structure
//         console.log('Response Data:', response.data);
  
//         // Assuming response.data is an object with status_message and placeable properties
//         const responseData = response.data;
//         return responseData;
//       } catch (error) {
//         console.error('Error processing image:', error.response); // Log the full error response
  
//         // Create a new error object with additional details
//         const enhancedError = new Error('Image processing error');
//         enhancedError.response = error.response;
  
//         throw enhancedError; // Re-throw the error to handle it in the component
//       }
//     },
//   };
//   export default ApiService;
  
