import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Card, Checkbox, Chip, Container, FormControlLabel, LinearProgress, MenuItem, Stack,
  Step, StepLabel, Stepper, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

// Partner Schools ("buddy system") — PREVIEW of the next phase, built from the Partner Schools wireframes.
// Each screen is its own page (src/pages/Partner*.jsx); this file holds the screens and the shared frame.
// Everything here is sample data held in this page only: nothing is read from or written to the database.

const NAVY = '#0b2f5c';
const SAMPLE_SCHOOLS = [
  { id: 'shs', name: 'Sample High School', type: 'School', admin: 'Head of Year 11', seats: 50, used: 38, until: '31 Aug 2027', status: 'Active' },
  { id: 'sac', name: 'Sample After-School Centre', type: 'After-school centre', admin: 'Centre manager', seats: 40, used: 26, until: '31 Aug 2027', status: 'Active' },
  { id: 'syc', name: 'Sample Youth Club', type: 'Youth organisation', admin: 'Club leader', seats: 30, used: 10, until: '31 Mar 2027', status: 'Trial' },
];
const SAMPLE_CODES = [
  { code: 'SHS-7K2Q', school: 'Sample High School', status: 'Used', by: 'Student A', date: '2 Oct' },
  { code: 'SHS-M9XA', school: 'Sample High School', status: 'Unused', by: '—', date: '2 Oct' },
  { code: 'SAC-4TRB', school: 'Sample After-School Centre', status: 'Used', by: 'Student F', date: '28 Sep' },
  { code: 'SAC-P8LD', school: 'Sample After-School Centre', status: 'Unused', by: '—', date: '28 Sep' },
  { code: 'SYC-W3VN', school: 'Sample Youth Club', status: 'Cancelled', by: '—', date: '20 Sep' },
  { code: 'SHS-Q1ZE', school: 'Sample High School', status: 'Unused', by: '—', date: '2 Oct' },
];
const SAMPLE_STUDENTS = [
  { name: 'Student A', cls: '11B', course: 'CCEA GCSE Mathematics', pct: 62, last: 'Today' },
  { name: 'Student B', cls: '11B', course: 'CCEA GCSE Mathematics', pct: 41, last: 'Yesterday' },
  { name: 'Student C', cls: '11C', course: 'CCEA GCSE Physics', pct: 35, last: '3 days ago' },
  { name: 'Student D', cls: '11C', course: 'CCEA GCSE Physics', pct: 18, last: 'Last week' },
  { name: 'Student E', cls: '11B', course: 'CCEA GCSE Mathematics', pct: 77, last: 'Today' },
];
const SAMPLE_CLASSES = [
  { name: '11B Maths', course: 'CCEA GCSE Mathematics', teacher: 'Maths teacher', count: 18, pct: 54 },
  { name: '11C Physics', course: 'CCEA GCSE Physics', teacher: 'Science teacher', count: 14, pct: 31 },
  { name: 'After-school English', course: 'CCEA GCSE English Language', teacher: 'English teacher', count: 6, pct: 22 },
];
const COURSES = ['CCEA GCSE Mathematics', 'CCEA GCSE Physics', 'CCEA GCSE English Language', 'Youth Work Level 2'];

export const VIEWS = [
  { group: 'Admin', id: 'schools', page: 'PartnerSchools', label: 'Partner schools' },
  { group: 'Admin', id: 'school', page: 'PartnerSchoolSeats', label: 'School seats' },
  { group: 'Admin', id: 'codes', page: 'PartnerSeatCodes', label: 'Seat codes' },
  { group: 'Admin', id: 'requests', page: 'PartnerSeatRequests', label: 'Requests & sponsors' },
  { group: 'School', id: 'setup', page: 'PartnerSchoolSetup', label: 'First-time setup' },
  { group: 'School', id: 'dashboard', page: 'PartnerSchoolDashboard', label: 'School dashboard' },
  { group: 'School', id: 'invite', page: 'PartnerInviteStudents', label: 'Invite students' },
  { group: 'School', id: 'classes', page: 'PartnerClasses', label: 'Classes' },
  { group: 'Student', id: 'join', page: 'PartnerJoinSchool', label: 'Join your school' },
];
export const PARTNER_PAGES = VIEWS.map(v => v.page);
export const PARTNER_ADMIN_PAGES = VIEWS.filter(v => v.group === 'Admin').map(v => v.page);

