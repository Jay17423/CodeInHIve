import { createSlice } from "@reduxjs/toolkit";

const groupChatSlice = createSlice({
  name: "groupChat",
  initialState: {
    messages: [],
    members: [],
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    addMember: (state, action) => {
      state.members.push(action.payload);
    },
  },
});

export const { addMessage, clearMessages, addMember } = groupChatSlice.actions;
export default groupChatSlice.reducer;
