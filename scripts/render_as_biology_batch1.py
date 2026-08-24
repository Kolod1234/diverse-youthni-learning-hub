from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math, textwrap

OUT = Path("public/lesson-assets/as-biology")
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1600, 980
BG, INK, MUTED = "#fbfaf7", "#17313b", "#55717b"
BLUE, TEAL, ORANGE, RED = "#2166c2", "#168a83", "#e07a2d", "#d94040"
PURPLE, GREEN, GOLD, GRID = "#7454b8", "#2f855a", "#d6a22d", "#d6e1e4"
WHITE, PALEBLUE, PALETEAL, PALEORANGE = "#ffffff", "#eef4ff", "#eef7f6", "#fff4e8"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def f(size, bold=False):
    return ImageFont.truetype(BOLD if bold else FONT, size)

def canvas(title, subtitle):
    im = Image.new("RGB", (W,H), BG)
    d = ImageDraw.Draw(im)
    d.text((65,30), title, font=f(42,True), fill=INK)
    d.text((67,88), subtitle, font=f(20), fill=MUTED)
    d.line((65,126,1535,126), fill=GRID, width=3)
    return im,d

def wrap(d, text, box, size=22, bold=False, fill=INK, spacing=8):
    x1,y1,x2,y2=box
    font=f(size,bold)
    maxw=x2-x1
    words=text.split()
    lines=[]; line=""
    for word in words:
        test=(line+" "+word).strip()
        if d.textlength(test,font=font)<=maxw: line=test
        else:
            if line: lines.append(line)
            line=word
    if line: lines.append(line)
    y=y1
    for line in lines:
        d.text((x1,y),line,font=font,fill=fill)
        y+=size+spacing
    return y

def panel(d, box, title, tint=WHITE, accent=BLUE):
    x1,y1,x2,y2=box
    d.rounded_rectangle(box,radius=18,fill=tint,outline=GRID,width=3)
    d.rectangle((x1,y1,x1+9,y2),fill=accent)
    d.text((x1+25,y1+18),title,font=f(25,True),fill=INK)

def label(d, xy, text, colour=INK, size=19, anchor="mm", bg=WHITE):
    x,y=xy
    bbox=d.textbbox((x,y),text,font=f(size,True),anchor=anchor)
    d.rounded_rectangle((bbox[0]-8,bbox[1]-5,bbox[2]+8,bbox[3]+5),radius=7,fill=bg,outline=GRID,width=1)
    d.text((x,y),text,font=f(size,True),fill=colour,anchor=anchor)

def arrow(d, a, b, colour=BLUE, width=7, head=18):
    d.line((a,b),fill=colour,width=width)
    ang=math.atan2(b[1]-a[1],b[0]-a[0])
    p1=(b[0]-head*math.cos(ang)+head*.55*math.sin(ang),b[1]-head*math.sin(ang)-head*.55*math.cos(ang))
    p2=(b[0]-head*math.cos(ang)-head*.55*math.sin(ang),b[1]-head*math.sin(ang)+head*.55*math.cos(ang))
    d.polygon((b,p1,p2),fill=colour)

def hexagon(cx,cy,r):
    return [(cx+r*math.cos(math.radians(60*i+30)),cy+r*math.sin(math.radians(60*i+30))) for i in range(6)]

def sugar(d,cx,cy,r=30,colour=BLUE,flip=False):
    pts=hexagon(cx,cy,r)
    d.polygon(pts,fill=WHITE,outline=colour,width=5)
    d.text((cx,cy),"G",font=f(18,True),fill=colour,anchor="mm")
    if flip:
        d.arc((cx-r-8,cy-r-8,cx+r+8,cy+r+8),0,180,fill=ORANGE,width=4)

def chain(d,x,y,n,spacing=62,branch=None,alternate=False,colour=BLUE):
    for i in range(n):
        sugar(d,x+i*spacing,y,25,colour,alternate and i%2==1)
        if i<n-1: d.line((x+i*spacing+25,y,x+(i+1)*spacing-25,y),fill=colour,width=5)
    if branch is not None:
        bx=x+branch*spacing
        d.line((bx,y-25,bx,y-67),fill=colour,width=5)
        sugar(d,bx,y-92,25,colour)

