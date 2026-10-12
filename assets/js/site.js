// Code block chrome: language label + copy button
document.querySelectorAll("div.highlighter-rouge").forEach(function (block) {
  var match = block.className.match(/language-(\S+)/);
  var lang = match && match[1] !== "plaintext" ? match[1] : "text";

  var bar = document.createElement("div");
  bar.className = "code-bar";
  bar.innerHTML = '<span class="dots"><i></i><i></i><i></i></span><span class="lang"></span>';
  bar.querySelector(".lang").textContent = lang;

  if (navigator.clipboard) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "copy";
    btn.addEventListener("click", function () {
      var code = block.querySelector("pre");
      navigator.clipboard.writeText(code ? code.innerText : "").then(function () {
        btn.textContent = "copied!";
        setTimeout(function () { btn.textContent = "copy"; }, 1500);
      });
    });
    bar.appendChild(btn);
  }

  block.insertBefore(bar, block.firstChild);
});

// Archive grep filter
var filter = document.getElementById("post-filter");
if (filter) {
  var rows = document.querySelectorAll(".archive-list li");
  var years = document.querySelectorAll(".archive-year");
  var count = document.getElementById("post-count");
  var empty = document.querySelector(".archive-empty");

  filter.addEventListener("input", function () {
    var q = filter.value.trim().toLowerCase();
    var shown = 0;
    rows.forEach(function (li) {
      var hit = !q || li.getAttribute("data-search").indexOf(q) !== -1;
      li.hidden = !hit;
      if (hit) shown++;
    });
    years.forEach(function (y) {
      y.hidden = !y.querySelector("li:not([hidden])");
    });
    count.textContent = shown;
    empty.hidden = shown !== 0;
  });
}

// Wallet address copy buttons
document.querySelectorAll(".wallet-copy").forEach(function (btn) {
  if (!navigator.clipboard) { btn.hidden = true; return; }
  btn.addEventListener("click", function () {
    navigator.clipboard.writeText(btn.getAttribute("data-copy")).then(function () {
      btn.textContent = "copied!";
      setTimeout(function () { btn.textContent = "copy"; }, 1500);
    });
  });
});
