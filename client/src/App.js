import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useRef, useCallback, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/dashboard";
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

  const [focusLimit, setFocusLimit] = useState(20);
  const [isBreak, setIsBreak] = useState(false);
  const [breakSeconds, setBreakSeconds] = useState(10);
  const [distractions, setDistractions] = useState(0);

  const BREAK_LIMIT = 10;

  const [siteCountsAsDistraction, setSiteCountsAsDistractionState] = useState(
    loadSiteSettings
  );

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

  useEffect(() => {
    if (!isBreak || breakSeconds <= 0) return;
    const interval = setInterval(() => setBreakSeconds((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [isBreak, breakSeconds]);

  useEffect(() => {
    if (breakSeconds === 0 && isBreak) {
      setTotalFocusTime((prev) => prev + seconds);
      setFocusLimit(distractions >= 3 ? 15 : distractions === 0 ? 25 : 20);
      setSeconds(0);
      setIsBreak(false);
      setBreakSeconds(BREAK_LIMIT);
      setIsActive(false);
      setDistractions(0);
    }
  }, [breakSeconds, isBreak, seconds, distractions, setTotalFocusTime, setFocusLimit, setSeconds, setIsBreak, setBreakSeconds, setIsActive, setDistractions]);

  useEffect(() => {
    saveAnalytics(analytics);
  }, [analytics]);

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
                focusLimit={focusLimit}
                setFocusLimit={setFocusLimit}
                isBreak={isBreak}
                setIsBreak={setIsBreak}
                breakSeconds={breakSeconds}
                setBreakSeconds={setBreakSeconds}
                distractions={distractions}
                setDistractions={setDistractions}
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