# 04 Polysaccharides, pentoses and ATP
im,d=canvas("Polysaccharides, pentose sugars and ATP","The glycosidic bonds, branching and monomer orientation determine biological function.")
panels=[(45,155,785,520),(815,155,1555,520),(45,550,785,930),(815,550,1555,930)]
panel(d,panels[0],"Starch: plant energy store",PALEBLUE,BLUE)
chain(d,120,300,8,70,branch=4,colour=BLUE)
label(d,(410,385),"α-glucose; α(1→4) chain with α(1→6) branch",BLUE,18)
wrap(d,"Amylose is unbranched and coils. Amylopectin is branched. Starch is compact and insoluble, so it has little osmotic effect.",(85,425,745,500),18,False,MUTED,5)
panel(d,panels[1],"Glycogen: animal and fungal store",PALETEAL,TEAL)
chain(d,890,300,8,70,branch=2,colour=TEAL); chain(d,890,390,8,70,branch=5,colour=TEAL)
label(d,(1185,470),"More frequent α(1→6) branches → rapid glucose release",TEAL,18)
panel(d,panels[2],"Cellulose: structural microfibrils",PALEORANGE,ORANGE)
for row in range(3):
    chain(d,105,660+row*78,9,68,alternate=True,colour=ORANGE)
for x in [170,306,442,578]:
    d.line((x,687,x,790),fill=TEAL,width=3)
label(d,(410,870),"β(1→4) chains; alternate β-glucose residues rotate 180°",ORANGE,18)
wrap(d,"Hydrogen bonds between parallel chains strengthen the microfibril.",(95,895,740,925),18,False,MUTED,4)
panel(d,panels[3],"Pentoses and ATP",WHITE,PURPLE)
d.polygon(hexagon(940,700,68),fill=PALEBLUE,outline=PURPLE,width=6)
d.text((940,700),"ribose",font=f(22,True),fill=PURPLE,anchor="mm")
d.ellipse((1115,625,1235,745),fill=PALETEAL,outline=TEAL,width=5)
d.text((1175,685),"adenine",font=f(18,True),fill=TEAL,anchor="mm")
for i in range(3):
    cx=1320+i*72
    d.ellipse((cx-28,657,cx+28,713),fill=PALEORANGE,outline=ORANGE,width=4)
    d.text((cx,685),"P",font=f(20,True),fill=ORANGE,anchor="mm")
d.line((1008,700,1115,685),fill=INK,width=5); d.line((1235,685,1292,685),fill=INK,width=5)
label(d,(1175,795),"ATP = adenine + ribose + three phosphate groups",PURPLE,18)
wrap(d,"Deoxyribose occurs in DNA and has one fewer oxygen atom than ribose.",(865,845,1505,905),18,False,MUTED,5)
im.save(OUT/"04-polysaccharides-pentoses-atp.png",optimize=True)

# 05 Lipids
im,d=canvas("Triglycerides, fatty acids and phospholipids","Condensation forms ester bonds; phospholipid amphipathic structure drives bilayer formation.")
panel(d,(45,155,1555,545),"A  Triglyceride formation",WHITE,BLUE)
d.text((180,235),"glycerol",font=f(23,True),fill=BLUE,anchor="mm")
d.text((180,300),"CH₂—OH",font=f(24),fill=INK,anchor="mm")
d.text((180,365),"CH—OH",font=f(24),fill=INK,anchor="mm")
d.text((180,430),"CH₂—OH",font=f(24),fill=INK,anchor="mm")
d.line((180,322,180,343),fill=INK,width=5)
d.line((180,387,180,408),fill=INK,width=5)
for i,y in enumerate((285,365,445)):
    d.text((440,y),f"HOOC—fatty-acid chain {i+1}",font=f(23),fill=GREEN)
arrow(d,(315,360),(380,360),ORANGE,6,16)
d.text((795,360),"+",font=f(36,True),fill=MUTED,anchor="mm")
arrow(d,(835,360),(945,360),BLUE,7,18)
d.text((1080,265),"triglyceride",font=f(23,True),fill=BLUE,anchor="mm")
product_rows=[(305,"CH₂—O—C(=O)—R₁"),(365,"CH—O—C(=O)—R₂"),(425,"CH₂—O—C(=O)—R₃")]
for y,formula in product_rows:
    d.text((990,y),formula,font=f(22),fill=INK)
    d.rounded_rectangle((1065,y-4,1215,y+31),radius=6,outline=RED,width=3)
