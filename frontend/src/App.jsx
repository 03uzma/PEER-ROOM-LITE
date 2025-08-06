// import { useEffect, useRef, useState } from "react";
// import { createPeer } from "./Peer";
// import socket from "./socket";

// function App() {
//   const [socketId, setSocketId] = useState(null);
//   const [roomId, setRoomId] = useState("");
//   const [connectedPeers, setConnectedPeers] = useState([]);
//   const [message, setMessage] = useState('');
//   const [chatLog, setChatLog] = useState([]);
//   const [joinedRoom, setJoinedRoom] = useState(false);
//   const [isConnected, setIsConnected] = useState(false);
//   const [username, setUsername] = useState('');
//   const [peerTyping, setPeerTyping] = useState(false);
//   const chatBoxRef = useRef(null);
//   const peerRef = useRef(null);

//   const getCurrentTime = () => {
//     const now = new Date();
//     return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   useEffect(() => {
//     socket.on("connect", () => {
//       setSocketId(socket.id);
//       const name = prompt("Enter your username") || "Anonymous";
//       setUsername(name);
//     });

//     // socket.on("user-joined", (peerId) => {
//     //   console.log("New peer joined:", peerId);
//     //   setConnectedPeers((prev) => [...prev, peerId]);
//     // });

//     socket.on("user-joined", ({ id, username }) => {
//   console.log(`New peer joined: ${username} (${id})`);
//   setConnectedPeers((prev) => [...prev, `${username} (${id})`]);
//    });



//     socket.on("signal", ({ signalData }) => {
//       console.log("📶 Signal received:", signalData);

//       if (!peerRef.current) {
//         const peer = createPeer(false, null, socket, roomId);

//         peer.on("connect", () => {
//           console.log("✅ P2P connection established!");
//           setIsConnected(true);
//         });

//         peer.on("data", (data) => {
//           try {
//             const parsed = JSON.parse(data.toString());

//             if (parsed.text === "__typing__") {
//               setPeerTyping(true);
//               setTimeout(() => setPeerTyping(false), 2000);
//               return;
//             }

//             setChatLog((prev) => [
//               ...prev,
//               { sender: parsed.sender, text: parsed.text, time: getCurrentTime() }
//             ]);
//           } catch {
//             setChatLog((prev) => [
//               ...prev,
//               { sender: 'peer', text: data.toString(), time: getCurrentTime() }
//             ]);
//           }
//         });

//         peer.signal(signalData);
//         peerRef.current = peer;
//       } else {
//         peerRef.current.signal(signalData);
//       }
//     });

//     return () => {
//       socket.off("connect");
//       socket.off("user-joined");
//       socket.off("signal");
//     };
//   }, [roomId]);

//   useEffect(() => {
//     if (chatBoxRef.current) {
//       chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
//     }
//   }, [chatLog]);

//   const startConnection = () => {
//     const initiator = window.confirm("Are you the initiator?");
//     if (!roomId.trim()) return alert("Join a room first!");

//     if (initiator) {
//       const peer = createPeer(true, null, socket, roomId);

//       peer.on("connect", () => {
//         console.log("✅ P2P connection established!");
//         setIsConnected(true);
//         peer.send(JSON.stringify({ sender: username, text: "Hello from initiator 👋" }));
//       });

//       peer.on("data", (data) => {
//         try {
//           const parsed = JSON.parse(data.toString());

//           if (parsed.text === "__typing__") {
//             setPeerTyping(true);
//             setTimeout(() => setPeerTyping(false), 2000);
//             return;
//           }

//           setChatLog((prev) => [
//             ...prev,
//             { sender: parsed.sender, text: parsed.text, time: getCurrentTime() }
//           ]);
//         } catch {
//           setChatLog((prev) => [
//             ...prev,
//             { sender: 'peer', text: data.toString(), time: getCurrentTime() }
//           ]);
//         }
//       });

//       peerRef.current = peer;
//     }
//   };

//   const joinRoom = () => {
//     if (roomId.trim()) {
//       socket.emit("join-room", {roomId: roomId.trim(),username});
//       setJoinedRoom(true);
//       setConnectedPeers([]);
//       setChatLog([]);
//       setIsConnected(false);
//     }
//   };

//   const leaveRoom = () => {
//     setRoomId("");
//     setJoinedRoom(false);
//     setConnectedPeers([]);
//     setChatLog([]);
//     setIsConnected(false);
//     peerRef.current?.destroy?.();
//     peerRef.current = null;
//   };

//   const sendMessage = () => {
//     const trimmed = message.trim();
//     if (peerRef.current && trimmed) {
//       peerRef.current.send(JSON.stringify({ sender: username, text: trimmed }));
//       setChatLog((prev) => [
//         ...prev,
//         { sender: username, text: trimmed, time: getCurrentTime() }
//       ]);
//       setMessage('');
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-4">
//       <h1 className="text-3xl font-bold text-green-600 mb-2">🧩 P2P Chat Room </h1>
//       <p className="mb-2 text-gray-700">
//         You: <span className="font-mono text-blue-600">{username || socketId}</span>
//       </p>

