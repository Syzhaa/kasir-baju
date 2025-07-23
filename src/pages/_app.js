import { AppWrapper } from '../context/AppContext';
import Layout from '../components/Layout';
import AuthGuard from '../components/AuthGuard';
import '../styles/globals.css';

const noLayoutPages = ['/login'];

function MyApp({ Component, pageProps, router }) {
  const useMainLayout = !noLayoutPages.includes(router.pathname);

  return (
    <AppWrapper>
      <AuthGuard>
        {useMainLayout ? (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        ) : (
          <Component {...pageProps} />
        )}
      </AuthGuard>
    </AppWrapper>
  );
}
export default MyApp;