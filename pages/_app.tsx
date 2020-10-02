import React from "react";

import Layout from "../components/Layout";

import "../styles/styles.scss";
import "../styles/playground.scss";

export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
