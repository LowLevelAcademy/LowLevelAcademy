import React from "react";

const Fundraising: React.FunctionComponent = () => {
  return (
    <div id="footer-fundraise" className="row no-gutters">
      <div className="col-12 text-center">
        <p>
          Please{" "}
          <a href="https://github.com/sponsors/nbaksalyar">become a sponsor</a>{" "}
          to support us and get early access to new courses, additional learning
          materials, and more!
        </p>
        <p>
          <iframe
            src="https://github.com/sponsors/nbaksalyar/button"
            title="Sponsor nbaksalyar"
            style={{ border: 0 }}
            width={116}
            height={35}
          />
        </p>
      </div>
    </div>
  );
};

export default Fundraising;
