import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="row no-gutters">
      <div className="col-10 offset-1 col-lg-9 col-xl-7 lesson-text">
        <h1 style={{ marginBottom: "75px" }}>Privacy Policy</h1>
        <p>
          At Low-Level Academy, we don't collect any personalised data about
          you. We don't use cookies to track you. The only data we collect and
          analyse is the server logs, which store IP addresses of visitors for
          one week. We use this data only to understand how people use our
          product and what content they prefer. This helps us to make our
          courses better.
        </p>
        <p>
          That's all! If you have any questions, you can always{" "}
          <a href="mailto:nikita.baksalyar@gmail.com">contact us by email</a>.
        </p>
        <div style={{ height: "400px" }} />
      </div>
    </div>
  );
}
