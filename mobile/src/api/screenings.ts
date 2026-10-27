import { request } from "./client";

export type ScreeningAnswer = { question_id: string; value: number | null; skipped?: boolean };

export async function submitScreening(
  questionnaireType: "phq9" | "gad7",
  answers: ScreeningAnswer[],
): Promise<unknown> {
  return request("/api/v1/screenings", {
    method: "POST",
    body: {
      questionnaire_type: questionnaireType,
      questionnaire_version: "1.0",
      answers,
    },
  });
}