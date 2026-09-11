const template = (id, category, label, source, fields) => ({id, category, label, source, fields});
export const SCIENCE_TEMPLATES = [
  template('fraction','Algebra','Fraction',String.raw`\frac{<<top>>}{<<bottom>>}`, [['top','Numerator','x+1'],['bottom','Denominator','x-1']]),
  template('power','Algebra','Power',String.raw`{<<base>>}^{<<power>>}`, [['base','Base','x'],['power','Exponent','2']]),
  template('scientific','Algebra','Scientific notation',String.raw`<<coefficient>>\times 10^{<<power>>}`, [['coefficient','Coefficient','3'],['power','Exponent','8']]),
  template('root','Algebra','Root',String.raw`\sqrt[<<degree>>]{<<value>>}`, [['degree','Root degree','3'],['value','Expression','x+1']]),
  template('quadratic','Algebra','Quadratic formula',String.raw`x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}`, []),
  template('piecewise','Algebra','Piecewise function',String.raw`f(x)=\begin{cases}<<first>>&<<condition1>>\\<<second>>&<<condition2>>\end{cases}`, [['first','First expression','x^2'],['condition1','First condition','x\\ge 0'],['second','Second expression','-x'],['condition2','Second condition','x<0']]),
  template('derivative','Calculus','Differentiation',String.raw`\frac{\mathrm{d}^{<<order>>}}{\mathrm{d}<<variable>>^{<<order>>}}\left(<<expression>>\right)`, [['order','Order','1'],['variable','Variable','x'],['expression','Expression','x^3']]),
  template('partial','Calculus','Partial derivative',String.raw`\frac{\partial <<function>>}{\partial <<variable>>}`, [['function','Function','f'],['variable','Variable','x']]),
  template('integral','Calculus','Definite integral',String.raw`\int_{<<lower>>}^{<<upper>>} <<expression>>\,\mathrm{d}<<variable>>`, [['lower','Lower limit','0'],['upper','Upper limit','1'],['expression','Integrand','x^2'],['variable','Variable','x']]),
  template('indefinite','Calculus','Indefinite integral',String.raw`\int <<expression>>\,\mathrm{d}<<variable>>`, [['expression','Integrand','\\cos x'],['variable','Variable','x']]),
  template('doubleintegral','Calculus','Double integral',String.raw`\iint_{<<domain>>} <<expression>>\,\mathrm{d}A`, [['domain','Domain','D'],['expression','Integrand','f(x,y)']]),
  template('limit','Calculus','Limit',String.raw`\lim_{<<variable>>\to <<value>>}<<expression>>`, [['variable','Variable','x'],['value','Approaches','0'],['expression','Expression','\\frac{\\sin x}{x}']]),
  template('sum','Calculus','Summation',String.raw`\sum_{<<index>>=<<lower>>}^{<<upper>>}<<expression>>`, [['index','Index','n'],['lower','Start','1'],['upper','End','\\infty'],['expression','Term','\\frac{1}{n^2}']]),
  template('product','Calculus','Product',String.raw`\prod_{<<index>>=<<lower>>}^{<<upper>>}<<expression>>`, [['index','Index','k'],['lower','Start','1'],['upper','End','n'],['expression','Term','k']]),
  template('matrix','Matrices & vectors','Matrix','', []),
  template('determinant','Matrices & vectors','Determinant','', []),
  template('vector','Matrices & vectors','Column vector',String.raw`\begin{pmatrix}<<x>>\\<<y>>\\<<z>>\end{pmatrix}`, [['x','First component','x'],['y','Second component','y'],['z','Third component','z']]),
  template('dot','Matrices & vectors','Dot and cross products',String.raw`\vec{a}\cdot\vec{b}=ab\cos\theta\qquad\vec{a}\times\vec{b}`, []),
  template('inverse','Matrices & vectors','Inverse and transpose',String.raw`A^{-1}\qquad A^{\mathsf{T}}\qquad \det(A)`, []),
  template('sets','Sets & logic','Set operations',String.raw`<<a>>\cup <<b>>\qquad <<a>>\cap <<b>>\qquad <<a>>\setminus <<b>>`, [['a','First set','A'],['b','Second set','B']]),
  template('membership','Sets & logic','Membership and subsets',String.raw`x\in A\qquad x\notin B\qquad A\subseteq B\qquad\varnothing`, []),
  template('setbuilder','Sets & logic','Set builder',String.raw`\left\{<<variable>>\in <<domain>>\mid <<condition>>\right\}`, [['variable','Variable','x'],['domain','Domain','\\mathbb{R}'],['condition','Condition','x>0']]),
  template('logic','Sets & logic','Logic and quantifiers',String.raw`\forall x\;P(x)\implies Q(x)\qquad\exists y\;P(y)\land Q(y)`, []),
  template('probability','Probability & statistics','Conditional probability',String.raw`P(<<a>>\mid <<b>>)=\frac{P(<<a>>\cap <<b>>)}{P(<<b>>)}`, [['a','First event','A'],['b','Conditioning event','B']]),
  template('binomial','Probability & statistics','Binomial distribution',String.raw`P(X=k)=\binom{n}{k}p^k(1-p)^{n-k}`, []),
  template('normal','Probability & statistics','Normal distribution',String.raw`f(x)=\frac{1}{\sigma\sqrt{2\pi}}e^{-\frac{(x-\mu)^2}{2\sigma^2}}`, []),
  template('expectation','Probability & statistics','Expectation and variance',String.raw`\mathbb{E}[X]=\sum_x xP(X=x)\qquad\operatorname{Var}(X)=\mathbb{E}[X^2]-\mathbb{E}[X]^2`, []),
  template('combinations','Probability & statistics','Combinations',String.raw`\binom{<<n>>}{<<r>>}=\frac{<<n>>!}{<<r>>!(<<n>>-<<r>>)!}`, [['n','Total','n'],['r','Chosen','r']]),
  template('mean','Probability & statistics','Sample mean',String.raw`\bar{x}=\frac{1}{n}\sum_{i=1}^{n}x_i`, []),
  template('units','Physics','Values and units',String.raw`\pu{<<quantity>>}`, [['quantity','Value and units','9.81 m s-2']]),
  template('newton','Physics','Force and acceleration',String.raw`\vec{F}=m\vec{a}`, []),
  template('wave','Physics','Wave equation',String.raw`\frac{\partial^2 y}{\partial t^2}=v^2\frac{\partial^2 y}{\partial x^2}`, []),
  template('maxwell','Physics','Vector field notation',String.raw`\nabla\cdot\vec{E}=\frac{\rho}{\varepsilon_0}\qquad\nabla\times\vec{E}=-\frac{\partial\vec{B}}{\partial t}`, []),
  template('quantum','Physics','Quantum notation',String.raw`\langle\psi\mid\hat{H}\mid\psi\rangle\qquad\hbar\omega`, []),
  template('chemformula','Chemistry','Chemical formula and ions',String.raw`\ce{<<formula>>}`, [['formula','Formula','SO4^2-']]),
  template('reaction','Chemistry','Chemical reaction',String.raw`\ce{<<reaction>>}`, [['reaction','Reaction','2H2(g) + O2(g) -> 2H2O(l)']]),
  template('equilibrium','Chemistry','Equilibrium and conditions',String.raw`\ce{<<reaction>>}`, [['reaction','Reaction','N2(g) + 3H2(g) <=>[Fe][450 ^{\\circ}C] 2NH3(g)']]),
  template('isotope','Chemistry','Isotope',String.raw`{}^{<<mass>>}_{<<atomic>>}\mathrm{<<element>>}`, [['mass','Mass number','14'],['atomic','Atomic number','6'],['element','Element','C']]),
  template('redox','Chemistry','Half-equation',String.raw`\ce{<<reaction>>}`, [['reaction','Half-equation','Fe^3+ + e- -> Fe^2+']]),
  template('organic','Chemistry','Condensed organic formula',String.raw`\ce{<<formula>>}`, [['formula','Formula','CH3-CH2-OH']]),
  template('precipitate','Chemistry','Precipitation',String.raw`\ce{Ag+(aq) + Cl-(aq) -> AgCl(s) v}`, []),
];
export const SCIENCE_SYMBOLS = [
  ['Greek',String.raw`\alpha \beta \gamma \delta \epsilon \theta \lambda \mu \pi \rho \sigma \phi \omega \Delta \Omega`],
  ['Relations',String.raw`= \ne \approx \equiv < > \le \ge \propto \pm \times \div \infty`],
  ['Sets and logic',String.raw`\in \notin \subset \subseteq \cup \cap \setminus \emptyset \forall \exists \neg \land \lor \implies \iff`],
  ['Arrows',String.raw`\to \leftarrow \leftrightarrow \Rightarrow \Leftrightarrow \uparrow \downarrow`],
];

export function templateLatex(template, values, matrix = [['a','b'],['c','d']]) {
  if (template.id === 'matrix' || template.id === 'determinant') {
    const env = template.id === 'matrix' ? 'pmatrix' : 'vmatrix';
    return `\\begin{${env}}${matrix.map(row=>row.map(cell=>cell.trim() || '0').join(' & ')).join(' \\\\ ')}\\end{${env}}`;
  }
  return template.source.replace(/<<([a-z0-9]+)>>/gi,(_,key)=>values[key] ?? '');
}