// go('school') opens that screen's own page.
export function usePartnerGo() {
  const navigate = useNavigate();
  return (id) => { const v = VIEWS.find(x => x.id === id); if (v) { navigate(createPageUrl(v.page)); window.scrollTo(0, 0); } };
}

const previewOnly = () => toast.info('Preview only: this will work when Partner Schools launches.');
const randomCode = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

function Stat({ label, value }) {
  return (
    <Card sx={{ p: 2.5 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography sx={{ fontSize: 30, fontWeight: 700, mt: 0.5 }}>{value}</Typography>
    </Card>
  );
}
function StatRow({ items }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: `repeat(${items.length}, 1fr)` }, gap: 2 }}>
      {items.map(([l, v]) => <Stat key={l} label={l} value={v} />)}
    </Box>
  );
}
function PageHead({ kicker, title, text, action }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <Box>
        {kicker && <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary' }}>{kicker}</Typography>}
        <Typography variant="h4" component="h1" fontWeight={700}>{title}</Typography>
        {text && <Typography color="text.secondary" sx={{ mt: 0.5 }}>{text}</Typography>}
      </Box>
      {action}
    </Box>
  );
}
function Table({ head, rows }) {
  return (
    <Card sx={{ overflowX: 'auto' }}>
      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 14,
        '& th': { textAlign: 'left', color: 'text.secondary', fontWeight: 500, py: 1.25, px: 2, borderBottom: 1, borderColor: 'divider', whiteSpace: 'nowrap' },
        '& td': { py: 1.5, px: 2, borderBottom: 1, borderColor: 'divider' }, '& tr:last-of-type td': { borderBottom: 0 } }}>
        <thead><tr>{head.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows}</tbody>
      </Box>
    </Card>
  );
}
const statusColor = (s) => (s === 'Active' || s === 'Used' ? 'success' : s === 'Cancelled' ? 'default' : s === 'Trial' || s === 'Unused' ? 'warning' : 'default');

