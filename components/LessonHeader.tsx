import React from "react";

export interface LessonHeaderProps {
  // Badges for the lesson (e.g. 'Beginner', 'Rust', etc.)
  badges?: Array<string>;
  // Name of the module that this lesson belongs to.
  module: string;
  // Title of the lesson.
  title: string;
}

const LessonHeader: React.FC<LessonHeaderProps> = (props) => {
  return (
    <div id="module_header" className="row no-gutters">
      <div className="col-10 offset-1 col-xl-8">
        <h2>
          <a href="/" className="back-link">
            &lt;
          </a>
          &nbsp;<span className="pre-badge-header">{props.module}</span>
          <div className="badges">
            {props.badges?.map((badge) => (
              <span key={badge} className="module-badge">
                {badge}
              </span>
            ))}
          </div>
        </h2>
        <h1 id="lesson-header">{props.title}</h1>
      </div>
    </div>
  );
};

export default LessonHeader;
