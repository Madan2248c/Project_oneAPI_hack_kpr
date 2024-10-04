const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: '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' });
const express = require('express');

const router = express.Router();

router.post('/chatcomplete', async (req, res) => {
    try {
        const { user_query, language, model, temperature, max_tokens, top_p, stream, stop } = req.body;
        const prompt = `
            Given the user query in ${language}: "${user_query}",
            Interpret the query and if it is a medical query respond with the appropriate medical solution.
            If the query is not a medical query, return "invalid".
            Respond in ${language}.
        `;
        const messages = [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages,
            model,
            temperature,
            max_tokens,
            top_p,
            stream,
            stop
        });
        res.setHeader('Content-Type', 'text/plain');
        for await (const chunk of chatCompletion) {
            res.write(chunk.choices[0]?.delta?.content || '');
        }
        res.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;