//       <p className={`mb-4 text-sm font-semibold ${isConnected ? 'text-green-600' : 'text-red-500'}`}>
//         {isConnected ? 'Connected ✅' : 'Not connected ❌'}
//       </p>

//       <div className="mb-4">
//         <input
//           className="border border-gray-300 px-3 py-2 rounded mr-2"
//           type="text"
//           placeholder="Enter Room ID"
//           value={roomId}
//           onChange={(e) => setRoomId(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && joinRoom()}
//         />
//         <button
//           className={`px-4 py-2 rounded text-white ${roomId.trim() ? 'bg-blue-500' : 'bg-gray-400 cursor-not-allowed'}`}
//           onClick={joinRoom}
//           disabled={!roomId.trim()}
//         >
//           Join Room
//         </button>
//       </div>

//       {joinedRoom && (
//         <p className="text-green-600 font-medium mb-2">✅ Joined room: <span className="font-mono">{roomId}</span></p>
//       )}

//       {connectedPeers.length > 0 && (
//         <div className="mb-4">
//           <h2 className="text-lg font-semibold text-gray-800">Connected with:</h2>
//           <ul className="mt-2 text-sm text-gray-600">
//             {connectedPeers.map((peer) => (
//               <li key={peer} className="font-mono">{peer}</li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {joinedRoom && (
//         <div className="flex gap-2 mt-4">
//           <button
//             className="bg-green-600 text-white px-4 py-2 rounded"
//             onClick={startConnection}
//           >
//             Start P2P Connection
//           </button>
//           <button
//             className="bg-red-500 text-white px-4 py-2 rounded"
//             onClick={leaveRoom}
//           >
//             Leave Room
//           </button>
//         </div>
//       )}

//       {/* 💬 Chat Section */}
//       <div className="w-full max-w-md mt-6">
//         <h2 className="text-xl font-semibold mb-2">💬 Chat</h2>
//         <div
//           ref={chatBoxRef}
//           className="bg-white border rounded h-48 overflow-y-auto p-2 text-left text-sm mb-2"
//         >
//           {chatLog.map((msg, idx) => (
//             <p key={idx} className={msg.sender === username ? 'text-blue-600' : 'text-green-600'}>
//               <strong>{msg.sender === username ? 'You' : msg.sender}:</strong> {msg.text}
//               <span className="text-gray-400 text-xs ml-2">[{msg.time}]</span>
//             </p>
//           ))}
//           {peerTyping && (
//             <p className="italic text-gray-500 mt-1">Peer is typing...</p>
//           )}
//         </div>
//         <div className="flex gap-2">
//           <input
//             className="border px-3 py-2 rounded flex-1"
//             type="text"
//             placeholder="Type a message"
//             value={message}
//             onChange={(e) => {
//               setMessage(e.target.value);

//               if (peerRef.current) {
//                 peerRef.current.send(JSON.stringify({ sender: username, text: "__typing__" }));
//               }
//             }}
//             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           />
//           <button
//             className="bg-blue-600 text-white px-4 py-2 rounded"
//             onClick={sendMessage}
//           >
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;




import { useEffect, useRef, useState } from "react";
import { createPeer } from "./Peer";
import socket from "./socket";

