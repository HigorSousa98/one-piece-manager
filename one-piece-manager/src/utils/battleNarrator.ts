// src/utils/battleNarrator.ts
// Immersive battle narration for One Piece battles

interface MovePool {
  normal: string[]
  critical: string[]
  defeat: string[]
  dodge: string[]
  lowHp: string[]
}

const STYLE_MOVES: Record<string, MovePool> = {
  'Artes marciais': {
    normal: [
      'desfere um soco fulminante',
      'lança um uppercut explosivo no queixo',
      'aplica uma joelhada brutal no tronco',
      'executa uma rasteira implacável',
      'golpeia com um direto avassalador',
      'lança uma sequência de socos rápidos como um furacão',
      'salta e desce com um golpe aéreo esmagador',
    ],
    critical: [
      'RAJADA METEÓRICA',
      'PUNHO DO DRAGÃO',
      'SEIS MARES — GOLPE FINAL',
      'TÉCNICA PROIBIDA: PUNHO ARDENTE',
      'FURACÃO IMPARÁVEL',
      'GOLPE DO TROVÃO',
    ],
    defeat: [
      'desmorona após o último soco, incapaz de continuar',
      'cai de joelhos — os pés não sustentam mais o peso da derrota',
      'é lançado pelo ar e pousa inconsciente no chão',
      'jaz imóvel, os punhos ainda cerrados mesmo na derrota',
    ],
    dodge: [
      'esquiva no último segundo com instinto puro de combatente',
      'gira o corpo evitando o golpe por milímetros',
      'recua com agilidade impressionante, saindo do alcance',
    ],
    lowHp: [
      'mesmo sangrando, mantém os punhos erguidos',
      'cospe sangue mas o olhar não perde a chama',
      'sorri — um guerreiro de verdade não cai facilmente',
    ],
  },

  'Mestre em armadilhas': {
    normal: [
      'aciona uma armadilha oculta no chão',
      'dispara um cabo de aço escondido',
      'lança redes reforçadas',
      'ativa uma bomba de fumaça perturbadora',
      'usa o ambiente como extensão letal de sua estratégia',
      'aciona mecanismos ocultos ao redor',
    ],
    critical: [
      'LABIRINTO DA MORTE',
      'TEIA EXPLOSIVA — ARMADILHA FINAL',
      'CILADA DO CAÇADOR SUPREMO',
      'SISTEMA DE ARMADILHAS TOTAL',
      'CAMPO MINADO: SEM SAÍDA',
    ],
    defeat: [
      'é capturado em suas próprias armadilhas e perde a consciência',
      'fica preso, sem escapatória — a estratégia chegou ao fim',
      'as armadilhas se voltam contra seu criador — derrota irônica',
    ],
    dodge: [
      'usa uma porta falsa para escapar no último instante',
      'desaparece em uma cortina de fumaça',
      'ativa um mecanismo de evasão previamente preparado',
    ],
    lowHp: [
      'ainda pensa com frieza mesmo sangrando — a mente é a última arma',
      'sorri — sua última armadilha ainda não foi acionada',
    ],
  },

  'Cyborg': {
    normal: [
      'dispara canhões embutidos no braço de aço',
      'aciona turbinas mecânicas e avança como um projétil',
      'lança bombas do compartimento interno do torso',
      'usa superforça mecânica para um soco devastador',
      'ativa lasers de precisão nos olhos biônicos',
      'sobrepõe motor extra e cobra velocidade impossível',
    ],
    critical: [
      'MODO DE COMBATE MÁXIMO ATIVADO',
      'DISPARO GERAL DE ARMAMENTOS',
      'SOBRECARGA ELETROMAGNÉTICA',
      'CANHÃO ESPECIAL: TIRO FATAL',
      'SISTEMA SUPREMO: FUSÃO TOTAL',
    ],
    defeat: [
      'os sistemas entram em colapso — desligamento de emergência',
      'o núcleo de energia falha — o guerreiro de metal silencia',
      'os circuitos queimam e o exoesqueleto para de responder',
    ],
    dodge: [
      'ativa escudo de aço reforçado no antebraço',
      'aciona propulsores traseiros e esquiva com precisão mecânica',
      'projeta um campo eletromagnético repelindo o golpe',
    ],
    lowHp: [
      'os sistemas de alerta piscam em vermelho — mas ainda funciona',
      'a armadura está amassada, o núcleo segura por mais um pouco',
    ],
  },

  'Estilo de 1 espada': {
    normal: [
      'lança um corte horizontal veloz',
      'executa um corte diagonal poderoso e limpo',
      'aplica uma estocada precisa como um raio',
      'desliza e corta em um único movimento fluido',
      'gira e desfere um corte giratório sem aviso',
      'faz a lâmina cantar no ar com um golpe ascendente',
    ],
    critical: [
      'ESPÍRITO DA ESPADA — CORTE RELÂMPAGO',
      'TÉCNICA SUPREMA: CORTE DO HORIZONTE',
      'ESTILO ÚNICO: FENDA DO VENTO',
      'GOLPE FINAL: RAJADA DA LUA',
      'CORTE SUBLIME: UM COM A LÂMINA',
    ],
    defeat: [
      'cai com a espada ainda na mão, derrotado pela lâmina superior',
      'ajoelha-se — o fio da espada foi mais veloz que sua defesa',
      'a espada cai — e junto com ela, o guerreiro',
    ],
    dodge: [
      'usa a espada para deflectir o golpe no último instante',
      'recua com um passo fluido, evitando o corte por centímetros',
      'gira o pulso desviando a lâmina inimiga',
    ],
    lowHp: [
      'a espada treme mas o olhar permanece afiado como a lâmina',
      'segura a espada com as duas mãos — é tudo ou nada',
    ],
  },

  'Estilo de 2 espadas': {
    normal: [
      'cruza as duas lâminas num corte duplo devastador',
      'ataca com movimentos em X, imprevisíveis e rápidos',
      'dança entre as espadas confundindo os reflexos do adversário',
      'desfere golpes alternados com as duas lâminas em harmonia',
      'usa as duas lâminas como extensão de cada braço',
    ],
    critical: [
      'DANÇA DAS DUAS LÂMINAS — CORTE CRUZADO',
      'TÉCNICA DUPLA: FENDA DA LUA CHEIA',
      'GOLPE SINCRONIZADO: RELÂMPAGO DUPLO',
      'CORTE EM ESPIRAL — TÉCNICA PROIBIDA',
      'DUAS LÂMINAS, UMA ALMA: GOLPE PERFEITO',
    ],
    defeat: [
      'as duas espadas caem ao chão — esgotado além dos limites',
      'é atingido entre as defesas das duas lâminas — acabou',
      'o ritmo das duas lâminas para — e ele cai com elas',
    ],
    dodge: [
      'usa uma espada para bloquear e a outra para ripostar em um flash',
      'gira as duas lâminas criando uma redoma de aço impenetrável',
    ],
    lowHp: [
      'uma das espadas está lascada, mas ainda lutará até o fim',
      'o equilíbrio das duas lâminas vacila — mas não para',
    ],
  },

  'Estilo de 3 espadas': {
    normal: [
      'ataca com as três espadas simultâneas como um furacão',
      'executa um corte tripartido feroz e sem precedentes',
      'gira como um tornado de lâminas cortando tudo ao redor',
      'desfere um golpe devastador com a espada na boca',
      'as três lâminas cantam em uníssono num ataque mortal',
    ],
    critical: [
      'SANZEN SEKAI — TRÊS MIL MUNDOS',
      'HIRYU KAEN — DRAGÃO VOADOR EM CHAMAS',
      'ULTRA TYGRE HAUGEN',
      'CORTE DOS NOVE VENTOS',
      'TÉCNICA SUPREMA: CORTE DA MORTE',
      'ASPAS DO DIABO: AS TRÊS LÂMINAS EM SINCRONIA',
    ],
    defeat: [
      'as três espadas tremem — a técnica foi superior em todos os aspectos',
      'cai cortado pelo próprio redemoinho de lâminas que criou',
      'as três lâminas se calam — e junto com elas, o guerreiro',
    ],
    dodge: [
      'usa as três lâminas para criar uma barreira de aço impenetrável',
      'gira as três espadas em escudo giratório que deflecte tudo',
    ],
    lowHp: [
      'sangra por três frentes mas os três gumes ainda brilham',
      'a terceira espada ainda está embainhada — ainda há reservas',
    ],
  },

  'Atirador - Pistola': {
    normal: [
      'dispara com mira milimétrica',
      'solta uma rajada precisa de tiros',
      'dá um tiro certeiro em ponto vital',
      'atira em pleno movimento com precisão impossível',
      'seis tiros, seis alvos — não desperdiça uma bala',
    ],
    critical: [
      'TIRO PERFEITO — PONTO CEGO',
      'RAJADA EXPLOSIVA — FOGO CONTÍNUO',
      'DISPARO FANTASMA: INVISÍVEL AOS OLHOS',
      'TÉCNICA DO ATIRADOR: TIRO DA MORTE',
      'TROCA DE MÃOS: TIRO DUPLO SIMULTÂNEO',
    ],
    defeat: [
      'fica sem munição e desaba — o tambor vazio ecoa no silêncio',
      'é atingido antes de puxar o gatilho — tudo acontece rápido demais',
      'cai, a pistola ainda fumegando na mão',
    ],
    dodge: [
      'se joga ao chão esquivando dos contra-ataques',
      'usa um obstáculo próximo como cobertura',
      'rola e reaparece em ângulo diferente',
    ],
    lowHp: [
      'a mão treme, mas o olho ainda mira com frieza',
      'carrega o último tambor — cada bala precisa contar',
    ],
  },

  'Atirador - Rifle': {
    normal: [
      'atira de longa distância com precisão cirúrgica',
      'dispara uma bala perfurante de alto impacto',
      'mira nos pontos vitais com calma absoluta',
      'dispara em sequência sem perder a precisão',
      'usa a distância como vantagem mortal',
    ],
    critical: [
      'TIRO DE ÉLITE: ALÉM DO ALCANCE VISUAL',
      'BALA EXPLOSIVA — IMPACTO MÁXIMO',
      'TÉCNICA DO ATIRADOR LENDÁRIO',
      'TIRO IMPOSSÍVEL — ALÉM DO LIMITE HUMANO',
      'PROJÉTIL DO DESTINO: UM ÚNICO DISPARO',
    ],
    defeat: [
      'não consegue recarregar a tempo — um tiro que nunca saiu',
      'é flanqueado no ângulo morto e derrubado',
      'o rifle cai e com ele vai a última esperança',
    ],
    dodge: [
      'usa o rifle como escudo no último momento possível',
      'rola para o lado com agilidade inesperada para um atirador',
    ],
    lowHp: [
      'sangra mas o olho de atirador permanece frio e calculista',
      'só precisa de um disparo a mais — só um',
    ],
  },

  'Armas improvisadas': {
    normal: [
      'lança um objeto do ambiente com força surpreendente',
      'improvisa uma arma com o que está ao redor',
      'usa estilingue artesanal para disparar projéteis inesperados',
      'usa o terreno com criatividade mortal',
      'pega o que vier à mão e converte em ameaça',
    ],
    critical: [
      'ARSENAL IMPROVISADO — ATAQUE TOTAL',
      'CRIATIVIDADE EXTREMA: TUDO VIRA ARMA',
      'TÉCNICA: CHUVA DE PROJÉTEIS',
      'INVENÇÃO DO DESESPERO: GOLPE FINAL',
    ],
    defeat: [
      'fica sem material ao redor e é subjugado',
      'a criatividade chegou ao limite — não há mais nada para improvisar',
      'a última invenção não foi suficiente — cai derrotado',
    ],
    dodge: [
      'usa um escudo improvisado de caixotes e madeira',
      'desvia usando objetos ao redor como trampolim',
    ],
    lowHp: [
      'olha ao redor — ainda há material para trabalhar',
      'improvisa um curativo rápido enquanto mantém a guarda',
    ],
  },

  'Suporte - Utensílios': {
    normal: [
      'arremessa utensílios com precisão surpreendente',
      'usa ferramentas de maneira letal e inesperada',
      'lança especiarias irritantes nos olhos do adversário',
      'golpeia com uma frigideira — força absurda para um cozinheiro',
      'usa chutes flamejantes potencializados pela culinária de combate',
    ],
    critical: [
      'CHUTE FLAMEJANTE — TÉCNICA CULINÁRIA DE COMBATE',
      'ARSENAL DE COZINHA: MODO COMBATE TOTAL',
      'GOLPE DE MESTRE: UTENSÍLIOS VIVOS',
      'RECEITA PROIBIDA: ATAQUE FINAL DO CHEF',
    ],
    defeat: [
      'os utensílios voam mas não são suficientes — derrota com honra',
      'é derrubado, os instrumentos espalhados como um banquete perdido',
    ],
    dodge: [
      'usa uma frigideira como escudo improvisado refletindo o golpe',
      'cria uma cortina de vapor para se ocultar e reposicionar',
    ],
    lowHp: [
      'ainda tem temperos para lançar — a batalha está longe do fim',
      'o cozinheiro mais perigoso dos mares não desiste facilmente',
    ],
  },

  'Suporte - Tanque': {
    normal: [
      'avança como uma muralha viva inabalável',
      'absorve o golpe e contra-ataca com força bruta impiedosa',
      'usa o próprio corpo colossal como fortaleza viva',
      'golpeia com um soco carregado de toda sua massa',
      'empurra o adversário como uma locomotiva de carne e osso',
    ],
    critical: [
      'BARREIRA HUMANA — CONTRA-ATAQUE TOTAL',
      'INVESTIDA DO COLOSSO',
      'IMPACTO SÍSMICO: O CHÃO TREME',
      'MURO VIVO — GOLPE SEM RETORNO',
      'TERREMOTO HUMANO: FORÇA MÁXIMA',
    ],
    defeat: [
      'a muralha finalmente cede — houve um golpe que ultrapassou todos os limites',
      'ajoelha-se como um castelo ancestral que finalmente desmorona',
      'o colosso cai — e a terra parece tremer com o impacto',
    ],
    dodge: [
      'absorve o golpe com o corpo blindado sem recuar um passo',
      'não esquiva — suporta o impacto com o peito e olha nos olhos',
    ],
    lowHp: [
      'está ferido mas os pés não se movem — não retrocede nem um passo',
      'a armadura está amassada, o corpo dói — mas não cai',
    ],
  },

  'Suporte - Cura': {
    normal: [
      'lança compostos médicos perturbadores',
      'usa conhecimento anatômico para golpear nervos específicos',
      'aplica um golpe cirúrgico em ponto vital com precisão',
      'paralisa temporariamente o adversário com técnica médica',
      'atinge o sistema nervoso central com precisão de cirurgião',
    ],
    critical: [
      'TÉCNICA MÉDICA DE COMBATE: PONTO VITAL',
      'DIAGNÓSTICO LETAL — FRAQUEZA EXPOSTA',
      'CIRURGIA DE CAMPO: ATAQUE SUPREMO',
      'PODER DO MÉDICO: CURA VOLTADA PARA A DESTRUIÇÃO',
    ],
    defeat: [
      'os limites do corpo humano foram atingidos — até o médico adoece',
      'a cura não basta — cai inconsciente, corpo e mente no limite',
      'o bisturi cai — e junto com ele, o curandeiro',
    ],
    dodge: [
      'analisa o movimento com olhos médicos e esquiva com precisão cirúrgica',
      'usa conhecimento anatômico para evitar o golpe mais crítico',
    ],
    lowHp: [
      'diagnostica suas próprias feridas — e continua assim mesmo',
      'o médico sabe exatamente o quanto pode aguentar — ainda não chegou lá',
    ],
  },
}

