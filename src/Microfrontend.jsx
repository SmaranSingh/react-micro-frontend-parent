import React, { useEffect } from "react";

const MicroFrontend = ({ name, host, document, window, history }) => {
  useEffect(() => {
    const scriptId = `micro-frontend-script-${name}`;

    if (document.getElementById(scriptId)) {
      renderMicroFrontend();
      return;
    }

    fetch(`${host}/asset-manifest.json`)
      .then(res => res.json())
      .then(manifest => {
        const promises = Object.keys(manifest["files"])
          .filter(key => key.endsWith(".js"))
          .reduce((sum, key) => {
            sum.push(
              new Promise(resolve => {
                const path = `${host}${manifest["files"][key]}`;
                const script = document.createElement("script");
                if (key === "main.js") {
                  script.id = scriptId;
                }
                script.onload = () => {
                  resolve();
                };
                script.src = path;
                document.head.appendChild(script);
              })
            );
            return sum;
          }, []);
        Promise.allSettled(promises).then(() => {
          renderMicroFrontend();
        });
      });
    return () => {
      window[`unmount${name}`] && window[`unmount${name}`](`${name}-container`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderMicroFrontend = () => {
    window[`render${name}`] && window[`render${name}`](`${name}-container`, history);
  };

  return <main id={`${name}-container`} />;
};

MicroFrontend.defaultProps = {
  document,
  window,
};

export default MicroFrontend;