d.line((1018,332,1018,352),fill=INK,width=5)
d.line((1018,392,1018,412),fill=INK,width=5)
d.text((1410,360),"+ 3H₂O",font=f(25,True),fill=ORANGE,anchor="mm")
label(d,(1135,492),"red boxes: ester bonds",RED,18)
panel(d,(45,575,765,930),"B  Saturated and unsaturated tails",PALEORANGE,ORANGE)
d.text((100,665),"saturated",font=f(22,True),fill=INK)
d.line([(260,675),(315,635),(370,675),(425,635),(480,675),(535,635)],fill=GREEN,width=10)
d.text((100,795),"cis-unsaturated",font=f(22,True),fill=INK)
d.line([(260,805),(315,765),(370,805),(425,845),(480,805),(535,765)],fill=BLUE,width=10)
label(d,(410,885),"C=C produces a kink; tails pack less tightly",BLUE,17)
panel(d,(795,575,1555,930),"C  Phospholipid bilayer",PALETEAL,TEAL)
for row,y,sign in [(0,690,1),(1,830,-1)]:
    for col in range(8):
        x=865+col*88
        d.ellipse((x-22,y-22,x+22,y+22),fill=BLUE,outline=INK,width=2)
        d.line((x-9,y+sign*22,x-16,y+sign*95),fill=ORANGE,width=7)
        d.line((x+9,y+sign*22,x+20,y+sign*95),fill=ORANGE,width=7)
label(d,(1175,625),"hydrophilic phosphate-containing heads face water",BLUE,17)
label(d,(1175,760),"hydrophobic fatty-acid tails face inward",ORANGE,17)
im.save(OUT/"05-lipids-triglycerides-phospholipids.png",optimize=True)

# 06 Proteins
im,d=canvas("From amino acids to protein structure","Peptide bonds build the chain; interactions between R groups determine the final shape.")
panel(d,(45,155,760,480),"A  Amino acid and peptide bond",PALEBLUE,BLUE)
d.text((245,270),"C",font=f(32,True),fill=INK,anchor="mm")
d.text((218,270),"H₂N—",font=f(28,True),fill=INK,anchor="rm")
d.text((272,270),"—COOH",font=f(28,True),fill=INK,anchor="lm")
d.line((245,242,245,210),fill=INK,width=5)
d.text((245,185),"H",font=f(28,True),fill=INK,anchor="mm")
d.line((245,298,245,330),fill=INK,width=5)
d.text((245,360),"R",font=f(30,True),fill=PURPLE,anchor="mm")
d.text((515,270),"—C(=O)—NH—",font=f(32,True),fill=INK,anchor="mm")
d.rounded_rectangle((420,235,610,305),radius=10,outline=RED,width=4)
label(d,(515,355),"peptide bond",RED,18)
wrap(d,"The amino group of one amino acid reacts with the carboxyl group of another. One H₂O is released.",(90,410,710,465),18,False,MUTED,4)
panel(d,(790,155,1555,480),"B  Primary → secondary",PALETEAL,TEAL)
pts=[(850+i*72,285+32*math.sin(i*.9)) for i in range(9)]
d.line(pts,fill=BLUE,width=10)
for i,p in enumerate(pts): d.ellipse((p[0]-12,p[1]-12,p[0]+12,p[1]+12),fill=WHITE,outline=BLUE,width=3)
label(d,(1110,205),"primary: amino-acid sequence",BLUE,18)
for turn in range(4):
    d.arc((1290+turn*45,255,1375+turn*45,390),70,290,fill=TEAL,width=8)
label(d,(1395,425),"secondary: α-helix or β-pleated sheet",TEAL,17)
panel(d,(45,510,760,930),"C  Tertiary structure",PALEORANGE,ORANGE)
fold=[(120,765),(185,610),(300,585),(360,720),(480,830),(625,735),(600,590),(490,555),(390,620),(310,810),(180,850),(120,765)]
d.line(fold,fill=ORANGE,width=13,joint="curve")
for x,y,t,c in [(245,650,"H bond",BLUE),(475,770,"ionic",PURPLE),(550,625,"S—S",RED),(250,820,"hydrophobic",GREEN)]:
    label(d,(x,y),t,c,16)
