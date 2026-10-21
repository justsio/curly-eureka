import '@/lib/i18n';
import '@/styles/globals.css';
import { ContestProvider } from '@/context/ContestContext';
import Header from '@/components/Header';

export default function App({ Component, pageProps }) {
  return (
    <ContestProvider>
      <div className="min-h-screen">
        <Header />
        <Component {...pageProps} />
      </div>
    </ContestProvider>
  );
}
