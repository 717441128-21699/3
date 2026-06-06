import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import Home from "@/pages/Home";
import Designer from "@/pages/Designer";
import Chamber from "@/pages/Chamber";
import Result from "@/pages/Result";
import Market from "@/pages/Market";
import Ranking from "@/pages/Ranking";
import Contest from "@/pages/Contest";
import Profile from "@/pages/Profile";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/designer" element={<Designer />} />
            <Route path="/chamber/:id" element={<Chamber />} />
            <Route path="/result/:sessionId" element={<Result />} />
            <Route path="/market" element={<Market />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/contest" element={<Contest />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
