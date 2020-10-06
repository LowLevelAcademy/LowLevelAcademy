import React from "react";

import SinglePageLesson from "../../components/SinglePageLesson";
import BinariesAndHexadecimalsContent from "../../components/prerequisites/BinaryAndHexadecimal.mdx";

const Content: React.FC = () => {
  return (
    <SinglePageLesson
      module="Prerequisites"
      badges={["Beginner"]}
      pageTitle="Number Encoding"
      sponsors={[
        ["Embark", "https://github.com/embark-studios"],
        "Private sponsor",
      ]}
    >
      <BinariesAndHexadecimalsContent />
    </SinglePageLesson>
  );
};

export default Content;
