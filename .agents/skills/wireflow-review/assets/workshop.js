'use strict';

const courses = [
  {action:'open-hand', name:'핸드빌딩 입문', area:'연남', category:'핸드빌딩', duration:'90분', price:38000, image:'빚어서 완성한 작은 그릇 사진', sample:'작은 그릇을 손으로 빚어요.'},
  {action:'open-wheel', name:'물레 체험', area:'성수', category:'물레', duration:'120분', price:48000, image:'물레 위의 도자기 컵 사진', sample:'물레로 나만의 컵을 만들어요.'},
  {action:'open-glaze', name:'유약 드로잉', area:'연남', category:'채색', duration:'60분', price:28000, image:'색을 입힌 도자기 접시 사진', sample:'초벌 접시에 붓으로 색을 입혀요.'},
];
const regions = ['전체','연남','성수'];
const categories = ['전체',...courses.map(course=>course.category)];
const dates = [21,22,28,29];
const reservationFields = ['course','date','time','guests','name','email'];
const money = value => value.toLocaleString('ko-KR')+'원';
const scheduleLabel = vars => '11월 '+vars.date+'일 · '+vars.time;
const currentCourse = vars => courses.find(course=>course.name===vars.course);
const savedKey = key => 'booked'+key[0].toUpperCase()+key.slice(1);
const savedReservation = vars => ({...vars,...Object.fromEntries(reservationFields.map(key=>[key,vars[savedKey(key)]]))});

function settingsForm(screen, vars) {
  return write(element('div','stack form-stack'),
    picker('자주 가는 지역',regions,vars.area,value=>vars.area=value,'area'),
    radioGroup('수업 경험',['첫 수업','만들어 본 적 있어요'],vars.level,value=>vars.level=value,screen.id+'-level','level'),
    write(element('fieldset','paper-choice-group'),
      element('legend','paper-control-title','수신 설정'),
      choice('예약 알림 받기','switch',vars.reminders,value=>vars.reminders=value,'reminders'),
      choice('신규 수업 소식 받기','check',vars.newsletter,value=>vars.newsletter=value,'newsletter')));
}

function reservationSummary(vars, showContact=false) {
  const course = currentCourse(vars);
  return rows(['수업',course.name],['일정',scheduleLabel(vars)],['수강 인원',vars.guests],
    ...(showContact ? [['예약자',vars.name || '—'],['이메일',vars.email || '—']] : []),
    ['결제 금액',money(course.price * parseInt(vars.guests))]);
}

function checkoutForm(vars) {
  const form = element('form','stack form-stack');
  form.addEventListener('submit',event=>event.preventDefault());
  for (const [key,label,type,limit] of [['name','예약자 이름','text',32],['email','이메일','email',80],['memo','요청 사항 (선택)','textarea',80]]) {
    const field = element(type==='textarea'?'textarea':'input','paper-field');
    if (type!=='textarea') field.type = type;
    field.value = vars[key];
    field.dataset.control = key;
    field.maxLength = limit;
    field.required = key!=='memo';
    if (key==='memo') field.rows = 2;
    field.addEventListener('input',()=>vars[key]=field.value);
    form.append(write(element('label','paper-field-label'),element('span','paper-caption',label),field));
  }
  const agreement = choice('예약 및 취소 안내를 읽었어요','check',vars.agreed,value=>vars.agreed=value,'agreed');
  agreement.firstElementChild.required = true;
  return write(form,agreement);
}

function courseCard(screen, course) {
  const card = write(button('','course-card',()=>act(screen,course.action)),
    tileImage(course.image,{aspect:'square',classes:'course-image'}),write(element('span','course-copy'),element('strong','paper-control-title',course.name),
      element('span','paper-caption',course.area+' · '+course.duration),element('b','',money(course.price))));
  card.dataset.action = course.action;
  return card;
}

