// Re-export of reader typography primitives.
// The actual styles live in CourseReaderShell so they stay scoped to
// `.reader-prose` and never leak into editor chrome or serialized slide.content.
// This file exists so other modules can import typography primitives by a
// stable name without coupling to the full shell.
export {
  ReaderArticle,
  ReaderBand,
  ReaderMediaCard,
  ConceptNumberCard,
  NextLessonButton,
} from './CourseReaderShell';