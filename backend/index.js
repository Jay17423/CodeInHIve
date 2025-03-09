import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import OpenAI from "openai";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });
const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// console.log("OpenAI Key:", process.env.OPENAI_API_KEY);

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);
  let currentRoom = null;
  let currentUser = null;

  socket.on("join", ({ roomId, userName }) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
    }
    currentRoom = roomId;
    currentUser = userName;

    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(userName);
    io.to(roomId).emit("userJoined", Array.from(rooms.get(currentRoom)));
  });
  socket.on("codeChange", ({ roomId, code }) => {
    socket.to(roomId).emit("codeUpdate", code);
  });

  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));

      socket.leave(currentRoom);
      currentRoom = null;
      currentUser = null;
    }
  });

  socket.on("userTyping", ({ roomId, userName }) => {
    socket.to(roomId).emit("userTyping", userName);
  });

  socket.on("languageChange", ({ roomId, language }) => {
    io.to(roomId).emit("languageUpdate", language);
  });

  socket.on("compileCode", async ({ code, roomId, language, version }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      const response = await axios.post(
        "https://emkc.org/api/v2/piston/execute",
        {
          language,
          version,
          files: [
            {
              content:code,
            }
          ],
        });

        room.output = response.data.run.output;
        io.to(roomId).emit("codeResponse", response.data);
    }
  });
  socket.on("askAI", async ({ roomId, question, code }) => {
    if (rooms.has(roomId)) {
      try {
        const prompt = `
          You are a coding assistant. A user has written the following code:\n\n
          "${code}"\n\n
          They have asked: "${question}".\n
          Please analyze the code and give responese according to the question asked to you point wise.
          Also give best practice how to write the code
        `;
  
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini", 
          messages: [{ role: "system", content: prompt }],
        });
  
        io.to(roomId).emit("aiResponse", {
          question,
          response: response.choices[0].message.content,
        });
      } catch (error) {
        console.error("Error calling OpenAI API:", error);
        io.to(roomId).emit("aiResponse", {
          question,
          response: "Failed to get AI response. Please try again.",
        });
      }
    }
  });
  

  socket.on("disconnect", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
    }
    console.log("User Disconnected", socket.id);
  });
});

const port = process.env.PORT || 5050;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
