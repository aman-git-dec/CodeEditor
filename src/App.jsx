import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import EditorPage from "./pages/EditorPage";
import "./App.css";
import "./index.css";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <div>
      <div>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor/:roomId" element={<EditorPage />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
