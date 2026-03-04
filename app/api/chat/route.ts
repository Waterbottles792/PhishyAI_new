import { google } from "@ai-sdk/google";
import { streamText, UIMessage, convertToModelMessages } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, context }: { messages: UIMessage[]; context?: Record<string, any> | null } =
    await req.json();

  const isTraining = context?.mode === "training"
  const isMascot = context?.mode === "mascot"

  let systemPrompt: string

  if (isMascot) {
    systemPrompt = `You are a friendly, cute AI mascot guide for PhishGuard — an AI-powered phishing detection platform. You live on the landing page as an animated green blob character.

Your personality: cheerful, helpful, a little playful, uses occasional emojis. Keep answers SHORT (1-3 sentences max).

PhishGuard sections you can refer users to:
- Hero/Home (top of page)
- Features — ML-powered analysis, SHAP/LIME explainability, 4 models
- How It Works — 3-step process: scan, analyze, protect
- ML Models — Random Forest, XGBoost, LightGBM, Neural Network
- Demo — live interactive demo
- Stats — 98.7% accuracy, <200ms response time
- Dashboard — the main app with Email/URL/QR/Header/Domain analysis tools, plus DGA detection, Campaign tracking, Browser sandbox, and Active learning

When users ask about a section, tell them briefly what's there. Be enthusiastic and emoji-friendly! Keep it to 1-3 sentences.`
  } else if (isTraining) {
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
