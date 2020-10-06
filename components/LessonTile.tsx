// Represents a single lesson in the module list.

import React from "react";

export interface LessonTileProps {
  // Optional link to the lesson page.
  // If null, the lesson is not available yet.
  href?: string;

  // Title of the lesson.
  title: string;

  // Icon for the lesson.
  icon: string;
}

const LessonTile: React.FC<LessonTileProps> = (props) => {
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
      <a href={props.href} className="undecorated">
        {lessonTile}
      </a>
    );
  }
  return <div className="col-12 col-md-6 col-xl-4">{lessonTile}</div>;
};

export default LessonTile;
