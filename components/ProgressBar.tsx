import React from "react";

export interface ProgressBarProps {
  onSwitchPage?: CallableFunction;
  currentPage: number;
}

export interface ProgressPageProps {
  page: number;
  active?: boolean;
  completed?: boolean;
  preActive?: boolean;
  onClick?: CallableFunction;
}

export const ProgressPage: React.FC<ProgressPageProps> = (props) => {
  const classes = [];
  props.active && classes.push("is_active");
  props.completed && classes.push("is_complete");
  props.preActive && classes.push("is_pre_active");

  return (
    <li
      className={classes.join(" ")}
      data-step={props.page}
      onClick={(ev) => props.onClick(ev)}
    >
      {props.children}
    </li>
  );
};

export const ProgressBar: React.FC<ProgressBarProps> = (props) => {
  const onClick = (elem) => {
    // Switch page
    const pageNum = elem.target.attributes["data-step"].value;
    props.onSwitchPage(pageNum);
  };

  return (
    <ol className="lesson_progress">
      {React.Children.map(props.children, (child) => {
        if (React.isValidElement(child)) {
          const completed = child.props.page < props.currentPage;
          const active = props.currentPage == child.props.page;
          const preActive = props.currentPage - 1 == child.props.page;
          return React.cloneElement(child, {
            onClick,
            active,
            completed,
            preActive,
          });
        }
        return child;
      })}
    </ol>
  );
};

export default ProgressBar;
