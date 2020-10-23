import React from "react";

export default function Blog() {
  return (
    <div className="row no-gutters">
      <div className="col-10 offset-1 col-lg-8 col-xl-7">
        <div className="row">
          <div className="blog-tile col-12 col-md-6">
            <a href="/blog/explorable-programming" className="undecorated">
              <img src="/blog/images/illustration_1.png" />
              <span>Oct 13</span>
              <h4>Explorable programming with Rust and WebAssembly</h4>
            </a>
          </div>
        </div>
        <div style={{ height: "400px" }} />
      </div>
    </div>
  );
}
