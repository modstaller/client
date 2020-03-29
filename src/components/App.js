import React, { useEffect, useState } from 'react';

export default function App() {
  const [version, setVersion] = useState();
  useEffect(() => {
    fetch('https://launchermeta.mojang.com/mc/game/version_manifest.json')
      .then((r) => r.json())
      .then((j) => {
        setVersion(j.latest.release);
      });
  }, []);
  return <div>{version && `Latest version of minecraft is ${version}`}</div>;
}
