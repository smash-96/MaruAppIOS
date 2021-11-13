import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./src/slices/userInfoSlice"; // Get reducer
import authReducer from "./src/slices/userAuthSlice";
import callReducer from "./src/slices/callDataSlice";
import helpReducer from "./src/slices/helpRequestSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    authUser: authReducer,
    calls: callReducer,
    help: helpReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware({
  //     immutableCheck: { ignoredPaths: ["some.nested.path"] },
  //     serializableCheck: { ignoredPaths: ["some.nested.path"] },
  //   }),
});
