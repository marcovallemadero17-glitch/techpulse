import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

const CACHE_MAX_AGE = 60 * 60 * 1000; // 1 hour
const gameCache: Record<string, { data: GameItem[]; timestamp: number }> = {};

export interface GameItem {
  id: string;
  title: string;
  description: string;
  requirements: {
    minimum: string;
    recommended: string;
  };
  minAge: string;
  devices: string[];
  downloadUrl: string;
  imageUrl: string;
  category: string;
  rating: number;
}

const STATIC_FALLBACK_GAMES: GameItem[] = [
  {
    id: "cyberpunk-2077",
    title: "Cyberpunk 2077",
    description: "Cyberpunk 2077 es un RPG de aventura y acción de mundo abierto ambientado en Night City, una megalópolis obsesionada con el poder, el glamour y la modificación corporal.",
    requirements: {
      minimum: "Intel Core i5-3570K / AMD FX-8310, 8 GB RAM, NVIDIA GeForce GTX 970 / AMD Radeon RX 470",
      recommended: "Intel Core i7-4790 / AMD Ryzen 3 3200G, 12 GB RAM, NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 590"
    },
    minAge: "18+",
    devices: ["PC", "PS5", "Xbox Series X/S", "PS4", "Xbox One"],
    downloadUrl: "https://www.cyberpunk.net/",
    imageUrl: "https://images.unsplash.com/photo-1605898960710-9aa36087597a?auto=format&fit=crop&q=80&w=800",
    category: "RPG",
    rating: 4.5
  },
  {
    id: "minecraft",
    title: "Minecraft",
    description: "Explora mundos infinitos y construye cualquier cosa, desde la casa más sencilla hasta el castillo más grandioso.",
    requirements: {
      minimum: "Intel Core i3-3210 / AMD A8-7600, 4 GB RAM, Intel HD Graphics 4000 / AMD Radeon R5",
      recommended: "Intel Core i5-4690 / AMD A10-7800, 8 GB RAM, NVIDIA GeForce 700 Series / AMD Radeon Rx 200 Series"
    },
    minAge: "7+",
    devices: ["PC", "Mobile", "Switch", "PS4", "Xbox One"],
    downloadUrl: "https://www.minecraft.net/",
    imageUrl: "https://images.unsplash.com/photo-1607988523351-30ad3bb3243c?auto=format&fit=crop&q=80&w=800",
    category: "Sandbox",
    rating: 4.8
  },
  {
    id: "elden-ring",
    title: "Elden Ring",
    description: "Álzate, Sinluz, y que la gracia te guíe para abrazar el poder del Círculo de Elden y convertirte en señor de las Tierras Intermedias.",
    requirements: {
      minimum: "Intel Core i5-8400 / AMD Ryzen 3 3300X, 12 GB RAM, NVIDIA GeForce GTX 1060 3GB / AMD Radeon RX 580 4GB",
      recommended: "Intel Core i7-8700K / AMD Ryzen 5 3600X, 16 GB RAM, NVIDIA GeForce GTX 1070 8GB / AMD Radeon RX Vega 56 8GB"
    },
    minAge: "16+",
    devices: ["PC", "PS5", "Xbox Series X/S", "PS4", "Xbox One"],
    downloadUrl: "https://en.bandainamcoent.eu/elden-ring/elden-ring",
    imageUrl: "https://images.unsplash.com/photo-1612285330013-0b6ff35770bb?auto=format&fit=crop&q=80&w=800",
    category: "Action RPG",
    rating: 4.9
  },
  {
    id: "valorant",
    title: "Valorant",
    description: "Combina tu estilo y experiencia en un escenario global y competitivo. Tienes 13 rondas para atacar y defender tu bando con disparos precisos y habilidades tácticas.",
    requirements: {
      minimum: "Intel Core 2 Duo E8400 / AMD Athlon 200GE, 4 GB RAM, Intel HD 4000 / Radeon R5 200",
      recommended: "Intel i3-4150 / AMD Ryzen 3 1200, 4 GB RAM, GeForce GT 730 / Radeon R7 240"
    },
    minAge: "16+",
    devices: ["PC"],
    downloadUrl: "https://playvalorant.com/",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800",
    category: "FPS",
    rating: 4.3
  },
  {
    id: "the-witcher-3",
    title: "The Witcher 3: Wild Hunt",
    description: "Conviértete en un cazador de monstruos profesional y embárcate en una aventura de proporciones épicas para encontrar a la niña de la profecía.",
    requirements: {
      minimum: "Intel Core i5-2500K / AMD Phenom II X4 940, 6 GB RAM, NVIDIA GeForce GTX 660 / AMD Radeon HD 7870",
      recommended: "Intel Core i7-3770 / AMD FX-8350, 8 GB RAM, NVIDIA GeForce GTX 770 / AMD Radeon R9 290"
    },
    minAge: "18+",
    devices: ["PC", "PS5", "Xbox Series X/S", "Switch", "PS4", "Xbox One"],
    downloadUrl: "https://www.thewitcher.com/en/witcher3",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
    category: "RPG",
    rating: 4.9
  },
  {
    id: "gta-v",
    title: "Grand Theft Auto V",
    description: "Un joven estafador callejero, un ladrón de bancos retirado y un psicópata aterrador se ven involucrados con lo peor del mundo criminal.",
    requirements: {
      minimum: "Intel Core 2 Quad Q6600 / AMD Phenom 9850, 4 GB RAM, NVIDIA 9800 GT 1GB / AMD HD 4870 1GB",
      recommended: "Intel Core i5 3470 / AMD X8 FX-8350, 8 GB RAM, NVIDIA GTX 660 2GB / AMD HD 7870 2GB"
    },
    minAge: "18+",
    devices: ["PC", "PS5", "Xbox Series X/S", "PS4", "Xbox One"],
    downloadUrl: "https://www.rockstargames.com/gta-v",
    imageUrl: "https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&q=80&w=800",
    category: "Action",
    rating: 4.7
  },
  {
    id: "league-of-legends",
    title: "League of Legends",
    description: "League of Legends es un juego de estrategia por equipos en el que dos equipos de cinco campeones se enfrentan para ver quién destruye antes la base del otro.",
    requirements: {
      minimum: "Intel Core i3-530 / AMD A6-3650, 2 GB RAM, NVIDIA GeForce 9600GT / AMD Radeon HD 6570",
      recommended: "Intel Core i5-3300 / AMD Ryzen 3 1200, 4 GB RAM, NVIDIA GeForce GTX 560 / AMD Radeon HD 6950"
    },
    minAge: "12+",
    devices: ["PC", "Mac"],
    downloadUrl: "https://www.leagueoflegends.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
    category: "Strategy",
    rating: 4.2
  },
  {
    id: "fortnite",
    title: "Fortnite",
    description: "Crea, juega y combate con tus amigos de forma gratuita en Fortnite. Sé el último en pie en Battle Royale y Cero construcción.",
    requirements: {
      minimum: "Intel Core i3-3225 3.3 GHz, 4 GB RAM, Intel HD 4000",
      recommended: "Intel Core i5-7300U 3.5 GHz, 8 GB RAM, NVIDIA GTX 960 / AMD R9 280"
    },
    minAge: "12+",
    devices: ["PC", "PS5", "Xbox Series X/S", "Switch", "Mobile"],
    downloadUrl: "https://www.fortnite.com/",
    imageUrl: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?auto=format&fit=crop&q=80&w=800",
    category: "Action",
    rating: 4.4
  },
  {
    id: "red-dead-redemption-2",
    title: "Red Dead Redemption 2",
    description: "Arthur Morgan y la banda de Van der Linde son forajidos en busca y captura. Mientras las divisiones internas amenazan con despedazar a la banda, Arthur debe elegir entre sus propios ideales y la lealtad a la banda que lo vio crecer.",
    requirements: {
      minimum: "Intel Core i5-2500K / AMD FX-6300, 8 GB RAM, NVIDIA GTX 770 2GB / AMD Radeon R9 280 3GB",
      recommended: "Intel Core i7-4770K / AMD Ryzen 5 1500X, 12 GB RAM, NVIDIA GTX 1060 6GB / AMD Radeon RX 480 4GB"
    },
    minAge: "18+",
    devices: ["PC", "PS4", "Xbox One"],
    downloadUrl: "https://www.rockstargames.com/reddeadredemption2",
    imageUrl: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?auto=format&fit=crop&q=80&w=800",
    category: "Action Adventure",
    rating: 4.9
  },
  {
    id: "god-of-war",
    title: "God of War",
    description: "Kratos es padre de nuevo. Como mentor y protector de Atreus, un hijo decidido a ganarse su respeto, se ve obligado a controlar la ira que tanto tiempo lo ha definido mientras viaja por un mundo muy peligroso con su hijo.",
    requirements: {
      minimum: "Intel Core i5-2500K / AMD Ryzen 3 1200, 8 GB RAM, NVIDIA GTX 960 / AMD R9 290X",
      recommended: "Intel Core i5-6600K / AMD Ryzen 5 2400G, 8 GB RAM, NVIDIA GTX 1060 6GB / AMD RX 580 8GB"
    },
    minAge: "18+",
    devices: ["PC", "PS4", "PS5"],
    downloadUrl: "https://www.playstation.com/games/god-of-war/",
    imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=800",
    category: "Action",
    rating: 4.9
  },
  {
    id: "roblox",
    title: "Roblox",
    description: "Roblox es el universo virtual definitivo que te permite crear, compartir experiencias con amigos y ser cualquier cosa que imagines.",
    requirements: {
      minimum: "1.6 GHz Processor, 1 GB RAM, DirectX 9 minimum",
      recommended: "2.0 GHz Processor, 4 GB RAM, Dedicated Video Card"
    },
    minAge: "7+",
    devices: ["PC", "Mobile", "Xbox One", "PS4"],
    downloadUrl: "https://www.roblox.com/",
    imageUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=800",
    category: "Sandbox",
    rating: 4.5
  },
  {
    id: "among-us",
    title: "Among Us",
    description: "Un juego de trabajo en equipo y traición en el espacio. Los jugadores son tripulantes que intentan preparar su nave espacial para la partida, pero cuidado, ¡hay impostores!",
    requirements: {
      minimum: "Intel Pentium 4, 1 GB RAM, Intel HD Graphics",
      recommended: "Intel Core i3, 2 GB RAM, NVIDIA GeForce"
    },
    minAge: "10+",
    devices: ["PC", "Mobile", "Switch", "PS4", "Xbox One"],
    downloadUrl: "https://innersloth.com/games/among-us/",
    imageUrl: "https://images.unsplash.com/photo-1615592389070-bcc97e05ad01?auto=format&fit=crop&q=80&w=800",
    category: "Party",
    rating: 4.0
  },
  {
    id: "apex-legends",
    title: "Apex Legends",
    description: "Apex Legends es el galardonado juego de disparos de héroes gratuito de Respawn Entertainment. Domina un elenco cada vez mayor de personajes legendarios con poderosas habilidades.",
    requirements: {
      minimum: "Intel Core i3-6300 / AMD FX-4350, 6 GB RAM, NVIDIA GT 640 / Radeon HD 7730",
      recommended: "Intel Core i5-3570K / AMD Ryzen 5 1400, 8 GB RAM, NVIDIA GTX 970 / Radeon R9 290"
    },
    minAge: "16+",
    devices: ["PC", "PS4", "PS5", "Xbox One", "Switch"],
    downloadUrl: "https://www.ea.com/games/apex-legends",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Battle Royale",
    rating: 4.6
  },
  {
    id: "fifa-23",
    title: "FIFA 23",
    description: "Disfruta de la emoción del deporte rey con FIFA 23, que incluye la tecnología HyperMotion2, las Copas Mundiales masculina y femenina, y equipos de clubes femeninos.",
    requirements: {
      minimum: "Intel Core i5 6600K / AMD Ryzen 5 1600, 8 GB RAM, NVIDIA GTX 1050 Ti / AMD RX 570",
      recommended: "Intel Core i7 6700 / AMD Ryzen 7 2700X, 12 GB RAM, NVIDIA GTX 1660 / AMD RX 5600 XT"
    },
    minAge: "3+",
    devices: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S"],
    downloadUrl: "https://www.ea.com/games/fifa/fifa-23",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
    category: "Sports",
    rating: 4.1
  },
  {
    id: "rocket-league",
    title: "Rocket League",
    description: "¡Fútbol con coches! Rocket League es un híbrido de alta potencia de fútbol de estilo arcade y caos vehicular con controles fáciles de entender y competencia fluida basada en la física.",
    requirements: {
      minimum: "2.5 GHz Dual core, 4 GB RAM, NVIDIA GTX 760 / AMD Radeon R7 270X",
      recommended: "3.0+ GHz Quad core, 8 GB RAM, NVIDIA GTX 1060 / AMD Radeon RX 470"
    },
    minAge: "3+",
    devices: ["PC", "PS4", "Xbox One", "Switch"],
    downloadUrl: "https://www.rocketleague.com/",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
    category: "Sports",
    rating: 4.7
  },
  {
    id: "stardew-valley",
    title: "Stardew Valley",
    description: "Has heredado la vieja parcela agrícola de tu abuelo en Stardew Valley. Armado con herramientas de segunda mano y unas pocas monedas, te dispones a comenzar tu nueva vida.",
    requirements: {
      minimum: "2 GHz, 2 GB RAM, 256 mb video memory",
      recommended: "2 GHz, 4 GB RAM, 512 mb video memory"
    },
    minAge: "7+",
    devices: ["PC", "Mac", "Mobile", "Switch", "PS4", "Xbox One"],
    downloadUrl: "https://www.stardewvalley.net/",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
    category: "Simulation",
    rating: 4.9
  },
  {
    id: "terraria",
    title: "Terraria",
    description: "¡Cava, lucha, explora, construye! Nada es imposible en este juego de aventuras lleno de acción. El mundo es tu lienzo y la tierra misma es tu pintura.",
    requirements: {
      minimum: "2.0 GHz, 2.5 GB RAM, 128MB Video Memory",
      recommended: "3.0 GHz, 4.0 GB RAM, 256MB Video Memory"
    },
    minAge: "12+",
    devices: ["PC", "Mobile", "Switch", "PS4", "Xbox One"],
    downloadUrl: "https://terraria.org/",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
    category: "Sandbox",
    rating: 4.8
  },
  {
    id: "hollow-knight",
    title: "Hollow Knight",
    description: "Forja tu propio camino en Hollow Knight. Una aventura de acción épica a través de un vasto reino en ruinas de insectos y héroes.",
    requirements: {
      minimum: "Intel Core 2 Duo E5200, 4 GB RAM, GeForce 9800GT",
      recommended: "Intel Core i5, 8 GB RAM, GeForce GTX 560"
    },
    minAge: "7+",
    devices: ["PC", "Mac", "Switch", "PS4", "Xbox One"],
    downloadUrl: "https://www.hollowknight.com/",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
    category: "Metroidvania",
    rating: 4.9
  },
  {
    id: "overwatch-2",
    title: "Overwatch 2",
    description: "Overwatch 2 es un juego de acción por equipos gratuito y en constante evolución ambientado en un futuro optimista.",
    requirements: {
      minimum: "Intel Core i3 / AMD Phenom X3 8650, 6 GB RAM, NVIDIA GeForce GTX 600 / AMD Radeon HD 7000",
      recommended: "Intel Core i7 / AMD Ryzen 5, 8 GB RAM, NVIDIA GeForce GTX 1060 / AMD Radeon R9 380"
    },
    minAge: "12+",
    devices: ["PC", "PS5", "Xbox Series X/S", "Switch"],
    downloadUrl: "https://overwatch.blizzard.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "FPS",
    rating: 4.0
  },
  {
    id: "genshin-impact",
    title: "Genshin Impact",
    description: "Embárcate en un viaje a través de Teyvat para encontrar a tu hermano perdido y buscar respuestas de los Siete, los dioses de cada elemento.",
    requirements: {
      minimum: "Intel Core i5, 8 GB RAM, NVIDIA GeForce GT 1030",
      recommended: "Intel Core i7, 16 GB RAM, NVIDIA GeForce GTX 1060 6GB"
    },
    minAge: "12+",
    devices: ["PC", "Mobile", "PS4", "PS5"],
    downloadUrl: "https://genshin.hoyoverse.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
    category: "Action RPG",
    rating: 4.4
  },
  {
    id: "call-of-duty-warzone",
    title: "Call of Duty: Warzone",
    description: "Bienvenido a Warzone, el enorme campo de batalla gratuito que ahora cuenta con el nuevo mapa, Urzikstan.",
    requirements: {
      minimum: "Intel Core i3-6100 / AMD Ryzen 3 1200, 8 GB RAM, NVIDIA GeForce GTX 960 / AMD Radeon RX 470",
      recommended: "Intel Core i5-6600K / AMD Ryzen 5 1400, 12 GB RAM, NVIDIA GeForce GTX 1060 / AMD Radeon RX 580"
    },
    minAge: "18+",
    devices: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S"],
    downloadUrl: "https://www.callofduty.com/warzone",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Battle Royale",
    rating: 4.2
  },
  {
    id: "rust",
    title: "Rust",
    description: "El único objetivo en Rust es sobrevivir. Para ello, tendrás que superar luchas como el hambre, la sed y el frío.",
    requirements: {
      minimum: "Intel Core i7-3770 / AMD FX-9590, 10 GB RAM, GTX 670 2GB / R9 280",
      recommended: "Intel Core i7-4790K / AMD Ryzen 5 1600, 16 GB RAM, GTX 980 / R9 Fury"
    },
    minAge: "18+",
    devices: ["PC", "PS4", "Xbox One"],
    downloadUrl: "https://rust.facepunch.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Survival",
    rating: 4.3
  },
  {
    id: "ark-survival-evolved",
    title: "ARK: Survival Evolved",
    description: "Como un hombre o mujer varado desnudo, congelado y hambriento en las costas de una isla misteriosa llamada ARK, debes cazar, cosechar recursos, fabricar artículos, cultivar, investigar tecnologías y construir refugios para sobrevivir.",
    requirements: {
      minimum: "Intel Core i5-2400/AMD FX-8320, 8 GB RAM, NVIDIA GTX 670 2GB/AMD Radeon HD 7870 2GB",
      recommended: "Intel Core i7-4770K/AMD Ryzen 5 1500X, 16 GB RAM, NVIDIA GTX 1060 6GB/AMD Radeon RX 480 4GB"
    },
    minAge: "16+",
    devices: ["PC", "PS4", "Xbox One", "Switch", "Mobile"],
    downloadUrl: "https://playark.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Survival",
    rating: 4.1
  },
  {
    id: "dead-by-daylight",
    title: "Dead by Daylight",
    description: "Dead by Daylight es un juego de terror multijugador (4 contra 1) en el que un jugador asume el papel del asesino salvaje y los otros cuatro jugadores juegan como supervivientes.",
    requirements: {
      minimum: "Intel Core i3-4170 / AMD FX-8120, 8 GB RAM, GeForce GTX 460 1GB / Radeon HD 6850 1GB",
      recommended: "Intel Core i3-4170 / AMD FX-8300, 8 GB RAM, GeForce 760 / Radeon HD 8800"
    },
    minAge: "18+",
    devices: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S", "Switch", "Mobile"],
    downloadUrl: "https://deadbydaylight.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Horror",
    rating: 4.4
  },
  {
    id: "sea-of-thieves",
    title: "Sea of Thieves",
    description: "Sea of Thieves ofrece la experiencia pirata definitiva, desde la navegación y el combate hasta la exploración y el saqueo.",
    requirements: {
      minimum: "Intel Q9450 @ 2.6GHz / AMD Phenom II X6 @ 3.3GHz, 4 GB RAM, Nvidia GeForce GTX 650 / AMD Radeon 7750",
      recommended: "Intel i5 4690 @ 3.5GHz / AMD FX-8150 @ 3.6GHz, 8 GB RAM, Nvidia GeForce GTX 770 / AMD Radeon R9 380x"
    },
    minAge: "12+",
    devices: ["PC", "Xbox One", "Xbox Series X/S", "PS5"],
    downloadUrl: "https://www.seaofthieves.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Adventure",
    rating: 4.5
  },
  {
    id: "diablo-iv",
    title: "Diablo IV",
    description: "La batalla eterna entre los Cielos y los Infiernos arde mientras el caos amenaza con consumir Santuario.",
    requirements: {
      minimum: "Intel Core i5-2500K / AMD FX-8100, 8 GB RAM, GTX 660 / R9 280",
      recommended: "Intel Core i5-4670K / AMD Ryzen 1300X, 16 GB RAM, GTX 1060 / RX 5500 XT"
    },
    minAge: "18+",
    devices: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S"],
    downloadUrl: "https://diablo4.blizzard.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Action RPG",
    rating: 4.3
  },
  {
    id: "starfield",
    title: "Starfield",
    description: "Starfield es el primer universo nuevo en 25 años de Bethesda Game Studios, los galardonados creadores de The Elder Scrolls V: Skyrim y Fallout 4.",
    requirements: {
      minimum: "Intel Core i7-6800K / AMD Ryzen 5 2600X, 16 GB RAM, GTX 1070 Ti / RX 5700",
      recommended: "Intel Core i5-10600K / AMD Ryzen 5 3600X, 16 GB RAM, RTX 2080 / RX 6800 XT"
    },
    minAge: "18+",
    devices: ["PC", "Xbox Series X/S"],
    downloadUrl: "https://bethesda.net/en/game/starfield",
    imageUrl: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=800",
    category: "RPG",
    rating: 3.8
  },
  {
    id: "baldurs-gate-3",
    title: "Baldur's Gate 3",
    description: "Reúne a tu grupo y regresa a los Reinos Olvidados en una historia de compañerismo y traición, sacrificio y supervivencia, y el atractivo del poder absoluto.",
    requirements: {
      minimum: "Intel i5-4690 / AMD FX 8350, 8 GB RAM, GTX 970 / RX 480",
      recommended: "Intel i7 8700K / AMD r5 3600, 16 GB RAM, RTX 2060 Super / RX 5700 XT"
    },
    minAge: "18+",
    devices: ["PC", "PS5", "Xbox Series X/S", "Mac"],
    downloadUrl: "https://baldursgate3.game/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "RPG",
    rating: 4.9
  },
  {
    id: "it-takes-two",
    title: "It Takes Two",
    description: "Embárcate en el viaje más loco de tu vida en It Takes Two, una aventura de plataformas que dobla el género creada puramente para el modo cooperativo.",
    requirements: {
      minimum: "Intel Core i3-2100T / AMD FX 6100, 8 GB RAM, GTX 660 / R7 260x",
      recommended: "Intel Core i5 3570K / AMD Ryzen 3 1300X, 16 GB RAM, GTX 980 / R9 290X"
    },
    minAge: "12+",
    devices: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S", "Switch"],
    downloadUrl: "https://www.ea.com/games/it-takes-two",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Adventure",
    rating: 4.8
  },
  {
    id: "street-fighter-6",
    title: "Street Fighter 6",
    description: "¡Aquí llega el nuevo contendiente de Capcom! Street Fighter 6 se lanza en todo el mundo el 2 de junio de 2023 y representa la próxima evolución de la serie.",
    requirements: {
      minimum: "Intel Core i5-7500 / AMD Ryzen 3 1200, 8 GB RAM, GTX 1060 / RX 580",
      recommended: "Intel Core i7-8700 / AMD Ryzen 5 3600, 16 GB RAM, RTX 2070 / RX 5700 XT"
    },
    minAge: "12+",
    devices: ["PC", "PS4", "PS5", "Xbox Series X/S"],
    downloadUrl: "https://www.streetfighter.com/6/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Fighting",
    rating: 4.6
  },
  {
    id: "resident-evil-4-remake",
    title: "Resident Evil 4",
    description: "La supervivencia es solo el principio. Seis años después del desastre biológico en Raccoon City, Leon S. Kennedy, uno de los supervivientes, ha sido enviado a rescatar a la hija del presidente.",
    requirements: {
      minimum: "Intel Core i5-7500 / AMD Ryzen 3 1200, 8 GB RAM, GTX 1050 Ti / RX 560",
      recommended: "Intel Core i7-8700 / AMD Ryzen 5 3600, 16 GB RAM, GTX 1070 / RX 5700"
    },
    minAge: "18+",
    devices: ["PC", "PS4", "PS5", "Xbox Series X/S"],
    downloadUrl: "https://www.residentevil.com/re4/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Horror",
    rating: 4.9
  },
  {
    id: "dead-space-remake",
    title: "Dead Space",
    description: "El clásico de terror de supervivencia de ciencia ficción regresa, reconstruido desde cero para ofrecer una experiencia más profunda e inmersiva.",
    requirements: {
      minimum: "Intel Core i5-8400 / AMD Ryzen 5 2600, 16 GB RAM, GTX 1070 / RX 5700",
      recommended: "Intel Core i5-11600K / AMD Ryzen 5 5600X, 16 GB RAM, RTX 2070 / RX 6700 XT"
    },
    minAge: "18+",
    devices: ["PC", "PS5", "Xbox Series X/S"],
    downloadUrl: "https://www.ea.com/games/dead-space",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Horror",
    rating: 4.7
  },
  {
    id: "hogwarts-legacy",
    title: "Hogwarts Legacy",
    description: "Hogwarts Legacy es un RPG de acción en mundo abierto ambientado en el mundo presentado por primera vez en los libros de Harry Potter.",
    requirements: {
      minimum: "Intel Core i5-6600 / AMD Ryzen 5 1400, 16 GB RAM, GTX 960 / RX 470",
      recommended: "Intel Core i7-8700 / AMD Ryzen 5 3600, 16 GB RAM, GTX 1080 Ti / RX 5700 XT"
    },
    minAge: "12+",
    devices: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S", "Switch"],
    downloadUrl: "https://www.hogwartslegacy.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "RPG",
    rating: 4.5
  },
  {
    id: "the-last-of-us-part-1",
    title: "The Last of Us Part I",
    description: "En una civilización devastada, donde los infectados y los supervivientes endurecidos campan a sus anchas, Joel, un protagonista cansado, es contratado para sacar a escondidas a Ellie, de 14 años, de una zona de cuarentena militar.",
    requirements: {
      minimum: "Intel Core i7-4770K / AMD Ryzen 5 1500X, 16 GB RAM, GTX 1050 Ti / RX 470",
      recommended: "Intel Core i7-8700 / AMD Ryzen 5 3600X, 16 GB RAM, RTX 2070 Super / RX 6600 XT"
    },
    minAge: "18+",
    devices: ["PC", "PS5"],
    downloadUrl: "https://www.playstation.com/games/the-last-of-us-part-i/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Action",
    rating: 4.9
  },
  {
    id: "elden-ring",
    title: "Elden Ring",
    description: "Levántate, Sinluz, y déjate guiar por la gracia para esgrimir el poder del Círculo de Elden y convertirte en el Señor de Elden en las Tierras Intermedias.",
    requirements: {
      minimum: "Intel Core i5-8400 / AMD Ryzen 3 3300X, 12 GB RAM, GTX 1060 / RX 580",
      recommended: "Intel Core i7-8700K / AMD Ryzen 5 3600X, 16 GB RAM, RTX 3060 / RX 6600 XT"
    },
    minAge: "16+",
    devices: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S"],
    downloadUrl: "https://www.eldenring.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Action RPG",
    rating: 4.9
  },
  {
    id: "god-of-war-ragnarok",
    title: "God of War Ragnarök",
    description: "Kratos y Atreus deben viajar a cada uno de los Nueve Reinos en busca de respuestas mientras las fuerzas de Asgard se preparan para la batalla profetizada que supondrá el fin del mundo.",
    requirements: {
      minimum: "Intel i5-4670k / AMD Ryzen 3 1200, 8 GB RAM, GTX 960 / R9 290X",
      recommended: "Intel i5-6600k / AMD Ryzen 5 2400 G, 16 GB RAM, GTX 1060 / RX 570"
    },
    minAge: "18+",
    devices: ["PS4", "PS5", "PC"],
    downloadUrl: "https://www.playstation.com/games/god-of-war-ragnarok/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Action-Adventure",
    rating: 4.9
  },
  {
    id: "spider-man-2",
    title: "Marvel's Spider-Man 2",
    description: "Los Spider-Men Peter Parker y Miles Morales regresan para una nueva y emocionante aventura en la aclamada franquicia de Marvel's Spider-Man.",
    requirements: {
      minimum: "PS5 Exclusive Hardware",
      recommended: "PS5 Exclusive Hardware"
    },
    minAge: "16+",
    devices: ["PS5"],
    downloadUrl: "https://www.playstation.com/games/marvels-spider-man-2/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Action",
    rating: 4.8
  },
  {
    id: "final-fantasy-xvi",
    title: "Final Fantasy XVI",
    description: "Un épico mundo de fantasía oscura donde el destino de la tierra lo deciden los poderosos Eikons y los Dominantes que los esgrimen.",
    requirements: {
      minimum: "Intel Core i5-8400 / AMD Ryzen 5 2600, 16 GB RAM, GTX 1070 / RX 5700",
      recommended: "Intel Core i7-10700 / AMD Ryzen 7 3700X, 16 GB RAM, RTX 2080 / RX 6700 XT"
    },
    minAge: "18+",
    devices: ["PS5", "PC"],
    downloadUrl: "https://na.finalfantasyxvi.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Action RPG",
    rating: 4.7
  },
  {
    id: "the-legend-of-zelda-tears-of-the-kingdom",
    title: "The Legend of Zelda: Tears of the Kingdom",
    description: "Una aventura épica a través de la tierra y los cielos de Hyrule te espera en la secuela de The Legend of Zelda: Breath of the Wild.",
    requirements: {
      minimum: "Nintendo Switch Hardware",
      recommended: "Nintendo Switch Hardware"
    },
    minAge: "10+",
    devices: ["Switch"],
    downloadUrl: "https://www.zelda.com/tears-of-the-kingdom/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Adventure",
    rating: 5.0
  },
  {
    id: "valorant",
    title: "VALORANT",
    description: "Mezcla tu estilo y experiencia en un escenario global y competitivo. Tienes 13 rondas para atacar y defender tu bando con disparos precisos y habilidades tácticas.",
    requirements: {
      minimum: "Intel Core 2 Duo E8400 / AMD Athlon 200GE, 4 GB RAM, Intel HD 4000 / AMD Radeon R5 200",
      recommended: "Intel i3-4150 / AMD Ryzen 3 1200, 4 GB RAM, GeForce GT 730 / Radeon R7 240"
    },
    minAge: "16+",
    devices: ["PC"],
    downloadUrl: "https://playvalorant.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Tactical Shooter",
    rating: 4.4
  },
  {
    id: "league-of-legends",
    title: "League of Legends",
    description: "League of Legends es un juego de estrategia por equipos en el que dos equipos de cinco poderosos campeones se enfrentan para ver quién destruye antes la base del otro.",
    requirements: {
      minimum: "Intel Core i3-530 / AMD A6-3650, 2 GB RAM, NVidia GeForce 9600GT / AMD Radeon HD 6570",
      recommended: "Intel Core i5-3300 / AMD Ryzen 3 1200, 4 GB RAM, NVidia GeForce GTX 560 / AMD Radeon HD 6950"
    },
    minAge: "12+",
    devices: ["PC", "Mac"],
    downloadUrl: "https://www.leagueoflegends.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "MOBA",
    rating: 4.3
  },
  {
    id: "dota-2",
    title: "Dota 2",
    description: "Cada día, millones de jugadores de todo el mundo entran en batalla como uno de los más de cien héroes de Dota. Y no importa si es su décima hora de juego o la milésima, siempre hay algo nuevo que descubrir.",
    requirements: {
      minimum: "Dual core from Intel or AMD at 2.8 GHz, 4 GB RAM, nVidia GeForce 8600/9600GT / ATI/AMD Radeon HD2600/3600",
      recommended: "Quad core from Intel or AMD at 3.0 GHz, 8 GB RAM, nVidia GeForce GTX 960 / AMD Radeon R9 280"
    },
    minAge: "12+",
    devices: ["PC", "Mac", "Linux"],
    downloadUrl: "https://www.dota2.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "MOBA",
    rating: 4.5
  },
  {
    id: "counter-strike-2",
    title: "Counter-Strike 2",
    description: "Durante las últimas dos décadas, Counter-Strike ha brindado una experiencia competitiva de élite, una experiencia moldeada por millones de jugadores de todo el mundo. Y ahora comienza el siguiente capítulo en la historia de CS. Esto es Counter-Strike 2.",
    requirements: {
      minimum: "Intel Core i5 750 / AMD Phenom II X4 965, 8 GB RAM, NVIDIA GeForce GTX 660 / AMD Radeon HD 7850",
      recommended: "Intel Core i7 9700K / AMD Ryzen 7 3700X, 16 GB RAM, NVIDIA GeForce RTX 2070 / AMD Radeon RX 5700 XT"
    },
    minAge: "18+",
    devices: ["PC", "Linux"],
    downloadUrl: "https://www.counter-strike.net/cs2",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Tactical Shooter",
    rating: 4.6
  },
  {
    id: "apex-legends",
    title: "Apex Legends",
    description: "Domina con estilo en Apex Legends, un juego de disparos de héroes gratuito donde personajes legendarios con poderosas habilidades forman equipos para luchar por la fortuna y la fama en los confines de la Frontera.",
    requirements: {
      minimum: "Intel Core i3-6300 / AMD FX-4350, 6 GB RAM, NVIDIA GeForce GT 640 / Radeon HD 7730",
      recommended: "Intel i5 3570K / AMD Ryzen 5 1400, 8 GB RAM, NVIDIA GeForce GTX 970 / AMD Radeon R9 290"
    },
    minAge: "16+",
    devices: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S", "Switch"],
    downloadUrl: "https://www.ea.com/games/apex-legends",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Battle Royale",
    rating: 4.4
  },
  {
    id: "fortnite",
    title: "Fortnite",
    description: "¡Sé el último en pie en Battle Royale y Cero construcción, explora y sobrevive en LEGO Fortnite, llega a la meta en Rocket Racing o da un concierto en Fortnite Festival!",
    requirements: {
      minimum: "Intel Core i3-3225 3.3 GHz, 4 GB RAM, Intel HD 4000",
      recommended: "Intel Core i5-7300U 3.5 GHz, 8 GB RAM, Nvidia GTX 960 / AMD R9 280"
    },
    minAge: "12+",
    devices: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S", "Switch", "Mobile"],
    downloadUrl: "https://www.fortnite.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Battle Royale",
    rating: 4.5
  },
  {
    id: "minecraft",
    title: "Minecraft",
    description: "¡Explora mundos generados aleatoriamente y construye cosas increíbles, desde la casa más sencilla hasta el castillo más grandioso!",
    requirements: {
      minimum: "Intel Core i3-3210 / AMD A8-7600 APU, 4 GB RAM, Intel HD Graphics 4000 / AMD Radeon R5 series",
      recommended: "Intel Core i5-4690 / AMD A10-7800 APU, 8 GB RAM, GeForce 700 Series / AMD Radeon Rx 200 Series"
    },
    minAge: "7+",
    devices: ["PC", "Mac", "Mobile", "PS4", "Xbox One", "Switch"],
    downloadUrl: "https://www.minecraft.net/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Sandbox",
    rating: 4.8
  },
  {
    id: "roblox",
    title: "Roblox",
    description: "Roblox es el universo virtual definitivo que te permite crear, compartir experiencias con amigos y ser cualquier cosa que te imagines.",
    requirements: {
      minimum: "1.6 GHz Processor, 1 GB RAM, DirectX 9 minimum",
      recommended: "2.0 GHz+ Processor, 4 GB RAM, Dedicated Video Card"
    },
    minAge: "3+",
    devices: ["PC", "Mac", "Mobile", "Xbox One", "PS4"],
    downloadUrl: "https://www.roblox.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Sandbox",
    rating: 4.2
  },
  {
    id: "among-us",
    title: "Among Us",
    description: "Un juego de trabajo en equipo y traición para 4-15 jugadores... ¡en el espacio!",
    requirements: {
      minimum: "Intel Pentium 4, 1 GB RAM, DirectX 9",
      recommended: "Intel Core i3, 2 GB RAM, DirectX 10"
    },
    minAge: "7+",
    devices: ["PC", "Mobile", "Switch", "PS4", "PS5", "Xbox One", "Xbox Series X/S"],
    downloadUrl: "https://innersloth.com/games/among-us/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Social Deduction",
    rating: 4.0
  },
  {
    id: "fall-guys",
    title: "Fall Guys",
    description: "¡Fall Guys es un party royale gratuito, multiplataforma y multijugador masivo donde tú y tus compañeros contendientes compiten a través de niveles de caos cada vez más locos hasta que queda un afortunado ganador!",
    requirements: {
      minimum: "Intel Core i5 / AMD equivalent, 8 GB RAM, NVIDIA GTX 660 / AMD Radeon HD 7950",
      recommended: "Intel Core i7 / AMD equivalent, 16 GB RAM, NVIDIA GTX 1060 / AMD Radeon RX 580"
    },
    minAge: "3+",
    devices: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S", "Switch"],
    downloadUrl: "https://www.fallguys.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Party",
    rating: 4.1
  },
  {
    id: "the-sims-4",
    title: "The Sims 4",
    description: "¡Da rienda suelta a tu imaginación y crea un mundo de Sims único que sea una expresión de ti! Explora y personaliza cada detalle, desde los Sims hasta los hogares, y mucho más.",
    requirements: {
      minimum: "Intel Core 2 Duo 1.8 GHz / AMD Athlon 64 Dual-Core 4000+, 4 GB RAM, NVIDIA GeForce 6600 / ATI Radeon X1300",
      recommended: "Intel Core i5 / AMD Athlon X4, 8 GB RAM, NVIDIA GTX 650 / AMD Radeon HD 7750"
    },
    minAge: "12+",
    devices: ["PC", "Mac", "PS4", "Xbox One"],
    downloadUrl: "https://www.ea.com/games/the-sims/the-sims-4",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Simulation",
    rating: 4.4
  },
  {
    id: "grand-theft-auto-v",
    title: "Grand Theft Auto V",
    description: "Cuando un joven estafador callejero, un ladrón de bancos retirado y un psicópata aterrador se ven envueltos con algunos de los elementos más aterradores y desquiciados del inframundo criminal, el gobierno de los EE. UU. y la industria del entretenimiento, deben llevar a cabo una serie de peligrosos atracos para sobrevivir en una ciudad implacable en la que no pueden confiar en nadie, y mucho menos los unos en los otros.",
    requirements: {
      minimum: "Intel Core 2 Quad CPU Q6600 @ 2.40GHz / AMD Phenom 9850 Quad-Core Processor @ 2.5GHz, 4 GB RAM, NVIDIA 9800 GT 1GB / AMD HD 4870 1GB",
      recommended: "Intel Core i5 3470 @ 3.2GHz / AMD X8 FX-8350 @ 4GHz, 8 GB RAM, NVIDIA GTX 660 2GB / AMD HD 7870 2GB"
    },
    minAge: "18+",
    devices: ["PC", "PS3", "PS4", "PS5", "Xbox 360", "Xbox One", "Xbox Series X/S"],
    downloadUrl: "https://www.rockstargames.com/gta-v",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Action-Adventure",
    rating: 4.8
  },
  {
    id: "red-dead-redemption-2",
    title: "Red Dead Redemption 2",
    description: "América, 1899. El fin de la era del salvaje oeste ha comenzado mientras los hombres de la ley persiguen a las últimas bandas de forajidos que quedan. Los que no se rinden o sucumben son asesinados.",
    requirements: {
      minimum: "Intel Core i5-2500K / AMD FX-6300, 8 GB RAM, Nvidia GeForce GTX 770 2GB / AMD Radeon R9 280 3GB",
      recommended: "Intel Core i7-4770K / AMD Ryzen 5 1500X, 12 GB RAM, Nvidia GeForce GTX 1060 6GB / AMD Radeon RX 480 4GB"
    },
    minAge: "18+",
    devices: ["PC", "PS4", "Xbox One"],
    downloadUrl: "https://www.rockstargames.com/reddeadredemption2",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Action-Adventure",
    rating: 4.9
  },
  {
    id: "the-witcher-3-wild-hunt",
    title: "The Witcher 3: Wild Hunt",
    description: "Eres Geralt de Rivia, cazador de monstruos a sueldo. Ante ti se extiende un continente devastado por la guerra e infestado de monstruos que puedes explorar a tu antojo.",
    requirements: {
      minimum: "Intel CPU Core i5-2500K 3.3GHz / AMD CPU Phenom II X4 940, 6 GB RAM, Nvidia GPU GeForce GTX 660 / AMD GPU Radeon HD 7870",
      recommended: "Intel CPU Core i7 3770 3.4 GHz / AMD CPU AMD FX-8350 4 GHz, 8 GB RAM, Nvidia GPU GeForce GTX 770 / AMD GPU Radeon R9 290"
    },
    minAge: "18+",
    devices: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S", "Switch"],
    downloadUrl: "https://www.thewitcher.com/en/witcher3",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "RPG",
    rating: 4.9
  },
  {
    id: "cyberpunk-2077",
    title: "Cyberpunk 2077",
    description: "Cyberpunk 2077 es un RPG de aventura y acción en mundo abierto ambientado en la megalópolis de Night City, donde encarnas a un mercenario cyberpunk envuelto en una lucha a vida o muerte por la supervivencia.",
    requirements: {
      minimum: "Intel Core i7-6700 / AMD Ryzen 5 1600, 12 GB RAM, GTX 1060 6GB / Radeon RX 580 8GB",
      recommended: "Intel Core i7-12700 / AMD Ryzen 7 7800X3D, 16 GB RAM, RTX 2060 SUPER / Radeon RX 5700 XT"
    },
    minAge: "18+",
    devices: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S"],
    downloadUrl: "https://www.cyberpunk.net/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "RPG",
    rating: 4.4
  },
  {
    id: "assassins-creed-valhalla",
    title: "Assassin's Creed Valhalla",
    description: "Conviértete en Eivor, un legendario saqueador vikingo en busca de gloria. Explora la Edad Oscura de Inglaterra mientras saqueas a tus enemigos, haces crecer tu asentamiento y consolidas tu poder político.",
    requirements: {
      minimum: "Intel i5-4460 / AMD Ryzen 3 1200, 8 GB RAM, GeForce GTX 960 / Radeon R9 380",
      recommended: "Intel i7-6700 / AMD Ryzen 7 1700, 8 GB RAM, GeForce GTX 1080 / Radeon RX Vega 64"
    },
    minAge: "18+",
    devices: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S"],
    downloadUrl: "https://www.ubisoft.com/en-us/game/assassins-creed/valhalla",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Action RPG",
    rating: 4.2
  },
  {
    id: "far-cry-6",
    title: "Far Cry 6",
    description: "Bienvenido a Yara, un paraíso tropical congelado en el tiempo. Como dictador de Yara, Antón Castillo tiene la intención de restaurar su nación a su antigua gloria por cualquier medio, con su hijo, Diego, siguiendo sus sangrientos pasos.",
    requirements: {
      minimum: "AMD Ryzen 3 1200 / Intel Core i5-4460, 8 GB RAM, AMD Radeon RX 460 / NVIDIA GeForce GTX 960",
      recommended: "AMD Ryzen 5 3600 / Intel Core i7-7700, 16 GB RAM, AMD Radeon RX Vega 64 / NVIDIA GeForce GTX 1080"
    },
    minAge: "18+",
    devices: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S"],
    downloadUrl: "https://www.ubisoft.com/en-us/game/far-cry/far-cry-6",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "FPS",
    rating: 4.1
  },
  {
    id: "halo-infinite",
    title: "Halo Infinite",
    description: "Cuando se pierde toda esperanza y el destino de la humanidad pende de un hilo, el Jefe Maestro está listo para enfrentarse al enemigo más despiadado que jamás haya conocido.",
    requirements: {
      minimum: "AMD Ryzen 5 1600 / Intel i5-4440, 8 GB RAM, AMD RX 570 / Nvidia GTX 1050 Ti",
      recommended: "AMD Ryzen 7 3700X / Intel i7-9700k, 16 GB RAM, AMD RX 5700 XT / Nvidia RTX 2070"
    },
    minAge: "16+",
    devices: ["PC", "Xbox One", "Xbox Series X/S"],
    downloadUrl: "https://www.halowaypoint.com/halo-infinite",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "FPS",
    rating: 4.0
  },
  {
    id: "sea-of-stars",
    title: "Sea of Stars",
    description: "Sea of Stars es un RPG por turnos inspirado en los clásicos. Cuenta la historia de dos Hijos del Solsticio que combinarán los poderes del sol y la luna para realizar Magia de Eclipse, la única fuerza capaz de defenderse de las monstruosas creaciones del malvado alquimista conocido como The Fleshmancer.",
    requirements: {
      minimum: "Intel Core i7-6700 / AMD Ryzen 5 3400G, 8 GB RAM, NVIDIA GeForce GTX 460 / Radeon HD 6850",
      recommended: "Intel Core i7-6700 / AMD Ryzen 5 3400G, 8 GB RAM, NVIDIA GeForce GTX 460 / Radeon HD 6850"
    },
    minAge: "7+",
    devices: ["PC", "Switch", "PS4", "PS5", "Xbox One", "Xbox Series X/S"],
    downloadUrl: "https://seaofstarsgame.co/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "RPG",
    rating: 4.8
  },
  {
    id: "lies-of-p",
    title: "Lies of P",
    description: "Lies of P es un emocionante soulslike que toma la historia de Pinocho, le da la vuelta y la sitúa en el elegante telón de fondo de la Belle Époque.",
    requirements: {
      minimum: "Intel Core i3-6300 / AMD Ryzen 3 1200, 8 GB RAM, GeForce GTX 960 / Radeon RX 460",
      recommended: "Intel Core i5-6600 / AMD Ryzen 5 3600, 16 GB RAM, GeForce RTX 2060 / Radeon RX 6700"
    },
    minAge: "16+",
    devices: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S"],
    downloadUrl: "https://www.liesofp.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Action RPG",
    rating: 4.7
  },
  {
    id: "remnant-2",
    title: "Remnant II",
    description: "Remnant II es la secuela del juego superventas Remnant: From the Ashes que enfrenta a los supervivientes de la humanidad contra nuevas criaturas mortales y jefes divinos en mundos aterradores.",
    requirements: {
      minimum: "Intel Core i5-7600 / AMD Ryzen 5 2600, 16 GB RAM, GeForce GTX 1650 / Radeon RX 590",
      recommended: "Intel i7-10700k / AMD Ryzen 7 3800X, 16 GB RAM, GeForce RTX 2060 / Radeon RX 5700"
    },
    minAge: "18+",
    devices: ["PC", "PS5", "Xbox Series X/S"],
    downloadUrl: "https://www.remnantgame.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Action RPG",
    rating: 4.5
  },
  {
    id: "street-fighter-6-extra",
    title: "Street Fighter 6",
    description: "¡Aquí llega el nuevo contendiente de Capcom! Street Fighter 6 se lanza en todo el mundo el 2 de junio de 2023 y representa la próxima evolución de la serie.",
    requirements: {
      minimum: "Intel Core i5-7500 / AMD Ryzen 3 1200, 8 GB RAM, GTX 1060 / RX 580",
      recommended: "Intel Core i7-8700 / AMD Ryzen 5 3600, 16 GB RAM, RTX 2070 / RX 5700 XT"
    },
    minAge: "12+",
    devices: ["PC", "PS4", "PS5", "Xbox Series X/S"],
    downloadUrl: "https://www.streetfighter.com/6/",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800",
    category: "Fighting",
    rating: 4.6
  }
];

