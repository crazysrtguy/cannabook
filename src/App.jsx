import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Bible } from "./pages/Bible";
import { Landing } from "./pages/Landing";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/bible" element={<Bible />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
