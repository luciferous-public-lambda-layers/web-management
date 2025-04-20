import { useEffect, useState } from "react";
import { Link } from "react-router";

import { useSetterFlagLoading } from "@/context/context_flag_loading";
import { ModelLayer } from "@/models/layer";
import { getAllLayers } from "@/repositories/layers";
import { sleep } from "@/utils";

export function PList() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [layers, setLayers] = useState<ModelLayer[]>([]);
  const setFlagLoading = useSetterFlagLoading();

  async function loadLayers() {
    setFlagLoading(true);
    const allLayers = await getAllLayers();
    if (import.meta.env.MODE === "development") {
      await sleep(1);
    }
    setLayers(allLayers);
    setFlagLoading(false);
  }

  async function initialize() {
    setFlagLoading(true);
    await loadLayers();
    setIsInitialized(true);
  }

  useEffect(() => {
    if (isInitialized) {
      return;
    }
    initialize();
  }, [isInitialized, layers]);

  const rows = layers.map((item) => {
    const packages = item.packages.map((pk) => (
      <li key={`${item.identifier}/${pk}`}>{pk}</li>
    ));
    return (
      <tr key={item.identifier}>
        <td>
          <Link to={`/layer/${item.identifier}`}>{item.identifier}</Link>
        </td>
        <td>{item.stateLayer}</td>
        <td className="content">
          <ul>{packages}</ul>
        </td>
        <td>{item.isArchitectureSplit ? "true" : "false"}</td>
        <td>{item.updatedAt}</td>
        <td>{item.note}</td>
      </tr>
    );
  });

  return (
    <>
      <p>
        <button className="button is-link" onClick={() => loadLayers()}>
          reload
        </button>
      </p>
      <div className="pt-3">
        <table className="table is-fullwidth">
          <thead>
            <tr>
              <th>identifier</th>
              <th>state</th>
              <th>packages</th>
              <th>isArchitectureSplit</th>
              <th>updatedAt</th>
              <th>note</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    </>
  );
}
