import Vapi from "@vapi-ai/web";

const vapiToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;

// ✅ ADD: Runtime check with helpful error
if (!vapiToken) {
  throw new Error(
    "NEXT_PUBLIC_VAPI_WEB_TOKEN environment variable is not set. " +
    "Please add it to your .env.local file or set it in your deployment platform."
  );
}

export const vapi = new Vapi(vapiToken);

