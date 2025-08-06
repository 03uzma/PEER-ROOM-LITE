// import Peer from "simple-peer";

// export function createPeer(initiator, socket, roomId) {
//   const peer = new Peer({
//     initiator,
//     trickle: false,
//   });

//   peer.on("signal", (data) => {
//     socket.emit("signal", { signalData: data, roomId });
//   });

//   return peer;
// }


import Peer from "simple-peer";

export function createPeer(initiator, stream = null, socket, roomId) {
  const peer = new Peer({
    initiator,
    trickle: false,
    stream,
  });

  peer.on("signal", (data) => {
    socket.emit("signal", { signalData: data, roomId });
  });

  return peer;
}
