import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import RedirectToAppStore from './components/RedirectToAppStore';

const App = () => {
  return (
    <MantineProvider>
      <Router>
        <Routes>
          {/* Handle root path and ref parameter */}
          <Route path="/" element={<RedirectToAppStore />} />
          
          {/* Catch all paths and handle ref parameter */}
          <Route path="*" element={<RedirectToAppStore />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
};

export default App;