wrap(d,"Interactions between R groups fold one polypeptide into its specific three-dimensional shape.",(90,870,710,920),18,False,MUTED,4)
panel(d,(790,510,1555,930),"D  Quaternary structure",WHITE,PURPLE)
centres=[(1025,690),(1210,630),(1280,790),(1090,825)]
cols=[BLUE,TEAL,ORANGE,PURPLE]
for c,col in zip(centres,cols):
    x,y=c; d.ellipse((x-105,y-80,x+105,y+80),fill=col,outline=INK,width=4)
    d.text((x,y),"subunit",font=f(20,True),fill=WHITE,anchor="mm")
label(d,(1170,890),"two or more polypeptide subunits associate",PURPLE,18)
im.save(OUT/"06-amino-acids-protein-structure.png",optimize=True)

# 07 protein types
im,d=canvas("Fibrous, globular and conjugated proteins","Protein shape and any non-protein prosthetic group are directly related to function.")
boxes=[(45,155,770,500),(830,155,1555,500),(45,545,770,925),(830,545,1555,925)]
panel(d,boxes[0],"A  Collagen: fibrous",PALEBLUE,BLUE)
for k,col in enumerate([BLUE,TEAL,PURPLE]):
    pts=[]
    for x in range(110,710,8): pts.append((x,325+55*math.sin((x/55)+(k*2.1))))
    d.line(pts,fill=col,width=8)
label(d,(405,430),"three polypeptide chains form a strong rope-like triple helix",BLUE,17)
panel(d,boxes[1],"B  Enzyme: globular",PALETEAL,TEAL)
shape=[(950,360),(900,270),(980,215),(1090,245),(1160,195),(1325,245),(1400,355),(1340,440),(1190,420),(1070,455)]
d.polygon(shape,fill="#8ed6cf",outline=TEAL,width=7)
d.polygon([(1165,205),(1220,290),(1290,220)],fill=BG,outline=TEAL)
label(d,(1225,160),"active-site cleft",TEAL,17)
label(d,(1185,465),"compact, soluble shape with a specific binding site",TEAL,17)
panel(d,boxes[2],"C  Haemoglobin: conjugated",PALEORANGE,ORANGE)
for (x,y),col in zip([(250,700),(430,660),(470,820),(290,840)],[BLUE,TEAL,PURPLE,ORANGE]):
    d.ellipse((x-95,y-75,x+95,y+75),fill=col,outline=INK,width=4)
    d.ellipse((x-22,y-22,x+22,y+22),fill=RED,outline=INK,width=3)
label(d,(405,590),"four globin subunits",INK,17)
label(d,(405,900),"red centres: haem prosthetic groups containing Fe²⁺",RED,17)
panel(d,boxes[3],"D  Glycoprotein: conjugated",WHITE,PURPLE)
d.ellipse((1010,700,1390,885),fill="#c5b4ec",outline=PURPLE,width=7)
branch=[(1200,700),(1200,635),(1145,585),(1085,555),(1260,585),(1325,545)]
d.line(branch,fill=GREEN,width=10)
for x,y in branch[2:]: d.ellipse((x-17,y-17,x+17,y+17),fill=GOLD,outline=INK,width=2)
label(d,(1195,520),"carbohydrate chain",GREEN,17)
label(d,(1200,910),"protein + covalently attached carbohydrate",PURPLE,17)
im.save(OUT/"07-fibrous-globular-conjugated-proteins.png",optimize=True)

# 08 prions
im,d=canvas("Prion protein misfolding and templated conversion","A prion is an infectious protein conformation: it contains no nucleic acid genome.")
panel(d,(45,155,500,900),"1  Normal PrPᶜ",PALEBLUE,BLUE)
for i in range(5):
    d.arc((125+i*48,315,245+i*48,610),70,300,fill=BLUE,width=12)
