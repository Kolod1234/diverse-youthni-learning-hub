// Builds the LHS A2 5 "Genetics, Stem Cell Research and Cloning" chapter (CCEA
// Unit A2 5) in both the Single Award A2 and Double Award A2 Life and Health
// Sciences courses. Figures are eleven custom diagrams rendered into
// public/lesson-assets/lhs-a2 by scripts/lhs-a25-genetics/render-diagrams.cjs.
// The validation and publishing pipeline lives in base44/shared/lhsLessonBuild.ts.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'a25-dna-structure.png',
  'a25-protein-synthesis.png',
  'a25-meiosis.png',
  'a25-mendel-monohybrid.png',
  'a25-blood-groups.png',
  'a25-pedigree.png',
  'a25-karyotype.png',
  'a25-pcr-gel.png',
  'a25-screening.png',
  'a25-stem-cells.png',
  'a25-scnt.png',
];

const FIGURE_URLS = Object.fromEntries(
  FIGURES.map((f) => [f, '/lesson-assets/lhs-a2/' + f]),
);

const COURSES = [
  { id: '698a3d721a8a90bcc13737e7', order: 10 }, // Single Award A2
  { id: '698a3d721a8a90bcc13737e9', order: 10 }, // Double Award A2
];

const LESSON_META = {
  title: 'Genetics, Stem Cell Research and Cloning',
  description:
    'The instruction manual inside every cell, and what happens when we learn to read, copy and rewrite it. DNA as a double helix of complementary base pairs, nucleotides, genes and alleles, and the 46 chromosomes of a human body cell. The genetic code as a triplet, degenerate, near-universal system, and how transcription to mRNA and translation at the ribosome turn a gene into a polypeptide. Meiosis halving the chromosome number and shuffling it through crossing over and independent assortment, with fertilisation restoring the diploid count. Monohybrid inheritance with Punnett squares and the 3:1 ratio, codominance and multiple alleles through the ABO blood groups, sex determination, and sex linkage with haemophilia and colour blindness read through pedigrees. Gene and chromosome mutations, non-disjunction, trisomy 21 and the karyotype. PCR with primers and Taq polymerase at $2^n$ copies per cycle, gel electrophoresis sorting DNA by size towards the positive electrode, and DNA profiles. Genetic screening of carriers, fetuses, newborns and adults, and the non-directive, confidential practice of genetic counselling. Stem cells from totipotent zygote to pluripotent blastocyst to multipotent adult marrow and reprogrammed iPS cells, with marrow transplants as routine therapy. Cloning by somatic cell nuclear transfer, Dolly, and the line between therapeutic and reproductive use. Aligned to CCEA GCE Life and Health Sciences Unit A2 5.',
  learning_objectives: [
    'Describe the structure of DNA as a double helix of nucleotides, explain complementary base pairing of A with T and G with C, and distinguish genes, alleles and chromosomes',
    'Explain the genetic code as triplet, degenerate and near-universal, and describe transcription of a gene into mRNA and its translation into a polypeptide at the ribosome',
    'Describe meiosis, explaining how crossing over and independent assortment produce genetic variation in haploid gametes and how fertilisation restores the diploid number',
    'Predict monohybrid inheritance outcomes with genetic diagrams and Punnett squares, giving genotype and phenotype ratios and interpreting them as probabilities',
    'Explain codominance and multiple alleles using the ABO blood group system, and explain sex determination by the X and Y chromosomes',
    'Explain sex-linked inheritance, including X-linked recessive conditions such as haemophilia and colour blindness, and deduce genotypes from pedigree analysis',
    'Distinguish gene mutations from chromosome mutations, explain non-disjunction and trisomy 21, and read a karyotype',
    'Explain how PCR amplifies DNA and how gel electrophoresis separates fragments by size, giving the basis of DNA profiling',
    'Describe carrier, prenatal, newborn and predictive genetic screening and explain the non-directive and confidential principles of genetic counselling',
    'Explain stem cell potency from totipotent to pluripotent to multipotent, compare embryonic, adult, cord blood and iPS cell sources with their uses and issues, and describe somatic cell nuclear transfer in reproductive and therapeutic cloning',
  ],
  content_type: 'richtext',
  section: 'CCEA Unit A2 5: Genetics, Stem Cell Research and Cloning',
};

export default async function (req) {
  // The chapter sits directly after the A2 5 unit guide, at order 10. On first
  // publish, every existing lesson at order 10 or above is pushed one place
  // later. This is idempotent: once the chapter exists the shift is skipped,
  // so re-running the builder only updates content.
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }
  for (const c of COURSES) {
    const existing = await base44.entities.Lesson.filter({
      course_id: c.id,
      title: LESSON_META.title,
    });
    if (existing.length > 0) continue;
    const later = await base44.entities.Lesson.filter({
      course_id: c.id,
      order: { $gte: 10 },
    });
    if (later.length > 0) {
      await base44.entities.Lesson.bulkUpdate(
        later.map((l) => ({ id: l.id, order: l.order + 1 })),
      );
    }
  }
  return handleLhsChapterRequest(req, {
    figureUrls: FIGURE_URLS,
    courses: COURSES,
    meta: LESSON_META,
    pages: [...PAGES_1, ...PAGES_2, ...PAGES_3, ...PAGES_4],
  });
}