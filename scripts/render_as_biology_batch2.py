from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math

OUT=Path("public/lesson-assets/as-biology"); OUT.mkdir(parents=True,exist_ok=True)
W,H=1600,980
BG,INK,MUTED="#fbfaf7","#17313b","#55717b"
BLUE,TEAL,ORANGE,RED,PURPLE,GREEN="#2166c2","#168a83","#e07a2d","#d94040","#7454b8","#2f855a"
WHITE,GRID,PB,PT,PO="#ffffff","#d6e1e4","#eef4ff","#eef7f6","#fff4e8"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"; BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def f(s,b=False): return ImageFont.truetype(BOLD if b else FONT,s)
def base(title,sub):
 im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
 d.text((65,30),title,font=f(42,1),fill=INK); d.text((67,88),sub,font=f(20),fill=MUTED)
 d.line((65,126,1535,126),fill=GRID,width=3); return im,d
def panel(d,b,t,tint=WHITE,accent=BLUE):
 x1,y1,x2,y2=b; d.rounded_rectangle(b,radius=18,fill=tint,outline=GRID,width=3); d.rectangle((x1,y1,x1+9,y2),fill=accent); d.text((x1+25,y1+18),t,font=f(24,1),fill=INK)
def arrow(d,a,b,c=BLUE,w=7,h=18):
 d.line((a,b),fill=c,width=w); ang=math.atan2(b[1]-a[1],b[0]-a[0]); p1=(b[0]-h*math.cos(ang)+h*.55*math.sin(ang),b[1]-h*math.sin(ang)-h*.55*math.cos(ang)); p2=(b[0]-h*math.cos(ang)-h*.55*math.sin(ang),b[1]-h*math.sin(ang)+h*.55*math.cos(ang)); d.polygon((b,p1,p2),fill=c)
def label(d,xy,t,c=INK,s=18,bg=WHITE):
 x,y=xy; bb=d.textbbox((x,y),t,font=f(s,1),anchor="mm"); d.rounded_rectangle((bb[0]-8,bb[1]-5,bb[2]+8,bb[3]+5),radius=6,fill=bg,outline=GRID); d.text((x,y),t,font=f(s,1),fill=c,anchor="mm")
def wrap(d,text,box,s=18,c=MUTED,spacing=5):
 x1,y1,x2,y2=box; words=text.split(); lines=[]; line=""
 for word in words:
  test=(line+" "+word).strip()
  if d.textlength(test,font=f(s))<=x2-x1: line=test
  else:
   lines.append(line); line=word
 if line: lines.append(line)
 y=y1
 for line in lines: d.text((x1,y),line,font=f(s),fill=c); y+=s+spacing
 return y
def enzyme_blob(d,box,notch=True,fill="#a9d8f4",outline=BLUE):
 x1,y1,x2,y2=box; pts=[(x1+35,y1+80),(x1+90,y1+20),(x1+190,y1+15),(x1+235,y1+65)]
 if notch: pts += [(x1+205,y1+95),(x1+245,y1+130)]
 pts += [(x2-25,y2-50),(x2-95,y2-10),(x1+100,y2-20),(x1+25,y2-90)]
 d.polygon(pts,fill=fill,outline=outline); d.line(pts+[pts[0]],fill=outline,width=5)
# 12 specificity/cofactors
im,d=base("Enzyme specificity, cofactors and coenzymes","The active site's three-dimensional chemistry determines binding; helper components have distinct roles.")
panel(d,(45,155,780,530),"A  Active-site specificity",PB,BLUE)
enzyme_blob(d,(100,225,450,470),True)
d.polygon([(500,260),(560,300),(520,345),(470,305)],fill=ORANGE,outline=INK)
label(d,(525,220),"substrate",ORANGE); label(d,(275,475),"active-site shape and charge are complementary",BLUE,17)
arrow(d,(455,305),(395,305),TEAL,6,16)
panel(d,(820,155,1555,530),"B  Enzyme–substrate complex",PT,TEAL)
enzyme_blob(d,(870,225,1220,470),True,fill="#9ee0cf",outline=TEAL)
d.polygon([(1080,275),(1135,310),(1095,350),(1045,312)],fill=ORANGE,outline=INK)
label(d,(1325,295),"temporary interactions",TEAL,17); d.line((1225,300,1140,315),fill=TEAL,width=3)
label(d,(1160,475),"binding positions reacting groups and lowers activation energy",TEAL,16)
panels=[(45,565,520,925,"C  Cofactor","inorganic helper, for example Mg²⁺ or Zn²⁺",BLUE,PB),(560,565,1040,925,"D  Coenzyme","small organic molecule that transfers a group or electrons",PURPLE,WHITE),(1080,565,1555,925,"E  Prosthetic group","non-protein component held tightly as part of a conjugated protein",ORANGE,PO)]
for x1,y1,x2,y2,t,desc,c,tint in panels:
 panel(d,(x1,y1,x2,y2),t,tint,c); enzyme_blob(d,(x1+65,y1+95,x1+310,y1+290),False,fill="#dcecf5",outline=c)
 d.ellipse((x2-135,y1+135,x2-65,y1+205),fill=c,outline=INK,width=3)
 wrap(d,desc,(x1+35,y2-90,x2-30,y2-25),17,MUTED,4)
