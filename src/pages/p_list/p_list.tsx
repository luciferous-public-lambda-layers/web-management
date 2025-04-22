import classNames from "classnames";
import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router";

import { useSetterFlagLoading } from "@/context/context_flag_loading";
import { LambdaRuntime, ModelLayer, allLambdaRuntimes } from "@/models/layer";
import { getAllLayers, insertLayer } from "@/repositories/layers";
import { generateCurrentDatetime, sleep } from "@/utils";

const ID_MODAL_INPUT_A_PACKAGE = "modalInputAPackage";
const ID_MODAL_SELECT_RUNTIME = "modalSelectRuntime";

export function PList() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [layers, setLayers] = useState<ModelLayer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalLayer, setModalLayer] = useState<Partial<ModelLayer>>({
    isArchitectureSplit: false,
  });
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

  function clickAddLayer() {
    setModalLayer({
      isArchitectureSplit: false,
    });
    setShowModal(true);
  }

  async function initialize() {
    setFlagLoading(true);
    await loadLayers();
    setIsInitialized(true);
  }

  function changeModalIdentifier(e: ChangeEvent<HTMLInputElement>) {
    const data: Partial<ModelLayer> = {
      identifier: e.target.value,
    };

    setModalLayer({ ...modalLayer, ...data });
  }

  function clickDeleteAPackage(e: MouseEvent<HTMLButtonElement>) {
    const elm = e.target as HTMLButtonElement;
    const index = Number(elm.dataset.index);

    const data: Partial<ModelLayer> = {
      packages: (modalLayer.packages ?? []).filter((_, i) => i !== index),
    };
    setModalLayer({ ...modalLayer, ...data });
  }

  function keyUpModalAddAPackage(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      clickModalAddAPackage();
    }
  }

  function clickModalAddAPackage() {
    const elm = document.getElementById(
      ID_MODAL_INPUT_A_PACKAGE,
    ) as HTMLInputElement;

    if (!elm.value) {
      alert("Package名が空です");
      return;
    }

    const data: Partial<ModelLayer> = {
      packages: ([] as string[]).concat(modalLayer.packages ?? [], [elm.value]),
    };
    setModalLayer({ ...modalLayer, ...data });
    elm.value = "";
  }

  function changeModalIsArchitectureSplit(e: ChangeEvent<HTMLInputElement>) {
    const text = e.target.dataset.value;

    const data: Partial<ModelLayer> = {
      isArchitectureSplit: text === "true",
    };
    setModalLayer({ ...modalLayer, ...data });
  }

  function clickModalDeleteIgnoreVersion(e: MouseEvent<HTMLButtonElement>) {
    const elm = e.target as HTMLButtonElement;
    const index = Number(elm.dataset.index);

    let required: LambdaRuntime[] | null = (
      modalLayer.ignoreVersions ?? []
    ).filter((_, i) => i !== index);
    if (required.length === 0) {
      required = null;
    }

    const data: Partial<ModelLayer> = {
      ignoreVersions: required,
    };
    setModalLayer({ ...modalLayer, ...data });
  }

  function clickModalAddIgnoreVersion() {
    const elm = document.getElementById(
      ID_MODAL_SELECT_RUNTIME,
    ) as HTMLSelectElement;

    const data: Partial<ModelLayer> = {
      ignoreVersions: allLambdaRuntimes.filter(
        (v) => (modalLayer.ignoreVersions ?? []).includes(v) || v === elm.value,
      ),
    };
    setModalLayer({ ...modalLayer, ...data });
    elm.value = "";
  }

  function changeModalNote(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    const data: Partial<ModelLayer> = {
      note: value ? value : null,
    };
    setModalLayer({ ...modalLayer, ...data });
  }

  async function clickModalAddLayer() {
    if (!modalLayer.identifier) {
      alert("`identifier`が空です");
      return;
    }

    if (modalLayer.isArchitectureSplit == null) {
      alert("`isArchitectureSplit`が空です");
      return;
    }

    if (modalLayer.packages == null || modalLayer.packages.length === 0) {
      alert("`packages`が空です");
      return;
    }

    for (const pk of modalLayer.packages) {
      if (!pk) {
        alert("packageに空の要素があります");
        return;
      }
    }

    const layer: ModelLayer = {
      identifier: modalLayer.identifier,
      isArchitectureSplit: modalLayer.isArchitectureSplit,
      packages: modalLayer.packages,
      ignoreVersions:
        modalLayer.ignoreVersions == null ? null : modalLayer.ignoreVersions,
      note: modalLayer.note == null ? null : modalLayer.note,
      stateLayer: "QUEUED",
      updatedAt: generateCurrentDatetime(),
      githubActionsUrl: null,
    };

    try {
      setShowModal(false);
      setFlagLoading(true);
      await insertLayer({ layer });
    } catch (e) {
      alert(e);
      setFlagLoading(false);
      setShowModal(true);
      return;
    }
    await initialize();
    setShowModal(false);
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

  const modalPackages = (modalLayer.packages ?? []).map((pk, i) => (
    <div key={`packages-${i}-${pk}`} className="field has-addons">
      <div className="control">
        <button
          className="button is-link"
          data-index={i}
          onClick={clickDeleteAPackage}
        >
          X
        </button>
      </div>
      <div className="control is-expanded">
        <input type="text" className="input" value={pk} disabled />
      </div>
    </div>
  ));

  const modalIgnoreVersions = (modalLayer.ignoreVersions ?? []).map((v, i) => (
    <div className="field has-addons" key={`ignoreVersions-${i}-${v}`}>
      <div className="control">
        <button
          className="button is-link"
          data-index={i}
          onClick={clickModalDeleteIgnoreVersion}
        >
          X
        </button>
      </div>
      <div className="control is-expanded">
        <input type="text" className="input" value={v} disabled />
      </div>
    </div>
  ));

  const modalOptionRuntimes = allLambdaRuntimes
    .filter((v) => !(modalLayer.ignoreVersions ?? []).includes(v))
    .map((v, i) => (
      <option key={`runtimes-${i}-${v}`} value={v}>
        {v}
      </option>
    ));

  return (
    <>
      <div className={classNames("modal", { "is-active": showModal })}>
        <div className="modal-background" />
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Add Layer</p>
          </header>
          <section className="modal-card-body">
            {/* identifier */}
            <div className="field">
              <label className="label">identifier</label>
              <div className="control">
                <input
                  type="text"
                  className="input"
                  value={modalLayer.identifier ?? ""}
                  onChange={changeModalIdentifier}
                />
              </div>
            </div>
            {/* packages */}
            <div className="field">
              <label className="label">packages</label>
            </div>
            {modalPackages}
            <div className="field has-addons">
              <div className="control is-expanded">
                <input
                  type="text"
                  className="input"
                  id={ID_MODAL_INPUT_A_PACKAGE}
                  onKeyUp={keyUpModalAddAPackage}
                />
              </div>
              <div className="control">
                <button
                  className="button is-link"
                  onClick={clickModalAddAPackage}
                >
                  Add
                </button>
              </div>
            </div>
            {/* isArchitectureSplit */}
            <div className="field">
              <label className="label">isArchitectureSplit</label>
              <div className="control">
                <label className="radio mr-4">
                  <input
                    type="radio"
                    className="mr-2"
                    name="isArchitectureSplit"
                    checked={modalLayer.isArchitectureSplit}
                    data-value="true"
                    onChange={changeModalIsArchitectureSplit}
                  />
                  true
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    className="mr-2"
                    name="isArchitectureSplit"
                    data-value="false"
                    checked={!modalLayer.isArchitectureSplit}
                    onChange={changeModalIsArchitectureSplit}
                  />
                  false
                </label>
              </div>
            </div>
            {/* ignoreVersions */}
            <div className="field">
              <label className="label">ignoreVersions</label>
            </div>
            {modalIgnoreVersions}
            <div className="field has-addons">
              <div className="control">
                <button
                  className="button is-link"
                  onClick={clickModalAddIgnoreVersion}
                >
                  add
                </button>
              </div>
              <div className="control">
                <div className="select">
                  <select id={ID_MODAL_SELECT_RUNTIME}>
                    {modalOptionRuntimes}
                  </select>
                </div>
              </div>
            </div>
            {/* note */}
            <div className="field">
              <label className="label">note</label>
              <div className="control">
                <input
                  type="text"
                  className="input"
                  value={modalLayer.note ?? ""}
                  onChange={changeModalNote}
                />
              </div>
            </div>
            <hr />
            <pre>{JSON.stringify(modalLayer, null, 4)}</pre>
          </section>
          <footer className="modal-card-foot">
            <a className="card-footer-item" onClick={() => setShowModal(false)}>
              Cancel
            </a>
            <a className="card-footer-item" onClick={clickModalAddLayer}>
              Add
            </a>
          </footer>
        </div>
      </div>
      <p>
        <button className="button is-link mr-3" onClick={() => loadLayers()}>
          reload
        </button>
        <button className="button is-link" onClick={clickAddLayer}>
          add
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
