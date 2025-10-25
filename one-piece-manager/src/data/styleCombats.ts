// src/data/styleCombats.ts

export interface StyleCombatData {
  name: string;
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
  skill: number;
  armHaki: number;
  obsHaki: number;
}

export const STYLES: StyleCombatData[] = [
  // ✅ COMBATENTES - Foco em Attack e Skill
  { 
    name: 'Combatente - Artes marciais', 
    attack: 6,        // Alto dano corpo a corpo
    defense: 3,       // Defesa moderada
    speed: 4,         // Velocidade boa
    intelligence: 2,  // Inteligência baixa
    skill: 5,         // Alta técnica
    armHaki: 5,       // Haki ofensivo forte
    obsHaki: 3        // Haki defensivo moderado
  },
  
  { 
    name: 'Combatente - Mestre em armadilhas', 
    attack: 4,        // Dano moderado
    defense: 2,       // Defesa baixa
    speed: 3,         // Velocidade moderada
    intelligence: 6,  // Alta inteligência para armadilhas
    skill: 5,         // Alta técnica
    armHaki: 3,       // Haki ofensivo moderado
    obsHaki: 5        // Haki para detectar inimigos
  },
  
  { 
    name: 'Combatente - Cyborg', 
    attack: 5,        // Alto dano tecnológico
    defense: 5,       // Alta defesa mecânica
    speed: 3,         // Velocidade moderada
    intelligence: 4,  // Inteligência boa
    skill: 3,         // Técnica moderada
    armHaki: 4,       // Haki ofensivo bom
    obsHaki: 4        // Haki equilibrado
  },

  // ✅ ESPADACHINS - Foco em Speed e Attack
  { 
    name: 'Espadachim - Estilo de 1 espada', 
    attack: 5,        // Alto dano com precisão
    defense: 3,       // Defesa moderada
    speed: 6,         // Velocidade muito alta
    intelligence: 3,  // Inteligência moderada
    skill: 3,         // Técnica moderada
    armHaki: 4,       // Haki para cortes
    obsHaki: 4        // Haki para esquivas
  },
  
  { 
    name: 'Espadachim - Estilo de 2 espadas', 
    attack: 4,        // Dano distribuído
    defense: 4,       // Defesa melhor (2 espadas)
    speed: 5,         // Velocidade alta
    intelligence: 2,  // Inteligência baixa
    skill: 5,         // Alta técnica (coordenação)
    armHaki: 4,       // Haki ofensivo
    obsHaki: 4        // Haki defensivo
  },
  
  { 
    name: 'Espadachim - Estilo de 3 espadas', 
    attack: 6,        // Dano máximo
    defense: 2,       // Defesa baixa (estilo arriscado)
    speed: 4,         // Velocidade boa
    intelligence: 2,  // Inteligência baixa
    skill: 6,         // Técnica máxima
    armHaki: 5,       // Haki ofensivo forte
    obsHaki: 3        // Haki defensivo menor
  },

  // ✅ ATIRADORES - Foco em Speed e Intelligence
  { 
    name: 'Atirador - Pistola', 
    attack: 4,        // Dano moderado
    defense: 2,       // Defesa baixa
    speed: 5,         // Velocidade alta
    intelligence: 4,  // Inteligência para mira
    skill: 5,         // Alta precisão
    armHaki: 2,       // Haki ofensivo baixo
    obsHaki: 6        // Haki para mira perfeita
  },
  
  { 
    name: 'Atirador - Rifle', 
    attack: 6,        // Alto dano à distância
    defense: 2,       // Defesa baixa
    speed: 3,         // Velocidade moderada
    intelligence: 5,  // Alta inteligência
    skill: 4,         // Boa técnica
    armHaki: 3,       // Haki ofensivo moderado
    obsHaki: 5        // Haki para longa distância
  },
  
  { 
    name: 'Atirador - Armas improvisadas', 
    attack: 3,        // Dano variável
    defense: 3,       // Defesa moderada
    speed: 4,         // Velocidade boa
    intelligence: 6,  // Inteligência máxima (criatividade)
    skill: 4,         // Boa adaptabilidade
    armHaki: 2,       // Haki ofensivo baixo
    obsHaki: 6        // Haki para improvisação
  },

  // ✅ SUPORTE - Foco em Defense e Intelligence
  { 
    name: 'Suporte - Utensílios', 
    attack: 2,        // Dano baixo
    defense: 4,       // Defesa boa
    speed: 3,         // Velocidade moderada
    intelligence: 6,  // Inteligência máxima
    skill: 5,         // Alta técnica com ferramentas
    armHaki: 3,       // Haki ofensivo moderado
    obsHaki: 5        // Haki para suporte
  },
  
  { 
    name: 'Suporte - Tanque', 
    attack: 3,        // Dano baixo-moderado
    defense: 7,       // Defesa máxima
    speed: 1,         // Velocidade baixa
    intelligence: 4,  // Inteligência boa
    skill: 5,         // Boa técnica defensiva
    armHaki: 5,       // Haki defensivo forte
    obsHaki: 3        // Haki ofensivo menor
  },
  
  { 
    name: 'Suporte - Cura', 
    attack: 1,        // Dano mínimo
    defense: 5,       // Defesa alta
    speed: 4,         // Velocidade boa (mobilidade)
    intelligence: 6,  // Inteligência máxima
    skill: 4,         // Boa técnica médica
    armHaki: 2,       // Haki ofensivo baixo
    obsHaki: 6        // Haki para diagnóstico
  }
];

export default STYLES;