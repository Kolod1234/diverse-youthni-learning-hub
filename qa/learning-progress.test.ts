import test from 'node:test';
import assert from 'node:assert/strict';
import topicCheck from '../base44/functions/topicCheck/entry.ts';
import scoreboard from '../base44/functions/publicScoreboardData/entry.ts';
import { allRows, topicSummary, bestTopicScores, qualificationTotals, publicIdentity, rankEntries, mergeReading, readingPosition, lessonsForPathway } from '../base44/shared/learningProgress.ts';
import { gradeTopicCheck, lessonFingerprint } from '../base44/shared/topicCheckCore.ts';

const attempt = (score, extra = {}) => ({ user_id: 'student', course_id: 'gcse', lesson_id: 'one', status: 'submitted', score, total: 20, ...extra });
test('70% boundary, best score only, lower and duplicate retakes', () => {
 assert.equal(topicSummary([attempt(13)]).passed, false);
 assert.equal(topicSummary([attempt(14)]).passed, true);
 const history = [attempt(14), attempt(14), attempt(10), attempt(17)];
 assert.deepEqual(topicSummary(history), { passed: true, ever_passed: true, best_percentage: 85, points: 85, attempts: 4 });
 assert.equal(bestTopicScores(history)[0].points, 85);
 assert.equal(topicSummary([...history, attempt(1)]).points, 85);
 assert.equal(topicSummary([attempt(20, { status: 'started' }), attempt(25)]).points, 0);
});
test('qualification separation and pagination retain older personal bests', async () => {
 const rows = Array.from({ length: 1101 }, (_, index) => attempt(index === 0 ? 20 : 1));
 const pages = [];
 const loaded = await allRows({ filter: async (_, sort, size, skip) => { pages.push(skip); return rows.slice(skip, skip + size); } });
 assert.deepEqual(pages, [0, 500, 1000]);
 const scores = bestTopicScores([...loaded, attempt(17, { course_id: 'alevel' }), attempt(12, { lesson_id: 'two' })]);
 assert.deepEqual(qualificationTotals(scores, [{ id: 'gcse', qualification_type: 'gcse' }, { id: 'alevel', qualification_type: 'alevel' }], 'student'), { gcse: 160, alevel: 85 });
});
test('public identity never falls back to a real name or email; ties share rank', async () => {
 const identity = await publicIdentity({ id: 'private-id', full_name: 'Private Real Name', email: 'private@example.test' });
 assert.match(identity.username, /^Learner-[a-f0-9]{8}$/);
 assert.deepEqual(Object.keys(identity).sort(), ['id', 'username']);
 assert.equal((await publicIdentity({ id: 'private-id', username: 'private@example.test' })).username, identity.username);
 assert.equal((await publicIdentity({ id: 'private-id', username: 'ScienceStar' })).username, 'ScienceStar');
 assert.deepEqual(rankEntries([{ id: 'a', username: 'Aaa', points: 85 }, { id: 'c', username: 'Ccc', points: 70 }, { id: 'b', username: 'Bbb', points: 85 }]).map(row => row.rank), [1, 1, 3]);
});
test('reading revisits preserve unique page coverage and restore the latest page', () => {
 const lesson = { slides: [{}, {}, {}] };
 const first = mergeReading(null, lesson, 0, '2026-09-21T10:00:00Z', false);
 const second = mergeReading(first, lesson, 2, '2026-09-21T10:01:00Z', false);
 const revisit = mergeReading(second, lesson, 0, '2026-09-21T10:02:00Z', true);
 assert.equal(revisit.total_slides_viewed, 2);
 assert.equal(revisit.completion_status, 'completed');
 assert.equal(revisit.first_viewed_at, first.first_viewed_at);
 assert.deepEqual(readingPosition([revisit], 3), { page_index: 0, pages_viewed: 2 });
 assert.equal(first.completion_status, 'in_progress');
});
test('math pathway completion excludes unrelated units', () => {
 const lessons = [{ id: 'common' }, { id: 'm1', ccea_units: ['M1'] }, { id: 'm4', ccea_units: ['M4'] }];
 assert.deepEqual(lessonsForPathway(lessons, { requires_math_pathway: true }, { math_pathway: 'm1_m5' }).map(x => x.id), ['common', 'm1']);
});
test('server workflow saves passes, progress and best-score rankings with isolated mock records', async () => {
 let current = { id: 'student', email: 'private@example.test', full_name: 'Private Real Name', username: 'ScienceStar', role: 'user' };
 const lesson = { id: 'one', course_id: 'gcse', order: 1, title: 'Topic one', slides: [{ content: 'A' }, { content: 'B' }] };
 const questions = Array.from({ length: 20 }, () => ({ question: 'A?', options: ['Yes', 'No'], correctAnswer: 0, explanation: 'A', concept: 'A', source_page: 1 }));
 const tables = {
 User: [current, { id: 'other', email: 'other@example.test', full_name: 'Other Real Name', role: 'user' }, { id: 'admin', role: 'admin', username: 'Staff' }],
 Course: [{ id: 'gcse', qualification_type: 'gcse' }, { id: 'alevel', qualification_type: 'alevel' }],
 Lesson: [lesson, { id: 'two', course_id: 'gcse', order: 2, title: 'Topic two', slides: [{}] }],
 Enrollment: [{ id: 'enrol', course_id: 'gcse', created_by_id: 'student', created_by: current.email, completed_lessons: [], progress_percent: 0 }],
 TopicCheckSet: [{ id: 'set', lesson_id: 'one', questions, fingerprint: await lessonFingerprint(lesson) }],
 TopicCheckAttempt: [], LessonProgress: [], UserProgress: []
 };
 let serial = 0;
 const entities = Object.fromEntries(Object.entries(tables).map(([name, rows]) => [name, {
  filter: async (where = {}, sort, limit = 500, skip = 0) => rows.filter(row => Object.entries(where).every(([key, value]) => row[key] === value)).slice(skip, skip + limit).map(row => ({ ...row })),
  get: async id => rows.find(row => row.id === id),
  create: async body => { const row = { id: name + (++serial), ...body }; rows.push(row); return { ...row }; },
  update: async (id, body) => { const row = rows.find(row => row.id === id); Object.assign(row, body); return { ...row }; }
 }]));
 globalThis.__testClient = { auth: { me: async () => current }, entities, asServiceRole: { entities } };
 const call = async (handler, body) => {
  const response = await handler(new Request('https://example.test/function', { method: 'POST', body: JSON.stringify(body) }));
  return { status: response.status, data: await response.json() };
 };
 const check = body => call(topicCheck, { lessonId: 'one', ...body });
 assert.equal((await check({ action: 'reading', pageIndex: 1 })).status, 200);
 assert.equal((await check({ action: 'reading_status' })).data.page_index, 1);
 assert.equal(tables.LessonProgress[0].completion_status, 'in_progress');
 const start = await check({ action: 'start', setId: 'set' });
 const answers = score => questions.map((_, i) => i < score ? 0 : 1);
 const submit = await check({ action: 'submit', attemptId: start.data.attempt_id, answers: answers(14) });
 assert.equal(submit.data.passed, true);
 assert.equal(submit.data.points, 70);
 assert.deepEqual(tables.Enrollment[0].completed_lessons, ['one']);
 assert.equal(tables.Enrollment[0].progress_percent, 50);
 assert.equal(tables.LessonProgress[0].completion_status, 'completed');
 const duplicate = await check({ action: 'submit', attemptId: start.data.attempt_id, answers: answers(20) });
 assert.equal(duplicate.data.points, 70);
 const lower = await check({ action: 'start', setId: 'set' });
 const lowerResult = await check({ action: 'submit', attemptId: lower.data.attempt_id, answers: answers(5) });
 assert.equal(lowerResult.data.passed, false);
 assert.equal(lowerResult.data.ever_passed, true);
 assert.equal(lowerResult.data.points, 70);
 const improve = await check({ action: 'start', setId: 'set' });
 assert.equal((await check({ action: 'submit', attemptId: improve.data.attempt_id, answers: answers(17) })).data.points, 85);
 tables.Lesson.unshift({ id: 'new-earlier', course_id: 'gcse', order: 0, slides: [{}] });
 assert.equal((await check({ action: 'access' })).data.allowed, true);
 tables.TopicCheckAttempt.push(attempt(18, { course_id: 'alevel' }), attempt(20, { user_id: 'admin' }), attempt(12, { user_id: 'other' }));
 const board = await call(scoreboard, { type: 'points', qualification: 'gcse' });
 assert.equal(board.status, 200);
 assert.equal(board.data.entries[0].points, 85);
 assert.equal(board.data.entries[0].username, 'ScienceStar');
 assert.equal(board.data.entries.length, 2);
 assert.deepEqual(board.data.totals, { gcse: 85, alevel: 90 });
 const publicJSON = JSON.stringify(board.data);
 assert.equal(/private@example|Private Real Name|Other Real Name|other@example/.test(publicJSON), false);
 assert.equal((await call(scoreboard, { type: 'points', qualification: 'alevel' })).data.entries[0].points, 90);
 current = tables.User[1];
 assert.equal((await check({ action: 'access' })).data.allowed, false);
 assert.equal((await check({ action: 'submit', attemptId: start.data.attempt_id, answers: answers(20) })).status, 403);
 current = null;
 assert.equal((await check({ action: 'status' })).status, 401);
});
