// Represents a single lesson in the module list.

import React, { PropsWithChildren } from "react";
import Link from "next/link";

export interface LessonTileProps {
  // Optional link to the lesson page.
  // If null, the lesson is not available yet.
  href?: string;

  // Title of the lesson.
  title: string;

  // Icon for the lesson.
  icon: string;
}

type ComponentProps = PropsWithChildren<LessonTileProps>;

const LessonTile: React.FunctionComponent<ComponentProps> = (
  props: ComponentProps
) => {
  const isAvailable = !!props.href;
  let lessonTile = (
    <div className={"module_tile" + (!isAvailable ? " inactive_module" : "")}>
      <div className="row no-gutters">
        <div className="col-3">
          <img
            className="lesson_icon"
            src={"/images/icons/" + props.icon}
            alt={props.title + " icon"}
          />
        </div>
        <div className="col-9">
          <h3>{props.title}</h3>
          <p>{props.children}</p>
        </div>
      </div>
    </div>
  );
  if (props.href) {
    lessonTile = (
      <Link href={props.href}>
        <a className="undecorated">{lessonTile}</a>
      </Link>
    );
  }
  return <div className="col-12 col-md-6 col-xl-4">{lessonTile}</div>;
};

export default LessonTile;
