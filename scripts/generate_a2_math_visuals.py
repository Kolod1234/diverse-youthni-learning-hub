from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Arc, Circle, FancyArrowPatch, Polygon, Rectangle
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "visuals"
OUT.mkdir(parents=True, exist_ok=True)

NAVY = "#071a2b"
ORANGE = "#f56a2d"
TEAL = "#119da4"
MINT = "#dff5f2"
INK = "#15283b"
MUTED = "#64758a"
PALE = "#eef3f7"
WHITE = "#ffffff"


def canvas(title, subtitle=""):
    fig, ax = plt.subplots(figsize=(12.8, 7.2), dpi=150)
    fig.patch.set_facecolor(WHITE)
    ax.set_facecolor(WHITE)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis("off")
    ax.text(0.45, 5.55, title, color=NAVY, fontsize=23, fontweight="bold", va="top")
    if subtitle:
        ax.text(0.45, 5.12, subtitle, color=MUTED, fontsize=11, va="top")
    ax.plot([0.45, 9.55], [4.85, 4.85], color=PALE, lw=2)
    return fig, ax


def save(fig, name):
    fig.savefig(OUT / name, bbox_inches="tight", facecolor=WHITE)
    plt.close(fig)


def axes(ax, origin=(1.2, 1.1), xend=9.2, yend=4.55, xlabel="x", ylabel="y"):
    ox, oy = origin
    ax.add_patch(FancyArrowPatch((ox, oy), (xend, oy), arrowstyle="-|>", mutation_scale=14, lw=1.5, color=INK))
    ax.add_patch(FancyArrowPatch((ox, oy), (ox, yend), arrowstyle="-|>", mutation_scale=14, lw=1.5, color=INK))
    ax.text(xend + .08, oy - .08, xlabel, color=INK, fontsize=11)
    ax.text(ox - .12, yend + .08, ylabel, color=INK, fontsize=11)


def reciprocal_trig():
    fig, ax = canvas("Reciprocal trigonometric functions", "The reciprocal functions inherit zeros, signs and asymptotes from sine and cosine.")
    axes(ax)
    xs = np.linspace(1.35, 9.0, 800)
    t = (xs - 1.35) * 1.25
    cos_t, sin_t = np.cos(t), np.sin(t)
    sec = np.divide(1, cos_t, out=np.full_like(cos_t, np.nan), where=np.abs(cos_t) > .015)
    csc = np.divide(1, sin_t, out=np.full_like(sin_t, np.nan), where=np.abs(sin_t) > .015)
    sec[np.abs(sec) > 3] = np.nan
    csc[np.abs(csc) > 3] = np.nan
    ax.plot(xs, 2.7 + .55 * sec, color=ORANGE, lw=2.5, label=r"$y=\sec x$")
    ax.plot(xs, 2.7 + .55 * csc, color=TEAL, lw=2.5, label=r"$y=\csc x$")
    for xv in xs[np.abs(np.cos(t)) < .02][::20]: ax.plot([xv, xv], [1.1, 4.55], ls="--", lw=.8, color="#d6dee6")
    ax.legend(loc="lower right", frameon=False, fontsize=11)
    save(fig, "reciprocal-trig.png")


def inverse_trig():
    fig, ax = canvas("Inverse trigonometric functions", "Restrict the original function so its inverse is one-to-one.")
    axes(ax, (1.1, 1.0), 9.25, 4.5)
    x = np.linspace(-1, 1, 300)
    xp = 5.0 + 2.8*x
    yp = 2.55 + 1.1*np.arcsin(x)
    ax.plot(xp, yp, color=ORANGE, lw=3)
    ax.plot([1.4, 8.8], [1.1, 4.4], color=PALE, lw=2, ls="--")
    ax.text(7.35, 4.03, r"$y=\sin^{-1}x$", color=ORANGE, fontsize=14)
    ax.text(6.55, 2.18, "reflection in y = x", color=MUTED, fontsize=10, rotation=22)
    save(fig, "inverse-trig.png")


def r_formula():
    fig, ax = canvas("The R-formula", "Two perpendicular components combine into one phase-shifted sinusoid.")
    base = np.array([2.0, 1.5]); u = np.array([4.0, 0.0]); v = np.array([0.0, 2.4]); total = u + v
    for vec, color, label, off in [(u, TEAL, "a", (.1,-.35)), (v, ORANGE, "b", (-.35,.1)), (total, NAVY, "R", (.1,.1))]:
        ax.add_patch(FancyArrowPatch(base, base+vec, arrowstyle="-|>", mutation_scale=16, lw=3, color=color))
        ax.text(*(base+vec+off), label, color=color, fontsize=14, fontweight="bold")
    ax.plot([base[0]+u[0], base[0]+u[0]], [base[1], base[1]+v[1]], ls="--", color="#bcc8d2")
    ax.add_patch(Arc(base, 1.7, 1.7, theta1=0, theta2=np.degrees(np.arctan2(v[1],u[0])), color=ORANGE, lw=2))
    ax.text(2.85, 1.63, r"$\alpha$", color=ORANGE, fontsize=13)
    ax.text(6.65, 3.75, r"$R=\sqrt{a^2+b^2}$", fontsize=17, color=NAVY, fontweight="bold")
    ax.text(6.65, 3.18, r"$\tan\alpha=b/a$", fontsize=14, color=INK)
    save(fig, "r-formula.png")


def trig_derivatives():
    fig, ax = canvas("Reciprocal trigonometric derivatives", "Derivative families are linked by reciprocal identities.")
    items = [(2.0,3.7,r"$\tan x$",r"$\sec^2 x$"),(5.0,3.7,r"$\sec x$",r"$\sec x\tan x$"),(8.0,3.7,r"$\csc x$",r"$-\csc x\cot x$")]
    for x,y,f,d in items:
        ax.add_patch(Rectangle((x-1.05,y-.55),2.1,1.1,facecolor=PALE,edgecolor="none"))
        ax.text(x,y+.12,f,ha="center",fontsize=15,color=NAVY)
        ax.add_patch(FancyArrowPatch((x,y-.65),(x,2.05),arrowstyle="-|>",mutation_scale=14,color=ORANGE,lw=2))
        ax.text(x,1.6,d,ha="center",fontsize=14,color=INK)
    save(fig, "trig-derivatives.png")


