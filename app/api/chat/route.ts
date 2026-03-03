import { google } from "@ai-sdk/google";
import { streamText, UIMessage, convertToModelMessages } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, context }: { messages: UIMessage[]; context?: Record<string, any> | null } =
    await req.json();

  const isTraining = context?.mode === "training"

  let systemPrompt: string

  if (isTraining) {
    systemPrompt = `You are PhishGuard AI, a phishing detection coach helping users learn to identify phishing emails. Rules:
- You are in TRAINING MODE. The user is practicing spotting phishing emails.
- If the user has NOT answered yet, give helpful HINTS about what to look for (e.g. sender address red flags, urgency language, suspicious links, grammar issues) WITHOUT directly saying whether it is phishing or legitimate. Guide them to figure it out themselves.
- If the user HAS already answered, you can freely discuss the email, explain the indicators, and teach them what they missed or got right.
- Teach general phishing detection techniques: check sender domain, hover over links, look for urgency/fear tactics, grammar errors, mismatched branding, requests for personal info.
- Keep answers concise (3-5 sentences) but educational.
- Be encouraging and supportive.`
  } else {
    systemPrompt = `You are PhishGuard AI, a concise cybersecurity assistant. Rules:
- Keep answers short (2-4 sentences max unless the user asks for detail).
- Be direct and specific to the email the user is looking at.
- Do not list generic phishing tips unless asked.`
  }

  if (context?.body) {
    systemPrompt += `\n\nThe user is currently viewing this email:\nFrom: ${context.sender || "(unknown)"}\nSubject: ${context.subject || "(none)"}\nBody: ${context.body}`;
  }

  if (isTraining && context?.hasAnswered) {
    systemPrompt += `\n\nThe user already answered. They were ${context.wasCorrect ? "CORRECT" : "INCORRECT"}. The actual answer was: ${context.actualAnswer}.`
  }

  if (context?.result && !isTraining) {
    systemPrompt += `\n\nAnalysis result: ${JSON.stringify(context.result)}`;
  }

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
