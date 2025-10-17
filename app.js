// app.js
import { supabase } from "./supabaseClient.js";

const $ = (id) => document.getElementById(id);

function showMsg(el, txt, color){ if(!el) return; el.textContent = txt; el.style.color = color || "var(--muted)"; setTimeout(()=>{ if(el) el.textContent = ""; }, 6000); }

async function getCurrentUser(){ const { data } = await supabase.auth.getUser(); return data?.user || null; }

async function renderAuthButtons(){
  const cur = await getCurrentUser();
  const el = document.getElementById("authButtons") || document.getElementById("topAuth") || document.getElementById("profileAuth");
  if(!el) return;
  el.innerHTML = "";
  if(cur){
    const name = cur.user_metadata?.username || cur.email || cur.user_metadata?.full_name || "User";
    const icon = document.createElement("div"); icon.className = "icon-circle"; icon.textContent = (name[0] || "U").toUpperCase();
    const profileLink = document.createElement("a"); profileLink.href = "profile.html"; profileLink.className = "btn"; profileLink.textContent = "Profile";
    const logout = document.createElement("button"); logout.className = "btn"; logout.textContent = "Log out";
    logout.onclick = async ()=>{ await supabase.auth.signOut(); window.location.href = "index.html"; };
    el.appendChild(icon); el.appendChild(profileLink); el.appendChild(logout);
  } else {
    const loginA = document.createElement("a"); loginA.href = "login.html"; loginA.className = "btn"; loginA.textContent = "Log in";
    const signupA = document.createElement("a"); signupA.href = "signup.html"; signupA.className = "btn primary"; signupA.textContent = "Sign up";
    el.appendChild(loginA); el.appendChild(signupA);
  }
}

// INDEX
async function loadRecentScripts(){
  const grid = $("cardGrid"); if(!grid) return;
  grid.innerHTML = "";
  let { data, error } = await supabase.from("scripts").select("id,title,code,created_at,user_id,game,icon,keyless").order("created_at",{ascending:false}).limit(200);
  if(error){ console.error(error); showMsg($("noResults"), "Failed to load scripts"); return; }
  const q = new URLSearchParams(location.search).get("q") || "";
  if(q){ const ql = q.toLowerCase(); data = data.filter(s => (s.title||"").toLowerCase().includes(ql) || (s.game||"").toLowerCase().includes(ql) || (s.code||"").toLowerCase().includes(ql)); }
  if(!data || data.length===0){ $("noResults").style.display = "block"; return; } else $("noResults").style.display = "none";
  data.forEach(s => grid.appendChild(buildScriptCard(s)));
}

function buildScriptCard(s){
  const c = document.createElement("div"); c.className = "card";
  const created = new Date(s.created_at).toLocaleString();
  const iconHtml = s.icon ? `<img src="${sanitize(s.icon)}" style="width:100%;height:100%;object-fit:cover">` : "🎮";
  c.innerHTML = `
    <div class="card-head">
      <div class="card-icon">${iconHtml}</div>
      <div style="flex:1">
        <div class="card-title">${escapeHtml(s.title)}</div>
        <div class="card-meta">${escapeHtml(s.game||"Unknown game")} • ${s.keyless === "yes" ? "Keyless" : "Keyed"} • ${created}</div>
      </div>
    </div>
    <div class="card-code">${escapeHtml(truncate(s.code || "", 600))}</div>
    <div class="card-actions">
      <button class="btn" data-id="${s.id}" onclick="viewScript('${s.id}')">View</button>
    </div>
  `;
  return c;
}

window.viewScript = async function(id){
  const { data, error } = await supabase.from("scripts").select("*").eq("id", id).single();
  if(error || !data) { alert("Failed to open script"); return; }
  const win = window.open("", "_blank");
  const html = `
    <html><head><title>${escapeHtml(data.title)}</title>
      <link rel="stylesheet" href="styles.css" />
    </head><body style="padding:20px;background:#000;color:#fff">
      <a href="index.html" class="btn">Back</a>
      <h2 style="margin-top:10px">${escapeHtml(data.title)}</h2>
      <div class="small">Game: ${escapeHtml(data.game||"Unknown")} • ${data.keyless === "yes" ? "Keyless" : "Keyed"}</div>
      <div style="margin-top:14px;padding:12px;background:#0a0a0a;border-radius:10px">
        <pre style="white-space:pre-wrap;font-family:monospace">${escapeHtml(data.code)}</pre>
      </div>
      <div style="margin-top:12px" class="small">Posted: ${new Date(data.created_at).toLocaleString()}</div>
    </body></html>
  `;
  win.document.write(html);
  win.document.close();
};