im.save(OUT/"12-enzyme-specificity-cofactors.png",optimize=True)

# 13 action and activation energy
im,d=base("How enzymes lower activation energy","Catalysis changes the route and rate, not the energy difference between reactants and products.")
panel(d,(45,155,930,925),"A  Reaction-energy profile",WHITE,BLUE)
x0,y0=130,820; x1,y1=850,230
d.line((x0,y0,x0,220),fill=INK,width=4); d.line((x0,y0,860,y0),fill=INK,width=4)
d.multiline_text((82,500),"free\nenergy",font=f(18,1),fill=INK,anchor="mm",align="center",spacing=2)
d.text((500,865),"reaction progress",font=f(20,1),fill=INK,anchor="mm")
reactY,prodY=700,750
d.line((150,reactY,260,reactY),fill=INK,width=5); d.line((730,prodY,840,prodY),fill=INK,width=5)
# smooth curves
ptsU=[]; ptsC=[]
for i in range(121):
 x=250+i*4
 t=i/120
 basey=reactY+(prodY-reactY)*t
 peakU=360*math.sin(math.pi*t)**2
 peakC=180*math.sin(math.pi*t)**2
 ptsU.append((x,basey-peakU)); ptsC.append((x,basey-peakC))
d.line(ptsU,fill=RED,width=7); d.line(ptsC,fill=TEAL,width=7)
label(d,(545,320),"uncatalysed pathway",RED,17); label(d,(545,535),"enzyme-catalysed pathway",TEAL,17)
# Ea arrows
arrow(d,(330,reactY),(330,min(y for x,y in ptsU)+8),RED,5,14); d.text((305,500),"Eₐ",font=f(21,1),fill=RED,anchor="mm")
arrow(d,(700,reactY),(700,min(y for x,y in ptsC)+8),TEAL,5,14); d.text((725,600),"lower Eₐ",font=f(18,1),fill=TEAL,anchor="mm")
d.line((205,reactY,205,prodY),fill=PURPLE,width=5); d.polygon([(205,prodY),(195,prodY-16),(215,prodY-16)],fill=PURPLE); label(d,(225,725),"ΔG unchanged",PURPLE,16)
panel(d,(970,155,1555,520),"B  Lock-and-key model",PB,PURPLE)
enzyme_blob(d,(1020,245,1290,455),True,fill="#d9cdf4",outline=PURPLE)
d.polygon([(1340,290),(1400,330),(1360,370),(1305,330)],fill=ORANGE,outline=INK); arrow(d,(1310,330),(1230,330),PURPLE,5,14)
wrap(d,"The active site is treated as already complementary to the substrate.",(1010,445,1510,500),17,MUTED,4)
panel(d,(970,560,1555,925),"C  Induced-fit model",PT,TEAL)
enzyme_blob(d,(1020,650,1290,865),True,fill="#a9dfd7",outline=TEAL)
d.polygon([(1180,700),(1240,735),(1200,775),(1145,738)],fill=ORANGE,outline=INK)
d.arc((1095,655,1300,860),225,65,fill=TEAL,width=8)
wrap(d,"Initial binding causes a small conformational change that improves fit and strains reacting bonds.",(1010,865,1510,915),17,MUTED,4)
im.save(OUT/"13-enzyme-action-activation-energy.png",optimize=True)

