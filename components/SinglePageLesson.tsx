import React, { PropsWithChildren } from "react";
import Fundraising from "./Fundraising";

import LessonHeader from "./LessonHeader";
import NoScriptBar from "./NoScriptBar";
import Page from "./Page";

export interface LessonProps {
  // Unit that this lesson belongs to
  module: string;
  // Title of the single page
  pageTitle: string;
  badges?: Array<string>;
}

const SinglePageLesson: React.FunctionComponent<PropsWithChildren<
  LessonProps
>> = (props: PropsWithChildren<LessonProps>) => {
  return (
    <>
      <LessonHeader
        module={props.module}
        title={props.pageTitle}
        badges={props.badges}
      />
      <NoScriptBar />
      <Page title={props.pageTitle} isCurrent={true}>
        {props.children}
      </Page>
      <Fundraising />
    </>
  );
};

export default SinglePageLesson;
