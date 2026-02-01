// pages/_app.js
import "../styles/globals.css";
import Layout from "../components/Layout";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function App({ Component, pageProps }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>

      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </>
  );
}
