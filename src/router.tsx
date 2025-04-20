import { createBrowserRouter } from "react-router";

import App from "@/App.tsx";
import { PLayer, clientLoaderPLayer } from "@/pages/p_layer";
import { PList } from "@/pages/p_list";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        index: true,
        path: "/",
        element: <PList />,
      },
      {
        path: "/list",
        element: <PList />,
      },
      {
        path: "/layer/:identifier",
        element: <PLayer />,
        loader: clientLoaderPLayer,
      },
    ],
  },
]);
