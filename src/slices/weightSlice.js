import { createSlice } from "@reduxjs/toolkit";

const weightSlice = createSlice({
  name: "weight",
  initialState: 0,
  reducers: {
    addWeight: (state, action) => {
      return action.payload;
    },
  },
});

export const { addWeight } = weightSlice.actions;
export default weightSlice.reducer;
