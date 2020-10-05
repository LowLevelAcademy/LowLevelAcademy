import React, { PropsWithChildren } from "react";
import { NextSeo } from "next-seo";

import Fundraising from "./Fundraising";
import LessonHeader from "./LessonHeader";
import NoScriptBar from "./NoScriptBar";
import Page from "./Page";

export interface LessonProps {
  // Module that this lesson belongs to
  module: string;
  // Title of the single page.
  pageTitle: string;
  // Badges ('Beginner', 'Rust', etc.).
  badges?: Array<string>;
  // Sponsors for this lesson.
  sponsors?: Array<string | Array<any>>;
}

const SinglePageLesson: React.FunctionComponent<PropsWithChildren<
  LessonProps
>> = (props: PropsWithChildren<LessonProps>) => {
  return (
    <>
      <NextSeo title={props.pageTitle + " - Low-Level Academy"} />
      <LessonHeader
        module={props.module}
        title={props.pageTitle}
        badges={props.badges}
      />
      <NoScriptBar />
      <Page title={props.pageTitle} isCurrent={true}>
        {props.children}
      </Page>
      <Fundraising sponsors={props.sponsors} />
    </>
  );
};

export default SinglePageLesson;
