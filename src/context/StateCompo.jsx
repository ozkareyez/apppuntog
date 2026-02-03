import { useState } from "react";
import { counterContex } from "./counterContex";

const StateCompo = (children) => {
  const [counter, setCounter] = useState(0);

  const incrementar = () => {
    setCounter((prev) => prev + 1);
  };

  const decrementar = () => {
    setCounter((prev) => prev - 1);
  };

  const reset = () => {
    setCounter(0);
  };

    return
    <counterContex.Provider
      value={{
        counter,
        incrementar,
        decrementar,
        reset
      }}
    >
      {children}
    </counterContex.Provider>;
};

export default StateCompo;
