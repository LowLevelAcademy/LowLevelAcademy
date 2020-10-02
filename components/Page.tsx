import React, { PropsWithChildren } from "react";

export interface PageProps {
  // Title of the page
  title: string;
  // Is this page currently visible?
  isCurrent?: boolean;
}

const Page: React.FunctionComponent<PropsWithChildren<PageProps>> = (
  props: PropsWithChildren<PageProps>
) => {
  return (
    <div
      className={`row no-gutters lesson_text lesson_page ${
        props.isCurrent ? "" : "d-none"
      }`}
    >
      <div className="col-10 offset-1">{props.children}</div>
    </div>
  );
};

export default Page;