# 14 rate graphs
im,d=base("Factors affecting enzyme-controlled reaction rate","Each graph assumes that other variables are controlled and initial rate is measured.")
boxes=[(45,155,780,520,"A  Temperature","temperature / °C"),(820,155,1555,520,"B  pH","pH"),(45,555,780,925,"C  Substrate concentration","substrate concentration"),(820,555,1555,925,"D  Enzyme concentration","enzyme concentration")]
for x1,y1,x2,y2,t,xlab in boxes:
 panel(d,(x1,y1,x2,y2),t,WHITE,BLUE); ax=(x1+90,y2-70); top=y1+80; right=x2-45
 d.line((ax[0],ax[1],ax[0],top),fill=INK,width=4); d.line((ax[0],ax[1],right,ax[1]),fill=INK,width=4)
 d.text((x1+35,(top+ax[1])/2),"initial rate",font=f(17,1),fill=INK,anchor="mm"); d.text(((ax[0]+right)/2,y2-32),xlab,font=f(17,1),fill=INK,anchor="mm")
 if t.startswith("A"):
  pts=[] 
  for i in range(101):
   q=i/100; x=ax[0]+q*(right-ax[0]); y=ax[1]-230*(q/.68)*math.exp(1-q/.68) if q<=.68 else ax[1]-230*math.exp(-13*(q-.68))
   pts.append((x,y))
  d.line(pts,fill=RED,width=7); d.line((ax[0]+.68*(right-ax[0]),top+15,ax[0]+.68*(right-ax[0]),ax[1]),fill=GRID,width=3); label(d,(ax[0]+.68*(right-ax[0]),top+15),"optimum",RED,15)
 elif t.startswith("B"):
  pts=[] 
  for i in range(101):
   q=i/100; x=ax[0]+q*(right-ax[0]); y=ax[1]-235*math.exp(-((q-.55)/.20)**2); pts.append((x,y))
  d.line(pts,fill=PURPLE,width=7); label(d,(ax[0]+.55*(right-ax[0]),top+15),"optimum",PURPLE,15)
 elif t.startswith("C"):
  pts=[]
  for i in range(101):
   q=i/100; x=ax[0]+q*(right-ax[0]); y=ax[1]-245*q/(.22+q); pts.append((x,y))
  d.line(pts,fill=TEAL,width=7); label(d,(right-145,top+38),"active sites saturated",TEAL,14)
 else:
  d.line((ax[0],ax[1],right,top+25),fill=ORANGE,width=7); label(d,(right-135,top+55),"substrate in excess",ORANGE,15)
im.save(OUT/"14-enzyme-rate-graphs.png",optimize=True)

# 15 inhibition
im,d=base("Competitive and non-competitive enzyme inhibition","The inhibitor's binding site determines whether increasing substrate concentration can overcome its effect.")
panel(d,(45,155,780,530),"A  Competitive inhibition",PB,BLUE)
enzyme_blob(d,(90,255,400,475),True)
d.polygon([(445,270),(505,310),(465,350),(410,312)],fill=ORANGE,outline=INK)
d.polygon([(445,395),(500,425),(470,465),(415,430)],fill=RED,outline=INK)
label(d,(575,300),"substrate",ORANGE); label(d,(575,425),"competitive inhibitor",RED)
arrow(d,(410,430),(350,350),RED,5,14)
wrap(d,"Substrate and inhibitor compete for the active site. More substrate can reduce the inhibitor's effect.",(90,470,730,515),17,MUTED,4)
panel(d,(820,155,1555,530),"B  Non-competitive inhibition",PT,TEAL)
enzyme_blob(d,(865,255,1180,475),True,fill="#a9dfd7",outline=TEAL)
d.polygon([(1090,300),(1145,330),(1110,370),(1055,335)],fill=ORANGE,outline=INK)
d.ellipse((930,420,995,485),fill=RED,outline=INK,width=3)
label(d,(1320,305),"active site altered",TEAL); label(d,(1320,435),"inhibitor binds elsewhere",RED)
d.line((1175,315,1260,305),fill=TEAL,width=3); d.line((995,450,1215,435),fill=RED,width=3)
panel(d,(45,565,780,925),"C  Competitive rate curves",WHITE,PURPLE)
panel(d,(820,565,1555,925),"D  Non-competitive rate curves",WHITE,ORANGE)
for x1,y1,x2,y2,kind in [(45,565,780,925,"comp"),(820,565,1555,925,"non")]:
 ax=(x1+90,y2-70); top=y1+75; right=x2-45
 d.line((ax[0],ax[1],ax[0],top),fill=INK,width=4); d.line((ax[0],ax[1],right,ax[1]),fill=INK,width=4)
 d.text((x1+28,(top+ax[1])/2),"rate",font=f(17,1),fill=INK,anchor="mm"); d.text(((ax[0]+right)/2,y2-30),"substrate concentration",font=f(17,1),fill=INK,anchor="mm")
 for inhibited,col in [(False,BLUE),(True,RED)]:
  pts=[]
  for i in range(101):
   q=i/100; vmax=230 if (kind=="comp" or not inhibited) else 145; km=.16 if not inhibited else (.42 if kind=="comp" else .16)
   x=ax[0]+q*(right-ax[0]); y=ax[1]-vmax*q/(km+q); pts.append((x,y))
  d.line(pts,fill=col,width=6)
 label(d,(right-100,top+25),"no inhibitor",BLUE,14); label(d,(right-100,top+65),"with inhibitor",RED,14)