label(d,(270,670),"α-helix-rich",BLUE,19)
wrap(d,"Normal cellular prion protein is membrane-associated and has a conformation rich in α-helical structure.",(90,720,455,850),18,False,MUTED,5)
panel(d,(570,155,1025,900),"2  Misfolded PrPˢᶜ",PALEORANGE,ORANGE)
for i in range(5):
    y=350+i*58
    d.rectangle((650,y,940,y+28),fill=ORANGE,outline=INK,width=2)
    d.polygon([(940,y),(985,y+14),(940,y+28)],fill=ORANGE,outline=INK)
label(d,(800,680),"β-sheet-rich",ORANGE,19)
wrap(d,"The misfolded form is more resistant to breakdown and can bind normal PrP, encouraging it to adopt the same abnormal conformation.",(620,720,980,870),18,False,MUTED,5)
panel(d,(1095,155,1555,900),"3  Aggregate and damage",PALETEAL,TEAL)
for row in range(6):
    for col in range(4):
        x=1165+col*85+(row%2)*20; y=300+row*70
        d.rounded_rectangle((x,y,x+65,y+30),radius=5,fill=ORANGE,outline=INK,width=2)
label(d,(1325,750),"protein aggregate",TEAL,19)
wrap(d,"Accumulating abnormal protein damages nervous tissue. Examples include scrapie, BSE and Creutzfeldt–Jakob disease.",(1140,790,1510,895),18,False,MUTED,5)
arrow(d,(500,520),(570,520),RED,8,22); arrow(d,(1025,520),(1095,520),RED,8,22)
im.save(OUT/"08-prion-protein-misfolding.png",optimize=True)

# 09 nucleotides DNA RNA
im,d=canvas("Nucleotides, DNA and RNA","A nucleotide contains phosphate, pentose sugar and a nitrogenous base.")
panel(d,(45,155,510,900),"A  One nucleotide",PALEBLUE,BLUE)
d.ellipse((125,285,285,445),fill=PALEORANGE,outline=ORANGE,width=6); d.text((205,365),"phosphate",font=f(21,True),fill=ORANGE,anchor="mm")
d.polygon(hexagon(280,590,90),fill=PALETEAL,outline=TEAL,width=6); d.text((280,590),"pentose\nsugar",font=f(20,True),fill=TEAL,anchor="mm")
d.rounded_rectangle((250,735,440,835),radius=15,fill="#f2edff",outline=PURPLE,width=6); d.text((345,785),"base",font=f(23,True),fill=PURPLE,anchor="mm")
d.line((245,440,268,515),fill=INK,width=6); d.line((315,665,330,735),fill=INK,width=6)
panel(d,(550,155,1115,900),"B  DNA: antiparallel double strand",WHITE,PURPLE)
leftx,rightx=665,995
for y in range(250,810,92):
    d.ellipse((leftx-24,y-24,leftx+24,y+24),fill=PALEORANGE,outline=ORANGE,width=3)
    d.polygon(hexagon(leftx,y+45,27),fill=PALETEAL,outline=TEAL,width=3)
    d.ellipse((rightx-24,y-24,rightx+24,y+24),fill=PALEORANGE,outline=ORANGE,width=3)
    d.polygon(hexagon(rightx,y+45,27),fill=PALETEAL,outline=TEAL,width=3)
    d.line((leftx,y+24,leftx,y+18+45),fill=INK,width=4); d.line((rightx,y+24,rightx,y+18+45),fill=INK,width=4)
pairs=[("A","T",2),("G","C",3),("T","A",2),("C","G",3),("A","T",2),("G","C",3)]
for idx,(a,b,n) in enumerate(pairs):
    y=295+idx*92
    d.text((745,y),a,font=f(22,True),fill=BLUE,anchor="mm"); d.text((915,y),b,font=f(22,True),fill=RED,anchor="mm")
    for k in range(n): d.line((770,y+(k-(n-1)/2)*8,890,y+(k-(n-1)/2)*8),fill=MUTED,width=2)
