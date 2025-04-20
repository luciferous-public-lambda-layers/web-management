import { ReactNode, createContext, useContext, useMemo, useState } from "react";

type TypeContextFlagLoading = {
  flagLoading: boolean;
  setFlagLoading: (v: boolean) => void;
};

type TypeSetterContextFlagLoading = (v: boolean) => void;

const ContextFlagLoading = createContext<TypeContextFlagLoading>({
  flagLoading: false,
  setFlagLoading: (_) => {},
});

export function ProviderFlagLoading({ children }: { children: ReactNode }) {
  const [flagLoading, setFlagLoading] = useState(false);
  const value = useMemo(() => ({ flagLoading, setFlagLoading }), [flagLoading]);

  return <ContextFlagLoading value={value}>{children}</ContextFlagLoading>;
}

export function useSetterFlagLoading(): TypeSetterContextFlagLoading {
  const tmp = useContext(ContextFlagLoading);
  return tmp.setFlagLoading;
}

export function useValueFlagLoading(): boolean {
  const tmp = useContext(ContextFlagLoading);
  return tmp.flagLoading;
}