def area_between():
    fig, ax = canvas("Area between two curves", "Subtract lower from upper across the interval.")
    axes(ax)
    x = np.linspace(1.5, 8.8, 300)
    y1 = 2.0 + .18*(x-4.8)**2
    y2 = 4.1 - .11*(x-5.2)**2
    ax.plot(x,y1,color=TEAL,lw=2.5); ax.plot(x,y2,color=ORANGE,lw=2.5)
    mask=(x>2.2)&(x<8.0)&(y2>y1)
    ax.fill_between(x[mask],y1[mask],y2[mask],color=ORANGE,alpha=.18)
    ax.text(7.45,3.9,"upper",color=ORANGE,fontsize=11); ax.text(7.6,2.3,"lower",color=TEAL,fontsize=11)
    ax.text(4.4,2.95,r"$A=\int_a^b(f-g)\,dx$",color=NAVY,fontsize=15,fontweight="bold")
    save(fig, "area-between-curves.png")


def riemann():
    fig, ax = canvas("A limit of sums becomes an integral", "Rectangles approximate area; the approximation becomes exact as their width tends to zero.")
    axes(ax)
    f=lambda x: 1.35+.36*np.sqrt(x-1.2)+.08*(x-1.2)**1.35
    edges=np.linspace(1.4,8.8,13)
    for a,b in zip(edges[:-1],edges[1:]):
        h=f((a+b)/2)
        ax.add_patch(Rectangle((a,1.1),b-a,h-1.1,facecolor=MINT,edgecolor=TEAL,lw=1))
    x=np.linspace(1.4,8.8,300); ax.plot(x,f(x),color=ORANGE,lw=3)
    ax.text(5.9,4.0,r"$\lim\sum f(x_r)\Delta x=\int f(x)\,dx$",color=NAVY,fontsize=15)
    save(fig, "riemann-sum.png")


def volume():
    fig, ax = canvas("Volume of revolution", "A thin slice rotates into a disc of radius y.")
    axes(ax, (1.2,2.1),9.2,4.7)
    x=np.linspace(1.4,8.4,200); y=2.1+1.55*np.sin((x-1.4)/7*np.pi)
    ax.plot(x,y,color=ORANGE,lw=3); ax.plot(x,4.2-y,color=ORANGE,lw=2,alpha=.45)
    for xv in np.linspace(2,8,7):
        yy=np.interp(xv,x,y); ax.add_patch(Arc((xv,2.1),.42,2*(yy-2.1),theta1=0,theta2=360,color=TEAL,lw=1,alpha=.75))
    ax.text(5.6,4.25,r"$V=\pi\int_a^b y^2\,dx$",color=NAVY,fontsize=16,fontweight="bold")
    save(fig, "volume-revolution.png")


def root_sign():
    fig, ax = canvas("Locating a root by sign change", "A continuous curve crossing the axis must contain a root between opposite signs.")
    axes(ax,(1.2,2.5),9.2,4.65)
    x=np.linspace(1.4,8.8,400); y=2.5+.08*(x-5.1)**3-.55*(x-5.1)
    ax.plot(x,y,color=ORANGE,lw=3)
    a,b=4.15,5.55
    for xv,label in [(a,"a"),(b,"b")]: ax.plot([xv,xv],[2.35,2.65],color=NAVY,lw=2); ax.text(xv,2.05,label,ha="center",color=NAVY,fontsize=12)
    ax.fill_between([a,b],[1.3,1.3],[4.45,4.45],color=TEAL,alpha=.08)
    ax.text(3.25,4.15,r"$f(a)f(b)<0\Rightarrow$ root in $(a,b)$",fontsize=15,color=NAVY,fontweight="bold")
    save(fig, "root-sign-change.png")


def fixed_point():
    fig, ax = canvas("Fixed-point iteration", "The staircase alternates between the curve y=g(x) and the line y=x.")
    axes(ax)
    x=np.linspace(1.3,8.7,300); yline=1.1+.42*(x-1.2); g=2.8+.55*np.tanh((x-4.2)/1.5)
    ax.plot(x,yline,color=NAVY,lw=2,label="y = x"); ax.plot(x,g,color=ORANGE,lw=3,label="y = g(x)")
    p=2.0
    for _ in range(5):
        yy=np.interp(p,x,g); line_x=1.2+(yy-1.1)/.42
        ax.plot([p,p],[1.1+.42*(p-1.2),yy],color=TEAL,lw=1.8)
        ax.plot([p,line_x],[yy,yy],color=TEAL,lw=1.8); p=line_x
    ax.legend(frameon=False,loc="lower right")
    save(fig, "fixed-point.png")


def newton():
    fig, ax = canvas("Newton–Raphson iteration", "A tangent at the current estimate meets the x-axis at the next estimate.")
    axes(ax,(1.2,1.55),9.2,4.65)
    x=np.linspace(1.3,8.8,400); f=.12*(x-5.1)**2+1.0*(x-5.1)
    ax.plot(x,1.55+f,color=ORANGE,lw=3)
    x0=7.4; y0=1.55+.12*(x0-5.1)**2+(x0-5.1); m=.24*(x0-5.1)+1
    xt=np.array([3.5,8.0]); yt=y0+m*(xt-x0)
    ax.plot(xt,yt,color=TEAL,lw=2); x1=x0+(1.55-y0)/m
    ax.scatter([x0,x1],[y0,1.55],color=[ORANGE,TEAL],zorder=5)
    ax.text(x0,1.25,r"$x_n$",ha="center",color=ORANGE,fontsize=12); ax.text(x1,1.25,r"$x_{n+1}$",ha="center",color=TEAL,fontsize=12)
    ax.text(5.8,4.25,r"$x_{n+1}=x_n-\frac{f(x_n)}{f'(x_n)}$",fontsize=15,color=NAVY,fontweight="bold")
    save(fig, "newton-raphson.png")


def trapezium():
    fig, ax = canvas("The trapezium rule", "Straight-line strips approximate the area under a curve.")
    axes(ax)
    x=np.linspace(1.5,8.8,300); f=1.35+.55*np.sin((x-1.2)/2.1)+.18*(x-1.2)
    nodes=np.linspace(1.5,8.8,8); vals=np.interp(nodes,x,f)
    for a,b,ya,yb in zip(nodes[:-1],nodes[1:],vals[:-1],vals[1:]):
        ax.add_patch(Polygon([(a,1.1),(a,ya),(b,yb),(b,1.1)],closed=True,facecolor=MINT,edgecolor=TEAL,lw=1))
    ax.plot(x,f,color=ORANGE,lw=3); ax.scatter(nodes,vals,color=NAVY,s=18,zorder=5)
    save(fig, "trapezium-rule.png")