d.text((630,210),"5′",font=f(22,True),fill=INK); d.text((1005,210),"3′",font=f(22,True),fill=INK)
d.text((630,850),"3′",font=f(22,True),fill=INK); d.text((1005,850),"5′",font=f(22,True),fill=INK)
label(d,(830,875),"A–T: 2 hydrogen bonds; G–C: 3",PURPLE,16)
panel(d,(1155,155,1555,900),"C  RNA: single strand",PALETEAL,TEAL)
pts=[]
bases=["A","U","G","C","A","U"]
for i,b in enumerate(bases):
    y=260+i*100; x=1250+(i%2)*55
    pts.append((x,y))
    d.ellipse((x-22,y-22,x+22,y+22),fill=PALEORANGE,outline=ORANGE,width=3)
    d.polygon(hexagon(x,y+40,25),fill=PALEBLUE,outline=BLUE,width=3)
    d.rounded_rectangle((x+48,y+15,x+112,y+65),radius=8,fill=WHITE,outline=PURPLE,width=3)
    d.text((x+80,y+40),b,font=f(20,True),fill=PURPLE,anchor="mm")
d.line(pts,fill=TEAL,width=4)
label(d,(1350,835),"ribose; uracil replaces thymine",TEAL,16)
im.save(OUT/"09-nucleotides-dna-rna.png",optimize=True)

# 10 DNA replication and Meselson-Stahl
im,d=canvas("Semi-conservative DNA replication and Meselson–Stahl evidence","Each daughter DNA molecule contains one parental strand and one newly synthesised strand.")
panel(d,(45,155,780,900),"A  Semi-conservative replication",PALEBLUE,BLUE)
def dna_pair(d,x,y,length,old_left=True,old_right=True):
    colL=BLUE if old_left else ORANGE; colR=BLUE if old_right else ORANGE
    d.line((x,y,x,y+length),fill=colL,width=12); d.line((x+120,y,x+120,y+length),fill=colR,width=12)
    for yy in range(y+18,y+length,42): d.line((x+8,yy,x+112,yy),fill=GRID,width=4)
dna_pair(d,340,230,170,True,True)
label(d,(400,430),"parental DNA",BLUE,17)
arrow(d,(400,465),(400,535),TEAL,7,18)
dna_pair(d,175,580,185,True,False); dna_pair(d,510,580,185,False,True)
label(d,(235,805),"one old + one new",INK,16); label(d,(570,805),"one new + one old",INK,16)
d.text((120,855),"blue = parental strand",font=f(18,True),fill=BLUE)
d.text((460,855),"orange = new strand",font=f(18,True),fill=ORANGE)
panel(d,(820,155,1555,900),"B  ¹⁵N density-gradient evidence",WHITE,PURPLE)
tube_x=[930,1120,1325]; labels_top=["0 generations","1 generation","2 generations"]
for x,t in zip(tube_x,labels_top):
    d.rounded_rectangle((x,270,x+110,750),radius=50,fill="#edf5f8",outline=INK,width=4)
    d.text((x+55,220),t,font=f(17,True),fill=INK,anchor="mm")
# positions: light high 365, intermediate 500, heavy low 640
d.rectangle((940,628,1030,652),fill=BLUE)
d.rectangle((1130,488,1220,512),fill=PURPLE)
d.rectangle((1335,353,1425,375),fill=ORANGE)
d.rectangle((1335,628,1425,650),fill=BLUE)
label(d,(985,700),"heavy only",BLUE,15)
label(d,(1175,560),"intermediate only",PURPLE,15)
label(d,(1380,700),"heavy + light\nwould be conservative",RED,14)
# Correct the G2 label with equal light+intermediate, cover erroneous heavy marker
d.rectangle((1328,610,1432,665),fill="#edf5f8")
d.rectangle((1335,488,1425,510),fill=PURPLE)
d.rectangle((1335,353,1425,375),fill=ORANGE)
label(d,(1380,700),"light + intermediate",INK,15)
d.text((1485,360),"light",font=f(16,True),fill=ORANGE,anchor="lm")
d.text((1485,500),"intermediate",font=f(16,True),fill=PURPLE,anchor="lm")
d.text((1485,640),"heavy",font=f(16,True),fill=BLUE,anchor="lm")
wrap(d,"After transfer from ¹⁵N to ¹⁴N medium: generation 1 gives one intermediate band; generation 2 gives intermediate and light bands. This rules out conservative replication and supports semi-conservative replication.",(860,785,1515,890),18,False,MUTED,5)
im.save(OUT/"10-dna-replication-meselson-stahl.png",optimize=True)

print("rendered", len(list(OUT.glob("*.png"))), "AS Biology PNG files")
