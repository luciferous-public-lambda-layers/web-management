import classNames from "classnames";
import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useState,
} from "react";
import { Link, LoaderFunctionArgs, useLoaderData } from "react-router";

import { useSetterFlagLoading } from "@/context/context_flag_loading";
import { LambdaRuntime, ModelLayer, allLambdaRuntimes } from "@/models/layer";
import { deleteLayer, getLayer, updateLayer } from "@/repositories/layers";
import { sleep } from "@/utils";

type UrlParam = {
  identifier: string;
};

const ID_MODAL_SELECT_IGNORE_VERSIONS = "modalSelectIgnoreVersions";
const ID_MODAL_INPUT_A_PACKAGE = "modalInputAPackage";

export async function clientLoaderPLayer(
  data: LoaderFunctionArgs,
): Promise<UrlParam> {
  const param = data.params as UrlParam;
  return {
    identifier: param.identifier,
  };
}

export function PLayer() {
  const { identifier } = useLoaderData<UrlParam>();
  const setFlagLoading = useSetterFlagLoading();

  const [isInitialized, setIsInitialized] = useState(false);
  const [layer, setLayer] = useState<ModelLayer | undefined>(undefined);
  const [modalLayer, setModalLayer] = useState<ModelLayer>({
    identifier: "tmp",
    stateLayer: "QUEUED",
    stateGenerate: "QUEUED",
    packages: [],
    isArchitectureSplit: false,
    updatedAt: "",
    ignoreVersions: null,
    note: null,
    actionsPublishUrl: null,
    actionsGenerateUrl: null,
  });
  const [isShowModalUpdate, setIsShowModalUpdate] = useState(false);

  async function loadLayer() {
    setFlagLoading(true);
    const currentLayer = await getLayer(identifier);
    setLayer(currentLayer);
    if (import.meta.env.MODE === "development") {
      await sleep(1);
    }
    setFlagLoading(false);
    return currentLayer;
  }

  async function initialize() {
    setFlagLoading(true);
    await loadLayer();
    setIsInitialized(true);
  }

  async function clickUpdateRaw() {
    const currentLayer = await loadLayer();
    if (currentLayer == null) {
      return;
    }
    if (
      currentLayer.stateLayer !== "PUBLISHED" &&
      currentLayer.stateLayer !== "FAILED"
    ) {
      alert("その状態では更新できません");
      return;
    }
    setModalLayer({ ...currentLayer });
    setIsShowModalUpdate(true);
  }

  async function clickDelete() {
    const resp = confirm("このレイヤーを削除しますか?");
    if (!resp) {
      return;
    }
    setFlagLoading(true);
    await deleteLayer({ identifier });
    await loadLayer();
  }

  function changeModalIsArchitecture(e: ChangeEvent<HTMLInputElement>) {
    const text = e.target.dataset.value;
    const data: Partial<ModelLayer> = {
      isArchitectureSplit: text === "true",
    };
    setModalLayer({ ...modalLayer, ...data });
  }

  function clickModalDeletePackage(e: MouseEvent<HTMLButtonElement>) {
    const elm = e.target as HTMLButtonElement;
    const index = Number(elm.dataset.index);

    const data: Partial<ModelLayer> = {
      packages: modalLayer.packages.filter((_, i) => i !== index),
    };
    setModalLayer({ ...modalLayer, ...data });
  }

  function clickModalAddAPackage() {
    const elm = document.getElementById(
      ID_MODAL_INPUT_A_PACKAGE,
    ) as HTMLInputElement;
    const value = elm.value;
    if (value == null || value === "") {
      alert("Package名が空です");
      return;
    }
    const data: Partial<ModelLayer> = {
      packages: ([] as string[]).concat(modalLayer.packages, [value]),
    };
    setModalLayer({ ...modalLayer, ...data });
    elm.value = "";
  }

  function keyUpModalAddAPackage(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      clickModalAddAPackage();
    }
  }

  function clickModalDeleteIgnoreVersions(e: MouseEvent<HTMLButtonElement>) {
    const elm = e.target as HTMLButtonElement;
    const index = Number(elm.dataset.index);

    let versions: LambdaRuntime[] | null = (
      modalLayer.ignoreVersions ?? []
    ).filter((_, i) => i !== index);
    if (versions.length === 0) {
      versions = null;
    }

    const data: Partial<ModelLayer> = {
      ignoreVersions: versions,
    };
    setModalLayer({ ...modalLayer, ...data });
  }

  function clickModalAddIgnoreVersion() {
    const elm = document.getElementById(
      ID_MODAL_SELECT_IGNORE_VERSIONS,
    ) as HTMLSelectElement;
    const current = modalLayer.ignoreVersions ?? [];

    const data: Partial<ModelLayer> = {
      ignoreVersions: allLambdaRuntimes.filter(
        (v) => current.includes(v) || v === elm.value,
      ),
    };
    setModalLayer({ ...modalLayer, ...data });
  }

  function changeModalNote(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const data: Partial<ModelLayer> = {
      note: value ? value : null,
    };
    setModalLayer({ ...modalLayer, ...data });
  }

  async function clickModalUpdate() {
    setFlagLoading(true);
    for (const pk of modalLayer.packages) {
      if (!pk) {
        alert("空のパッケージがあります");
        return;
      }
    }
    const nextLayer = await updateLayer({
      identifier: modalLayer.identifier,
      isArchitectureSplit: modalLayer.isArchitectureSplit,
      packages: modalLayer.packages,
      note: modalLayer.note,
      ignoreVersions: modalLayer.ignoreVersions,
    });
    setLayer(nextLayer);
    setIsShowModalUpdate(false);
    setFlagLoading(false);
  }

  useEffect(() => {
    if (isInitialized) {
      return;
    }
    initialize();
  }, [isInitialized, layer]);

  const body =
    layer == null ? (
      <h2>Not Found</h2>
    ) : (
      <>
        <p className="mb-3">
          <button className="button mr-3" onClick={loadLayer}>
            Reload
          </button>
          <button className="button mr-3" onClick={clickUpdateRaw}>
            Update
          </button>
          <button className="button" onClick={clickDelete}>
            Delete
          </button>
        </p>
        <table className="table is-fullwidth">
          <tbody>
            <tr>
              <th>identifier</th>
              <td>{layer.identifier}</td>
            </tr>
            <tr>
              <th>stateLayer</th>
              <td>{layer.stateLayer}</td>
            </tr>
            <tr>
              <th>stateGenerate</th>
              <td>{layer.stateGenerate}</td>
            </tr>
            <tr>
              <th>packages</th>
              <td className="content">
                <ul>
                  {layer.packages.map((pk) => (
                    <li key={pk}>{pk}</li>
                  ))}
                </ul>
              </td>
            </tr>
            <tr>
              <th>isArchitectureSplit</th>
              <td>{layer.isArchitectureSplit ? "true" : "false"}</td>
            </tr>
            <tr>
              <th>ignoreVersions</th>
              <td className="content">
                <ul>
                  {(layer.ignoreVersions ?? []).map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </td>
            </tr>
            <tr>
              <th>updatedAt</th>
              <td>{layer.updatedAt}</td>
            </tr>
            <tr>
              <th>note</th>
              <td>{layer.note}</td>
            </tr>
            <tr>
              <th>actionsPublishUrl</th>
              <td>
                <a
                  href={layer.actionsPublishUrl ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {layer.actionsPublishUrl}
                </a>
              </td>
            </tr>
            <tr>
              <th>actionsGenerateUrl</th>
              <td>
                <a
                  href={layer.actionsGenerateUrl ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {layer.actionsGenerateUrl}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </>
    );

  const modalPackages = modalLayer.packages.map((pk, i) => (
    <div key={`${i}_${pk}`} className="field has-addons">
      <div className="control">
        <button
          className="button is-link"
          data-index={i}
          onClick={clickModalDeletePackage}
        >
          X
        </button>
      </div>
      <div className="control is-expanded">
        <input
          type="text"
          className="input"
          value={pk}
          data-index={i}
          disabled
        />
      </div>
    </div>
  ));
  const modalIgnoreVersions = (modalLayer.ignoreVersions ?? []).map(
    (runtime, i) => (
      <div key={`${i}_${runtime}`} className="field has-addons">
        <div className="control">
          <button
            className="button is-link"
            data-index={i}
            onClick={clickModalDeleteIgnoreVersions}
          >
            X
          </button>
        </div>
        <div className="control is-expanded">
          <input type="text" className="input" value={runtime} disabled />
        </div>
      </div>
    ),
  );

  const modalOptionsIgnoreVersions = allLambdaRuntimes
    .filter((v) => !(modalLayer.ignoreVersions ?? []).includes(v))
    .map((v) => (
      <option key={`options-${v}`} value={v}>
        {v}
      </option>
    ));

  return (
    <>
      <div className={classNames("modal", { "is-active": isShowModalUpdate })}>
        <div className="modal-background" />
        <div className="modal-card">
          <header className="modal-card-head is-primary">
            <p className="modal-card-title">Update</p>
          </header>
          <section className="modal-card-body">
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
            <div className="field">
              <label className="label">
                isArchitectureSplit (current:{" "}
                {layer?.isArchitectureSplit ? "true" : "false"})
              </label>
              <div className="control">
                <label className="radio mr-3">
                  <input
                    type="radio"
                    className="mr-1"
                    name="isArchitectureSplit"
                    checked={modalLayer.isArchitectureSplit}
                    data-value="true"
                    onChange={changeModalIsArchitecture}
                  />
                  true
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    className="mr-1"
                    name="isArchitectureSplit"
                    checked={!modalLayer.isArchitectureSplit}
                    data-value="false"
                    onChange={changeModalIsArchitecture}
                  />
                  false
                </label>
              </div>
            </div>
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
                  <select id={ID_MODAL_SELECT_IGNORE_VERSIONS}>
                    {modalOptionsIgnoreVersions}
                  </select>
                </div>
              </div>
            </div>
            <div className="field">
              <label className="label">note</label>
              <div className="control">
                <input
                  type="text"
                  className="input"
                  value={modalLayer.note ? modalLayer.note : ""}
                  onChange={changeModalNote}
                />
              </div>
            </div>
          </section>
          <footer className="modal-card-foot">
            <a
              className="card-footer-item"
              onClick={() => setIsShowModalUpdate(false)}
            >
              Cancel
            </a>
            <a className="card-footer-item" onClick={clickModalUpdate}>
              Update
            </a>
          </footer>
        </div>
      </div>
      <nav className="breadcrumb">
        <ul>
          <li>
            <Link className="is-size-5" to="/list">
              List
            </Link>
          </li>
          <li className="is-active is-size-5">
            <a>{identifier}</a>
          </li>
        </ul>
      </nav>
      <hr />
      {body}
    </>
  );
}
