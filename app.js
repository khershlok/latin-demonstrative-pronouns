(function(){
  const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\s+/g,'');
  const accepts=ans=>{const set=new Set();ans.split('|').forEach(a=>{set.add(norm(a));a.split('/').forEach(p=>set.add(norm(p)));});return set;};
  const display=ans=>ans.split('|')[0];
  const CASES=['Nominative','Accusative','Genitive','Dative','Ablative'];
  let lastFocus=null;
  function build(){
    const nav=document.querySelector('nav');const main=document.getElementById('tables');
    TABLES.forEach(t=>{
      const a=document.createElement('a');a.href='#'+t.id;a.textContent=t.title;nav.insertBefore(a,nav.querySelector('.score'));
      const sec=document.createElement('section');sec.className='tbl';sec.id=t.id;
      sec.innerHTML=`<h2>${t.title} <span class="gloss">= ${t.gloss}</span> <span class="note">${t.note||''}</span></h2>`;
      const tb=document.createElement('table');
      tb.innerHTML=`<thead><tr><th></th><th>${t.heads[0]}</th><th>${t.heads[1]}</th><th>${t.heads[2]}</th></tr></thead>`;
      const body=document.createElement('tbody');
      t.sections.forEach((s,si)=>{
        const nr=document.createElement('tr');nr.className='numrow';nr.innerHTML=`<td colspan="4">${s.label}</td>`;body.appendChild(nr);
        s.rows.forEach((row,ri)=>{
          const tr=document.createElement('tr');
          tr.innerHTML=`<td class="case">${CASES[ri]}</td>`;
          row.forEach((ans,gi)=>{
            const td=document.createElement('td');const inp=document.createElement('input');
            inp.dataset.ans=ans;inp.dataset.col=si*100+gi;inp.dataset.row=ri;inp.autocomplete='off';inp.spellcheck=false;inp.setAttribute('autocapitalize','off');
            inp.setAttribute('aria-label',`${t.title} ${s.label} ${CASES[ri]} ${t.heads[gi]}`);
            inp.addEventListener('focus',()=>lastFocus=inp);
            inp.addEventListener('input',()=>{inp.classList.remove('ok','bad');inp.nextSibling.textContent='';});
            inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const all=[...sec.querySelectorAll('input')].sort((a,b)=>(a.dataset.col-b.dataset.col)||(a.dataset.row-b.dataset.row));const i=all.indexOf(inp);if(all[i+1])all[i+1].focus();else checkTable(sec);}});
            const fix=document.createElement('span');fix.className='fix';
            td.appendChild(inp);td.appendChild(fix);tr.appendChild(td);
          });
          body.appendChild(tr);
        });
      });
      tb.appendChild(body);sec.appendChild(tb);
      const b=document.createElement('div');b.className='btns';
      b.innerHTML=`<button class="primary">Check</button><button>Show answers</button><button>Clear</button><span class="result"></span><a class="top" href="#top" style="margin-left:auto">↑ back to top</a>`;
      const [c,sh,cl]=b.querySelectorAll('button');
      c.onclick=()=>checkTable(sec);sh.onclick=()=>showTable(sec);cl.onclick=()=>clearTable(sec);
      sec.appendChild(b);main.appendChild(sec);
    });
    document.querySelectorAll('.macrons button').forEach(btn=>btn.onclick=()=>{
      if(!lastFocus)return;const el=lastFocus,p=el.selectionStart??el.value.length;
      el.value=el.value.slice(0,p)+btn.textContent+el.value.slice(el.selectionEnd??p);el.focus();el.setSelectionRange(p+1,p+1);el.dispatchEvent(new Event('input'));
    });
  }
  function checkTable(sec){
    let ok=0,n=0;
    sec.querySelectorAll('input').forEach(inp=>{n++;const good=inp.value.trim()&&accepts(inp.dataset.ans).has(norm(inp.value));
      inp.classList.toggle('ok',!!good);inp.classList.toggle('bad',!good);inp.nextSibling.textContent=good?'':'→ '+display(inp.dataset.ans);if(good)ok++;});
    sec.querySelector('.result').textContent=`${ok} / ${n} correct`+(ok===n?' — perfect!':'');
    updateScore();
  }
  function showTable(sec){sec.querySelectorAll('input').forEach(inp=>{inp.value=display(inp.dataset.ans);inp.classList.remove('ok','bad');inp.nextSibling.textContent='';});sec.querySelector('.result').textContent='Answers shown — press Clear to try again.';}
  function clearTable(sec){sec.querySelectorAll('input').forEach(inp=>{inp.value='';inp.classList.remove('ok','bad');inp.nextSibling.textContent='';});sec.querySelector('.result').textContent='';updateScore();}
  function updateScore(){const all=document.querySelectorAll('#tables input');const ok=document.querySelectorAll('#tables input.ok').length;document.querySelector('nav .score').textContent=`Score: ${ok} / ${all.length}`;}
  document.addEventListener('DOMContentLoaded',()=>{build();updateScore();
    const go=()=>{const h=location.hash.slice(1);const el=h&&document.getElementById(h);if(el)el.scrollIntoView();};go();window.addEventListener('hashchange',go);});
})();
