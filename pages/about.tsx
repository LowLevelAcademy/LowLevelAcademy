import React, { PropsWithChildren } from "react";

const OSS_PROJECTS_LIST = [
  "facebook/react",
  "rust-lang/rust",
  "vercel/next.js",
  "jaames/zfont",
  "metafizzy/zdog",
  "integer32llc/rust-playground",
  "mdx-js/mdx",
  "microsoft/TypeScript",
  "ajaxorg/ace",
  "WebAssembly/wabt",
  "reduxjs/redux",
  "sass/sass",
  "smoltcp-rs/smoltcp",
  "PrismJS/prism",
  "feross/buffer",
  "mui-org/material-ui",
  "kmck/react-hex-editor",
  "SergioBenitez/Rocket",
  "docker/docker-ce",
];

const API_URL = "https://api.github.com/graphql";

async function fetchAPI(query, { variables } = { variables: {} }) {
  const headers = { "Content-Type": "application/json" };

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await res.json();
  if (json.errors) {
    console.error(json.errors);
    throw new Error("Failed to fetch API");
  }
  return json.data;
}

async function fetchOssProject(name: string, owner: string) {
  const data = await fetchAPI(
    `
    query FetchProjectDescription($name:String!, $owner:String!) {
        repository(name: $name, owner: $owner) {
          name
          description
          stargazerCount
          openGraphImageUrl
          url
        }
    }
    `,
    {
      variables: { name, owner },
    }
  );
  return data.repository;
}

export async function getStaticProps(context) {
  const ossProjectsList = await Promise.all(
    OSS_PROJECTS_LIST.map((project_name) => {
      const [owner, repo] = project_name.split("/");
      return fetchOssProject(repo, owner);
    })
  );

  ossProjectsList.sort((a, b) => a.stargazerCount - b.stargazerCount);

  return {
    props: { ossProjectsList },
  };
}

interface OssProjectProps {
  url: string;
  icon: string;
  title: string;
}

const OssProject = (props: PropsWithChildren<OssProjectProps>) => {
  return (
    <div className="col-12 col-md-6 col-lg-4 col-xl-4">
      <div className="row">
        <div className="col-3 text-center">
          <a href={props.url}>
            <img src={props.icon} />
          </a>
        </div>
        <div className="col-9 about-description">
          <h3>
            <a href={props.url}>{props.title}</a>
          </h3>
          <p>{props.children}</p>
        </div>
      </div>
    </div>
  );
};

export default function About(props) {
  return (
    <>
      <div>
        <div id="team" className="row no-gutters mb-5">
          <div className="col-10 offset-1 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3">
            <p className="about_introduction text-center">
              <strong>Low-Level Academy</strong> is an interactive course where
              you can learn systems programming by creating small projects from
              the first principles with visual and intuitive explanations.
            </p>
          </div>
          <div className="col-10 offset-1">
            <div className="about-header text-center">
              <h1>Our team</h1>
            </div>
            <div className="row no-gutters justify-content-center">
              <div className="col-12 col-md-6 col-xl-4 px-4">
                <div className="row text-center">
                  <img src="/images/team/nikita.jpg" />
                  <ul className="teammember-social">
                    <a href="https://twitter.com/nbaksalyar">
                      <li
                        className="team-social-icon tsi-twitter"
                        title="Twitter"
                      ></li>
                    </a>
                    <a href="https://github.com/nbaksalyar">
                      <li
                        className="team-social-icon tsi-github"
                        title="Github"
                      ></li>
                    </a>
                  </ul>
                  <h3>Nikita Baksalyar</h3>
                  <p>Code, visualization, courses.</p>
                </div>
              </div>

              <div className="col-12 col-md-6 col-xl-4 px-4">
                <div className="row text-center">
                  <img src="/images/team/andrey.jpg" />
                  <ul className="teammember-social">
                    <a href="https://www.instagram.com/baksalyar/">
                      <li
                        className="team-social-icon tsi-instagram"
                        title="Instagram"
                      ></li>
                    </a>
                    <a href="https://twitter.com/bakslr">
                      <li
                        className="team-social-icon tsi-twitter"
                        title="Twitter"
                      ></li>
                    </a>
                    <a href="https://github.com/Baksalyar">
                      <li
                        className="team-social-icon tsi-github"
                        title="Github"
                      ></li>
                    </a>
                  </ul>
                  <h3>Andrey Baksalyar</h3>
                  <p>Design, visualization, user experience.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-10 offset-1">
            <div className="about-header text-center">
              <h2>Thanks</h2>
            </div>
            <div className="row no-gutters text-center justify-content-center">
              <div className="col-12 col-lg-6 col-xl-4 about-description">
                <h3>
                  <a href="https://jackwherry.com/">Jack Wherry</a>
                </h3>
                <p>Technical editing and proofreading.</p>
              </div>
              <div className="col-12 col-lg-6 col-xl-4 about-description">
                <h3>
                  <a href="https://uxwing.com/">Uxwing</a>
                </h3>
                <p>Free icons and illustrations.</p>
              </div>
            </div>
          </div>
        </div>
        <div id="opensource" className="row no-gutters">
          <div className="col-10 offset-1 col-xl-8 offset-xl-2">
            <div className="about-header text-center">
              <h2>Standing on the Shoulders of Giants</h2>
              <p>
                Low-Level Academy would not be possible without the open source
                projects that we depend on.
              </p>
            </div>
            <div className="row justify-content-center">
              {props.ossProjectsList.map((project) => {
                return (
                  <OssProject
                    key={project.name}
                    icon={project.openGraphImageUrl}
                    title={project.name}
                    url={project.url}
                  >
                    {project.description}
                  </OssProject>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
