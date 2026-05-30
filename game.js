(() => {
  "use strict";

  const SAVE_KEY = "castor-woods-the-beast-save-v2";
  const LEGACY_SAVE_KEY = "castor-woods-the-beast-save-v1";
  const SAVE_VERSION = 2;
  const WORLD = { width: 21600, height: 13200 };
  const TAU = Math.PI * 2;

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const miniMap = document.getElementById("miniMap");
  const miniCtx = miniMap.getContext("2d");
  const bigMap = document.getElementById("bigMapCanvas");
  const bigCtx = bigMap.getContext("2d");

  const ui = {
    mainMenu: document.getElementById("mainMenu"),
    loadingScreen: document.getElementById("loadingScreen"),
    loadingBar: document.getElementById("loadingBar"),
    loadingTip: document.getElementById("loadingTip"),
    newGameBtn: document.getElementById("newGameBtn"),
    continueBtn: document.getElementById("continueBtn"),
    optionsBtn: document.getElementById("optionsBtn"),
    updatesBtn: document.getElementById("updatesBtn"),
    accountBtn: document.getElementById("accountBtn"),
    onlineBtn: document.getElementById("onlineBtn"),
    menuShopBtn: document.getElementById("menuShopBtn"),
    updatesPanel: document.getElementById("updatesPanel"),
    updatesList: document.getElementById("updatesList"),
    optionsPanel: document.getElementById("optionsPanel"),
    accountPanel: document.getElementById("accountPanel"),
    onlinePanel: document.getElementById("onlinePanel"),
    pausePanel: document.getElementById("pausePanel"),
    inventoryPanel: document.getElementById("inventoryPanel"),
    resumeBtn: document.getElementById("resumeBtn"),
    saveBtn: document.getElementById("saveBtn"),
    skipNightBtn: document.getElementById("skipNightBtn"),
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
    compassChip: document.getElementById("compassChip"),
    missionChip: document.getElementById("missionChip"),
    bossHud: document.getElementById("bossHud"),
    bossName: document.getElementById("bossName"),
    bossHealthBar: document.getElementById("bossHealthBar"),
    joystick: document.getElementById("joystick"),
    stick: document.getElementById("stick"),
    actionButtons: document.getElementById("actionButtons"),
    quickSlots: document.getElementById("quickSlots"),
    miniMapWrap: document.getElementById("miniMapWrap"),
    inventoryView: document.getElementById("inventoryView"),
    weaponsView: document.getElementById("weaponsView"),
    craftingView: document.getElementById("craftingView"),
    blueprintsView: document.getElementById("blueprintsView"),
    skillsView: document.getElementById("skillsView"),
    journalView: document.getElementById("journalView"),
    shopView: document.getElementById("shopView"),
    waypointText: document.getElementById("waypointText"),
    music: document.getElementById("music"),
    musicToggle: document.getElementById("musicToggle"),
    voiceToggle: document.getElementById("voiceToggle"),
    rainToggle: document.getElementById("rainToggle"),
    difficultySelect: document.getElementById("difficultySelect"),
    qualitySelect: document.getElementById("qualitySelect"),
    accountName: document.getElementById("accountName"),
    accountEmail: document.getElementById("accountEmail"),
    accountPassword: document.getElementById("accountPassword"),
    accountCode: document.getElementById("accountCode"),
    createAccountBtn: document.getElementById("createAccountBtn"),
    loginBtn: document.getElementById("loginBtn"),
    verifyCodeBtn: document.getElementById("verifyCodeBtn"),
    resetPasswordBtn: document.getElementById("resetPasswordBtn"),
    accountStatus: document.getElementById("accountStatus"),
    serverUrl: document.getElementById("serverUrl"),
    lobbyCode: document.getElementById("lobbyCode"),
    connectOnlineBtn: document.getElementById("connectOnlineBtn"),
    createLobbyBtn: document.getElementById("createLobbyBtn"),
    joinLobbyBtn: document.getElementById("joinLobbyBtn"),
    onlinePlayers: document.getElementById("onlinePlayers"),
    chatLog: document.getElementById("chatLog"),
    chatInput: document.getElementById("chatInput"),
    sendChatBtn: document.getElementById("sendChatBtn"),
    saveIndicator: document.getElementById("saveIndicator"),
    rainLayer: document.getElementById("rainLayer"),
    damageFlash: document.getElementById("damageFlash")
  };

  const options = {
    music: true,
    voice: true,
    rain: true,
    difficulty: "normal",
    quality: "medium"
  };

  const DIFFICULTIES = {
    story: { label: "Story", zombieDamage: 0.62, zombieHp: 0.7, loot: 1.45, bossHp: 0.72 },
    normal: { label: "Normal", zombieDamage: 1, zombieHp: 1, loot: 1, bossHp: 1 },
    hard: { label: "Hard", zombieDamage: 1.28, zombieHp: 1.18, loot: 0.9, bossHp: 1.2 },
    nightmare: { label: "Nightmare", zombieDamage: 1.58, zombieHp: 1.42, loot: 0.75, bossHp: 1.45 },
    beast: { label: "Beast", zombieDamage: 1.9, zombieHp: 1.7, loot: 0.65, bossHp: 1.8 }
  };

  const QUALITY = {
    low: { detail: 0.45, label: "Telefon low" },
    medium: { detail: 0.75, label: "Telefon medium" },
    high: { detail: 1, label: "PC / konsola" },
    ultra: { detail: 1.25, label: "Ultra" }
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
    repairKit: "Zestaw naprawczy",
    ammo9: "Amunicja 9 mm",
    arrow: "Strzaly",
    grenade: "Granaty",
    coins: "Monety",
    fireGel: "Zel ogniowy",
    toxicVial: "Fiolka toxic",
    capacitor: "Kondensator",
    cloth: "Tkanina",
    metalParts: "Czesci metalowe"
  };

  const WEAPON_DEFS = {
    fists: { name: "Piesci", type: "melee", damage: 10, maxDurability: 999, range: 46 },
    pipe: { name: "Rura", type: "melee", damage: 24, maxDurability: 100, range: 82 },
    axe: { name: "Siekiera", type: "melee", damage: 44, maxDurability: 110, range: 88 },
    bow: { name: "Luk", type: "ranged", damage: 38, maxDurability: 140, ammo: "arrow", range: 520 },
    pistol: { name: "Pistolet", type: "ranged", damage: 62, maxDurability: 180, ammo: "ammo9", range: 680 },
    spikedPipe: { name: "Kolczasta rura", type: "melee", damage: 36, maxDurability: 120, range: 88 }
  };

  const ELEMENT_MODS = {
    fire: { name: "Ogien", cost: { fireGel: 2, chemicals: 1 }, color: "#ff8b3d" },
    toxic: { name: "Toxic", cost: { toxicVial: 2, infectedTissue: 2 }, color: "#88ff63" },
    electric: { name: "Elektryczne", cost: { capacitor: 2, wire: 2 }, color: "#8fc7ff" }
  };

  const UPDATE_LOG = [
    { date: "2026-05-30 12:00", title: "V2 mapa 3x", text: "Wiekszy swiat, Stare Miasto, safe zone'y, bossy, misje i backend MVP." },
    { date: "2026-05-30 12:15", title: "GUI telefonu", text: "Nowy kompas, minimapa jako przycisk, boss bar, dziennik i zakladki ekwipunku." },
    { date: "2026-05-30 12:30", title: "Mody", text: "Dodano folder mods z darmowymi dodatkami GUI i danymi do przyszlych map." }
  ];

  const SHOP_ITEMS = [
    { id: "axe", name: "Siekiera", cost: 55, kind: "weapon", weapon: "axe" },
    { id: "pistol", name: "Pistolet", cost: 120, kind: "weapon", weapon: "pistol" },
    { id: "bow", name: "Luk", cost: 90, kind: "weapon", weapon: "bow" },
    { id: "ammo9", name: "Amunicja 9 mm x12", cost: 30, kind: "item", item: "ammo9", amount: 12 },
    { id: "grenade", name: "Granat x2", cost: 45, kind: "item", item: "grenade", amount: 2 },
    { id: "gui_neon", name: "Darmowy GUI Neon", cost: 0, kind: "addon", addon: "gui-neon" },
    { id: "map_oldtown", name: "Mapa Starego Miasta", cost: 35, kind: "addon", addon: "old-town-map" }
  ];

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
    },
    {
      id: "arrowBundle",
      name: "Strzaly x8",
      desc: "Amunicja do luku, cicha i dobra w blokach.",
      cost: { scrap: 1, cloth: 1 },
      craft(state) {
        addItem(state.player.inventory, "arrow", 8);
      }
    },
    {
      id: "grenadeCraft",
      name: "Granat",
      desc: "Glosny, ale czysci grupy i boss addy.",
      cost: { chemicals: 2, metalParts: 2, wire: 1 },
      craft(state) {
        addItem(state.player.inventory, "grenade", 1);
      }
    },
    {
      id: "fireMod",
      name: "Mod ognia",
      desc: "Dodaje obrazenia od ognia do aktywnej broni.",
      cost: ELEMENT_MODS.fire.cost,
      craft(state) {
        applyWeaponMod("fire");
      }
    },
    {
      id: "toxicMod",
      name: "Mod toxic",
      desc: "Truje zombie i ludzi Barona.",
      cost: ELEMENT_MODS.toxic.cost,
      craft(state) {
        applyWeaponMod("toxic");
      }
    },
    {
      id: "electricMod",
      name: "Mod elektryczny",
      desc: "Ogłusza szybkie zombie.",
      cost: ELEMENT_MODS.electric.cost,
      craft(state) {
        applyWeaponMod("electric");
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
    },
    {
      id: "axeMaster",
      branch: "Bronie",
      name: "Mistrz siekiery",
      desc: "Siekiera zadaje wieksze obrazenia bossom.",
      cost: 2,
      minLevel: 4
    },
    {
      id: "pistolControl",
      branch: "Bronie",
      name: "Kontrola pistoletu",
      desc: "Strzaly sa celniejsze i zuzywaja mniej trwalosci.",
      cost: 2,
      minLevel: 4
    },
    {
      id: "bowSilence",
      branch: "Bronie",
      name: "Cichy luk",
      desc: "Strzaly mniej przyciagaja zombie.",
      cost: 1,
      minLevel: 3
    },
    {
      id: "grenadier",
      branch: "Crafting",
      name: "Granadier",
      desc: "Granaty maja wiekszy promien eksplozji.",
      cost: 2,
      minLevel: 5
    },
    {
      id: "elementalHands",
      branch: "Crafting",
      name: "Elementalista",
      desc: "Mody ognia, toxic i elektryczne zadaja dluzej obrazenia.",
      cost: 2,
      minLevel: 6
    },
    {
      id: "beastUpgrade1",
      branch: "Bestia",
      name: "Pazur bestii",
      desc: "Tryb bestii ma wiekszy zasieg ataku.",
      cost: 2,
      minLevel: 5
    },
    {
      id: "beastUpgrade2",
      branch: "Bestia",
      name: "Serce bestii",
      desc: "Pasek bestii laduje sie szybciej po zmroku.",
      cost: 3,
      minLevel: 7
    },
    {
      id: "safeEngineer",
      branch: "Przetrwanie",
      name: "Inzynier safe zone",
      desc: "Odblokowanie safe zone wymaga mniej materialow.",
      cost: 2,
      minLevel: 4
    },
    {
      id: "barter",
      branch: "Przetrwanie",
      name: "Handlarz",
      desc: "Ceny u NPC spadaja o 20%.",
      cost: 1,
      minLevel: 3
    },
    {
      id: "roofRunner",
      branch: "Parkour",
      name: "Bieg po dachach",
      desc: "Jeszcze szybszy ruch w Starym Miescie.",
      cost: 2,
      minLevel: 6
    }
  ];

  const ZONES = [
    { id: "city", name: "Dolne Miasto", x: 420, y: 620, w: 5200, h: 3600, color: "#64736b" },
    { id: "oldtown", name: "Stare Miasto", x: 6900, y: 780, w: 5200, h: 4200, color: "#75695f" },
    { id: "forest", name: "Las", x: 12600, y: 320, w: 6200, h: 5600, color: "#2f6b43" },
    { id: "industrial", name: "Strefa przemyslowa", x: 2400, y: 6100, w: 5900, h: 4200, color: "#5d5f5a" },
    { id: "flooded", name: "Zalane przedmiescia", x: 11200, y: 6900, w: 6200, h: 4200, color: "#315d66" },
    { id: "dark", name: "Dark zone: Szpital", x: 2200, y: 410, w: 1300, h: 860, color: "#4b3a6d" },
    { id: "dark2", name: "Dark zone: Metro", x: 4960, y: 2440, w: 1100, h: 900, color: "#4b3a6d" },
    { id: "dark3", name: "Dark zone: Katedra", x: 9200, y: 1660, w: 1260, h: 960, color: "#4b3a6d" },
    { id: "dark4", name: "Dark zone: Laboratorium", x: 14200, y: 7560, w: 1300, h: 1040, color: "#4b3a6d" },
    { id: "convoy", name: "Konwoj", x: 3420, y: 2600, w: 1220, h: 560, color: "#8a6b2d" },
    { id: "convoy2", name: "Konwoj Barona", x: 10300, y: 6200, w: 1540, h: 650, color: "#8a6b2d" },
    { id: "treasure", name: "Stara mapa", x: 5750, y: 760, w: 880, h: 620, color: "#806c31" },
    { id: "baron", name: "Baza Barona", x: 17400, y: 8200, w: 2600, h: 2600, color: "#713d34" },
    { id: "safe", name: "Wieza UV", x: 780, y: 1990, w: 620, h: 500, color: "#5eaed1", safe: true, theme: "wieza" },
    { id: "safe2", name: "Dach Starego Miasta", x: 7820, y: 1100, w: 700, h: 520, color: "#5eaed1", safe: true, theme: "dach" },
    { id: "safe3", name: "Stacja benzynowa", x: 3840, y: 7400, w: 760, h: 560, color: "#5eaed1", safe: true, theme: "stacja" },
    { id: "safe4", name: "Lesny posterunek", x: 14600, y: 2380, w: 760, h: 600, color: "#5eaed1", safe: true, theme: "las" },
    { id: "safe5", name: "Latarnia przy tamie", x: 12900, y: 9000, w: 820, h: 620, color: "#5eaed1", safe: true, theme: "tama" }
  ];

  const SAFE_ZONE_IDS = ZONES.filter((zone) => zone.safe).map((zone) => zone.id);

  const MISSIONS = [
    { id: "m01", title: "Radio Olive", desc: "Dotrzyj do panelu pierwszej safe zone.", target: { x: 1090, y: 2235 }, reward: { xp: 40, coins: 12 } },
    { id: "m02", title: "Latarnie UV", desc: "Odblokuj Wieze UV.", target: { zone: "safe" }, requiresSafe: "safe", reward: { xp: 80, coins: 25, blueprint: "medkit" } },
    { id: "m03", title: "Pierwszy skok", desc: "Wejdz do bloku i przeszukaj drugie pietro.", target: { x: 8600, y: 1420 }, interior: true, reward: { xp: 85, coins: 18 } },
    { id: "m04", title: "Schemat siekiery", desc: "Odnajdz schemat w Starym Miescie.", target: { x: 9340, y: 1820 }, reward: { xp: 100, coins: 28, blueprint: "axe" } },
    { id: "m05", title: "Szybkie zombiaki", desc: "Zabij 3 szybkie zombie po zmroku.", target: { x: 10040, y: 2460 }, killType: "fast", killCount: 3, reward: { xp: 120, coins: 30 } },
    { id: "m06", title: "Konwoj", desc: "Przeszukaj skrzynie konwoju.", target: { x: 3970, y: 2870 }, reward: { xp: 130, coins: 35, blueprint: "grenadeCraft" } },
    { id: "m07", title: "Notatka Barona I", desc: "Znajdz notatke o ludziach Barona.", target: { x: 5260, y: 2820 }, note: "baron-1", reward: { xp: 90, coins: 20 } },
    { id: "m08", title: "Dach Starego Miasta", desc: "Odblokuj safe zone na dachu.", target: { zone: "safe2" }, requiresSafe: "safe2", reward: { xp: 150, coins: 40 } },
    { id: "m09", title: "Handlarz", desc: "Kup dowolny przedmiot u NPC.", target: { zone: "safe2" }, buyAny: true, reward: { xp: 70, coins: 18 } },
    { id: "m10", title: "Pistolet i amunicja", desc: "Zdobadz pistolet i 12 sztuk amunicji.", target: { x: 10480, y: 6260 }, reward: { xp: 140, coins: 30, blueprint: "pistol" } },
    { id: "m11", title: "Boss: Rzeznik", desc: "Pokonaj pierwszego bossa przy konwoju Barona.", target: { x: 11020, y: 6500 }, boss: "butcher", reward: { xp: 230, coins: 80 } },
    { id: "m12", title: "Stacja benzynowa", desc: "Odpal safe zone w strefie przemyslowej.", target: { zone: "safe3" }, requiresSafe: "safe3", reward: { xp: 170, coins: 45 } },
    { id: "m13", title: "Toksyczny schemat", desc: "Zbierz schemat toxic w laboratorium.", target: { x: 14680, y: 7900 }, note: "baron-2", reward: { xp: 160, coins: 42, blueprint: "toxicMod" } },
    { id: "m14", title: "Eksplodujace", desc: "Przetrwaj starcie z 4 wybuchowymi zombie.", target: { x: 15100, y: 8100 }, killType: "exploder", killCount: 4, reward: { xp: 180, coins: 55 } },
    { id: "m15", title: "Lesny posterunek", desc: "Odblokuj safe zone w lesie.", target: { zone: "safe4" }, requiresSafe: "safe4", reward: { xp: 190, coins: 50 } },
    { id: "m16", title: "Luk", desc: "Odnajdz luk i strzaly w chatce lowcy.", target: { x: 15120, y: 2740 }, reward: { xp: 150, coins: 45, blueprint: "bow" } },
    { id: "m17", title: "Boss: Krzykacz", desc: "Pokonaj nocnego bossa w lesie.", target: { x: 16280, y: 3680 }, boss: "howler", reward: { xp: 260, coins: 90 } },
    { id: "m18", title: "Latarnia przy tamie", desc: "Uruchom ostatnia safe zone.", target: { zone: "safe5" }, requiresSafe: "safe5", reward: { xp: 220, coins: 70 } },
    { id: "m19", title: "Baza Barona", desc: "Wejdz do bazy i zbierz finalne notatki.", target: { x: 18480, y: 9100 }, note: "baron-3", reward: { xp: 240, coins: 90 } },
    { id: "m20", title: "Tryb bestii", desc: "Pokonaj Barona i uciekaj przed nocnymi.", target: { x: 19100, y: 9500 }, boss: "baron", reward: { xp: 500, coins: 180 } }
  ];

  const NOTE_POOL = [
    { id: "baron-1", title: "Notatka Barona I", text: "Baron skupuje akumulatory UV i zostawia ulice ciemne." },
    { id: "baron-2", title: "Laboratorium", text: "Chemicy Barona testuja toksyczne naboje na zarazonych." },
    { id: "baron-3", title: "Rozkaz", text: "Jesli Crane dotrze do tamy, wypuscic bestie." },
    { id: "craft-sound", title: "Dziennik rzemieslnika", text: "Metal brzmi inaczej, gdy jest gotowy na mod elektryczny." },
    { id: "olive-1", title: "Olive", text: "Nie kazda safe zone jest domem, ale kazda daje oddech." }
  ];

  let state = null;
  let lastTime = performance.now();
  let toastTimer = 0;
  let subtitleTimer = 0;
  let renderHudTimer = 0;
  let saveIndicatorTimer = 0;
  let musicStarted = false;
  let menuImageTimer = 0;
  const online = {
    socket: null,
    connected: false,
    lobby: null,
    playerId: null,
    peers: new Map()
  };

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

  function createWeapon(id, mod = null) {
    const def = WEAPON_DEFS[id] || WEAPON_DEFS.pipe;
    return {
      id: `${id}-${Math.floor(Math.random() * 999999)}`,
      defId: id,
      name: def.name,
      type: def.type,
      damage: def.damage,
      range: def.range,
      ammo: def.ammo || null,
      durability: def.maxDurability,
      maxDurability: def.maxDurability,
      mod
    };
  }

  function difficulty() {
    return DIFFICULTIES[options.difficulty] || DIFFICULTIES.normal;
  }

  function createWorld() {
    const rand = seededRandom(312991);
    const roads = [
      { x: 0, y: 2100, w: WORLD.width, h: 170, type: "highway" },
      { x: 0, y: 6500, w: WORLD.width, h: 180, type: "highway" },
      { x: 0, y: 9800, w: WORLD.width, h: 150, type: "highway" },
      { x: 2320, y: 0, w: 150, h: WORLD.height, type: "avenue" },
      { x: 4050, y: 0, w: 120, h: WORLD.height, type: "forest-road" },
      { x: 8200, y: 0, w: 150, h: WORLD.height, type: "avenue" },
      { x: 12100, y: 0, w: 130, h: WORLD.height, type: "avenue" },
      { x: 17100, y: 0, w: 140, h: WORLD.height, type: "avenue" },
      { x: 700, y: 900, w: 3550, h: 120, type: "street" },
      { x: 1180, y: 3080, w: 4550, h: 130, type: "street" },
      { x: 7200, y: 1300, w: 4200, h: 110, type: "street" },
      { x: 7050, y: 3460, w: 4800, h: 120, type: "street" },
      { x: 13700, y: 2700, w: 3700, h: 90, type: "trail" },
      { x: 12600, y: 9100, w: 5200, h: 110, type: "street" },
      { x: 17300, y: 8450, w: 2700, h: 120, type: "street" },
      { x: 5200, y: 620, w: 105, h: 2400, type: "trail" },
      { x: 540, y: 1380, w: 3000, h: 90, type: "street" }
    ];

    const buildings = [];
    const urbanIds = ["city", "oldtown", "industrial", "flooded"];
    for (let i = 0; i < 190; i += 1) {
      const w = 120 + rand() * 280;
      const h = 100 + rand() * 240;
      const urban = zoneById(urbanIds[Math.floor(rand() * urbanIds.length)]);
      const x = urban.x + 120 + rand() * Math.max(1, urban.w - 360);
      const y = urban.y + 120 + rand() * Math.max(1, urban.h - 360);
      const rect = {
        id: `building-${i}`,
        x,
        y,
        w,
        h,
        kind: rand() > 0.74 ? "shop" : rand() > 0.52 ? "house" : "block",
        floors: rand() > 0.55 ? 2 : 1,
        searched: [false, false],
        seed: rand() * 9999
      };
      if (!roads.some((road) => rectOverlap(inflate(rect, 32), road)) && !ZONES.some((zone) => zone.safe && rectOverlap(rect, zone))) {
        buildings.push(rect);
      }
    }

    const trees = [];
    for (let i = 0; i < 520; i += 1) {
      const inForest = rand() > 0.22;
      const forest = zoneById(rand() > 0.5 ? "forest" : "flooded");
      trees.push({
        x: inForest ? forest.x + rand() * forest.w : 500 + rand() * (WORLD.width - 1000),
        y: inForest ? forest.y + rand() * forest.h : 320 + rand() * (WORLD.height - 700),
        r: 22 + rand() * 28,
        sway: rand() * TAU,
        color: rand() > 0.5 ? "#235b34" : "#2f7445"
      });
    }

    const grass = [];
    for (let i = 0; i < 2400; i += 1) {
      const forestBias = rand() > 0.36;
      const forest = zoneById(rand() > 0.5 ? "forest" : "flooded");
      grass.push({
        x: forestBias ? forest.x + rand() * forest.w : rand() * WORLD.width,
        y: forestBias ? forest.y + rand() * forest.h : rand() * WORLD.height,
        h: 8 + rand() * 20,
        sway: rand() * TAU
      });
    }

    const debris = [];
    for (let i = 0; i < 700; i += 1) {
      debris.push({
        x: rand() * WORLD.width,
        y: rand() * WORLD.height,
        r: 2 + rand() * 9,
        kind: rand() > 0.55 ? "paper" : "stone",
        rot: rand() * TAU
      });
    }

    const cars = [];
    for (let i = 0; i < 120; i += 1) {
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
    for (let i = 0; i < 12; i += 1) {
      cars.push({
        id: `baron-convoy-${i}`,
        x: 10380 + i * 125,
        y: 6410 + Math.sin(i) * 55,
        w: i % 4 === 0 ? 130 : 82,
        h: i % 4 === 0 ? 52 : 40,
        rot: 0.08 * Math.sin(i),
        color: i % 4 === 0 ? "#221c18" : "#7f4a37",
        looted: false,
        convoy: true
      });
    }

    const lamps = [];
    ZONES.filter((zone) => zone.safe).forEach((zone) => {
      lamps.push(
        { id: `${zone.id}-lamp-a`, zoneId: zone.id, x: zone.x + 90, y: zone.y + 90, on: false },
        { id: `${zone.id}-lamp-b`, zoneId: zone.id, x: zone.x + zone.w - 130, y: zone.y + 110, on: false },
        { id: `${zone.id}-lamp-c`, zoneId: zone.id, x: zone.x + 120, y: zone.y + zone.h - 90, on: false },
        { id: `${zone.id}-lamp-d`, zoneId: zone.id, x: zone.x + zone.w - 160, y: zone.y + zone.h - 120, on: false }
      );
    });

    const crates = [
      { id: "treasure-a", x: 6020, y: 980, looted: false, label: "skrzynia mapy" },
      { id: "dark-cache-a", x: 2550, y: 760, looted: false, label: "skrytka dark zone" },
      { id: "dark-cache-b", x: 5320, y: 2780, looted: false, label: "skrytka dark zone" },
      { id: "convoy-cache", x: 3970, y: 2870, looted: false, label: "skrzynia konwoju", blueprint: "grenadeCraft" },
      { id: "oldtown-blueprint", x: 9340, y: 1820, looted: false, label: "schemat siekiery", blueprint: "axe" },
      { id: "pistol-cache", x: 10480, y: 6260, looted: false, label: "skrzynia pistoletu", blueprint: "pistol" },
      { id: "toxic-cache", x: 14680, y: 7900, looted: false, label: "schemat toxic", blueprint: "toxicMod", note: "baron-2" },
      { id: "hunter-cache", x: 15120, y: 2740, looted: false, label: "skrytka lowcy", blueprint: "bow" },
      { id: "baron-notes", x: 18480, y: 9100, looted: false, label: "notatki Barona", note: "baron-3" }
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
        repairKit: 0,
        ammo9: 6,
        arrow: 4,
        grenade: 1,
        coins: 20,
        fireGel: 0,
        toxicVial: 0,
        capacitor: 0,
        cloth: 2,
        metalParts: 2
      },
      blueprints: { medkit: true, repairKit: true, uvBattery: true, arrowBundle: true },
      notes: ["olive-1"],
      shopUnlocks: {},
      outfit: "survivor",
      weapons: [createWeapon("fists"), createWeapon("pipe")],
      activeWeapon: 1,
      facing: 0,
      attackCooldown: 0,
      shootCooldown: 0,
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
      safeZones: Object.fromEntries(SAFE_ZONE_IDS.map((id) => [id, id === "safe" ? false : false])),
      currentMission: 0,
      missionProgress: {},
      waypoint: { x: MISSIONS[0].target.x, y: MISSIONS[0].target.y, label: MISSIONS[0].title },
      indoor: null,
      bosses: createBosses(),
      projectiles: [],
      account: null,
      onlineEnabled: false,
      quest: MISSIONS[0].desc,
      startedAt: Date.now()
    };
  }

  function createBosses() {
    return [
      { id: "butcher", name: "Rzeznik Barona", x: 11020, y: 6500, r: 30, hp: 420, maxHp: 420, damage: 18, speed: 68, active: false, dead: false },
      { id: "howler", name: "Krzykacz", x: 16280, y: 3680, r: 32, hp: 520, maxHp: 520, damage: 22, speed: 92, active: false, dead: false },
      { id: "baron", name: "Baron", x: 19100, y: 9500, r: 34, hp: 760, maxHp: 760, damage: 26, speed: 82, active: false, dead: false }
    ].map((boss) => {
      boss.hp *= difficulty().bossHp;
      boss.maxHp = boss.hp;
      return boss;
    });
  }

  function createZombies() {
    const rand = seededRandom(88031);
    const zombies = [];
    const spawnAreas = [
      { x: 520, y: 600, w: 5200, h: 3600, count: 70, type: "walker" },
      { x: 6900, y: 780, w: 5200, h: 4200, count: 78, type: "fast" },
      { x: 2200, y: 410, w: 1300, h: 860, count: 22, type: "dark" },
      { x: 9200, y: 1660, w: 1260, h: 960, count: 25, type: "dark" },
      { x: 12600, y: 360, w: 6200, h: 5600, count: 72, type: "forest" },
      { x: 3420, y: 2600, w: 1220, h: 560, count: 22, type: "convoy" },
      { x: 10300, y: 6200, w: 1540, h: 650, count: 32, type: "baron" },
      { x: 14200, y: 7560, w: 1300, h: 1040, count: 24, type: "exploder" },
      { x: 17400, y: 8200, w: 2600, h: 2600, count: 46, type: "gunman" }
    ];

    let id = 0;
    spawnAreas.forEach((area) => {
      for (let i = 0; i < area.count; i += 1) {
        const fast = area.type === "dark" || area.type === "fast" || (area.type === "forest" && rand() > 0.72);
        const explosive = area.type === "exploder" && rand() > 0.28;
        const human = area.type === "baron" || area.type === "gunman";
        const baseHp = human ? 85 : explosive ? 44 : fast ? 55 : 70;
        zombies.push({
          id: `z-${id}`,
          x: area.x + rand() * area.w,
          y: area.y + rand() * area.h,
          homeX: area.x + rand() * area.w,
          homeY: area.y + rand() * area.h,
          r: human ? 17 : fast ? 16 : 18,
          hp: baseHp * difficulty().zombieHp,
          maxHp: baseHp * difficulty().zombieHp,
          speed: human ? 66 : explosive ? 64 : fast ? 92 : 48,
          type: human ? area.type : explosive ? "exploder" : fast ? "volatile" : area.type,
          ranged: area.type === "gunman",
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

  function safeZoneAt(point = state.player, padding = 0) {
    return ZONES.find((zone) => zone.safe && point.x >= zone.x - padding && point.x <= zone.x + zone.w + padding && point.y >= zone.y - padding && point.y <= zone.y + zone.h + padding);
  }

  function isSafeUnlocked(id) {
    return Boolean(state?.safeZones?.[id]);
  }

  function safeZoneCost(zoneId) {
    const base = zoneId === "safe" ? { scrap: 8, wire: 4, battery: 2 } : { scrap: 12, wire: 5, battery: 3, metalParts: 2 };
    if (state?.player?.skills.safeEngineer) {
      return Object.fromEntries(Object.entries(base).map(([id, amount]) => [id, Math.max(1, Math.ceil(amount * 0.72))]));
    }
    return base;
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
    return ["dark", "dark2", "dark3", "dark4"].some((id) => {
      const z = zoneById(id);
      return point.x >= z.x && point.x <= z.x + z.w && point.y >= z.y && point.y <= z.y + z.h;
    });
  }

  function getWeapon() {
    const weapon = state.player.weapons[state.player.activeWeapon] || state.player.weapons[0];
    if (weapon && !weapon.defId) {
      weapon.defId = weapon.id === "pipe" ? "pipe" : weapon.defId || "pipe";
      weapon.type = weapon.type || "melee";
      weapon.range = weapon.range || WEAPON_DEFS[weapon.defId]?.range || 82;
    }
    return weapon;
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
      version: SAVE_VERSION,
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
        blueprints: state.player.blueprints,
        notes: state.player.notes,
        shopUnlocks: state.player.shopUnlocks,
        outfit: state.player.outfit,
        weapons: state.player.weapons,
        activeWeapon: state.player.activeWeapon,
        flashlight: state.player.flashlight,
        uvLight: state.player.uvLight
      },
      time: state.time,
      day: state.day,
      safeZoneUnlocked: state.safeZoneUnlocked,
      safeZones: state.safeZones,
      currentMission: state.currentMission,
      missionProgress: state.missionProgress,
      waypoint: state.waypoint,
      cars: state.world.cars.map((car) => ({ id: car.id, looted: car.looted })),
      crates: state.world.crates.map((crate) => ({ id: crate.id, looted: crate.looted })),
      zombies: state.zombies.map((zombie) => ({ id: zombie.id, dead: zombie.dead, looted: zombie.looted, hp: zombie.hp })),
      bosses: state.bosses.map((boss) => ({ id: boss.id, dead: boss.dead, hp: boss.hp })),
      savedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      updateContinueButton();
      showSaveIndicator();
      if (showMessage) toast("Gra zapisana.");
    } catch (error) {
      console.error(error);
      toast("Nie udalo sie zapisac gry. LocalStorage jest pelny albo zablokowany.");
    }
  }

  function loadSavedGame() {
    const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(LEGACY_SAVE_KEY);
    if (!raw) return false;
    try {
      const payload = JSON.parse(raw);
      state = createGameState();
      Object.assign(state.player, payload.player || {});
      migratePlayerShape(state.player);
      state.time = payload.time ?? state.time;
      state.day = payload.day ?? state.day;
      state.safeZoneUnlocked = Boolean(payload.safeZoneUnlocked);
      state.safeZones = { ...state.safeZones, ...(payload.safeZones || {}) };
      if (state.safeZoneUnlocked) state.safeZones.safe = true;
      state.currentMission = payload.currentMission ?? state.currentMission;
      state.missionProgress = payload.missionProgress || state.missionProgress;
      state.waypoint = payload.waypoint || missionWaypoint(currentMission());
      state.world.lamps.forEach((lamp) => {
        lamp.on = Boolean(state.safeZones[lamp.zoneId || "safe"]);
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
      const bossMap = new Map((payload.bosses || []).map((boss) => [boss.id, boss]));
      state.bosses.forEach((boss) => {
        const saved = bossMap.get(boss.id);
        if (saved) {
          boss.dead = Boolean(saved.dead);
          boss.hp = saved.hp ?? boss.hp;
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

  function migratePlayerShape(player) {
    const defaultInventory = {
      scrap: 6, wire: 2, gauze: 2, alcohol: 1, battery: 1, chemicals: 1, infectedTissue: 0,
      medkit: 1, uvBattery: 1, repairKit: 0, ammo9: 6, arrow: 4, grenade: 1, coins: 20,
      fireGel: 0, toxicVial: 0, capacitor: 0, cloth: 2, metalParts: 2
    };
    player.inventory = { ...defaultInventory, ...(player.inventory || {}) };
    player.blueprints = { medkit: true, repairKit: true, uvBattery: true, arrowBundle: true, ...(player.blueprints || {}) };
    player.notes = Array.isArray(player.notes) ? player.notes : ["olive-1"];
    player.shopUnlocks = player.shopUnlocks || {};
    player.outfit = player.outfit || "survivor";
    player.weapons = Array.isArray(player.weapons) && player.weapons.length ? player.weapons : [createWeapon("fists"), createWeapon("pipe")];
    player.weapons = player.weapons.map((weapon) => {
      if (weapon.defId) return weapon;
      const defId = weapon.id === "pipe" ? "pipe" : "pipe";
      return { ...createWeapon(defId), ...weapon, defId, type: weapon.type || "melee", range: weapon.range || WEAPON_DEFS[defId].range };
    });
  }

  function currentMission() {
    return MISSIONS[clamp(state?.currentMission || 0, 0, MISSIONS.length - 1)];
  }

  function missionWaypoint(mission) {
    if (!mission) return null;
    if (mission.target?.zone) {
      const zone = zoneById(mission.target.zone);
      return { x: zone.x + zone.w / 2, y: zone.y + zone.h / 2, label: mission.title };
    }
    if (mission.target?.x) return { x: mission.target.x, y: mission.target.y, label: mission.title };
    return null;
  }

  function updateContinueButton() {
    ui.continueBtn.disabled = !(localStorage.getItem(SAVE_KEY) || localStorage.getItem(LEGACY_SAVE_KEY));
  }

  function newGame() {
    state = createGameState();
    showLoading("Nowa gra", "Mapa 3x, misje i zombie sa przygotowywane.");
    enterGame();
    speak("Olive", "Kyle, slyszysz mnie? Safe zone jest ciemna. Znajdz przewody, baterie i uruchom latarnie UV.");
    toast(`Cel: ${currentMission().desc}`);
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
    if (!options.music || musicStarted) return;
    ui.music.play().then(() => {
      musicStarted = true;
    }).catch(() => {
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
    ui.accountPanel.classList.add("hidden");
    ui.onlinePanel.classList.add("hidden");
    ui.updatesPanel.classList.add("hidden");
    ui.pausePanel.classList.add("hidden");
    ui.inventoryPanel.classList.add("hidden");
    if (resume && state?.scene === "game") setPaused(false);
  }

  function showLoading(title, tip) {
    ui.loadingTip.textContent = tip;
    document.getElementById("loadingTitle").textContent = title;
    ui.loadingBar.style.width = "18%";
    ui.loadingScreen.classList.remove("hidden");
    setTimeout(() => {
      ui.loadingBar.style.width = "100%";
    }, 30);
    setTimeout(() => {
      ui.loadingScreen.classList.add("hidden");
      ui.loadingBar.style.width = "0";
    }, 450);
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
    if (action === "weapons") openInventory("weapons");
    if (action === "map") openInventory("map");
    if (action === "medkit") useMedkit();
    if (action === "repair") repairWeapon();
    if (action === "shoot") shootWeapon();
    if (action === "grenade") throwGrenade();
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
    const axeBoss = weapon.defId === "axe" && player.skills.axeMaster ? 1.28 : 1;
    const beastPower = player.beastActive ? 2.45 : 1;
    const range = player.beastActive ? (player.skills.beastUpgrade1 ? 148 : 120) : (weapon.range || 82);
    let hit = false;

    state.zombies.forEach((zombie) => {
      if (zombie.dead) return;
      const d = distance(player, zombie);
      const facing = Math.abs(normalizeAngle(angleTo(player, zombie) - player.facing));
      if (d <= range && facing < Math.PI * 0.78) {
        const damage = weapon.damage * powerSkill * beastPower * axeBoss;
        zombie.hp -= damage;
        applyElementDamage(zombie, weapon.mod);
        zombie.stun = 0.2;
        hit = true;
        addFloatingText(zombie.x, zombie.y - 22, `-${Math.round(damage)}`, "#ffcc6a");
        spawnParticles(zombie.x, zombie.y, "#5e1612", 8);
        if (zombie.hp <= 0) killZombie(zombie);
      }
    });

    state.bosses.forEach((boss) => {
      if (boss.dead) return;
      const d = distance(player, boss);
      const facing = Math.abs(normalizeAngle(angleTo(player, boss) - player.facing));
      if (d <= range + boss.r && facing < Math.PI * 0.78) {
        const damage = weapon.damage * powerSkill * beastPower * axeBoss;
        boss.hp -= damage;
        hit = true;
        boss.active = true;
        addFloatingText(boss.x, boss.y - 36, `-${Math.round(damage)}`, "#ff8b3d");
        spawnParticles(boss.x, boss.y, weapon.mod ? ELEMENT_MODS[weapon.mod].color : "#5e1612", 10);
        if (boss.hp <= 0) killBoss(boss);
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
    trackKill(zombie.type);
  }

  function killBoss(boss) {
    boss.dead = true;
    boss.active = false;
    addXp(160);
    addItem(state.player.inventory, "coins", 70);
    addFloatingText(boss.x, boss.y - 54, "BOSS DOWN", "#ffbd5b", 1.6);
    speak("Olive", `${boss.name} padl. Baron to poczuje.`);
    completeBossMission(boss.id);
  }

  function applyElementDamage(target, mod) {
    if (!mod || !ELEMENT_MODS[mod]) return;
    const bonus = state.player.skills.elementalHands ? 12 : 7;
    target.hp -= bonus;
    if (mod === "electric") target.stun = Math.max(target.stun || 0, 0.55);
    if (mod === "toxic") target.speed *= 0.995;
  }

  function shootWeapon() {
    if (!state || state.paused || state.player.shootCooldown > 0 || state.gameOver) return;
    const player = state.player;
    const weapon = getWeapon();
    if (!weapon || weapon.type !== "ranged") {
      toast("Wybierz luk albo pistolet w zakladce Bronie.");
      return;
    }
    if ((player.inventory[weapon.ammo] || 0) <= 0) {
      toast(`Brak amunicji: ${MATERIAL_NAMES[weapon.ammo]}.`);
      return;
    }
    player.inventory[weapon.ammo] -= 1;
    player.shootCooldown = weapon.defId === "pistol" ? 0.42 : 0.75;
    weapon.durability = clamp(weapon.durability - (player.skills.pistolControl ? 1 : 2), 0, weapon.maxDurability);
    const target = nearestHostileInCone(weapon.range || 520);
    if (target) {
      target.hp -= weapon.damage * (weapon.defId === "bow" && player.skills.bowSilence ? 1.1 : 1);
      applyElementDamage(target, weapon.mod);
      spawnParticles(target.x, target.y, weapon.defId === "pistol" ? "#ffd068" : "#caa36a", 5);
      addFloatingText(target.x, target.y - 24, `-${Math.round(weapon.damage)}`, "#ffd068");
      if ("dead" in target && target.hp <= 0) killZombie(target);
      if ("active" in target && target.hp <= 0) killBoss(target);
    }
    if (weapon.defId === "pistol" && !player.skills.bowSilence) attractNoise(player.x, player.y, 720);
    camera.shake = weapon.defId === "pistol" ? 8 : 2;
    renderInventoryPanels();
  }

  function throwGrenade() {
    if (!state || state.paused || state.gameOver) return;
    const player = state.player;
    if ((player.inventory.grenade || 0) <= 0) {
      toast("Brak granatow.");
      return;
    }
    player.inventory.grenade -= 1;
    const range = player.skills.grenadier ? 250 : 190;
    const gx = player.x + Math.cos(player.facing) * 130;
    const gy = player.y + Math.sin(player.facing) * 130;
    explodeAt(gx, gy, range, player.skills.grenadier ? 110 : 82);
    attractNoise(gx, gy, 900);
    camera.shake = 14;
    renderInventoryPanels();
  }

  function nearestHostileInCone(range) {
    const player = state.player;
    const candidates = [
      ...state.zombies.filter((zombie) => !zombie.dead),
      ...state.bosses.filter((boss) => !boss.dead)
    ];
    return candidates
      .filter((target) => distance(player, target) <= range && Math.abs(normalizeAngle(angleTo(player, target) - player.facing)) < Math.PI * 0.24)
      .sort((a, b) => distance(player, a) - distance(player, b))[0];
  }

  function explodeAt(x, y, radius, damage) {
    spawnParticles(x, y, "#ff9d42", 32);
    state.zombies.forEach((zombie) => {
      if (zombie.dead || distance({ x, y }, zombie) > radius) return;
      zombie.hp -= damage;
      zombie.stun = 0.6;
      if (zombie.hp <= 0) killZombie(zombie);
    });
    state.bosses.forEach((boss) => {
      if (boss.dead || distance({ x, y }, boss) > radius + boss.r) return;
      boss.hp -= damage * 0.75;
      boss.active = true;
      if (boss.hp <= 0) killBoss(boss);
    });
  }

  function attractNoise(x, y, radius) {
    state.zombies.forEach((zombie) => {
      if (!zombie.dead && distance({ x, y }, zombie) < radius) {
        zombie.homeX = x;
        zombie.homeY = y;
      }
    });
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

    const nearSafe = safeZoneAt(p, 0);
    const nearSafePanel = nearSafe && p.x > nearSafe.x + nearSafe.w * 0.28 && p.x < nearSafe.x + nearSafe.w * 0.74 && p.y > nearSafe.y + nearSafe.h * 0.24 && p.y < nearSafe.y + nearSafe.h * 0.72;
    if (nearSafe && !isSafeUnlocked(nearSafe.id) && nearSafePanel) {
      const cost = safeZoneCost(nearSafe.id);
      if (consumeItems(p.inventory, cost)) {
        state.safeZones[nearSafe.id] = true;
        state.safeZoneUnlocked = state.safeZones.safe;
        state.world.lamps.forEach((lamp) => {
          if (lamp.zoneId === nearSafe.id) lamp.on = true;
        });
        addXp(70 + SAFE_ZONE_IDS.indexOf(nearSafe.id) * 25);
        speak("Olive", `${nearSafe.name} dziala. Masz lozko, stash, handlarza i UV.`);
        toast(`${nearSafe.name} odblokowana.`);
        completeSafeMission(nearSafe.id);
        return;
      }
      toast(`${nearSafe.name} wymaga: ${formatCost(cost)}.`);
      return;
    }

    if (nearSafe && isSafeUnlocked(nearSafe.id) && nearSafePanel) {
      openInventory("shop");
      toast("Safe zone: stash, stroje, handlarz i lozko.");
      return;
    }

    const dead = state.zombies.find((zombie) => zombie.dead && !zombie.looted && distance(p, zombie) < 68);
    if (dead) {
      dead.looted = true;
      const bonus = p.skills.quietSearch ? 1 : 0;
      const found = {
        scrap: Math.max(1, Math.floor((1 + Math.random() * (2 + bonus)) * difficulty().loot)),
        infectedTissue: 1,
        gauze: Math.random() > 0.55 ? 1 : 0,
        chemicals: Math.random() > 0.7 ? 1 : 0,
        coins: Math.random() > 0.5 ? 1 + Math.floor(Math.random() * 3) : 0,
        toxicVial: dead.type === "exploder" ? 1 : 0
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
        alcohol: Math.random() > 0.82 ? 1 : 0,
        ammo9: Math.random() > 0.72 ? 4 : 0,
        metalParts: Math.random() > 0.5 ? 1 : 0,
        coins: car.convoy ? 8 : 2
      }, car.convoy ? "Konwoj przeszukany" : "Auto przeszukane");
      if (car.convoy) completeMissionIf("m06");
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
        repairKit: 1,
        fireGel: Math.random() > 0.5 ? 1 : 0,
        capacitor: Math.random() > 0.55 ? 1 : 0,
        coins: 10
      }, `Otwarta ${crate.label}`);
      if (crate.blueprint) unlockBlueprint(crate.blueprint);
      if (crate.note) unlockNote(crate.note);
      addXp(45);
      return;
    }

    const building = state.world.buildings.find((house) => distance(p, { x: house.x + house.w / 2, y: house.y + house.h / 2 }) < Math.max(house.w, house.h) * 0.55);
    if (building) {
      enterBuilding(building);
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

  function unlockBlueprint(id) {
    if (!id) return;
    state.player.blueprints[id] = true;
    toast(`Nowy schemat: ${recipeName(id)}`);
    completeBlueprintMission(id);
  }

  function unlockNote(id) {
    if (!id || state.player.notes.includes(id)) return;
    state.player.notes.push(id);
    const note = NOTE_POOL.find((entry) => entry.id === id);
    toast(`Nowa notatka: ${note?.title || id}`);
    completeNoteMission(id);
  }

  function recipeName(id) {
    return RECIPES.find((recipe) => recipe.id === id)?.name || WEAPON_DEFS[id]?.name || id;
  }

  function enterBuilding(building) {
    const floor = building.searched[0] ? 1 : 0;
    if (building.searched[floor]) {
      toast("Ten budynek jest juz przeszukany.");
      return;
    }
    building.searched[floor] = true;
    state.indoor = { buildingId: building.id, floor: floor + 1, timer: 10 };
    collectLoot({
      scrap: 2,
      cloth: 1,
      wire: Math.random() > 0.45 ? 1 : 0,
      coins: 3 + Math.floor(Math.random() * 8),
      ammo9: Math.random() > 0.6 ? 3 : 0,
      arrow: Math.random() > 0.5 ? 3 : 0
    }, `${building.kind === "block" ? "Blok" : "Dom"} pietro ${floor + 1}`);
    if (building.floors > 1 && floor === 0) {
      toast("Mini mapa pokazuje wnetrze. Uzyj Szukaj jeszcze raz, aby sprawdzic drugie pietro.");
    }
    completeInteriorMission();
  }

  function skipDayNight() {
    if (!state) return;
    const safe = safeZoneAt(state.player);
    if (!safe || !isSafeUnlocked(safe.id)) {
      toast("Lozko dziala tylko w odblokowanej safe zone.");
      return;
    }
    state.time = isNight() ? 7.1 : 20.2;
    speak("Olive", isNight() ? "Przespales noc. Ulice sa spokojniejsze." : "Czekales do zmroku. Teraz wychodza gorsze rzeczy.");
    saveGame(false);
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

  function updateMissions() {
    const mission = currentMission();
    if (!mission || state.currentMission >= MISSIONS.length) return;
    const wp = missionWaypoint(mission);
    if (!state.waypoint || state.waypoint.label !== mission.title) state.waypoint = wp;

    if (mission.target?.x && distance(state.player, mission.target) < 92 && !mission.killType && !mission.boss && !mission.note) {
      completeCurrentMission();
    }
  }

  function completeCurrentMission() {
    const mission = currentMission();
    if (!mission || state.missionProgress[mission.id]?.done) return;
    state.missionProgress[mission.id] = { ...(state.missionProgress[mission.id] || {}), done: true };
    const reward = mission.reward || {};
    if (reward.xp) addXp(reward.xp);
    if (reward.coins) addItem(state.player.inventory, "coins", reward.coins);
    if (reward.blueprint) state.player.blueprints[reward.blueprint] = true;
    state.currentMission = clamp(state.currentMission + 1, 0, MISSIONS.length - 1);
    state.waypoint = missionWaypoint(currentMission());
    state.quest = currentMission()?.desc || "Wszystkie misje zakonczone.";
    speak("Olive", `Misja zakonczona: ${mission.title}. Nastepny cel: ${currentMission()?.title || "koniec"}.`);
    renderInventoryPanels();
    saveGame(false);
  }

  function completeMissionIf(id) {
    if (currentMission()?.id === id) completeCurrentMission();
  }

  function completeSafeMission(zoneId) {
    const mission = currentMission();
    if (mission?.requiresSafe === zoneId) completeCurrentMission();
  }

  function completeBlueprintMission(id) {
    const mission = currentMission();
    if (mission?.reward?.blueprint === id || mission?.title.toLowerCase().includes(recipeName(id).toLowerCase())) completeCurrentMission();
  }

  function completeNoteMission(id) {
    const mission = currentMission();
    if (mission?.note === id) completeCurrentMission();
  }

  function completeInteriorMission() {
    if (currentMission()?.interior) completeCurrentMission();
  }

  function trackKill(type) {
    const mission = currentMission();
    if (!mission?.killType) return;
    const normalized = type === "volatile" ? "fast" : type;
    if (normalized !== mission.killType) return;
    const progress = state.missionProgress[mission.id] || { kills: 0 };
    progress.kills = (progress.kills || 0) + 1;
    state.missionProgress[mission.id] = progress;
    toast(`${mission.title}: ${progress.kills}/${mission.killCount}`);
    if (progress.kills >= mission.killCount) completeCurrentMission();
  }

  function completeBossMission(id) {
    if (currentMission()?.boss === id) completeCurrentMission();
  }

  function xpForLevel(level) {
    return 80 + level * 42;
  }

  function craftRecipe(id) {
    if (!state) return;
    const recipe = RECIPES.find((entry) => entry.id === id);
    if (!recipe) return;
    if (!state.player.blueprints[id] && !["medkit", "repairKit", "uvBattery", "arrowBundle"].includes(id)) {
      toast("Najpierw znajdz schemat.");
      return;
    }
    if (!consumeItems(state.player.inventory, recipe.cost)) {
      toast("Brakuje materialow.");
      return;
    }
    recipe.craft(state);
    toast(`Wytworzono: ${recipe.name}`);
    renderInventoryPanels();
  }

  function applyWeaponMod(mod) {
    const weapon = getWeapon();
    if (!weapon || weapon.defId === "fists") {
      toast("Nie mozna ulepszyc piesci.");
      return;
    }
    weapon.mod = mod;
    weapon.name = `${WEAPON_DEFS[weapon.defId]?.name || weapon.name} + ${ELEMENT_MODS[mod].name}`;
    toast(`Bron ulepszona: ${ELEMENT_MODS[mod].name}.`);
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

  function equipWeapon(index) {
    if (!state.player.weapons[index]) return;
    state.player.activeWeapon = index;
    toast(`Wybrano: ${getWeapon().name}`);
    renderInventoryPanels();
  }

  function buyShopItem(id) {
    if (!state) return;
    const item = SHOP_ITEMS.find((entry) => entry.id === id);
    if (!item) return;
    const price = state.player.skills.barter ? Math.ceil(item.cost * 0.8) : item.cost;
    if ((state.player.inventory.coins || 0) < price) {
      toast("Za malo monet.");
      return;
    }
    state.player.inventory.coins -= price;
    if (item.kind === "weapon") {
      state.player.weapons.push(createWeapon(item.weapon));
    } else if (item.kind === "item") {
      addItem(state.player.inventory, item.item, item.amount);
    } else if (item.kind === "addon") {
      state.player.shopUnlocks[item.addon] = true;
    }
    if (currentMission()?.buyAny) completeCurrentMission();
    toast(`Kupiono: ${item.name}`);
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
    updateBosses(dt);
    updateProjectiles(dt);
    updateParticles(dt);
    updateCamera(dt);
    updateHud(dt);
    updateMissions(dt);
    sendOnlineState(dt);
    maybeOliveTalk(dt);
    autosaveTick(dt);
  }

  function updateTimers(dt) {
    toastTimer -= dt;
    subtitleTimer -= dt;
    saveIndicatorTimer -= dt;
    if (toastTimer <= 0) ui.toast.classList.add("hidden");
    if (subtitleTimer <= 0) ui.subtitle.classList.add("hidden");
    if (saveIndicatorTimer <= 0) ui.saveIndicator.classList.add("hidden");
  }

  function showSaveIndicator() {
    ui.saveIndicator.classList.remove("hidden");
    saveIndicatorTimer = 1.5;
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
    player.shootCooldown = Math.max(0, player.shootCooldown - dt);
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
      const beastGain = player.skills.beastUpgrade2 ? 1.8 : 1;
      player.beast = clamp(player.beast + dt * (isNight() ? 1.15 * beastGain : 0.45), 0, player.maxBeast);
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

    const safe = safeZoneAt(player);
    if (safe && isSafeUnlocked(safe.id)) {
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

      const safe = safeZoneAt(zombie, 120);
      const safeRepel = safe && isSafeUnlocked(safe.id);
      if (safeRepel) {
        const cx = safe.x + safe.w / 2;
        const cy = safe.y + safe.h / 2;
        targetX = zombie.x + (zombie.x - cx);
        targetY = zombie.y + (zombie.y - cy);
        zombie.hp -= dt * 8;
        if (zombie.hp <= 0) killZombie(zombie);
      }

      const uvHit = player.uvLight && player.uv > 0 && d < 230 && Math.abs(normalizeAngle(angleTo(player, zombie) - player.facing)) < Math.PI * 0.48;
      const lampHit = state.world.lamps.some((lamp) => lamp.on && distance(lamp, zombie) < 250);
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

      if (zombie.ranged && d < 520 && zombie.attackCooldown <= 0 && zombie.stun <= 0) {
        hurtPlayer(7 * difficulty().zombieDamage);
        zombie.attackCooldown = 1.8;
        spawnParticles(player.x, player.y, "#ffd068", 4);
      }

      if (zombie.type === "exploder" && d < 54 && zombie.attackCooldown <= 0) {
        explodeAt(zombie.x, zombie.y, 150, 55);
        zombie.dead = true;
        zombie.attackCooldown = 99;
        return;
      }

      if (d < player.r + zombie.r + 8 && zombie.attackCooldown <= 0 && zombie.stun <= 0) {
        hurtPlayer((zombie.type === "volatile" || night ? 14 : 8) * difficulty().zombieDamage);
        zombie.attackCooldown = zombie.type === "volatile" ? 0.55 : 0.8;
      }
    });
  }

  function updateBosses(dt) {
    const player = state.player;
    state.bosses.forEach((boss) => {
      if (boss.dead) return;
      const d = distance(boss, player);
      const mission = currentMission();
      if (mission?.boss === boss.id && d < 780) boss.active = true;
      if (!boss.active) return;
      const angle = angleTo(boss, player);
      boss.x += Math.cos(angle) * boss.speed * dt;
      boss.y += Math.sin(angle) * boss.speed * dt;
      boss.attackCooldown = Math.max(0, (boss.attackCooldown || 0) - dt);
      if (d < boss.r + player.r + 12 && boss.attackCooldown <= 0) {
        hurtPlayer(boss.damage * difficulty().zombieDamage);
        boss.attackCooldown = 0.9;
      }
      if (isSafeUnlocked(safeZoneAt(boss, 180)?.id)) {
        boss.hp -= dt * 18;
      }
      if (boss.hp <= 0) killBoss(boss);
    });
  }

  function updateProjectiles(dt) {
    state.projectiles = state.projectiles.filter((projectile) => {
      projectile.life -= dt;
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      return projectile.life > 0;
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
    ui.missionChip.textContent = `${state.currentMission + 1}/${MISSIONS.length} ${currentMission().title}`;
    updateCompass();
    updateBossHud();
    drawMiniMap();
  }

  function updateCompass() {
    if (!state.waypoint) {
      ui.compassChip.textContent = "N";
      return;
    }
    const angle = angleTo(state.player, state.waypoint);
    const dist = Math.round(distance(state.player, state.waypoint));
    const dirs = ["E", "SE", "S", "SW", "W", "NW", "N", "NE"];
    const idx = Math.round((((angle + TAU) % TAU) / TAU) * 8) % 8;
    ui.compassChip.textContent = `${dirs[idx]} ${dist}m`;
  }

  function updateBossHud() {
    const boss = state.bosses.find((entry) => entry.active && !entry.dead && distance(entry, state.player) < 900);
    if (!boss) {
      ui.bossHud.classList.add("hidden");
      return;
    }
    ui.bossHud.classList.remove("hidden");
    ui.bossName.textContent = boss.name;
    ui.bossHealthBar.style.width = `${clamp((boss.hp / boss.maxHp) * 100, 0, 100)}%`;
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
    if (!isSafeUnlocked("safe") && distance(state.player, { x: 1090, y: 2235 }) < 420) {
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
    ZONES.filter((zone) => zone.safe).forEach((safe) => {
      if (!inView(safe, view)) return;
      const unlocked = isSafeUnlocked(safe.id);
      ctx.strokeStyle = unlocked ? "rgba(146, 220, 255, 0.7)" : "rgba(255, 120, 80, 0.56)";
      ctx.lineWidth = 4;
      ctx.strokeRect(safe.x, safe.y, safe.w, safe.h);
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(safe.x + safe.w * 0.28, safe.y + safe.h * 0.24, safe.w * 0.46, safe.h * 0.48);
      ctx.fillStyle = unlocked ? "#9fd4ff" : "#ff7850";
      ctx.fillRect(safe.x + safe.w * 0.48, safe.y + safe.h * 0.45, 40, 36);
      ctx.fillStyle = "#f4f4ed";
      ctx.font = "14px sans-serif";
      ctx.fillText(unlocked ? `${safe.name} SAFE` : "NAPRAW UV", safe.x + 26, safe.y + 34);
      if (unlocked) {
        ctx.fillStyle = "rgba(182,246,92,0.5)";
        ctx.fillRect(safe.x + 38, safe.y + safe.h - 62, 90, 28);
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.fillText("LOZKO", safe.x + 46, safe.y + safe.h - 42);
        ctx.fillText("NPC", safe.x + safe.w - 86, safe.y + safe.h - 42);
      }
    });

    state.world.lamps.forEach((lamp) => {
      if (!inView({ x: lamp.x - 170, y: lamp.y - 230, w: 340, h: 340 }, view)) return;
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

    state.bosses.forEach((boss) => {
      if (!boss.dead && inView({ x: boss.x - 80, y: boss.y - 90, w: 160, h: 160 }, view)) drawBoss(boss);
    });

    state.projectiles.forEach((projectile) => {
      ctx.fillStyle = projectile.color || "#ffd068";
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 3, 0, TAU);
      ctx.fill();
    });

    online.peers.forEach((peer) => {
      if (!peer.x || peer.id === online.playerId) return;
      ctx.fillStyle = "#8cb7ff";
      ctx.beginPath();
      ctx.arc(peer.x, peer.y, 15, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#f4f4ed";
      ctx.font = "12px sans-serif";
      ctx.fillText(peer.name || "co-op", peer.x - 16, peer.y - 24);
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

  function drawBoss(boss) {
    ctx.save();
    ctx.translate(boss.x, boss.y);
    const pulse = 1 + Math.sin(performance.now() * 0.006) * 0.04;
    ctx.scale(pulse, pulse);
    ctx.fillStyle = boss.id === "baron" ? "#6b2d24" : boss.id === "howler" ? "#3b365b" : "#5a2d22";
    ctx.beginPath();
    ctx.ellipse(0, 0, boss.r * 1.05, boss.r * 1.25, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffbd5b";
    ctx.beginPath();
    ctx.arc(-9, -12, 3, 0, TAU);
    ctx.arc(9, -12, 3, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 84, 72, 0.55)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, boss.r + 12, 0, TAU);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#ffd4c8";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(boss.name, boss.x, boss.y - boss.r - 24);
    ctx.textAlign = "start";
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

    if (state.world.lamps.some((lamp) => lamp.on)) {
      state.world.lamps.forEach((lamp) => {
        if (!lamp.on) return;
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

    if (state.indoor) {
      miniCtx.fillStyle = "#1a211e";
      miniCtx.fillRect(12, 12, w - 24, h - 24);
      miniCtx.strokeStyle = "rgba(244,244,237,0.3)";
      miniCtx.strokeRect(12, 12, w - 24, h - 24);
      miniCtx.fillStyle = "#5eaed1";
      miniCtx.fillRect(24, 24, 42, 26);
      miniCtx.fillStyle = "#806c31";
      miniCtx.fillRect(90, 34, 52, 34);
      miniCtx.fillStyle = "#b6f65c";
      miniCtx.beginPath();
      miniCtx.arc(w / 2, h / 2, 5, 0, TAU);
      miniCtx.fill();
      miniCtx.fillStyle = "#f4f4ed";
      miniCtx.font = "10px sans-serif";
      miniCtx.fillText(`Budynek p.${state.indoor.floor}`, 42, h - 18);
      return;
    }

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

    miniCtx.fillStyle = "#ffbd5b";
    state.bosses.forEach((boss) => {
      if (!boss.dead) miniCtx.fillRect(boss.x * sx - 2, boss.y * sy - 2, 4, 4);
    });

    if (state.waypoint) {
      miniCtx.strokeStyle = "#f4f4ed";
      miniCtx.beginPath();
      miniCtx.arc(state.waypoint.x * sx, state.waypoint.y * sy, 4, 0, TAU);
      miniCtx.stroke();
    }

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

    state.zombies.forEach((zombie) => {
      if (zombie.dead || distance(zombie, state.player) > 1200) return;
      bigCtx.fillStyle = zombie.type === "exploder" ? "#ff8b3d" : "#ff5448";
      bigCtx.fillRect(zombie.x * sx - 1, zombie.y * sy - 1, 2, 2);
    });

    state.bosses.forEach((boss) => {
      if (boss.dead) return;
      bigCtx.fillStyle = "#ffbd5b";
      bigCtx.beginPath();
      bigCtx.arc(boss.x * sx, boss.y * sy, 5, 0, TAU);
      bigCtx.fill();
      bigCtx.fillText(boss.name, boss.x * sx + 7, boss.y * sy + 4);
    });

    if (state.waypoint) {
      bigCtx.strokeStyle = "#f4f4ed";
      bigCtx.lineWidth = 2;
      bigCtx.beginPath();
      bigCtx.arc(state.waypoint.x * sx, state.waypoint.y * sy, 8, 0, TAU);
      bigCtx.stroke();
      bigCtx.fillStyle = "#f4f4ed";
      bigCtx.fillText(state.waypoint.label || "Waypoint", state.waypoint.x * sx + 10, state.waypoint.y * sy - 8);
    }

    bigCtx.fillStyle = "#b6f65c";
    bigCtx.beginPath();
    bigCtx.arc(state.player.x * sx, state.player.y * sy, 6, 0, TAU);
    bigCtx.fill();
  }

  function renderInventoryPanels() {
    if (!state) return;
    const p = state.player;
    const weapon = getWeapon();
    const mission = currentMission();

    ui.inventoryView.innerHTML = `
      <div class="itemGrid">
        <article class="itemCard">
          <h3>Aktywna bron</h3>
          <p>${weapon.name} - obrazenia ${weapon.damage}, trwalosc ${Math.round(weapon.durability)}/${weapon.maxDurability}</p>
          <button data-action="repair">Napraw</button>
        </article>
        <article class="itemCard">
          <h3>Poziom ${p.level}</h3>
          <p>XP ${Math.round(p.xp)}/${xpForLevel(p.level)}. Punkty skilli: ${p.skillPoints}. Monety: ${p.inventory.coins || 0}</p>
        </article>
        <article class="itemCard missionCurrent">
          <h3>${mission.title}</h3>
          <p>${mission.desc}</p>
        </article>
        ${Object.entries(p.inventory).map(([id, amount]) => `
          <article class="itemCard">
            <h3>${MATERIAL_NAMES[id] || id}</h3>
            <p>Ilosc: ${amount}</p>
          </article>
        `).join("")}
      </div>
    `;

    ui.weaponsView.innerHTML = `
      <div class="weaponGrid">
        ${p.weapons.map((entry, index) => `
          <article class="weaponCard ${index === p.activeWeapon ? "missionCurrent" : ""}">
            <h3>${entry.name}</h3>
            <p>Typ: ${entry.type || "melee"} | DMG ${entry.damage} | Zasieg ${entry.range || 80}</p>
            <p>Trwalosc ${Math.round(entry.durability)}/${entry.maxDurability}${entry.ammo ? ` | Ammo: ${MATERIAL_NAMES[entry.ammo]} ${p.inventory[entry.ammo] || 0}` : ""}</p>
            <div class="pillRow">${entry.mod ? `<span class="pill">${ELEMENT_MODS[entry.mod]?.name}</span>` : "<span class=\"pill\">bez moda</span>"}</div>
            <button data-weapon="${index}">${index === p.activeWeapon ? "Wybrana" : "Wybierz"}</button>
          </article>
        `).join("")}
      </div>
    `;

    ui.craftingView.innerHTML = `
      <div class="craftGrid">
        ${RECIPES.map((recipe) => {
          const known = p.blueprints[recipe.id] || ["medkit", "repairKit", "uvBattery", "arrowBundle"].includes(recipe.id);
          return `
          <article class="craftCard">
            <h3>${recipe.name}</h3>
            <p>${known ? recipe.desc : "Schemat nieodkryty."}</p>
            <p>Koszt: ${formatCost(recipe.cost)}</p>
            <button data-recipe="${recipe.id}" ${known && canAfford(p.inventory, recipe.cost) ? "" : "disabled"}>Wytworz</button>
          </article>
        `;}).join("")}
      </div>
    `;

    ui.blueprintsView.innerHTML = `
      <div class="itemGrid">
        ${RECIPES.map((recipe) => `
          <article class="itemCard ${p.blueprints[recipe.id] ? "missionCurrent" : ""}">
            <h3>${recipe.name}</h3>
            <p>${p.blueprints[recipe.id] ? "Odkryty" : "Szukaj w dark zone, konwojach i blokach."}</p>
          </article>
        `).join("")}
        ${["axe", "pistol", "bow"].map((id) => `
          <article class="itemCard ${p.blueprints[id] ? "missionCurrent" : ""}">
            <h3>${WEAPON_DEFS[id].name}</h3>
            <p>${p.blueprints[id] ? "Schemat broni odkryty" : "Nieodkryty schemat broni"}</p>
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

    ui.journalView.innerHTML = `
      <div class="journalGrid">
        ${MISSIONS.map((entry, index) => `
          <article class="journalCard ${index === state.currentMission ? "missionCurrent" : ""}">
            <h3>${String(index + 1).padStart(2, "0")}. ${entry.title}</h3>
            <p>${entry.desc}</p>
            <p>${state.missionProgress[entry.id]?.done ? "Zakonczona" : index === state.currentMission ? "Aktywna" : "Zablokowana / pozniej"}</p>
          </article>
        `).join("")}
        ${NOTE_POOL.filter((note) => p.notes.includes(note.id)).map((note) => `
          <article class="journalCard">
            <h3>${note.title}</h3>
            <p>${note.text}</p>
          </article>
        `).join("")}
      </div>
    `;

    ui.shopView.innerHTML = `
      <p class="smallText">Sklep safe zone: monety ${p.inventory.coins || 0}. Dodatki GUI sa darmowe albo za monety z mapy.</p>
      <div class="shopGrid">
        ${SHOP_ITEMS.map((item) => {
          const price = p.skills.barter ? Math.ceil(item.cost * 0.8) : item.cost;
          const owned = item.kind === "addon" && p.shopUnlocks[item.addon];
          return `
          <article class="shopCard">
            <h3>${item.name}</h3>
            <p>Cena: ${price} monet${owned ? " | posiadane" : ""}</p>
            <button data-shop="${item.id}" ${owned || (p.inventory.coins || 0) < price ? "disabled" : ""}>Kup</button>
          </article>
        `;}).join("")}
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

  function renderUpdates() {
    ui.updatesList.innerHTML = UPDATE_LOG.map((entry) => `
      <article class="stackItem">
        <h3>${entry.date} - ${entry.title}</h3>
        <p>${entry.text}</p>
      </article>
    `).join("");
  }

  function createLocalAccount() {
    const account = {
      name: ui.accountName.value.trim(),
      email: ui.accountEmail.value.trim(),
      password: ui.accountPassword.value,
      verified: false,
      code: String(Math.floor(100000 + Math.random() * 900000))
    };
    if (!account.name || !account.email || account.password.length < 3) {
      ui.accountStatus.textContent = "Podaj nazwe, email i haslo.";
      return;
    }
    localStorage.setItem("castor-account-local", JSON.stringify(account));
    ui.accountStatus.textContent = `Konto lokalne utworzone. Dev code: ${account.code}`;
  }

  function loginLocalAccount() {
    const raw = localStorage.getItem("castor-account-local");
    if (!raw) {
      ui.accountStatus.textContent = "Brak konta lokalnego.";
      return;
    }
    const account = JSON.parse(raw);
    if (account.name !== ui.accountName.value.trim() || account.password !== ui.accountPassword.value) {
      ui.accountStatus.textContent = "Zla nazwa albo haslo.";
      return;
    }
    if (state) state.account = { name: account.name, email: account.email, verified: account.verified };
    ui.accountStatus.textContent = `Zalogowano: ${account.name}${account.verified ? "" : " (czeka na kod)"}`;
  }

  function verifyLocalCode() {
    const raw = localStorage.getItem("castor-account-local");
    if (!raw) return;
    const account = JSON.parse(raw);
    if (ui.accountCode.value.trim() !== account.code) {
      ui.accountStatus.textContent = "Zly kod.";
      return;
    }
    account.verified = true;
    localStorage.setItem("castor-account-local", JSON.stringify(account));
    ui.accountStatus.textContent = "Konto potwierdzone.";
  }

  function resetLocalPassword() {
    const raw = localStorage.getItem("castor-account-local");
    if (!raw) return;
    const account = JSON.parse(raw);
    account.code = String(Math.floor(100000 + Math.random() * 900000));
    localStorage.setItem("castor-account-local", JSON.stringify(account));
    ui.accountStatus.textContent = `Reset hasla: dev code ${account.code}. Backend wysle email po konfiguracji SMTP.`;
  }

  function connectOnline() {
    if (!("WebSocket" in window)) {
      appendChat("system", "Ta przegladarka nie obsluguje WebSocket.");
      return;
    }
    if (online.socket) online.socket.close();
    try {
      online.socket = new WebSocket(ui.serverUrl.value.trim());
      online.socket.addEventListener("open", () => {
        online.connected = true;
        appendChat("system", "Polaczono z backendem.");
        sendOnline({ type: "hello", name: ui.accountName.value.trim() || "Kyle" });
      });
      online.socket.addEventListener("message", (event) => handleOnlineMessage(event.data));
      online.socket.addEventListener("close", () => {
        online.connected = false;
        appendChat("system", "Rozlaczono z backendem.");
      });
    } catch (error) {
      appendChat("system", `Blad polaczenia: ${error.message}`);
    }
  }

  function sendOnline(payload) {
    if (!online.socket || online.socket.readyState !== WebSocket.OPEN) {
      appendChat("system", "Najpierw polacz z serwerem.");
      return;
    }
    online.socket.send(JSON.stringify(payload));
  }

  function handleOnlineMessage(raw) {
    let message;
    try {
      message = JSON.parse(raw);
    } catch {
      appendChat("server", raw);
      return;
    }
    if (message.type === "welcome") online.playerId = message.id;
    if (message.type === "lobby") {
      online.lobby = message.lobby;
      ui.lobbyCode.value = message.lobby;
      appendChat("system", `Lobby: ${message.lobby}`);
    }
    if (message.type === "players") {
      online.peers = new Map((message.players || []).map((player) => [player.id, player]));
      renderOnlinePlayers();
    }
    if (message.type === "chat") appendChat(message.name || "gracz", message.text || "");
    if (message.type === "state" && message.id !== online.playerId) {
      online.peers.set(message.id, message);
      renderOnlinePlayers();
    }
    if (message.type === "error") appendChat("blad", message.message || "Blad serwera");
  }

  function renderOnlinePlayers() {
    ui.onlinePlayers.innerHTML = [...online.peers.values()].slice(0, 3).map((player) => `
      <article class="stackItem">
        <h3>${player.name || player.id}</h3>
        <p>${player.x ? `x ${Math.round(player.x)} y ${Math.round(player.y)}` : "w lobby"}</p>
      </article>
    `).join("");
  }

  function appendChat(name, text) {
    const line = document.createElement("div");
    line.textContent = `${name}: ${text}`;
    ui.chatLog.appendChild(line);
    ui.chatLog.scrollTop = ui.chatLog.scrollHeight;
  }

  function sendChat() {
    const text = ui.chatInput.value.trim();
    if (!text) return;
    sendOnline({ type: "chat", text });
    ui.chatInput.value = "";
  }

  function sendOnlineState(dt) {
    if (!state || !online.connected) return;
    state.onlineTick = (state.onlineTick || 0) - dt;
    if (state.onlineTick > 0) return;
    state.onlineTick = 0.15;
    sendOnline({
      type: "state",
      x: state.player.x,
      y: state.player.y,
      health: state.player.health,
      mission: currentMission()?.id
    });
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
    ui.updatesBtn.addEventListener("click", () => {
      renderUpdates();
      ui.updatesPanel.classList.remove("hidden");
    });
    ui.accountBtn.addEventListener("click", () => ui.accountPanel.classList.remove("hidden"));
    ui.onlineBtn.addEventListener("click", () => ui.onlinePanel.classList.remove("hidden"));
    ui.menuShopBtn.addEventListener("click", () => {
      if (state) openInventory("shop");
      else {
        renderUpdates();
        ui.updatesPanel.classList.remove("hidden");
      }
    });
    ui.resumeBtn.addEventListener("click", () => closePanels(true));
    ui.saveBtn.addEventListener("click", () => saveGame(true));
    ui.skipNightBtn.addEventListener("click", skipDayNight);
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
      if (target.dataset.weapon) equipWeapon(Number(target.dataset.weapon));
      if (target.dataset.shop) buyShopItem(target.dataset.shop);
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
    ui.difficultySelect.addEventListener("change", () => {
      options.difficulty = ui.difficultySelect.value;
      toast(`Trudnosc: ${DIFFICULTIES[options.difficulty].label}`);
    });
    ui.qualitySelect.addEventListener("change", () => {
      options.quality = ui.qualitySelect.value;
      toast(`Jakosc: ${QUALITY[options.quality].label}`);
    });

    ui.miniMapWrap.addEventListener("click", () => openInventory("map"));
    bigMap.addEventListener("click", (event) => {
      if (!state) return;
      const rect = bigMap.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * WORLD.width;
      const y = ((event.clientY - rect.top) / rect.height) * WORLD.height;
      state.waypoint = { x, y, label: "Waypoint gracza" };
      ui.waypointText.textContent = `Waypoint: ${Math.round(x)}, ${Math.round(y)}`;
      renderBigMap();
    });

    ui.createAccountBtn.addEventListener("click", createLocalAccount);
    ui.loginBtn.addEventListener("click", loginLocalAccount);
    ui.verifyCodeBtn.addEventListener("click", verifyLocalCode);
    ui.resetPasswordBtn.addEventListener("click", resetLocalPassword);
    ui.connectOnlineBtn.addEventListener("click", connectOnline);
    ui.createLobbyBtn.addEventListener("click", () => sendOnline({ type: "createLobby" }));
    ui.joinLobbyBtn.addEventListener("click", () => sendOnline({ type: "joinLobby", lobby: ui.lobbyCode.value.trim() }));
    ui.sendChatBtn.addEventListener("click", sendChat);
    ui.chatInput.addEventListener("keydown", (event) => {
      if (event.code === "Enter") sendChat();
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
