import Prism from "prismjs";

// FIXME: use something better
const REGEX_PLAYGROUND_ID = /.*?playground-id-(\w+)/;

export function configureRustErrors({ gotoPosition, selectText, addImport }) {
  Prism.languages.rust_errors = {
    warning: {
      pattern: /^warning(\[E\d+\])?:.*$/m,
      inside: {
        "error-explanation": /\[E\d+\]/,
      },
    },
    error: {
      pattern: /^error(\[E\d+\])?:.*$/m,
      inside: {
        "error-explanation": /\[E\d+\]/,
      },
    },
    note: {
      pattern: /^\s*=\s*note:.*$/m,
      inside: {
        "see-issue": /see .*rust-lang\/rust\/issues\/\d+>/,
      },
    },
    "error-location": /-->\s+src\/.*\n/,
    panic: {
      pattern: /^panicked at.*$/,
      inside: {
        "panic-error-location": /src\/.*/,
      },
    },
    "import-suggestion-outer": {
      pattern: /\|\s+use\s+([^;]+);/,
      inside: {
        "import-suggestion": /use\s+.*/,
      },
    },
    "rust-errors-help": {
      pattern: /help:.*\n/,
      inside: {
        "feature-gate": /add `#\!\[feature\(.+?\)\]`/,
      },
    },
    backtrace: {
      pattern: /at src\/.*\n/,
      inside: {
        "backtrace-location": /src\/main.rs:(\d+)/,
      },
    },
    "backtrace-enable": /Run with `RUST_BACKTRACE=1` environment variable to display a backtrace/i,
  };

  Prism.hooks.add("wrap", (env) => {
    if (env.type === "error-explanation") {
      const errorMatch = /E\d+/.exec(env.content);
      const [errorCode] = errorMatch;
      env.tag = "a";
      env.attributes.href = `https://doc.rust-lang.org/stable/error-index.html#${errorCode}`;
      env.attributes.target = "_blank";
    }
    if (env.type === "see-issue") {
      const errorMatch = /\d+/.exec(env.content);
      const [errorCode] = errorMatch;
      env.tag = "a";
      env.attributes.href = `https://github.com/rust-lang/rust/issues/${errorCode}`;
      env.attributes.target = "_blank";
    }
    if (env.type === "error-location" || env.type === "panic-error-location") {
      let line;
      let col;
      const errorMatchFull = /(\d+):(\d+)/.exec(env.content);
      if (errorMatchFull) {
        line = errorMatchFull[1];
        col = errorMatchFull[2];
      } else {
        const errorMatchShort = /:(\d+)/.exec(env.content);
        line = errorMatchShort[1];
        col = "1";
      }
      env.tag = "a";
      env.attributes.href = "#";
      env.attributes["data-line"] = line;
      env.attributes["data-col"] = col;
    }
    if (env.type === "import-suggestion") {
      env.tag = "a";
      env.attributes.href = "#";
      env.attributes["data-suggestion"] = env.content;
    }
    if (env.type === "feature-gate") {
      const [_, featureGate] = /feature\((.*?)\)/.exec(env.content);
      env.tag = "a";
      env.attributes.href = "#";
      env.attributes["data-feature-gate"] = featureGate;
    }
    if (env.type === "backtrace-enable") {
      env.tag = "a";
      env.attributes.href = "#";
      env.attributes["data-backtrace-enable"] = "true";
    }
    if (env.type === "backtrace-location") {
      const errorMatch = /:(\d+)/.exec(env.content);
      const [_, line] = errorMatch;
      env.tag = "a";
      env.attributes.href = "#";
      env.attributes["data-line"] = line;
      env.attributes["data-col"] = "1";
    }
  });

  Prism.hooks.add("after-highlight", (env) => {
    const playgroundId = env.element.className.match(REGEX_PLAYGROUND_ID)[1];

    const links = env.element.querySelectorAll(
      ".error-location, .panic-error-location, .backtrace-location"
    );
    Array.from(links).forEach((link: HTMLAnchorElement) => {
      const { line, col } = link.dataset;
      link.onclick = (e) => {
        e.preventDefault();
        gotoPosition(playgroundId, line, col);
      };
    });

    const importSuggestions = env.element.querySelectorAll(
      ".import-suggestion"
    );
    Array.from(importSuggestions).forEach((link: HTMLAnchorElement) => {
      const { suggestion } = link.dataset;
      link.onclick = (e) => {
        e.preventDefault();
        addImport(suggestion + "\n");
      };
    });
  });
}
