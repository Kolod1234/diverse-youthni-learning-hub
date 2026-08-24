from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math, textwrap

OUT=Path("public/lesson-assets/a2-2")
OUT.mkdir(parents=True,exist_ok=True)
W,H=1600,1000
BG="#fbfaf7"; INK="#17313b"; MUTED="#55717b"; BLUE="#2166c2"; TEAL="#168a83"; ORANGE="#d85f2a"; RED="#b93442"; GREEN="#2f855a"; PURPLE="#7454b8"; GRID="#d7e1e4"; PALE="#eef5f6"; CREAM="#fff4e8"; YELLOW="#e8b923"
REG="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
ITAL="/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf"

def font(n,b=False,i=False):
    return ImageFont.truetype(ITAL if i else (BOLD if b else REG),n)

def base(title,subtitle):
    im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
    d.text((70,38),title,font=font(42,True),fill=INK)
    d.text((72,94),subtitle,font=font(21),fill=MUTED)
    d.line((70,132,1530,132),fill=GRID,width=3)
    return im,d

def save(im,name):
    im.save(OUT/name,format="PNG",optimize=True)

def arrow(d,a,b,color=INK,width=5,head=16):
    x1,y1=a; x2,y2=b
    d.line((x1,y1,x2,y2),fill=color,width=width)
    ang=math.atan2(y2-y1,x2-x1)
    pts=[(x2,y2),(x2-head*math.cos(ang-.55),y2-head*math.sin(ang-.55)),(x2-head*math.cos(ang+.55),y2-head*math.sin(ang+.55))]
    d.polygon(pts,fill=color)

def wrap(text,width):
    lines=[]
    for part in text.split("\n"):
        lines.extend(textwrap.wrap(part,width=width,break_long_words=False) or [""])
    return lines

def box(d,xy,title,body="",fill="white",outline=TEAL,title_fill=INK,body_size=19,wrap_width=52):
    d.rounded_rectangle(xy,18,fill=fill,outline=outline,width=3)
    x1,y1,x2,y2=xy
    d.text((x1+20,y1+15),title,font=font(23,True),fill=title_fill)
    y=y1+52
    for line in wrap(body,wrap_width):
        d.text((x1+20,y),line,font=font(body_size),fill=INK); y+=body_size+8

def label(d,xy,text,color=INK,size=19,bold=False,anchor=None):
    d.text(xy,text,font=font(size,bold),fill=color,anchor=anchor)

def molecule_label(d,xy,text,color=INK,size=27):
    d.rounded_rectangle((xy[0]-85,xy[1]-28,xy[0]+85,xy[1]+28),12,fill="white",outline=GRID,width=2)
    d.text(xy,text,font=font(size,True),fill=color,anchor="mm")

