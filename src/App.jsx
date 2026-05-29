import React, { useState, useEffect, Suspense } from "react";
import Preloader from "./components/Pre";
import Navbar from "./components/Navbar";
import About from "./components/About/About";
import Projects from "./components/Projects/Projects";
import Certifications from "./components/Certifications/Certifications";
import Footer from "./components/Footer";
import Resume from "./components/Resume/ResumeNew";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import "./style.css";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminApp = React.lazy(() => import("./components/Admin/AdminApp"));
const Portfolio = React.lazy(() => import("./components/Portfolio/Portfolio"));

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isPortfolioRoute = location.pathname === "/";

  return (
    <div className="App" id={isAdminRoute ? undefined : "scroll"}>
      {!isAdminRoute && !isPortfolioRoute ? <Navbar /> : null}
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<Preloader load={true} />}>
              <Portfolio />
            </Suspense>
          }
        />
        <Route path="/project" element={<Projects />} />
        <Route path="/certifications" element={<Certifications />} />
        <Route path="/about" element={<About />} />
        <Route path="/resume" element={<Resume />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<Preloader load={true} />}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {!isAdminRoute && !isPortfolioRoute ? <Footer /> : null}
    </div>
  );
}

function App() {
  const [load, upadateLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      upadateLoad(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Preloader load={load} />
      <AppLayout />
    </Router>
  );
}

export default App;