const DEFAULT_POOL: MovePool = {
  normal: [
    'desfere um golpe poderoso',
    'ataca com força total',
    'lança um ataque sem hesitação',
    'avança com determinação absoluta',
  ],
  critical: [
    'GOLPE CRÍTICO — ATAQUE MÁXIMO',
    'TÉCNICA SUPREMA: SEM VOLTA',
    'GOLPE FINAL',
  ],
  defeat: [
    'cai derrotado, a luta chegou ao fim',
    'não consegue continuar — é o fim',
    'desaba, sem forças para se erguer',
  ],
  dodge: [
    'esquiva no último instante',
    'evita o golpe por puro instinto',
  ],
  lowHp: [
    'ainda de pé, ainda respirando',
    'os olhos queimam com determinação inabalável',
  ],
}

// Naval narration by character type
const NAVAL_ATTACKS: Record<string, string[]> = {
  Pirate: [
    'avança rugindo e desfere um golpe selvagem no convés inimigo',
    'brada o nome de sua tripulação e ataca com fúria pirata',
    'salta do mastro e cai sobre o inimigo como uma âncora',
    'usa o sabre com a brutalidade característica dos piratas dos Grandes Mares',
    'avança sem hesitar — a bandeira pirata tremula ao fundo',
  ],
  Marine: [
    'executa uma técnica de combate naval treinada com rigor',
    'avança em posição de guarda perfeita e golpeia com disciplina',
    'usa a disciplina militar para desferir um golpe frio e calculado',
    'comanda a carga com autoridade de oficial da Marinha',
    'mantém a formação e ataca com eficiência militar',
  ],
  BountyHunter: [
    'mira no ponto fraco com olhos de caçador experiente',
    'usa correntes e ferramentas de captura como extensão da luta',
    'avança com a frieza de quem já viu mil batalhas e saiu de pé',
    'calcula cada movimento — caçadores não desperdiçam esforço',
  ],
  Government: [
    'usa técnicas secretas reservadas aos agentes de elite',
    'executa um golpe que só agentes do governo conhecem',
    'avança com autoridade absoluta — a lei é sua arma',
  ],
  default: [
    'avança e ataca com força',
    'desfere um golpe direto sem vacilar',
  ],
}

