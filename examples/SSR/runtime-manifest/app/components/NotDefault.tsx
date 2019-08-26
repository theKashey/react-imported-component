import * as React from "react";
import {useImported} from "react-imported-component"

export const NotDefault: React.FC<{ p1: number }> = ({p1}) => {
  const {
    imported = x => `!${x}!`,
  } = useImported(() => import("./library"), (lib) => lib.magicFunction);

  return (
    <span>
      I am not not Default Export({p1} prop == {imported(p1)})
    </span>
  );
}
