(function () {
  var root = document.querySelector('[data-surf-game]');
  if (!root) return;

  var canvas = root.querySelector('[data-surf-canvas]');
  var ctx = canvas.getContext('2d');
  var scoreEl = root.querySelector('[data-surf-score]');
  var crewEl = root.querySelector('[data-surf-crew]');
  var swellEl = root.querySelector('[data-surf-swell]');
  var statusEl = root.querySelector('[data-surf-status]');
  var overlay = root.querySelector('[data-surf-overlay]');
  var startBtn = root.querySelector('[data-surf-start]');
  var playBtn = root.querySelector('[data-surf-play]');
  var resetBtn = root.querySelector('[data-surf-reset]');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 1280;
  var H = 640;
  var dpr = 1;
  var raf = 0;
  var last = 0;
  var keys = {};
  var pointer = { active: false, x: 0, y: 0 };
  var images = {};
  var gameInView = true;

  var player;
  var entities;
  var particles;
  var mode;
  var time;
  var spawnIn;
  var score;
  var crew;
  var streak;
  var multiplier;
  var multiplierTime;
  var speed;
  var statusTimer;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function lerp(a, b, n) {
    return a + (b - a) * n;
  }

  function imageFromMascot(opts) {
    if (!window.fleetMascot) return null;
    var img = new Image();
    img.decoding = 'async';
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(window.fleetMascot(opts));
    return img;
  }

  function buildImages() {
    images.player = imageFromMascot({ size: 180, wave: false, acc: 'goggles' });
    images.friendHeadset = imageFromMascot({ size: 110, wave: false, acc: 'headset', board: '#19c2c2', boardDark: '#0f8f8f' });
    images.friendFlag = imageFromMascot({ size: 110, wave: false, acc: 'flag', flag: '#ffd166', body: '#ffd166', belly: '#fff3cf', board: '#ff7a59', boardDark: '#e05a3a', beak: '#19c2c2', bodyDark: '#e3b43f' });
    images.friendJet = imageFromMascot({ size: 110, wave: false, acc: 'jetpack', body: '#ff7a59', belly: '#ffd9cc', board: '#19c2c2', boardDark: '#0f8f8f', beak: '#ffd166', bodyDark: '#e05a3a' });
  }

  function resetGame() {
    player = {
      x: W * 0.28,
      targetX: W * 0.28,
      y: H * 0.54,
      trim: -16,
      targetTrim: -16,
      radius: 38,
      inv: 0,
      shield: 0,
      boost: 0
    };
    entities = [];
    particles = [];
    mode = 'ready';
    time = 0;
    spawnIn = 0.6;
    score = 0;
    crew = 3;
    streak = 0;
    multiplier = 1;
    multiplierTime = 0;
    speed = reduceMotion ? 150 : 190;
    statusTimer = 0;
    root.classList.remove('is-running', 'is-paused', 'is-over');
    overlay.hidden = false;
    setStatus('Ready');
    updateHud();
    draw();
  }

  function setStatus(text) {
    statusEl.textContent = text;
    statusTimer = 1.4;
  }

  function updateHud() {
    scoreEl.textContent = Math.floor(score).toString();
    crewEl.textContent = crew.toString();
    swellEl.textContent = multiplier + 'x';
    startBtn.textContent = mode === 'running' ? 'Pause' : mode === 'paused' ? 'Resume' : 'Start';
    playBtn.textContent = mode === 'over' ? 'Ride again' : 'Surf';
  }

  function canAnimate() {
    return mode === 'running' && gameInView && !document.hidden;
  }

  function stopLoop() {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  }

  function clearInput() {
    keys = {};
    pointer.active = false;
  }

  function requestLoop() {
    if (!canAnimate() || raf) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(320, Math.round(rect.width));
    H = Math.max(220, Math.round(rect.height));
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (player) {
      player.x = clamp(player.x, W * 0.12, W * 0.74);
      player.targetX = clamp(player.targetX, W * 0.12, W * 0.74);
    }
    draw();
  }

  function waveY(x, t, layer) {
    layer = layer || 0;
    var base = H * (0.64 + layer * 0.035);
    var wide = Math.sin((x * 0.0066) + t * 1.05 + layer * 0.9) * H * (0.052 + layer * 0.006);
    var mid = Math.sin((x * 0.012) - t * 0.72 + layer * 1.6) * H * 0.022;
    return base + wide + mid;
  }

  function waveSlope(x, t) {
    return (waveY(x + 10, t, 0) - waveY(x - 10, t, 0)) / 20;
  }

  function startGame() {
    if (mode === 'over') resetGame();
    if (mode === 'running') {
      mode = 'paused';
      root.classList.add('is-paused');
      root.classList.remove('is-running');
      stopLoop();
      clearInput();
      setStatus('Paused');
      updateHud();
      return;
    }
    if (mode === 'paused') {
      mode = 'running';
      root.classList.add('is-running');
      root.classList.remove('is-paused');
      setStatus('Surfing');
      updateHud();
      requestLoop();
      return;
    }
    mode = 'running';
    root.classList.add('is-running');
    root.classList.remove('is-paused', 'is-over');
    overlay.hidden = true;
    canvas.focus({ preventScroll: true });
    setStatus('Surfing');
    updateHud();
    requestLoop();
  }

  function spawnEntity() {
    var r = Math.random();
    var type = 'token';
    if (r > 0.76) type = 'shark';
    else if (r > 0.62) type = 'friend';
    else if (r > 0.48) type = 'buoy';

    var friendKinds = ['friendHeadset', 'friendFlag', 'friendJet'];
    var e = {
      type: type,
      x: W + 90,
      y: H * 0.5,
      radius: type === 'shark' ? 38 : type === 'friend' ? 32 : 22,
      hit: false,
      drift: 0.92 + Math.random() * 0.22,
      bob: Math.random() * Math.PI * 2,
      friend: friendKinds[Math.floor(Math.random() * friendKinds.length)]
    };
    if (type === 'shark') e.x += Math.random() * 120;
    entities.push(e);
  }

  function update(dt) {
    if (mode !== 'running') return;

    time += dt * (reduceMotion ? 0.72 : 1);
    if (statusTimer > 0) statusTimer -= dt;
    if (statusTimer <= 0 && statusEl.textContent !== 'Surfing') statusEl.textContent = 'Surfing';

    var inputX = 0;
    if (keys.ArrowLeft || keys.a || keys.A) inputX -= 1;
    if (keys.ArrowRight || keys.d || keys.D) inputX += 1;
    if (inputX) player.targetX += inputX * W * dt * 0.45;

    if (keys.ArrowUp || keys.w || keys.W || keys[' ']) player.targetTrim = -76;
    else if (keys.ArrowDown || keys.s || keys.S) player.targetTrim = 32;
    else player.targetTrim = -22;

    if (pointer.active) {
      player.targetX = pointer.x;
      player.targetTrim = clamp(pointer.y - waveY(pointer.x, time, 0) - 6, -86, 44);
    }

    player.targetX = clamp(player.targetX, W * 0.12, W * 0.76);
    player.x = lerp(player.x, player.targetX, 1 - Math.pow(0.001, dt));
    player.trim = lerp(player.trim, player.targetTrim, 1 - Math.pow(0.01, dt));
    player.y = waveY(player.x, time, 0) + player.trim;
    player.inv = Math.max(0, player.inv - dt);
    player.shield = Math.max(0, player.shield - dt);
    player.boost = Math.max(0, player.boost - dt);

    multiplierTime = Math.max(0, multiplierTime - dt);
    if (multiplierTime <= 0) multiplier = 1;
    speed = lerp(speed, (reduceMotion ? 150 : 190) + Math.min(90, score * 0.006) + (player.boost > 0 ? 80 : 0), 0.025);
    score += dt * (8 + speed * 0.035) * multiplier;

    spawnIn -= dt;
    if (spawnIn <= 0) {
      spawnEntity();
      spawnIn = (reduceMotion ? 1.55 : 1.12) + Math.random() * 0.7 - Math.min(0.28, score / 2600);
    }

    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x -= speed * dt * e.drift;
      var water = waveY(e.x, time, 0);
      if (e.type === 'shark') e.y = water - 14 + Math.sin(time * 5 + e.bob) * 5;
      else if (e.type === 'friend') e.y = water - 98 + Math.sin(time * 3 + e.bob) * 12;
      else if (e.type === 'buoy') e.y = water - 48 + Math.sin(time * 4 + e.bob) * 8;
      else e.y = water - 92 + Math.sin(time * 5 + e.bob) * 10;

      var dx = e.x - player.x;
      var dy = e.y - player.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (!e.hit && dist < e.radius + player.radius) handleCollision(e, i);
      if (e.x < -120) entities.splice(i, 1);
    }

    for (var p = particles.length - 1; p >= 0; p--) {
      particles[p].life -= dt;
      particles[p].x += particles[p].vx * dt;
      particles[p].y += particles[p].vy * dt;
      particles[p].vy += 60 * dt;
      if (particles[p].life <= 0) particles.splice(p, 1);
    }

    updateHud();
  }

  function handleCollision(e, index) {
    e.hit = true;
    if (e.type === 'shark') {
      if (player.shield > 0 || player.inv > 0) {
        player.shield = 0;
        score += 140 * multiplier;
        streak += 1;
        burst(e.x, e.y, '#ffd166', 12);
        setStatus('Shark bounced');
      } else {
        crew -= 1;
        streak = 0;
        player.inv = 1.5;
        burst(player.x, player.y, '#ff7a59', 16);
        setStatus(crew > 0 ? 'Shark clipped the route' : 'Run ended');
        if (crew <= 0) gameOver();
      }
    } else if (e.type === 'friend') {
      multiplier = 2;
      multiplierTime = 8;
      player.shield = 7;
      score += 90;
      burst(e.x, e.y, '#19c2c2', 12);
      setStatus('Crew assist');
    } else if (e.type === 'buoy') {
      player.boost = 3.2;
      score += 60 * multiplier;
      burst(e.x, e.y, '#bdfcfc', 10);
      setStatus('Clean line');
    } else {
      streak += 1;
      if (streak % 5 === 0) {
        multiplier = Math.min(4, multiplier + 1);
        multiplierTime = 5;
      }
      score += 30 * multiplier;
      burst(e.x, e.y, '#ffd166', 8);
    }
    entities.splice(index, 1);
  }

  function gameOver() {
    mode = 'over';
    root.classList.remove('is-running', 'is-paused');
    root.classList.add('is-over');
    stopLoop();
    clearInput();
    overlay.hidden = false;
    setStatus('Run ended');
    updateHud();
  }

  function burst(x, y, color, count) {
    for (var i = 0; i < count; i++) {
      var a = Math.random() * Math.PI * 2;
      var s = 45 + Math.random() * 120;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        color: color,
        life: 0.5 + Math.random() * 0.45
      });
    }
  }

  function drawWave(baseLayer, fill, foam, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(0, H + 40);
    for (var x = 0; x <= W + 24; x += 24) ctx.lineTo(x, waveY(x, time, baseLayer));
    ctx.lineTo(W, H + 40);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (foam) {
      ctx.globalAlpha = alpha * 0.72;
      ctx.beginPath();
      for (var fx = 0; fx <= W + 24; fx += 24) {
        var y = waveY(fx, time, baseLayer);
        if (fx === 0) ctx.moveTo(fx, y);
        else ctx.lineTo(fx, y);
      }
      ctx.strokeStyle = foam;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawEntity(e) {
    if (e.type === 'shark') {
      drawShark(e);
    } else if (e.type === 'friend') {
      drawMascot(images[e.friend], e.x, e.y, 78, 0);
    } else if (e.type === 'buoy') {
      drawBuoy(e);
    } else {
      drawToken(e);
    }
  }

  function drawMascot(img, x, y, size, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    if (img && img.complete && img.naturalWidth) {
      ctx.drawImage(img, -size * 0.5, -size * 0.72, size, size);
    } else {
      ctx.fillStyle = '#19c2c2';
      ctx.beginPath();
      ctx.arc(0, -22, size * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.ellipse(0, 16, size * 0.42, size * 0.08, -0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawPlayer() {
    var slope = waveSlope(player.x, time);
    var rot = clamp(slope * 1.2, -0.28, 0.28);
    if (player.inv > 0 && Math.floor(time * 18) % 2 === 0) return;
    if (player.shield > 0) {
      ctx.save();
      ctx.globalAlpha = 0.55 + Math.sin(time * 9) * 0.16;
      ctx.strokeStyle = '#bdfcfc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(player.x, player.y - 30, 56, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    drawMascot(images.player, player.x, player.y, Math.min(152, W * 0.32), rot);
  }

  function drawShark(e) {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.fillStyle = '#0a1628';
    ctx.strokeStyle = 'rgba(189,252,252,.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-34, 18);
    ctx.quadraticCurveTo(-4, -28, 34, 12);
    ctx.quadraticCurveTo(6, 2, -34, 18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ff7a59';
    ctx.beginPath();
    ctx.arc(14, -3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBuoy(e) {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.fillStyle = '#ff7a59';
    ctx.strokeStyle = '#ffd9cc';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#bdfcfc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-15, -12);
    ctx.lineTo(15, 12);
    ctx.moveTo(15, -12);
    ctx.lineTo(-15, 12);
    ctx.stroke();
    ctx.restore();
  }

  function drawToken(e) {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(time * 2.2);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(255,209,102,.55)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, -17);
    ctx.lineTo(17, 0);
    ctx.lineTo(0, 17);
    ctx.lineTo(-17, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function drawParticles() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.save();
      ctx.globalAlpha = clamp(p.life * 1.8, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawBackground() {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#08101c');
    g.addColorStop(0.48, '#0a3a4a');
    g.addColorStop(1, '#0f8f8f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#bdfcfc';
    ctx.lineWidth = 1;
    for (var x = 0; x < W; x += 92) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (var y = 0; y < H; y += 92) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function draw() {
    if (!ctx) return;
    drawBackground();
    drawWave(2, '#082c3a', null, 0.74);
    drawWave(1, '#0b5566', null, 0.88);
    drawWave(0, '#19c2c2', '#bdfcfc', 0.94);
    for (var i = 0; i < entities.length; i++) drawEntity(entities[i]);
    drawPlayer();
    drawParticles();
  }

  function loop(now) {
    raf = 0;
    if (!canAnimate()) return;
    var dt = Math.min(0.034, (now - last) / 1000 || 0.016);
    last = now;
    update(dt);
    draw();
    raf = requestAnimationFrame(loop);
  }

  function canvasPoint(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: clamp(evt.clientX - rect.left, 0, W),
      y: clamp(evt.clientY - rect.top, 0, H)
    };
  }

  function hasGameFocus() {
    return root.contains(document.activeElement);
  }

  window.addEventListener('keydown', function (evt) {
    var controlKey = evt.key === ' ' || evt.key === 'Enter' || evt.key.indexOf('Arrow') === 0 ||
      evt.key === 'a' || evt.key === 'A' || evt.key === 'd' || evt.key === 'D' ||
      evt.key === 'w' || evt.key === 'W' || evt.key === 's' || evt.key === 'S';
    var nativeControl = evt.target && evt.target.closest &&
      evt.target.closest('button,a,input,textarea,select');
    if (nativeControl) return;
    var startKey = evt.key === ' ' || evt.key === 'Enter';
    if (!controlKey || !hasGameFocus() || !gameInView || (mode !== 'running' && !startKey)) return;
    if (evt.key === ' ' || evt.key.indexOf('Arrow') === 0) evt.preventDefault();
    keys[evt.key] = true;
    if (startKey && mode !== 'running') startGame();
  }, { passive: false });
  window.addEventListener('keyup', function (evt) {
    keys[evt.key] = false;
  });

  canvas.addEventListener('pointerdown', function (evt) {
    canvas.setPointerCapture(evt.pointerId);
    pointer.active = true;
    var pt = canvasPoint(evt);
    pointer.x = pt.x;
    pointer.y = pt.y;
    if (mode === 'ready' || mode === 'over') startGame();
  });
  canvas.addEventListener('pointermove', function (evt) {
    if (!pointer.active) return;
    var pt = canvasPoint(evt);
    pointer.x = pt.x;
    pointer.y = pt.y;
  });
  canvas.addEventListener('pointerup', function () {
    pointer.active = false;
  });
  canvas.addEventListener('pointercancel', function () {
    pointer.active = false;
  });

  startBtn.addEventListener('click', startGame);
  playBtn.addEventListener('click', startGame);
  resetBtn.addEventListener('click', function () {
    stopLoop();
    clearInput();
    resetGame();
  });
  window.addEventListener('resize', resize);
  window.addEventListener('blur', clearInput);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopLoop();
      clearInput();
    }
    else requestLoop();
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      gameInView = entries[0] ? entries[0].isIntersecting : true;
      if (gameInView) requestLoop();
      else {
        stopLoop();
        clearInput();
      }
    }, { threshold: 0.08 });
    io.observe(root);
  }

  buildImages();
  resetGame();
  resize();
})();