function browseContent(screen,vars) {
  const input = element('input');
  input.type = 'search';
  input.dataset.control = 'query';
  input.placeholder = '수업 이름 또는 지역 검색';
  input.value = vars.query;
  input.setAttribute('aria-label','수업 검색');
  const tags = element('div','filter-tags');
  const list = element('div','course-list');
  const count = element('p','paper-caption');
  count.setAttribute('aria-live','polite');
  const clear = write(button('','',()=>{ input.value=''; refresh(); input.focus(); }),icon('clear'));
  clear.setAttribute('aria-label','검색어 지우기');
  clear.dataset.control = 'clear-query';
  const form = write(element('form','paper-search'),icon('search'),input,clear);
  form.setAttribute('role','search');
  function refresh() {
    vars.query = input.value;
    const query = vars.query.trim().toLocaleLowerCase('ko-KR');
    const matches = courses.filter(course=> (vars.area==='전체' || course.area===vars.area)
      && (vars.category==='전체' || course.category===vars.category)
      && [course.name,course.area,course.category].some(value=>value.toLocaleLowerCase('ko-KR').includes(query)));
    count.textContent = matches.length+'개 수업';
    const empty = actionButton(screen,'empty');
    empty.textContent = '빈 결과 화면 보기';
    list.replaceChildren(...(matches.length ? matches.map(course=>courseCard(screen,course)) : [empty]));
    tags.replaceChildren(...['area','category'].filter(key=>vars[key]!=='전체').map(key=>{
      const remove = write(button('','',()=>{ vars[key]='전체'; refresh(); input.focus(); }),icon('clear','small'));
      remove.setAttribute('aria-label',vars[key]+' 필터 제거');
      remove.dataset.control = 'clear-'+key;
      return write(element('span','paper-tag'),vars[key],remove);
    }));
    return matches.length;
  }
  refresh();
  input.addEventListener('input',refresh);
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if (!refresh()) act(screen,'empty');
  });
  return write(element('div','stack'),write(element('div','search-row'),form,
    actionButton(screen,'filters','outline','small')),tags,count,list);
}

function datePicker(vars) {
  const calendar = element('div','paper-date-grid');
  calendar.setAttribute('role','group');
  calendar.setAttribute('aria-label','11월 날짜');
  for (const day of ['월','화','수','목','금','토','일']) calendar.append(element('span','',day));
  for (let day=16;day<=29;day++) {
    if (!dates.includes(day)) {
      calendar.append(element('span','calendar-muted',String(day)));
      continue;
    }
    const control = button(String(day),'',()=>{
      vars.date=day;
      for (const sibling of calendar.querySelectorAll('button')) sibling.setAttribute('aria-pressed',String(sibling===control));
    });
    control.setAttribute('aria-label','11월 '+day+'일');
    control.dataset.control = 'date';
    control.value = String(day);
    control.setAttribute('aria-pressed',String(vars.date===day));
    calendar.append(control);
  }
  return calendar;
}

function statusToast(text, mark) {
  const toast = element('div','paper-toast');
  toast.setAttribute('role','status');
  const close = write(button('','paper-dismiss',()=>toast.remove()),icon('close'));
  close.setAttribute('aria-label','알림 닫기');
  close.dataset.control = 'dismiss-toast';
  return write(toast,icon(mark),element('span','paper-caption',text),close);
}

function reservationCard(screen, vars) {
  if (vars.reservation==='없음') return element('p','paper-notice','아직 예약한 수업이 없어요.');
  const booking = savedReservation(vars);
  return write(element('div','paper-panel reservation-card'),badge(booking.reservation,'outline'),
    element('h3','paper-h3',booking.course),element('p','paper-caption',scheduleLabel(booking)),
    ...(booking.reservation==='예약 중' ? [actionButton(screen,'detail','outline','small')] : []));
}