def vector_kinematics():
    fig, ax = canvas("Vector kinematics", "Position, velocity and acceleration retain both magnitude and direction.")
    origin=np.array([2.,1.4]); vectors=[(np.array([4.6,2.4]),ORANGE,r"$\mathbf{r}$"),(np.array([3.2,0.8]),TEAL,r"$\mathbf{v}$"),(np.array([.9,2.6]),NAVY,r"$\mathbf{a}$")]
    for v,c,l in vectors:
        ax.add_patch(FancyArrowPatch(origin,origin+v,arrowstyle="-|>",mutation_scale=18,lw=3,color=c)); ax.text(*(origin+v+.12),l,color=c,fontsize=14)
    ax.text(6.8,3.7,r"$\mathbf{v}=\frac{d\mathbf{r}}{dt}$",fontsize=16,color=INK)
    ax.text(6.8,3.0,r"$\mathbf{a}=\frac{d\mathbf{v}}{dt}$",fontsize=16,color=INK)
    ax.text(6.8,2.2,r"speed $=|\mathbf{v}|$",fontsize=14,color=MUTED)
    save(fig, "vector-kinematics.png")


def projectile():
    fig, ax = canvas("Projectile motion", "Horizontal velocity is constant; vertical acceleration is −g.")
    axes(ax)
    x=np.linspace(1.45,8.8,250); y=1.1+1.3*(x-1.45)-.18*(x-1.45)**2
    ax.plot(x,y,color=ORANGE,lw=3)
    p=np.array([1.45,1.1]); ax.add_patch(FancyArrowPatch(p,p+np.array([1.65,1.65]),arrowstyle="-|>",mutation_scale=16,lw=2.5,color=TEAL))
    ax.add_patch(FancyArrowPatch((7.0,4.0),(7.0,2.6),arrowstyle="-|>",mutation_scale=16,lw=2.5,color=NAVY)); ax.text(7.15,3.2,r"$g$",color=NAVY,fontsize=13)
    ax.text(2.35,2.25,r"$u\sin\theta$",color=TEAL,fontsize=11); ax.text(2.1,1.25,r"$u\cos\theta$",color=TEAL,fontsize=11)
    save(fig, "projectile.png")


def moments():
    fig, ax = canvas("Moments and equilibrium", "Moment = force × perpendicular distance from the pivot.")
    ax.plot([1.2,8.8],[2.5,2.5],color=NAVY,lw=8,solid_capstyle="round")
    ax.add_patch(Polygon([(4.5,1.25),(5.0,2.4),(5.5,1.25)],closed=True,facecolor=PALE,edgecolor=TEAL,lw=2))
    for x,f,c in [(2.0,"12 N",ORANGE),(7.7,"8 N",TEAL)]:
        ax.add_patch(FancyArrowPatch((x,4.0),(x,2.65),arrowstyle="-|>",mutation_scale=17,lw=3,color=c)); ax.text(x,4.15,f,ha="center",color=c,fontsize=12,fontweight="bold")
    ax.text(3.15,2.75,"3 m",ha="center",color=MUTED); ax.text(6.35,2.75,"2.7 m",ha="center",color=MUTED)
    ax.text(3.3,.65,r"equilibrium: $\sum F=0$ and $\sum M=0$",fontsize=16,color=NAVY,fontweight="bold")
    save(fig, "moments.png")


def ladder():
    fig, ax = canvas("A ladder in equilibrium", "Resolve forces and take moments about a point that removes unknown reactions.")
    ax.plot([1.2,9.0],[1.15,1.15],color=NAVY,lw=3); ax.plot([8.6,8.6],[1.15,4.65],color=NAVY,lw=3)
    ax.plot([2.1,8.6],[1.15,4.25],color=ORANGE,lw=7,solid_capstyle="round")
    ax.add_patch(FancyArrowPatch((5.35,3.9),(5.35,2.25),arrowstyle="-|>",mutation_scale=16,lw=2.5,color=TEAL)); ax.text(5.55,3.1,"W",color=TEAL,fontsize=13)
    ax.add_patch(FancyArrowPatch((2.1,1.15),(2.1,2.1),arrowstyle="-|>",mutation_scale=16,lw=2.5,color=NAVY)); ax.text(1.65,1.8,"R",color=NAVY,fontsize=12)
    ax.add_patch(Arc((2.1,1.15),1.4,1.4,theta1=0,theta2=25.5,color=ORANGE,lw=2)); ax.text(2.85,1.3,r"$\theta$",color=ORANGE,fontsize=13)
    save(fig, "ladder.png")


def explosion():
    fig, ax = canvas("Momentum in an explosion", "Internal forces change individual momenta but total momentum is conserved.")
    center=(5.0,2.8); ax.add_patch(Circle(center,.6,facecolor=PALE,edgecolor=ORANGE,lw=3)); ax.text(*center,"at rest",ha="center",va="center",fontsize=11,color=NAVY)
    for end,c,label in [((1.7,3.7),TEAL,r"$m_1\mathbf{v}_1$"),((8.5,1.7),ORANGE,r"$m_2\mathbf{v}_2$")]:
        ax.add_patch(FancyArrowPatch(center,end,arrowstyle="-|>",mutation_scale=18,lw=3,color=c)); ax.text(end[0],end[1]+.28,label,ha="center",color=c,fontsize=13)
    ax.text(3.25,.75,r"$m_1\mathbf{v}_1+m_2\mathbf{v}_2=\mathbf{0}$",fontsize=17,color=NAVY,fontweight="bold")
    save(fig, "explosion-momentum.png")


def probability_tree():
    fig, ax = canvas("A probability tree", "Multiply along a route; add mutually exclusive routes.")
    root=(1.2,2.8); level1=[(4.1,4.0),(4.1,1.65)]; leaves=[(8.1,4.55),(8.1,3.45),(8.1,2.2),(8.1,1.1)]
    labels1=[("A","P(A)"),("A′","1−P(A)")]; labels2=[("B","P(B|A)"),("B′","1−P(B|A)"),("B","P(B|A′)"),("B′","1−P(B|A′)")]
    for p,(lab,prob) in zip(level1,labels1):
        ax.plot([root[0],p[0]],[root[1],p[1]],color=NAVY,lw=2); ax.text((root[0]+p[0])/2,(root[1]+p[1])/2+.18,prob,color=MUTED,fontsize=10); ax.text(p[0]+.1,p[1],lab,color=NAVY,fontsize=12,fontweight="bold")
    for i,p in enumerate(level1):
        for q,(lab,prob) in zip(leaves[2*i:2*i+2],labels2[2*i:2*i+2]):
            ax.plot([p[0],q[0]],[p[1],q[1]],color=TEAL,lw=2); ax.text((p[0]+q[0])/2,(p[1]+q[1])/2+.13,prob,color=MUTED,fontsize=9); ax.text(q[0]+.1,q[1],lab,color=TEAL,fontsize=12,fontweight="bold")
    save(fig, "probability-tree.png")


