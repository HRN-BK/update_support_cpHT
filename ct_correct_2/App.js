import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { ThemeProvider } from './ThemeContext';
import { QuizProvider } from './QuizContext';

import Header from './Header';
import Home from './Home';
import Quiz from './Quiz';
import Results from './Results';

function App() {
  return (
    <ThemeProvider>
      <QuizProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/results" element={<Results />} />
            </Routes>
          </main>
        </div>
      </QuizProvider>
    </ThemeProvider>
  );
}

export default App; 