def table(d,xy,headers,rows,widths,row_h=62,font_size=17,header_fill="#edf4f6"):
    x1,y1,x2,y2=xy
    xs=[x1]
    for w in widths: xs.append(xs[-1]+w)
    d.rectangle((x1,y1,xs[-1],y1+row_h*(len(rows)+1)),fill="white",outline=GRID,width=2)
    for i,h in enumerate(headers):
        d.rectangle((xs[i],y1,xs[i+1],y1+row_h),fill=header_fill,outline=GRID,width=2)
        d.text(((xs[i]+xs[i+1])//2,y1+row_h//2),h,font=font(font_size,True),fill=INK,anchor="mm")
    for r,row in enumerate(rows):
        yy=y1+row_h*(r+1)
        for i,val in enumerate(row):
            d.rectangle((xs[i],yy,xs[i+1],yy+row_h),outline=GRID,width=2)
            d.text(((xs[i]+xs[i+1])//2,yy+row_h//2),str(val),font=font(font_size,i==0),fill=INK,anchor="mm")
    return xs[-1],y1+row_h*(len(rows)+1)

# 1 mass spectrum anatomy
im,d=base("Reading a mass spectrum","Relative abundance is plotted against mass-to-charge ratio, m/z. Example: propanone, C₃H₆O.")
ox,oy=120,810; xr=825; top=250
d.line((ox,top,ox,oy),fill=INK,width=4); d.line((ox,oy,xr,oy),fill=INK,width=4)
d.text((120,212),"relative abundance / %",font=font(18,True),fill=INK,anchor="lm")
d.text((475,865),"m/z",font=font(22,True),fill=INK,anchor="mm")
peaks=[(15,18,"CH₃⁺"),(28,9,"CO⁺"),(43,100,"CH₃CO⁺"),(58,31,"M⁺•"),(59,2.2,"M+1")]
for mz,ab,lab in peaks:
    x=ox+mz*11.2; y=oy-ab*5.1
    col=ORANGE if mz==43 else BLUE
    d.line((x,oy,x,y),fill=col,width=7)
    if mz==58:
        d.text((x-10,y-18),lab,font=font(16,True),fill=col,anchor="rs")
        d.text((x-6,oy+12),"58",font=font(15),fill=INK,anchor="ra")
    elif mz==59:
        d.text((x+13,y-36),lab,font=font(16,True),fill=col,anchor="ls")
        d.text((x+8,oy+12),"59",font=font(15),fill=INK,anchor="la")
    else:
        d.text((x,y-16),lab,font=font(17,True),fill=col,anchor="ms")
        d.text((x,oy+12),str(mz),font=font(15),fill=INK,anchor="ma")
box(d,(900,190,1510,390),"Base peak: m/z 43","The tallest peak is assigned 100% relative abundance. It is a fragment ion, CH₃CO⁺, not the molecular ion.",fill="#fff4e8",outline=ORANGE)
box(d,(900,420,1510,610),"Molecular-ion peak: m/z 58","M⁺• is formed when one electron is removed from the whole molecule. Its m/z gives the relative molecular mass when charge = +1.",fill="#eef5ff",outline=BLUE)
box(d,(900,640,1510,790),"M+1 peak","Mostly caused by molecules containing one ¹³C atom. Its small height is beside, not part of, M⁺•.",fill="#edf8f4",outline=TEAL)
save(im,"01-mass-spectrum-anatomy.png")

# 2 high-resolution mass spectrometry
im,d=base("High-resolution mass spectrometry resolves nominal mass 28","N₂ and CO both have nominal mass 28, but their exact masses are different.")
box(d,(90,185,750,420),"Nitrogen, N₂","Exact mass = 2(14.003074)\n= 28.006148",fill="#eef5ff",outline=BLUE,body_size=23)
box(d,(850,185,1510,420),"Carbon monoxide, CO","Exact mass = 12.000000 + 15.994915\n= 27.994915",fill="#edf8f4",outline=TEAL,body_size=23)
ox,oy=150,820; xr=1450; top=500
d.line((ox,top,ox,oy),fill=INK,width=4); d.line((ox,oy,xr,oy),fill=INK,width=4)
d.text((60,650),"signal",font=font(20,True),fill=INK,anchor="mm"); d.text((800,870),"exact m/z",font=font(21,True),fill=INK,anchor="mm")
xco=600; xn2=1030
d.line((xco,oy,xco,550),fill=TEAL,width=10); d.line((xn2,oy,xn2,550),fill=BLUE,width=10)
d.text((xco,530),"CO⁺•",font=font(22,True),fill=TEAL,anchor="ms"); d.text((xn2,530),"N₂⁺•",font=font(22,True),fill=BLUE,anchor="ms")
d.text((xco,835),"27.994915",font=font(18,True),fill=TEAL,anchor="ma"); d.text((xn2,835),"28.006148",font=font(18,True),fill=BLUE,anchor="ma")
arrow(d,(630,690),(1000,690),ORANGE,4,14)
d.text((815,660),"difference = 0.011233 u",font=font(20,True),fill=ORANGE,anchor="mm")
save(im,"02-high-resolution-mass.png")

# 3 proton NMR anatomy
im,d=base("How to read a high-resolution proton NMR spectrum","Schematic ethanol spectrum: positions, integration and splitting must all agree with one structure.")
ox,oy=100,750; xr=1510; top=210
d.line((ox,oy,xr,oy),fill=INK,width=4)
for ppm in range(10,-1,-1):
    x=ox+(10-ppm)*(xr-ox)/10
    d.line((x,oy-8,x,oy+8),fill=INK,width=2); d.text((x,oy+18),str(ppm),font=font(14),fill=INK,anchor="ma")
d.text((800,805),"chemical shift, δ / ppm   (increases to the left)",font=font(20,True),fill=INK,anchor="mm")
def multiplet(cx,heights,spacing,col):
    for i,h in enumerate(heights):
        x=cx+(i-(len(heights)-1)/2)*spacing
        d.line((x,oy,x,oy-h),fill=col,width=5)
# ethanol: CH3 triplet 1.2; CH2 quartet 3.7; OH broad singlet variable
x_ch3=ox+(10-1.2)*(xr-ox)/10; x_ch2=ox+(10-3.7)*(xr-ox)/10; x_oh=ox+(10-2.4)*(xr-ox)/10
multiplet(x_ch3,[120,240,120],18,BLUE)
multiplet(x_ch2,[75,190,190,75],16,PURPLE)
d.arc((x_oh-45,590,x_oh+45,740),180,360,fill=ORANGE,width=8)
d.text((x_ch3,430),"CH₃: triplet\n3 H",font=font(20,True),fill=BLUE,anchor="mm",align="center")
d.text((x_ch2,430),"CH₂: quartet\n2 H",font=font(20,True),fill=PURPLE,anchor="mm",align="center")
d.text((x_oh,520),"OH: broad singlet\n1 H; position varies",font=font(18,True),fill=ORANGE,anchor="mm",align="center")
d.line((xr-40,oy,xr-40,oy-80),fill=TEAL,width=6); d.text((xr-40,oy-100),"TMS = 0 ppm",font=font(17,True),fill=TEAL,anchor="ms")
box(d,(90,830,500,955),"Chemical shift","Position shows the proton environment.",outline=BLUE,wrap_width=32)
box(d,(595,830,1005,955),"Integration","Area ratio gives relative proton numbers.",outline=TEAL,wrap_width=32)
box(d,(1100,830,1510,955),"Splitting","n adjacent H atoms give n+1 peaks.",outline=ORANGE,wrap_width=32)
save(im,"03-proton-nmr-anatomy.png")

# 4 NMR structure deduction
im,d=base("Combining NMR evidence: ethyl ethanoate","Molecular formula C₄H₈O₂. Every signal must be assigned once and the integrations must total 8 H.")
table(d,(90,190,1510,530),["δ / ppm","splitting","integration","assignment"],[
("1.25","triplet","3 H","CH₃–CH₂–"),
("2.05","singlet","3 H","CH₃–C(=O)–"),
("4.12","quartet","2 H","–O–CH₂–")
],[210,250,250,570],row_h=85,font_size=20)
molecule_label(d,(280,650),"CH₃",BLUE); molecule_label(d,(510,650),"C(=O)",ORANGE); molecule_label(d,(740,650),"O",TEAL); molecule_label(d,(970,650),"CH₂",PURPLE); molecule_label(d,(1200,650),"CH₃",BLUE)
for a,b in [((365,650),(425,650)),((595,650),(655,650)),((825,650),(885,650)),((1055,650),(1115,650))]: d.line((*a,*b),fill=INK,width=5)
box(d,(90,770,1510,930),"Deduction check","The ethyl group gives a 3 H triplet beside a 2 H quartet. The 3 H singlet has no hydrogen on the adjacent carbonyl carbon. The CH₂ attached to oxygen is shifted furthest downfield.",fill="#fff8ef",outline=ORANGE,wrap_width=115)
save(im,"04-nmr-structure-deduction.png")

# 5 redox titrations
im,d=base("Redox titrations: correct reagent, endpoint and equation","Read the burette and flask labels before choosing a mole ratio.")
# iodometry panel
box(d,(70,180,760,545),"Iodine–thiosulfate titration","Burette: standard Na₂S₂O₃(aq)\nFlask: iodine released by the oxidising agent\nIndicator: freshly prepared starch, added near the endpoint\nEndpoint: blue-black → colourless\n\nI₂ + 2S₂O₃²⁻ → 2I⁻ + S₄O₆²⁻",fill="#eef5ff",outline=BLUE,body_size=18,wrap_width=55)
# simple burette and conical flask below the explanatory text
d.rectangle((235,590,285,790),fill="#dff3ff",outline=INK,width=3)
d.line((260,790,260,835),fill=INK,width=4); d.polygon([(250,835),(270,835),(260,850)],fill=INK)
d.polygon([(165,930),(355,930),(320,845),(200,845)],fill="#f2e4aa",outline=INK,width=4)
d.text((260,955),"iodine solution in flask",font=font(16,True),fill=ORANGE,anchor="mm")
# permanganate panel
box(d,(840,180,1530,545),"Acidified manganate(VII) titration","Burette: KMnO₄(aq)\nFlask: Fe²⁺ or another reducing agent, acidified with dilute H₂SO₄\nIndicator: none; MnO₄⁻ is self-indicating\nEndpoint: first permanent pale pink\n\nMnO₄⁻ + 8H⁺ + 5Fe²⁺ → Mn²⁺ + 4H₂O + 5Fe³⁺",fill="#f5efff",outline=PURPLE,body_size=18,wrap_width=55)
d.rectangle((1105,590,1155,790),fill="#e7d8ff",outline=INK,width=3)
d.line((1130,790,1130,835),fill=INK,width=4); d.polygon([(1120,835),(1140,835),(1130,850)],fill=INK)
d.polygon([(1035,930),(1225,930),(1190,845),(1070,845)],fill="#f7dce9",outline=INK,width=4)
d.text((1130,955),"first permanent pale pink",font=font(16,True),fill=PURPLE,anchor="mm")
save(im,"05-redox-titrations.png")

# 6 back titration
im,d=base("Back titration: measure what remains","Useful when the solid reacts slowly or cannot be titrated directly.")
steps=[
("1  Weigh sample","Group II oxide or carbonate",BLUE),
("2  Add known excess acid","n(acid added) is known",ORANGE),
("3  Allow complete reaction","Warm if approved; transfer quantitatively",TEAL),
("4  Titrate excess acid","Use standard alkali and indicator",PURPLE),
("5  Subtract","acid reacted = acid added − acid remaining",GREEN),
("6  Use stoichiometry","find active material and percentage purity",RED)]
positions=[(90,190),(590,190),(1090,190),(1090,520),(590,520),(90,520)]
for i,(t,b,col) in enumerate(steps):
    x,y=positions[i]
    box(d,(x,y,x+430,y+220),t,b,fill="white",outline=col,title_fill=col,wrap_width=34)
    if i in (0,1): arrow(d,(x+435,y+110),(x+490,y+110),INK,4,13)
    elif i==2: arrow(d,(1305,415),(1305,510),INK,4,13)
    elif i in (3,4): arrow(d,(x-10,y+110),(x-65,y+110),INK,4,13)
box(d,(260,860,1340,950),"Core subtraction","n(HCl that reacted with sample) = n(HCl initially added) − n(HCl left over)",fill="#fff8ef",outline=ORANGE,body_size=21,wrap_width=90)
save(im,"06-back-titration-flow.png")

# 7 paper and thin-layer chromatography
im,d=base("Paper and thin-layer chromatography","The baseline stays above the solvent; Rf uses distances measured from the same baseline.")
# chamber
d.rounded_rectangle((100,190,760,850),20,fill="#f2f7f8",outline=INK,width=4)
d.rectangle((180,260,650,760),fill="white",outline=BLUE,width=3)
d.rectangle((120,760,740,825),fill="#dceeff",outline=BLUE,width=2)
d.line((180,680,650,680),fill=INK,width=3)
d.text((170,680),"pencil baseline",font=font(17,True),fill=INK,anchor="rm")
d.line((180,330,650,330),fill=TEAL,width=3)
d.text((660,330),"solvent front",font=font(17,True),fill=TEAL,anchor="lm")
for x,ys,col in [(270,[590,470],ORANGE),(400,[530,410,360],PURPLE),(540,[610],GREEN)]:
    for y in ys: d.ellipse((x-14,y-10,x+14,y+10),fill=col,outline=INK)
d.text((430,875),"development chamber",font=font(19,True),fill=BLUE,anchor="mm")
# formula/2-way
box(d,(840,190,1510,430),"Rf calculation","Rf = distance travelled by solute ÷ distance travelled by solvent front\n\n0 ≤ Rf ≤ 1 for a correctly measured spot.",fill="#edf8f4",outline=TEAL,body_size=21,wrap_width=50)
box(d,(840,470,1510,820),"Two-way paper chromatography","1. Develop in solvent 1.\n2. Remove and mark the solvent front.\n3. Dry the paper completely.\n4. Rotate the paper through 90°.\n5. Develop in solvent 2.\n\nThis can separate substances that overlap in one solvent.",fill="#fff4e8",outline=ORANGE,body_size=20,wrap_width=50)
save(im,"07-paper-tlc-chromatography.png")

# 8 gas-liquid chromatography
im,d=base("Gas–liquid chromatography","Volatile components partition between a carrier gas and a liquid stationary phase inside the column.")
stages=[(100,"carrier gas",BLUE),(340,"heated injector",ORANGE),(620,"column in oven",PURPLE),(960,"detector",TEAL),(1210,"data system",GREEN)]
for i,(x,t,col) in enumerate(stages):
    box(d,(x,220,x+210,360),t,"",outline=col,title_fill=col)
    if i<len(stages)-1: arrow(d,(x+215,290),(stages[i+1][0]-10,290),INK,4,13)
# coiled column
for r in range(4): d.arc((690,240+r*10,890,330-r*10),0,180,fill=PURPLE,width=4)
# chromatogram
ox,oy=180,850; xr=1450; top=500
d.line((ox,top,ox,oy),fill=INK,width=4); d.line((ox,oy,xr,oy),fill=INK,width=4)
d.text((180,462),"detector response",font=font(18,True),fill=INK,anchor="lm"); d.text((820,900),"retention time",font=font(20,True),fill=INK,anchor="mm")
for cx,h,w,col,lab in [(380,150,45,BLUE,"A"),(690,280,80,ORANGE,"B"),(1120,210,65,TEAL,"C")]:
    pts=[]
    for x in range(cx-4*w,cx+4*w,3):
        y=oy-h*math.exp(-((x-cx)/w)**2)
        pts.append((x,y))
    d.line(pts,fill=col,width=5); d.text((cx,oy-h-25),lab,font=font(21,True),fill=col,anchor="mm")
box(d,(970,450,1510,610),"Interpretation","Retention time helps identify a component under fixed conditions. Integrated peak area gives its percentage composition.",fill="white",outline=TEAL,wrap_width=42)
save(im,"08-gas-liquid-chromatography.png")

# 9 transition-metal electron configurations
im,d=base("Transition-metal electron configurations","Write the neutral atom first; when forming ions, remove 4s electrons before 3d electrons.")
table(d,(90,190,1490,764),["species","electron configuration","reason/check"],[
("Cr","[Ar] 3d⁵ 4s¹","half-filled d subshell"),
("Fe","[Ar] 3d⁶ 4s²","neutral atom"),
("Fe²⁺","[Ar] 3d⁶","remove two 4s electrons"),
("Fe³⁺","[Ar] 3d⁵","remove one more 3d electron"),
("Cu","[Ar] 3d¹⁰ 4s¹","filled d subshell"),
("Cu²⁺","[Ar] 3d⁹","remove 4s, then one 3d")
],[260,520,620],row_h=82,font_size=20)
box(d,(180,795,1420,925),"Definition","A transition element forms at least one ion with an incomplete d subshell. Zn forms Zn²⁺ with a complete 3d¹⁰ subshell, so it does not meet this definition.",fill="#fff8ef",outline=ORANGE,wrap_width=100)
save(im,"09-transition-electron-configurations.png")

# 10 complex shapes and denticity
im,d=base("Complex ions: coordination number, shape and denticity","A ligand donates a lone pair to the central metal ion. Count donor atoms bonded to the metal.")
# octahedral
cx,cy=320,430
d.ellipse((cx-32,cy-32,cx+32,cy+32),fill=BLUE); d.text((cx,cy),"M",font=font(22,True),fill="white",anchor="mm")
# four bonds lie in the plane; solid and hashed wedges show the two out-of-plane bonds
for dx,dy in [(0,-150),(0,150),(-150,0),(150,0)]:
    d.line((cx,cy,cx+dx,cy+dy),fill=INK,width=4); d.ellipse((cx+dx-20,cy+dy-20,cx+dx+20,cy+dy+20),fill="#b9e4ef",outline=BLUE)
d.polygon([(cx-8,cy-8),(cx-120,cy-120),(cx-96,cy-126)],fill=INK)
d.ellipse((cx-125,cy-125,cx-85,cy-85),fill="#b9e4ef",outline=BLUE)
for k in range(1,8):
    t=k/8; x=cx+105*t; y=cy+105*t; half=2+7*t
    d.line((x-half,y+half,x+half,y-half),fill=INK,width=2)
d.ellipse((cx+85,cy+85,cx+125,cy+125),fill="#b9e4ef",outline=BLUE)
d.text((320,640),"octahedral; coordination number 6",font=font(19,True),fill=BLUE,anchor="mm")
# tetrahedral
cx,cy=800,430
d.ellipse((cx-32,cy-32,cx+32,cy+32),fill=TEAL); d.text((cx,cy),"M",font=font(22,True),fill="white",anchor="mm")
# two ordinary bonds plus a solid wedge and a hashed wedge show tetrahedral projection
for dx,dy in [(-120,-120),(120,-120)]:
    d.line((cx,cy,cx+dx,cy+dy),fill=INK,width=4); d.ellipse((cx+dx-20,cy+dy-20,cx+dx+20,cy+dy+20),fill="#c9eadf",outline=TEAL)
d.polygon([(cx-8,cy+8),(cx-135,cy+105),(cx-108,cy+130)],fill=INK)
d.ellipse((cx-140,cy+100,cx-100,cy+140),fill="#c9eadf",outline=TEAL)
for k in range(1,8):
    t=k/8; x=cx+120*t; y=cy+120*t; half=2+7*t
    d.line((x-half,y-half,x+half,y+half),fill=INK,width=2)
d.ellipse((cx+100,cy+100,cx+140,cy+140),fill="#c9eadf",outline=TEAL)
d.text((800,640),"tetrahedral; coordination number 4",font=font(19,True),fill=TEAL,anchor="mm")
# square planar
cx,cy=1280,430
d.ellipse((cx-32,cy-32,cx+32,cy+32),fill=PURPLE); d.text((cx,cy),"Pt",font=font(20,True),fill="white",anchor="mm")
for dx,dy in [(0,-130),(0,130),(-130,0),(130,0)]:
    d.line((cx,cy,cx+dx,cy+dy),fill=INK,width=4); d.ellipse((cx+dx-20,cy+dy-20,cx+dx+20,cy+dy+20),fill="#e1d6f5",outline=PURPLE)
d.text((1280,640),"square planar; coordination number 4",font=font(19,True),fill=PURPLE,anchor="mm")
box(d,(120,745,1480,930),"Denticity","Monodentate: one donor atom, e.g. H₂O, NH₃ or Cl⁻. Bidentate: two donor atoms, e.g. ethane-1,2-diamine (en). EDTA is polydentate and can bind through six donor atoms.",fill="#fff8ef",outline=ORANGE,wrap_width=110)
save(im,"10-complex-shapes-denticity.png")

# 11 copper ligand replacement
im,d=base("Ligand replacement in copper(II) complexes","Colours and shapes change because different ligands surround Cu²⁺.")
box(d,(80,190,480,430),"[Cu(H₂O)₆]²⁺","pale-blue solution\noctahedral",fill="#e2f3ff",outline=BLUE,body_size=22,wrap_width=30)
box(d,(600,190,1000,430),"[CuCl₄]²⁻","yellow solution; mixtures often appear green\ntetrahedral",fill="#fff5c8",outline=YELLOW,body_size=20,wrap_width=32)
box(d,(1120,190,1520,430),"[Cu(NH₃)₄(H₂O)₂]²⁺","deep-blue solution\ndistorted octahedral",fill="#dce5ff",outline=PURPLE,body_size=19,wrap_width=32)
arrow(d,(485,310),(590,310),ORANGE,4,14); d.text((537,270),"excess Cl⁻",font=font(18,True),fill=ORANGE,anchor="mm")
# route the ammonia pathway below the complex boxes so it does not cross the chloride complex
d.line((280,435,280,480),fill=TEAL,width=4)
d.line((280,480,1320,480),fill=TEAL,width=4)
arrow(d,(1320,480),(1320,435),TEAL,4,14)
d.text((800,450),"excess NH₃(aq)",font=font(18,True),fill=TEAL,anchor="mm")
box(d,(130,520,1470,720),"Ammonia added in two stages","A small amount of NH₃ first removes H⁺ from coordinated water and forms pale-blue Cu(OH)₂(s). In excess NH₃, the precipitate dissolves as the deep-blue ammine complex forms.",fill="#edf8f4",outline=TEAL,wrap_width=108)
box(d,(130,760,1470,925),"Why replacement can be favourable","When one bidentate ligand replaces two monodentate ligands, the number of free particles can increase. A positive entropy change helps drive the replacement.",fill="#fff4e8",outline=ORANGE,wrap_width=108)
save(im,"11-copper-ligand-replacement.png")

# 12 transition-metal colours and hydroxide tests
im,d=base("Transition-metal ion colours and hydroxide tests","Use freshly made observations and distinguish the solution colour from the precipitate colour.")
table(d,(60,170,1520,802),["ion; solution colour","NaOH(aq) precipitate","excess NaOH","NH₃(aq); then excess"],[
("Cr³⁺; green","green-blue","soluble; deep-green solution","green-blue; insoluble"),
("Mn²⁺; pink","white; slowly brown/black","insoluble","white; insoluble"),
("Fe²⁺; green","green","insoluble","green; insoluble"),
("Fe³⁺; yellow/orange","brown","insoluble","brown; insoluble"),
("Co²⁺; pink","blue","insoluble","blue; soluble: yellow, then brown"),
("Ni²⁺; green","green","insoluble","green; soluble: blue solution"),
("Cu²⁺; blue","blue","insoluble","blue; soluble: deep-blue solution")
],[330,330,300,500],row_h=79,font_size=15)
box(d,(180,830,1420,945),"Recording observations","State the initial solution colour, the precipitate colour after a few drops, and whether it dissolves in excess reagent. For Mn²⁺, record the immediate white precipitate before it darkens in air.",fill="#fff8ef",outline=ORANGE,body_size=18,wrap_width=100)
save(im,"12-transition-hydroxide-tests.png")

# 13 vanadium sequence
im,d=base("Vanadium oxidation states during reduction with zinc","Acidified ammonium metavanadate is reduced stepwise. Record the sequence, not just the final colour.")
states=[
("V(V)","VO₂⁺","yellow",YELLOW),
("V(IV)","VO²⁺","blue",BLUE),
("V(III)","V³⁺","green",GREEN),
("V(II)","V²⁺","violet",PURPLE)]
for i,(ox,formula,colour,col) in enumerate(states):
    x=80+i*380
    d.rounded_rectangle((x,230,x+300,560),22,fill="white",outline=col,width=5)
    d.text((x+150,280),ox,font=font(30,True),fill=INK,anchor="mm")
    d.text((x+150,350),formula,font=font(35,True),fill=col,anchor="mm")
    d.ellipse((x+85,400,x+215,530),fill=col,outline=INK,width=3)
    d.text((x+150,590),colour,font=font(22,True),fill=col,anchor="mm")
    if i<3: arrow(d,(x+305,395),(x+370,395),RED,5,15)
box(d,(170,720,1430,910),"How to use electrode potentials","Choose an oxidising or reducing agent whose half-cell potential gives a positive E°cell for the required conversion. Then combine the balanced half-equations and cancel electrons.",fill="#eef5ff",outline=BLUE,wrap_width=102)
save(im,"13-vanadium-reduction-sequence.png")

# 14 standard hydrogen electrode
im,d=base("The standard hydrogen electrode and cell notation","The SHE is assigned E° = 0.00 V and is used as the reference for other half-cells.")
# SHE
d.rectangle((120,300,620,770),fill="#edf8f4",outline=TEAL,width=4)
d.line((370,220,370,600),fill=INK,width=10); d.rectangle((340,560,400,700),fill="#9aa6a8",outline=INK,width=3)
for y in [470,520,570]: d.ellipse((330,y,350,y+20),outline=BLUE,width=3)
d.text((170,260),"H₂(g), 100 kPa",font=font(20,True),fill=BLUE)
d.text((170,720),"H⁺(aq), 1.00 mol dm⁻³",font=font(19,True),fill=TEAL)
d.text((370,790),"platinised Pt electrode; 298 K",font=font(18,True),fill=INK,anchor="mm")
# copper half cell
d.rectangle((980,300,1480,770),fill="#e2f3ff",outline=BLUE,width=4)
d.line((1230,220,1230,680),fill="#b76d3c",width=16)
d.text((1060,720),"Cu²⁺(aq), 1.00 mol dm⁻³",font=font(19,True),fill=BLUE)
# bridge/voltmeter
d.arc((520,260,1080,440),180,360,fill=PURPLE,width=16)
d.rounded_rectangle((705,190,895,270),15,fill="white",outline=INK,width=4); d.text((800,230),"voltmeter",font=font(19,True),fill=INK,anchor="mm")
d.line((370,220,705,220),fill=INK,width=4); d.line((895,220,1230,220),fill=INK,width=4)
box(d,(250,845,1350,945),"Conventional notation","Pt(s) | H₂(g) | H⁺(aq) || Cu²⁺(aq) | Cu(s)     E°cell = +0.34 V",fill="#fff8ef",outline=ORANGE,body_size=21,wrap_width=92)
save(im,"14-standard-hydrogen-electrode.png")

# 15 emf and cell types
im,d=base("Cell emf, feasibility and cell types","Use reduction potentials as written: E°cell = E°cathode − E°anode.")
box(d,(80,180,760,430),"Worked Zn/Cu cell","Cu²⁺ + 2e⁻ → Cu      E° = +0.34 V\nZn²⁺ + 2e⁻ → Zn      E° = −0.76 V\n\nE°cell = +0.34 − (−0.76) = +1.10 V\nElectrons flow from Zn to Cu.",fill="#eef5ff",outline=BLUE,body_size=20,wrap_width=55)
box(d,(840,180,1520,430),"Prediction limits","A positive E°cell predicts thermodynamic feasibility under standard conditions. Actual direction and rate can change with concentration, gas pressure, temperature and slow kinetics.",fill="#fff4e8",outline=ORANGE,body_size=20,wrap_width=55)
table(d,(100,485,1500,805),["cell type","example","key idea"],[
("non-rechargeable","alkaline Zn/MnO₂ cell","cell reaction is not practically reversed"),
("rechargeable","Li/LiMnO₂ cell","external voltage drives the reverse reaction"),
("fuel cell","alkaline H₂/O₂ cell","fuel and oxygen are supplied continuously")
],[350,420,630],row_h=80,font_size=18)
box(d,(180,830,1420,955),"Environmental audit","Consider raw-material extraction, toxicity, energy used in manufacture and charging, useful life, collection, recycling and safe disposal.",fill="#edf8f4",outline=TEAL,body_size=18,wrap_width=100)
save(im,"15-emf-and-cell-types.png")

# 16 amines
im,d=base("Amines: classification, preparation and basicity","The nitrogen lone pair accepts H⁺. Its availability changes with attached groups.")
table(d,(80,180,1440,500),["class","general form","example"],[
("primary","RNH₂","CH₃CH₂NH₂"),
("secondary","R₂NH","(CH₃)₂NH"),
("tertiary","R₃N","(CH₃)₃N")
],[320,420,620],row_h=80,font_size=21)
box(d,(80,540,760,850),"Preparation routes","1. R–C≡N  →  R–CH₂NH₂ using LiAlH₄ in dry ether, followed by hydrolysis.\n2. Haloalkane + excess NH₃ gives a primary amine; further substitution can also occur.",fill="#eef5ff",outline=BLUE,body_size=20,wrap_width=52)
box(d,(840,540,1520,850),"Basicity in water","Alkyl groups release electron density towards N, increasing lone-pair availability. Hydration of the protonated amine and crowding around N also matter, so secondary amines are often the strongest simple alkylamines in water. Phenylamine is weaker because its lone pair is delocalised into the ring.",fill="#fff4e8",outline=ORANGE,body_size=18,wrap_width=54)
d.text((800,905),"amine + mineral acid ⇌ ammonium salt; add alkali to liberate the free amine",font=font(21,True),fill=TEAL,anchor="mm")
save(im,"16-amines-routes-basicity.png")

# 17 diazonium and azo dye
im,d=base("From nitrobenzene to an azo dye","Temperature control is essential when forming benzenediazonium chloride.")
nodes=[(100,250,380,"nitrobenzene","C₆H₅NO₂",ORANGE),(500,250,780,"phenylammonium salt","C₆H₅NH₃⁺Cl⁻",BLUE),(900,250,1180,"phenylamine","C₆H₅NH₂",TEAL),(1220,250,1500,"diazonium salt","C₆H₅N₂⁺Cl⁻",PURPLE)]
for x1,y,x2,t,f,col in nodes:
    box(d,(x1,y,x2,y+190),t,f,outline=col,title_fill=col,body_size=22,wrap_width=22)
arrow(d,(385,345),(490,345),INK,4,14); d.text((438,300),"Sn/HCl",font=font(17,True),fill=INK,anchor="mm")
arrow(d,(785,345),(890,345),INK,4,14); d.text((838,300),"NaOH",font=font(17,True),fill=INK,anchor="mm")
arrow(d,(1185,345),(1210,345),INK,4,12)
d.text((1198,205),"NaNO₂ + HCl\n0–5 °C",font=font(16,True),fill=RED,anchor="mm",align="center")
arrow(d,(1360,450),(1360,590),PURPLE,5,15)
box(d,(1060,610,1510,830),"Azo coupling","Couple with phenol in alkaline solution or with phenylamine to form an –N=N– linkage and an extended delocalised system.",fill="#fff4e8",outline=ORANGE,wrap_width=35)
box(d,(90,610,940,850),"Why azo dyes are coloured","Delocalisation across both aromatic rings and the azo linkage makes electronic energy levels closer together. Visible light can then promote electrons between them; the complementary colour is observed.",fill="#edf8f4",outline=TEAL,wrap_width=67)
save(im,"17-diazonium-azo-route.png")

# 18 amides and amino acids
im,d=base("Amides and amino acids","Delocalisation makes amides much less basic than amines; amino acids exist mainly as zwitterions in the solid state.")
box(d,(70,180,760,470),"Amide reactions","Preparation: RCOCl + 2NH₃ → RCONH₂ + NH₄Cl\nAcid hydrolysis: RCONH₂ + H⁺ + H₂O → RCOOH + NH₄⁺\nAlkaline hydrolysis: RCONH₂ + OH⁻ → RCOO⁻ + NH₃\nDehydration: RCONH₂ → RCN + H₂O using P₄O₁₀.",fill="#eef5ff",outline=BLUE,body_size=19,wrap_width=54)
box(d,(840,180,1530,470),"Why amides are weak bases","The nitrogen lone pair overlaps with the carbonyl π system. It is delocalised and less available to bond to H⁺ than the localised lone pair in an amine.",fill="#fff4e8",outline=ORANGE,body_size=21,wrap_width=52)
# amino acid forms
d.rounded_rectangle((90,610,470,690),14,fill="white",outline=BLUE,width=3)
d.text((280,650),"H₂N–CH₂–COOH",font=font(25,True),fill=BLUE,anchor="mm")
d.text((280,720),"glycine; achiral",font=font(18,True),fill=BLUE,anchor="mm")
d.rounded_rectangle((530,610,970,690),14,fill="white",outline=TEAL,width=3)
d.text((750,650),"H₂N–CH(CH₃)–COOH",font=font(25,True),fill=TEAL,anchor="mm")
d.text((750,720),"alanine; chiral",font=font(18,True),fill=TEAL,anchor="mm")
d.rounded_rectangle((1030,610,1510,690),14,fill="white",outline=PURPLE,width=3)
d.text((1270,650),"⁺H₃N–CHR–COO⁻",font=font(25,True),fill=PURPLE,anchor="mm")
d.text((1270,720),"zwitterion",font=font(18,True),fill=PURPLE,anchor="mm")
box(d,(150,790,1450,930),"Consequences of the zwitterion","Strong ionic attractions explain relatively high melting points and good water solubility. The –COOH group reacts with bases/carbonates; the –NH₂ group reacts with acids.",fill="#edf8f4",outline=TEAL,wrap_width=104)
save(im,"18-amides-amino-acids.png")

# 19 proteins and enzymes
im,d=base("Peptide links, protein structure and induced fit","A protein’s three-dimensional shape depends on interactions between its amino-acid side chains.")
# peptide
d.text((800,190),"R–CH(NH₂)–C(=O)–NH–CH(R′)–COOH",font=font(31,True),fill=INK,anchor="mm")
d.rounded_rectangle((665,160,930,225),12,outline=ORANGE,width=4)
d.text((800,245),"peptide link: –C(=O)–NH–",font=font(20,True),fill=ORANGE,anchor="mm")
table(d,(100,330,1500,642),["level","meaning"],[
("primary","amino-acid sequence"),
("secondary","local folding, e.g. α-helix or β-sheet"),
("tertiary","overall 3D folding of one polypeptide")
],[350,1050],row_h=78,font_size=19)
# induced fit
box(d,(100,650,760,900),"Induced-fit model","1. Substrate approaches the active site.\n2. Weak interactions alter the enzyme shape slightly.\n3. The transition state is stabilised.\n4. Products leave; the enzyme can be reused.",fill="#eef5ff",outline=BLUE,body_size=19,wrap_width=50)
box(d,(840,650,1500,900),"Temperature and pH","Rising temperature initially increases collision rate. Above the optimum, bonds maintaining the active site are disrupted and activity falls. pH changes ionic interactions and can alter the active-site shape.",fill="#fff4e8",outline=ORANGE,body_size=19,wrap_width=50)
save(im,"19-proteins-enzymes.png")

# 20 condensation polymers
im,d=base("Condensation polymers: PET and nylon-6,6","Each link forms when bifunctional monomers react and a small molecule is eliminated.")
box(d,(70,180,760,520),"PET: a polyester","Monomers:\nHOOC–C₆H₄–COOH\nHO–CH₂CH₂–OH\n\nRepeat link:\n[–O–CH₂CH₂–O–C(=O)–C₆H₄–C(=O)–]ₙ\n\nUses: fibres, films and drinks bottles.",fill="#eef5ff",outline=BLUE,body_size=19,wrap_width=53)
box(d,(840,180,1530,520),"Nylon-6,6: a polyamide","Monomers:\nHOOC–(CH₂)₄–COOH\nH₂N–(CH₂)₆–NH₂\n\nRepeat link:\n[–NH–(CH₂)₆–NH–C(=O)–(CH₂)₄–C(=O)–]ₙ\n\nUses: fibres and engineering plastics.",fill="#edf8f4",outline=TEAL,body_size=18,wrap_width=53)
box(d,(120,610,1480,850),"Hydrolysis and biodegradability","Ester and amide links can be hydrolysed, breaking polymer chains. The practical rate depends on structure and conditions; hydrolysable does not mean every item decomposes rapidly in the environment.",fill="#fff4e8",outline=ORANGE,body_size=21,wrap_width=108)
d.text((800,915),"Draw the repeat unit by keeping both functional-group links and showing continuation bonds through the brackets.",font=font(19,True),fill=PURPLE,anchor="mm")
save(im,"20-condensation-polymers.png")

# 21 medicine chemistry
im,d=base("Chemistry in medicine: neutralisation and silver compounds","Clinical products require controlled doses and approved formulations; these are chemical principles, not treatment instructions.")
box(d,(70,180,500,520),"Indigestion remedies","Mg(OH)₂ + 2HCl → MgCl₂ + 2H₂O\n\nCaCO₃ + 2HCl → CaCl₂ + CO₂ + H₂O\n\nBack titration can measure the active ingredient.",fill="#eef5ff",outline=BLUE,body_size=19,wrap_width=32)
box(d,(585,180,1015,520),"Skin pH and wart treatments","Products may neutralise excessive acidity or alkalinity. Corrosive wart treatments destroy tissue chemically and must be used only as medically directed.",fill="#fff4e8",outline=ORANGE,body_size=19,wrap_width=32)
box(d,(1100,180,1530,520),"Silver nitrate","Ag⁺ compounds have antimicrobial action and controlled ophthalmic uses. Concentration, sterility and exposure must be medically controlled.",fill="#edf8f4",outline=TEAL,body_size=19,wrap_width=32)
box(d,(180,650,1420,900),"Back-titration evidence chain","known excess acid added → acid remaining measured with alkali → acid consumed by remedy calculated → moles and percentage of active ingredient found",fill="white",outline=PURPLE,body_size=22,wrap_width=98)
save(im,"21-medicine-neutralisation-silver.png")

# 22 cisplatin and aspirin
im,d=base("Cisplatin and aspirin","Structure determines biological action, solubility and analytical behaviour.")
# cisplatin square planar
cx,cy=360,390
d.ellipse((cx-35,cy-35,cx+35,cy+35),fill=PURPLE); d.text((cx,cy),"Pt",font=font(21,True),fill="white",anchor="mm")
for dx,dy,txt,col in [(0,-150,"Cl",GREEN),(150,0,"NH₃",BLUE),(0,150,"NH₃",BLUE),(-150,0,"Cl",GREEN)]:
    d.line((cx,cy,cx+dx,cy+dy),fill=INK,width=5); d.text((cx+dx,cy+dy),txt,font=font(22,True),fill=col,anchor="mm")
d.text((360,590),"cis-[Pt(NH₃)₂Cl₂], square planar",font=font(19,True),fill=PURPLE,anchor="mm")
box(d,(70,650,760,900),"Cisplatin action","After ligand exchange in cells, platinum binds to DNA bases and forms cross-links. This distorts DNA and interferes with replication. Changing ligand arrangement changes activity.",fill="#f5efff",outline=PURPLE,body_size=19,wrap_width=53)
box(d,(840,180,1530,520),"Aspirin synthesis","salicylic acid + ethanoic anhydride → aspirin + ethanoic acid\n\nPurify by recrystallisation; assess mass, percentage yield, melting range and chromatography.",fill="#eef5ff",outline=BLUE,body_size=21,wrap_width=52)
box(d,(840,600,1530,900),"Why a sodium salt can be used","Deprotonation forms an ionic carboxylate salt, usually increasing water solubility. Aspirin concentration can be determined by a validated volumetric method.",fill="#edf8f4",outline=TEAL,body_size=20,wrap_width=52)
save(im,"22-cisplatin-aspirin.png")

# 23 haemoglobin, carbon monoxide and EDTA
im,d=base("Haemoglobin, carbon monoxide and EDTA","Coordination chemistry explains oxygen transport, carbon-monoxide toxicity and calcium sequestration.")
box(d,(70,180,500,560),"Haemoglobin Fe²⁺","O₂ binds reversibly to Fe²⁺ in the haem group. Reversible coordination allows loading in the lungs and release in tissues.",fill="#eef5ff",outline=BLUE,body_size=20,wrap_width=32)
box(d,(585,180,1015,560),"Carbon monoxide","CO binds much more strongly than O₂ to haemoglobin. It occupies binding sites and also hinders oxygen release, reducing oxygen delivery.",fill="#fff4e8",outline=ORANGE,body_size=20,wrap_width=32)
box(d,(1100,180,1530,560),"EDTA and Ca²⁺","EDTA is hexadentate and forms a stable chelate with Ca²⁺. Removing free Ca²⁺ interrupts calcium-dependent steps in blood clotting.",fill="#edf8f4",outline=TEAL,body_size=20,wrap_width=32)
# central chelate
cx,cy=800,760
d.ellipse((cx-38,cy-38,cx+38,cy+38),fill=PURPLE); d.text((cx,cy),"Ca²⁺",font=font(18,True),fill="white",anchor="mm")
for a in range(0,360,60):
    rad=math.radians(a); x=cx+math.cos(rad)*145; y=cy+math.sin(rad)*105
    d.line((cx,cy,x,y),fill=PURPLE,width=4); d.ellipse((x-16,y-16,x+16,y+16),fill="#e1d6f5",outline=PURPLE)
d.text((800,910),"six donor atoms of EDTA coordinate to one Ca²⁺ ion",font=font(20,True),fill=PURPLE,anchor="mm")
save(im,"23-haemoglobin-co-edta.png")

print("rendered",len(list(OUT.glob("*.png"))),"A2 2 PNG files")
