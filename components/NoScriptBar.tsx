// Message that is displayed when a user has disabled JavaScript.

import React from "react";

const NoScriptBar: React.FunctionComponent = () => {
  return (
    <noscript>
      <p>
        Hi there! This lesson is interactive, and it depends on WebAssembly and
        JavaScript being enabled in the browser. While you can still read the
        lesson text, we recommend enabling JS to add explorable &amp;
        interactive elements. Don&apos;t worry, we don&apos;t use any tracking
        cookies and we <a href="/privacy.html">respect your privacy</a>.
      </p>
    </noscript>
  );
};

export default NoScriptBar;
