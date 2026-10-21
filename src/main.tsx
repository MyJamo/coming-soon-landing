import { createRoot } from 'react-dom/client';
import { ComingSoon } from './ComingSoon';
import { startAnalytics } from './analytics';
import './styles.css';

startAnalytics();
createRoot(document.getElementById('root')!).render(<ComingSoon />);
