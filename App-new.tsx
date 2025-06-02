/**
 * React Native App with Native Theme Module
 * @format
 */

import React from 'react';
import {ThemeProvider} from './src/context/ThemeContext';
import HomeScreen from './src/screens/HomeScreen';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HomeScreen />
    </ThemeProvider>
  );
};

export default App;
