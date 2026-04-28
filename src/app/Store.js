import { configureStore } from "@reduxjs/toolkit";
import { pcApi } from "./services/pcApi";
import authReducer from "./features/AuthSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [pcApi.reducerPath]: pcApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(pcApi.middleware)
})