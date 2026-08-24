from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math

OUT = Path("public/lesson-assets/a2-1")
OUT.mkdir(parents=True, exist_ok=True)
W,H = 1600,1000
BG="#fbfaf7"; INK="#17313b"; MUTED="#55717b"; BLUE="#2166c2"; TEAL="#168a83"; ORANGE="#d85f2a"; RED="#b93442"; GREEN="#2f855a"; PURPLE="#7454b8"; GRID="#d7e1e4"; PALE="#eef5f6"; CREAM="#fff4e8"
REG="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
ITAL="/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf"

def font(n,b=False,i=False):
    p=ITAL if i else (BOLD if b else REG)
    return ImageFont.truetype(p,n)

def base(title, subtitle):
    im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
    d.text((70,38),title,font=font(42,True),fill=INK)
    d.text((72,94),subtitle,font=font(22),fill=MUTED)
    d.line((70,132,1530,132),fill=GRID,width=3)
    return im,d

def save(im,name):
    im.save(OUT/name,format="PNG",optimize=True)

def box(d,xy,title,body="",fill=PALE,outline=TEAL,title_fill=INK):
    d.rounded_rectangle(xy,18,fill=fill,outline=outline,width=3)
    x1,y1,x2,y2=xy
    d.text((x1+20,y1+16),title,font=font(24,True),fill=title_fill)
    if body:
        y=y1+55
        for line in body.split("\n"):
            d.text((x1+20,y),line,font=font(20),fill=INK); y+=30

def arrow(d,a,b,color=INK,width=5,head=16):
    x1,y1=a; x2,y2=b
    d.line((x1,y1,x2,y2),fill=color,width=width)
    ang=math.atan2(y2-y1,x2-x1)
    pts=[(x2,y2),(x2-head*math.cos(ang-.55),y2-head*math.sin(ang-.55)),(x2-head*math.cos(ang+.55),y2-head*math.sin(ang+.55))]
    d.polygon(pts,fill=color)

def double_arrow(d,a,b,color=INK,width=4):
    arrow(d,a,b,color,width,13); arrow(d,b,a,color,width,13)

def label(d,xy,text,color=INK,size=20,bold=False,anchor=None):
    d.text(xy,text,font=font(size,bold),fill=color,anchor=anchor)

def line_label(d,a,b,text,color=INK,offset=(0,-30)):
    arrow(d,a,b,color)
    mx=(a[0]+b[0])//2+offset[0]; my=(a[1]+b[1])//2+offset[1]
    d.rounded_rectangle((mx-8,my-4,mx+d.textlength(text,font=font(19,True))+8,my+28),8,fill=BG)
    d.text((mx,my),text,font=font(19,True),fill=color)

