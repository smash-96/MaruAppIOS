import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeCallData: null,
};

export const callDataSlice = createSlice({
  name: "calls",
  initialState,
  reducers: {
    setActiveCallData: (state, action) => {
      state.activeCallData = action.payload;
    },
  },
});

// Actions - used to set global state
export const { setActiveCallData } = callDataSlice.actions;

// Selectors - used to fetch global state
export const selectActiveCallData = (state) => state.calls.activeCallData;

export default callDataSlice.reducer;