// SEARCH
function initSearch(){
  const input = $("searchInput");
  if(!input) return;
  input.addEventListener("keyup", debounce(async (e)=>{
    const q = e.target.value.trim();
    if(q.length === 0) {
      history.replaceState({}, "", "index.html");
      await loadRecentScripts();
      return;
    }
    history.replaceState({}, "", "index.html?q=" + encodeURIComponent(q));
    await loadRecentScripts();
  }, 300));
}

// AUTH pages
async function bindLogin(){
  const loginBtn = $("loginBtn");
  if(loginBtn){
    loginBtn.onclick = async ()=>{
      const email = $("loginEmail").value.trim();
      const password = $("loginPassword").value;
      if(!email || !password){ showMsg($("loginMsg"), "Enter email & password"); return; }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if(error){ showMsg($("loginMsg"), error.message, "tomato"); return; }
      showMsg($("loginMsg"), "Logged in. Redirecting...");
      setTimeout(()=>window.location.href="index.html", 700);
    };
  }
  const googleBtn = $("googleLoginBtn");
  if(googleBtn){
    googleBtn.onclick = async ()=>{
      await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + "/index.html" } });
    };
  }
}

async function bindSignup(){
  const signupBtn = $("signupBtn");
  if(signupBtn){
    signupBtn.onclick = async ()=>{
      const username = $("signupUsername").value.trim();
      const email = $("signupEmail").value.trim();
      const password = $("signupPassword").value;
      if(!username || !email || !password){ showMsg($("signupMsg"), "Fill all fields"); return; }
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
      if(error){ showMsg($("signupMsg"), error.message, "tomato"); return; }
      const userId = data?.user?.id;
      if(userId){
        await supabase.from("users").upsert({ id: userId, username, email }, { onConflict: "id" });
      }
      showMsg($("signupMsg"), "Account created. Check your email. Redirecting...");
      setTimeout(()=>window.location.href="index.html", 900);
    };
  }
  const googleBtn = $("signupGoogleBtn");
  if(googleBtn){
    googleBtn.onclick = async ()=>{
      await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + "/index.html" } });
    };
  }
}

// POST page wiring
async function bindPost(){
  const postBtn = $("postBtn");
  if(!postBtn) return;
  postBtn.onclick = async ()=>{
    const title = $("postTitle").value.trim();
    const code = $("postCode").value.trim();
    const game = $("postGame").value.trim();
    const icon = $("postIcon").value.trim();
    const keyless = $("postKeyless").value;
    if(!title || !code){ showMsg($("postMsg"), "Title and code required", "tomato"); return; }
    const user = await getCurrentUser();
    if(!user){ showMsg($("postMsg"), "You must be logged in to post", "tomato"); return; }

    // insert
    const payload = { title, code, game, icon, keyless, user_id: user.id };
    const { data, error } = await supabase.from("scripts").insert(payload).select().single();
    if(error){ console.error(error); showMsg($("postMsg"), "Failed to post", "tomato"); return; }
    showMsg($("postMsg"), "Posted successfully!");
    setTimeout(()=>window.location.href="index.html", 700);
  };

  // live preview
  const previewPanel = $("previewPanel");
  const previewInputs = ["postTitle","postGame","postIcon","postKeyless","postCode"];
  previewInputs.forEach(id => {
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener("input", ()=>{
      const title = $("postTitle").value || "Untitled";
      const game = $("postGame").value || "Unknown game";
      const icon = $("postIcon").value;
      const keyless = $("postKeyless").value === "yes" ? "Keyless" : "Keyed";
      const code = $("postCode").value || "";
      previewPanel.innerHTML = `
        <div class="card" style="max-width:720px">
          <div class="card-head">
            <div class="card-icon">${icon ? `<img src="${sanitize(icon)}" style="width:100%;height:100%;object-fit:cover">` : "🎮"}</div>
            <div style="flex:1">
              <div class="card-title">${escapeHtml(title)}</div>
              <div class="card-meta">${escapeHtml(game)} • ${keyless}</div>
            </div>
          </div>
          <div class="card-code">${escapeHtml(truncate(code, 400))}</div>
        </div>
      `;
    });
  });
}