def venn():
    fig, ax = canvas("Conditioning with a Venn diagram", "The condition becomes the new sample space.")
    ax.add_patch(Rectangle((1.2,1.0),7.8,3.5,facecolor=PALE,edgecolor=NAVY,lw=2))
    ax.add_patch(Circle((4.0,2.75),1.55,facecolor=ORANGE,alpha=.24,edgecolor=ORANGE,lw=2)); ax.add_patch(Circle((6.0,2.75),1.55,facecolor=TEAL,alpha=.24,edgecolor=TEAL,lw=2))
    ax.text(3.25,4.0,"A",color=ORANGE,fontsize=16,fontweight="bold"); ax.text(6.65,4.0,"B",color=TEAL,fontsize=16,fontweight="bold")
    ax.text(5.0,2.75,r"$A\cap B$",ha="center",va="center",color=NAVY,fontsize=15,fontweight="bold")
    ax.text(2.0,1.25,r"For $P(A\mid B)$, divide the overlap by all of B.",color=INK,fontsize=13)
    save(fig, "venn-conditional.png")


def normal_distribution():
    fig, ax = canvas("The normal distribution", "Mean controls location; standard deviation controls spread.")
    axes(ax,(1.1,1.1),9.3,4.6)
    x=np.linspace(1.3,9.0,500)
    for mu,s,c,l in [(5.0,1.25,ORANGE,r"smaller $\sigma$"),(5.0,2.0,TEAL,r"larger $\sigma$")]:
        y=1.1+8*np.exp(-.5*((x-mu)/s)**2)/(s*np.sqrt(2*np.pi)); ax.plot(x,y,color=c,lw=3,label=l)
    ax.plot([5,5],[1.1,4.25],ls="--",color=NAVY,lw=1.2); ax.text(5,0.82,r"$\mu$",ha="center",fontsize=13,color=NAVY)
    ax.legend(frameon=False,loc="upper right")
    save(fig, "normal-distribution.png")


def normal_probabilities():
    fig, ax = canvas("Normal probability regions", "Sketch the region before choosing a cumulative calculation.")
    x=np.linspace(-3.4,3.4,500); pdf=np.exp(-x*x/2)/np.sqrt(2*np.pi)
    panels=[(1.9,"lower tail",lambda z:z<-.7),(5.0,"central interval",lambda z:(z>-.8)&(z<1.1)),(8.1,"upper tail",lambda z:z>1.0)]
    for cx,label,maskfn in panels:
        xp=cx+0.8*x; yp=1.6+5.8*pdf; ax.plot(xp,yp,color=NAVY,lw=2); mask=maskfn(x); ax.fill_between(xp[mask],1.6,yp[mask],color=ORANGE,alpha=.55); ax.text(cx,1.05,label,ha="center",color=INK,fontsize=11,fontweight="bold")
    save(fig, "normal-probabilities.png")


def inverse_normal():
    fig, ax = canvas("Inverse normal: area to boundary", "A cumulative probability identifies z, then x = μ + zσ.")
    x=np.linspace(-3.5,3.5,500); xp=5+1.15*x; pdf=np.exp(-x*x/2)/np.sqrt(2*np.pi); yp=1.25+7.2*pdf
    ax.plot(xp,yp,color=NAVY,lw=2.5); z=.85; mask=x<z; ax.fill_between(xp[mask],1.25,yp[mask],color=TEAL,alpha=.38)
    xz=5+1.15*z; ax.plot([xz,xz],[1.25,3.3],ls="--",color=ORANGE,lw=2); ax.text(xz,1.0,"z",ha="center",color=ORANGE,fontsize=13)
    ax.text(2.25,2.1,"known area p",color=TEAL,fontsize=14,fontweight="bold"); ax.add_patch(FancyArrowPatch((3.4,2.15),(4.25,2.15),arrowstyle="-|>",mutation_scale=14,color=TEAL,lw=2))
    ax.text(7.25,3.65,r"$z=\Phi^{-1}(p)$",color=NAVY,fontsize=15); ax.text(7.25,3.05,r"$x=\mu+z\sigma$",color=INK,fontsize=15)
    save(fig, "inverse-normal.png")


def hypothesis_regions():
    fig, ax = canvas("One-tail and two-tail tests", "The alternative hypothesis fixes the rejection region before the data are inspected.")
    x=np.linspace(-3.3,3.3,500); pdf=np.exp(-x*x/2)/np.sqrt(2*np.pi)
    for cx,label,kind in [(2.7,"one-tailed",1),(7.3,"two-tailed",2)]:
        xp=cx+.95*x; yp=1.3+6.2*pdf; ax.plot(xp,yp,color=NAVY,lw=2)
        if kind == 1:
            mask = x > 1.45
            ax.fill_between(xp[mask], 1.3, yp[mask], color=ORANGE, alpha=.65)
        else:
            left, right = x < -1.75, x > 1.75
            ax.fill_between(xp[left], 1.3, yp[left], color=ORANGE, alpha=.65)
            ax.fill_between(xp[right], 1.3, yp[right], color=ORANGE, alpha=.65)
        ax.text(cx,.85,label,ha="center",color=INK,fontsize=12,fontweight="bold")
    save(fig, "hypothesis-regions.png")


def correlation():
    fig, ax = canvas("Correlation: direction and strength", "A sample coefficient describes linear association, not causation.")
    rng=np.random.default_rng(7)
    panels=[(2.1,.82,"positive"),(5.0,-.78,"negative"),(7.9,.05,"little linear")]
    for cx,rho,label in panels:
        u=rng.normal(size=34); v=rho*u+np.sqrt(max(0,1-rho*rho))*rng.normal(size=34)
        ax.scatter(cx+.45*u,2.8+.58*v,s=22,color=ORANGE if rho>0 else TEAL,alpha=.75,edgecolor="none")
        ax.text(cx,1.05,label,ha="center",color=INK,fontsize=11,fontweight="bold")
    save(fig, "correlation.png")


