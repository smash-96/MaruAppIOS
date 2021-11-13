import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null,
};

export const userAuthSlice = createSlice({
  name: "authUser",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
  },
});

// Actions - used to set global state
export const { setUserData } = userAuthSlice.actions;

// Selectors - used to fetch global state
export const selectUserData = (state) => state.authUser.userData;

export default userAuthSlice.reducer;
