// pages/_app.js
import "../styles/globals.css";
import Layout from "../components/Layout";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>

      <GoogleAnalytics gaId="G-7EYNZ1NEKX" />
    </>
  );
}
