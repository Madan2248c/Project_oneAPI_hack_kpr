const LANGUAGES = {
    "English": "en",
    "Hindi": "hi",
    "Malayalam": "ml",
    "Telugu": "te"
};

let chatHistory = [];

// Fetch the chat history when the page loads
window.onload = () => {
    fetchChatHistory();
};

document.getElementById('interpret-btn').addEventListener('click', async () => {
    const language = document.getElementById('language').value;
    const userQuery = document.getElementById('user_query').value;

    if (userQuery.trim() === "") {
        alert("Please enter a query.");
        return;
    }

    const chatHistoryDiv = document.getElementById('chat-history');
    chatHistoryDiv.innerHTML = `<div class="user">You: ${userQuery}</div><div class="ai">AI is thinking...</div>`;
    
    await interpretResponse(userQuery, LANGUAGES[language]);

    updateChatHistory();
});

function updateChatHistory() {
    const chatHistoryDiv = document.getElementById('chat-history');
    chatHistoryDiv.innerHTML = '';
    
    chatHistory.forEach(message => {
        chatHistoryDiv.innerHTML += `
            <div class="user">You: ${message.user}</div>
            <div class="ai">AI: ${message.ai}</div>
            <hr>
        `;
    });
}

async function interpretResponse(query, language) {
    const requestData = {
        user_query: query,
        language: language,
        model: "llama3-8b-8192",
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: true,
        stop: null
    };

    try {
        const response = await fetch('http://localhost:3000/chat/chatcomplete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let aiResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunkText = decoder.decode(value, { stream: true });
            aiResponse += chunkText;

            const chatHistoryDiv = document.getElementById('chat-history');
            chatHistoryDiv.innerHTML = `
                <div class="user">You: ${query}</div>
                <div class="ai">AI: ${aiResponse}</div>
            `;
        }

        // Store chat history in the new format
        chatHistory.push({ user: query, ai: aiResponse });

        // Send chat history to the server
        await updateChatHistoryToServer();

    } catch (error) {
        console.error('Error:', error);
        const chatHistoryDiv = document.getElementById('chat-history');
        chatHistoryDiv.innerHTML = `<div class="ai">An error occurred while processing your query.</div>`;
    }
}

// Function to send chat history to the server
async function updateChatHistoryToServer() {
    const requestData = {
        chat: chatHistory
    };

    try {
        const response = await fetch('http://localhost:3000/chat/update_chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`Failed to update chat history with status ${response.status}`);
        }

        const result = await response.json();
        console.log('Chat history updated successfully:', result);

    } catch (error) {
        console.error('Error updating chat history:', error);
    }
}

// Function to fetch chat history from the server
async function fetchChatHistory() {
    try {
        const response = await fetch('http://localhost:3000/chat/getchats', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch chat history with status ${response.status}`);
        }

        const data = await response.json();
        chatHistory = data.chats; // Update the chatHistory variable with the fetched data
        updateChatHistory(); // Update the chat history display
    } catch (error) {
        console.error('Error fetching chat history:', error);
    }
}