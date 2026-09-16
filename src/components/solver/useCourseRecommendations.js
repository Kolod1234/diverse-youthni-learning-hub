import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const categories = { Mathematics: "mathematics", Biology: "biology", Chemistry: "chemistry", Physics: "physics", "English Language": "english_language", "English Literature": "english_literature", History: "history", Geography: "geography", "Business Studies": "economics", Economics: "economics", "Religious Studies": "religious_studies", "ICT / Digital Technology": "digital_technology" };
const subjectTerms = {
  physics: ["acceleration", "circuit", "current", "energy", "force", "gravity", "mass", "momentum", "resistance", "scalar", "velocity", "voltage", "wave", "weight"],
  chemistry: ["acid", "alkali", "atom", "bond", "catalyst", "compound", "element", "ion", "molecule", "oxidation", "reaction"],
  biology: ["cell", "chromosome", "dna", "enzyme", "gene", "homeostasis", "magnification", "microscope", "microscopy", "organ", "organism", "photosynthesis", "respiration", "tissue"],
  mathematics: ["algebra", "angle", "equation", "fraction", "gradient", "polygon", "probability", "quadratic", "ratio", "theorem"],
};
const words = (text) => (text || "").toLowerCase().match(/[a-z]{4,}/g) || [];
const inferredCategory = (solution) => {
  const selectedCategory = categories[solution.subject];
  if (selectedCategory && selectedCategory !== "mathematics") return selectedCategory;

  const content = new Set(words(`${solution.question} ${solution.answer}`));
  const scores = Object.entries(subjectTerms).map(([category, terms]) => [category, terms.filter(term => content.has(term)).length]);
  const [category, score] = scores.sort((a, b) => b[1] - a[1])[0];
  if (selectedCategory === "mathematics" && category !== "mathematics" && score >= 2) return category;
  return selectedCategory || (score >= 2 ? category : undefined);
};

export default function useCourseRecommendations(solution) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const load = async () => {
      const category = inferredCategory(solution);
      const qualification_type = solution.qualification === "GCSE" ? "gcse" : "alevel";
      const found = category ? await base44.entities.Course.filter({ category, qualification_type }, "-is_featured", 50) : [];
      const target = new Set(words(`${solution.question} ${solution.answer}`).filter(w => w.length > 4));
      const ranked = found.map(course => {
        const searchable = words(`${course.title} ${course.description} ${(course.tags || []).join(" ")}`);
        return { ...course, matchScore: searchable.reduce((score, word) => score + (target.has(word) ? 1 : 0), 0) };
      }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
      if (active) { setCourses(ranked); setLoading(false); }
    };
    load(); return () => { active = false; };
  }, [solution.answerKey, solution.subject, solution.qualification, solution.question]);
  return { courses, loading };
}