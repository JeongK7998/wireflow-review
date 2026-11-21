'use strict';

function connectionKey(from, to) {
  return from < to ? from + '|' + to : to + '|' + from;
}

function createConnections(canvas, frames, pitch, annotations = []) {
  const ctx = canvas.getContext('2d');
  const tokens = getComputedStyle(canvas);
  const css = name => tokens.getPropertyValue(name).trim();
  const ink = css('--paper-ink');
  const accent = css('--paper-accent');
  const issue = css('--paper-route-issue') || accent;
  const muted = css('--paper-arrow-muted');
  const stroke = parseFloat(css('--paper-arrow-stroke'));
  const mutedStroke = parseFloat(css('--paper-arrow-muted-stroke'));
  const dash = [parseFloat(css('--paper-arrow-dash')),parseFloat(css('--paper-arrow-gap'))];
  const lead = parseFloat(css('--paper-arrow-lead'));
  const arrowhead = parseFloat(css('--paper-arrowhead'));
  const paper = css('--paper');
  const labels = new Map(annotations.map(({from,to,label})=>[from+'→'+to,label]));
  const routes = new Map();
  const boxes = [...frames.entries()];

  function ports(id, bias) {
    const {x,y,w,h} = frames.get(id);
    const across = span => {
      const margin = Math.min(6,span/2);
      return Math.max(margin,Math.min(span-margin,span/2+bias));
    };
    return [
      {id, tip:[x,y+across(h)], normal:[-1,0]},
      {id, tip:[x+w,y+across(h)], normal:[1,0]},
      {id, tip:[x+across(w),y], normal:[0,-1]},
      {id, tip:[x+across(w),y+h], normal:[0,1]},
    ];
  }

  const shift = ([x,y],[dx,dy],amount) => [x+dx*amount, y+dy*amount];
  const delta = ([x,y],[u,v]) => [u-x,v-y];
  const dot = ([x,y],[u,v]) => x*u+y*v;
  const distance = (a,b) => Math.hypot(...delta(a,b));
  const straightSegment = (a,b) => [a,shift(a,delta(a,b),1/3),shift(a,delta(a,b),2/3),b];

  function clearCurve(points, from, to) {
    const xs = points.map(([x]) => x), ys = points.map(([,y]) => y);
    const nearby = boxes.filter(([id,{x,y,w,h}]) => id!==from && id!==to &&
      Math.min(...xs)<x+w+6 && Math.max(...xs)>x-6 && Math.min(...ys)<y+h+6 && Math.max(...ys)>y-6);
    if (!nearby.length) return true;
    const steps = Math.max(24,Math.ceil(distance(points[0],points[3])/16));
    for (let i=0;i<=steps;i++) {
      const t=i/steps, u=1-t;
      const [x,y] = [0,1].map(axis => u**3*points[0][axis]+3*u*u*t*points[1][axis]+3*u*t*t*points[2][axis]+t**3*points[3][axis]);
      if (nearby.some(([,box])=>x>box.x-6 && x<box.x+box.w+6 && y>box.y-6 && y<box.y+box.h+6)) return false;
    }
    return true;
  }

  function directRoute(sources, targets) {
    let best;
    for (const source of sources) {
      for (const target of targets) {
        const direction = delta(source.tip,target.tip);
        const out = dot(direction,source.normal), into = -dot(direction,target.normal);
        const opposed = dot(source.normal,target.normal)===-1;
        const minimum = (opposed ? 2 : 1)*lead+18;
        if (out<minimum || into<minimum) continue;
        const score = Math.hypot(...direction)+(opposed?0:45);
        if (best && score>=best.score) continue;
        const a=shift(source.tip,source.normal,lead), d=shift(target.tip,target.normal,lead);
        const span=delta(a,d);
        const b=shift(a,source.normal,dot(span,source.normal)*.48);
        const c=shift(d,target.normal,-dot(span,target.normal)*.48);
        const segments=[straightSegment(source.tip,a),[a,b,c,d],straightSegment(d,target.tip)];
        if (!segments.every(segment=>clearCurve(segment,source.id,target.id))) continue;
        const path=new Path2D();
        path.moveTo(...source.tip);
        path.lineTo(...a);
        path.bezierCurveTo(...b,...c,...d);
        path.lineTo(...target.tip);
        const middle=a.map((value,i)=>(value+3*b[i]+3*c[i]+d[i])/8);
        best={source,target,path,score,middle};
      }
    }
    return best;
  }

  function gutterPath(points) {
    const path = new Path2D();
    let cursor = points[0];
    const segments = [];
    path.moveTo(...cursor);
    function line(end) {
      if (distance(cursor,end)<.01) return;
      segments.push(straightSegment(cursor,end));
      path.lineTo(...end);
      cursor = end;
    }
    function curve(controlA,controlB,end) {
      segments.push([cursor,controlA,controlB,end]);
      path.bezierCurveTo(...controlA,...controlB,...end);
      cursor = end;
    }
    for (let i=1;i<points.length-1;i++) {
      const before=points[i-1], corner=points[i], after=points[i+1];
      const a=distance(corner,before), b=distance(corner,after);
      const beforeLead=i===1 ? Math.min(lead,a*.65) : 0;
      const afterLead=i===points.length-2 ? Math.min(lead,b*.65) : 0;
      const bend=Math.min(42,a*.45,b*.45,a-beforeLead,b-afterLead);
      const start=shift(corner,delta(corner,before),bend/a);
      const end=shift(corner,delta(corner,after),bend/b);
      line(start);
      curve(shift(start,delta(start,corner),.63),shift(end,delta(end,corner),.63),end);
    }
    line(points.at(-1));
    return {path,segments};
  }

  const {w,h} = frames.values().next().value;
  const gap = [(pitch.x-w)/2,(pitch.y-h)/2];
  const lanes = [
    [...new Set(boxes.flatMap(([,box])=>[box.x-gap[0],box.x+w+gap[0]]))],
    [...new Set(boxes.flatMap(([,box])=>[box.y-gap[1],box.y+h+gap[1]]))],
  ];

  function laneRoute(sources,targets,stagger=0) {
    let best;
    for (const source of sources) {
      for (const target of targets) {
        const axis = source.normal[0] ? 0 : 1;
        const other = target.normal[0] ? 0 : 1;
        const s=shift(source.tip,source.normal,gap[axis]+stagger*source.normal[axis]);
        const t=shift(target.tip,target.normal,gap[other]+stagger*target.normal[other]);
        const corners = axis===other ? lanes[1-axis].map(center=>center+stagger).map(lane=>
          axis===0 ? [[s[0],lane],[t[0],lane]] : [[lane,s[1]],[lane,t[1]]]) :
          [axis===0 ? [[s[0],t[1]]] : [[t[0],s[1]]]];
        for (const bend of corners) {
          const raw=[source.tip,s,...bend,t,target.tip];
          const points=raw.filter((point,index)=>!index || distance(point,raw[index-1])>.1);
          const tangents=points.slice(1).map((point,index)=>delta(points[index],point));
          if (tangents.some((tangent,index)=>index>0 && dot(tangent,tangents[index-1])<0)) continue;
          const score=tangents.reduce((sum,tangent)=>sum+Math.hypot(...tangent),0);
          if (best && score>=best.score) continue;
          const {path,segments}=gutterPath(points);
          if (!segments.every(segment=>clearCurve(segment,source.id,target.id))) continue;
          best={source,target,points,score,path};
        }
      }
    }
    if (!best && stagger) return laneRoute(sources,targets);
    if (!best) return undefined;
    const middleIndex=Math.floor(best.points.length/2);
    const middle=best.points[middleIndex-1].map((value,i)=>(value+best.points[middleIndex][i])/2);
    return {...best,middle};
  }

  function loopRoute(id) {
    const {x,y,w,h} = frames.get(id);
    const top=y+h*.24, spread=59;
    const source={id,tip:[x+w,top],normal:[1,0]};
    const target={id,tip:[x+w,top+spread],normal:[1,0]};
    const path=new Path2D();
    path.moveTo(...source.tip);
    path.lineTo(x+w+lead,top);
    path.bezierCurveTo(x+w+lead+36,top,x+w+lead+36,top+spread,x+w+lead,top+spread);
    path.lineTo(...target.tip);
    return {source,target,path};
  }

  function outerRoute(sources,targets) {
    let best;
    for (const [index,source] of sources.entries()) {
      const target = targets[index];
      const axis = source.normal[0] ? 0 : 1;
      const side = source.normal[axis];
      const outside = Math.max(source.tip[axis]*side,target.tip[axis]*side)+lead+32;
      const start = shift(source.tip,source.normal,outside-source.tip[axis]*side);
      const end = shift(target.tip,target.normal,outside-target.tip[axis]*side);
      if (distance(start,end)<.1) continue;
      const {path,segments} = gutterPath([source.tip,start,end,target.tip]);
      const clear = segments.every(segment=>clearCurve(segment,source.id,target.id));
      const score = distance(source.tip,start)+distance(start,end)+distance(end,target.tip)+(clear?0:1e6);
      if (!best || score<best.score) {
        best = {source,target,path,score,middle:start.map((value,i)=>(value+end[i])/2)};
      }
    }
    return best;
  }

  function getRoute(key) {
    if (!routes.has(key)) {
      const [a,b]=key.split('|');
      if (a===b) routes.set(key,loopRoute(a));
      else {
        const hash=[...key].reduce((value,char)=>(Math.imul(value,31)+char.charCodeAt(0))>>>0,0);
        const sources=ports(a,14+hash%25-12), targets=ports(b,-14+(hash>>>8)%25-12);
        const stagger=((hash>>>16)%5-2)*7;
        routes.set(key,directRoute(sources,targets) || laneRoute(sources,targets,stagger) || outerRoute(sources,targets));
      }
    }
    return routes.get(key);
  }

  function drawArrow(port, size) {
    const [dx,dy]=port.normal;
    const base=shift(port.tip,port.normal,size);
    const cross=[-dy,dx];
    ctx.moveTo(...shift(base,cross,size/2));
    ctx.lineTo(...port.tip);
    ctx.lineTo(...shift(base,cross,-size/2));
  }

  function paint(key, directions, tone='normal',dimmed=false) {
    const route=getRoute(key);
    if (!route) return;
    const highlighted = tone!=='normal';
    ctx.globalAlpha = dimmed ? .22 : 1;
    ctx.strokeStyle=tone==='issue' ? issue : highlighted ? accent : muted;
    ctx.lineWidth=highlighted ? stroke : mutedStroke;
    ctx.setLineDash(highlighted ? [] : dash);
    ctx.stroke(route.path);
    ctx.setLineDash([]);
    ctx.beginPath();
    for (const target of directions) drawArrow(route.target.id===target ? route.target : route.source,arrowhead);
    ctx.stroke();
    const label = [...directions].map(target=>{
      const source = route.target.id===target ? route.source.id : route.target.id;
      return labels.get(source+'→'+target);
    }).find(Boolean);
    if (label && route.middle) {
      const [x,y]=route.middle;
      ctx.font='600 12px '+css('--paper-font-sans');
      const width = ctx.measureText(label).width+12;
      ctx.fillStyle=paper;
      ctx.beginPath();
      ctx.roundRect(x-width/2,y-8,width,16,4);
      ctx.fill();
      ctx.fillStyle=highlighted?ctx.strokeStyle:ink;
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillText(label,x,y);
    }
  }

  return function draw(edges, focus, offset, zoom, verification) {
    const width=canvas.clientWidth, height=canvas.clientHeight;
    const scale=Math.min(devicePixelRatio||1,1.5);
    const px=Math.round(width*scale), py=Math.round(height*scale);
    if (canvas.width!==px || canvas.height!==py) {
      canvas.width=px;
      canvas.height=py;
    }
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,px,py);
    ctx.setTransform(scale*zoom,0,0,scale*zoom,offset.x*scale,offset.y*scale);
    ctx.lineJoin='round';
    ctx.lineCap='round';
    if (verification) {
      for (const [key,targets] of edges) {
        if (!verification.has(key)) paint(key,targets,'normal',true);
      }
      for (const [key,{targets,failed}] of verification) paint(key,targets,failed?'issue':'focus');
      ctx.globalAlpha = 1;
      return;
    }
    const focusedKey=focus && connectionKey(focus.from,focus.to);
    for (const [key,targets] of edges) if (key!==focusedKey) paint(key,targets);
    if (focusedKey) paint(focusedKey,[focus.to],'focus');
  };
}
