
const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileCancelButton = document.querySelector("#file-cancel");

const API_KEY = "AIzaSyAo_HXfg3fCtU3KYVFoT2PhheH0FGC5ZmY";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const userData = { 
    message: null,
    file: {
        data: null,
        mime_type: null
    }
}

const chatHistory = [
    {
      role: "model",
      parts: [{ text: `You are a professional on everything educational. You follow Fairfax Public County School's Student's Rights And Responsibilities. Your knowledge base extends to all of FCPS's databases. However, if you do not know something, you will admit so. You will never directly give an answer to a question, instead giving the process behind that answer and helpful hints.` }],
    },
  ];
// Create message element with dynamic classes and return it 
const createMessageElement = (content, ...classes) => { 
    const div = document.createElement("div"); 
    div.classList.add("message", ...classes);
div.innerHTML = content;
return div;
}

const generateBotResponse = async (incomingMessageDiv) => {
    const MessageElement = incomingMessageDiv.querySelector(".message-text");
    chatHistory.push({
        role: "user",
            role: "user",
            parts: [{ text: `Using the details provided above, please address this query: ${userData.message}` }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])],

        });
    
    const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        contents: [{
            parts: [{ text: userData.message}, ...(userData.file.data ? [{inline_data : userData.file }] : [] )]
        }]
    })
    }

    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message)
        
            const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
            MessageElement.innerText = apiResponseText;

        chatHistory.push({
                role: "model",
                parts: [{  text: apiResponseText }]
        });
    } catch (error) {
        console.log(error);
        messageElement.innerText = error.message;
        messageElement.style.color = "ff0000";
    } finally {
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" })
    }
}

// Handle outgoing user messages
const handleOutgoingMessage = (e) => {
e.preventDefault();
userData.message = messageInput.value.trim();
messageInput.value = "";

const messageContent = `<div class="message-text">${userData.message}</div>`;
    

const outgoingMessageDiv = createMessageElement(messageContent, "user-message"); 
chatBody.appendChild(outgoingMessageDiv);
chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" })

setTimeout(() => {
    const messageContent = `<img class="bot-avatar"><img src ="Downloads/bot.png" alt="" width="100px" height="80px">
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>`;

    const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking"); 
    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" })
    generateBotResponse(incomingMessageDiv);
}, 600)

}
// Handle Enter key press for sending messages 
messageInput.addEventListener("keydown", (e) => {
const userMessage = e.target.value.trim(); 
if(e.key === "Enter" && userMessage) { 
    handleOutgoingMessage(e);
}
});

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        
        const base64String = e.target.result.split(",")[1];

        userData.file = {
            data: base64String,
            mime_type: file.type
        }
        fileInput.value = "";
    }

    reader.readAsDataURL(file);
})

const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
        const { selectionStart: start, selectionEnd: end} = messageInput;
        messageInput.setRangeText(emoji.native, start, end, "end");
        messageInput.focus();
    },
    onClickOutside: (e) => {
        if(e.target.id === "emoji-picker") {
            document.body.classList.toggle("show-emoji-picker");
        } else {
            document.body.classList.remove("show-emoji-picker");
        }
    }
})
    
document.querySelector(".chat-form").appendChild(picker);

sendMessageButton.addEventListener("click", () => handleOutgoingMessage(e))
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());