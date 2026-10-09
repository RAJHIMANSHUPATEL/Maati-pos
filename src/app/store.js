import { configureStore } from "@reduxjs/toolkit";
import weightReducer from "../slices/weightSlice"

export default configureStore({
  reducer: {
    weight: weightReducer,
  },
});
