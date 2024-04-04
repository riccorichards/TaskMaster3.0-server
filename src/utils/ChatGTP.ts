import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.ChatGPT_API_KEY,
});

export async function ChatGPT(message: string, target: string) {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: target },
      {
        role: "user",
        content: message,
      },
    ],
    model: "gpt-3.5-turbo-0125",
  });

  return completion.choices[0];
}
