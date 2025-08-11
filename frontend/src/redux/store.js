import {configureStore} from "@reduxjs/toolkit";
import { SliceReducer } from "./slices/slice";
import { TokenReducer } from "./slices/token";
export const store = configureStore({
    reducer: {
        token: TokenReducer,
        slicename: SliceReducer,
    },
})