(() => {
  "use strict";

  const SAVE_KEY = "castor-woods-the-beast-save-v1";
  const WORLD = { width: 7200, height: 4400 };
  const TAU = Math.PI * 2;

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const miniMap = document.getElementById("miniMap");
  const miniCtx = miniMap.getContext("2d");
  const bigMap = document.getElementById("bigMapCanvas");
  const bigCtx = bigMap.getContext("2d");

  const ui = {
    mainMenu: document.getElementById("mainMenu"),
    newGameBtn: document.getElementById("newGameBtn"),
    continueBtn: document.getElementById("continueBtn"),
    optionsBtn: document.getElementById("optionsBtn"),
    optionsPanel: document.getElementById("optionsPanel"),
    pausePanel: document.getElementById("pausePanel"),
    inventoryPanel: document.getElementById("inventoryPanel"),
    resumeBtn: document.getElementById("resumeBtn"),
    saveBtn: document.getElementById("saveBtn"),
    backToMenuBtn: document.getElementById("backToMenuBtn"),
    hud: document.getElementById("hud"),
    subtitle: document.getElementById("subtitle"),
    toast: document.getElementById("toast"),
    healthBar: document.getElementById("healthBar"),
    beastBar: document.getElementById("beastBar"),
    uvBar: document.getElementById("uvBar"),
    healthText: document.getElementById("healthText"),
    beastText: document.getElementById("beastText"),
    uvText: document.getElementById("uvText"),
    clockChip: document.getElementById("clockChip"),
    zoneChip: document.getElementById("zoneChip"),
    levelChip: document.getElementById("levelChip"),
    joystick: document.getElementById("joystick"),
    stick: document.getElementById("stick"),
    actionButtons: document.getElementById("actionButtons"),
    quickSlots: document.getElementById("quickSlots"),
    inventoryView: document.getElementById("inventoryView"),
    craftingView: document.getElementById("craftingView"),
    skillsView: document.getElementById("skillsView"),
    music: document.getElementById("music"),
    musicToggle: document.getElementById("musicToggle"),
    voiceToggle: document.getElementById("voiceToggle"),
    rainToggle: document.getElementById("rainToggle"),
    rainLayer: document.getElementById("rainLayer"),
    damageFlash: document.getElementById("damageFlash")
  };

  const options = {
    music: true,
    voice: true,
    rain: true
  };

  const input = {
    keys: new Set(),
    move: { x: 0, y: 0 },
    joystickId: null,
    joystickCenter: { x: 0, y: 0 },
    pointerAim: null
  };

  const camera = { x: 0, y: 0, shake: 0 };
  const assets = {
    world: loadImage("assets/world-reference.avif"),
    treasure: loadImage("assets/treasure-map.avif"),
    dark: loadImage("assets/dark-zone-map.avif"),
    convoy: loadImage("assets/convoy-map.avif")
  };

  const MATERIAL_NAMES = {
    scrap: "Zlom",
    wire: "Przewody",
    gauze: "Gaza",
    alcohol: "Alkohol",
    battery: "Bateria",
    chemicals: "Chemikalia",
    infectedTissue: "Tkanka zarazonego",
    medkit: "Apteczka",
    uvBattery: "Bateria UV",
    repairKit: "Zestaw naprawczy"
  };

  const RECIPES = [
    {
      id: "medkit",
      name: "Apteczka",
      desc: "Przywraca 45 punktow zycia.",
      cost: { gauze: 2, alcohol: 1 },
      craft(state) {
        addItem(state.player.inventory, "medkit", 1);
      }
    },
    {
      id: "repairKit",
      name: "Zestaw naprawczy",
      desc: "Pozwala naprawic aktualna bron.",
      cost: { scrap: 3, wire: 1 },
      craft(state) {
        addItem(state.player.inventory, "repairKit", 1);
      }
    },
    {
      id: "uvBattery",
      name: "Bateria UV",
      desc: "Natychmiast laduje latarke UV.",
      cost: { battery: 1, chemicals: 1 },
      craft(state) {
        addItem(state.player.inventory, "uvBattery", 1);
      }
    },
    {
      id: "spikedPipe",
      name: "Kolczasta rura",
      desc: "Mocniejsza bron zrobiona ze zlomu i chemikaliow.",
      cost: { scrap: 5, chemicals: 2, wire: 2 },
      craft(state) {
        state.player.weapons.push({
          id: `weapon-${Date.now()}`,
          name: "Kolczasta rura",
          damage: 36,
          durability: 120,
          maxDurability: 120
        });
      }
    }
  ];

  const SKILLS = [
    {
      id: "heavySwing",
      branch: "Walka",
      name: "Ciezkie uderzenie",
      desc: "+25% obrazen bronia biala.",
      cost: 1,
      minLevel: 2
    },
    {
      id: "quietSearch",
      branch: "Przetrwanie",
      name: "Ciche przeszukanie",
      desc: "Zombie daja wiecej materialow po przeszukaniu.",
      cost: 1,
      minLevel: 2
    },
    {
      id: "parkourStep",
      branch: "Ruch",
      name: "Parkour",
      desc: "Szybszy ruch i dluzszy skok.",
      cost: 1,
      minLevel: 3
    },
    {
      id: "uvMastery",
      branch: "UV",
      name: "Technik UV",
      desc: "Latarka UV zuzywa mniej energii.",
      cost: 1,
      minLevel: 3
    },
    {
      id: "beastBlood",
      branch: "Bestia",
      name: "Krew bestii",
      desc: "Tryb bestii trwa dluzej i leczy przy zabiciu.",
      cost: 2,
      minLevel: 4
    },
    {
      id: "nightHunter",
      branch: "Noc",
      name: "Lowca nocy",
      desc: "Wiekszy XP za nocne zombie.",
      cost: 2,
      minLevel: 5
    }
  ];

  const ZONES = [
    { id: "city", name: "Miasto", x: 420, y: 620, w: 3740, h: 2960, color: "#64736b" },
    { id: "forest", name: "Las", x: 4300, y: 320, w: 2500, h: 3480, color: "#2f6b43" },
    { id: "dark", name: "Dark zone", x: 2200, y: 410, w: 1120, h: 720, color: "#4b3a6d" },
    { id: "dark2", name: "Dark zone", x: 4960, y: 2440, w: 900, h: 780, color: "#4b3a6d" },
    { id: "convoy", name: "Konwoj", x: 3420, y: 2600, w: 1220, h: 560, color: "#8a6b2d" },
    { id: "treasure", name: "Stara mapa", x: 5750, y: 760, w: 780, h: 560, color: "#806c31" },
    { id: "safe", name: "Safe zone", x: 780, y: 1990, w: 620, h: 500, color: "#5eaed1" }
  ];

  let state = null;
  let lastTime = performance.now();
  let toastTimer = 0;
  let subtitleTimer = 0;
  let renderHudTimer = 0;

  function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  function angleTo(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function seededRandom(seed) {
    let t = seed >>> 0;
    return () => {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash2(x, y) {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  }

  function createWorld() {
    const rand = seededRandom(312991);
    const roads = [
      { x: 0, y: 2100, w: WORLD.width, h: 170, type: "highway" },
      { x: 2320, y: 0, w: 150, h: WORLD.height, type: "avenue" },
      { x: 4050, y: 0, w: 120, h: WORLD.height, type: "forest-road" },
      { x: 700, y: 900, w: 3550, h: 120, type: "street" },
      { x: 1180, y: 3080, w: 4550, h: 130, type: "street" },
      { x: 5200, y: 620, w: 105, h: 2400, type: "trail" },
      { x: 540, y: 1380, w: 3000, h: 90, type: "street" }
    ];

    const buildings = [];
    for (let i = 0; i < 56; i += 1) {
      const w = 120 + rand() * 260;
      const h = 100 + rand() * 220;
      const x = 520 + rand() * 3300;
      const y = 640 + rand() * 2760;
      const rect = { x, y, w, h, kind: rand() > 0.7 ? "shop" : "block", seed: rand() * 9999 };
      if (!roads.some((road) => rectOverlap(inflate(rect, 32), road)) && !rectOverlap(rect, zoneById("safe"))) {
        buildings.push(rect);
      }
    }

    const trees = [];
    for (let i = 0; i < 180; i += 1) {
      const inForest = rand() > 0.22;
      trees.push({
        x: inForest ? 4300 + rand() * 2550 : 500 + rand() * 6400,
        y: inForest ? 360 + rand() * 3420 : 320 + rand() * 3700,
        r: 22 + rand() * 28,
        sway: rand() * TAU,
        color: rand() > 0.5 ? "#235b34" : "#2f7445"
      });
    }

    const grass = [];
    for (let i = 0; i < 1150; i += 1) {
      const forestBias = rand() > 0.36;
      grass.push({
        x: forestBias ? 4000 + rand() * 3000 : rand() * WORLD.width,
        y: forestBias ? 240 + rand() * 3880 : rand() * WORLD.height,
        h: 8 + rand() * 20,
        sway: rand() * TAU
      });
    }

    const debris = [];
    for (let i = 0; i < 220; i += 1) {
      debris.push({
        x: rand() * WORLD.width,
        y: rand() * WORLD.height,
        r: 2 + rand() * 9,
        kind: rand() > 0.55 ? "paper" : "stone",
        rot: rand() * TAU
      });
    }

    const cars = [];
    for (let i = 0; i < 32; i += 1) {
      const road = roads[Math.floor(rand() * roads.length)];
      cars.push({
        id: `car-${i}`,
        x: road.x + 80 + rand() * Math.max(1, road.w - 160),
        y: road.y + 38 + rand() * Math.max(1, road.h - 76),
        w: 72,
        h: 38,
        rot: road.w > road.h ? (rand() > 0.5 ? 0 : Math.PI) : Math.PI / 2,
        color: ["#6f7b75", "#453c35", "#7d4b3c", "#2f504b"][Math.floor(rand() * 4)],
        looted: false
      });
    }
    for (let i = 0; i < 9; i += 1) {
      cars.push({
        id: `convoy-${i}`,
        x: 3600 + i * 110,
        y: 2850 + Math.sin(i) * 50,
        w: i % 3 === 0 ? 112 : 78,
        h: i % 3 === 0 ? 48 : 38,
        rot: 0.1 * Math.sin(i),
        color: i % 3 === 0 ? "#1e2b28" : "#7f6839",
        looted: false,
        convoy: true
      });
    }

    const lamps = [
      { x: 865, y: 2070, on: false },
      { x: 1260, y: 2070, on: false },
      { x: 865, y: 2390, on: false },
      { x: 1260, y: 2390, on: false }
    ];

    const crates = [
      { id: "treasure-a", x: 6020, y: 980, looted: false, label: "skrzynia mapy" },
      { id: "dark-cache-a", x: 2550, y: 760, looted: false, label: "skrytka dark zone" },
      { id: "dark-cache-b", x: 5320, y: 2780, looted: false, label: "skrytka dark zone" },
      { id: "convoy-cache", x: 3970, y: 2870, looted: false, label: "skrzynia konwoju" }
    ];

    return { roads, buildings, trees, grass, debris, cars, lamps, crates };
  }

  function createGameState() {
    const world = createWorld();
    const player = {
      x: 1040,
      y: 2250,
      r: 18,
      health: 100,
      maxHealth: 100,
      beast: 15,
      maxBeast: 100,
      beastActive: false,
      beastTimer: 0,
      uv: 100,
      maxUv: 100,
      xp: 0,
      level: 1,
      skillPoints: 0,
      skills: {},
      inventory: {
        scrap: 6,
        wire: 2,
        gauze: 2,
        alcohol: 1,
        battery: 1,
        chemicals: 1,
        infectedTissue: 0,
        medkit: 1,
        uvBattery: 1,
        repairKit: 0
      },
      weapons: [
        { id: "pipe", name: "Rura", damage: 24, durability: 100, maxDurability: 100 }
      ],
      activeWeapon: 0,
      facing: 0,
      attackCooldown: 0,
      lootCooldown: 0,
      hurtCooldown: 0,
      jumpTimer: 0,
      flashlight: true,
      uvLight: false
    };

    return {
      scene: "game",
      paused: false,
      gameOver: false,
      world,
      player,
      olive: { x: 965, y: 2210, r: 15, facing: 0, talkCooldown: 2 },
      zombies: createZombies(),
      particles: [],
      floatingText: [],
      time: 18.1,
      day: 1,
      weather: { rain: true, wind: 0.42 },
      safeZoneUnlocked: false,
      quest: "Odblokuj safe zone: zbierz materialy i uruchom latarnie UV.",
      startedAt: Date.now()
    };
  }

  function createZombies() {
    const rand = seededRandom(88031);
    const zombies = [];
    const spawnAreas = [
      { x: 520, y: 600, w: 3600, h: 3000, count: 45, type: "walker" },
      { x: 2200, y: 410, w: 1120, h: 720, count: 18, type: "dark" },
      { x: 4300, y: 360, w: 2400, h: 3400, count: 32, type: "forest" },
      { x: 3420, y: 2600, w: 1220, h: 560, count: 18, type: "convoy" }
    ];

    let id = 0;
    spawnAreas.forEach((area) => {
      for (let i = 0; i < area.count; i += 1) {
        const fast = area.type === "dark" || (area.type === "forest" && rand() > 0.72);
        zombies.push({
          id: `z-${id}`,
          x: area.x + rand() * area.w,
          y: area.y + rand() * area.h,
          homeX: area.x + rand() * area.w,
          homeY: area.y + rand() * area.h,
          r: fast ? 16 : 18,
          hp: fast ? 55 : 70,
          maxHp: fast ? 55 : 70,
          speed: fast ? 82 : 48,
          type: fast ? "volatile" : area.type,
          dead: false,
          looted: false,
          attackCooldown: rand(),
          stun: 0,
          wander: rand() * TAU,
          seed: rand() * 9999
        });
        id += 1;
      }
    });

    return zombies;
  }

  function inflate(rect, amount) {
    return {
      x: rect.x - amount,
      y: rect.y - amount,
      w: rect.w + amount * 2,
      h: rect.h + amount * 2
    };
  }

  function rectOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function circleRectOverlap(circle, rect) {
    const cx = clamp(circle.x, rect.x, rect.x + rect.w);
    const cy = clamp(circle.y, rect.y, rect.y + rect.h);
    return Math.hypot(circle.x - cx, circle.y - cy) < circle.r;
  }

  function zoneById(id) {
    return ZONES.find((zone) => zone.id === id);
  }

  function currentZoneName() {
    if (!state) return "Menu";
    const p = state.player;
    const zone = [...ZONES].reverse().find((z) => p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h);
    return zone ? zone.name : "Pustkowia";
  }

  function isNight() {
    if (!state) return false;
    return state.time >= 20 || state.time < 5.5;
  }

  function nightAmount() {
    if (!state) return 0;
    const t = state.time;
    if (t >= 21 || t < 4) return 1;
    if (t >= 19 && t < 21) return (t - 19) / 2;
    if (t >= 4 && t < 6) return 1 - (t - 4) / 2;
    return 0;
  }

  function isInDarkZone(point = state.player) {
    return ["dark", "dark2"].some((id) => {
      const z = zoneById(id);
      return point.x >= z.x && point.x <= z.x + z.w && point.y >= z.y && point.y <= z.y + z.h;
    });
  }

  function getWeapon() {
    return state.player.weapons[state.player.activeWeapon] || state.player.weapons[0];
  }

  function addItem(inv, id, amount) {
    inv[id] = (inv[id] || 0) + amount;
  }

  function consumeItems(inv, cost) {
    if (!canAfford(inv, cost)) return false;
    Object.entries(cost).forEach(([id, amount]) => {
      inv[id] -= amount;
    });
    return true;
  }

  function canAfford(inv, cost) {
    return Object.entries(cost).every(([id, amount]) => (inv[id] || 0) >= amount);
  }

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function saveGame(showMessage = true) {
    if (!state || state.scene !== "game") return;
    const payload = {
      player: {
        x: state.player.x,
        y: state.player.y,
        health: state.player.health,
        beast: state.player.beast,
        uv: state.player.uv,
        xp: state.player.xp,
        level: state.player.level,
        skillPoints: state.player.skillPoints,
        skills: state.player.skills,
        inventory: state.player.inventory,
        weapons: state.player.weapons,
        activeWeapon: state.player.activeWeapon,
        flashlight: state.player.flashlight,
        uvLight: state.player.uvLight
      },
      time: state.time,
      day: state.day,
      safeZoneUnlocked: state.safeZoneUnlocked,
      cars: state.world.cars.map((car) => ({ id: car.id, looted: car.looted })),
      crates: state.world.crates.map((crate) => ({ id: crate.id, looted: crate.looted })),
      zombies: state.zombies.map((zombie) => ({ id: zombie.id, dead: zombie.dead, looted: zombie.looted, hp: zombie.hp })),
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    updateContinueButton();
    if (showMessage) toast("Gra zapisana.");
  }

  function loadSavedGame() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    try {
      const payload = JSON.parse(raw);
      state = createGameState();
      Object.assign(state.player, payload.player || {});
      state.time = payload.time ?? state.time;
      state.day = payload.day ?? state.day;
      state.safeZoneUnlocked = Boolean(payload.safeZoneUnlocked);
      state.world.lamps.forEach((lamp) => {
        lamp.on = state.safeZoneUnlocked;
      });
      const carMap = new Map((payload.cars || []).map((car) => [car.id, car]));
      state.world.cars.forEach((car) => {
        car.looted = Boolean(carMap.get(car.id)?.looted);
      });
      const crateMap = new Map((payload.crates || []).map((crate) => [crate.id, crate]));
      state.world.crates.forEach((crate) => {
        crate.looted = Boolean(crateMap.get(crate.id)?.looted);
      });
      const zombieMap = new Map((payload.zombies || []).map((zombie) => [zombie.id, zombie]));
      state.zombies.forEach((zombie) => {
        const saved = zombieMap.get(zombie.id);
        if (saved) {
          zombie.dead = Boolean(saved.dead);
          zombie.looted = Boolean(saved.looted);
          zombie.hp = saved.hp ?? zombie.hp;
        }
      });
      enterGame();
      speak("Olive", "Wczytane. Nie zatrzymuj sie, noc tutaj pamieta kazdy blad.");
      return true;
    } catch (error) {
      console.error(error);
      toast("Zapis jest uszkodzony.");
      return false;
    }
  }

  function updateContinueButton() {
    ui.continueBtn.disabled = !localStorage.getItem(SAVE_KEY);
  }

  function newGame() {
    state = createGameState();
    enterGame();
    speak("Olive", "Kyle, slyszysz mnie? Safe zone jest ciemna. Znajdz przewody, baterie i uruchom latarnie UV.");
    toast("Cel: odblokuj safe zone i przetrwaj noc.");
  }

  function enterGame() {
    ui.mainMenu.classList.remove("screen--active");
    ui.hud.classList.remove("hidden");
    closePanels(false);
    state.scene = "game";
    state.paused = false;
    tryStartMusic();
    renderInventoryPanels();
  }

  function backToMenu() {
    if (state?.scene === "game") saveGame(false);
    state = null;
    ui.mainMenu.classList.add("screen--active");
    ui.hud.classList.add("hidden");
    closePanels(false);
    updateContinueButton();
  }

  function tryStartMusic() {
    ui.music.volume = options.music ? 0.38 : 0;
    if (!options.music) return;
    ui.music.play().catch(() => {
      toast("Dotknij ekranu, aby wlaczyc muzyke.");
    });
  }

  function speak(speaker, line) {
    const text = `${speaker}: ${line}`;
    ui.subtitle.textContent = text;
    ui.subtitle.classList.remove("hidden");
    subtitleTimer = 5.4;

    if (!options.voice || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(line);
    utterance.lang = "pl-PL";
    utterance.rate = speaker === "Kyle" ? 0.9 : 0.98;
    utterance.pitch = speaker === "Kyle" ? 0.82 : 1.04;
    const voices = window.speechSynthesis.getVoices();
    const polishVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("pl"));
    if (polishVoice) utterance.voice = polishVoice;
    window.speechSynthesis.speak(utterance);
  }

  function toast(message) {
    ui.toast.textContent = message;
    ui.toast.classList.remove("hidden");
    toastTimer = 2.5;
  }

  function setPaused(paused) {
    if (!state) return;
    state.paused = paused;
  }

  function closePanels(resume = true) {
    ui.optionsPanel.classList.add("hidden");
    ui.pausePanel.classList.add("hidden");
    ui.inventoryPanel.classList.add("hidden");
    if (resume && state?.scene === "game") setPaused(false);
  }

  function openInventory(tab = "inventory") {
    if (!state) return;
    closePanels(false);
    setPaused(true);
    ui.inventoryPanel.classList.remove("hidden");
    selectTab(tab);
    renderInventoryPanels();
    renderBigMap();
  }

  function selectTab(tab) {
    document.querySelectorAll(".tabBtn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });
    document.querySelectorAll(".tabView").forEach((view) => {
      view.classList.toggle("active", view.id === `${tab}View`);
    });
  }

  function openPausePanel() {
    if (!state) return;
    closePanels(false);
    setPaused(true);
    ui.pausePanel.classList.remove("hidden");
  }

  function doAction(action) {
    if (!state && action !== "pause") return;
    if (action === "attack") attack();
    if (action === "jump") jump();
    if (action === "loot") lootNearby();
    if (action === "flashlight") toggleFlashlight();
    if (action === "uv") toggleUv();
    if (action === "beast") toggleBeast();
    if (action === "inventory") openInventory("inventory");
    if (action === "medkit") useMedkit();
    if (action === "repair") repairWeapon();
    if (action === "pause") openPausePanel();
  }

  function attack() {
    if (!state || state.paused || state.player.attackCooldown > 0 || state.gameOver) return;
    const player = state.player;
    const weapon = getWeapon();
    if (!weapon || weapon.durability <= 0) {
      toast("Bron jest zepsuta. Napraw ja w ekwipunku.");
      return;
    }

    player.attackCooldown = player.beastActive ? 0.26 : 0.48;
    const powerSkill = player.skills.heavySwing ? 1.25 : 1;
    const beastPower = player.beastActive ? 2.45 : 1;
    const range = player.beastActive ? 120 : 82;
    let hit = false;

    state.zombies.forEach((zombie) => {
      if (zombie.dead) return;
      const d = distance(player, zombie);
      const facing = Math.abs(normalizeAngle(angleTo(player, zombie) - player.facing));
      if (d <= range && facing < Math.PI * 0.78) {
        const damage = weapon.damage * powerSkill * beastPower;
        zombie.hp -= damage;
        zombie.stun = 0.2;
        hit = true;
        addFloatingText(zombie.x, zombie.y - 22, `-${Math.round(damage)}`, "#ffcc6a");
        spawnParticles(zombie.x, zombie.y, "#5e1612", 8);
        if (zombie.hp <= 0) killZombie(zombie);
      }
    });

    weapon.durability = clamp(weapon.durability - (player.beastActive ? 1.2 : 4), 0, weapon.maxDurability);
    camera.shake = hit ? 7 : 2;
    if (hit) {
      player.beast = clamp(player.beast + 6, 0, player.maxBeast);
    }
  }

  function killZombie(zombie) {
    zombie.dead = true;
    zombie.hp = 0;
    const nightBonus = isNight() || zombie.type === "volatile";
    addXp(nightBonus && state.player.skills.nightHunter ? 34 : nightBonus ? 24 : 16);
    state.player.beast = clamp(state.player.beast + (zombie.type === "volatile" ? 12 : 8), 0, state.player.maxBeast);
    if (state.player.beastActive && state.player.skills.beastBlood) {
      state.player.health = clamp(state.player.health + 5, 0, state.player.maxHealth);
    }
    addFloatingText(zombie.x, zombie.y - 34, "przeszukaj", "#b6f65c");
  }

  function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= TAU;
    while (angle < -Math.PI) angle += TAU;
    return angle;
  }

  function jump() {
    if (!state || state.paused || state.player.jumpTimer > 0 || state.gameOver) return;
    state.player.jumpTimer = state.player.skills.parkourStep ? 0.44 : 0.34;
    camera.shake = 1.5;
  }

  function toggleFlashlight() {
    if (!state) return;
    state.player.flashlight = !state.player.flashlight;
    toast(state.player.flashlight ? "Latarka wlaczona." : "Latarka wylaczona.");
  }

  function toggleUv() {
    if (!state) return;
    const player = state.player;
    if (!player.uvLight && player.uv <= 2) {
      if ((player.inventory.uvBattery || 0) > 0) {
        player.inventory.uvBattery -= 1;
        player.uv = player.maxUv;
        toast("Wymieniono baterie UV.");
      } else {
        toast("Brak energii UV.");
        return;
      }
    }
    player.uvLight = !player.uvLight;
    toast(player.uvLight ? "UV wlaczone." : "UV wylaczone.");
  }

  function toggleBeast() {
    if (!state || state.paused || state.gameOver) return;
    const player = state.player;
    if (player.beastActive) {
      player.beastActive = false;
      player.beastTimer = 0;
      toast("Bestia ucichla.");
      return;
    }
    if (player.beast < 35) {
      toast("Pasek bestii jest za niski.");
      return;
    }
    player.beastActive = true;
    player.beastTimer = player.skills.beastBlood ? 10 : 7;
    speak("Kyle", "Teraz ja jestem potworem.");
    camera.shake = 12;
  }

  function lootNearby() {
    if (!state || state.paused || state.player.lootCooldown > 0 || state.gameOver) return;
    const p = state.player;
    p.lootCooldown = 0.35;

    const safeZone = zoneById("safe");
    const nearSafePanel = p.x > safeZone.x + 210 && p.x < safeZone.x + 450 && p.y > safeZone.y + 160 && p.y < safeZone.y + 340;
    if (!state.safeZoneUnlocked && nearSafePanel) {
      const cost = { scrap: 8, wire: 4, battery: 2 };
      if (consumeItems(p.inventory, cost)) {
        state.safeZoneUnlocked = true;
        state.world.lamps.forEach((lamp) => {
          lamp.on = true;
        });
        addXp(70);
        speak("Olive", "Latarnie UV dzialaja. To miejsce jest teraz nasze.");
        toast("Safe zone odblokowana.");
        return;
      }
      toast("Safe zone wymaga: 8 zlomu, 4 przewody, 2 baterie.");
      return;
    }

    const dead = state.zombies.find((zombie) => zombie.dead && !zombie.looted && distance(p, zombie) < 68);
    if (dead) {
      dead.looted = true;
      const bonus = p.skills.quietSearch ? 1 : 0;
      const found = {
        scrap: 1 + Math.floor(Math.random() * (2 + bonus)),
        infectedTissue: 1,
        gauze: Math.random() > 0.55 ? 1 : 0,
        chemicals: Math.random() > 0.7 ? 1 : 0
      };
      collectLoot(found, "Przeszukano zombie");
      return;
    }

    const car = state.world.cars.find((vehicle) => !vehicle.looted && distance(p, vehicle) < 72);
    if (car) {
      car.looted = true;
      collectLoot({
        scrap: 2 + Math.floor(Math.random() * 3),
        wire: Math.random() > 0.35 ? 1 : 0,
        battery: Math.random() > 0.58 ? 1 : 0,
        alcohol: Math.random() > 0.82 ? 1 : 0
      }, car.convoy ? "Konwoj przeszukany" : "Auto przeszukane");
      return;
    }

    const crate = state.world.crates.find((box) => !box.looted && distance(p, box) < 76);
    if (crate) {
      crate.looted = true;
      collectLoot({
        scrap: 4,
        wire: 2,
        chemicals: 2,
        battery: 1,
        repairKit: 1
      }, `Otwarta ${crate.label}`);
      addXp(45);
      return;
    }

    toast("Nic do przeszukania w zasiegu.");
  }

  function collectLoot(loot, label) {
    const lines = [];
    Object.entries(loot).forEach(([id, amount]) => {
      if (amount > 0) {
        addItem(state.player.inventory, id, amount);
        lines.push(`${MATERIAL_NAMES[id] || id} x${amount}`);
      }
    });
    addXp(8);
    toast(`${label}: ${lines.join(", ")}`);
    renderInventoryPanels();
  }

  function useMedkit() {
    if (!state) return;
    const player = state.player;
    if ((player.inventory.medkit || 0) <= 0) {
      toast("Brak apteczek.");
      return;
    }
    if (player.health >= player.maxHealth) {
      toast("Zycie jest pelne.");
      return;
    }
    player.inventory.medkit -= 1;
    player.health = clamp(player.health + 45, 0, player.maxHealth);
    toast("Uzyto apteczki.");
    renderInventoryPanels();
  }

  function repairWeapon() {
    if (!state) return;
    const player = state.player;
    const weapon = getWeapon();
    if (!weapon) return;
    if (weapon.durability >= weapon.maxDurability) {
      toast("Bron nie wymaga naprawy.");
      return;
    }
    if ((player.inventory.repairKit || 0) > 0) {
      player.inventory.repairKit -= 1;
      weapon.durability = weapon.maxDurability;
      toast(`${weapon.name} naprawiona.`);
      renderInventoryPanels();
      return;
    }
    const cost = { scrap: 2, wire: 1 };
    if (consumeItems(player.inventory, cost)) {
      weapon.durability = clamp(weapon.durability + 45, 0, weapon.maxDurability);
      toast(`${weapon.name}: szybka naprawa.`);
      renderInventoryPanels();
      return;
    }
    toast("Brak materialow: 2 zlomu, 1 przewod.");
  }

  function addXp(amount) {
    const player = state.player;
    player.xp += amount;
    let needed = xpForLevel(player.level);
    while (player.xp >= needed) {
      player.xp -= needed;
      player.level += 1;
      player.skillPoints += 1;
      player.maxHealth += 8;
      player.health = player.maxHealth;
      needed = xpForLevel(player.level);
      speak("Olive", `Masz poziom ${player.level}. Wydaj punkt w drzewku umiejetnosci.`);
    }
  }

  function xpForLevel(level) {
    return 80 + level * 42;
  }

  function craftRecipe(id) {
    if (!state) return;
    const recipe = RECIPES.find((entry) => entry.id === id);
    if (!recipe) return;
    if (!consumeItems(state.player.inventory, recipe.cost)) {
      toast("Brakuje materialow.");
      return;
    }
    recipe.craft(state);
    toast(`Wytworzono: ${recipe.name}`);
    renderInventoryPanels();
  }

  function learnSkill(id) {
    if (!state) return;
    const player = state.player;
    const skill = SKILLS.find((entry) => entry.id === id);
    if (!skill || player.skills[id]) return;
    if (player.level < skill.minLevel) {
      toast(`Wymagany poziom ${skill.minLevel}.`);
      return;
    }
    if (player.skillPoints < skill.cost) {
      toast("Brak punktow umiejetnosci.");
      return;
    }
    player.skillPoints -= skill.cost;
    player.skills[id] = true;
    toast(`Odblokowano: ${skill.name}`);
    renderInventoryPanels();
  }

  function update(dt) {
    if (!state || state.paused || state.scene !== "game") return;
    if (state.gameOver) {
      updateTimers(dt);
      return;
    }
    updateTimers(dt);
    updateTime(dt);
    updatePlayer(dt);
    updateOlive(dt);
    updateZombies(dt);
    updateParticles(dt);
    updateCamera(dt);
    updateHud(dt);
    maybeOliveTalk(dt);
    autosaveTick(dt);
  }

  function updateTimers(dt) {
    toastTimer -= dt;
    subtitleTimer -= dt;
    if (toastTimer <= 0) ui.toast.classList.add("hidden");
    if (subtitleTimer <= 0) ui.subtitle.classList.add("hidden");
  }

  function updateTime(dt) {
    state.time += dt * 0.036;
    if (state.time >= 24) {
      state.time -= 24;
      state.day += 1;
    }
    state.weather.wind = 0.36 + Math.sin(performance.now() * 0.00025) * 0.24;
    state.weather.rain = options.rain && (isNight() || Math.sin(state.day * 1.7 + state.time * 0.8) > 0.62);
    ui.rainLayer.classList.toggle("active", state.weather.rain);
  }

  function updatePlayer(dt) {
    const player = state.player;
    player.attackCooldown = Math.max(0, player.attackCooldown - dt);
    player.lootCooldown = Math.max(0, player.lootCooldown - dt);
    player.hurtCooldown = Math.max(0, player.hurtCooldown - dt);
    player.jumpTimer = Math.max(0, player.jumpTimer - dt);

    const move = getMoveVector();
    const moving = Math.hypot(move.x, move.y) > 0.05;
    if (moving) player.facing = Math.atan2(move.y, move.x);

    const base = player.skills.parkourStep ? 178 : 154;
    const jumpBoost = player.jumpTimer > 0 ? 1.62 : 1;
    const beastBoost = player.beastActive ? 1.28 : 1;
    const darkPenalty = isInDarkZone(player) && !player.flashlight ? 0.88 : 1;
    const speed = base * jumpBoost * beastBoost * darkPenalty;

    movePlayer(move.x * speed * dt, move.y * speed * dt);

    if (player.beastActive) {
      player.beastTimer -= dt;
      player.beast = clamp(player.beast - dt * (player.skills.beastBlood ? 7.4 : 10.5), 0, player.maxBeast);
      if (player.beastTimer <= 0 || player.beast <= 0) {
        player.beastActive = false;
        player.beastTimer = 0;
      }
    } else {
      player.beast = clamp(player.beast + dt * (isNight() ? 1.15 : 0.45), 0, player.maxBeast);
    }

    if (player.uvLight) {
      const drain = player.skills.uvMastery ? 11 : 17;
      player.uv = clamp(player.uv - dt * drain, 0, player.maxUv);
      if (player.uv <= 0) {
        player.uvLight = false;
        toast("UV rozladowane.");
      }
    } else {
      player.uv = clamp(player.uv + dt * 4.5, 0, player.maxUv);
    }

    const safe = zoneById("safe");
    if (state.safeZoneUnlocked && player.x > safe.x && player.x < safe.x + safe.w && player.y > safe.y && player.y < safe.y + safe.h) {
      player.health = clamp(player.health + dt * 4, 0, player.maxHealth);
    }
  }

  function getMoveVector() {
    let x = input.move.x;
    let y = input.move.y;
    if (input.keys.has("KeyA") || input.keys.has("ArrowLeft")) x -= 1;
    if (input.keys.has("KeyD") || input.keys.has("ArrowRight")) x += 1;
    if (input.keys.has("KeyW") || input.keys.has("ArrowUp")) y -= 1;
    if (input.keys.has("KeyS") || input.keys.has("ArrowDown")) y += 1;
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    return { x, y };
  }

  function movePlayer(dx, dy) {
    const p = state.player;
    const nx = clamp(p.x + dx, p.r, WORLD.width - p.r);
    const ny = clamp(p.y + dy, p.r, WORLD.height - p.r);
    if (!isSolid(nx, p.y, p.r)) p.x = nx;
    if (!isSolid(p.x, ny, p.r)) p.y = ny;
  }

  function isSolid(x, y, r) {
    const body = { x, y, r };
    if (state.world.buildings.some((building) => circleRectOverlap(body, building))) return true;
    return false;
  }

  function updateOlive(dt) {
    const olive = state.olive;
    const player = state.player;
    const d = distance(olive, player);
    if (d > 86) {
      const angle = angleTo(olive, player);
      const speed = d > 260 ? 190 : 118;
      olive.x += Math.cos(angle) * speed * dt;
      olive.y += Math.sin(angle) * speed * dt;
      olive.facing = angle;
    }
  }

  function updateZombies(dt) {
    const player = state.player;
    const night = isNight();
    const safe = zoneById("safe");

    state.zombies.forEach((zombie) => {
      if (zombie.dead) return;
      zombie.attackCooldown = Math.max(0, zombie.attackCooldown - dt);
      zombie.stun = Math.max(0, zombie.stun - dt);

      const d = distance(zombie, player);
      const attracted = d < (night ? 760 : 520) || isInDarkZone(zombie);
      let targetX = zombie.homeX + Math.cos(zombie.wander) * 90;
      let targetY = zombie.homeY + Math.sin(zombie.wander) * 90;
      zombie.wander += dt * 0.45 * (hash2(zombie.seed, state.time) > 0.5 ? 1 : -1);

      if (attracted) {
        targetX = player.x;
        targetY = player.y;
      }

      const safeRepel = state.safeZoneUnlocked && zombie.x > safe.x - 120 && zombie.x < safe.x + safe.w + 120 && zombie.y > safe.y - 120 && zombie.y < safe.y + safe.h + 120;
      if (safeRepel) {
        const cx = safe.x + safe.w / 2;
        const cy = safe.y + safe.h / 2;
        targetX = zombie.x + (zombie.x - cx);
        targetY = zombie.y + (zombie.y - cy);
        zombie.hp -= dt * 8;
        if (zombie.hp <= 0) killZombie(zombie);
      }

      const uvHit = player.uvLight && player.uv > 0 && d < 230 && Math.abs(normalizeAngle(angleTo(player, zombie) - player.facing)) < Math.PI * 0.48;
      const lampHit = state.safeZoneUnlocked && state.world.lamps.some((lamp) => distance(lamp, zombie) < 250);
      if (uvHit || lampHit) {
        zombie.stun = 0.3;
        zombie.hp -= dt * (zombie.type === "volatile" ? 10 : 4);
        addFloatingText(zombie.x, zombie.y - 18, "UV", "#9fd4ff", 0.35);
        if (zombie.hp <= 0) killZombie(zombie);
      }

      const speedMult = night ? 1.58 : 1;
      const volatileMult = zombie.type === "volatile" ? 1.18 : 1;
      const stunMult = zombie.stun > 0 ? 0.12 : 1;
      const angle = Math.atan2(targetY - zombie.y, targetX - zombie.x);
      const speed = zombie.speed * speedMult * volatileMult * stunMult;
      zombie.x = clamp(zombie.x + Math.cos(angle) * speed * dt, 20, WORLD.width - 20);
      zombie.y = clamp(zombie.y + Math.sin(angle) * speed * dt, 20, WORLD.height - 20);

      if (d < player.r + zombie.r + 8 && zombie.attackCooldown <= 0 && zombie.stun <= 0) {
        hurtPlayer(zombie.type === "volatile" || night ? 14 : 8);
        zombie.attackCooldown = zombie.type === "volatile" ? 0.55 : 0.8;
      }
    });
  }

  function hurtPlayer(amount) {
    const player = state.player;
    if (player.hurtCooldown > 0) return;
    const mitigation = player.beastActive ? 0.56 : 1;
    player.health = clamp(player.health - amount * mitigation, 0, player.maxHealth);
    player.hurtCooldown = 0.55;
    camera.shake = 12;
    ui.damageFlash.classList.add("active");
    setTimeout(() => ui.damageFlash.classList.remove("active"), 110);
    if (player.health <= 0) {
      state.gameOver = true;
      speak("Olive", "Kyle! Nie, trzymaj sie!");
      toast("Zgineles. Wczytaj zapis albo zacznij od nowa.");
      setTimeout(openPausePanel, 800);
    }
  }

  function updateParticles(dt) {
    state.particles = state.particles.filter((particle) => {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      return particle.life > 0;
    });

    state.floatingText = state.floatingText.filter((text) => {
      text.life -= dt;
      text.y -= dt * 24;
      return text.life > 0;
    });
  }

  function updateCamera(dt) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const targetX = clamp(state.player.x - w / 2, 0, WORLD.width - w);
    const targetY = clamp(state.player.y - h / 2, 0, WORLD.height - h);
    camera.x = lerp(camera.x, targetX, 1 - Math.pow(0.001, dt));
    camera.y = lerp(camera.y, targetY, 1 - Math.pow(0.001, dt));
    camera.shake = Math.max(0, camera.shake - dt * 36);
  }

  function updateHud(dt) {
    renderHudTimer -= dt;
    if (renderHudTimer > 0) return;
    renderHudTimer = 0.08;

    const p = state.player;
    ui.healthBar.style.width = `${clamp((p.health / p.maxHealth) * 100, 0, 100)}%`;
    ui.beastBar.style.width = `${clamp((p.beast / p.maxBeast) * 100, 0, 100)}%`;
    ui.uvBar.style.width = `${clamp((p.uv / p.maxUv) * 100, 0, 100)}%`;
    ui.healthText.textContent = Math.round(p.health);
    ui.beastText.textContent = Math.round(p.beast);
    ui.uvText.textContent = Math.round(p.uv);
    ui.clockChip.textContent = `${String(Math.floor(state.time)).padStart(2, "0")}:${String(Math.floor((state.time % 1) * 60)).padStart(2, "0")}`;
    ui.zoneChip.textContent = currentZoneName();
    ui.levelChip.textContent = `LVL ${p.level}`;
    drawMiniMap();
  }

  function maybeOliveTalk(dt) {
    const olive = state.olive;
    olive.talkCooldown -= dt;
    if (olive.talkCooldown > 0) return;

    if (isNight() && Math.random() > 0.55) {
      speak("Olive", "Po zmroku sa szybsze. Trzymaj UV gotowe.");
      olive.talkCooldown = 22;
      return;
    }
    if (isInDarkZone(state.player) && Math.random() > 0.45) {
      speak("Olive", "To dark zone. Szukaj skrzynek, ale nie gas latarki.");
      olive.talkCooldown = 24;
      return;
    }
    if (!state.safeZoneUnlocked && distance(state.player, { x: 1090, y: 2235 }) < 420) {
      speak("Olive", "Panel safe zone jest obok bramy. Potrzebujesz zlomu, przewodow i baterii.");
      olive.talkCooldown = 26;
    } else {
      olive.talkCooldown = 18;
    }
  }

  function autosaveTick(dt) {
    state.autosave = (state.autosave || 14) - dt;
    if (state.autosave <= 0) {
      saveGame(false);
      state.autosave = 14;
    }
  }

  function addFloatingText(x, y, text, color, life = 0.8) {
    state.floatingText.push({ x, y, text, color, life, maxLife: life });
  }

  function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * TAU;
      const speed = 30 + Math.random() * 120;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 0.25 + Math.random() * 0.45,
        r: 1 + Math.random() * 3
      });
    }
  }

  function render() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    if (!state) {
      drawMenuBackdropPreview();
      return;
    }

    const sx = camera.shake ? (Math.random() - 0.5) * camera.shake : 0;
    const sy = camera.shake ? (Math.random() - 0.5) * camera.shake : 0;

    ctx.save();
    ctx.translate(Math.round(-camera.x + sx), Math.round(-camera.y + sy));
    drawWorld();
    drawEntities();
    ctx.restore();

    drawLighting();
    drawScreenUiHints();
  }

  function drawMenuBackdropPreview() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, "#07100d");
    grd.addColorStop(0.48, "#14221b");
    grd.addColorStop(1, "#0f1118");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
  }

  function drawWorld() {
    const view = getViewRect(260);
    const night = nightAmount();
    ctx.fillStyle = night > 0.6 ? "#111811" : "#1b2a1e";
    ctx.fillRect(view.x, view.y, view.w, view.h);

    drawGroundTexture(view);
    drawZones(view);
    drawRoads(view);
    drawDebris(view);
    drawGrass(view);
    drawBuildings(view);
    drawTrees(view);
    drawCars(view);
    drawCrates(view);
    drawSafeZone(view);
  }

  function getViewRect(pad = 0) {
    return {
      x: camera.x - pad,
      y: camera.y - pad,
      w: window.innerWidth + pad * 2,
      h: window.innerHeight + pad * 2
    };
  }

  function inView(obj, view) {
    const w = obj.w || obj.r * 2 || 80;
    const h = obj.h || obj.r * 2 || 80;
    return obj.x + w >= view.x && obj.x <= view.x + view.w && obj.y + h >= view.y && obj.y <= view.y + view.h;
  }

  function drawGroundTexture(view) {
    const step = 96;
    const startX = Math.floor(view.x / step) * step;
    const startY = Math.floor(view.y / step) * step;
    for (let x = startX; x < view.x + view.w; x += step) {
      for (let y = startY; y < view.y + view.h; y += step) {
        const h = hash2(x, y);
        ctx.fillStyle = h > 0.74 ? "rgba(199, 185, 132, 0.04)" : "rgba(5, 8, 6, 0.06)";
        ctx.fillRect(x + h * 38, y + hash2(y, x) * 38, 2 + h * 7, 2 + h * 6);
        if (h > 0.9) {
          ctx.strokeStyle = "rgba(0,0,0,0.16)";
          ctx.beginPath();
          ctx.moveTo(x + 20, y + h * 80);
          ctx.lineTo(x + 50 + h * 20, y + 25 + h * 20);
          ctx.stroke();
        }
      }
    }
  }

  function drawZones(view) {
    ZONES.forEach((zone) => {
      if (!inView(zone, view)) return;
      ctx.save();
      ctx.globalAlpha = zone.id.startsWith("dark") ? 0.24 : zone.id === "safe" ? 0.16 : 0.09;
      ctx.fillStyle = zone.color;
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
      ctx.restore();

      if (zone.id.startsWith("dark")) {
        ctx.strokeStyle = "rgba(156, 107, 255, 0.26)";
        ctx.lineWidth = 2;
        ctx.setLineDash([18, 16]);
        ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
        ctx.setLineDash([]);
      }
    });
  }

  function drawRoads(view) {
    state.world.roads.forEach((road) => {
      if (!inView(road, view)) return;
      ctx.fillStyle = road.type === "trail" || road.type === "forest-road" ? "#2b2a21" : "#252b29";
      ctx.fillRect(road.x, road.y, road.w, road.h);
      ctx.fillStyle = "rgba(255, 226, 131, 0.28)";
      if (road.w > road.h) {
        for (let x = Math.floor(road.x / 120) * 120; x < road.x + road.w; x += 120) {
          ctx.fillRect(x + 24, road.y + road.h / 2 - 3, 48, 6);
        }
      } else {
        for (let y = Math.floor(road.y / 120) * 120; y < road.y + road.h; y += 120) {
          ctx.fillRect(road.x + road.w / 2 - 3, y + 24, 6, 48);
        }
      }
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(road.x, road.y, road.w, 5);
      ctx.fillRect(road.x, road.y + road.h - 5, road.w, 5);
    });
  }

  function drawDebris(view) {
    state.world.debris.forEach((item) => {
      if (!inView(item, view)) return;
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rot);
      ctx.fillStyle = item.kind === "paper" ? "rgba(210, 210, 190, 0.16)" : "rgba(0, 0, 0, 0.22)";
      ctx.fillRect(-item.r, -item.r / 2, item.r * 2, item.r);
      ctx.restore();
    });
  }

  function drawGrass(view) {
    const now = performance.now() * 0.002;
    ctx.lineWidth = 1;
    state.world.grass.forEach((blade) => {
      if (!inView(blade, view)) return;
      const sway = Math.sin(now + blade.sway) * 5 * state.weather.wind;
      ctx.strokeStyle = "rgba(96, 160, 83, 0.46)";
      ctx.beginPath();
      ctx.moveTo(blade.x, blade.y);
      ctx.lineTo(blade.x + sway, blade.y - blade.h);
      ctx.stroke();
    });

    for (let i = 0; i < 36; i += 1) {
      const t = (performance.now() * 0.00004 + i * 0.031) % 1;
      const x = camera.x + ((hash2(i, state.day) * window.innerWidth + t * 260) % (window.innerWidth + 260)) - 130;
      const y = camera.y + ((hash2(state.day, i) * window.innerHeight + t * 160) % (window.innerHeight + 160)) - 80;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * TAU);
      ctx.fillStyle = "rgba(189, 137, 54, 0.24)";
      ctx.fillRect(-4, -2, 8, 4);
      ctx.restore();
    }
  }

  function drawBuildings(view) {
    state.world.buildings.forEach((building) => {
      if (!inView(building, view)) return;
      ctx.fillStyle = building.kind === "shop" ? "#333a35" : "#2a322f";
      ctx.fillRect(building.x, building.y, building.w, building.h);
      ctx.strokeStyle = "rgba(0,0,0,0.44)";
      ctx.lineWidth = 6;
      ctx.strokeRect(building.x, building.y, building.w, building.h);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      for (let x = building.x + 20; x < building.x + building.w - 14; x += 34) {
        for (let y = building.y + 18; y < building.y + building.h - 14; y += 34) {
          const lit = hash2(x + building.seed, y) > (isNight() ? 0.68 : 0.88);
          ctx.fillStyle = lit ? "rgba(255, 194, 81, 0.34)" : "rgba(18, 22, 20, 0.7)";
          ctx.fillRect(x, y, 14, 18);
        }
      }
    });
  }

  function drawTrees(view) {
    const now = performance.now() * 0.0016;
    state.world.trees.forEach((tree) => {
      if (!inView({ x: tree.x - tree.r, y: tree.y - tree.r, w: tree.r * 2, h: tree.r * 2 }, view)) return;
      const sway = Math.sin(now + tree.sway) * 4 * state.weather.wind;
      ctx.fillStyle = "#3a2419";
      ctx.fillRect(tree.x - 4, tree.y - 6, 8, 28);
      ctx.fillStyle = tree.color;
      ctx.beginPath();
      ctx.ellipse(tree.x + sway, tree.y - 12, tree.r * 1.05, tree.r * 0.82, 0.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(12, 24, 14, 0.42)";
      ctx.beginPath();
      ctx.ellipse(tree.x + sway + 8, tree.y - 7, tree.r * 0.62, tree.r * 0.5, -0.2, 0, TAU);
      ctx.fill();
    });
  }

  function drawCars(view) {
    state.world.cars.forEach((car) => {
      if (!inView({ x: car.x - car.w / 2, y: car.y - car.h / 2, w: car.w, h: car.h }, view)) return;
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.rot);
      ctx.fillStyle = car.looted ? "#282b29" : car.color;
      ctx.fillRect(-car.w / 2, -car.h / 2, car.w, car.h);
      ctx.fillStyle = "rgba(160, 220, 230, 0.22)";
      ctx.fillRect(-car.w * 0.18, -car.h / 2 + 4, car.w * 0.36, car.h - 8);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(-car.w / 2 + 6, -car.h / 2 - 4, 12, 6);
      ctx.fillRect(car.w / 2 - 18, car.h / 2 - 2, 12, 6);
      if (!car.looted) {
        ctx.strokeStyle = car.convoy ? "rgba(255, 210, 92, 0.62)" : "rgba(182, 246, 92, 0.35)";
        ctx.strokeRect(-car.w / 2 - 4, -car.h / 2 - 4, car.w + 8, car.h + 8);
      }
      ctx.restore();
    });
  }

  function drawCrates(view) {
    state.world.crates.forEach((crate) => {
      if (!inView({ x: crate.x - 20, y: crate.y - 20, w: 40, h: 40 }, view) || crate.looted) return;
      ctx.fillStyle = "#5a4224";
      ctx.fillRect(crate.x - 18, crate.y - 14, 36, 28);
      ctx.strokeStyle = "rgba(255, 211, 86, 0.62)";
      ctx.strokeRect(crate.x - 22, crate.y - 18, 44, 36);
    });
  }

  function drawSafeZone(view) {
    const safe = zoneById("safe");
    if (!inView(safe, view)) return;
    ctx.strokeStyle = state.safeZoneUnlocked ? "rgba(146, 220, 255, 0.7)" : "rgba(255, 120, 80, 0.56)";
    ctx.lineWidth = 4;
    ctx.strokeRect(safe.x, safe.y, safe.w, safe.h);
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(safe.x + 210, safe.y + 160, 240, 180);
    ctx.fillStyle = state.safeZoneUnlocked ? "#9fd4ff" : "#ff7850";
    ctx.fillRect(safe.x + 310, safe.y + 230, 40, 36);
    ctx.fillStyle = "#f4f4ed";
    ctx.font = "14px sans-serif";
    ctx.fillText(state.safeZoneUnlocked ? "SAFE ZONE" : "NAPRAW UV", safe.x + 230, safe.y + 150);

    state.world.lamps.forEach((lamp) => {
      ctx.fillStyle = "#1b2425";
      ctx.fillRect(lamp.x - 4, lamp.y - 52, 8, 52);
      ctx.beginPath();
      ctx.arc(lamp.x, lamp.y - 56, 12, 0, TAU);
      ctx.fillStyle = lamp.on ? "#9fd4ff" : "#404646";
      ctx.fill();
      if (lamp.on) {
        const glow = ctx.createRadialGradient(lamp.x, lamp.y - 56, 10, lamp.x, lamp.y - 56, 170);
        glow.addColorStop(0, "rgba(142, 199, 255, 0.24)");
        glow.addColorStop(1, "rgba(142, 199, 255, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(lamp.x, lamp.y - 56, 170, 0, TAU);
        ctx.fill();
      }
    });
  }

  function drawEntities() {
    const view = getViewRect(180);

    state.zombies.forEach((zombie) => {
      if (!inView({ x: zombie.x - 40, y: zombie.y - 50, w: 80, h: 80 }, view)) return;
      drawZombie(zombie);
    });

    drawOlive();
    drawPlayer();

    state.particles.forEach((particle) => {
      ctx.globalAlpha = clamp(particle.life / 0.5, 0, 1);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    state.floatingText.forEach((text) => {
      ctx.globalAlpha = clamp(text.life / text.maxLife, 0, 1);
      ctx.fillStyle = text.color;
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(text.text, text.x, text.y);
      ctx.globalAlpha = 1;
    });
    ctx.textAlign = "start";
  }

  function drawZombie(zombie) {
    ctx.save();
    ctx.translate(zombie.x, zombie.y);
    if (zombie.dead) {
      ctx.rotate(zombie.seed);
      ctx.fillStyle = zombie.looted ? "rgba(61, 49, 44, 0.58)" : "rgba(93, 50, 42, 0.82)";
      ctx.fillRect(-18, -8, 36, 16);
      ctx.fillStyle = zombie.looted ? "rgba(160,160,140,0.22)" : "rgba(182,246,92,0.42)";
      ctx.beginPath();
      ctx.arc(0, -16, 4, 0, TAU);
      ctx.fill();
      ctx.restore();
      return;
    }

    const volatile = zombie.type === "volatile";
    const stunned = zombie.stun > 0;
    ctx.fillStyle = stunned ? "#344a59" : volatile ? "#5c251d" : "#354033";
    ctx.beginPath();
    ctx.ellipse(0, 0, zombie.r * 0.86, zombie.r * 1.12, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = volatile ? "#ff705d" : "#d7ff88";
    ctx.beginPath();
    ctx.arc(-5, -8, 2.4, 0, TAU);
    ctx.arc(6, -8, 2.4, 0, TAU);
    ctx.fill();
    if (zombie.hp < zombie.maxHp) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(-18, -32, 36, 4);
      ctx.fillStyle = "#ff5448";
      ctx.fillRect(-18, -32, 36 * (zombie.hp / zombie.maxHp), 4);
    }
    ctx.restore();
  }

  function drawOlive() {
    const olive = state.olive;
    ctx.save();
    ctx.translate(olive.x, olive.y);
    ctx.rotate(olive.facing);
    ctx.fillStyle = "#5f7d8d";
    ctx.beginPath();
    ctx.ellipse(0, 0, olive.r * 0.75, olive.r, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#cbd8d5";
    ctx.fillRect(2, -3, 12, 6);
    ctx.restore();
    ctx.fillStyle = "rgba(244,244,237,0.74)";
    ctx.font = "12px sans-serif";
    ctx.fillText("Olive", olive.x - 17, olive.y - 24);
  }

  function drawPlayer() {
    const p = state.player;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.facing);
    const bodyColor = p.beastActive ? "#f07835" : "#d7d7c7";
    ctx.fillStyle = p.beastActive ? "rgba(240,112,53,0.22)" : "rgba(182,246,92,0.12)";
    ctx.beginPath();
    ctx.arc(0, 0, p.beastActive ? 42 : 30, 0, TAU);
    ctx.fill();
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r * 0.76, p.r, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#151916";
    ctx.fillRect(4, -4, 23, 8);
    ctx.fillStyle = p.uvLight ? "#9fd4ff" : "#f7d27b";
    ctx.fillRect(21, -2, 18, 4);
    ctx.restore();
    ctx.fillStyle = "rgba(244,244,237,0.82)";
    ctx.font = "12px sans-serif";
    ctx.fillText("Kyle Crane", p.x - 31, p.y - 28);
  }

  function drawLighting() {
    const darkness = clamp(nightAmount() * 0.68 + (isInDarkZone() ? 0.25 : 0), 0, 0.88);
    if (darkness <= 0.02) return;

    const p = state.player;
    const sx = p.x - camera.x;
    const sy = p.y - camera.y;
    const w = window.innerWidth;
    const h = window.innerHeight;

    ctx.save();
    ctx.fillStyle = `rgba(0, 5, 6, ${darkness})`;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "destination-out";

    if (p.flashlight) {
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(p.facing);
      const cone = ctx.createLinearGradient(20, 0, 360, 0);
      cone.addColorStop(0, "rgba(255,255,255,0.85)");
      cone.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(6, -48);
      ctx.lineTo(390, -150);
      ctx.lineTo(390, 150);
      ctx.lineTo(6, 48);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    const playerGlow = ctx.createRadialGradient(sx, sy, 12, sx, sy, p.uvLight ? 170 : 94);
    playerGlow.addColorStop(0, "rgba(255,255,255,0.82)");
    playerGlow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = playerGlow;
    ctx.beginPath();
    ctx.arc(sx, sy, p.uvLight ? 170 : 94, 0, TAU);
    ctx.fill();

    if (state.safeZoneUnlocked) {
      state.world.lamps.forEach((lamp) => {
        const lx = lamp.x - camera.x;
        const ly = lamp.y - camera.y - 56;
        if (lx < -230 || lx > w + 230 || ly < -230 || ly > h + 230) return;
        const glow = ctx.createRadialGradient(lx, ly, 10, lx, ly, 230);
        glow.addColorStop(0, "rgba(255,255,255,0.72)");
        glow.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(lx, ly, 230, 0, TAU);
        ctx.fill();
      });
    }
    ctx.restore();

    if (p.uvLight) {
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.strokeStyle = "#9fd4ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, 170, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawScreenUiHints() {
    if (!state || state.paused || state.gameOver) return;
    const p = state.player;
    const nearDead = state.zombies.some((z) => z.dead && !z.looted && distance(p, z) < 68);
    const nearCar = state.world.cars.some((car) => !car.looted && distance(p, car) < 72);
    const nearCrate = state.world.crates.some((box) => !box.looted && distance(p, box) < 76);
    const safe = zoneById("safe");
    const nearSafePanel = !state.safeZoneUnlocked && p.x > safe.x + 210 && p.x < safe.x + 450 && p.y > safe.y + 160 && p.y < safe.y + 340;

    if (nearDead || nearCar || nearCrate || nearSafePanel) {
      ctx.fillStyle = "rgba(0,0,0,0.62)";
      ctx.strokeStyle = "rgba(182,246,92,0.5)";
      ctx.lineWidth = 1;
      const label = nearSafePanel ? "Szukaj: napraw safe zone" : "Szukaj: przeszukaj";
      const x = window.innerWidth / 2 - 110;
      const y = window.innerHeight * 0.72;
      ctx.fillRect(x, y, 220, 34);
      ctx.strokeRect(x, y, 220, 34);
      ctx.fillStyle = "#f4f4ed";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, window.innerWidth / 2, y + 22);
      ctx.textAlign = "start";
    }
  }

  function drawMiniMap() {
    const w = miniMap.width;
    const h = miniMap.height;
    miniCtx.clearRect(0, 0, w, h);
    miniCtx.fillStyle = "#07100d";
    miniCtx.fillRect(0, 0, w, h);
    const sx = w / WORLD.width;
    const sy = h / WORLD.height;

    ZONES.forEach((zone) => {
      miniCtx.fillStyle = zone.color;
      miniCtx.globalAlpha = zone.id === "safe" && state.safeZoneUnlocked ? 0.75 : 0.45;
      miniCtx.fillRect(zone.x * sx, zone.y * sy, zone.w * sx, zone.h * sy);
    });
    miniCtx.globalAlpha = 1;

    state.world.roads.forEach((road) => {
      miniCtx.fillStyle = "rgba(200, 200, 170, 0.28)";
      miniCtx.fillRect(road.x * sx, road.y * sy, road.w * sx, road.h * sy);
    });

    miniCtx.fillStyle = "#ff5448";
    state.zombies.forEach((zombie) => {
      if (!zombie.dead && distance(zombie, state.player) < 620) {
        miniCtx.fillRect(zombie.x * sx - 1, zombie.y * sy - 1, 2, 2);
      }
    });

    miniCtx.fillStyle = "#b6f65c";
    miniCtx.beginPath();
    miniCtx.arc(state.player.x * sx, state.player.y * sy, 4, 0, TAU);
    miniCtx.fill();
  }

  function renderBigMap() {
    if (!state) return;
    const w = bigMap.width;
    const h = bigMap.height;
    bigCtx.clearRect(0, 0, w, h);
    bigCtx.fillStyle = "#07100d";
    bigCtx.fillRect(0, 0, w, h);
    const sx = w / WORLD.width;
    const sy = h / WORLD.height;

    ZONES.forEach((zone) => {
      bigCtx.fillStyle = zone.color;
      bigCtx.globalAlpha = 0.44;
      bigCtx.fillRect(zone.x * sx, zone.y * sy, zone.w * sx, zone.h * sy);
      bigCtx.globalAlpha = 1;
      bigCtx.strokeStyle = "rgba(255,255,255,0.18)";
      bigCtx.strokeRect(zone.x * sx, zone.y * sy, zone.w * sx, zone.h * sy);
      bigCtx.fillStyle = "#f4f4ed";
      bigCtx.font = "12px sans-serif";
      bigCtx.fillText(zone.name, zone.x * sx + 6, zone.y * sy + 16);
    });

    state.world.roads.forEach((road) => {
      bigCtx.fillStyle = "rgba(220, 220, 190, 0.25)";
      bigCtx.fillRect(road.x * sx, road.y * sy, road.w * sx, road.h * sy);
    });

    state.world.cars.forEach((car) => {
      bigCtx.fillStyle = car.looted ? "rgba(90,90,90,0.35)" : car.convoy ? "#d8a343" : "#89938d";
      bigCtx.fillRect(car.x * sx - 2, car.y * sy - 2, 4, 4);
    });

    state.world.crates.forEach((crate) => {
      if (crate.looted) return;
      bigCtx.fillStyle = "#ffda60";
      bigCtx.fillRect(crate.x * sx - 3, crate.y * sy - 3, 6, 6);
    });

    bigCtx.fillStyle = "#b6f65c";
    bigCtx.beginPath();
    bigCtx.arc(state.player.x * sx, state.player.y * sy, 6, 0, TAU);
    bigCtx.fill();
  }

  function renderInventoryPanels() {
    if (!state) return;
    const p = state.player;
    const weapon = getWeapon();

    ui.inventoryView.innerHTML = `
      <div class="itemGrid">
        <article class="itemCard">
          <h3>Bron</h3>
          <p>${weapon.name} - obrazenia ${weapon.damage}, trwalosc ${Math.round(weapon.durability)}/${weapon.maxDurability}</p>
          <button data-action="repair">Napraw</button>
        </article>
        <article class="itemCard">
          <h3>Poziom ${p.level}</h3>
          <p>XP ${Math.round(p.xp)}/${xpForLevel(p.level)}. Punkty skilli: ${p.skillPoints}</p>
        </article>
        ${Object.entries(p.inventory).map(([id, amount]) => `
          <article class="itemCard">
            <h3>${MATERIAL_NAMES[id] || id}</h3>
            <p>Ilosc: ${amount}</p>
          </article>
        `).join("")}
      </div>
    `;

    ui.craftingView.innerHTML = `
      <div class="craftGrid">
        ${RECIPES.map((recipe) => `
          <article class="craftCard">
            <h3>${recipe.name}</h3>
            <p>${recipe.desc}</p>
            <p>Koszt: ${formatCost(recipe.cost)}</p>
            <button data-recipe="${recipe.id}" ${canAfford(p.inventory, recipe.cost) ? "" : "disabled"}>Wytworz</button>
          </article>
        `).join("")}
      </div>
    `;

    ui.skillsView.innerHTML = `
      <p class="smallText">Punkty umiejetnosci: ${p.skillPoints}</p>
      <div class="skillGrid">
        ${SKILLS.map((skill) => {
          const learned = Boolean(p.skills[skill.id]);
          const locked = p.level < skill.minLevel || p.skillPoints < skill.cost || learned;
          return `
            <article class="skillCard">
              <h3>${skill.branch}: ${skill.name}</h3>
              <p>${skill.desc}</p>
              <p>Koszt ${skill.cost}, wymagany LVL ${skill.minLevel}</p>
              <button data-skill="${skill.id}" ${locked ? "disabled" : ""}>${learned ? "Odblokowane" : "Odblokuj"}</button>
            </article>
          `;
        }).join("")}
      </div>
    `;
  }

  function formatCost(cost) {
    return Object.entries(cost).map(([id, amount]) => `${MATERIAL_NAMES[id] || id} x${amount}`).join(", ");
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  function bindEvents() {
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", (event) => {
      if (event.repeat) {
        input.keys.add(event.code);
        return;
      }
      input.keys.add(event.code);
      if (event.code === "Space") doAction("attack");
      if (event.code === "KeyE") doAction("loot");
      if (event.code === "KeyF") doAction("flashlight");
      if (event.code === "KeyQ") doAction("uv");
      if (event.code === "KeyR") doAction("beast");
      if (event.code === "KeyI") openInventory("inventory");
      if (event.code === "KeyK") openInventory("skills");
      if (event.code === "KeyM") openInventory("map");
      if (event.code === "Escape" || event.code === "KeyP") {
        if (state?.paused) closePanels(true);
        else openPausePanel();
      }
    });
    window.addEventListener("keyup", (event) => input.keys.delete(event.code));

    ui.newGameBtn.addEventListener("click", newGame);
    ui.continueBtn.addEventListener("click", loadSavedGame);
    ui.optionsBtn.addEventListener("click", () => {
      ui.optionsPanel.classList.remove("hidden");
    });
    ui.resumeBtn.addEventListener("click", () => closePanels(true));
    ui.saveBtn.addEventListener("click", () => saveGame(true));
    ui.backToMenuBtn.addEventListener("click", backToMenu);

    document.querySelectorAll("[data-close-panel]").forEach((button) => {
      button.addEventListener("click", () => closePanels(true));
    });

    document.querySelectorAll(".tabBtn").forEach((button) => {
      button.addEventListener("click", () => {
        selectTab(button.dataset.tab);
        if (button.dataset.tab === "map") renderBigMap();
      });
    });

    ui.inventoryPanel.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.recipe) craftRecipe(target.dataset.recipe);
      if (target.dataset.skill) learnSkill(target.dataset.skill);
      if (target.dataset.action) doAction(target.dataset.action);
    });

    ui.actionButtons.addEventListener("pointerdown", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      event.preventDefault();
      doAction(button.dataset.action);
    });

    ui.quickSlots.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      doAction(button.dataset.action);
    });

    ui.musicToggle.addEventListener("change", () => {
      options.music = ui.musicToggle.checked;
      ui.music.volume = options.music ? 0.38 : 0;
      if (options.music) tryStartMusic();
    });
    ui.voiceToggle.addEventListener("change", () => {
      options.voice = ui.voiceToggle.checked;
      if (!options.voice && "speechSynthesis" in window) window.speechSynthesis.cancel();
    });
    ui.rainToggle.addEventListener("change", () => {
      options.rain = ui.rainToggle.checked;
      ui.rainLayer.classList.toggle("active", options.rain && state?.weather.rain);
    });

    bindJoystick();
    window.addEventListener("pointerdown", () => tryStartMusic(), { once: false });
  }

  function bindJoystick() {
    ui.joystick.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      ui.joystick.setPointerCapture(event.pointerId);
      input.joystickId = event.pointerId;
      const rect = ui.joystick.getBoundingClientRect();
      input.joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      updateStick(event.clientX, event.clientY);
    });

    ui.joystick.addEventListener("pointermove", (event) => {
      if (input.joystickId !== event.pointerId) return;
      event.preventDefault();
      updateStick(event.clientX, event.clientY);
    });

    const release = (event) => {
      if (input.joystickId !== event.pointerId) return;
      input.joystickId = null;
      input.move.x = 0;
      input.move.y = 0;
      ui.stick.style.transform = "translate(0, 0)";
    };
    ui.joystick.addEventListener("pointerup", release);
    ui.joystick.addEventListener("pointercancel", release);
  }

  function updateStick(clientX, clientY) {
    const max = 42;
    const dx = clientX - input.joystickCenter.x;
    const dy = clientY - input.joystickCenter.y;
    const len = Math.hypot(dx, dy);
    const scale = len > max ? max / len : 1;
    const x = dx * scale;
    const y = dy * scale;
    input.move.x = x / max;
    input.move.y = y / max;
    ui.stick.style.transform = `translate(${x}px, ${y}px)`;
  }

  function init() {
    resize();
    bindEvents();
    updateContinueButton();
    requestAnimationFrame(loop);
  }

  init();
})();
