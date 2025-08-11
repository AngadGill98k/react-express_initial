import {configureStore} from "@reduxjs/toolkit";
import { TokenReducer } from "./slices/token";
import { SocketReducer } from "./slices/socket";
export const store = configureStore({
    reducer: {
        token: TokenReducer,
        socket: SocketReducer,
    },
})