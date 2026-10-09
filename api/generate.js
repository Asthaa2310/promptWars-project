// Vercel Serverless Function calling Gemini API
const MODEL_NAME = "gemini-1.5-flash";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing' });
    }

    try {
        const { prompt, city } = req.body;
        const cleanPrompt = (prompt || '').slice(0, 2000);

        const systemContext = `You are CityPulse AI, a smart urban navigation and safety advisor for the city of ${city || 'Pune'}, India. Answer concisely in 3 lines max. Give actionable safety, route, and spot advice.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${systemContext}\n\nUser Question: ${cleanPrompt}` }]
                }]
            })
        });

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to retrieve response from AI model.";

        return res.status(200).json({ text });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Server error' });
    }
}