im.save(OUT/"15-enzyme-inhibition.png",optimize=True)

# 16 biomarkers immobilisation biosensor
im,d=base("Enzyme biomarkers, immobilisation and biosensors","Enzymes can reveal tissue damage, be retained for reuse, or convert a chemical concentration into a measurable signal.")
panel(d,(45,155,520,925),"A  Enzyme biomarker",PB,BLUE)
d.ellipse((155,260,405,510),fill="#f6c6c6",outline=RED,width=6); d.text((280,385),"damaged\ncells",font=f(25,1),fill=RED,anchor="mm")
arrow(d,(280,520),(280,575),RED,6,16)
d.multiline_text((395,548),"membrane damage\nreleases enzymes",font=f(14,1),fill=RED,anchor="mm",align="center",spacing=2)
for i in range(8):
 x=120+i*45; y=600+(i%2)*40; d.ellipse((x,y,x+35,y+35),fill=BLUE,outline=INK,width=2)
label(d,(280,700),"enzyme activity rises in blood",BLUE,17)
wrap(d,"Measure activity over time and compare with a reference range. A biomarker supports diagnosis; it is not a diagnosis by itself.",(90,750,475,895),18,MUTED,5)
panel(d,(560,155,1040,925),"B  Immobilised enzyme",PT,TEAL)
d.rounded_rectangle((650,285,950,705),radius=35,fill="#d9f1ed",outline=TEAL,width=6)
for row in range(5):
 for col in range(4):
  x=700+col*70; y=335+row*70; d.ellipse((x-18,y-18,x+18,y+18),fill=TEAL,outline=INK,width=2); d.text((x,y),"E",font=f(16,1),fill=WHITE,anchor="mm")
arrow(d,(600,500),(650,500),BLUE,6,16); arrow(d,(950,500),(1000,500),ORANGE,6,16)
label(d,(620,450),"substrate",BLUE,15); label(d,(980,450),"product",ORANGE,15)
wrap(d,"Enzymes may be adsorbed, covalently attached, cross-linked or trapped in a gel. They remain in the reactor and can be reused.",(610,760,995,890),18,MUTED,5)
panel(d,(1080,155,1555,925),"C  Enzyme biosensor",PO,ORANGE)
# layers
layers=[(1140,300,1495,370,"sample","chemical being measured",BLUE),(1140,410,1495,480,"enzyme layer","specific reaction",TEAL),(1140,520,1495,590,"transducer","chemical change → electrical signal",PURPLE),(1140,630,1495,700,"display","concentration result",ORANGE)]
for x1,y1,x2,y2,t,sub,c in layers:
 d.rounded_rectangle((x1,y1,x2,y2),radius=12,fill=WHITE,outline=c,width=4); d.text((x1+20,y1+13),t,font=f(20,1),fill=c); d.text((x1+20,y1+41),sub,font=f(15),fill=MUTED)
 if y2<700: arrow(d,((x1+x2)//2,y2+4),((x1+x2)//2,y2+34),c,5,12)
wrap(d,"Specificity comes from the enzyme; the transducer converts the reaction into a calibrated signal.",(1130,770,1510,890),18,MUTED,5)
im.save(OUT/"16-enzyme-biomarkers-immobilisation-biosensor.png",optimize=True)
print("rendered enzyme visuals")
