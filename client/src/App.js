import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useRef, useCallback, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Session from "./pages/Session";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { loadSiteSettings, saveSiteSettings } from "./lib/distractionSites";
import { loadAnalytics, saveAnalytics } from "./lib/analyticsStorage";

function DocumentTitle() {
  const location = useLocation();
  useEffect(() => {
    const titles = { "/": "Dashboard", "/session": "Session", "/settings": "Settings" };
    const segment = titles[location.pathname];
    document.title = segment ? `${segment} — StandByte` : "Page not found — StandByte";
  }, [location.pathname]);
  return null;
}

function App() {
  const [analytics, setAnalyticsState] = useState(loadAnalytics);
  const { totalFocusTime, totalDistractions } = analytics;

  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const startTimeRef = useRef(null);

  const [siteCountsAsDistraction, setSiteCountsAsDistractionState] = useState(
    loadSiteSettings
  );

  useEffect(() => {
    saveAnalytics(analytics);
  }, [analytics]);

  const setTotalFocusTime = useCallback((updater) => {
    setAnalyticsState((prev) => ({
      ...prev,
      totalFocusTime: typeof updater === "function" ? updater(prev.totalFocusTime) : updater,
    }));
  }, []);

  const setTotalDistractions = useCallback((updater) => {
    setAnalyticsState((prev) => ({
      ...prev,
      totalDistractions: typeof updater === "function" ? updater(prev.totalDistractions) : updater,
    }));
  }, []);

  const setSiteCountsAsDistraction = useCallback((next) => {
    setSiteCountsAsDistractionState((prev) => {
      const nextState = typeof next === "function" ? next(prev) : next;
      saveSiteSettings(nextState);
      return nextState;
    });
  }, []);

  return (
    <Router>
      <DocumentTitle />
      <Navbar />
      <main className="app-page container py-4 d-flex flex-column">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                totalFocusTime={totalFocusTime}
                totalDistractions={totalDistractions}
              />
            }
          />
          <Route
            path="/session"
            element={
              <Session
                seconds={seconds}
                setSeconds={setSeconds}
                isActive={isActive}
                setIsActive={setIsActive}
                startTimeRef={startTimeRef}
                setTotalFocusTime={setTotalFocusTime}
                setTotalDistractions={setTotalDistractions}
                siteCountsAsDistraction={siteCountsAsDistraction}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <Settings
                siteCountsAsDistraction={siteCountsAsDistraction}
                setSiteCountsAsDistraction={setSiteCountsAsDistraction}
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </main>
    </Router>
  );
}

export default App;
