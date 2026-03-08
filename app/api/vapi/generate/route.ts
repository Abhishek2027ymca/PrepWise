import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, role, level, techstack, amount, userid } = body;

    // ✅ LOG: Request received
    console.log("🔵 API endpoint called");
    console.log("📋 Request body:", { type, role, level, techstack, amount, userid });

    // ✅ Validate all required fields
    if (!type || !role || !level || !techstack || !amount || !userid) {
      console.error("❌ Validation failed: Missing required fields");
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("✅ Validation passed");

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

    console.log("📡 Calling Gemini API");

    // Generate content with new format for v1 model
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Prepare questions for a job interview.
                The job role is ${role}.
                The job experience level is ${level}.
                The tech stack used in the job is: ${techstack}.
                The focus between behavioural and technical questions should lean towards: ${type}.
                The amount of questions required is: ${amount}.
                Please return only the questions, without any additional text.
                The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
                Return the questions formatted like this:
                ["Question 1", "Question 2", "Question 3"]
                
                Thank you! <3`,
            },
          ],
        },
      ],
    });

    console.log("📊 Gemini response received");

    // Wait for the response
    const response = result.response;
    const questionsText = response.text();

    console.log("❓ Raw questions response:", questionsText);

    // Parse questions from response
    let parsedQuestions = [];
    try {
      // Try to extract JSON array from response
      const jsonMatch = questionsText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsedQuestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found in response");
      }
    } catch (parseError) {
      console.error("❌ Failed to parse questions:", parseError);
      return Response.json(
        { 
          success: false, 
          error: "Failed to parse interview questions from Gemini response",
          details: questionsText 
        },
        { status: 400 }
      );
    }

    console.log("✅ Questions parsed:", parsedQuestions);

    // Create interview object
    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(",").map((tech: string) => tech.trim()),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    console.log("💾 Saving to Firestore");

    // Save to Firestore
    const docRef = await db.collection("interviews").add(interview);

    console.log("✅ Interview saved with ID:", docRef.id);

    // Return success response
    return Response.json(
      { 
        success: true, 
        interviewId: docRef.id,
        message: "Interview generated successfully"
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ API Error:", error);
    
    // Better error handling
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return Response.json(
      { 
        success: false, 
        error: errorMessage,
        type: "server_error"
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}