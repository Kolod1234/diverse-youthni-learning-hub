from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import math

OUT = Path("public/lesson-assets/as-biology")
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1600, 900
BG = "#fbfaf7"
INK = "#17313b"
MUTED = "#55717b"
BLUE = "#2166c2"
TEAL = "#168a83"
RED = "#d94040"
WHITE = "#f8fafc"
SILVER = "#9aa7ad"
GREEN = "#2f855a"
PURPLE = "#7454b8"
GRID = "#d6e1e4"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def font(size, bold=False):
    return ImageFont.truetype(BOLD if bold else FONT, size)

def base(title, subtitle):
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((70, 34), title, font=font(42, True), fill=INK)
    d.text((72, 90), subtitle, font=font(21), fill=MUTED)
    d.line((70, 128, 1530, 128), fill=GRID, width=3)
    return im, d

def shadow(im, box, radius=16):
    layer = Image.new("RGBA", im.size, (0,0,0,0))
    ld = ImageDraw.Draw(layer)
    ld.ellipse(box, fill=(25,45,55,70))
    layer = layer.filter(ImageFilter.GaussianBlur(radius))
    im.paste(layer, (0,0), layer)

def sphere(im, d, center, radius, colour, outline=INK):
    cx, cy = center
    shadow(im, (cx-radius+10, cy-radius+14, cx+radius+10, cy+radius+14), max(6, radius//6))
    d.ellipse((cx-radius,cy-radius,cx+radius,cy+radius), fill=colour, outline=outline, width=max(2,radius//18))
    for i in range(8):
        rr = int(radius*(0.62-i*0.045))
        shade = 236 + i*2
        alpha = 22-i*2
        layer = Image.new("RGBA", im.size, (0,0,0,0))
        ld = ImageDraw.Draw(layer)
        hx, hy = cx-int(radius*0.32), cy-int(radius*0.34)
        ld.ellipse((hx-rr//3,hy-rr//3,hx+rr//3,hy+rr//3), fill=(shade,shade,shade,alpha))
        im.paste(layer,(0,0),layer)

def bond(d, a, b, width=28):
    d.line((a[0],a[1],b[0],b[1]), fill=SILVER, width=width)
    d.line((a[0]-3,a[1]-3,b[0]-3,b[1]-3), fill="#e8eef0", width=max(5,width//4))

def water(im, d, oxygen, angles, scale=1.0):
    ox, oy = oxygen
    bond_len = 86*scale
    orad, hrad = int(50*scale), int(30*scale)
    hs=[]
    for ang in angles:
        r=math.radians(ang)
        h=(int(ox+bond_len*math.cos(r)),int(oy+bond_len*math.sin(r)))
        bond(d,oxygen,h,max(12,int(24*scale)))
        hs.append(h)
    sphere(im,d,oxygen,orad,RED)
    for h in hs:
        sphere(im,d,h,hrad,WHITE,outline="#6d7a80")
    return hs

def dotted(d, a, b, colour=BLUE, step=18, radius=4):
    dx,dy=b[0]-a[0],b[1]-a[1]
    dist=max(1,math.hypot(dx,dy))
    n=max(2,int(dist/step))
    for i in range(1,n):
        t=i/n
        x=a[0]+dx*t; y=a[1]+dy*t
        d.ellipse((x-radius,y-radius,x+radius,y+radius),fill=colour)

def leader(d, points, text, text_xy, colour=INK, size=21, anchor="la"):
    d.line(points, fill=colour, width=3)
    x,y=points[-1]
    d.ellipse((x-5,y-5,x+5,y+5),fill=colour)
    d.text(text_xy,text,font=font(size),fill=colour,anchor=anchor)

def panel(d, box, label, title):
    d.rounded_rectangle(box, radius=22, fill="#ffffff", outline=GRID, width=3)
    x1,y1,x2,y2=box
    d.text((x1+28,y1+22),label,font=font(26,True),fill=BLUE)
    d.text((x1+72,y1+22),title,font=font(26,True),fill=INK)

# Figure 1
im,d=base("Water molecule and hydrogen bonding","Hydrogen bonds are intermolecular attractions; the O-H bonds within each molecule are polar covalent bonds.")
panel(d,(55,160,760,840),"A","One water molecule")
panel(d,(790,160,1545,840),"B","Hydrogen-bonded network")

O=(395,485)
hs=water(im,d,O,(37.75,142.25),1.55)
leader(d,[(235,330),(300,380),(360,435)],"oxygen atom, δ−",(80,300))
leader(d,[(180,700),(235,650),(275,610)],"hydrogen atom, δ+",(80,730))
leader(d,[(620,360),(560,420),(455,525)],"polar covalent O-H bond",(625,330),anchor="ma")
d.arc((270,360,520,610),start=38,end=142,fill=INK,width=3)
d.text((395,650),"104.5°",font=font(26,True),fill=INK,anchor="mm")

central=(1170,500)
top=(1170,310)
left=(955,500)
right=(1385,500)
bottom=(1115,705)
ht=water(im,d,top,(90,194.5),0.68)
hl=water(im,d,left,(0,104.5),0.68)
hc=water(im,d,central,(0,104.5),0.68)
hr=water(im,d,right,(180,284.5),0.68)
hb=water(im,d,bottom,(-75.5,180),0.68)
dotted(d,ht[0],central)
dotted(d,hl[0],central)
dotted(d,hc[0],right)
dotted(d,hc[1],bottom)
leader(d,[(1450,715),(1365,715),(1260,650),(1140,615)],"hydrogen bond",(1475,735),anchor="ra")
d.text((1170,810),"Each dotted line joins Hδ+ on one molecule to Oδ− on another.",font=font(18),fill=MUTED,anchor="mm")
im.save(OUT/"01-water-molecule-hydrogen-bonding.png",format="PNG",optimize=True)

# Figure 2
im,d=base("How water surrounds dissolved ions","The polar ends of water molecules orient differently around positive and negative ions.")
panel(d,(55,160,785,835),"A","Hydration of a cation")
panel(d,(815,160,1545,835),"B","Hydration of an anion")

def ion_sphere(im,d,c,r,fill,text):
    sphere(im,d,c,r,fill)
    d.text(c,text,font=font(30,True),fill="white",anchor="mm")

def small_water_radial(im,d,ion,angle,oxygen_inward=True):
    cx,cy=ion
    r=math.radians(angle)
    if oxygen_inward:
        O=(int(cx+145*math.cos(r)),int(cy+145*math.sin(r)))
        outward=math.degrees(r)
        water(im,d,O,(outward-52.25,outward+52.25),0.58)
    else:
        h_target=(int(cx+145*math.cos(r)),int(cy+145*math.sin(r)))
        O=(int(cx+220*math.cos(r)),int(cy+220*math.sin(r)))
        ang_to=math.degrees(math.atan2(h_target[1]-O[1],h_target[0]-O[0]))
        water(im,d,O,(ang_to,ang_to+104.5),0.58)

c1=(420,500); c2=(1180,500)
ion_sphere(im,d,c1,72,PURPLE,"Na⁺")
ion_sphere(im,d,c2,88,GREEN,"Cl⁻")
for a in range(0,360,60):
    small_water_radial(im,d,c1,a,True)
    small_water_radial(im,d,c2,a,False)

leader(d,[(95,250),(210,250),(285,325),(347,374)],"Oδ− faces the positive ion",(85,230))
leader(d,[(1510,250),(1435,250),(1360,350),(1252,374)],"Hδ+ faces the negative ion",(1515,230),anchor="ra")
d.text((420,780),"Water-ion attractions keep the cation dispersed in solution.",font=font(18),fill=MUTED,anchor="mm")
d.text((1180,780),"Water-ion attractions keep the anion dispersed in solution.",font=font(18),fill=MUTED,anchor="mm")
im.save(OUT/"02-water-hydration-shells.png",format="PNG",optimize=True)

print("rendered", len(list(OUT.glob("*.png"))), "AS Biology raster figures")