// PROFILE
async function loadProfile(){
  const user = await getCurrentUser();
  if(!user){ window.location.href = "login.html"; return; }
  $("pfName").textContent = user.user_metadata?.username || user.email || "User";
  $("pfEmail").textContent = user.email;
  $("pfIcon").textContent = (user.user_metadata?.username || user.email || "U")[0].toUpperCase();

  const { data, error } = await supabase.from("scripts").select("*").eq("user_id", user.id).order("created_at",{ascending:false});
  if(error){ showMsg($("profileMsg"), "Failed to load your scripts", "tomato"); return; }
  const grid = $("myScripts"); grid.innerHTML = "";
  if(!data || data.length === 0) grid.innerHTML = "<div class='small'>You haven't published any scripts yet.</div>";
  data.forEach(s => {
    const card = document.createElement("div"); card.className = "card";
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700">${escapeHtml(s.title)}</div>
          <div class="small">${escapeHtml(s.game||"Unknown")} • ${s.keyless}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn" data-id="${s.id}" onclick="openEdit('${s.id}')">Edit</button>
          <button class="btn" onclick="deleteScript('${s.id}')">Delete</button>
        </div>
      </div>
      <div class="card-code">${escapeHtml(truncate(s.code,400))}</div>
    `;
    grid.appendChild(card);
  });

  // change password
  const changeBtn = $("changePassBtn");
  changeBtn.onclick = async () => {
    const newP = $("changePassNew").value;
    if(!newP){ showMsg($("profileMsg"), "Enter new password"); return; }
    const { error } = await supabase.auth.updateUser({ password: newP });
    if(error){ showMsg($("profileMsg"), "Failed: " + error.message, "tomato"); return; }
    showMsg($("profileMsg"), "Password changed");
    $("changePassNew").value = "";
  };

  $("logoutBtn").onclick = async () => { await supabase.auth.signOut(); window.location.href = "index.html"; };
}

// delete/edit functions
window.deleteScript = async function(id){
  if(!confirm("Delete this script? This action cannot be undone.")) return;
  const user = await getCurrentUser();
  if(!user) return;
  const { error } = await supabase.from("scripts").delete().eq("id", id).eq("user_id", user.id);
  if(error){ alert("Failed to delete: " + error.message); return; }
  alert("Deleted");
  location.reload();
};

window.openEdit = async function(id){
  localStorage.setItem("editScriptId", id);
  window.location.href = "post.html";
};

async function checkEditMode(){
  const editId = localStorage.getItem("editScriptId");
  if(!editId) return;
  const { data, error } = await supabase.from("scripts").select("*").eq("id", editId).single();
  if(error || !data) { localStorage.removeItem("editScriptId"); return; }
  const user = await getCurrentUser();
  if(!user || user.id !== data.user_id){ alert("You don't own this script"); localStorage.removeItem("editScriptId"); return; }
  $("postTitle").value = data.title;
  $("postGame").value = data.game || "";
  $("postIcon").value = data.icon || "";
  $("postKeyless").value = data.keyless || "no";
  $("postCode").value = data.code || "";
  const postBtn = $("postBtn");
  postBtn.textContent = "Update script";
  postBtn.onclick = async ()=>{
    const title = $("postTitle").value.trim();
    const code = $("postCode").value.trim();
    if(!title || !code){ showMsg($("postMsg"), "Title and code required", "tomato"); return; }
    const { error } = await supabase.from("scripts").update({
      title, code, game: $("postGame").value, icon: $("postIcon").value, keyless: $("postKeyless").value
    }).eq("id", editId).eq("user_id", user.id);
    if(error){ showMsg($("postMsg"), "Failed to update", "tomato"); return; }
    localStorage.removeItem("editScriptId");
    showMsg($("postMsg"), "Updated!");
    setTimeout(()=>window.location.href="profile.html", 700);
  };
}

// UTIL
function escapeHtml(str){ if(!str) return ""; return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }
function sanitize(url){ try{ return new URL(url).toString(); }catch(e){ return ""; } }
function truncate(s,n){ if(!s) return ""; return s.length>n ? s.slice(0,n)+"\n\n... (truncated)" : s; }
function debounce(fn, t=200){ let id; return (...a)=>{ clearTimeout(id); id=setTimeout(()=>fn(...a), t); }; }

// INIT
(async function init(){
  await renderAuthButtons();
  initSearch();

  if(document.querySelector("#cardGrid")) {
    await loadRecentScripts();
    const refresh = $("refreshBtn");
    if(refresh) refresh.onclick = loadRecentScripts;
  }

  if($("loginBtn")) await bindLogin();
  if($("signupBtn")) await bindSignup();

  if($("postBtn")) {
    await renderAuthButtons();
    await bindPost();
    await checkEditMode();
  }

  if($("pfName")) {
    await renderAuthButtons();
    await loadProfile();
  }

  const urlQ = new URLSearchParams(location.search).get("q");
  if(urlQ && $("searchInput")) $("searchInput").value = urlQ;
})();
