(() => {
  "use strict";
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const toast = (message) => {
    const el = $("#toast"); el.textContent = message; el.classList.add("show");
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2600);
  };

  // Responsive navigation
  const menuToggle = $("#menuToggle"), nav = $("#nav");
  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  $$(".nav-link").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false");
    $$(".nav-link").forEach(item => item.classList.remove("active")); link.classList.add("active");
  }));

  // Current year
  $("#year").textContent = new Date().getFullYear();

  // Canvas starfield: lightweight pseudo-3D depth animation
  const canvas = $("#universe"), ctx = canvas.getContext("2d");
  let width=0, height=0, stars=[], pointer={x:0,y:0}, dpr=1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = width*dpr; canvas.height = height*dpr;
    canvas.style.width = width+"px"; canvas.style.height = height+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
    stars = Array.from({length:Math.min(180,Math.floor(width*height/6500))}, () => ({
      x:Math.random()*width, y:Math.random()*height, z:Math.random()*1+.15,
      r:Math.random()*1.25+.25, phase:Math.random()*Math.PI*2
    }));
  }
  function drawStars(t=0) {
    ctx.clearRect(0,0,width,height);
    for(const s of stars) {
      const x=s.x + pointer.x*s.z*12, y=s.y + pointer.y*s.z*12;
      const alpha=.25 + (Math.sin(t*.0007+s.phase)+1)*.24;
      ctx.beginPath(); ctx.arc(x,y,s.r*s.z,0,Math.PI*2);
      ctx.fillStyle=`rgba(190,211,255,${alpha})`; ctx.fill();
    }
    requestAnimationFrame(drawStars);
  }
  window.addEventListener("resize", resize, {passive:true});
  window.addEventListener("pointermove", e => {
    pointer.x=(e.clientX/width-.5)*2; pointer.y=(e.clientY/height-.5)*2;
    const glow=$("#cursorGlow"); glow.style.left=e.clientX+"px"; glow.style.top=e.clientY+"px";
  }, {passive:true});
  resize(); requestAnimationFrame(drawStars);

  // Scroll reveal + active section navigation
  const revealTargets = $$(".section-heading,.about-visual,.about-copy,.skill-card,.project-card,.journey-item,.contact-section .contact-copy");
  revealTargets.forEach(el => el.classList.add("reveal"));
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target);}
  }), {threshold:.12});
  revealTargets.forEach(el => observer.observe(el));
  const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting) {
      const id=entry.target.id;
      $$(".nav-link").forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+id));
    }
  }), {rootMargin:"-35% 0px -55% 0px"});
  $$("main section[id]").forEach(s=>sectionObserver.observe(s));

  // Project filters
  const filterButtons=$$(".filter-btn"), projectCards=$$(".project-card");
  filterButtons.forEach(btn=>btn.addEventListener("click",()=>{
    filterButtons.forEach(b=>b.classList.remove("active")); btn.classList.add("active");
    const filter=btn.dataset.filter; let shown=0;
    projectCards.forEach(card=>{
      const visible=filter==="all"||card.dataset.category===filter;
      card.classList.toggle("hidden",!visible); if(visible)shown++;
    });
    $("#projectCount").textContent=`SHOWING / ${String(shown).padStart(2,"0")}`;
  }));

  // Subtle 3D card tilt on pointer devices
  if(matchMedia("(pointer:fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    projectCards.forEach(card=>{
      card.addEventListener("pointermove",e=>{
        const r=card.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`perspective(800px) rotateY(${x*7}deg) rotateX(${-y*6}deg) translateY(-5px)`;
      });
      card.addEventListener("pointerleave",()=>card.style.transform="");
    });
  }

  // GitHub public repository loader
  const loadButton=$("#loadRepos"), repoList=$("#repoList"), githubStatus=$("#githubStatus");
  loadButton.addEventListener("click", async()=>{
    loadButton.disabled=true; loadButton.textContent="Loading repositories…"; githubStatus.textContent="CONNECTING TO GITHUB";
    try {
      const response=await fetch("https://api.github.com/users/Saipratap-ux/repos?per_page=100&sort=updated",{
        headers:{"Accept":"application/vnd.github+json"}
      });
      if(!response.ok) throw new Error(response.status===403?"GitHub rate limit reached. Try again later.":`GitHub returned ${response.status}.`);
      const repos=await response.json();
      const publicRepos=repos.filter(r=>!r.fork).slice(0,30);
      repoList.innerHTML="";
      if(!publicRepos.length){repoList.textContent="No public repositories were returned.";return;}
      publicRepos.forEach(repo=>{
        const item=document.createElement("article"); item.className="repo-item";
        const info=document.createElement("div"), title=document.createElement("h4"), desc=document.createElement("p");
        title.textContent=repo.name; desc.textContent=repo.description||"Public repository by Saipratap Dansana.";
        info.append(title,desc);
        const link=document.createElement("a"); link.href=repo.html_url; link.target="_blank"; link.rel="noopener"; link.textContent="OPEN ↗";
        item.append(info,link); repoList.append(item);
      });
      githubStatus.textContent=`SYNC COMPLETE · ${publicRepos.length} REPOSITORIES SHOWN`;
      toast("GitHub projects loaded successfully.");
    } catch(error) {
      githubStatus.textContent="GITHUB SYNC UNAVAILABLE";
      toast(error.message+" Featured projects are still available above.");
    } finally {
      loadButton.disabled=false; loadButton.innerHTML='Load GitHub projects <span>↻</span>';
    }
  });

  // Cinematic ambient sound generated locally with Web Audio; no audio file or external service.
  let audioContext=null, master=null, oscillators=[], soundOn=false, lfo=null;
  function startSound() {
    const AudioCtx=window.AudioContext||window.webkitAudioContext;
    if(!AudioCtx){toast("Your browser does not support Web Audio.");return;}
    if(!audioContext) {
      audioContext=new AudioCtx(); master=audioContext.createGain(); master.gain.value=0;
      const filter=audioContext.createBiquadFilter(); filter.type="lowpass"; filter.frequency.value=650;
      master.connect(filter); filter.connect(audioContext.destination);
      [55,82.41,110,164.81].forEach((freq,i)=>{
        const osc=audioContext.createOscillator(), gain=audioContext.createGain();
        osc.type=i===2?"sine":"triangle"; osc.frequency.value=freq;
        gain.gain.value=[.13,.055,.035,.018][i]; osc.connect(gain); gain.connect(master); osc.start(); oscillators.push(osc);
      });
      lfo=audioContext.createOscillator(); const lfoGain=audioContext.createGain();
      lfo.frequency.value=.08; lfoGain.gain.value=100; lfo.connect(lfoGain); lfoGain.connect(filter.frequency); lfo.start();
    }
    audioContext.resume();
    master.gain.cancelScheduledValues(audioContext.currentTime);
    master.gain.setTargetAtTime(.22,audioContext.currentTime,.8);
    soundOn=true; $("#soundToggle").setAttribute("aria-pressed","true"); $("#soundLabel").textContent="SOUND ON";
    $("#soundToggle").title="Turn cinematic sound off";
  }
  function stopSound() {
    if(master&&audioContext) master.gain.setTargetAtTime(0,audioContext.currentTime,.25);
    soundOn=false; $("#soundToggle").setAttribute("aria-pressed","false"); $("#soundLabel").textContent="SOUND OFF";
    $("#soundToggle").title="Enable cinematic sound";
  }
  $("#soundToggle").addEventListener("click",()=>{
    if(soundOn) stopSound(); else {startSound();if(soundOn)toast("Cinematic ambience enabled.");}
  });

  // Keyboard accessibility for Escape closes mobile menu
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){nav.classList.remove("open");menuToggle.setAttribute("aria-expanded","false");}});
})();

// Register the service worker only on HTTPS or localhost.
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
