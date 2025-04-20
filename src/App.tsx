import classNames from "classnames";
import { useState } from "react";
import { Link, Outlet } from "react-router";

import Styles from "@/App.module.css";
import { CModalLoading } from "@/components/c_modal_loading";

import { faSun } from "@fortawesome/free-regular-svg-icons";
import { faMoon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function detectPrefersDarkMode(): boolean {
  const match = window.matchMedia("(prefers-color-scheme: dark)");
  return match.matches;
}

function applyDarkMode(isDarkMode: boolean) {
  const elm = document.getElementsByTagName("html")[0];
  elm.setAttribute("data-theme", isDarkMode ? "dark" : "light");
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(detectPrefersDarkMode());

  applyDarkMode(isDarkMode);

  return (
    <>
      <nav className="navbar is-primary">
        <div className="navbar-brand">
          <Link to="/" className="navbar-item title">
            Public Layers Console
          </Link>
        </div>
        <div className="navbar-end">
          <div className="navbar-item">
            <span
              className={classNames(
                Styles.CursorPointer,
                "icon",
                "mr-6",
                "is-size-4",
              )}
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              <FontAwesomeIcon icon={isDarkMode ? faMoon : faSun} />
            </span>
          </div>
        </div>
      </nav>
      <CModalLoading />
      <div className="container pt-3">
        <Outlet />
      </div>
    </>
  );
}

export default App;
