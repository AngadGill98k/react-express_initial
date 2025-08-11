import { createSlice } from "@reduxjs/toolkit";

export const tokenslice = createSlice({
    name: "token",
    initialState:"",
    reducers: {
        Token: (state,action) => {
            return action.payload;
        },
        
    },
});
export const { Token } =  tokenslice.actions;
export const TokenReducer=  tokenslice.reducer;