// ── Admin views ────────────────────────────────────────────────────────────────
export function SchoolsView({ go }) {
  const [adding, setAdding] = useState(false);
  const totals = SAMPLE_SCHOOLS.reduce((t, s) => ({ seats: t.seats + s.seats, used: t.used + s.used }), { seats: 0, used: 0 });
  return (
    <Stack spacing={3}>
      <PageHead kicker="ADMIN · PEOPLE" title="Partner schools" text="Give schools and after-school centres their own space and a number of free seats."
        action={<Button variant="contained" onClick={() => setAdding(a => !a)}>+ Add partner school</Button>} />
      {adding && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>New partner school</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField label="School or centre name" placeholder="[School name]" />
            <TextField select label="Type" defaultValue="School">{['School', 'After-school centre', 'Youth organisation'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField>
            <TextField label="School admin email" placeholder="head.of.year@school.org" />
            <TextField label="Seat allowance" placeholder="50" />
            <TextField label="Seats valid until" placeholder="31 Aug 2027" />
            <TextField label="Sponsor (optional)" placeholder="[Sponsor name]" />
          </Box>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => { previewOnly(); setAdding(false); }}>Create school and email the admin</Button>
            <Button onClick={() => setAdding(false)}>Cancel</Button>
          </Stack>
        </Card>
      )}
      <StatRow items={[['Partner schools', SAMPLE_SCHOOLS.length], ['Seats given out', totals.seats], ['Seats in use', totals.used], ['Codes not yet used', totals.seats - totals.used]]} />
      <Table head={['School', 'Type', 'Seats in use', 'Valid until', 'Status', '']} rows={SAMPLE_SCHOOLS.map(s => (
        <tr key={s.id}>
          <td><strong>{s.name}</strong><br /><Typography variant="caption" color="text.secondary">Admin: {s.admin}</Typography></td>
          <td>{s.type}</td>
          <td style={{ minWidth: 150 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LinearProgress variant="determinate" value={(s.used / s.seats) * 100} sx={{ flex: 1, height: 6, borderRadius: 3 }} />{s.used}/{s.seats}</Box></td>
          <td>{s.until}</td>
          <td><Chip size="small" label={s.status} color={statusColor(s.status)} variant="outlined" /></td>
          <td><Button size="small" onClick={() => go('school')}>Open</Button></td>
        </tr>
      ))} />
    </Stack>
  );
}

export function SchoolSeatsView({ go }) {
  const [codes, setCodes] = useState([]);
  const s = SAMPLE_SCHOOLS[0];
  return (
    <Stack spacing={3}>
      <Button onClick={() => go('schools')} sx={{ alignSelf: 'flex-start' }}>← Partner schools</Button>
      <PageHead title={s.name} text={`${s.type} · Admin: ${s.admin} · Sponsor: [Sponsor name]`}
        action={<Button variant="outlined" onClick={() => go('dashboard')}>View as the school sees it</Button>} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' }, gap: 3 }}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700}>Seats</Typography>
          <Typography sx={{ mt: 1 }}><Box component="span" sx={{ fontSize: 30, fontWeight: 700 }}>{s.used}</Box> of {s.seats} in use · valid until {s.until}</Typography>
          <LinearProgress variant="determinate" value={(s.used / s.seats) * 100} sx={{ my: 2, height: 8, borderRadius: 4 }} />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="contained" onClick={() => setCodes(Array.from({ length: 5 }, () => randomCode('SHS')))}>Generate 5 seat codes</Button>
            <Button variant="outlined" onClick={previewOnly}>Change allowance</Button>
            <Button variant="outlined" color="error" onClick={previewOnly}>Pause school</Button>
          </Stack>
          {codes.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>New codes (each works once) — sample only:</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>{codes.map(c => <Chip key={c} label={c} sx={{ fontFamily: 'monospace', fontWeight: 700 }} />)}</Stack>
              <Typography variant="caption" color="text.secondary">Download as a sheet to hand out in class.</Typography>
            </Box>
          )}
        </Card>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Courses this school can use</Typography>
          {COURSES.map((c, i) => <FormControlLabel key={c} control={<Checkbox defaultChecked={i < 3} />} label={c} sx={{ display: 'flex' }} />)}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Lessons stay shared: you write a lesson once, every school gets it.</Typography>
        </Card>
      </Box>
    </Stack>
  );
}

export function SeatCodesView({ go }) {
  const [filter, setFilter] = useState('All');
  const rows = SAMPLE_CODES.filter(c => filter === 'All' || c.status === filter);
  return (
    <Stack spacing={3}>
      <Button onClick={() => go('schools')} sx={{ alignSelf: 'flex-start' }}>← Partner schools</Button>
      <PageHead title="Seat codes" text="Every code across all schools. A code works once and can be cancelled before it's used."
        action={<Button variant="outlined" onClick={previewOnly}>Export to spreadsheet</Button>} />
      <Tabs value={filter} onChange={(_, v) => setFilter(v)} variant="scrollable" allowScrollButtonsMobile>
        {['All', 'Unused', 'Used', 'Cancelled'].map(f => <Tab key={f} value={f} label={f} />)}
      </Tabs>
      <Table head={['Code', 'School', 'Status', 'Used by', 'Created', '']} rows={rows.map(r => (
        <tr key={r.code}>
          <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{r.code}</td><td>{r.school}</td>
          <td><Chip size="small" label={r.status} color={statusColor(r.status)} variant="outlined" /></td><td>{r.by}</td><td>{r.date}</td>
          <td>{r.status === 'Unused' && <Button size="small" color="error" onClick={previewOnly}>Cancel code</Button>}</td>
        </tr>
      ))} />
    </Stack>
  );
}

export function RequestsView({ go }) {
  const [results, setResults] = useState({});
  const requests = [
    { id: 1, school: 'Sample High School', text: 'Asks for 20 more seats for a new Year 10 group.' },
    { id: 2, school: 'Sample Youth Club', text: 'Asks to move from Trial to Active with 30 seats.' },
  ];
  return (
    <Stack spacing={3}>
      <Button onClick={() => go('schools')} sx={{ alignSelf: 'flex-start' }}>← Partner schools</Button>
      <PageHead title="Seat requests & sponsors" />
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Requests waiting for you</Typography>
        {requests.map(r => (
          <Box key={r.id} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderTop: 1, borderColor: 'divider' }}>
            <Box><Typography fontWeight={700}>{r.school}</Typography><Typography variant="body2" color="text.secondary">{r.text}</Typography></Box>
            {results[r.id]
              ? <Chip label={results[r.id]} color={results[r.id] === 'Approved' ? 'success' : 'default'} />
              : <Stack direction="row" spacing={1}>
                  <Button variant="contained" onClick={() => setResults(x => ({ ...x, [r.id]: 'Approved' }))}>Approve</Button>
                  <Button variant="outlined" onClick={() => setResults(x => ({ ...x, [r.id]: 'Declined' }))}>Decline</Button>
                </Stack>}
          </Box>
        ))}
      </Card>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>Sponsors</Typography>
        <Button variant="outlined" onClick={previewOnly}>+ Add sponsor</Button>
      </Box>
      <Table head={['Sponsor', 'Schools funded', 'Seats funded', 'Ends']} rows={[
        <tr key="1"><td>[Sponsor 1]</td><td>2</td><td>90</td><td>31 Aug 2027</td></tr>,
        <tr key="2"><td>[Sponsor 2]</td><td>1</td><td>30</td><td>31 Mar 2027</td></tr>,
      ]} />
    </Stack>
  );
}

