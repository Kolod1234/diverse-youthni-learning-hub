import { base44 } from "@/api/base44Client";

// Fallback for papers without a readable text layer (scans, photos, Word files):
// the AI reads the paper and lists its questions.
export async function extractPaperQuestionsWithAI(fileUrl, subject, qualification) {
  const prompt = `You are an expert CCEA ${qualification} ${subject} examiner.

The attached file is a CCEA ${qualification} ${subject} past paper.

Extract EVERY question and sub-question from the document (e.g. 1, 1a, 1b, 2, 2a, 2(i), etc.).
For each question include:
- number: the question number/label as a string (e.g. "1a", "1b")
- stem: if this is a sub-question (like 1b or 2(ii)), include the shared parent question introduction/stem and any key/data established in earlier parts (e.g. "The pictogram shows the number of litres of paint sold. Part (a) established that 30 litres of matt paint = 3 buckets, so 1 bucket = 10 litres."). Empty string if standalone.
- text: the FULL question text exactly as written in the paper. If the question includes a table or pictogram, also include a clean Markdown table representation of it.
- marks: the number of marks awarded (integer), or null if not shown
- page_number: the 1-based page number of the PDF where this question and its diagram/table appear (1 if a single image)
- has_diagram: true if the question relies on a diagram, pictogram, graph, chart, figure, or table on the paper
- crop_box: [ymin, xmin, ymax, xmax] on a 0 to 1000 scale bounding the question AND its associated diagram/pictogram/table on that page (include the parent diagram if this sub-question uses it)
- diagram_summary: exact description of the diagram, pictogram symbols, key, graph axes, or table values from the paper

Return the result as a JSON object with a single key "questions" containing an array.`;

  const extracted = await base44.integrations.Core.InvokeLLM({
    prompt,
    file_urls: [fileUrl],
    model: "automatic",
    response_json_schema: {
      type: "object",
      properties: {
        questions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              number: { type: "string" },
              stem: { type: "string" },
              text: { type: "string" },
              marks: { anyOf: [{ type: "number" }, { type: "null" }] },
              page_number: { type: "number" },
              has_diagram: { type: "boolean" },
              crop_box: { type: "array", items: { type: "number" } },
              diagram_summary: { type: "string" },
            },
            required: ["number", "text"],
          },
        },
      },
    },
  });
  return extracted?.questions || [];
}