export async function translateText(text: string, targetLang: string = "English"): Promise<string> {
  if (!apiKey) return text;
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Traduce el siguiente texto al idioma ${targetLang}. Responde solo con la traducción:\n\n${text}`,
    });
    return response.text || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

export async function searchGames(query: string): Promise<GameItem[]> {
  const cacheKey = `search-${query.toLowerCase()}`;
  
  if (gameCache[cacheKey] && (Date.now() - gameCache[cacheKey].timestamp < CACHE_MAX_AGE)) {
    return gameCache[cacheKey].data;
  }

  // Local search first for speed
  const localResults = STATIC_FALLBACK_GAMES.filter(g => 
    g.title.toLowerCase().includes(query.toLowerCase()) ||
    g.description.toLowerCase().includes(query.toLowerCase())
  );

  if (query.length < 3 && query !== "") return localResults;

  // If query is empty, return all static games
  if (query === "") return STATIC_FALLBACK_GAMES;

  if (!apiKey) return localResults;

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Busca una lista de 50 videojuegos reales que coincidan con la búsqueda "${query}". 
  Si la búsqueda es general, devuelve los juegos más populares de la historia.
  Proporciona información técnica real (requisitos, edad, dispositivos, descarga, descripción, imagen).
  Responde ÚNICAMENTE con un objeto JSON: { "games": [...] }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const text = response.text;
    if (!text) return localResults;

    const data = JSON.parse(text.replace(/```json\n?|```/g, "").trim());
    const results = [...localResults, ...(data.games || [])].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

    gameCache[cacheKey] = { data: results, timestamp: Date.now() };
    return results;
  } catch (error) {
    console.error("Search error:", error);
    return localResults;
  }
}