def chem_box(d,xy,formula,caption,fill="#ffffff",outline=BLUE):
    d.rounded_rectangle(xy,16,fill=fill,outline=outline,width=3)
    x1,y1,x2,y2=xy
    d.text(((x1+x2)//2,y1+22),formula,font=font(30,True),fill=INK,anchor="ma")
    d.text(((x1+x2)//2,y2-40),caption,font=font(18),fill=MUTED,anchor="ma")

# 1 Born-Haber
im,d=base("Born–Haber cycle for sodium chloride","All arrows show the enthalpy change in the direction written; values are for 1 mol of NaCl(s).")
xL,xR=190,1080
levels=[(820,"Na(s) + ½Cl₂(g)","elements in standard states"),(680,"Na(g) + ½Cl₂(g)","gaseous sodium atoms"),(530,"Na(g) + Cl(g)","gaseous atoms"),(350,"Na⁺(g) + e⁻ + Cl(g)","ionisation"),(210,"Na⁺(g) + Cl⁻(g)","separate gaseous ions")]
for y,f,c in levels:
    chem_box(d,(90,y-45,560,y+50),f,c)
chem_box(d,(1040,730,1510,840),"NaCl(s)","ionic lattice",fill="#f1efe8",outline=ORANGE)
line_label(d,(585,820),(1020,785),"ΔH°f = −411 kJ mol⁻¹",GREEN,(10,-8))
line_label(d,(330,775),(330,735),"ΔH°at(Na) = +108",BLUE,(-185,-12))
line_label(d,(330,635),(330,585),"½ bond dissociation = +121",BLUE,(-240,-12))
line_label(d,(330,485),(330,405),"IE₁(Na) = +496",PURPLE,(-160,-12))
line_label(d,(330,305),(330,255),"EA₁(Cl) = −349",TEAL,(-170,-12))
# Route the lattice-formation arrow through the clear channel between the level boxes and notes.
d.line((560,210,620,210,620,650),fill=ORANGE,width=5)
arrow(d,(620,650),(1040,760),ORANGE,5,16)
d.rounded_rectangle((655,610,970,648),8,fill=BG)
d.text((670,616),"ΔH°latt = −787 kJ mol⁻¹",font=font(19,True),fill=ORANGE)
box(d,(650,165,1500,350),"Hess’s law check",
    "Direct route = sum of the alternative route\n−411 = 108 + 121 + 496 − 349 + ΔH°latt\nΔH°latt = −787 kJ mol⁻¹",fill="#fff8ef",outline=ORANGE)
box(d,(650,395,1500,600),"Definition used here",
    "Standard lattice enthalpy of formation: the enthalpy change\nwhen 1 mol of an ionic solid forms from its separate\ngaseous ions under standard conditions.",fill="#edf8f4",outline=GREEN)
save(im,"01-born-haber-cycle.png")

# 2 solution cycle
im,d=base("How an ionic solid dissolves","Separate the lattice first, then hydrate the gaseous ions. Hess’s law links the two routes.")
chem_box(d,(100,225,540,365),"MX(s)","ionic solid")
chem_box(d,(100,690,540,830),"M⁺(aq) + X⁻(aq)","hydrated ions")
chem_box(d,(1020,225,1500,365),"M⁺(g) + X⁻(g)","separate gaseous ions")
line_label(d,(320,390),(320,665),"ΔH°sol",GREEN,(-95,0))
line_label(d,(565,295),(995,295),"ΔH°latt(dissociation)",ORANGE,(15,-35))
line_label(d,(1260,390),(1260,665),"ΣΔH°hyd",BLUE,(-90,0))
arrow(d,(1235,690),(565,760),BLUE)
d.text((680,730),"hydration of both ions",font=font(20,True),fill=BLUE)
box(d,(620,430,1000,650),"Cycle equation",
    "ΔH°sol = ΔH°latt(diss)\n              + ΣΔH°hyd\n\nRemember: lattice dissociation\nis the reverse of lattice formation.",fill="#fff8ef",outline=ORANGE)
# particle hydration
for cx,cy,ion,col,orient in [(350,535,"M⁺",BLUE,1),(1310,815,"X⁻",ORANGE,-1)]:
    d.ellipse((cx-38,cy-38,cx+38,cy+38),fill=col)
    d.text((cx,cy),ion,font=font(22,True),fill="white",anchor="mm")
    for a in range(0,360,60):
        rad=math.radians(a); ox=cx+math.cos(rad)*90; oy=cy+math.sin(rad)*90
        d.ellipse((ox-19,oy-12,ox+19,oy+12),fill="#9bd5ee",outline=BLUE,width=2)
        # Oxygen end faces cation; hydrogen end faces anion
        ex=ox-math.cos(rad)*14*orient; ey=oy-math.sin(rad)*14*orient
        d.ellipse((ex-7,ey-7,ex+7,ey+7),fill=RED)
d.text((90,900),"Water molecules orient so that the oxygen end (δ−) faces cations and the hydrogen ends (δ+) face anions.",font=font(21),fill=INK)
save(im,"02-solution-enthalpy-cycle.png")

# 3 entropy and Gibbs
im,d=base("Entropy, Gibbs free energy and temperature","Use kelvin and put ΔH and TΔS in the same energy units before subtracting.")
box(d,(85,190,500,420),"1  Calculate ΔS°",
    "ΔS° = ΣS°(products)\n          − ΣS°(reactants)\n\nUnit: J K⁻¹ mol⁻¹",fill="#eef5ff",outline=BLUE)
box(d,(595,190,1010,420),"2  Convert units",
    "If ΔH° is in kJ mol⁻¹, divide\nΔS° by 1000 so it becomes\nkJ K⁻¹ mol⁻¹.",fill="#edf8f4",outline=TEAL)
box(d,(1105,190,1520,420),"3  Calculate ΔG°",
    "ΔG° = ΔH° − TΔS°\n\nΔG° < 0: feasible\nΔG° > 0: not feasible",fill="#fff4e8",outline=ORANGE)
arrow(d,(510,305),(580,305),INK); arrow(d,(1020,305),(1090,305),INK)
# sign table
d.rounded_rectangle((90,500,1510,880),18,fill="white",outline=GRID,width=3)
cols=[90,400,720,1040,1510]; rows=[500,575,650,725,800,880]
for x in cols[1:-1]: d.line((x,500,x,880),fill=GRID,width=2)
for y in rows[1:-1]: d.line((90,y,1510,y),fill=GRID,width=2)
headers=["ΔH°","ΔS°","Temperature effect","Feasibility"]
for i,t in enumerate(headers): d.text(((cols[i]+cols[i+1])//2,535),t,font=font(22,True),fill=INK,anchor="mm")
data=[("−","+", "favourable at every T","ΔG° is always negative"),
("+","−","unfavourable at every T","ΔG° is always positive"),
("−","−","−TΔS° becomes positive","favoured at lower T"),
("+","+","−TΔS° becomes negative","favoured at higher T")]
for r,row in enumerate(data):
    y=(rows[r+1]+rows[r+2])//2
    for i,t in enumerate(row): d.text(((cols[i]+cols[i+1])//2,y),t,font=font(20, i<2),fill=[BLUE,TEAL,PURPLE,ORANGE][r],anchor="mm")
save(im,"03-entropy-gibbs.png")

# 4 rate equation
im,d=base("Deducing a rate equation from initial-rate data","Change one concentration at a time; compare the factor change in concentration with the factor change in rate.")
# table
x=[90,270,520,770,1030,1510]; y=[190,260,345,430,515]
headers=["Run","[A] / mol dm⁻³","[B] / mol dm⁻³","Initial rate / mol dm⁻³ s⁻¹","Comparison"]
for i in range(5):
    d.rectangle((x[i],y[0],x[i+1],y[-1]),fill="white",outline=GRID,width=2)
    d.text(((x[i]+x[i+1])//2,225),headers[i],font=font(18,True),fill=INK,anchor="mm")
rows=[("1","0.100","0.100","2.40 × 10⁻⁴","reference"),
("2","0.200","0.100","9.60 × 10⁻⁴","[A] ×2; rate ×4"),
("3","0.100","0.300","7.20 × 10⁻⁴","[B] ×3; rate ×3")]
for r,row in enumerate(rows):
    yy=(y[r+1]+y[r+2])//2
    for i,t in enumerate(row): d.text(((x[i]+x[i+1])//2,yy),t,font=font(19, i==0),fill=INK,anchor="mm")
# deductions
box(d,(90,590,520,880),"A is second order",
    "Doubling [A] makes rate ×4.\n4 = 2², so rate ∝ [A]².",fill="#eef5ff",outline=BLUE)
box(d,(585,590,1015,880),"B is first order",
    "Tripling [B] makes rate ×3.\n3 = 3¹, so rate ∝ [B].",fill="#edf8f4",outline=TEAL)
box(d,(1080,590,1510,880),"Rate equation",
    "rate = k[A]²[B]\nOverall order = 2 + 1 = 3\nFor this third-order equation:\nk units = dm⁶ mol⁻² s⁻¹",fill="#fff4e8",outline=ORANGE)
save(im,"04-rate-equation-data.png")

# 5 kinetics graphs
im,d=base("Reading rates and orders from graphs","Graph shape is evidence only when the axes and variables are identified.")
# left conc-time with tangent
ox,oy=120,820; xmax=760; top=200
d.line((ox,top,ox,oy),fill=INK,width=4); d.line((ox,oy,xmax,oy),fill=INK,width=4)
d.text((125,195),"[A] / mol dm⁻³",font=font(17,True),fill=INK)
d.text((440,865),"time / s",font=font(20,True),fill=INK,anchor="mm")
pts=[]
for i in range(0,601,5):
    xx=ox+i; yy=oy-520*math.exp(-i/220)
    pts.append((xx,yy))
d.line(pts,fill=BLUE,width=6)
# tangent at i=230
x0=ox+230; y0=oy-520*math.exp(-230/220); slope=(520/220)*math.exp(-230/220)
d.line((x0-170,y0-slope*170,x0+190,y0+slope*190),fill=ORANGE,width=4)
d.ellipse((x0-7,y0-7,x0+7,y0+7),fill=RED)
d.text((150,160),"A concentration–time curve",font=font(25,True),fill=BLUE)
d.text((250,680),"gradient of tangent = Δconcentration ÷ Δtime",font=font(18,True),fill=ORANGE)
d.text((250,713),"rate is reported as a positive magnitude",font=font(18),fill=MUTED)
# right rate-conc graphs
ox2,oy2=900,820; xr=1510; tr=200
d.line((ox2,tr,ox2,oy2),fill=INK,width=4); d.line((ox2,oy2,xr,oy2),fill=INK,width=4)
d.text((825,500),"rate",font=font(20,True),fill=INK,anchor="mm"); d.text((1200,865),"concentration",font=font(20,True),fill=INK,anchor="mm")
d.line((ox2+10,700,xr-20,700),fill=GREEN,width=5)
d.line((ox2+10,810,xr-30,300),fill=BLUE,width=5)
pts2=[]
for i in range(0,570,5): pts2.append((ox2+i,810-0.00145*i*i))
d.line(pts2,fill=PURPLE,width=5)
d.text((1200,160),"Rate–concentration evidence",font=font(25,True),fill=BLUE,anchor="mm")
d.text((1280,675),"zero order: horizontal",font=font(18,True),fill=GREEN)
d.text((1150,500),"first order: straight through origin",font=font(18,True),fill=BLUE)
d.text((1120,260),"second order: upward curve",font=font(18,True),fill=PURPLE)
save(im,"05-kinetics-graphs.png")

# 6 mechanisms and temperature
im,d=base("Mechanisms, the rate-determining step and temperature","A proposed mechanism must add to the overall equation and match the experimentally determined rate equation.")
# mechanism panels
box(d,(80,180,770,455),"Two-step example",
    "Step 1 (slow):  NO₂ + NO₂ → NO₃ + NO\nStep 2 (fast):    NO₃ + CO → NO₂ + CO₂\n\nCancel NO₃ and one NO₂ to obtain:\nNO₂ + CO → NO + CO₂\nPredicted rate = k[NO₂]²",fill="#eef5ff",outline=BLUE)
box(d,(830,180,1520,455),"What the rate equation tells us",
    "The slow step is the bottleneck.\nThe particles in that step control the rate.\nAn intermediate is made in one step and used later;\nit does not appear in the overall equation.",fill="#edf8f4",outline=TEAL)
# MB curves
ox,oy=110,870; xr=1510; top=520
d.line((ox,top,ox,oy),fill=INK,width=4); d.line((ox,oy,xr,oy),fill=INK,width=4)
d.text((120,490),"number of molecules",font=font(18,True),fill=INK)
d.text((800,910),"molecular kinetic energy, E",font=font(20,True),fill=INK,anchor="mm")
def mb(temp,scale,col):
    pts=[]
    for i in range(1,1300,4):
        e=i/200
        val=(e**0.5)*math.exp(-e/temp)
        pts.append((ox+i,oy-scale*val))
    d.line(pts,fill=col,width=6)
# Peak scales are adjusted so the two qualitative distributions have the same total area.
mb(0.75,610,BLUE); mb(1.25,285,ORANGE)
Ea=1110
d.line((Ea,540,Ea,870),fill=RED,width=4)
d.text((Ea+12,555),"Eₐ",font=font(24,True),fill=RED)
d.text((340,560),"lower T: taller, narrower peak",font=font(18,True),fill=BLUE)
d.text((650,690),"higher T: lower, broader peak; more area beyond Eₐ",font=font(18,True),fill=ORANGE)
d.text((1130,835),"molecules able to react",font=font(18,True),fill=RED)
save(im,"06-mechanism-temperature.png")

# 7 Kc and ICE
im,d=base("Equilibrium concentrations and Kc","For a balanced homogeneous equilibrium, products go in the numerator and reactants in the denominator.")
d.text((800,180),"H₂(g) + I₂(g) ⇌ 2HI(g)",font=font(34,True),fill=INK,anchor="mm")
d.text((800,250),"Kc = [HI]² ÷ ([H₂][I₂])",font=font(34,True),fill=BLUE,anchor="mm")
# ICE
cols=[100,360,670,980,1290,1500]; rows=[330,410,500,590,680]
heads=["row","H₂","I₂","HI","meaning"]
for i in range(5):
    d.rectangle((cols[i],rows[0],cols[i+1],rows[-1]),fill="white",outline=GRID,width=2)
    d.text(((cols[i]+cols[i+1])//2,370),heads[i],font=font(21,True),fill=INK,anchor="mm")
vals=[("Initial","0.500","0.500","0.000","before reaction"),
("Change","−x","−x","+2x","1 : 1 : 2 ratio"),
("Equilibrium","0.500 − x","0.500 − x","2x","substitute in Kc")]
for r,row in enumerate(vals):
    yy=(rows[r+1]+rows[r+2])//2
    for i,t in enumerate(row): d.text(((cols[i]+cols[i+1])//2,yy),t,font=font(20,i==0),fill=INK,anchor="mm")
box(d,(100,735,735,920),"Units",
    "For this equation, net concentration power is\n2 − (1 + 1) = 0, so Kc has no units.",fill="#edf8f4",outline=TEAL)
box(d,(865,735,1500,920),"Do not reverse the expression",
    "The written equation decides the expression.\nIf the equation is reversed, the new constant is 1/Kc.",fill="#fff4e8",outline=ORANGE)
save(im,"07-equilibrium-kc.png")

# 8 acid base road map
im,d=base("Acid–base calculation road map","Square brackets mean concentration in mol dm⁻³. At 298 K, Kw = 1.00 × 10⁻¹⁴ mol² dm⁻⁶.")
items=[
("Strong acid","complete ionisation","[H⁺] from stoichiometry","pH = −log₁₀[H⁺]",BLUE),
("Strong base","complete dissociation","find [OH⁻]","[H⁺] = Kw/[OH⁻], then pH",TEAL),
("Weak acid HA","partial ionisation","Ka = [H⁺][A⁻]/[HA]","if justified: [H⁺] ≈ √(Ka × c)",ORANGE),
("Buffer HA/A⁻","both components present","Ka = [H⁺][A⁻]/[HA]","[H⁺] = Ka[HA]/[A⁻]",PURPLE)]
for r,(a,b,c,e,col) in enumerate(items):
    y=190+r*175
    d.rounded_rectangle((90,y,1510,y+135),16,fill="white",outline=col,width=4)
    d.text((120,y+20),a,font=font(25,True),fill=col)
    d.text((360,y+20),b,font=font(20),fill=INK)
    d.text((690,y+20),c,font=font(20,True),fill=INK)
    d.text((1050,y+20),e,font=font(19,True),fill=col)
    if r<3: arrow(d,(800,y+140),(800,y+165),GRID,4,12)
box(d,(90,865,1510,970),"Calculator check","At 298 K: acid [H⁺] > 1.0 × 10⁻⁷ mol dm⁻³; base [H⁺] < 1.0 × 10⁻⁷ mol dm⁻³.",fill="#fff8ef",outline=ORANGE)
save(im,"08-acid-base-roadmap.png")

# 9 titration practical/curves
im,d=base("Measuring a titration curve and choosing an indicator","Illustration: a strong acid titrated with a strong alkali. Record settled pH readings against total volume added.")
# Labelled apparatus: the burette tip stays just above the beaker; only the pH electrode is immersed.
# retort stand, boss and clamp
d.line((440,190,440,855),fill=INK,width=12); d.line((350,855,560,855),fill=INK,width=12)
d.line((205,285,440,285),fill=INK,width=9); d.ellipse((425,270,455,300),fill=INK)
# graduated burette, stopcock and delivery tip
d.rectangle((130,220,205,610),fill="#dff3ff",outline=INK,width=4)
for yy in range(245,600,35): d.line((130,yy,145,yy),fill=MUTED,width=2)
d.line((167,610,167,640),fill=INK,width=5); d.line((145,630,190,630),fill=INK,width=6)
d.line((167,640,167,651),fill=INK,width=5); d.polygon([(158,651),(176,651),(167,661)],fill=INK)
# Open beaker on a magnetic stirrer; the pH electrode is immersed in the analyte.
d.rectangle((85,665,365,850),fill="white",outline=INK,width=4)
d.rectangle((90,715,360,845),fill="#f7d6e0")
d.line((85,665,365,665),fill=INK,width=4)
d.rounded_rectangle((70,850,380,915),12,fill="#d8e1e3",outline=INK,width=4)
d.rounded_rectangle((190,817,265,830),7,fill="white",outline=PURPLE,width=3)
# pH electrode immersed in analyte, cabled to meter
d.rounded_rectangle((292,485,325,790),12,fill="#e7f4f2",outline=TEAL,width=4)
d.ellipse((288,770,329,812),fill=TEAL,outline=INK,width=2)
d.line((308,485,308,445,485,445,485,520),fill=INK,width=4)
d.rounded_rectangle((470,500,650,625),14,fill="#edf8f4",outline=TEAL,width=4)
d.text((560,540),"pH meter",font=font(21,True),fill=TEAL,anchor="mm")
d.text((560,585),"calibrated",font=font(18),fill=INK,anchor="mm")
label(d,(85,180),"burette: strong alkali titrant",BLUE,19,True)
label(d,(80,930),"beaker: strong acid analyte; magnetic stirring",RED,17,True)
label(d,(270,420),"pH electrode",TEAL,19,True)
# curve
ox,oy=720,850; xr=1510; top=190
d.line((ox,top,ox,oy),fill=INK,width=4); d.line((ox,oy,xr,oy),fill=INK,width=4)
# explicit scale labels make the illustrative graph auditable
for ph_tick in range(0,15,2):
    yy=oy-(ph_tick/14)*610; d.line((ox-8,yy,ox+8,yy),fill=INK,width=2); d.text((ox-16,yy),str(ph_tick),font=font(14),fill=INK,anchor="rm")
for vol,xx in [(0,ox),(25,ox+185),(50,ox+370),(75,ox+555),(100,ox+740)]:
    d.line((xx,oy-8,xx,oy+8),fill=INK,width=2); d.text((xx,oy+16),str(vol),font=font(14),fill=INK,anchor="ma")
d.text((680,165),"pH",font=font(22,True),fill=INK,anchor="mm"); d.text((1110,930),"volume of alkali added / cm³",font=font(20,True),fill=INK,anchor="mm")
pts=[]
for i in range(0,740,3):
    v=(i-370)/35
    ph=1.0+12.0/(1+math.exp(-v))
    pts.append((ox+i,oy-(ph/14)*610))
d.line(pts,fill=BLUE,width=6)
eqx=ox+370
d.line((eqx,210,eqx,850),fill=TEAL,width=3)
d.text((eqx+10,225),"equivalence volume",font=font(18,True),fill=TEAL)
d.rectangle((eqx-70,390,eqx+70,500),outline=ORANGE,width=4)
d.text((eqx+90,420),"indicator transition range must lie\ninside the steep section",font=font(18,True),fill=ORANGE)
save(im,"09-titration-curve-practical.png")

# 10 stereochemistry
im,d=base("Chirality and optical isomerism","A chiral carbon is tetrahedral and bonded to four different groups. Its mirror images cannot be superimposed.")
# tetra centers
def chiral(cx,cy,mirror=False):
    d.ellipse((cx-18,cy-18,cx+18,cy+18),fill=INK)
    # bonds
    d.line((cx,cy,cx,cy-155),fill=INK,width=5); d.text((cx,cy-185),"OH",font=font(25,True),fill=BLUE,anchor="mm")
    d.line((cx,cy,cx,cy+155),fill=INK,width=5); d.text((cx,cy+185),"COOH",font=font(25,True),fill=RED,anchor="mm")
    s=-1 if mirror else 1
    d.polygon([(cx,cy),(cx+s*170,cy-70),(cx+s*150,cy-35)],fill=INK)
    d.text((cx+s*210,cy-70),"CH₃",font=font(25,True),fill=ORANGE,anchor="mm")
    # hashed wedge
    for i in range(1,8):
        t=i/8; x=cx-s*170*t; y=cy+70*t; half=2+i*1.5
        d.line((x-half,y,x+half,y),fill=INK,width=3)
    d.text((cx-s*210,cy+80),"H",font=font(25,True),fill=GREEN,anchor="mm")
chiral(420,500,False); chiral(1180,500,True)
d.line((800,250,800,760),fill=PURPLE,width=4)
d.text((800,220),"mirror plane",font=font(22,True),fill=PURPLE,anchor="mm")
d.text((420,780),"enantiomer 1",font=font(24,True),fill=BLUE,anchor="mm"); d.text((1180,780),"enantiomer 2",font=font(24,True),fill=BLUE,anchor="mm")
box(d,(180,840,1420,950),"Optical activity",
    "Pure enantiomers rotate plane-polarised light by equal amounts in opposite directions. A 50:50 racemic mixture has zero net rotation.",fill="#edf8f4",outline=TEAL)
save(im,"10-optical-isomerism.png")

# 11 carbonyl mechanism/tests
im,d=base("Carbonyl compounds: polarity, addition and tests","The C=O bond is polar: carbon is δ+ and oxygen is δ−. Curly arrows start at an electron pair or bond.")
# mechanism top: coordinates place each electron arrow on its exact source and destination
d.text((100,175),"Nucleophilic addition of cyanide to propanone",font=font(25,True),fill=BLUE)
d.text((340,300),"C",font=font(32,True),fill=INK,anchor="mm")
d.text((190,300),"CH₃",font=font(28,True),fill=INK,anchor="mm"); d.line((235,300,315,300),fill=INK,width=5)
d.text((490,300),"CH₃",font=font(28,True),fill=INK,anchor="mm"); d.line((365,300,445,300),fill=INK,width=5)
d.text((340,205),"O δ−",font=font(25,True),fill=RED,anchor="mm"); d.line((330,275,330,230),fill=INK,width=4); d.line((350,275,350,230),fill=INK,width=4)
d.text((330,345),"δ+",font=font(19,True),fill=BLUE,anchor="mm")
d.text((75,300),":CN⁻",font=font(27,True),fill=PURPLE,anchor="mm")
arrow(d,(115,292),(315,290),PURPLE,5,17)
arrow(d,(353,270),(353,225),RED,5,17)
d.text((85,375),"1  :CN⁻ lone pair → carbonyl carbon",font=font(17,True),fill=PURPLE)
d.text((400,415),"2  π(C=O) bond → oxygen",font=font(17,True),fill=RED)
arrow(d,(570,300),(710,300),INK,5,17)
d.text((930,275),"(CH₃)₂C(O⁻)CN",font=font(28,True),fill=INK,anchor="mm")
arrow(d,(1080,300),(1190,300),TEAL,5,17)
d.text((1380,275),"(CH₃)₂C(OH)CN",font=font(27,True),fill=INK,anchor="mm")
d.text((930,340),"tetrahedral alkoxide",font=font(17),fill=MUTED,anchor="mm")
d.text((1380,340),"protonation gives hydroxynitrile",font=font(17,True),fill=TEAL,anchor="mm")
# replaced by audited mechanism above
# exact structure and arrows above
# exact electron arrow above
# labelled above
# intermediates above
# protonation labelled above
# tests table
cols=[90,420,810,1160,1510]; rows=[470,545,650,755,860]
heads=["reagent","what it tests","aldehyde result","ketone result"]
for i in range(4):
    d.rectangle((cols[i],rows[0],cols[i+1],rows[-1]),fill="white",outline=GRID,width=2)
    d.text(((cols[i]+cols[i+1])//2,507),heads[i],font=font(19,True),fill=INK,anchor="mm")
data=[("2,4-DNPH","C=O group","orange/yellow precipitate","orange/yellow precipitate"),
("Tollens’ reagent","aldehyde oxidation","silver mirror","no visible change"),
("Fehling’s solution","aliphatic aldehyde","brick-red precipitate","remains blue")]
for r,row in enumerate(data):
    yy=(rows[r+1]+rows[r+2])//2
    for i,t in enumerate(row): d.text(((cols[i]+cols[i+1])//2,yy),t,font=font(17,i==0),fill=INK,anchor="mm")
d.text((90,900),"Safety: hydrogen cyanide is highly toxic. Any practical use requires an approved procedure,",font=font(18,True),fill=RED)
d.text((90,930),"specialist supervision and a suitable risk assessment.",font=font(18,True),fill=RED)
save(im,"11-carbonyl-chemistry.png")

# 12 carboxylic acids/derivatives/fats
im,d=base("Carboxylic acids and their derivatives","Read each reaction arrow as a change of functional group; check the small molecule formed.")
chem_box(d,(90,200,400,330),"RCOOH","carboxylic acid")
chem_box(d,(650,200,960,330),"RCOOR′","ester")
chem_box(d,(1210,200,1510,330),"RCOCl","acyl chloride")
line_label(d,(400,265),(650,265),"R′OH, H⁺; reflux",BLUE,(0,-35))
line_label(d,(650,315),(400,315),"H₂O, H⁺; reflux",MUTED,(-35,10))
line_label(d,(1210,265),(960,265),"R′OH",TEAL,(0,-35))
d.text((1085,305),"+ HCl formed",font=font(18,True),fill=MUTED,anchor="mm")
# triglyceride
d.text((90,450),"Triglyceride + methanol  →  glycerol + fatty-acid methyl esters (biodiesel)",font=font(25,True),fill=INK)
d.text((120,560),"CH₂–O–C(=O)–R₁",font=font(27,True),fill=BLUE)
d.text((120,620)," CH–O–C(=O)–R₂",font=font(27,True),fill=BLUE)
d.text((120,680),"CH₂–O–C(=O)–R₃",font=font(27,True),fill=BLUE)
d.text((520,620),"+ 3CH₃OH",font=font(28,True),fill=INK)
arrow(d,(730,620),(900,620),ORANGE)
d.text((930,570),"HOCH₂–CHOH–CH₂OH",font=font(25,True),fill=TEAL)
d.text((930,640),"+ R₁COOCH₃ + R₂COOCH₃",font=font(23,True),fill=ORANGE)
d.text((930,690),"+ R₃COOCH₃",font=font(23,True),fill=ORANGE)
box(d,(90,780,1510,930),"Hardening an oil",
    "Hydrogen adds across C=C bonds in unsaturated chains. Conditions: H₂ with finely divided Ni catalyst and heat.\nGreater saturation usually raises the melting point.",fill="#fff8ef",outline=ORANGE)
save(im,"12-carboxylic-derivatives.png")

# 13 benzene
im,d=base("Electrophilic substitution of benzene","Substitution preserves the stable delocalised π system; addition would destroy it.")
# benzene rings helper
def ring(cx,cy,r=90,circle=True):
    pts=[(cx+r*math.cos(math.radians(-90+i*60)),cy+r*math.sin(math.radians(-90+i*60))) for i in range(6)]
    d.line(pts+[pts[0]],fill=INK,width=6)
    if circle: d.ellipse((cx-48,cy-48,cx+48,cy+48),outline=BLUE,width=5)
    return pts
ring(220,350)
mid=ring(800,350,90,False)
final=ring(1380,350)
# In the sigma complex, E and H are bonded to the same ring carbon; the positive charge remains on the ring.
v=mid[0]; d.line((v[0],v[1],v[0]-45,v[1]-65),fill=INK,width=5); d.text((v[0]-55,v[1]-90),"E",font=font(24,True),fill=PURPLE,anchor="mm")
d.line((v[0],v[1],v[0]+45,v[1]-65),fill=INK,width=5); d.text((v[0]+55,v[1]-90),"H",font=font(24,True),fill=GREEN,anchor="mm")
d.text((800,380),"+",font=font(36,True),fill=PURPLE,anchor="mm")
# The product carries E and has regained its delocalised ring.
v=final[0]; d.line((v[0],v[1],v[0],v[1]-78),fill=INK,width=5); d.text((v[0],v[1]-105),"E",font=font(24,True),fill=TEAL,anchor="mm")
d.text((220,500),"benzene",font=font(23,True),fill=BLUE,anchor="mm")
d.text((800,500),"arenium (sigma-complex) intermediate",font=font(19,True),fill=PURPLE,anchor="mm")
d.text((1380,500),"substituted benzene",font=font(21,True),fill=TEAL,anchor="mm")
arrow(d,(330,350),(680,350),PURPLE); arrow(d,(920,350),(1260,350),TEAL)
d.text((500,305),"E⁺ attacks π electrons",font=font(18,True),fill=PURPLE,anchor="mm")
d.text((1090,305),"H⁺ is lost",font=font(18,True),fill=TEAL,anchor="mm")
# positive charge drawn inside the sigma complex above
# E and H are explicitly bonded to the same carbon above
# electrophile table
cols=[90,390,820,1170,1510]; rows=[570,640,715,790,865,940]
heads=["reaction","reagents/catalyst","electrophile","electrophile formation"]
for i in range(4):
    d.rectangle((cols[i],rows[0],cols[i+1],rows[-1]),fill="white",outline=GRID,width=2)
    d.text(((cols[i]+cols[i+1])//2,605),heads[i],font=font(18,True),fill=INK,anchor="mm")
data=[("bromination","Br₂ / FeBr₃","Br⁺","Br₂ + FeBr₃ → Br⁺ + FeBr₄⁻"),
("nitration","conc. HNO₃ / conc. H₂SO₄","NO₂⁺","HNO₃ + H₂SO₄ → NO₂⁺ + HSO₄⁻ + H₂O"),
("alkylation","RCl / AlCl₃","R⁺","RCl + AlCl₃ → R⁺ + AlCl₄⁻"),
("acylation","RCOCl / AlCl₃","RCO⁺","RCOCl + AlCl₃ → RCO⁺ + AlCl₄⁻")]
for r,row in enumerate(data):
    yy=(rows[r+1]+rows[r+2])//2
    for i,t in enumerate(row): d.text(((cols[i]+cols[i+1])//2,yy),t,font=font(16,i==0),fill=INK,anchor="mm")
save(im,"13-benzene-substitution.png")

# 14 methyl 3-nitrobenzoate practical
im,d=base("Preparation of methyl 3-nitrobenzoate","A labelled overview of the experiment. Exact quantities and hazards must follow the approved school procedure.")
# three stages
stages=[(80,180,500,500,"1  Controlled nitration",BLUE),(590,180,1010,500,"2  Precipitate and filter",TEAL),(1100,180,1520,500,"3  Recrystallise and dry",ORANGE)]
for x1,y1,x2,y2,t,col in stages:
    d.rounded_rectangle((x1,y1,x2,y2),18,fill="white",outline=col,width=4)
    d.text((x1+20,y1+18),t,font=font(23,True),fill=col)
# stage 1: open reaction flask immersed in an external ice-water bath
d.rectangle((135,315,445,455),fill="#dceeff",outline=BLUE,width=4)
for ix,iy in [(165,340),(210,390),(365,350),(405,405)]: d.polygon([(ix,iy-13),(ix+15,iy),(ix,iy+13),(ix-15,iy)],fill="white",outline=BLUE)
# conical reaction flask with open neck
d.polygon([(205,430),(380,430),(335,300),(250,300)],fill="#f5df8b",outline=INK,width=4)
d.rectangle((275,255,310,305),fill="white",outline=INK,width=4)
# dropping pipette above the open neck; drop lands inside the flask
d.line((292,225,292,275),fill=INK,width=5); d.ellipse((282,215,302,235),fill="#d8e1e3",outline=INK)
d.ellipse((287,282,297,297),fill=ORANGE)
d.text((155,250),"methyl benzoate\nadded slowly",font=font(14,True),fill=INK)
d.line((240,275,282,275),fill=INK,width=3)
d.text((290,470),"ice–water bath removes heat",font=font(15,True),fill=BLUE,anchor="mm")
# stage 2: Büchner funnel sealed to a side-arm suction flask
d.polygon([(690,260),(910,260),(865,345),(735,345)],fill="#e7f1f3",outline=INK,width=4)
d.line((705,285,895,285),fill=TEAL,width=4)
for xx in range(725,885,25): d.ellipse((xx-3,278,xx+3,284),fill=INK)
d.rectangle((770,345,830,375),fill="#bbc9cc",outline=INK,width=3)
d.rectangle((782,375,818,405),fill="white",outline=INK,width=4)
d.polygon([(700,465),(900,465),(850,400),(750,400)],fill="#d9eef5",outline=INK,width=4)
d.line((845,410,945,380),fill=INK,width=6); d.line((945,380,980,380),fill=TEAL,width=7)
d.text((800,485),"Büchner funnel + side-arm suction flask",font=font(14,True),fill=TEAL,anchor="mm")
d.text((950,355),"to vacuum trap/pump",font=font(13,True),fill=INK,anchor="mm")
# stage 3: dissolve in minimum hot solvent, cool, then collect and dry crystals
d.polygon([(1140,390),(1260,390),(1240,285),(1160,285)],fill="#fde7ba",outline=INK,width=4)
d.rectangle((1125,395,1275,430),fill="#d8e1e3",outline=INK,width=3)
d.text((1200,455),"minimum hot solvent",font=font(13,True),fill=INK,anchor="mm")
arrow(d,(1285,350),(1340,350),ORANGE,4,14)
d.ellipse((1340,350,1485,425),fill="#edf3f4",outline=INK,width=4)
for x,y in [(1370,385),(1405,395),(1440,380),(1460,405)]:
    d.polygon([(x,y-11),(x+12,y),(x,y+11),(x-12,y)],fill="#f2dd79",outline=ORANGE)
d.text((1410,447),"cooled, filtered",font=font(12,True),fill=ORANGE,anchor="mm")
d.text((1410,464),"and dried crystals",font=font(12,True),fill=ORANGE,anchor="mm")
# flow details
box(d,(80,580,500,900),"Microsteps",
    "1. Cool the nitrating mixture.\n2. Add methyl benzoate slowly.\n3. Stir while controlling temperature.\n4. Allow the substitution to finish.",fill="#eef5ff",outline=BLUE)
box(d,(590,580,1010,900),"Isolation",
    "1. Pour onto ice as directed.\n2. Allow crystals to form.\n3. Filter using suction.\n4. Wash with a little cold solvent.",fill="#edf8f4",outline=TEAL)
box(d,(1100,580,1520,900),"Purification",
    "1. Dissolve in minimum hot solvent.\n2. Cool slowly, then in ice.\n3. Filter and dry the crystals.\n4. Record mass and melting range.",fill="#fff4e8",outline=ORANGE)
d.text((80,935),"Safety: concentrated nitric and sulfuric acids are corrosive and nitration is exothermic.",font=font(17,True),fill=RED)
d.text((80,965),"Use eye protection, suitable gloves and a fume cupboard under trained supervision.",font=font(17,True),fill=RED)
save(im,"14-methyl-3-nitrobenzoate-practical.png")

# 15 monosubstituted benzene naming
def named_ring(cx,cy,subs,r=64,numbered=False):
    pts=[(cx+r*math.cos(math.radians(-90+i*60)),cy+r*math.sin(math.radians(-90+i*60))) for i in range(6)]
    d.line(pts+[pts[0]],fill=INK,width=6)
    d.ellipse((cx-r*0.52,cy-r*0.52,cx+r*0.52,cy+r*0.52),outline=BLUE,width=4)
    if numbered:
        for i in range(6):
            ang=math.radians(-90+i*60)
            tx=cx+r*0.72*math.cos(ang); ty=cy+r*0.72*math.sin(ang)
            d.text((tx,ty),str(i+1),font=font(16,True),fill=MUTED,anchor="mm",stroke_width=3,stroke_fill="#fff")
    for pos,txt,col in subs:
        ang=math.radians(-90+pos*60)
        vx,vy=pts[pos]
        ex=vx+52*math.cos(ang); ey=vy+52*math.sin(ang)
        d.line((vx,vy,ex,ey),fill=INK,width=5)
        lx=ex+24*math.cos(ang); ly=ey+24*math.sin(ang)
        d.text((lx,ly),txt,font=font(21,True),fill=col,anchor="mm",stroke_width=4,stroke_fill="#fff")
    return pts

im,d=base("Naming monosubstituted benzene derivatives","With one substituent, no ring locant is needed: substituent name + benzene.")
mono=[
    ((55,160,500,500),(278,330),[(0,"CH₃",TEAL)],"methylbenzene","C₆H₅CH₃"),
    ((578,160,1023,500),(800,330),[(0,"CH₂CH₃",TEAL)],"ethylbenzene","C₆H₅CH₂CH₃"),
    ((1100,160,1545,500),(1322,330),[(0,"Cl",GREEN)],"chlorobenzene","C₆H₅Cl"),
    ((55,535,500,875),(278,705),[(0,"Br",ORANGE)],"bromobenzene","C₆H₅Br"),
    ((578,535,1023,875),(800,705),[(0,"NO₂",PURPLE)],"nitrobenzene","C₆H₅NO₂"),
    ((1100,535,1545,875),(1322,705),[(0,"F",BLUE)],"fluorobenzene","C₆H₅F")
]
for rect,centre,subs,nm,formula in mono:
    d.rounded_rectangle(rect,18,fill="#fff",outline=GRID,width=3)
    named_ring(centre[0],centre[1],subs)
    d.text((centre[0],rect[3]-70),nm,font=font(23,True),fill=INK,anchor="mm")
    d.text((centre[0],rect[3]-35),formula,font=font(19),fill=MUTED,anchor="mm")
d.text((800,935),"The substituent is bonded directly to a ring carbon; benzene has formula C₆H₆ and a monosubstituted derivative has ring fragment C₆H₅–.",font=font(18,True),fill=INK,anchor="mm")
save(im,"15-benzene-monosubstituted-naming.png")

# 16 disubstituted ring numbering
im,d=base("Numbering disubstituted benzene rings","Choose carbon 1 at a substituted carbon, then number in the direction that gives the next substituent the lowest locant.")
patterns=[(300,(0,1),"1,2-dimethylbenzene","ortho (o-)"),(800,(0,2),"1,3-dimethylbenzene","meta (m-)"),(1300,(0,3),"1,4-dimethylbenzene","para (p-)")]
for cx,poss,nm,common in patterns:
    d.rounded_rectangle((cx-225,175,cx+225,750),18,fill="#fff",outline=GRID,width=3)
    named_ring(cx,430,[(poss[0],"CH₃",TEAL),(poss[1],"CH₃",ORANGE)],125,True)
    d.text((cx,650),nm,font=font(22,True),fill=INK,anchor="mm")
    d.text((cx,690),common,font=font(21,True),fill=PURPLE,anchor="mm")
d.rounded_rectangle((110,800,1490,920),16,fill="#eef5ff",outline=BLUE,width=3)
d.text((800,835),"Systematic numbered names are unambiguous and are preferred in formal answers.",font=font(22,True),fill=BLUE,anchor="mm")
d.text((800,875),"o-, m- and p- are common shorthand only for the 1,2-, 1,3- and 1,4- relationships.",font=font(20),fill=INK,anchor="mm")
save(im,"16-benzene-disubstituted-numbering.png")

# 17 retained parent names and a specification-linked derivative
im,d=base("Important benzene-derived parent names","The group bonded to the ring determines whether benzene is the parent or a retained parent name is used.")
parents=[
    ((55,160,500,500),(278,330),[(0,"OH",BLUE)],"phenol","C₆H₅OH"),
    ((578,160,1023,500),(800,330),[(0,"NH₂",TEAL)],"phenylamine","C₆H₅NH₂"),
    ((1100,160,1545,500),(1322,330),[(0,"COOH",RED)],"benzoic acid","C₆H₅COOH"),
    ((55,535,500,875),(278,705),[(0,"CHO",ORANGE)],"benzaldehyde","C₆H₅CHO"),
    ((578,535,1023,875),(800,705),[(0,"COOCH₃",GREEN)],"methyl benzoate","C₆H₅COOCH₃"),
    ((1100,535,1545,875),(1322,705),[(0,"COOCH₃",GREEN),(2,"NO₂",PURPLE)],"methyl 3-nitrobenzoate","NO₂ at ring carbon 3")
]
for rect,centre,subs,nm,formula in parents:
    d.rounded_rectangle(rect,18,fill="#fff",outline=GRID,width=3)
    named_ring(centre[0],centre[1],subs,64, len(subs)>1)
    d.text((centre[0],rect[3]-70),nm,font=font(22,True),fill=INK,anchor="mm")
    d.text((centre[0],rect[3]-35),formula,font=font(18),fill=MUTED,anchor="mm")
d.text((800,935),"For methyl 3-nitrobenzoate, the ring carbon bonded to COOCH₃ is carbon 1; NO₂ is on carbon 3.",font=font(19,True),fill=PURPLE,anchor="mm")
save(im,"17-benzene-parent-names.png")

print("rendered", len(list(OUT.glob("*.png"))), "PNG files")
