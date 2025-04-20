import classNames from "classnames";
import { ChangeEvent, MouseEvent, useEffect, useState } from "react";
import { Link, LoaderFunctionArgs, useLoaderData } from "react-router";

import { useSetterFlagLoading } from "@/context/context_flag_loading";
import { ModelLayer } from "@/models/layer";
import { getLayer, updateLayer } from "@/repositories/layers";
import { sleep } from "@/utils";

type UrlParam = {
  identifier: string;
};

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
    packages: [],
    isArchitectureSplit: false,
    updatedAt: "",
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

  function changeModalPackage(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const index = Number(e.target.dataset.index);

    const data: Partial<ModelLayer> = {
      packages: modalLayer.packages.map((v, i) => {
        if (i == index) {
          return value;
        } else {
          return v;
        }
      }),
    };
    setModalLayer({ ...modalLayer, ...data });
  }

  function clickModalAddPackage() {
    const data: Partial<ModelLayer> = {
      packages: ([] as string[]).concat(modalLayer.packages, [""]),
    };
    setModalLayer({ ...modalLayer, ...data });
  }

  function changeModalNote(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const data: Partial<ModelLayer> = {
      note: value ? value : undefined,
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
          <button className="button" onClick={clickUpdateRaw}>
            Update
          </button>
        </p>
        <table className="table is-fullwidth">
          <tbody>
            <tr>
              <th>identifier</th>
              <td>{layer.identifier}</td>
            </tr>
            <tr>
              <th>state</th>
              <td>{layer.stateLayer}</td>
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
          </tbody>
        </table>
      </>
    );

  const modalPackages = modalLayer.packages.map((pk, i) => (
    <div key={i} className="field has-addons">
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
          onChange={changeModalPackage}
        />
      </div>
    </div>
  ));

  return (
    <>
      <div className={classNames("modal", { "is-active": isShowModalUpdate })}>
        <div
          className="modal-background"
          onClick={() => setIsShowModalUpdate(false)}
        />
        <div className="modal-card">
          <header className="modal-card-head is-primary">
            <p className="modal-card-title">Update</p>
          </header>
          <section className="modal-card-body">
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
              <label className="label">packages</label>
            </div>
            {modalPackages}
            <div className="field">
              <div className="control">
                <button
                  className="button is-link"
                  onClick={clickModalAddPackage}
                >
                  Add Package
                </button>
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
