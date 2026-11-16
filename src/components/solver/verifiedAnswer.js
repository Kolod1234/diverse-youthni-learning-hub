import { base44 } from "@/api/base44Client";

// One stronger model writes the answer; a different one checks it independently,
// so a slip made by the first model is caught instead of being repeated.
export const SOLVER_MODEL = "gemini_3_1_pro";
const CHECKER_MODEL = "gpt_5_4";
const CHECKED_MODES = new Set(["full", "mark_scheme"]);

const answerText = (response) => typeof response === "string" ? response : response?.text || JSON.stringify(response);

const modeIsValid = (text, mode) => {
  if (mode === "hint") return text.split(/\s+/).length <= 120 && !/final answer|the answer is/i.test(text);
  if (mode === "mark_scheme") return /(^|\n)\s*[-*]\s/.test(text) && /\*\*Total:\s*\d+\s+marks?\*\*/i.test(text);
  if (mode === "explain") return /The BIG idea here is/i.test(text) && /Top tip:/i.test(text);
  return true;
};

const invoke = (prompt, fileUrls) => base44.integrations.Core.InvokeLLM({ prompt, file_urls: fileUrls, model: SOLVER_MODEL });

async function draftInMode(prompt, fileUrls, mode) {
  const text = answerText(await invoke(prompt, fileUrls));
  if (modeIsValid(text, mode)) return text;
  return answerText(await invoke(`${prompt}\n\nYour previous draft did not follow the selected ${mode} response format. Rewrite it now and obey the response-mode rules exactly.\n\nDRAFT TO REWRITE:\n${text}`, fileUrls));
}

function checkAnswer(questionContext, draft, fileUrls) {
  return base44.integrations.Core.InvokeLLM({
    model: CHECKER_MODEL,
    file_urls: fileUrls,
    prompt: `You are a senior examiner checking a worked answer before a student sees it.

${questionContext}
${fileUrls?.length ? "The original question or paper is attached. Take the exact wording, numbers, diagram values, table entries and units from it, not from the draft." : ""}

First solve the question yourself, independently and carefully, part by part. Only then compare your result with the draft below. Check that:
- the right question and part were answered, with the numbers and diagram values read correctly;
- the method suits the command word, the marks and the qualification level;
- every calculation, rearrangement, sign, unit, conversion and rounding is correct;
- facts, definitions and explanations are accurate for the specification;
- every part of the question is answered.

Use verdict "has_errors" only for real mistakes that affect correctness (a wrong value, wrong method, misread question, wrong fact or a missing part). Ignore style and formatting.
For each error, say in plain words (no LaTeX) where it is, what is wrong, and the correct value or statement with a short reason.

DRAFT ANSWER:
${draft}`,
    response_json_schema: {
      type: "object",
      properties: {
        verdict: { type: "string", enum: ["correct", "has_errors"] },
        errors: { type: "array", items: { type: "string" } },
      },
      required: ["verdict", "errors"],
    },
  });
}

// Draft → independent examiner check → corrected rewrite when real mistakes are found.
export async function requestVerifiedAnswer({ prompt, questionContext, fileUrls, mode, onStage }) {
  onStage?.("Solving…");
  const draft = await draftInMode(prompt, fileUrls, mode);
  if (!CHECKED_MODES.has(mode)) return draft;

  onStage?.("Double-checking the answer…");
  // The check is an extra safeguard: if the checker is unavailable the student still gets the answer.
  const check = await checkAnswer(questionContext, draft, fileUrls).catch(() => null);
  if (check?.verdict !== "has_errors" || !check.errors?.length) return draft;

  onStage?.("Fixing a mistake…");
  return draftInMode(`${prompt}

An independent examiner checked an earlier draft of this answer and reported these mistakes:
${check.errors.map((error, i) => `${i + 1}. ${error}`).join("\n")}

EARLIER DRAFT:
${draft}

Re-check each reported point yourself against the question, because the examiner can also be wrong. Then write the complete answer again from the start in the required format, with every genuine mistake fixed. Do not mention the earlier draft or the examiner.`, fileUrls, mode);
}