function renderContent(body,screen,vars) {
  const course = currentCourse(vars);
  switch (screen.id) {
    case 'welcome':
      body.append(tileImage('작업대 위에 놓인 완성 도자기 사진',{aspect:'landscape',classes:'welcome-image'}),intro('흙으로 보내는 오후','연남과 성수의 도예 공방에서 원하는 수업을 골라보세요.','주말 도예 클래스'),
        write(element('div','filter-tags'),...categories.slice(1).map(text=>element('span','paper-tag',text))));
      break;
    case 'setup':
      body.append(intro('내 취향으로 시작하기','지역과 수업 경험은 나중에 설정에서 바꿀 수 있어요.'),settingsForm(screen,vars));
      break;
    case 'browse':
    case 'filters':
      body.append(intro('수업 둘러보기','하고 싶은 작업과 시간을 골라보세요.','도예 공방 예약'),browseContent(screens.get('browse'),vars));
      break;
    case 'class':
      body.append(tileImage(course.image,{aspect:'landscape',classes:'class-image'}),intro(course.name,course.sample,course.area+' · '+course.category),
        rows(['수업 시간',course.duration],['수강료 (1인)',money(course.price)],['준비물','앞치마와 도구 제공']),
        faq('완성한 작품은 언제 받나요?','가마 작업 후 약 3주 안에 공방에서 받아요.'));
      break;
    case 'schedule':
      body.append(intro('가능한 날짜를 골라요',null,course.name),write(element('div','stack'),
        element('h3','paper-h3','2026년 11월'),datePicker(vars),
        picker('시작 시간',['11:00','14:00','16:00'],vars.time,value=>vars.time=value,'time'),
        picker('수강 인원',['1명','2명','3명'],vars.guests,value=>vars.guests=value,'guests')));
      break;
    case 'checkout':
    case 'confirm': {
      const form = checkoutForm(vars);
      body.append(intro('예약 정보 입력',course.name+' · '+scheduleLabel(vars)),form,
        faq('예약 및 취소 안내','예약을 확정하면 이메일로 안내해요. 취소 가능 여부는 예약 상세에서 확인할 수 있어요.'));
      return ()=>form.reportValidity();
    }
    case 'success':
      body.append(statusToast('예약 확인 메일을 보냈어요','check'),intro('예약이 완료됐어요','공방에서 만나요.','예약 번호 #CL-2108'),
        reservationSummary(savedReservation(vars)));
      break;
    case 'bookings':
      body.append(intro('내 예약','다가오는 일정과 예약 상태를 확인하세요.'),write(element('div','stack'),reservationCard(screen,vars)));
      break;
    case 'booking':
    case 'cancel': {
      const booking = savedReservation(vars);
      body.append(intro(booking.course,'예약 번호 #CL-2108'),write(element('div','stack'),badge(booking.reservation,'outline'),reservationSummary(booking,true),
        faq('수업 당일 안내','시작 10분 전 공방으로 와 주세요.')));
      break;
    }
    case 'cancelled': {
      const booking = savedReservation(vars);
      body.append(statusToast('내 예약에 취소 상태가 표시돼요','check'),intro('예약을 취소했어요',scheduleLabel(booking),booking.course));
      break;
    }
    case 'settings':
      body.append(intro('설정','추천과 알림을 변경할 수 있어요.'),settingsForm(screen,vars));
      break;
    case 'search-empty':
      body.append(intro('일치하는 수업이 없어요',vars.query.trim()?'‘'+vars.query.trim()+'’에 맞는 수업을 찾지 못했어요.':'선택한 지역과 종류에 맞는 수업을 찾지 못했어요.','검색 결과'),
        element('p','paper-notice empty-notice','검색어와 필터를 초기화하면 전체 수업을 볼 수 있어요.'));
      break;
    case 'payment-error':
      body.append(intro('결제를 완료하지 못했어요','예약 정보와 일정은 그대로예요.'),element('p','paper-notice empty-notice','결제를 다시 시도하거나 예약 정보를 확인할 수 있어요.'),
        reservationSummary(vars));
      break;
  }
}

