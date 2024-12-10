import React from 'react';
import {ChakraProvider} from '@chakra-ui/react'
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './pages/Home'
import Fetching from './pages/Fetching';
import TablePage from './pages/TablePage'
import './App.css';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/fetch" element={<Fetching/>}/>
          <Route path="/table" element={<TablePage/>}/>

        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
