// src/App.js
import React from 'react';

import ImageEditor from './components/ImageEditor';
import ImageProcessing from './components/ImageProcessing';
import Placement from './components/Placement';
import L from './components/logic';
// import ImageForm from './components/ImageForm';



//combined code


function App() {
  return (
    <div
      style={{
        // backgroundImage: 'linear-gradient(to bottom right, #CB5EEE, #4BE1EC)',
        backgroundImage: 'linear-gradient(to bottom right, #2F80ED, #B2FFDA)',
        minHeight: '100vh', // Ensure the gradient covers the entire viewport height
        padding: '20px', // Add padding for better visibility
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ color: 'white' }}>Rentuhbin Dumpster Placement</h1>
      <button style={{
   padding: '20px', // Adjust the font size as needed
  }}>
      <a href="http://0.0.0.0:8080/" class="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-primary before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"><span class="relative text-base font-semibold text-white">Rentuhbin Backend</span></a>
      {/* <a href="http://localhost:8080/" class="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-primary/10 before:bg-gradient-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 dark:before:border-gray-700 dark:before:bg-gray-800 sm:w-max"><span class="relative text-base font-semibold text-primary dark:text-white">Learn more</span></a> */}
      </button>

      <ImageEditor />
    </div>
  );
}

export default App;



//SAM

// function App() {
//     return (
//       <div
//         style={{
//         // backgroundImage: 'linear-gradient(to bottom right, #CB5EEE, #4BE1EC)',
//         backgroundImage: 'linear-gradient(to bottom right, #2F80ED, #B2FFDA)',
//         minHeight: '100vh', // Ensure the gradient covers the entire viewport height
//         padding: '20px', // Add padding for better visibility
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//       }}
//     >
//       <h2 style={{ color: 'white' }}>Segmentation</h2>
//       <button style={{
//    padding: '20px', // Adjust the font size as needed
//   }}>
//       <a href="http://localhost:8080/" class="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-primary before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"><span class="relative text-base font-semibold text-white">Rentuhbin Backend</span></a>
//      </button>
        
//         {/* <Placement /> */}
//         <ImageProcessing/>
//       </div>
//     );
//   }
  
//   export default App;




//Dumpster placement rectangle


//   function App() {
//     return (
//       <div
//         style={{
//         // backgroundImage: 'linear-gradient(to bottom right, #CB5EEE, #4BE1EC)',
//         backgroundImage: 'linear-gradient(to bottom right, #2F80ED, #B2FFDA)',
//         minHeight: '100vh', // Ensure the gradient covers the entire viewport height
//         padding: '20px', // Add padding for better visibility
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//       }}
//     >
//       <h2 style={{ color: 'white' }}>Dumpster Placement</h2>
//       <button style={{
//    padding: '20px', // Adjust the font size as needed
//   }}>
//       <a href="http://localhost:8080/" class="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-primary before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"><span class="relative text-base font-semibold text-white">Rentuhbin Backend</span></a>
//      </button>
        
//          <Placement /> 
//       </div>
//     );
//   }
  
//   export default App;



// App.js


// const App = () => {
//   return (
//     <div>
//       <h1>Your React App</h1>
//       <L />
//     </div>
//   );
// };

// export default App;
