const LANGUAGES = {
    "English": "en",
    "Hindi": "hi",
    "Malayalam": "ml",
    "Telugu": "te"
};

let chatHistory = [];

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
            <div class="user">You: ${message.human}</div>
            <div class="ai">AI: ${message.AI}</div>
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

        chatHistory.push({ human: query, AI: aiResponse });

    } catch (error) {
        console.error('Error:', error);
        const chatHistoryDiv = document.getElementById('chat-history');
        chatHistoryDiv.innerHTML = `<div class="ai">An error occurred while processing your query.</div>`;
    }
}