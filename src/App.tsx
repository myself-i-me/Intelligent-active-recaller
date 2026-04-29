import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { Layout } from './components/Layout';
import { Home } from './routes/Home';
import { Quiz } from './routes/Quiz';
import { Results } from './routes/Results';
import { Review } from './routes/Review';
import { Analytics } from './routes/Analytics';
import { sampleBank } from './data/sampleBank';

export function App() {
  return (
    <AppProvider initialBank={sampleBank}>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/results" element={<Results />} />
            <Route path="/review" element={<Review />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
