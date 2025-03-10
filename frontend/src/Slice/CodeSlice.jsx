import { createSlice } from "@reduxjs/toolkit";

const codeSlice = createSlice({
  name: "code",
  initialState: {
    code: "",
    language: "javascript",
    roomId: "",
    version: "*",
  },
  reducers: {
    setCode: (state, action) => {
      state.code = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
    setVersion: (state, action) => {
      state.version = action.payload;
    },
  },
})

export const { setCode, setLanguage, setRoomId, setVersion } = codeSlice.actions;

export default codeSlice.reducer;