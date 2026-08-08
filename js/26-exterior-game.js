(()=>{
  'use strict';

  const VERSION='exterior-game-v2.0-canvas';
  const WORLD_W=1600;
  const WORLD_H=900;

  const exterior=document.getElementById('mqExteriorGame');
  const canvas=document.getElementById('mqExteriorCanvas');
  const ticketLayer=document.getElementById('mqTicketLayer');
  const ticketMount=document.getElementById('mqTicketProfileMount');
  const walkCursor=document.getElementById('mqWalkCursor');
  const cinema=document.getElementById('cinema');
  const audioButton=document.getElementById('mqExteriorAudioButton');
  const audioPanel=document.getElementById('mqExteriorAudioPanel');
  const musicSlider=document.getElementById('mqExteriorMusicVolume');
  const sfxSlider=document.getElementById('mqExteriorSfxVolume');
  const musicOut=document.getElementById('mqExteriorMusicValue');
  const sfxOut=document.getElementById('mqExteriorSfxValue');

  if(!exterior||!canvas||!ticketLayer||!ticketMount||!cinema)return;

  const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});
  if(!ctx)return;

  let cssW=1,cssH=1,dpr=1,scale=1,offsetX=0,offsetY=0;
  let raf=0,lastFrame=0;
  let hoverBooth=false;
  let approaching=false;
  let ticketOpen=false;
  let entering=false;
  let auditoriumEntered=false;
  let wrapped=false;
  let originalShowView=null;
  let profilePanel=null;
  let profilePlaceholder=null;

  const steam=[];
  const headlights=[
    {phase:.05,lane:.34,speed:.015},
    {phase:.48,lane:.26,speed:.0105},
    {phase:.76,lane:.40,speed:.012}
  ];

  const booth={x:945,y:515,w:155,h:198};

  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function lerp(a,b,t){return a+(b-a)*t}
  function ease(t){return 1-Math.pow(1-clamp(t,0,1),3)}

  function roundRectPath(c,x,y,w,h,r){
    const rr=Math.min(r,w/2,h/2);
    c.beginPath();
    c.moveTo(x+rr,y);
    c.arcTo(x+w,y,x+w,y+h,rr);
    c.arcTo(x+w,y+h,x,y+h,rr);
    c.arcTo(x,y+h,x,y,rr);
    c.arcTo(x,y,x+w,y,rr);
    c.closePath();
  }

  function polygon(c,pts){
    c.beginPath();
    c.moveTo(pts[0][0],pts[0][1]);
    for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);
    c.closePath();
  }

  function gradientRect(x,y,w,h,top,bottom){
    const g=ctx.createLinearGradient(x,y,x,y+h);
    g.addColorStop(0,top);g.addColorStop(1,bottom);
    ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
  }

  function glowDot(x,y,r,color,alpha=1){
    ctx.save();
    const g=ctx.createRadialGradient(x,y,0,x,y,r*4);
    g.addColorStop(0,color.replace('ALPHA',String(alpha)));
    g.addColorStop(.22,color.replace('ALPHA',String(alpha*.55)));
    g.addColorStop(1,color.replace('ALPHA','0'));
    ctx.fillStyle=g;
    ctx.fillRect(x-r*4,y-r*4,r*8,r*8);
    ctx.restore();
  }

  function resize(){
    const rect=canvas.getBoundingClientRect();
    cssW=Math.max(1,rect.width);cssH=Math.max(1,rect.height);
    dpr=Math.min(window.devicePixelRatio||1,1.5);
    canvas.width=Math.max(1,Math.round(cssW*dpr));
    canvas.height=Math.max(1,Math.round(cssH*dpr));
    scale=Math.max(cssW/WORLD_W,cssH/WORLD_H);
    offsetX=(cssW-WORLD_W*scale)/2;
    offsetY=(cssH-WORLD_H*scale)/2;
  }

  function toWorld(clientX,clientY){
    const rect=canvas.getBoundingClientRect();
    return {
      x:(clientX-rect.left-offsetX)/scale,
      y:(clientY-rect.top-offsetY)/scale
    };
  }

  function boothHit(p){
    return p.x>=booth.x&&p.x<=booth.x+booth.w&&p.y>=booth.y&&p.y<=booth.y+booth.h;
  }

  function drawSky(t){
    const sky=ctx.createLinearGradient(0,0,0,650);
    sky.addColorStop(0,'#05070b');
    sky.addColorStop(.52,'#111821');
    sky.addColorStop(1,'#26181a');
    ctx.fillStyle=sky;ctx.fillRect(0,0,WORLD_W,WORLD_H);

    const moonGlow=ctx.createRadialGradient(325,70,0,325,70,360);
    moonGlow.addColorStop(0,'rgba(112,132,163,.13)');
    moonGlow.addColorStop(.38,'rgba(70,82,109,.07)');
    moonGlow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=moonGlow;ctx.fillRect(0,0,730,440);

    ctx.save();
    ctx.globalAlpha=.13;
    ctx.fillStyle='#738091';
    for(let i=0;i<8;i++){
      const x=80+i*210+Math.sin(t*.00007+i)*22;
      const y=105+(i%3)*28;
      ctx.beginPath();ctx.ellipse(x,y,155,28,0,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function drawSearchlights(t){
    ctx.save();
    ctx.globalCompositeOperation='screen';
    const baseX=1070,baseY=310;
    [-1,1].forEach((dir,i)=>{
      const ang=(i?-.37:-.74)+Math.sin(t*.00045+i*2.1)*.13;
      ctx.save();ctx.translate(baseX+(i*52),baseY);ctx.rotate(ang);
      const g=ctx.createLinearGradient(0,0,0,-610);
      g.addColorStop(0,'rgba(188,214,255,.15)');
      g.addColorStop(.38,'rgba(183,211,255,.075)');
      g.addColorStop(1,'rgba(183,211,255,0)');
      ctx.fillStyle=g;
      ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(9,0);ctx.lineTo(96,-610);ctx.lineTo(-96,-610);ctx.closePath();ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  }

  function drawDistantBuildings(t){
    const vpX=515,vpY=430;
    ctx.save();

    // left avenue blocks receding toward the vanishing point
    const blocks=[
      [0,180,250,650],[190,225,235,610],[362,275,150,560]
    ];
    blocks.forEach((b,idx)=>{
      const [x,y,w,bottom]=b;
      const grad=ctx.createLinearGradient(x,y,x+w,y);
      grad.addColorStop(0,idx?'#111317':'#16161a');
      grad.addColorStop(.7,'#272328');
      grad.addColorStop(1,'#0a0b0e');
      ctx.fillStyle=grad;ctx.fillRect(x,y,w,bottom-y);
      ctx.strokeStyle='rgba(125,103,83,.20)';ctx.lineWidth=2;ctx.strokeRect(x,y,w,bottom-y);
      const cols=Math.max(2,Math.floor(w/48));
      for(let c=0;c<cols;c++)for(let r=0;r<8;r++){
        const wx=x+18+c*(w-34)/cols;
        const wy=y+34+r*47;
        if(wy>bottom-30)continue;
        const on=((c*7+r*3+idx)%5)!==0;
        ctx.fillStyle=on?'rgba(228,167,78,.36)':'rgba(16,17,20,.88)';
        ctx.fillRect(wx,wy,13,22);
        if(on)glowDot(wx+6,wy+11,5,'rgba(235,177,88,ALPHA)',.10);
      }
    });

    // right background wall behind cinema
    const rg=ctx.createLinearGradient(1280,130,1600,130);
    rg.addColorStop(0,'#262126');rg.addColorStop(1,'#101115');
    ctx.fillStyle=rg;ctx.fillRect(1270,110,330,600);
    for(let r=0;r<7;r++)for(let c=0;c<4;c++){
      const x=1322+c*68,y=155+r*62;
      ctx.fillStyle=((r+c)%3)?'rgba(232,172,80,.48)':'#0d0f13';
      ctx.fillRect(x,y,26,34);
    }

    // rooftop water towers
    [[205,128,34],[386,215,25]].forEach(([x,y,r])=>{
      ctx.fillStyle='#111216';ctx.fillRect(x-r*.72,y+r*.8,r*1.44,70);
      ctx.beginPath();ctx.ellipse(x,y,r,r*.62,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(128,111,91,.25)';ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(x-r*.58,y+r*.5);ctx.lineTo(x-r*.8,y+r*2.5);ctx.moveTo(x+r*.58,y+r*.5);ctx.lineTo(x+r*.8,y+r*2.5);ctx.stroke();
    });

    // vertical hotel/cafe signs
    function sign(x,y,w,h,text,color){
      ctx.save();
      roundRectPath(ctx,x,y,w,h,4);ctx.fillStyle='#171316';ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
      ctx.translate(x+w/2,y+h/2);ctx.rotate(-Math.PI/2);ctx.fillStyle=color;ctx.font=`600 ${Math.max(13,w*.45)}px Oswald`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,0,0);ctx.restore();
    }
    sign(76,320,35,152,'HOTEL','#b63a3f');
    sign(285,365,31,116,'CAFE','#d18b32');

    ctx.restore();
  }

  function drawStreet(t){
    // sidewalk
    const side=ctx.createLinearGradient(0,610,0,760);
    side.addColorStop(0,'#4b4544');side.addColorStop(.35,'#2b2829');side.addColorStop(1,'#181719');
    ctx.fillStyle=side;
    polygon(ctx,[[0,640],[1600,607],[1600,752],[0,790]]);ctx.fill();

    // slab seams
    ctx.save();ctx.strokeStyle='rgba(205,185,159,.09)';ctx.lineWidth=2;
    for(let x=-100;x<1700;x+=145){ctx.beginPath();ctx.moveTo(x,642);ctx.lineTo(x+60,784);ctx.stroke()}
    for(let y=662;y<770;y+=42){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1600,y-34);ctx.stroke()}
    ctx.restore();

    // curb
    const curb=ctx.createLinearGradient(0,735,0,780);curb.addColorStop(0,'#6a605a');curb.addColorStop(.22,'#2c2a2b');curb.addColorStop(1,'#101114');
    ctx.fillStyle=curb;polygon(ctx,[[0,774],[1600,733],[1600,770],[0,814]]);ctx.fill();

    // road
    const road=ctx.createLinearGradient(0,760,0,900);road.addColorStop(0,'#111317');road.addColorStop(1,'#050608');ctx.fillStyle=road;ctx.fillRect(0,760,1600,140);
    const wet=ctx.createLinearGradient(0,760,0,900);wet.addColorStop(0,'rgba(213,152,67,.12)');wet.addColorStop(.35,'rgba(213,152,67,.035)');wet.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=wet;ctx.fillRect(0,760,1600,140);

    // marquee / lamp reflections
    ctx.save();ctx.globalCompositeOperation='screen';
    let g=ctx.createLinearGradient(850,720,850,900);g.addColorStop(0,'rgba(255,193,84,.25)');g.addColorStop(.3,'rgba(221,138,48,.08)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;polygon(ctx,[[670,715],[1300,700],[1190,900],[735,900]]);ctx.fill();
    g=ctx.createLinearGradient(1450,700,1450,900);g.addColorStop(0,'rgba(255,215,120,.20)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;polygon(ctx,[[1415,690],[1485,687],[1504,900],[1398,900]]);ctx.fill();
    ctx.restore();

    // puddle highlights
    ctx.save();ctx.strokeStyle='rgba(255,223,169,.12)';ctx.lineWidth=2;
    for(let i=0;i<26;i++){
      const x=(i*137)%1580,y=775+((i*47)%110);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+35+(i%4)*14,y-2);ctx.stroke();
    }
    ctx.restore();

    // steam grate
    ctx.save();ctx.translate(1215,794);ctx.rotate(-.04);ctx.fillStyle='#07080a';roundRectPath(ctx,-55,-7,110,17,4);ctx.fill();ctx.strokeStyle='#5b5148';ctx.lineWidth=2;ctx.stroke();ctx.strokeStyle='rgba(130,115,100,.38)';for(let x=-43;x<=43;x+=14){ctx.beginPath();ctx.moveTo(x,-4);ctx.lineTo(x,7);ctx.stroke()}ctx.restore();
  }

  function drawCinema(t){
    const flicker=(Math.sin(t*.0052)*.5+.5)*.08+.92;

    // ground shadow
    ctx.save();ctx.globalAlpha=.50;ctx.fillStyle='#000';ctx.filter='blur(16px)';ctx.beginPath();ctx.ellipse(1065,710,480,62,0,0,Math.PI*2);ctx.fill();ctx.filter='none';ctx.restore();

    // main facade front plane, slight perspective from right side
    const facade=ctx.createLinearGradient(600,160,1485,650);
    facade.addColorStop(0,'#292326');facade.addColorStop(.45,'#403630');facade.addColorStop(1,'#171517');
    ctx.fillStyle=facade;polygon(ctx,[[580,180],[1460,138],[1510,660],[600,704]]);ctx.fill();
    ctx.strokeStyle='rgba(196,157,95,.18)';ctx.lineWidth=3;ctx.stroke();

    // visible right side extrusion
    const side=ctx.createLinearGradient(1460,140,1590,200);side.addColorStop(0,'#18161a');side.addColorStop(1,'#090a0c');ctx.fillStyle=side;polygon(ctx,[[1460,138],[1570,190],[1590,625],[1510,660]]);ctx.fill();

    // horizontal stone courses / art deco ribs
    ctx.save();ctx.strokeStyle='rgba(218,186,132,.07)';ctx.lineWidth=2;
    for(let y=215;y<650;y+=47){ctx.beginPath();ctx.moveTo(598,y);ctx.lineTo(1498,y-35);ctx.stroke()}
    ctx.restore();

    // central art-deco tower
    const tower=ctx.createLinearGradient(910,80,1150,520);tower.addColorStop(0,'#3f3632');tower.addColorStop(.55,'#211d20');tower.addColorStop(1,'#111114');ctx.fillStyle=tower;polygon(ctx,[[900,122],[1100,103],[1160,538],[860,548]]);ctx.fill();
    ctx.strokeStyle='rgba(203,163,91,.22)';ctx.lineWidth=3;ctx.stroke();
    for(let x=892;x<=1125;x+=38){ctx.strokeStyle='rgba(211,177,114,.11)';ctx.beginPath();ctx.moveTo(x,135);ctx.lineTo(x+30,528);ctx.stroke()}
    // tower crest
    ctx.fillStyle='#211b1c';polygon(ctx,[[928,122],[950,76],[985,95],[1018,47],[1050,91],[1085,68],[1100,103]]);ctx.fill();ctx.strokeStyle='rgba(224,184,102,.20)';ctx.stroke();

    // facade name sign
    ctx.save();
    const signG=ctx.createLinearGradient(680,170,1375,260);signG.addColorStop(0,'#0b0a0b');signG.addColorStop(.5,'#241914');signG.addColorStop(1,'#09090a');ctx.fillStyle=signG;polygon(ctx,[[660,175],[1390,148],[1434,257],[642,285]]);ctx.fill();
    ctx.strokeStyle='rgba(222,175,80,.62)';ctx.lineWidth=3;ctx.stroke();
    ctx.shadowBlur=14;ctx.shadowColor='rgba(255,188,70,.60)';ctx.fillStyle=`rgba(255,218,140,${flicker})`;ctx.font='400 51px Limelight';ctx.textAlign='center';ctx.textBaseline='middle';ctx.translate(1035,214);ctx.rotate(-.027);ctx.fillText("JACKDAW'S CINEMA",0,0);ctx.restore();

    // marquee box 3D front
    const mx1=620,my1=294,mx2=1443,my2=265,mx3=1461,my3=442,mx4=603,my4=471;
    // side/extrusion
    ctx.fillStyle='#0a090a';polygon(ctx,[[mx2,my2],[1518,302],[1533,446],[mx3,my3]]);ctx.fill();
    // front lightbox
    const mg=ctx.createLinearGradient(0,my1,0,my4);mg.addColorStop(0,'#e9d5a6');mg.addColorStop(.48,'#d8c08e');mg.addColorStop(1,'#b69a66');ctx.fillStyle=mg;polygon(ctx,[[mx1,my1],[mx2,my2],[mx3,my3],[mx4,my4]]);ctx.fill();
    ctx.strokeStyle='#181414';ctx.lineWidth=10;ctx.stroke();ctx.strokeStyle='rgba(221,175,78,.65)';ctx.lineWidth=2;ctx.stroke();
    // letter board lines
    ctx.save();ctx.strokeStyle='rgba(72,62,50,.14)';ctx.lineWidth=1;for(let y=325;y<435;y+=18){ctx.beginPath();ctx.moveTo(625,y);ctx.lineTo(1452,y-29);ctx.stroke()}ctx.restore();

    // marquee exact text
    ctx.save();ctx.translate(1032,0);ctx.rotate(-.027);ctx.textAlign='center';ctx.fillStyle='#171514';ctx.shadowBlur=0;
    ctx.font='600 21px Oswald';ctx.fillText('TONIGHT ONLY',0,322);
    ctx.font='600 51px Oswald';ctx.letterSpacing='5px';ctx.fillText('MOVIE QUIZ',0,378);
    ctx.font='500 20px Oswald';ctx.fillText('ENTER THE CINEMA. PROVE YOUR FILM KNOWLEDGE.',0,418);ctx.restore();

    // deep underside + bulbs
    const ug=ctx.createLinearGradient(0,440,0,515);ug.addColorStop(0,'#2b2117');ug.addColorStop(1,'#080707');ctx.fillStyle=ug;polygon(ctx,[[603,471],[1461,442],[1505,493],[626,527]]);ctx.fill();
    ctx.strokeStyle='rgba(147,101,45,.46)';ctx.lineWidth=2;ctx.stroke();
    const chase=Math.floor(t/92)%6;
    for(let row=0;row<4;row++){
      const y=478+row*11;
      for(let i=0;i<54;i++){
        const x=625+i*15.5+row*3;
        const skew=-((x-625)/880)*29;
        const bright=((i+row+chase)%6)===0?1:.68;
        ctx.save();ctx.shadowBlur=bright?10:4;ctx.shadowColor='rgba(255,190,71,.86)';ctx.fillStyle=`rgba(255,224,139,${bright})`;ctx.beginPath();ctx.arc(x,y+skew,2.7,0,Math.PI*2);ctx.fill();ctx.restore();
      }
    }

    // entrance zone shadow panel
    ctx.fillStyle='#121012';polygon(ctx,[[640,525],[1455,493],[1485,655],[623,695]]);ctx.fill();

    // poster cases helper
    function posterCase(x,y,w,h,accent,title,sub,figure){
      ctx.save();ctx.fillStyle='#0a0909';roundRectPath(ctx,x-7,y-7,w+14,h+14,4);ctx.fill();ctx.strokeStyle='#8b6a36';ctx.lineWidth=3;ctx.stroke();
      const pg=ctx.createLinearGradient(x,y,x+w,y+h);pg.addColorStop(0,'#c5a56b');pg.addColorStop(.55,accent);pg.addColorStop(1,'#2d211a');ctx.fillStyle=pg;ctx.fillRect(x,y,w,h);
      // stylized illustrated figure
      ctx.fillStyle='rgba(15,14,13,.70)';ctx.beginPath();ctx.arc(x+w*.55,y+h*.35,w*.17,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(x+w*.35,y+h*.80);ctx.quadraticCurveTo(x+w*.53,y+h*.43,x+w*.76,y+h*.82);ctx.closePath();ctx.fill();
      ctx.fillStyle='#f0d28e';ctx.font=`600 ${Math.max(11,w*.12)}px Oswald`;ctx.textAlign='center';ctx.fillText(title,x+w/2,y+h*.14);ctx.fillStyle='#2b1713';ctx.font=`500 ${Math.max(8,w*.07)}px Oswald`;ctx.fillText(sub,x+w/2,y+h*.92);
      // glass reflection
      ctx.fillStyle='rgba(255,255,255,.08)';polygon(ctx,[[x+5,y+4],[x+w*.36,y+4],[x+w*.14,y+h-4],[x+5,y+h-4]]);ctx.fill();ctx.restore();
    }
    posterCase(640,540,102,132,'#8f3a2f','THRILL','TONIGHT');
    posterCase(755,535,101,137,'#c18a39','ROMANCE','A NEW PICTURE');
    posterCase(1334,515,104,143,'#415566','MYSTERY','MANHATTAN');

    // doors
    function door(x,y,w,h){
      const dg=ctx.createLinearGradient(x,y,x+w,y+h);dg.addColorStop(0,'#59381f');dg.addColorStop(.48,'#201514');dg.addColorStop(1,'#6b4122');ctx.fillStyle=dg;ctx.fillRect(x,y,w,h);ctx.strokeStyle='#a77b3b';ctx.lineWidth=3;ctx.strokeRect(x,y,w,h);
      ctx.fillStyle='rgba(234,176,83,.16)';ctx.fillRect(x+11,y+12,w-22,h*.43);ctx.strokeStyle='rgba(228,185,103,.32)';ctx.strokeRect(x+11,y+12,w-22,h*.43);
      ctx.fillStyle='#c39a50';ctx.fillRect(x+w*.77,y+h*.58,9,4);
    }
    door(873,540,70,151);door(1110,531,70,152);

    // ticket booth — real object + permanent glow
    ctx.save();
    const bx=booth.x,by=booth.y,bw=booth.w,bh=booth.h;
    ctx.shadowBlur=38;ctx.shadowColor='rgba(255,180,63,.50)';
    const bg=ctx.createLinearGradient(bx,by,bx+bw,by+bh);bg.addColorStop(0,'#51331e');bg.addColorStop(.45,'#171010');bg.addColorStop(1,'#73502a');ctx.fillStyle=bg;roundRectPath(ctx,bx,by,bw,bh,30);ctx.fill();
    ctx.shadowBlur=0;ctx.strokeStyle='#b58a43';ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle='#332311';ctx.lineWidth=2;ctx.stroke();
    // canopy
    ctx.fillStyle='#1a1110';roundRectPath(ctx,bx-10,by-8,bw+20,36,13);ctx.fill();ctx.strokeStyle='#c3984b';ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle='#e2c170';ctx.font='500 15px Oswald';ctx.textAlign='center';ctx.fillText('TICKETS',bx+bw/2,by+15);
    // window glass with strong permanent warm light
    const wg=ctx.createRadialGradient(bx+bw*.52,by+bh*.44,5,bx+bw*.52,by+bh*.44,bw*.70);wg.addColorStop(0,'rgba(255,242,195,.92)');wg.addColorStop(.30,'rgba(245,185,89,.70)');wg.addColorStop(.72,'rgba(114,61,31,.35)');wg.addColorStop(1,'rgba(21,15,14,.85)');ctx.fillStyle=wg;roundRectPath(ctx,bx+18,by+35,bw-36,bh-76,12);ctx.fill();ctx.strokeStyle='#d4a85a';ctx.lineWidth=2;ctx.stroke();
    // attendant silhouette
    ctx.fillStyle='rgba(24,17,15,.72)';ctx.beginPath();ctx.arc(bx+bw*.53,by+86,21,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(bx+bw*.31,by+159);ctx.quadraticCurveTo(bx+bw*.52,by+103,bx+bw*.76,by+159);ctx.closePath();ctx.fill();
    // glass shine
    ctx.fillStyle='rgba(255,255,255,.14)';polygon(ctx,[[bx+27,by+44],[bx+58,by+39],[bx+39,by+154],[bx+22,by+151]]);ctx.fill();
    // counter
    ctx.fillStyle='#21130e';ctx.fillRect(bx+8,by+bh-42,bw-16,23);ctx.strokeStyle='#bd9148';ctx.strokeRect(bx+8,by+bh-42,bw-16,23);
    // glow outward every frame
    ctx.globalCompositeOperation='screen';const halo=ctx.createRadialGradient(bx+bw*.52,by+bh*.53,0,bx+bw*.52,by+bh*.53,145);halo.addColorStop(0,`rgba(255,226,150,${.24+.06*Math.sin(t*.003)})`);halo.addColorStop(.45,'rgba(255,177,72,.12)');halo.addColorStop(1,'rgba(255,177,72,0)');ctx.fillStyle=halo;ctx.fillRect(bx-90,by-80,bw+180,bh+160);ctx.restore();

    // Art deco wall lamps beside doors
    [[850,570],[1197,562]].forEach(([x,y],idx)=>{
      ctx.save();ctx.fillStyle='#2b1b14';ctx.fillRect(x-5,y-20,10,42);ctx.fillStyle='rgba(255,219,139,.92)';ctx.shadowBlur=16;ctx.shadowColor='rgba(255,186,75,.7)';polygon(ctx,[[x-8,y-22],[x+8,y-22],[x+12,y],[x-12,y]]);ctx.fill();ctx.restore();
    });

    // right facade perspective lines
    ctx.strokeStyle='rgba(211,168,88,.18)';ctx.lineWidth=2;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(1518+i*13,225+i*4);ctx.lineTo(1540+i*9,590+i*4);ctx.stroke()}
  }

  function drawCar(t){
    const x=165,y=676,sc=1.05;
    ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
    ctx.globalAlpha=.96;
    // shadow
    ctx.fillStyle='rgba(0,0,0,.60)';ctx.beginPath();ctx.ellipse(150,112,190,35,0,0,Math.PI*2);ctx.fill();
    // body silhouette
    const bodyG=ctx.createLinearGradient(0,10,320,130);bodyG.addColorStop(0,'#0b0c0f');bodyG.addColorStop(.38,'#1c2025');bodyG.addColorStop(.55,'#050608');bodyG.addColorStop(.78,'#252a30');bodyG.addColorStop(1,'#07080a');ctx.fillStyle=bodyG;
    ctx.beginPath();ctx.moveTo(10,98);ctx.quadraticCurveTo(18,52,65,45);ctx.quadraticCurveTo(99,8,171,10);ctx.quadraticCurveTo(229,12,258,55);ctx.quadraticCurveTo(304,61,321,91);ctx.lineTo(314,118);ctx.lineTo(18,121);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#59616a';ctx.lineWidth=2;ctx.stroke();
    // cabin windows
    ctx.fillStyle='rgba(38,47,55,.80)';polygon(ctx,[[88,48],[111,21],[164,20],[171,49]]);ctx.fill();polygon(ctx,[[180,21],[218,29],[244,53],[184,50]]);ctx.fill();ctx.strokeStyle='rgba(197,169,116,.25)';ctx.lineWidth=2;ctx.stroke();
    // hood ridges / chrome
    ctx.strokeStyle='rgba(195,199,199,.42)';ctx.lineWidth=2;for(let yy=65;yy<=83;yy+=6){ctx.beginPath();ctx.moveTo(226,yy);ctx.lineTo(278,yy+2);ctx.stroke()}
    ctx.fillStyle='#b8b5aa';roundRectPath(ctx,269,62,39,48,7);ctx.fill();ctx.fillStyle='#17191c';for(let gx=275;gx<304;gx+=5)ctx.fillRect(gx,67,2,38);
    // wheels
    [[63,112],[266,112]].forEach(([wx,wy])=>{ctx.fillStyle='#050506';ctx.beginPath();ctx.arc(wx,wy,34,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d0c7ad';ctx.lineWidth=5;ctx.stroke();ctx.fillStyle='#1c1e21';ctx.beginPath();ctx.arc(wx,wy,20,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#5e6264';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#9c895d';ctx.beginPath();ctx.arc(wx,wy,6,0,Math.PI*2);ctx.fill()});
    // headlights
    [[286,74],[230,68]].forEach(([hx,hy])=>{ctx.save();ctx.fillStyle='#e5d5aa';ctx.shadowBlur=15;ctx.shadowColor='rgba(255,213,122,.65)';ctx.beginPath();ctx.arc(hx,hy,9,0,Math.PI*2);ctx.fill();ctx.restore()});
    // bumper
    ctx.strokeStyle='#a7aaa9';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(245,116);ctx.quadraticCurveTo(292,125,325,109);ctx.stroke();
    // warm street reflection on roof
    ctx.strokeStyle='rgba(239,170,72,.38)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(91,28);ctx.quadraticCurveTo(165,0,229,39);ctx.stroke();
    ctx.restore();
  }

  function drawLamp(t){
    const x=1470,base=735;
    const flicker=((Math.floor(t/87)%57)===13||Math.floor(t/87)%73===29)?.48:1;
    ctx.save();
    // post
    const pg=ctx.createLinearGradient(x-12,0,x+12,0);pg.addColorStop(0,'#050506');pg.addColorStop(.45,'#39312b');pg.addColorStop(.62,'#0b0a0a');pg.addColorStop(1,'#030304');ctx.fillStyle=pg;roundRectPath(ctx,x-11,235,22,500,9);ctx.fill();
    ctx.fillStyle='#161313';ctx.fillRect(x-30,710,60,25);ctx.fillRect(x-20,690,40,24);
    // street sign
    ctx.save();ctx.translate(x-4,405);ctx.rotate(-.03);ctx.fillStyle='#0a0a0b';roundRectPath(ctx,-126,-18,126,36,4);ctx.fill();ctx.strokeStyle='#a67a3c';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#e8ce8c';ctx.font='500 18px Oswald';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('W 48 ST',-63,0);ctx.restore();
    // lantern
    ctx.fillStyle='#09090a';polygon(ctx,[[x-34,245],[x+34,245],[x+26,323],[x-26,323]]);ctx.fill();ctx.strokeStyle='#69543b';ctx.lineWidth=3;ctx.stroke();
    const lg=ctx.createRadialGradient(x,282,0,x,282,78);lg.addColorStop(0,`rgba(255,244,194,${.82*flicker})`);lg.addColorStop(.23,`rgba(255,201,104,${.54*flicker})`);lg.addColorStop(1,'rgba(255,179,74,0)');ctx.fillStyle=lg;ctx.globalCompositeOperation='screen';ctx.fillRect(x-88,195,176,176);ctx.globalCompositeOperation='source-over';
    ctx.fillStyle=`rgba(255,231,163,${.82*flicker})`;polygon(ctx,[[x-22,255],[x+22,255],[x+17,311],[x-17,311]]);ctx.fill();
    // finial
    ctx.fillStyle='#0a090a';ctx.beginPath();ctx.moveTo(x,215);ctx.lineTo(x+18,245);ctx.lineTo(x-18,245);ctx.closePath();ctx.fill();ctx.beginPath();ctx.arc(x,215,7,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }

  function drawTraffic(t){
    ctx.save();ctx.globalCompositeOperation='screen';
    headlights.forEach((h,i)=>{
      const u=(h.phase+t*.00006*h.speed*1000)%1;
      const x=lerp(45,530,u),y=lerp(710,510,u);
      const s=lerp(1.2,.25,u);
      glowDot(x,y,8*s,'rgba(255,218,143,ALPHA)',.42);
      glowDot(x+13*s,y+1,7*s,'rgba(255,218,143,ALPHA)',.34);
    });
    ctx.restore();
  }

  function updateSteam(t){
    if(steam.length<18&&Math.random()<.18){
      steam.push({x:1212+(Math.random()-.5)*35,y:788,r:9+Math.random()*13,vx:(Math.random()-.5)*.20,vy:.28+Math.random()*.34,life:0,max:180+Math.random()*100});
    }
    ctx.save();ctx.globalCompositeOperation='screen';
    for(let i=steam.length-1;i>=0;i--){
      const p=steam[i];p.life++;p.x+=p.vx;p.y-=p.vy;p.r+=.09;
      const a=Math.sin(Math.PI*clamp(p.life/p.max,0,1))*.17;
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*2.8);g.addColorStop(0,`rgba(212,216,221,${a})`);g.addColorStop(1,'rgba(212,216,221,0)');ctx.fillStyle=g;ctx.fillRect(p.x-p.r*3,p.y-p.r*3,p.r*6,p.r*6);
      if(p.life>=p.max)steam.splice(i,1);
    }
    ctx.restore();
  }

  function drawFilmGrain(frame){
    if(frame%3!==0)return;
    ctx.save();ctx.globalAlpha=.035;ctx.fillStyle='#fff';
    for(let i=0;i<150;i++)ctx.fillRect(Math.random()*WORLD_W,Math.random()*WORLD_H,1,1);
    ctx.restore();
  }

  function render(t){
    if(t-lastFrame<30){raf=requestAnimationFrame(render);return}
    lastFrame=t;
    const frame=Math.floor(t/33.33);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,cssW,cssH);
    ctx.save();ctx.translate(offsetX,offsetY);ctx.scale(scale,scale);
    drawSky(t);drawSearchlights(t);drawDistantBuildings(t);drawStreet(t);drawCinema(t);drawTraffic(t);drawCar(t);drawLamp(t);updateSteam(t);drawFilmGrain(frame);
    // subtle vignette
    const vg=ctx.createRadialGradient(WORLD_W*.51,WORLD_H*.48,260,WORLD_W*.51,WORLD_H*.48,920);vg.addColorStop(.45,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.62)');ctx.fillStyle=vg;ctx.fillRect(0,0,WORLD_W,WORLD_H);
    ctx.restore();
    raf=requestAnimationFrame(render);
  }

  /* ----------------------------- AUDIO ----------------------------- */
  class CityAudio{
    constructor(){this.started=false;this.nodes=[];this.timers=[];this.bus=null}
    destination(){
      try{return (typeof sfxGain!=='undefined'&&sfxGain)||(typeof masterGain!=='undefined'&&masterGain)||null}catch(_){return null}
    }
    ensure(){
      try{
        if(typeof initAudio==='function')initAudio();
        if(audioCtx?.state==='suspended')audioCtx.resume?.();
        return audioCtx||null;
      }catch(_){return null}
    }
    start(){
      if(this.started)return;
      const ac=this.ensure(),dest=this.destination();
      if(!ac||!dest)return;
      this.started=true;
      try{if(typeof switchMusic==='function')switchMusic('menu')}catch(_){}
      this.bus=ac.createGain();this.bus.gain.value=.18;this.bus.connect(dest);this.nodes.push(this.bus);
      // Traffic bed: only tonal engines, deliberately no continuous white noise.
      [[46,'sine',.018],[63,'triangle',.009],[87,'sine',.006]].forEach(([f,type,gain],i)=>{
        const o=ac.createOscillator(),g=ac.createGain(),lfo=ac.createOscillator(),lfg=ac.createGain();o.type=type;o.frequency.value=f;g.gain.value=gain;lfo.type='sine';lfo.frequency.value=.07+i*.025;lfg.gain.value=gain*.23;lfo.connect(lfg).connect(g.gain);o.connect(g).connect(this.bus);o.start();lfo.start();this.nodes.push(o,g,lfo,lfg);
      });
      this.scheduleMurmur();this.scheduleCar();this.scheduleHorn();
    }
    formantVoice(){
      if(!this.started)return;const ac=this.ensure();if(!ac||!this.bus)return;
      const now=ac.currentTime,pan=ac.createStereoPanner?ac.createStereoPanner():null,master=ac.createGain();master.gain.setValueAtTime(.0001,now);master.gain.exponentialRampToValueAtTime(.018,now+.08);master.gain.exponentialRampToValueAtTime(.0001,now+.62+Math.random()*.38);
      const target=pan||this.bus;if(pan){pan.pan.value=-.8+Math.random()*1.6;master.connect(pan).connect(this.bus)}else master.connect(this.bus);
      const root=92+Math.random()*55;
      [1,2.1,3.4].forEach((m,i)=>{const o=ac.createOscillator(),f=ac.createBiquadFilter();o.type=i===0?'triangle':'sawtooth';o.frequency.value=root*m;f.type='bandpass';f.frequency.value=[340,760,1350][i]+Math.random()*90;f.Q.value=3.2;o.connect(f).connect(master);o.start(now);o.stop(now+1.2);});
    }
    scheduleMurmur(){const tick=()=>{if(!this.started)return;this.formantVoice();this.timers.push(setTimeout(tick,700+Math.random()*1500))};this.timers.push(setTimeout(tick,650))}
    carPass(){
      if(!this.started)return;const ac=this.ensure();if(!ac||!this.bus)return;const now=ac.currentTime,o=ac.createOscillator(),f=ac.createBiquadFilter(),g=ac.createGain(),p=ac.createStereoPanner?ac.createStereoPanner():null;o.type='sawtooth';o.frequency.setValueAtTime(70+Math.random()*18,now);o.frequency.exponentialRampToValueAtTime(42+Math.random()*10,now+3.3);f.type='lowpass';f.frequency.value=310;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.035,now+.8);g.gain.exponentialRampToValueAtTime(.0001,now+3.4);if(p){p.pan.setValueAtTime(-.9,now);p.pan.linearRampToValueAtTime(.9,now+3.4);o.connect(f).connect(g).connect(p).connect(this.bus)}else o.connect(f).connect(g).connect(this.bus);o.start(now);o.stop(now+3.5);
    }
    scheduleCar(){const tick=()=>{if(!this.started)return;this.carPass();this.timers.push(setTimeout(tick,4800+Math.random()*6200))};this.timers.push(setTimeout(tick,1800))}
    horn(){
      if(!this.started)return;const ac=this.ensure();if(!ac||!this.bus)return;const now=ac.currentTime,g=ac.createGain();g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.010,now+.06);g.gain.setValueAtTime(.010,now+.28);g.gain.exponentialRampToValueAtTime(.0001,now+.75);[196,247].forEach(f=>{const o=ac.createOscillator();o.type='triangle';o.frequency.value=f;o.connect(g).connect(this.bus);o.start(now);o.stop(now+.8)});
    }
    scheduleHorn(){const tick=()=>{if(!this.started)return;this.horn();this.timers.push(setTimeout(tick,11000+Math.random()*13000))};this.timers.push(setTimeout(tick,7000))}
    footsteps(){
      const ac=this.ensure(),dest=this.destination();if(!ac||!dest)return;const bus=ac.createGain();bus.gain.value=.72;bus.connect(dest);for(let i=0;i<9;i++){const t=ac.currentTime+i*.165;const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.setValueAtTime(i%2?92:105,t);o.frequency.exponentialRampToValueAtTime(54,t+.09);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.090,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+.13);o.connect(g).connect(bus);o.start(t);o.stop(t+.15);const sc=ac.createOscillator(),sg=ac.createGain(),sf=ac.createBiquadFilter();sc.type='square';sc.frequency.value=430+(i%3)*75;sf.type='bandpass';sf.frequency.value=700+(i%2)*180;sf.Q.value=2.4;sg.gain.setValueAtTime(.0001,t+.025);sg.gain.exponentialRampToValueAtTime(.017,t+.04);sg.gain.exponentialRampToValueAtTime(.0001,t+.11);sc.connect(sf).connect(sg).connect(bus);sc.start(t+.02);sc.stop(t+.12)}setTimeout(()=>{try{bus.disconnect()}catch(_){}},1900);
    }
    stop(){
      if(!this.started)return;this.started=false;this.timers.forEach(clearTimeout);this.timers=[];const ac=this.ensure();if(this.bus&&ac){try{this.bus.gain.setTargetAtTime(.0001,ac.currentTime,.18)}catch(_){}}setTimeout(()=>{this.nodes.forEach(n=>{try{n.stop?.()}catch(_){}try{n.disconnect?.()}catch(_){}});this.nodes=[];this.bus=null},700);
    }
  }
  const cityAudio=new CityAudio();

  /* ----------------------- EXTERIOR SOUND PANEL ----------------------- */
  function settingApi(){return window.MovieQuizSettings||null}
  function localVolume(key){try{return clamp(Number(localStorage.getItem(key)??50),0,100)}catch(_){return 50}}
  function getMusic(){return settingApi()?.musicVolume?.()??localVolume('movieQuizMusicVolumeV1')}
  function getSfx(){return settingApi()?.sfxVolume?.()??localVolume('movieQuizSfxVolumeV1')}
  function syncSoundPanel(){
    const m=getMusic(),s=getSfx();if(musicSlider)musicSlider.value=m;if(sfxSlider)sfxSlider.value=s;if(musicOut)musicOut.textContent=`${m} %`;if(sfxOut)sfxOut.textContent=`${s} %`;
  }
  function setMusic(v){const n=clamp(Number(v),0,100);settingApi()?.setMusicVolume?.(n);try{localStorage.setItem('movieQuizMusicVolumeV1',String(n))}catch(_){}if(musicOut)musicOut.textContent=`${n} %`}
  function setSfx(v){const n=clamp(Number(v),0,100);settingApi()?.setSfxVolume?.(n);try{localStorage.setItem('movieQuizSfxVolumeV1',String(n))}catch(_){}if(sfxOut)sfxOut.textContent=`${n} %`}

  audioButton?.addEventListener('click',e=>{
    e.preventDefault();e.stopPropagation();cityAudio.start();const open=audioPanel?.hidden!==false;if(audioPanel){audioPanel.hidden=!open}audioButton.setAttribute('aria-expanded',String(open));syncSoundPanel();
  });
  musicSlider?.addEventListener('input',e=>{cityAudio.start();setMusic(e.target.value)});
  sfxSlider?.addEventListener('input',e=>{cityAudio.start();setSfx(e.target.value)});
  document.addEventListener('pointerdown',e=>{if(audioPanel&&!audioPanel.hidden&&!e.target.closest?.('.mq-exterior-audio')){audioPanel.hidden=true;audioButton?.setAttribute('aria-expanded','false')}},{capture:true});

  /* -------------------------- TICKET FLOW -------------------------- */
  function findProfilePanel(){
    if(profilePanel?.isConnected)return profilePanel;
    profilePanel=document.querySelector('#playerView .mq-player-panel')||document.querySelector('.mq-ticket-profile-mount .mq-player-panel');
    return profilePanel;
  }
  function cleanTicketUi(){
    const panel=findProfilePanel();if(!panel)return;
    panel.querySelectorAll('[data-open-statistics],[data-open-scoreboard],#mqIntroScoreboard,.mq-stats-avatar-action').forEach(n=>{n.hidden=true;n.style.display='none'});
    panel.querySelectorAll('button,a').forEach(n=>{const s=(n.textContent||'').toLowerCase();if(s.includes('statistik')||s.includes('žebříčk')||s.includes('zebricek')){n.hidden=true;n.style.display='none'}});
  }
  function mountProfile(){
    const panel=findProfilePanel();if(!panel)return false;
    if(!profilePlaceholder){profilePlaceholder=document.createComment('Movie Quiz player panel home');panel.parentNode?.insertBefore(profilePlaceholder,panel)}
    if(panel.parentElement!==ticketMount)ticketMount.appendChild(panel);panel.classList.add('mq-ticket-player-panel');cleanTicketUi();requestAnimationFrame(cleanTicketUi);return true;
  }
  function restoreProfile(){
    const panel=findProfilePanel();if(!panel)return;if(profilePlaceholder?.parentNode)profilePlaceholder.parentNode.insertBefore(panel,profilePlaceholder.nextSibling);panel.classList.remove('mq-ticket-player-panel');
  }
  function showTicket(){
    ticketLayer.hidden=false;document.body.classList.add('mq-ticket-open');ticketOpen=true;requestAnimationFrame(mountProfile);setTimeout(mountProfile,100);setTimeout(mountProfile,320);
  }
  function openTicket(){
    if(ticketOpen||entering||approaching)return;approaching=true;cityAudio.start();cityAudio.footsteps();exterior.classList.add('is-approaching');setWalkCursor(false);setTimeout(()=>{try{originalShowView?.('playerView')}catch(_){}showTicket();approaching=false},920);
  }
  function enterAuditorium(){
    if(entering)return;entering=true;document.body.classList.add('mq-entering-auditorium');cityAudio.stop();setTimeout(()=>{restoreProfile();ticketLayer.hidden=true;exterior.classList.add('is-leaving');ticketOpen=false;auditoriumEntered=true;document.body.classList.remove('mq-exterior-active','mq-ticket-open','mq-entering-auditorium');document.body.classList.add('mq-auditorium-entered');cinema.classList.add('running','open');try{originalShowView?.('difficulty')}catch(_){}try{switchMusic?.('menu');sound?.('soft')}catch(_){}setTimeout(()=>{exterior.hidden=true;entering=false;window.dispatchEvent(new Event('resize'))},650)},720);
  }
  function wrapShowView(){
    if(wrapped||typeof window.showView!=='function')return false;originalShowView=window.showView;window.showView=function(id){if(id==='difficulty'&&ticketOpen&&!auditoriumEntered){enterAuditorium();return}if(id==='playerView'&&auditoriumEntered){originalShowView(id);showTicket();return}return originalShowView(id)};wrapped=true;return true;
  }
  function waitForGameSystems(){if(wrapShowView())return;setTimeout(waitForGameSystems,60)}

  /* -------------------------- POINTER INPUT -------------------------- */
  function updateCursor(e){if(!walkCursor)return;walkCursor.style.left=`${e.clientX}px`;walkCursor.style.top=`${e.clientY}px`}
  function setWalkCursor(on){hoverBooth=Boolean(on);walkCursor?.classList.toggle('is-visible',hoverBooth);canvas.style.cursor=hoverBooth?'none':'default'}
  canvas.addEventListener('pointermove',e=>{const hit=boothHit(toWorld(e.clientX,e.clientY));if(hit!==hoverBooth)setWalkCursor(hit);if(hit)updateCursor(e)});
  canvas.addEventListener('pointerleave',()=>setWalkCursor(false));
  canvas.addEventListener('pointerdown',()=>{cityAudio.start()},{once:true,passive:true});
  canvas.addEventListener('click',e=>{if(boothHit(toWorld(e.clientX,e.clientY)))openTicket()});

  /* ---------------------------- INIT ---------------------------- */
  resize();syncSoundPanel();window.addEventListener('resize',resize,{passive:true});waitForGameSystems();raf=requestAnimationFrame(render);
  window.MovieQuizExterior=Object.freeze({version:VERSION,openTicket,enterAuditorium,isAuditoriumEntered:()=>auditoriumEntered,startAudio:()=>cityAudio.start()});
})();
