(function () {
  var daftar = document.getElementById('daftar');
  var now = document.getElementById('now');

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  // Favorit: nomor lagu yang diberi hati, disimpan di HP (localStorage)
  var KUNCI = '2ob-favorit', fav = {}, mode = 'semua', kartuAda = [];
  try { (JSON.parse(localStorage.getItem(KUNCI)) || []).forEach(function (n) { fav[n] = true; }); } catch (e) {}
  function simpan() {
    try { localStorage.setItem(KUNCI, JSON.stringify(Object.keys(fav).map(Number))); } catch (e) {}
  }
  function jumlah() { return Object.keys(fav).length; }

  var HATI = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

  function kartu(l) {
    var a = el('article', 'lagu');
    a.dataset.t = l.no + '. ' + l.judul;
    if (l.gambar) {
      var i = el('img', 'formal');
      i.src = l.gambar.src;
      i.alt = l.gambar.alt;
      a.appendChild(i);
    }
    a.appendChild(el('div', 'no', String(l.no)));
    var h = el('button', 'hati');
    h.type = 'button';
    h.innerHTML = HATI;
    h.setAttribute('aria-pressed', fav[l.no] ? 'true' : 'false');
    h.setAttribute('aria-label', 'Favorit: ' + l.judul);
    h.addEventListener('click', function () {
      if (fav[l.no]) delete fav[l.no]; else fav[l.no] = true;
      h.setAttribute('aria-pressed', fav[l.no] ? 'true' : 'false');
      simpan();
      segarkan();
    });
    a.appendChild(h);
    kartuAda.push({ no: l.no, el: a });
    a.appendChild(el('h2', null, l.judul));
    a.appendChild(el('p', 'art', l.artis));
    a.appendChild(el('p', null, l.kisah));
    if (l.catatan) a.appendChild(el('p', 'fav', l.catatan));
    var c = el('a', 'cari', 'Cari di Spotify');
    c.href = l.spotify;
    c.target = '_blank';
    c.rel = 'noopener';
    a.appendChild(c);
    return a;
  }

  // Pemutar di bawah mengikuti lagu yang sedang dibaca
  function amati() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) now.textContent = e.target.dataset.t;
      });
    }, { threshold: 0.55 });
    document.querySelectorAll('.lagu').forEach(function (a) { io.observe(a); });
  }

  var nav = el('nav', 'saring');
  nav.setAttribute('aria-label', 'Saring lagu');
  var bSemua = el('button', null, 'Semua lagu');
  var bFav = el('button', null, '');
  var kosong = el('p', 'kosong', 'Belum ada favorit. Ketuk hati di kartu lagu untuk menyimpannya di sini.');
  kosong.hidden = true;
  [bSemua, bFav].forEach(function (b) { b.type = 'button'; nav.appendChild(b); });

  bSemua.addEventListener('click', function () { setMode('semua'); });
  bFav.addEventListener('click', function () { setMode('fav'); });

  function setMode(m) {
    mode = m;
    segarkan();
    nav.scrollIntoView({ block: 'start' });
  }

  function segarkan() {
    kartuAda.forEach(function (k) { k.el.hidden = (mode === 'fav' && !fav[k.no]); });
    bSemua.setAttribute('aria-pressed', mode === 'semua' ? 'true' : 'false');
    bFav.setAttribute('aria-pressed', mode === 'fav' ? 'true' : 'false');
    bFav.textContent = '\u2665 Favorit saya (' + jumlah() + ')';
    kosong.hidden = !(mode === 'fav' && jumlah() === 0);
  }

  // Tombol "Kembali ke atas": muncul setelah menggulir cukup jauh
  var atas = el('button', 'atas');
  atas.type = 'button';
  atas.setAttribute('aria-label', 'Kembali ke atas');
  atas.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  atas.addEventListener('click', function () { window.scrollTo({ top: 0 }); });
  document.body.appendChild(atas);
  var menunggu = false;
  function cekGulir() {
    menunggu = false;
    atas.classList.toggle('tampil', (window.pageYOffset || document.documentElement.scrollTop) > 600);
  }
  window.addEventListener('scroll', function () {
    if (!menunggu) { menunggu = true; requestAnimationFrame(cekGulir); }
  }, { passive: true });
  cekGulir();

  var d = window.DATA_2OB;
  if (d && d.lagu) {
    d.lagu.forEach(function (l) { daftar.appendChild(kartu(l)); });
    daftar.parentNode.insertBefore(nav, daftar);
    daftar.parentNode.insertBefore(kosong, daftar);
    segarkan();
    amati();
  } else {
    daftar.appendChild(el('p', 'galat', 'Daftar lagu tidak ditemukan. Pastikan data.js ada di folder yang sama dengan index.html.'));
  }
})();
