@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');

:root {
  --bg: #000;
  --card: #0a0a0a;
  --text: #fff;
  --muted: #ccc;
  --glass: rgba(255, 255, 255, 0.05);
  --border: rgba(255, 255, 255, 0.08);
  --accent: #fff;
  --shadow: 0 10px 40px rgba(255, 255, 255, 0.03);
  font-family: 'Space Grotesk', sans-serif;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  -webkit-font-smoothing: antialiased;
}

.container {
  max-width: 1100px;
  margin: 40px auto;
  padding: 0 20px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 55px;
  height: 55px;
  background: #fff;
  color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 14px;
  font-weight: 800;
  font-size: 22px;
}

.brand-title {
  font-weight: 800;
  font-size: 24px;
  letter-spacing: 0.5px;
}

.search {
  padding: 12px 14px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  width: 280px;
  transition: 0.3s;
}

.search:focus {
  border-color: #fff;
  outline: none;
  box-shadow: 0 0 12px rgba(255,255,255,0.1);
}

.btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 12px;
  padding: 10px 18px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn:hover {
  background: #fff;
  color: #000;
}

.btn.primary {
  background: #fff;
  color: #000;
  border: none;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 20px;
}

.card {
  background: var(--card);
  border-radius: 16px;
  padding: 18px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 0 30px rgba(255,255,255,0.06);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 14px;
}

.card-icon {
  width: 64px;
  height: 64px;
  background: var(--glass);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-weight: 700;
  font-size: 18px;
}

.card-meta {
  color: var(--muted);
  font-size: 13px;
}

.card-code {
  background: #111;
  border-radius: 12px;
  padding: 12px;
  font-family: monospace;
  color: var(--text);
  font-size: 13px;
  margin-top: 12px;
  max-height: 200px;
  overflow-y: auto;
  position: relative;
}

.copy-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--glass);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: 0.2s;
}

.copy-btn:hover {
  background: #fff;
  color: #000;
}

.fab {
  position: fixed;
  right: 25px;
  bottom: 25px;
  background: #fff;
  color: #000;
  border: none;
  padding: 14px 20px;
  font-weight: 700;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 10px 40px rgba(255,255,255,0.1);
  transition: 0.2s;
}

.fab:hover {
  transform: scale(1.05);
}

.footer {
  margin-top: 40px;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
  padding-bottom: 20px;
}
