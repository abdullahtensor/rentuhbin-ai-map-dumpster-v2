import axios from 'axios';

const API_BASE_URL = 'http://0.0.0.0:8080/api/v1/placement';

const ApiService = {
  drawRectangle: async (bgImage, orgImage, height, width, x, y, tilt) => {
    try {
      const formData = new FormData();
      formData.append('bg_image_path', bgImage);
      formData.append('org_path', orgImage);
      formData.append('height_in_feet', height);
      formData.append('width_in_feet', width);
      formData.append('x_coordinate', x);
      formData.append('y_coordinate', y);
      formData.append('tilt', tilt);

      const response = await axios.post(`${API_BASE_URL}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'json',  // Assuming the response is JSON
      });

      console.log('Response Status:', response.status); // Log the status code
      console.log('Response Data:', response.data); // Log the response data

      return response.data; // Return the response data to be handled in the component
    } catch (error) {
      console.error('Error drawing rectangle:', error);
      throw error; // Re-throw the error to handle it in the component
    }
  },
};

export default ApiService;
