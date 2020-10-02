import React from "react";
import Head from "next/head";
import Link from "next/link";

const Layout: React.FunctionComponent = ({ children }) => {
  return (
    <>
      <Head>
        <title>Low-Level Academy</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link rel="icon" href="/images/logo.svg" />
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
          integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Dosis:wght@500&amp;display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans&amp;display=swap"
          rel="stylesheet"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          href="https://lowlvl.org/updates.xml"
        />

        <meta property="og:title" content="Low-Level Academy" />
        <meta
          property="og:description"
          content="Learn systems programming by creating small projects from the first principles with visual and intuitive explanations."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://lowlvl.org" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image" content="/images/og_logo.jpg" />
        <meta property="og:image:width" content="600" />
        <meta property="og:image:height" content="600" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image" content="/images/og_logo.jpg" />
        <meta name="twitter:site" content="@LowLevelAcademy" />
        <meta name="twitter:creator" content="@LowLevelAcademy" />
        <meta
          name="twitter:title"
          content="Low-Level Academy - explorable systems programming"
        />
        <meta
          name="twitter:description"
          content="Learn systems programming by creating small projects from the first principles with visual and intuitive explanations."
        />
      </Head>
      <div>
        <div className="container-fluid no-padding" id="content-container">
          <div id="headbar" className="row no-gutters no-select">
            <div id="logo-block" className="col-6 offset-1">
              <a href="/">
                <img
                  id="sign"
                  src="/images/animation_1.svg"
                  alt="Low-Level Academy"
                />
                <h1 id="lla" className="d-none d-md-inline-block">
                  Low-Level Academy
                </h1>
              </a>
            </div>
          </div>
          {children}
        </div>
        <div className="container-fluid no-padding" id="footer-container">
          <div className="container-fluid no-padding">
            <div id="footer-block" className="row no-gutters">
              <div className="col-10 offset-1 col-lg-3">
                <ul className="contacts_and_social">
                  <li>
                    <a href="mailto:nikita.baksalyar@gmail.com">
                      <img
                        className="emailicon"
                        src="/images/icons/email-mail-sent_white.svg"
                        alt="Email icon"
                      />
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/LowLevelAcademy">
                      <img
                        src="/images/icons/github_white.svg"
                        alt="Github icon"
                      />
                    </a>
                  </li>
                  <li>
                    <a href="https://twitter.com/LowLevelAcademy">
                      <img
                        src="/images/icons/twitter-round_white.svg"
                        alt="Twitter icon"
                      />
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-10 text-left offset-1 offset-lg-0 text-lg-right col-lg-7">
                <ul className="footer_links">
                  <li>
                    <Link href="/privacy" prefetch={false}>
                      <a>Privacy&nbsp;Policy</a>
                    </Link>
                  </li>
                </ul>
                <span>
                  ©&nbsp;2020&nbsp;Low-Level&nbsp;Academy
                  <a
                    rel="license"
                    href="http://creativecommons.org/licenses/by-nc-sa/4.0/"
                  >
                    <img
                      alt="Creative Commons Licence"
                      style={{ borderWidth: 0 }}
                      src="https://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png"
                    />
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