function popup(screen,vars) {
  const close = closeButton(screen);
  const heading = element('h2','paper-h2',
    {filters:'필터',confirm:'이 내용으로 예약할까요?',cancel:'예약을 취소할까요?'}[screen.id]);
  heading.id = screen.id+'-popup-title';
  const panel = write(element('section','paper-modal'),write(element('header','popup-head'),heading,close));
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-labelledby',heading.id);
  const actions = element('div','paper-modal-actions');
  if (screen.id==='filters') {
    const draft = {area:vars.area, category:vars.category};
    panel.append(write(element('div','stack'),picker('공방 지역',regions,draft.area,value=>draft.area=value,'area'),
      radioGroup('수업 종류',categories,draft.category,value=>draft.category=value,'filter-category','category')));
    const apply = actionButton(screen,'apply','filled','medium',{updates:draft});
    actions.append(apply);
  } else if (screen.id==='confirm') {
    panel.append(reservationSummary(vars,true));
    const updates = Object.fromEntries(reservationFields.map(key=>[savedKey(key),vars[key]]));
    actions.append(actionButton(screen,'close','text'),actionButton(screen,'pay','filled','medium',{updates}));
  } else {
    const booking = savedReservation(vars);
    panel.append(element('p','lead',booking.course+' · '+scheduleLabel(booking)),
      element('p','lead','취소하면 이 수업의 자리가 반환돼요.'));
    actions.append(actionButton(screen,'close','text'),actionButton(screen,'cancel','filled'));
  }
  panel.append(actions);
  panel.addEventListener('keydown',event=>{
    if (event.key==='Escape') { event.preventDefault(); close.click(); }
  });
  return write(element('div','popup-layer'),panel);
}

function appTabs(screen) {
  const tabs = element('nav','tabbar');
  tabs.setAttribute('aria-label','도예 공방');
  for (const [id,label] of [['browse','수업'],['bookings','내 예약'],['settings','설정']]) {
    const tab = button(label,'paper-tab',()=>{ if (id!==screen.id) act(screen,id); });
    if (id===screen.id) {
      tab.setAttribute('aria-current','page');
      tab.dataset.control = 'current-tab';
    } else tab.dataset.action = id;
    tabs.append(tab);
  }
  return tabs;
}

function workshopScreen(screen,current) {
  const device = element('div','device paper-ui paper-hand-labels');
  device.dataset.kind = screen.id;
  const {vars} = current;
  const underlay = {filters:'browse',confirm:'checkout',cancel:'booking'}[screen.id];
  const base = underlay ? screens.get(underlay) : screen;
  const status = write(element('div','statusbar'),'9:41',
    write(element('span','indicators'),element('i','signal'),element('i','battery')));
  status.setAttribute('aria-hidden','true');
  const back = base.actions.find(action=>action.kind==='back');
  const hasTabs = base.actions.some(action=>action.kind==='tab');
  const header = write(element('div','appbar'),element('span','paper-h3','도예 공방'),
    back && actionButton(base,back.id,'text','small'));
  const body = element('div','app-content');
  const guard = renderContent(body,screen,vars);
  const feedback = element('p','screen-error paper-notice',screen.id===active ? message : '');
  feedback.setAttribute('role','status');
  body.append(feedback);
  const footer = element('div','app-actions');
  for (const action of base.actions.filter(action=>!action.kind || action.kind==='secondary')) {
    footer.append(actionButton(base,action.id,action.kind==='secondary'?'text':'filled',
      action.kind==='secondary'?'medium':'large',{guard}));
  }
  const surface = write(element('div','app-surface'),status,header,body,footer.childElementCount?footer:null,hasTabs?appTabs(base):null);
  surface.inert = Boolean(underlay);
  return write(device,surface,underlay?popup(screen,vars):null);
}

function workshopRequestContext(id,current) {
  const vars = ['success','bookings','booking','cancel','cancelled'].includes(id) ? savedReservation(current) : current;
  return [vars.course,vars.date+'일 '+vars.time,vars.guests,vars.reservation,
    vars.area,vars.category,vars.query?'검색어 '+vars.query:''].filter(Boolean).join(' · ');
}

