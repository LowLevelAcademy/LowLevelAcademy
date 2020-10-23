import React from "react";

type SponsorDescription = string | Array<any>;

interface FundraisingProps {
  sponsors?: Array<SponsorDescription>;
}

const Fundraising: React.FC<FundraisingProps> = (props) => {
  const sponsors = props.sponsors ? (
    <p>
      We would like to thank our sponsors that made this lesson possible:&nbsp;
      {props.sponsors
        .map<React.ReactNode>((sponsor) =>
          Array.isArray(sponsor) ? (
            <a key={sponsor[0]} href={sponsor[1]}>
              {sponsor[0]}
            </a>
          ) : (
            sponsor
          )
        )
        .reduce((prev, elem) => [prev, ", ", elem])}
    </p>
  ) : null;

  return (
    <div id="footer-fundraise" className="row no-gutters">
      <div className="col-10 offset-1 col-xl-8 text-center">
        {sponsors}
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
