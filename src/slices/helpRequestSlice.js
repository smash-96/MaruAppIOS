import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeRequestData: null,
};

export const helpRequestSlice = createSlice({
  name: "help",
  initialState,
  reducers: {
    setActiveRequestData: (state, action) => {
      state.activeRequestData = action.payload;
    },
  },
});

// Actions - used to set global state
export const { setActiveRequestData } = helpRequestSlice.actions;

// Selectors - used to fetch global state
export const selectActiveRequestData = (state) => state.help.activeRequestData;

export default helpRequestSlice.reducer;