def scalar_product():
    fig, ax = canvas("Scalar product and projection", "The dot product measures the component of one vector in the direction of another.")
    o = np.array([1.8, 1.35]); a = np.array([6.4, 0.0]); b = np.array([4.3, 2.8])
    ax.add_patch(FancyArrowPatch(o, o+a, arrowstyle="-|>", mutation_scale=18, lw=3, color=TEAL))
    ax.add_patch(FancyArrowPatch(o, o+b, arrowstyle="-|>", mutation_scale=18, lw=3, color=ORANGE))
    projection = np.array([b[0], 0.0])
    ax.plot([o[0]+b[0], o[0]+b[0]], [o[1], o[1]+b[1]], ls="--", lw=1.5, color=MUTED)
    ax.plot([o[0], o[0]+projection[0]], [o[1]-0.12, o[1]-0.12], lw=5, color=NAVY, alpha=.7)
    ax.add_patch(Arc(o, 1.8, 1.8, theta1=0, theta2=np.degrees(np.arctan2(b[1], b[0])), color=ORANGE, lw=2))
    ax.text(2.7, 1.6, r"$\theta$", color=ORANGE, fontsize=14)
    ax.text(7.9, 1.02, r"$\mathbf{a}$", color=TEAL, fontsize=14, fontweight="bold")
    ax.text(6.25, 4.35, r"$\mathbf{b}$", color=ORANGE, fontsize=14, fontweight="bold")
    ax.text(4.3, .75, r"projection length $=|\mathbf{b}|\cos\theta$", ha="center", color=NAVY, fontsize=12)
    ax.text(6.75, 3.15, r"$\mathbf{a}\cdot\mathbf{b}=|\mathbf{a}||\mathbf{b}|\cos\theta$", color=INK, fontsize=14)
    save(fig, "scalar-product.png")


def vector_line():
    fig, ax = canvas("Vector equation of a line", "A fixed point plus every scalar multiple of a direction vector generates the line.")
    p = np.array([3.1, 2.2]); d = np.array([4.4, 1.4])
    ax.plot([1.1, 9.0], [1.56, 4.07], color=TEAL, lw=3)
    ax.scatter(*p, s=90, color=ORANGE, zorder=3)
    ax.add_patch(FancyArrowPatch((1.3, 1.0), p, arrowstyle="-|>", mutation_scale=17, lw=2.5, color=NAVY))
    ax.add_patch(FancyArrowPatch(p, p+d, arrowstyle="-|>", mutation_scale=17, lw=3, color=ORANGE))
    ax.text(1.05, .72, "origin", color=MUTED, fontsize=10)
    ax.text(p[0]-.3, p[1]+.35, r"point $\mathbf{a}$", color=ORANGE, fontsize=12)
    ax.text(5.25, 3.15, r"$\lambda\mathbf{d}$", color=ORANGE, fontsize=13)
    ax.text(5.55, 1.05, r"$\mathbf{r}=\mathbf{a}+\lambda\mathbf{d}$", color=NAVY, fontsize=18, fontweight="bold")
    save(fig, "vector-line.png")


def line_intersection():
    fig, ax = canvas("Intersection of vector lines", "At an intersection, both parameterisations describe the same position vector.")
    ax.plot([1.3, 8.9], [1.3, 4.2], color=TEAL, lw=3)
    ax.plot([1.6, 8.6], [4.25, 1.2], color=ORANGE, lw=3)
    x0, y0 = 5.08, 2.74
    ax.scatter(x0, y0, s=130, color=NAVY, zorder=4)
    ax.text(x0+.18, y0+.15, r"same $\mathbf{r}$", color=NAVY, fontsize=12, fontweight="bold")
    ax.text(1.35, 1.02, r"$\mathbf{r}=\mathbf{a}+\lambda\mathbf{d}$", color=TEAL, fontsize=13)
    ax.text(6.35, 4.18, r"$\mathbf{r}=\mathbf{b}+\mu\mathbf{e}$", color=ORANGE, fontsize=13)
    ax.text(2.1, .62, r"solve components together for $\lambda$ and $\mu$; verify every component", color=INK, fontsize=12)
    save(fig, "line-intersection.png")


def vector_applications():
    fig, ax = canvas("Vectors in equilibrium", "A closed force polygon represents zero resultant force.")
    points = [np.array([2.2,1.4]), np.array([6.7,1.4]), np.array([5.1,4.0]), np.array([2.2,1.4])]
    colors = [TEAL, ORANGE, NAVY]; labels = [r"$\mathbf{F}_1$", r"$\mathbf{F}_2$", r"$\mathbf{F}_3$"]
    for start, end, color, label in zip(points[:-1], points[1:], colors, labels):
        ax.add_patch(FancyArrowPatch(start, end, arrowstyle="-|>", mutation_scale=18, lw=3, color=color))
        mid=(start+end)/2; ax.text(mid[0], mid[1]+.24, label, color=color, fontsize=13, fontweight="bold")
    ax.text(6.7, 3.4, r"$\mathbf{F}_1+\mathbf{F}_2+\mathbf{F}_3=\mathbf{0}$", color=INK, fontsize=16)
    ax.text(6.7, 2.75, "Resolve into perpendicular components\nwhen magnitudes or angles are unknown.", color=MUTED, fontsize=11)
    save(fig, "vector-applications.png")


def work_energy():
    fig, ax = canvas("Work and energy transfer", "Only the force component parallel to displacement contributes to work.")
    block = Rectangle((2.0, 1.25), 1.7, 1.0, facecolor=PALE, edgecolor=NAVY, lw=2)
    ax.add_patch(block); ax.text(2.85,1.75,"mass m",ha="center",va="center",color=NAVY,fontsize=12)
    start=np.array([3.55,2.05]); end=np.array([6.4,3.65])
    ax.add_patch(FancyArrowPatch(start,end,arrowstyle="-|>",mutation_scale=18,lw=3,color=ORANGE))
    ax.add_patch(FancyArrowPatch((2.2,.95),(8.4,.95),arrowstyle="-|>",mutation_scale=18,lw=3,color=TEAL))
    ax.plot([start[0],6.4],[start[1],start[1]],ls="--",color=MUTED)
    ax.add_patch(Arc(start,1.5,1.5,theta1=0,theta2=29,color=ORANGE,lw=2))
    ax.text(4.15,2.18,r"$\theta$",color=ORANGE,fontsize=13); ax.text(5.25,3.28,r"$\mathbf{F}$",color=ORANGE,fontsize=14)
    ax.text(5.25,.6,r"displacement $s$",color=TEAL,fontsize=13)
    ax.text(6.0,1.72,r"$W=Fs\cos\theta$",color=NAVY,fontsize=18,fontweight="bold")
    save(fig, "work-energy.png")