function App() {
  const [socketId, setSocketId] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [connectedPeers, setConnectedPeers] = useState([]);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [peerTyping, setPeerTyping] = useState(false);
  const chatBoxRef = useRef(null);
  const peerRef = useRef(null);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    socket.on("connect", () => {
      setSocketId(socket.id);
      const name = prompt("Enter your username") || "Anonymous";
      setUsername(name);
    });

    socket.on("user-joined", ({ id, username }) => {
  console.log(`New peer joined: ${username} (${id})`);
  setConnectedPeers((prev) => [...prev, `${username} (${id})`]);
   });



    socket.on("signal", ({ signalData }) => {
      console.log("📶 Signal received:", signalData);

      if (!peerRef.current) {
        const peer = createPeer(false, null, socket, roomId);

        peer.on("connect", () => {
          console.log("✅ P2P connection established!");
          setIsConnected(true);
        });

        peer.on("data", (data) => {
          try {
            const parsed = JSON.parse(data.toString());

            if (parsed.text === "__typing__") {
              setPeerTyping(true);
              setTimeout(() => setPeerTyping(false), 2000);
              return;
            }

            setChatLog((prev) => [
              ...prev,
              { sender: parsed.sender, text: parsed.text, time: getCurrentTime() }
            ]);
          } catch {
            setChatLog((prev) => [
              ...prev,
              { sender: 'peer', text: data.toString(), time: getCurrentTime() }
            ]);
          }
        });

        peer.signal(signalData);
        peerRef.current = peer;
      } else {
        peerRef.current.signal(signalData);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("user-joined");
      socket.off("signal");
    };
  }, [roomId]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatLog]);

  const startConnection = () => {
    const initiator = window.confirm("Are you the initiator?");
    if (!roomId.trim()) return alert("Join a room first!");

    if (initiator) {
      const peer = createPeer(true, null, socket, roomId);

      peer.on("connect", () => {
        console.log("✅ P2P connection established!");
        setIsConnected(true);
        peer.send(JSON.stringify({ sender: username, text: "Hello from initiator 👋" }));
      });

      peer.on("data", (data) => {
        try {
          const parsed = JSON.parse(data.toString());

          if (parsed.text === "__typing__") {
            setPeerTyping(true);
            setTimeout(() => setPeerTyping(false), 2000);
            return;
          }

          setChatLog((prev) => [
            ...prev,
            { sender: parsed.sender, text: parsed.text, time: getCurrentTime() }
          ]);
        } catch {
          setChatLog((prev) => [
            ...prev,
            { sender: 'peer', text: data.toString(), time: getCurrentTime() }
          ]);
        }
      });

      peerRef.current = peer;
    }
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      socket.emit("join-room", {roomId: roomId.trim(),username});
      setJoinedRoom(true);
      setConnectedPeers([]);
      setChatLog([]);
      setIsConnected(false);
    }
  };

  const leaveRoom = () => {
    setRoomId("");
    setJoinedRoom(false);
    setConnectedPeers([]);
    setChatLog([]);
    setIsConnected(false);
    peerRef.current?.destroy?.();
    peerRef.current = null;
  };

  const sendMessage = () => {
    const trimmed = message.trim();
    if (peerRef.current && trimmed) {
      peerRef.current.send(JSON.stringify({ sender: username, text: trimmed }));
      setChatLog((prev) => [
        ...prev,
        { sender: username, text: trimmed, time: getCurrentTime() }
      ]);
      setMessage('');
    }
  };

  return (
  <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-gray-100 to-gray-200 text-center p-6">
    <h1 className="text-4xl font-extrabold text-green-700 mb-2">🧩 PEER ROOM</h1>

    <p className="mb-1 text-gray-700">
      You: <span className="font-mono text-blue-700">{username || socketId}</span>
    </p>

    <p className={`mb-4 text-sm font-semibold ${isConnected ? 'text-green-600' : 'text-red-500'}`}>
      {isConnected ? 'Connected ✅' : 'Not connected ❌'}
    </p>

    {/* 🌟 UI POLISH: Room input */}
    <div className="mb-6 flex flex-col sm:flex-row items-center gap-2">
      <input
        className="border border-gray-300 px-4 py-2 rounded shadow-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && joinRoom()}
      />
      <button
        className={`px-5 py-2 rounded text-white font-medium shadow-sm transition ${
          roomId.trim()
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
        onClick={joinRoom}
        disabled={!roomId.trim()}
      >
        Join Room
      </button>
    </div>

    {joinedRoom && (
      <p className="text-green-700 font-medium mb-3">
        ✅ Joined room: <span className="font-mono">{roomId}</span>
      </p>
    )}

    {connectedPeers.length > 0 && (
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Connected with:</h2>
        <ul className="mt-2 text-sm text-gray-600">
          {connectedPeers.map((peer) => (
            <li key={peer} className="font-mono">{peer}</li>
          ))}
        </ul>
      </div>
    )}

    {/* 🌟 UI POLISH: Buttons layout */}
    {joinedRoom && (
      <div className="flex gap-4 mt-4">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          onClick={startConnection}
        >
          Get a Connection
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
          onClick={leaveRoom}
        >
          Leave Room
        </button>
      </div>
    )}

    {/* 💬 Chat Section */}
    <div className="w-full max-w-md mt-8">
      <h2 className="text-xl font-bold text-gray-800 mb-2">💬 Chat</h2>
      
      {/* 🌟 UI POLISH: Chat box */}
      <div
        ref={chatBoxRef}
        className="bg-white border border-gray-300 rounded h-52 overflow-y-auto p-3 shadow-inner text-left text-sm mb-3"
      >
        {chatLog.map((msg, idx) => (
          <p key={idx} className={msg.sender === username ? 'text-blue-600' : 'text-green-700'}>
            <strong>{msg.sender === username ? 'You' : msg.sender}:</strong> {msg.text}
            <span className="text-gray-400 text-xs ml-2">[{msg.time}]</span>
          </p>
        ))}
        {peerTyping && (
          <p className="italic text-gray-500 mt-1">Peer is typing...</p>
        )}
      </div>

      {/* 🌟 UI POLISH: Message input */}
      <div className="flex gap-2">
        <input
          className="border border-gray-300 px-3 py-2 rounded flex-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (peerRef.current) {
              peerRef.current.send(JSON.stringify({ sender: username, text: "__typing__" }));
            }
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  </div>
);
}
export default App;