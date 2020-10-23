import React from "react";
import Head from "next/head";

const Layout: React.FC = ({ children }) => {
  let subscribe_hidden = true;
  let navblock_color = "";

  function handleClick(e) {
    e.preventDefault();
    let navblock = document.getElementById("nav-block");
    let navblock_styles = getComputedStyle(navblock);
    let subsform = document.getElementById("subsform");
    let subsform_bg = document.getElementById("subsform-bg");
    let subsform_bg_ball = subsform_bg.childNodes[0] as HTMLElement;

    if (subscribe_hidden) {
      subsform.style.display = "block";
      subsform_bg.style.display = "block";
      setTimeout(() => {
        subsform_bg.style.opacity = "1.0";
        subsform_bg_ball.style.opacity = "1.0";
        subsform_bg_ball.style.width = "500px";
        subsform_bg_ball.style.height = "500px";
        navblock.style.color = "white";
      }, 100);
      setTimeout(() => {
        subsform.style.opacity = "1.0";
      }, 300);
    } else {
      setTimeout(() => {
        subsform.style.opacity = "0.0";
        subsform_bg_ball.style.width = "0px";
        subsform_bg_ball.style.height = "0px";
        navblock.style.color = navblock_color;
      }, 100);
      setTimeout(() => {
        subsform_bg_ball.style.opacity = "0.0";
        subsform_bg.style.opacity = "0.0";
        subsform.style.display = "none";
        subsform_bg.style.display = "none";
      }, 300);
    }

    subscribe_hidden = !subscribe_hidden;
  }

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
      </Head>
      <div>
        <div className="container-fluid no-padding" id="content-container">
          <div id="headbar" className="row no-gutters no-select">
            <div id="logo-block" className="col-3 col-md-6 offset-1">
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
            <div id="nav-block" className="col-7 col-md-4 text-right">
              <ul>
                <li>
                  <a href="/blog">Blog</a>
                </li>
                <li id="header-btn-subscribe" onClick={handleClick}>
                  <div id="subsform-bg">
                    <div></div>
                  </div>
                  <div id="subsform">
                    <form
                      className="form-inline pt-0 pb-0 pt-sm-2 validate"
                      action="https://lowlvl.us19.list-manage.com/subscribe/post?u=d5e40a67284928fe806d08836&amp;id=a7f416a4c2"
                      method="post"
                      id="mc-embedded-subscribe-form"
                      name="mc-embedded-subscribe-form"
                      target="_blank"
                      noValidate
                    >
                      <div
                        style={{ position: "absolute", left: "-5000px" }}
                        aria-hidden="true"
                      >
                        <input
                          type="text"
                          name="b_d5e40a67284928fe806d08836_a7f416a4c2"
                          tabIndex={-1}
                          value=""
                        />
                      </div>
                      <div className="form-group mb-0 mt-2 mt-sm-3 mr-2 mr-xl-3">
                        <input
                          type="email"
                          className="form-control mr-3"
                          id="subscribers_email"
                          name="EMAIL"
                          placeholder="example@example.org"
                          onClick={(ev) => ev.stopPropagation()}
                        />
                        <button
                          type="submit"
                          name="subscribe"
                          className="btn btn-green"
                          onClick={(ev) => ev.stopPropagation()}
                        >
                          OK
                        </button>
                      </div>
                    </form>
                  </div>
                  Subscribe
                </li>
              </ul>
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
                        src="/images/icons/email-round_white.svg"
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
                    <a href="/privacy">Privacy&nbsp;Policy</a>
                  </li>
                  <li>
                    <a href="/about">About</a>
                  </li>
                  <li>
                    <a href="/blog">Blog</a>
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