def power_graph():
    fig, ax = canvas("Power as the rate of energy transfer", "Instantaneous power is the gradient of an energy–time graph.")
    axes(ax,(1.2,1.0),9.1,4.55,xlabel="time",ylabel="energy")
    x=np.linspace(1.4,8.7,200); y=1.1+.10*(x-1.4)**2+.18*(x-1.4)
    ax.plot(x,y,color=TEAL,lw=3)
    xt=6.1; yt=1.1+.10*(xt-1.4)**2+.18*(xt-1.4); slope=.2*(xt-1.4)+.18
    tx=np.array([4.7,7.5]); ty=yt+slope*(tx-xt)
    ax.plot(tx,ty,color=ORANGE,lw=2.5); ax.scatter(xt,yt,s=65,color=NAVY,zorder=3)
    ax.text(6.55,3.82,"tangent gradient",color=ORANGE,fontsize=11)
    ax.text(5.6,1.55,r"$P=\dfrac{dE}{dt}=\mathbf{F}\cdot\mathbf{v}$",color=NAVY,fontsize=16,fontweight="bold")
    save(fig, "power-graph.png")


def impulse_force_time():
    fig, ax = canvas("Impulse from a force–time graph", "The signed area under force against time equals change in momentum.")
    axes(ax,(1.2,1.1),9.1,4.55,xlabel="t",ylabel="F")
    pts=np.array([[2.0,1.1],[3.4,3.9],[6.3,3.0],[7.8,1.1]])
    ax.plot(pts[:,0],pts[:,1],color=ORANGE,lw=3)
    ax.fill_between(pts[:,0],1.1,pts[:,1],color=ORANGE,alpha=.25)
    ax.text(4.8,2.05,"area = impulse",ha="center",color=NAVY,fontsize=14,fontweight="bold")
    ax.text(5.75,.72,r"$\int F\,dt=\Delta(mv)$",color=INK,fontsize=15)
    save(fig, "impulse-force-time.png")


def elastic_collision():
    fig, ax = canvas("A direct elastic collision", "Momentum and kinetic energy are both conserved; relative speed of separation equals approach.")
    y1,y2=3.65,1.75
    for y,label in [(y1,"before"),(y2,"after")]: ax.text(.8,y,label,color=MUTED,fontsize=11,fontweight="bold")
    for x,c,m,y in [(2.4,TEAL,"m₁",y1),(7.1,ORANGE,"m₂",y1),(3.4,TEAL,"m₁",y2),(6.0,ORANGE,"m₂",y2)]:
        ax.add_patch(Circle((x,y),.48,facecolor=c,alpha=.22,edgecolor=c,lw=2)); ax.text(x,y,m,ha="center",va="center",color=NAVY,fontsize=11)
    ax.add_patch(FancyArrowPatch((2.9,y1),(4.9,y1),arrowstyle="-|>",mutation_scale=17,lw=3,color=TEAL))
    ax.add_patch(FancyArrowPatch((6.6,y1),(5.55,y1),arrowstyle="-|>",mutation_scale=17,lw=2.5,color=ORANGE))
    ax.add_patch(FancyArrowPatch((3.0,y2),(1.65,y2),arrowstyle="-|>",mutation_scale=17,lw=2.5,color=TEAL))
    ax.add_patch(FancyArrowPatch((6.5,y2),(8.35,y2),arrowstyle="-|>",mutation_scale=17,lw=3,color=ORANGE))
    ax.text(2.1,.72,r"$m_1u_1+m_2u_2=m_1v_1+m_2v_2$  and  $u_1-u_2=v_2-v_1$",color=NAVY,fontsize=14)
    save(fig, "elastic-collision.png")


def centre_mass():
    fig, ax = canvas("Centre of mass", "The balance point is the mass-weighted mean position.")
    ax.plot([1.5,8.8],[2.35,2.35],color=NAVY,lw=5)
    masses=[(2.2,.8,TEAL,"2 kg"),(5.1,1.35,ORANGE,"5 kg"),(7.7,.65,TEAL,"1 kg")]
    for x,size,c,label in masses:
        ax.add_patch(Circle((x,2.35),.28+.13*size,facecolor=c,alpha=.32,edgecolor=c,lw=2)); ax.text(x,3.05+.1*size,label,ha="center",color=c,fontsize=11,fontweight="bold")
    xbar=(2*2.2+5*5.1+1*7.7)/8
    ax.add_patch(Polygon([[xbar,2.28],[xbar-.48,1.1],[xbar+.48,1.1]],closed=True,facecolor=PALE,edgecolor=ORANGE,lw=2))
    ax.plot([xbar,xbar],[1.0,4.3],ls="--",color=ORANGE,lw=1.5); ax.text(xbar+.15,4.05,r"$\bar x$",color=ORANGE,fontsize=14)
    ax.text(5.65,.72,r"$\bar x=\dfrac{\sum m_ix_i}{\sum m_i}$",color=NAVY,fontsize=17,fontweight="bold")
    save(fig, "centre-mass.png")


def sampling_methods():
    fig, ax = canvas("Sampling design", "Begin with coverage, then choose a selection mechanism.")
    boxes=[(1.0,3.0,2.0,1.0,"target\npopulation",NAVY),(4.0,3.0,2.0,1.0,"sampling\nframe",TEAL),(7.0,3.0,2.0,1.0,"selected\nsample",ORANGE)]
    for x,y,w,h,label,c in boxes:
        ax.add_patch(Rectangle((x,y),w,h,facecolor=c,alpha=.15,edgecolor=c,lw=2)); ax.text(x+w/2,y+h/2,label,ha="center",va="center",color=c,fontsize=12,fontweight="bold")
    for a,b in [((3.0,3.5),(4.0,3.5)),((6.0,3.5),(7.0,3.5))]: ax.add_patch(FancyArrowPatch(a,b,arrowstyle="-|>",mutation_scale=15,lw=2,color=MUTED))
    labels=[("random",1.7), ("systematic",3.3), ("stratified",5.0), ("quota",6.7), ("opportunity",8.4)]
    for label,x in labels:
        ax.add_patch(Rectangle((x-.65,1.15),1.3,.65,facecolor=PALE,edgecolor="none")); ax.text(x,1.48,label,ha="center",va="center",color=INK,fontsize=9,fontweight="bold")
    ax.text(1.15,2.35,"coverage error",color=NAVY,fontsize=10); ax.text(7.1,2.35,"selection and non-response bias",color=ORANGE,fontsize=10)
    save(fig, "sampling-methods.png")


