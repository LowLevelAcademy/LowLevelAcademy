import React from "react";

import Content from "../../components/blog/ExplorableProgramming.mdx";

export default function Blog() {
  return (
    <div className="row no-gutters">
      <div className="blogpost col-10 offset-1 col-lg-8 col-xl-7">
        <div className="blogpost-header text-xl-center">
          <h1>Explorable Programming with Rust and WebAssembly</h1>
          <div className="author-date">
            <strong>Nikita Baksalyar</strong>,{" "}
            <time dateTime="2020-10-12">October 13</time>
          </div>
          <div className="picture-wrapper">
            <img src="/blog/images/illustration_1.png" alt="Article picture" />
          </div>
        </div>
        <article>
          <Content />
          <p>
            If you would like to follow our updates, you can follow us on&nbsp;
            <a href="https://twitter.com/LowLevelAcademy">Twitter</a>
            &nbsp;or subscribe to our email list:
          </p>
        </article>
        <div>
          <form
            className="form-inline pt-0 pt-sm-2 validate"
            action="https://lowlvl.us19.list-manage.com/subscribe/post?u=d5e40a67284928fe806d08836&amp;id=a7f416a4c2"
            method="post"
            id="mc-embedded-subscribe-form"
            name="mc-embedded-subscribe-form"
            target="_blank"
            noValidate
          >
            <div className="form-group mb-0 mt-3 mr-2 mr-xl-3">
              <input
                type="email"
                className="form-control mr-3"
                id="subscribers_email"
                placeholder="example@example.org"
                name="EMAIL"
              />
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
              <button
                type="submit"
                name="subscribe"
                className="btn btn-green mt-3 mt-sm-0"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
        <p>Thanks for reading!</p>
      </div>
    </div>
  );
}