const NAVAL_ATMOSPHERE: string[] = [
  'Os canhões retumbam e a madeira dos navios racha com violência!',
  'O mar ao redor tingiu-se de espuma com os impactos das lutas!',
  'A bandeira pirata tremula enquanto a batalha se intensifica no convés!',
  'Tiros de canhão cruzam os céus nublados entre os dois navios!',
  'O convés está coberto de estilhaços — a batalha é caótica e feroz!',
  'Cordas se rompem e velas caem enquanto os guerreiros duelam!',
  'O rugido das ondas se mistura com os gritos dos combatentes!',
  'Os dois cascos se chocam e os guerreiros saltam de um navio a outro!',
  'O vento uiva e carrega o cheiro de pólvora pela batalha!',
  'A fumaça dos canhões envolve tudo — só os sons de batalha orientam!',
]

const CAPTAIN_BATTLE_LINES: string[] = [
  'O capitão entra em campo — o moral da tripulação explode como uma chama!',
  'O capitão mostra porque lidera: força e carisma sem igual nos Grandes Mares!',
  'Quando o capitão avança, toda a tripulação sente o coração queimar!',
  'O capitão não foge da linha de frente — lidera pelo exemplo!',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getPool(styleName: string | undefined): MovePool {
  if (!styleName) return DEFAULT_POOL
  const key = Object.keys(STYLE_MOVES).find((k) => styleName.includes(k))
  return key ? STYLE_MOVES[key] : DEFAULT_POOL
}

export const BattleNarrator = {
  getAttackLine(
    attackerName: string,
    styleName: string | undefined,
    damage: number,
    isCrit: boolean,
    armHakiBonus: number,
    defenderHp: number,
    defenderMaxHp: number,
  ): string {
    const pool = getPool(styleName)
    const isLow = defenderHp > 0 && defenderHp < defenderMaxHp * 0.25

    if (isCrit && armHakiBonus > 0) {
      const technique = pick(pool.critical)
      return `🔥 ${attackerName} — ${technique}! ${damage} de dano revestido com Haki Armado! (+${armHakiBonus})`
    }
    if (isCrit) {
      const technique = pick(pool.critical)
      return `⚡ CRÍTICO! ${attackerName} — ${technique}! ${damage} de dano!`
    }

    const action = pick(pool.normal)
    const pressureNote = isLow ? ` "${pick(pool.lowHp)}..."` : ''
    return `${attackerName} ${action}, causando ${damage} de dano!${pressureNote}`
  },

  getDodgeLine(dodgerName: string, styleName: string | undefined): string {
    const pool = getPool(styleName)
    return `👁️ ${dodgerName} ${pick(pool.dodge)} com o Haki da Observação!`
  },

  getDefeatLine(loserName: string, styleName: string | undefined): string {
    const pool = getPool(styleName)
    return `💀 ${loserName} ${pick(pool.defeat)}`
  },

  getNavalRoundLines(
    playerFighter: { name: string; type: string; position: string },
    enemyFighter: { name: string; type: string; position: string },
    round: number,
  ): string[] {
    const lines: string[] = []

    lines.push(`--- Round ${round} ---`)

    // Naval atmosphere (35% chance)
    if (Math.random() < 0.35) {
      lines.push(`🌊 ${pick(NAVAL_ATMOSPHERE)}`)
    }

    // Captain morale bonus (25% chance)
    if (
      Math.random() < 0.25 &&
      (playerFighter.position === 'Captain' || enemyFighter.position === 'Captain')
    ) {
      const captain =
        playerFighter.position === 'Captain' ? playerFighter : enemyFighter
      lines.push(`⚓ ${captain.name}: ${pick(CAPTAIN_BATTLE_LINES)}`)
    }

    // Player attack
    const playerAttacks = NAVAL_ATTACKS[playerFighter.type] ?? NAVAL_ATTACKS['default']
    lines.push(`⚔️ ${playerFighter.name} ${pick(playerAttacks)}!`)

    // Enemy counterattack (75% chance)
    if (Math.random() < 0.75) {
      const enemyAttacks = NAVAL_ATTACKS[enemyFighter.type] ?? NAVAL_ATTACKS['default']
      lines.push(`🛡️ ${enemyFighter.name} ${pick(enemyAttacks)} em resposta!`)
    }

    return lines
  },
}