// ── School views ───────────────────────────────────────────────────────────────
export function SetupView({ go }) {
  const [step, setStep] = useState(0);
  const steps = ['School details', 'Teachers', 'Courses', 'Invite students'];
  return (
    <Stack spacing={3} sx={{ maxWidth: 820 }}>
      <PageHead title="Welcome, let's set up your school" text="Four short steps. You can change everything later." />
      <Stepper activeStep={step} alternativeLabel>{steps.map(s => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}</Stepper>
      <Card sx={{ p: 3 }}>
        {step === 0 && <Stack spacing={2}><Typography variant="h6" fontWeight={700}>1. Check your school details</Typography>
          <TextField label="School name" defaultValue="Sample High School" /><TextField label="Town" placeholder="[Town]" />
          <Typography variant="body2" color="text.secondary">Your allowance: 50 seats, valid until 31 Aug 2027.</Typography></Stack>}
        {step === 1 && <Stack spacing={2}><Typography variant="h6" fontWeight={700}>2. Add your teachers</Typography>
          <Typography variant="body2" color="text.secondary">Teachers see only the classes you give them.</Typography>
          <TextField label="Teacher emails (one per line)" multiline rows={4} placeholder="maths.teacher@school.org" /></Stack>}
        {step === 2 && <Stack><Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>3. Pick the courses your students will use</Typography>
          {COURSES.slice(0, 3).map((c, i) => <FormControlLabel key={c} control={<Checkbox defaultChecked={i < 2} />} label={c} />)}</Stack>}
        {step === 3 && <Stack spacing={1}><Typography variant="h6" fontWeight={700}>4. Invite your students</Typography>
          <Typography color="text.secondary">Print a code sheet, send email invites or upload a class list.</Typography>
          <Button variant="contained" sx={{ alignSelf: 'flex-start' }} onClick={() => go('invite')}>Go to Invite students</Button></Stack>}
        <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
          <Button disabled={step === 0} onClick={() => setStep(s => s - 1)}>Back</Button>
          {step < 3 ? <Button variant="contained" onClick={() => setStep(s => s + 1)}>Next</Button>
            : <Button variant="contained" onClick={() => go('dashboard')}>Finish</Button>}
        </Stack>
      </Card>
    </Stack>
  );
}

export function SchoolDashboardView({ go }) {
  const [tab, setTab] = useState('students');
  return (
    <Stack spacing={3}>
      <PageHead kicker="SAMPLE HIGH SCHOOL" title="School dashboard" text="Only your school's students and results are shown here."
        action={<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button variant="outlined" onClick={() => go('classes')}>Classes</Button>
          <Button variant="contained" onClick={() => go('invite')}>+ Invite students</Button></Stack>} />
      <StatRow items={[['Seats used', '38 / 50'], ['Active this week', 29], ['Lessons completed', 412], ['Average quiz score', '68%']]} />
      <Tabs value={tab} onChange={(_, v) => setTab(v)}><Tab value="students" label="Students" /><Tab value="reports" label="Reports" /></Tabs>
      {tab === 'students' ? (
        <Table head={['Student', 'Class', 'Course', 'Progress', 'Last active']} rows={SAMPLE_STUDENTS.map(s => (
          <tr key={s.name}><td>{s.name}</td><td>{s.cls}</td><td>{s.course}</td>
            <td style={{ minWidth: 140 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LinearProgress variant="determinate" value={s.pct} sx={{ flex: 1, height: 6, borderRadius: 3 }} />{s.pct}%</Box></td><td>{s.last}</td></tr>
        ))} />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {COURSES.slice(0, 3).map((c, i) => (
            <Card key={c} sx={{ p: 2.5 }}><Typography fontWeight={700}>{c}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Average progress</Typography>
              <LinearProgress variant="determinate" value={[54, 31, 22][i]} sx={{ height: 8, borderRadius: 4 }} />
              <Button size="small" sx={{ mt: 1.5 }} onClick={previewOnly}>Download report</Button></Card>
          ))}
        </Box>
      )}
    </Stack>
  );
}

export function InviteView({ go }) {
  const [tab, setTab] = useState('codes');
  return (
    <Stack spacing={3} sx={{ maxWidth: 900 }}>
      <Button onClick={() => go('dashboard')} sx={{ alignSelf: 'flex-start' }}>← School dashboard</Button>
      <PageHead title="Invite students" action={<Chip label="12 seats left of 50" color="primary" variant="outlined" />} />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile>
        <Tab value="codes" label="Code sheet" /><Tab value="email" label="Email invites" /><Tab value="upload" label="Upload a class list" />
      </Tabs>
      <Card sx={{ p: 3 }}>
        {tab === 'codes' && <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>Print a code sheet</Typography>
          <Typography color="text.secondary">Best for a classroom: each slip has one code and simple joining steps.</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField label="How many codes?" defaultValue="10" />
            <TextField select label="Put them in class (optional)" defaultValue="11B Maths">{['11B Maths', '11C Physics', 'No class yet'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
            {['SHS-7K2Q', 'SHS-M9XA'].map(c => (
              <Box key={c} sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 20 }}>{c}</Typography>
                <Typography variant="body2" color="text.secondary">Go to diverseyouthnilearning.com → Join your school → enter this code.</Typography>
              </Box>
            ))}
          </Box>
          <Button variant="contained" sx={{ alignSelf: 'flex-start' }} onClick={previewOnly}>Download printable sheet (PDF)</Button>
        </Stack>}
        {tab === 'email' && <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>Send email invites</Typography>
          <TextField label="Student emails (one per line)" multiline rows={6} placeholder="student@school.org" />
          <Typography variant="body2" color="text.secondary">Each email holds a personal join link. Unused invites expire after 14 days and the seat returns to you.</Typography>
          <Button variant="contained" sx={{ alignSelf: 'flex-start' }} onClick={previewOnly}>Send invites</Button>
        </Stack>}
        {tab === 'upload' && <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>Upload a class list</Typography>
          <Typography color="text.secondary">A spreadsheet with columns: first name, last name, email, class.</Typography>
          <Button variant="outlined" sx={{ alignSelf: 'flex-start' }} onClick={previewOnly}>Choose spreadsheet</Button>
        </Stack>}
      </Card>
    </Stack>
  );
}

export function ClassesView({ go }) {
  const [adding, setAdding] = useState(false);
  return (
    <Stack spacing={3}>
      <Button onClick={() => go('dashboard')} sx={{ alignSelf: 'flex-start' }}>← School dashboard</Button>
      <PageHead title="Classes" text="Group students, give each group a teacher and a course."
        action={<Button variant="contained" onClick={() => setAdding(a => !a)}>+ New class</Button>} />
      {adding && (
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            <TextField label="Class name" placeholder="11A Maths" />
            <TextField select label="Teacher" defaultValue="Maths teacher">{['Maths teacher', 'Science teacher'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField>
            <TextField select label="Course" defaultValue={COURSES[0]}>{COURSES.slice(0, 2).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField>
          </Box>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => { previewOnly(); setAdding(false); }}>Create class</Button>
        </Card>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {SAMPLE_CLASSES.map(c => (
          <Card key={c.name} sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700}>{c.name}</Typography>
            <Typography variant="body2">{c.course}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Teacher: {c.teacher} · {c.count} students</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LinearProgress variant="determinate" value={c.pct} sx={{ flex: 1, height: 6, borderRadius: 3 }} /><Typography variant="body2">{c.pct}%</Typography></Box>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}><Button size="small" onClick={previewOnly}>Open as teacher</Button><Button size="small" onClick={previewOnly}>Edit class</Button></Stack>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}

// ── Student view ───────────────────────────────────────────────────────────────
export function JoinView() {
  const [code, setCode] = useState('');
  const [state, setState] = useState(null);
  const check = () => {
    const c = code.trim().toUpperCase();
    if (!/^[A-Z]{3}-[A-Z0-9]{4}$/.test(c)) return setState({ type: 'error', text: "That doesn't look like a school code. Codes look like SHS-7K2Q." });
    const known = SAMPLE_CODES.find(x => x.code === c);
    if (known?.status === 'Used') return setState({ type: 'warning', text: 'This code has already been used. Ask your teacher for a new one.' });
    if (known?.status === 'Cancelled') return setState({ type: 'warning', text: 'This code was cancelled by your school. Ask your teacher for a new one.' });
    setState({ type: 'success', text: `You'd join ${known?.school || 'Sample High School'} and see its courses on My learning. (Preview: nothing has been saved.)` });
  };
  return (
    <Stack spacing={3} sx={{ maxWidth: 560, mx: 'auto', textAlign: 'center' }}>
      <PageHead title="Join your school" text="Type the code your teacher gave you." />
      <Card sx={{ p: 3 }}>
        <TextField fullWidth label="School code" placeholder="SHS-7K2Q" value={code} onChange={e => setCode(e.target.value)}
          inputProps={{ style: { textAlign: 'center', fontFamily: 'monospace', fontSize: 22, letterSpacing: 2 } }} />
        <Button fullWidth variant="contained" size="large" sx={{ mt: 2 }} onClick={check}>Join</Button>
        {state && <Alert severity={state.type} sx={{ mt: 2, textAlign: 'left' }}>{state.text}</Alert>}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>Try SHS-M9XA (works), SHS-7K2Q (already used) or SYC-W3VN (cancelled).</Typography>
      </Card>
    </Stack>
  );
}

// The frame every Partner Schools page shares: the preview banner and links to the other screens.
export function PartnerShell({ current, children }) {
  const go = usePartnerGo();
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 3, p: 2, borderRadius: '14px', bgcolor: NAVY, color: '#fff', display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
        <Box component="span" sx={{ px: 1.5, py: 0.25, borderRadius: 999, bgcolor: '#fbbf24', color: '#1a1a1a', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Coming soon · preview</Box>
        <Typography sx={{ flex: '1 1 320px' }}>Partner Schools is the next phase. These screens use <strong>sample data</strong> and nothing you do here is saved.</Typography>
      </Box>
      <Box component="nav" aria-label="Partner Schools screens" sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {['Admin', 'School', 'Student'].map(group => (
          <Box key={group} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary', mr: 0.5 }}>{group.toUpperCase()}</Typography>
            {VIEWS.filter(v => v.group === group).map(v => (
              <Chip key={v.id} label={v.label} clickable onClick={() => go(v.id)} aria-current={current === v.id ? 'page' : undefined}
                color={current === v.id ? 'primary' : 'default'} variant={current === v.id ? 'filled' : 'outlined'} />
            ))}
          </Box>
        ))}
      </Box>
      {children}
    </Container>
  );
}
