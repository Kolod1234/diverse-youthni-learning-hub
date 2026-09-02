import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const manager = await readFile('src/pages/TutorCourseManager.jsx', 'utf8');
const dashboard = await readFile('src/pages/TutorDashboard.jsx', 'utf8');

assert.match(
  manager,
  /component="a"[\s\S]{0,180}href=\{`\$\{createPageUrl\('LessonPlayerClassic'\)\}\?lesson=\$\{lesson\.id\}&course=\$\{courseId\}`\}/,
  'The tutor preview eye must render a genuine link to LessonPlayerClassic.'
);

assert.match(
  manager,
  /aria-label=\{lesson\.slides\?\.length \? `Preview \$\{lesson\.title\} in the lesson player`/,
  'The preview link must have a lesson-specific accessible name.'
);

assert.doesNotMatch(
  dashboard,
  /<Link to=\{createPageUrl\('TutorCourseManager'\)[\s\S]{0,240}<Button/,
  'The tutor pathway must not nest a button inside a link.'
);

assert.match(
  dashboard,
  /<Button component="a" href=\{createPageUrl\('TutorCourseManager'\) \+ `\?courseId=\$\{course\.id\}`\}/,
  'Manage course must be a genuine link in the tutor pathway.'
);

console.log('Tutor preview and course-management links are structurally valid.');

