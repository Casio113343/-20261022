import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AppProvider } from './state/AppProvider';
import { Layout } from './components/Layout';
import { EmptyState } from './components/ui';
import { HomePage } from './pages/HomePage';
import { ConversationPage } from './pages/ConversationPage';
import { HistoryPage } from './pages/HistoryPage';
import { LibraryPage } from './pages/LibraryPage';
import { QuietPage } from './pages/QuietPage';
import { MoodPage } from './pages/MoodPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="chat" element={<ConversationPage />} />
            <Route path="chat/:id" element={<ConversationPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="saved" element={<LibraryPage saved />} />
            <Route path="quiet" element={<QuietPage />} />
            <Route path="mood" element={<MoodPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route
              path="*"
              element={
                <EmptyState
                  title="这条小路暂时还没有到达。"
                  action={<Link to="/">回到首页</Link>}
                >
                  可以先回到熟悉的地方，重新出发。
                </EmptyState>
              }
            />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
);
