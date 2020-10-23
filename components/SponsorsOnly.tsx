import React, { PropsWithChildren } from "react";
import styles from "./SponsorsOnly.module.scss";

export interface SponsorsOnlyProps {
  // Days until public availability
  days: number;
  // Video preview
  videoPreview: string;
}

const SponsorsOnly: React.FC<SponsorsOnlyProps> = (props) => {
  return (
    <>
      <div className="row no-gutters">
        <div className="col-10 offset-1 col-xl-8 lesson-text">
          <p>
            At this moment, this lesson is restricted to our sponsors only ($12
            tier or higher). Your support helps us to make better lessons.
          </p>
          <a href="/authenticate">
            <button
              className={[styles.btn_github_signin, "btn btn-grey"].join(" ")}
            >
              Sign in with GitHub
            </button>
          </a>
          <iframe
            className={styles.btn_github_sponsor}
            src="https://github.com/sponsors/nbaksalyar/button"
            title="Sponsor nbaksalyar"
            style={{ border: 0 }}
            width={116}
            height={35}
          />
          <hr />
          <p>This lesson will become publicly available in</p>
          <div className="row no-gutters mb-2 mt-5 mb-md-5">
            <div
              className={[styles.days_counter, "col-12 col-md-6 col-xl-5"].join(
                " "
              )}
            >
              <h1>
                {props.days +
                  (props.days > 1 || props.days == 0 ? " days" : " day")}
              </h1>
            </div>
            <div
              className={[styles.subscribe, "col-12 col-md-6 col-xl-5"].join(
                " "
              )}
            >
              <p className="mt-4 ml-4 ml-xl-5 mb-0">Subscribe to updates:</p>
              <form
                className="form-inline pt-0 pt-sm-2 ml-4 ml-xl-5 validate"
                action="https://lowlvl.us19.list-manage.com/subscribe/post?u=d5e40a67284928fe806d08836&amp;id=a7f416a4c2"
                method="post"
                id="mc-embedded-subscribe-form"
                name="mc-embedded-subscribe-form"
                target="_blank"
                noValidate
              >
                <div className="form-group mb-0 mt-3 mr-2 mr-xl-3">
                  <label htmlFor="subscribers_email" className="sr-only">
                    Your email
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="EMAIL"
                    id="subscribers_email"
                    placeholder="example@example.org"
                  />
                </div>
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
                  className="btn btn-green mt-3"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <video
            className={styles.lesson_trailer}
            //poster="../poster.jpg"
            loop
            src={props.videoPreview}
            width={640}
            height={360}
            autoPlay
          >
            Your browser doesn't support HTML5 video tag!
          </video>
          <div style={{ height: "50px" }} />
        </div>
      </div>
    </>
  );
};

export default SponsorsOnly;
