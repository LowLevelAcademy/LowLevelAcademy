import React from "react";
import { DefaultSeo } from "next-seo";

import Layout from "../components/Layout";

import "../styles/styles.scss";
import "../styles/playground.scss";

export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <DefaultSeo
        openGraph={{
          type: "website",
          locale: "en_US",
          url: "https://lowlvl.org",
          title: "Low-Level Academy",
          description:
            "Learn systems programming by creating small projects from the first principles with visual and intuitive explanations.",
          site_name: "Low-Level Academy",
          images: [
            {
              url: "https://lowlvl.org/images/og_logo.jpg",
              width: 600,
              height: 600,
              alt: "Low-Level Academy",
            },
          ],
        }}
        twitter={{
          handle: "@LowLevelAcademy",
          site: "@LowLevelAcademy",
          cardType: "summary",
        }}
      />
      <Component {...pageProps} />
    </Layout>
  );
}
