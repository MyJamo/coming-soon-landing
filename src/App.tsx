import { Suspense, lazy } from 'react';
import Landing from './landings/sky-jamo/Page';

// The app-UI kit's specimen (#/kit) is for checking the kit against the live app, so only `npm run dev` has it.
const Kit = import.meta.env.DEV ? lazy(() => import('./shared/app-ui/Kit').then((m) => ({ default: m.Kit }))) : null;

export function App() {
  if (Kit && location.hash === '#/kit') return <Suspense fallback={null}><Kit /></Suspense>;
  return <Landing />;
}
