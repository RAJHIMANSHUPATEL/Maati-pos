import SITE_CONFIG from "../../controller";
import { toast } from "react-toastify"; // Assuming you're using React Toastify for showing toast messages

// Initialize WebSocket connection
export const socket = new WebSocket(SITE_CONFIG.socketIp);

// Event listener for when the connection is established
// Event listener for when the connection is closed
socket.addEventListener("open", (event) => {
    toast.success("Driver connected.");
});
socket.onopen = () =>{
    sendMessage({ command: "getposdata" });
}
// Event listener for when a message is received
socket.addEventListener("message", (event) => {
    const parsedData = JSON.parse(event.data);
    if (parsedData?.type === "response") {
        if (parsedData.success) {
            toast.success(parsedData.message);
        } else {
            toast.error(parsedData.message);
        }
    }
});

// Event listener for when the connection is closed
socket.addEventListener("close", (event) => {
    toast.error("Driver disconnected. Please check your connection.");
});


// Function to send a message
export const sendMessage = (message) => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));  // Send a JSON string
    } else {
        console.error("Driver is not connected. Unable to send command.");
        toast.error("Driver is not connected. Unable to send command.");
    }
};
