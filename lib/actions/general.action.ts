"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""
);

interface CreateFeedbackResponse {
  success: boolean;
  feedbackId?: string;
  error?: string;
}

export async function createFeedback(
  params: CreateFeedbackParams
): Promise<CreateFeedbackResponse> {
  const { interviewId, userId, transcript, feedbackId } = params;

  // ✅ INPUT VALIDATION
  if (!interviewId || interviewId.trim() === "") {
    console.error("createFeedback: Missing interviewId");
    return {
      success: false,
      error: "Interview ID is required",
    };
  }

  if (!userId || userId.trim() === "") {
    console.error("createFeedback: Missing userId");
    return {
      success: false,
      error: "User ID is required",
    };
  }

  if (!transcript || transcript.length === 0) {
    console.error("createFeedback: Empty transcript");
    return {
      success: false,
      error: "Transcript cannot be empty",
    };
  }

  if (!Array.isArray(transcript)) {
    console.error("createFeedback: Transcript is not an array");
    return {
      success: false,
      error: "Transcript must be an array",
    };
  }

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

    // ✅ TRY-CATCH AROUND GEMINI API CALL
    let result;
    try {
      result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
            You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
            Transcript:
            ${formattedTranscript}
        
            Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
            - **Communication Skills**: Clarity, articulation, structured responses.
            - **Technical Knowledge**: Understanding of key concepts for the role.
            - **Problem-Solving**: Ability to analyze problems and propose solutions.
            - **Cultural & Role Fit**: Alignment with company values and job role.
            - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
            
            Return the response in this exact JSON format:
            {
              "totalScore": number,
              "categoryScores": {
                "communicationSkills": number,
                "technicalKnowledge": number,
                "problemSolving": number,
                "culturalAndRoleFit": number,
                "confidenceAndClarity": number
              },
              "strengths": string[],
              "areasForImprovement": string[],
              "finalAssessment": string
            }
          `,
              },
            ],
          },
        ],
      });
    } catch (apiError) {
      console.error("Gemini API error:", apiError);
      return {
        success: false,
        error: "Failed to analyze interview with AI service. Please try again.",
      };
    }

    const response = await result.response;
    const responseText = response.text();

    // ✅ TRY-CATCH AROUND JSON PARSING
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      console.error("Raw response text:", responseText);
      return {
        success: false,
        error: "Failed to parse AI response. Please try again.",
      };
    }

    // ✅ SCHEMA VALIDATION
    let validatedFeedback;
    try {
      validatedFeedback = feedbackSchema.parse({
        totalScore: parsedResponse.totalScore,
        categoryScores: [
          {
            name: "Communication Skills",
            score: parsedResponse.categoryScores.communicationSkills,
            comment: "Communication skills assessment",
          },
          {
            name: "Technical Knowledge",
            score: parsedResponse.categoryScores.technicalKnowledge,
            comment: "Technical knowledge assessment",
          },
          {
            name: "Problem Solving",
            score: parsedResponse.categoryScores.problemSolving,
            comment: "Problem solving assessment",
          },
          {
            name: "Cultural Fit",
            score: parsedResponse.categoryScores.culturalAndRoleFit,
            comment: "Cultural and role fit assessment",
          },
          {
            name: "Confidence and Clarity",
            score: parsedResponse.categoryScores.confidenceAndClarity,
            comment: "Confidence and clarity assessment",
          },
        ],
        strengths: parsedResponse.strengths,
        areasForImprovement: parsedResponse.areasForImprovement,
        finalAssessment: parsedResponse.finalAssessment,
      });
    } catch (validationError) {
      console.error("Feedback validation error:", validationError);
      return {
        success: false,
        error: "AI response did not match expected format. Please try again.",
      };
    }

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: validatedFeedback.totalScore,
      categoryScores: validatedFeedback.categoryScores,
      strengths: validatedFeedback.strengths,
      areasForImprovement: validatedFeedback.areasForImprovement,
      finalAssessment: validatedFeedback.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save feedback. Please try again.",
    };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}