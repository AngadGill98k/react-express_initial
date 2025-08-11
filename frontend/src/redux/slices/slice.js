import { createSlice } from "@reduxjs/toolkit";

export const slice = createSlice({
    name: "slicename",
    initialState: {
        field1: "",
        field2: "",
        field3: ""
    },
    reducers: {
        function1: (state,action) => {
            state.field1 += action.payload;
        },
        function2: (state,action) => {
            state.field2 += action.payload;
        },

        function3: (state, action) => {
            state.field3 += action.payload;
        },
        function4: (state, action) => {
            state.field1 += action.payload;
            state.field2 += action.payload;
            state.field3 += action.payload;
        },
    },
});
export const { function1, function2, function3, function4 } = slice.actions;
export const SliceReducer= slice.reducer;