def normal_approx_binomial():
    fig, ax = canvas("Normal approximation to a binomial", "A half-unit correction aligns the smooth area with complete integer bars.")
    xs=np.arange(0,11); probs=np.array([.01,.025,.06,.11,.16,.19,.18,.13,.075,.035,.015])
    base=1.15; scale=13
    ax.bar(1.6+.65*xs,scale*probs,bottom=base,width=.58,color=TEAL,alpha=.32,edgecolor=TEAL)
    x=np.linspace(0,10,400); curve=.19*np.exp(-.5*((x-5.2)/2.05)**2)
    ax.plot(1.6+.65*x,base+scale*curve,color=ORANGE,lw=3)
    bound=1.6+.65*6.5; ax.plot([bound,bound],[base,4.35],ls="--",color=NAVY,lw=2)
    ax.text(bound+.12,4.08,"6.5 boundary",color=NAVY,fontsize=11)
    ax.text(2.0,.72,r"$P(X\leq6)\approx P(Y<6.5)$",color=INK,fontsize=15)
    save(fig, "normal-approx-binomial.png")


def linear_regression():
    fig, ax = canvas("Linear regression and residuals", "The y-on-x line predicts y; residuals are measured vertically.")
    rng=np.random.default_rng(14); x=np.linspace(1.7,8.5,18); y=1.15+.35*x+rng.normal(0,.34,len(x))
    ax.scatter(x,y,s=42,color=TEAL,alpha=.8); line=1.15+.35*x; ax.plot(x,line,color=NAVY,lw=2.5)
    idx=12; ax.plot([x[idx],x[idx]],[line[idx],y[idx]],color=ORANGE,lw=3)
    ax.scatter(x[idx],line[idx],s=50,color=ORANGE,zorder=4)
    ax.text(x[idx]+.18,(line[idx]+y[idx])/2,"residual",color=ORANGE,fontsize=11)
    ax.text(1.55,.72,r"$\hat y=a+bx$",color=NAVY,fontsize=16,fontweight="bold"); ax.text(4.5,.72,r"$e=y-\hat y$",color=INK,fontsize=15)
    save(fig, "linear-regression.png")


def poisson_distribution():
    fig, ax = canvas("Poisson probability mass", "The parameter λ is both the expected count and the variance.")
    xs=np.arange(0,12)
    for lam,color,offset in [(2,TEAL,-.13),(6,ORANGE,.13)]:
        probs=np.array([np.exp(-lam)*lam**int(k)/float(np.prod(np.arange(1,int(k)+1)) if k else 1) for k in xs])
        ax.bar(1.35+.68*xs+offset,10.2*probs,bottom=1.05,width=.24,color=color,alpha=.72,label=fr"$\lambda={lam}$")
    ax.plot([1.2,9.1],[1.05,1.05],color=NAVY,lw=1.5)
    for k in range(0,12,2): ax.text(1.35+.68*k,.78,str(k),ha="center",color=MUTED,fontsize=9)
    ax.legend(frameon=False,loc="upper right"); ax.text(1.35,.55,"event count r",color=INK,fontsize=11)
    save(fig, "poisson-distribution.png")


def continuous_rv():
    fig, ax = canvas("A continuous probability density", "Probability is area under the density over an interval.")
    axes(ax,(1.2,1.0),9.1,4.55,xlabel="x",ylabel="f(x)")
    x=np.linspace(1.2,9.0,500); y=1.0+2.8*np.exp(-.5*((x-5.1)/1.45)**2)
    ax.plot(x,y,color=NAVY,lw=3)
    mask=(x>=4.1)&(x<=6.65); ax.fill_between(x[mask],1.0,y[mask],color=TEAL,alpha=.42)
    ax.plot([4.1,4.1],[1.0,3.35],ls="--",color=ORANGE); ax.plot([6.65,6.65],[1.0,2.75],ls="--",color=ORANGE)
    ax.text(5.2,2.0,r"$P(a<X<b)$",ha="center",color=NAVY,fontsize=14,fontweight="bold")
    ax.text(4.0,.7,"a",color=ORANGE,fontsize=12); ax.text(6.58,.7,"b",color=ORANGE,fontsize=12)
    save(fig, "continuous-rv.png")


def distribution_comparison():
    fig, ax = canvas("Choosing a probability distribution", "Start with the variable and generating process, then identify parameters.")
    nodes=[(1.1,3.35,2.0,.8,"random variable",NAVY),(4.0,4.0,2.0,.8,"fixed n trials",TEAL),(7.2,4.0,2.0,.8,"Binomial n, p",ORANGE),(4.0,2.8,2.0,.8,"count per exposure",TEAL),(7.2,2.8,2.0,.8,"Poisson λ",ORANGE),(4.0,1.6,2.0,.8,"continuous value",TEAL),(7.2,1.6,2.0,.8,"Normal or density",ORANGE)]
    for x,y,w,h,label,c in nodes:
        ax.add_patch(Rectangle((x,y),w,h,facecolor=c,alpha=.13,edgecolor=c,lw=2)); ax.text(x+w/2,y+h/2,label,ha="center",va="center",color=c,fontsize=10,fontweight="bold")
    root=(3.1,3.75)
    for end in [(4.0,4.4),(4.0,3.2),(4.0,2.0)]: ax.add_patch(FancyArrowPatch(root,end,arrowstyle="-|>",mutation_scale=14,lw=1.8,color=MUTED))
    for y in [4.4,3.2,2.0]: ax.add_patch(FancyArrowPatch((6.0,y),(7.2,y),arrowstyle="-|>",mutation_scale=14,lw=1.8,color=MUTED))
    ax.text(1.2,1.08,"Check independence, constant probabilities/rates, shape, support and units.",color=INK,fontsize=12)
    save(fig, "distribution-comparison.png")


