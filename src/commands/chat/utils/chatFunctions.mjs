import OpenAI from 'openai';

const client = new OpenAI({
    apiKey: process.env.OPENAI_TOKEN
});

export async function getCompletion(prompt, model = "gpt-3.5-turbo-instruct", temperature = 0.7) {
    let response = await client.completions.create({
        model,
        prompt,
        temperature,
        max_tokens: 384,
        top_p: 1,
        frequency_penalty: 0.1,
        presence_penalty: 0,
        best_of: 1
    });

    return response.choices[0].text.replace(/`/g, "'").slice(0, 1900) ?? false;
}

export async function getChatResponse(prompt, model = "gpt-4o-mini", instructions = "", previousMessages = [], attachment = "") {
    let messages = [
        {
            role: "user",
            content: [
                { type: "text", text: prompt }
            ]
        }
    ];

    if(attachment != "") messages[0].content.push({ type: "image_url", image_url: { url: attachment }});

    if(previousMessages.length != 0) messages.unshift(...previousMessages.slice(-10));

    if(instructions != "") messages.unshift({ role: "system", content: instructions });

    let response = await client.chat.completions.create({
        model,
        messages,
        n: 1
    });

    return response.choices[0].message ?? false;
}