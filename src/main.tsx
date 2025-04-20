import { Amplify } from "aws-amplify";
import { StrictMode } from "react";
import { RouterProvider } from "react-router";

import { ProviderFlagLoading } from "@/context/context_flag_loading";
import { router } from "@/router";

import "bulma/css/bulma.min.css";
import { createRoot } from "react-dom/client";

Amplify.configure({
  Auth: {
    Cognito: {
      identityPoolId: import.meta.env.VITE_ID_IDENTITY_POOL,
      allowGuestAccess: true,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProviderFlagLoading>
      <RouterProvider router={router} />
    </ProviderFlagLoading>
  </StrictMode>,
);
