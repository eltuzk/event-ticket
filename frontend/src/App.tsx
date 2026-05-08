import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="flex h-screen items-center justify-center text-3xl font-bold">Home Page</div>} />
        {/* Add more routes here */}
        <Route path="*" element={<div className="flex h-screen items-center justify-center text-xl">404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
