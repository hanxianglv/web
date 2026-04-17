const STORAGE_KEY = "thought-blog-posts";
const THEME_KEY = "thought-blog-theme";

const postForm = document.querySelector("#postForm");
const titleInput = document.querySelector("#title");
const tagsInput = document.querySelector("#tags");
const contentInput = document.querySelector("#content");
const postList = document.querySelector("#postList");
const postTemplate = document.querySelector("#postTemplate");
const emptyHint = document.querySelector("#emptyHint");
const clearAllBtn = document.querySelector("#clearAll");
const searchInput = document.querySelector("#search");
const themeToggle = document.querySelector("#themeToggle");

let posts = loadPosts();

function loadPosts() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function formatTime(isoString) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function parseTags(rawTags) {
  return rawTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function renderPosts(keyword = "") {
  postList.innerHTML = "";

  const normalizedKeyword = keyword.trim().toLowerCase();
  const filtered = posts.filter((post) => {
    if (!normalizedKeyword) {
      return true;
    }

    const fullText = `${post.title} ${post.content} ${post.tags.join(" ")}`.toLowerCase();
    return fullText.includes(normalizedKeyword);
  });

  emptyHint.hidden = filtered.length > 0;

  filtered.forEach((post) => {
    const fragment = postTemplate.content.cloneNode(true);
    const postTitle = fragment.querySelector(".post-title");
    const postMeta = fragment.querySelector(".post-meta");
    const postBody = fragment.querySelector(".post-body");
    const postTags = fragment.querySelector(".post-tags");
    const deleteBtn = fragment.querySelector(".delete-btn");

    postTitle.textContent = post.title;
    postMeta.textContent = `发布于 ${formatTime(post.createdAt)}`;
    postBody.textContent = post.content;

    post.tags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.textContent = `#${tag}`;
      postTags.appendChild(chip);
    });

    deleteBtn.addEventListener("click", () => {
      posts = posts.filter((item) => item.id !== post.id);
      savePosts();
      renderPosts(searchInput.value);
    });

    postList.appendChild(fragment);
  });
}

function addPost(event) {
  event.preventDefault();

  const post = {
    id: crypto.randomUUID(),
    title: titleInput.value.trim(),
    content: contentInput.value.trim(),
    tags: parseTags(tagsInput.value),
    createdAt: new Date().toISOString(),
  };

  if (!post.title || !post.content) {
    return;
  }

  posts.unshift(post);
  savePosts();
  postForm.reset();
  renderPosts(searchInput.value);
}

function clearAllPosts() {
  if (!posts.length) {
    return;
  }

  const shouldClear = window.confirm("确定要清空所有文章吗？此操作无法撤销。");
  if (!shouldClear) {
    return;
  }

  posts = [];
  savePosts();
  renderPosts(searchInput.value);
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  themeToggle.textContent = isDark ? "切换为浅色" : "切换为深色";
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  applyTheme(theme);
}

postForm.addEventListener("submit", addPost);
clearAllBtn.addEventListener("click", clearAllPosts);
searchInput.addEventListener("input", (event) => renderPosts(event.target.value));
themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
});

initTheme();
renderPosts();