def kinematics_differentiation():
    fig, ax = canvas("Differentiating motion", "The tangent to displacement gives velocity; its changing gradient gives acceleration.")
    axes(ax,(1.2,1.0),9.1,4.55,xlabel="t",ylabel="s")
    x=np.linspace(1.4,8.7,300); y=2.4+.055*(x-5.1)**3-.34*(x-5.1)
    ax.plot(x,y,color=TEAL,lw=3)
    xt=6.5; yt=2.4+.055*(xt-5.1)**3-.34*(xt-5.1); slope=.165*(xt-5.1)**2-.34
    tx=np.array([5.25,7.8]); ax.plot(tx,yt+slope*(tx-xt),color=ORANGE,lw=2.5)
    ax.scatter(xt,yt,s=65,color=NAVY,zorder=4); ax.text(6.75,3.12,"tangent",color=ORANGE,fontsize=11)
    ax.text(5.75,.62,r"$v=ds/dt$,  $a=d^2s/dt^2$",color=NAVY,fontsize=15,fontweight="bold")
    save(fig, "kinematics-differentiation.png")


def kinematics_integration():
    fig, ax = canvas("Integrating motion", "Signed area under velocity gives displacement; split at zeros for total distance.")
    axes(ax,(1.2,2.35),9.1,4.6,xlabel="t",ylabel="v")
    x=np.linspace(1.35,8.8,400); y=2.35+.7*np.sin((x-1.3)*.75)
    ax.plot(x,y,color=NAVY,lw=3)
    ax.fill_between(x,2.35,y,where=y>=2.35,color=TEAL,alpha=.35)
    ax.fill_between(x,2.35,y,where=y<2.35,color=ORANGE,alpha=.35)
    ax.text(3.3,3.15,"positive displacement",ha="center",color=TEAL,fontsize=11)
    ax.text(7.0,1.5,"negative displacement",ha="center",color=ORANGE,fontsize=11)
    ax.text(5.1,.72,r"$s(t_2)-s(t_1)=\int_{t_1}^{t_2}v(t)\,dt$",ha="center",color=INK,fontsize=15)
    save(fig, "kinematics-integration.png")


def vector_calculus():
    fig, ax = canvas("Calculus with vector kinematics", "Velocity is tangent to the path; acceleration records the change in velocity.")
    t=np.linspace(-1.8,1.8,300); x=4.7+2.05*t; y=1.55+.72*t**2
    ax.plot(x,y,color=TEAL,lw=3)
    p=np.array([5.95,1.82]); v=np.array([2.2,.85]); a=np.array([0,1.55])
    ax.scatter(*p,s=75,color=NAVY,zorder=4)
    ax.add_patch(FancyArrowPatch(p,p+v,arrowstyle="-|>",mutation_scale=18,lw=3,color=ORANGE))
    ax.add_patch(FancyArrowPatch(p,p+a,arrowstyle="-|>",mutation_scale=18,lw=3,color=NAVY))
    ax.text(7.55,2.72,r"$\mathbf{v}=d\mathbf{r}/dt$",color=ORANGE,fontsize=12)
    ax.text(6.15,3.6,r"$\mathbf{a}=d\mathbf{v}/dt$",color=NAVY,fontsize=12)
    ax.text(1.35,.72,"Differentiate or integrate i- and j-components with the same time variable.",color=INK,fontsize=12)
    save(fig, "vector-calculus.png")


def numerical_context():
    fig, ax = canvas("Selecting a numerical method", "Match the tool to the evidence the question requires.")
    cards=[(1.0,3.0,1.8,1.1,"locate root\nsign change",TEAL),(3.1,3.0,1.8,1.1,"refine root\niteration",ORANGE),(5.2,3.0,1.8,1.1,"rapid refine\nNewton",NAVY),(7.3,3.0,1.8,1.1,"estimate area\ntrapezium",TEAL)]
    for x,y,w,h,label,c in cards:
        ax.add_patch(Rectangle((x,y),w,h,facecolor=c,alpha=.14,edgecolor=c,lw=2)); ax.text(x+w/2,y+h/2,label,ha="center",va="center",color=c,fontsize=10,fontweight="bold")
    for x in [1.9,4.0,6.1,8.2]: ax.add_patch(FancyArrowPatch((x,2.9),(5.05,1.55),arrowstyle="-|>",mutation_scale=13,lw=1.5,color=MUTED))
    ax.add_patch(Rectangle((3.65,.85),2.8,.8,facecolor=PALE,edgecolor=ORANGE,lw=2)); ax.text(5.05,1.25,"accuracy + units + context",ha="center",va="center",color=NAVY,fontsize=11,fontweight="bold")
    save(fig, "numerical-context.png")


GENERATORS = [
    reciprocal_trig, inverse_trig, r_formula, trig_derivatives, area_between, riemann,
    volume, root_sign, fixed_point, newton, trapezium, vector_kinematics, projectile,
    moments, ladder, explosion, probability_tree, venn, normal_distribution,
    normal_probabilities, inverse_normal, hypothesis_regions, correlation,
    scalar_product, vector_line, line_intersection, vector_applications,
    work_energy, power_graph, impulse_force_time, elastic_collision, centre_mass,
    sampling_methods, normal_approx_binomial, linear_regression, poisson_distribution,
    continuous_rv, distribution_comparison, kinematics_differentiation,
    kinematics_integration, vector_calculus, numerical_context,
]

if __name__ == "__main__":
    for generator in GENERATORS:
        generator()
    qa_dir = ROOT / "qa"
    qa_dir.mkdir(exist_ok=True)
    files = sorted(OUT.glob("*.png"))
    thumb_w, thumb_h, label_h, columns = 320, 180, 28, 4
    rows = int(np.ceil(len(files) / columns))
    sheet = Image.new("RGB", (columns * thumb_w, rows * (thumb_h + label_h)), "white")
    draw = ImageDraw.Draw(sheet)
    for index, file in enumerate(files):
        image = Image.open(file).convert("RGB")
        image.thumbnail((thumb_w, thumb_h))
        x = (index % columns) * thumb_w
        y = (index // columns) * (thumb_h + label_h)
        sheet.paste(image, (x + (thumb_w - image.width) // 2, y + (thumb_h - image.height) // 2))
        draw.text((x + 8, y + thumb_h + 5), file.name, fill=INK)
    sheet.save(qa_dir / "visual-contact-sheet.png")
    print(f"Generated {len(GENERATORS)} teaching visuals in {OUT}")

