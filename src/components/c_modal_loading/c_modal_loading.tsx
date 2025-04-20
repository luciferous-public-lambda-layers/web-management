import classNames from "classnames";

import { useValueFlagLoading } from "@/context/context_flag_loading";

export function CModalLoading() {
  const isShow = useValueFlagLoading();
  return (
    <div className={classNames("modal", { "is-active": isShow })}>
      <div className="modal-background" />
      <div className="modal-content">
        <progress className="progress is-link" />
      </div>
    </div>
  );
}
