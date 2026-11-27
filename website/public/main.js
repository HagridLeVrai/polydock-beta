// Site vitrine Polydock : thème, langue, système de l'utilisateur et liens vers la dernière version.

// Adresse du service hébergé. Vide tant qu'il n'existe pas : le bouton affiche alors « Bientôt ».
const HOSTED_URL = "";

const REPO = "HagridLeVrai/polydock-beta";
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases?per_page=10`;
const ASSETS = {
  win: /-win-x64\.exe$/i,
  "mac-arm": /-mac-arm64\.dmg$/i,
  "mac-x64": /-mac-x64\.dmg$/i,
  linux: /\.AppImage$/i,
  deb: /\.deb$/i,
};

const store = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
};

// Thème : bascule clair/sombre, retenue pour les visites suivantes.
const root = document.documentElement;
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
function effectiveTheme() {
  return root.dataset.theme || (darkQuery.matches ? "dark" : "light");
}
for (const button of document.querySelectorAll("[data-theme-toggle]")) {
  button.addEventListener("click", () => {
    const next = effectiveTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    store.set("theme", next);
  });
}

// Langue : un choix explicite empêche la redirection automatique vers /fr/.
for (const link of document.querySelectorAll("[data-lang]")) {
  link.addEventListener("click", () => store.set("lang", link.dataset.lang));
}

// En-tête : un filet apparaît quand on fait défiler.
const header = document.querySelector(".top");
if (header) {
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

// Le système de l'utilisateur, pour mettre en avant le bon installateur.
function detectOs() {
  const ua = navigator.userAgent;
  const platform = navigator.userAgentData?.platform || navigator.platform || "";
  if (/android|iphone|ipad|ipod/i.test(ua)) return null;
  if (/win/i.test(platform) || /windows/i.test(ua)) return "win";
  if (/mac/i.test(platform) || /mac os x/i.test(ua)) {
    // Un iPad se présente comme un Mac mais a un écran tactile.
    if (navigator.maxTouchPoints > 1) return null;
    return isIntelMac() ? "mac-x64" : "mac-arm";
  }
  if (/linux/i.test(platform) || /linux/i.test(ua)) return "linux";
  return null;
}
function isIntelMac() {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    const info = gl?.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : "";
    return /intel|amd|radeon/i.test(renderer);
  } catch {
    return false;
  }
}

const os = detectOs();
if (os) {
  document.querySelector(`.dl[data-os="${os}"]`)?.classList.add("is-yours");
  for (const cta of document.querySelectorAll("[data-download-cta]")) {
    const label = cta.dataset[`label${os === "win" ? "Win" : os === "linux" ? "Linux" : "Mac"}`];
    const text = cta.querySelector("span:not(.i)");
    if (label && text) text.textContent = label;
  }
}

// Les liens directs de la dernière version publiée (bêta comprise).
function applyRelease(release) {
  const version = release.tag_name.replace(/^v/, "");
  for (const el of document.querySelectorAll("[data-version]")) el.textContent = version;
  for (const el of document.querySelectorAll("[data-release-link]")) el.href = release.html_url;
  for (const [key, pattern] of Object.entries(ASSETS)) {
    const asset = release.assets.find((a) => pattern.test(a.name));
    if (!asset) continue;
    const size = `${Math.round(asset.size / 1e6)} Mo`;
    for (const link of document.querySelectorAll(`[data-asset="${key}"]`)) {
      link.href = asset.browser_download_url;
    }
    for (const el of document.querySelectorAll(`[data-file="${key}"]`)) {
      el.textContent = `${asset.name} · ${document.documentElement.lang === "fr" ? size : size.replace("Mo", "MB")}`;
    }
  }
}
async function loadRelease() {
  const cached = sessionStorage.getItem("polydock-release");
  if (cached) return JSON.parse(cached);
  const response = await fetch(RELEASES_API, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error(`GitHub ${response.status}`);
  const releases = await response.json();
  const release = releases.find((r) => !r.draft && r.assets.length > 0);
  if (!release) throw new Error("no release");
  const slim = {
    tag_name: release.tag_name,
    html_url: release.html_url,
    assets: release.assets.map(({ name, size, browser_download_url }) => ({ name, size, browser_download_url })),
  };
  try {
    sessionStorage.setItem("polydock-release", JSON.stringify(slim));
  } catch {}
  return slim;
}
loadRelease()
  .then(applyRelease)
  .catch(() => {
    // Les liens écrits dans la page restent valables : ils mènent à une version publiée.
  });

// Bouton du service hébergé : tant que HOSTED_URL est vide, il mène à la section qui l'annonce.
if (HOSTED_URL) {
  for (const link of document.querySelectorAll("[data-hosted]")) {
    link.href = HOSTED_URL;
    link.removeAttribute("aria-disabled");
    link.querySelector(".soon")?.remove();
  }
}

// Copier la commande Docker.
for (const button of document.querySelectorAll("[data-copy]")) {
  button.addEventListener("click", async () => {
    const text = document.querySelector(button.dataset.copy)?.innerText.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      const label = button.textContent;
      button.textContent = button.dataset.copied || "OK";
      setTimeout(() => {
        button.textContent = label;
      }, 1600);
    } catch {}
  });
}
