// src/data/devilFruits.ts

export interface DevilFruitData {
  name: string;
  rarity: number; // 0.0 - 1.0
  type: 'Paramecia' | 'Zoan' | 'Logia';
  description: string;
}

export const DEVIL_FRUITS: DevilFruitData[] = [
  
  // ================================
  // 🌟 ZOAN MÍSTICAS (Rarity: 0.95-1.0)
  // ================================
  { 
    name: 'Hito Hito no Mi, Model: Nika', 
    rarity: 1.0, 
    type: 'Zoan',
    description: 'Permite ao usuário se transformar no lendário "Deus do Sol" Nika, concedendo propriedades de borracha e liberdade absoluta'
  },
  { 
    name: 'Kami Kami no Mi', 
    rarity: 1.0, 
    type: 'Zoan',
    description: 'Permite se transformar em uma divindade (extremamente rara)'
  },
  { 
    name: 'Uchuu Uchuu no Mi', 
    rarity: 0.99, 
    type: 'Paramecia',
    description: 'Permite manipular o espaço e criar portais dimensionais'
  },
  { 
    name: 'Umi Umi no Mi', 
    rarity: 0.98, 
    type: 'Logia',
    description: 'Permite controlar o mar (impossível devido ao Seastone)'
  },
  { 
    name: 'Tori Tori no Mi, Model: Phoenix', 
    rarity: 0.98, 
    type: 'Zoan',
    description: 'Permite se transformar em uma fênix azul com poderes de regeneração através de chamas curativas'
  },
  { 
    name: 'Inu Inu no Mi, Model: Okuchi no Makami', 
    rarity: 0.97, 
    type: 'Zoan',
    description: 'Permite se transformar no lendário lobo guardião, uma divindade protetora'
  },
  { 
    name: 'Hebi Hebi no Mi, Model: Yamata-no-Orochi', 
    rarity: 0.96, 
    type: 'Zoan',
    description: 'Permite se transformar na serpente mítica de oito cabeças e oito caudas'
  },
  { 
    name: 'Uo Uo no Mi, Model: Seiryu', 
    rarity: 0.95, 
    type: 'Zoan',
    description: 'Permite se transformar no dragão azul oriental, controlando elementos como fogo, vento e raios'
  },
  { 
    name: 'Hito Hito no Mi, Model: Daibutsu', 
    rarity: 0.95, 
    type: 'Zoan',
    description: 'Permite se transformar em um Buda dourado gigante com ondas de choque'
  },
  { 
    name: 'Jikan Jikan no Mi', 
    rarity: 0.95, 
    type: 'Paramecia',
    description: 'Permite manipular o tempo de forma mais avançada que a Toki Toki no Mi'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Eastern Dragon', 
    rarity: 0.94, 
    type: 'Zoan',
    description: 'Permite se transformar em um dragão oriental clássico'
  },
  { 
    name: 'Inochi Inochi no Mi', 
    rarity: 0.92, 
    type: 'Paramecia',
    description: 'Permite manipular a força vital e conceder vida verdadeira'
  },

  // ================================
  // 🦕 ZOAN ANCESTRAIS (Rarity: 0.75-0.85)
  // ================================
  { 
    name: 'Ryu Ryu no Mi, Model: Allosaurus', 
    rarity: 0.85, 
    type: 'Zoan',
    description: 'Permite se transformar em um Allosaurus, predador ancestral feroz'
  },
  { 
    name: 'Inu Inu no Mi, Model: Kyubi no Kitsune', 
    rarity: 0.85, 
    type: 'Zoan',
    description: 'Permite se transformar na raposa mítica de nove caudas'
  },
  { 
    name: 'Nami Nami no Mi', 
    rarity: 0.85, 
    type: 'Logia',
    description: 'Permite controlar ondas e marés'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Spinosaurus', 
    rarity: 0.84, 
    type: 'Zoan',
    description: 'Permite se transformar em um Spinosaurus, maior predador terrestre'
  },
  { 
    name: 'Honoo Honoo no Mi', 
    rarity: 0.84, 
    type: 'Logia',
    description: 'Permite controlar chamas sagradas que queimam a alma'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Pteranodon', 
    rarity: 0.83, 
    type: 'Zoan',
    description: 'Permite se transformar em um Pteranodon, réptil voador ancestral'
  },
  { 
    name: 'Zou Zou no Mi, Model: Mammoth', 
    rarity: 0.82, 
    type: 'Zoan',
    description: 'Permite se transformar em um mamute lanoso gigante'
  },
  { 
    name: 'Kori Kori no Mi', 
    rarity: 0.82, 
    type: 'Logia',
    description: 'Permite controlar gelo eterno que nunca derrete'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Brachiosaurus', 
    rarity: 0.81, 
    type: 'Zoan',
    description: 'Permite se transformar em um Brachiosaurus, dinossauro herbívoro gigante'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Triceratops', 
    rarity: 0.80, 
    type: 'Zoan',
    description: 'Permite se transformar em um Triceratops com chifres perfurantes'
  },
  { 
    name: 'Uma Uma no Mi, Model: Pegasus', 
    rarity: 0.80, 
    type: 'Zoan',
    description: 'Permite se transformar em Pégaso, cavalo alado mítico'
  },
  { 
    name: 'Denki Denki no Mi', 
    rarity: 0.80, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em eletricidade pura'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Pachycephalosaurus', 
    rarity: 0.79, 
    type: 'Zoan',
    description: 'Permite se transformar em um Pachycephalosaurus com cabeça blindada'
  },
  { 
    name: 'Kumo Kumo no Mi, Model: Rosamygale Grauvogeli', 
    rarity: 0.78, 
    type: 'Zoan',
    description: 'Permite se transformar em uma tarântula ancestral gigante'
  },
  { 
    name: 'Kinzoku Kinzoku no Mi', 
    rarity: 0.78, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em metal líquido'
  },
  { 
    name: 'Neko Neko no Mi, Model: Saber Tiger', 
    rarity: 0.77, 
    type: 'Zoan',
    description: 'Permite se transformar em um tigre dente-de-sabre'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Carnotaurus', 
    rarity: 0.76, 
    type: 'Zoan',
    description: 'Permite se transformar em um Carnotaurus, predador veloz'
  },
  { 
    name: 'Zou Zou no Mi, Model: Mastodon', 
    rarity: 0.75, 
    type: 'Zoan',
    description: 'Permite se transformar em um mastodonte ancestral'
  },
  { 
    name: 'Kumo Kumo no Mi', 
    rarity: 0.75, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em nuvens'
  },
  { 
    name: 'Shima Shima no Mi', 
    rarity: 0.75, 
    type: 'Paramecia',
    description: 'Permite se transformar em uma ilha e controlá-la'
  },
  { 
    name: 'Tsuchi Tsuchi no Mi', 
    rarity: 0.75, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em terra e rochas'
  },

  // ================================
  // ⚡ LOGIAS (Rarity: 0.65-0.92)
  // ================================
  { 
    name: 'Yami Yami no Mi', 
    rarity: 0.92, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em trevas, anulando outros poderes de Devil Fruit'
  },
  { 
    name: 'Mizu Mizu no Mi', 
    rarity: 0.90, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em água (teoricamente impossível)'
  },
  { 
    name: 'Raiden Raiden no Mi', 
    rarity: 0.88, 
    type: 'Logia',
    description: 'Permite controlar raios e tempestades elétricas'
  },
  { 
    name: 'Goro Goro no Mi', 
    rarity: 0.88, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em eletricidade, movendo-se à velocidade da luz'
  },
  { 
    name: 'Pika Pika no Mi', 
    rarity: 0.87, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em luz, atacando à velocidade da luz'
  },
  { 
    name: 'Magu Magu no Mi', 
    rarity: 0.86, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em magma, superior ao fogo em temperatura'
  },
  { 
    name: 'Mori Mori no Mi', 
    rarity: 0.85, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em floresta, criando plantas e árvores'
  },
  { 
    name: 'Mera Mera no Mi', 
    rarity: 0.82, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em fogo, criando chamas intensas'
  },
  { 
    name: 'Hie Hie no Mi', 
    rarity: 0.81, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em gelo, congelando tudo ao redor'
  },
  { 
    name: 'Suna Suna no Mi', 
    rarity: 0.75, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em areia, absorvendo umidade'
  },
  { 
    name: 'Moku Moku no Mi', 
    rarity: 0.72, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em fumaça densa'
  },
  { 
    name: 'Gasu Gasu no Mi', 
    rarity: 0.70, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em vários tipos de gases'
  },
  { 
    name: 'Yuki Yuki no Mi', 
    rarity: 0.68, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em neve, criando tempestades'
  },
  { 
    name: 'Numa Numa no Mi', 
    rarity: 0.67, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em lama viscosa'
  },
  { 
    name: 'Ame Ame no Mi', 
    rarity: 0.66, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em chuva e água'
  },
  { 
    name: 'Kaze Kaze no Mi', 
    rarity: 0.65, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em vento'
  },

  // ================================
  // 🌟 PARAMECIAS ESPECIAIS (Rarity: 0.75-0.90)
  // ================================
  { 
    name: 'Gura Gura no Mi', 
    rarity: 0.90, 
    type: 'Paramecia',
    description: 'Permite criar terremotos e ondas de choque devastadoras, considerada a mais destrutiva'
  },
  { 
    name: 'Ope Ope no Mi', 
    rarity: 0.89, 
    type: 'Paramecia',
    description: 'Permite criar uma "sala" onde o usuário pode manipular tudo, incluindo cirurgia da imortalidade'
  },
  { 
    name: 'Soru Soru no Mi', 
    rarity: 0.87, 
    type: 'Paramecia',
    description: 'Permite manipular almas, dar vida a objetos e roubar anos de vida'
  },
  { 
    name: 'Zushi Zushi no Mi', 
    rarity: 0.86, 
    type: 'Paramecia',
    description: 'Permite controlar a gravidade, criando buracos negros e meteoros'
  },
  { 
    name: 'Nikyu Nikyu no Mi', 
    rarity: 0.85, 
    type: 'Paramecia',
    description: 'Permite repelir qualquer coisa com almofadas nas mãos, incluindo dor e fadiga'
  },
  { 
    name: 'Hobi Hobi no Mi', 
    rarity: 0.84, 
    type: 'Paramecia',
    description: 'Permite transformar pessoas em brinquedos e apagar suas memórias'
  },
  { 
    name: 'Toki Toki no Mi', 
    rarity: 0.83, 
    type: 'Paramecia',
    description: 'Permite viajar no tempo apenas para o futuro'
  },
  { 
    name: 'Yomi Yomi no Mi', 
    rarity: 0.82, 
    type: 'Paramecia',
    description: 'Permite ressuscitar uma vez após a morte e manipular a alma'
  },
  { 
    name: 'Mochi Mochi no Mi', 
    rarity: 0.81, 
    type: 'Paramecia',
    description: 'Permite criar e controlar mochi, funcionando como uma Logia especial'
  },
  { 
    name: 'Ito Ito no Mi', 
    rarity: 0.80, 
    type: 'Paramecia',
    description: 'Permite criar e controlar fios extremamente resistentes, controlando pessoas'
  },
  { 
    name: 'Memo Memo no Mi', 
    rarity: 0.79, 
    type: 'Paramecia',
    description: 'Permite manipular e extrair memórias como filmes físicos'
  },
  { 
    name: 'Mira Mira no Mi', 
    rarity: 0.78, 
    type: 'Paramecia',
    description: 'Permite criar espelhos e viajar através do mundo dos espelhos'
  },
  { 
    name: 'Buku Buku no Mi', 
    rarity: 0.77, 
    type: 'Paramecia',
    description: 'Permite manipular livros e aprisionar pessoas dentro deles'
  },
  { 
    name: 'Shibo Shibo no Mi', 
    rarity: 0.76, 
    type: 'Paramecia',
    description: 'Permite drenar líquidos de qualquer coisa, incluindo pessoas'
  },
  { 
    name: 'Netsu Netsu no Mi', 
    rarity: 0.75, 
    type: 'Paramecia',
    description: 'Permite absorver e transferir calor de qualquer fonte'
  },

  // ================================
  // 🔵 PARAMECIAS PODEROSAS (Rarity: 0.55-0.74)
  // ================================
  { 
    name: 'Mero Mero no Mi', 
    rarity: 0.74, 
    type: 'Paramecia',
    description: 'Permite petrificar pessoas através da paixão e atração'
  },
  { 
    name: 'Doku Doku no Mi', 
    rarity: 0.73, 
    type: 'Paramecia',
    description: 'Permite criar e controlar venenos mortais de vários tipos'
  },
  { 
    name: 'Kage Kage no Mi', 
    rarity: 0.72, 
    type: 'Paramecia',
    description: 'Permite manipular sombras, roubar almas e criar zumbis'
  },
  { 
    name: 'Horu Horu no Mi', 
    rarity: 0.71, 
    type: 'Paramecia',
    description: 'Permite manipular hormônios do corpo, alterando gênero e emoções'
  },
  { 
    name: 'Fuwa Fuwa no Mi', 
    rarity: 0.70, 
    type: 'Paramecia',
    description: 'Permite fazer objetos não-vivos levitarem e controlá-los'
  },
  { 
    name: 'Shiku Shiku no Mi', 
    rarity: 0.70, 
    type: 'Paramecia',
    description: 'Permite infectar pessoas com qualquer doença'
  },
  { 
    name: 'Hito Hito no Mi, Model: Giant', 
    rarity: 0.70, 
    type: 'Zoan',
    description: 'Permite se transformar em um gigante humano'
  },
  { 
    name: 'Chiyu Chiyu no Mi', 
    rarity: 0.69, 
    type: 'Paramecia',
    description: 'Permite curar ferimentos instantaneamente através de lágrimas'
  },
  { 
    name: 'Bari Bari no Mi', 
    rarity: 0.68, 
    type: 'Paramecia',
    description: 'Permite criar barreiras impenetráveis de vários tamanhos'
  },
  { 
    name: 'Nagi Nagi no Mi', 
    rarity: 0.67, 
    type: 'Paramecia',
    description: 'Permite anular todos os sons em uma área específica'
  },
  { 
    name: 'Suke Suke no Mi', 
    rarity: 0.66, 
    type: 'Paramecia',
    description: 'Permite se tornar invisível junto com tudo que toca'
  },
  { 
    name: 'Hito Hito no Mi, Model: Fishman', 
    rarity: 0.65, 
    type: 'Zoan',
    description: 'Permite se transformar em homem-peixe'
  },
  { 
    name: 'Wapu Wapu no Mi', 
    rarity: 0.65, 
    type: 'Paramecia',
    description: 'Permite teletransportar pessoas marcadas'
  },
  { 
    name: 'Horo Horo no Mi', 
    rarity: 0.65, 
    type: 'Paramecia',
    description: 'Permite criar fantasmas que drenam a moral e atravessam objetos'
  },
  { 
    name: 'Kira Kira no Mi', 
    rarity: 0.64, 
    type: 'Paramecia',
    description: 'Permite transformar partes do corpo em diamante'
  },
  { 
    name: 'Goe Goe no Mi', 
    rarity: 0.63, 
    type: 'Paramecia',
    description: 'Permite criar ondas sonoras destrutivas através da voz'
  },
  { 
    name: 'Kachi Kachi no Mi', 
    rarity: 0.62, 
    type: 'Paramecia',
    description: 'Permite endurecer o corpo e gerar calor intenso'
  },
  { 
    name: 'Nemu Nemu no Mi', 
    rarity: 0.61, 
    type: 'Paramecia',
    description: 'Permite induzir sono profundo e controlar sonhos'
  },
  { 
    name: 'Juku Juku no Mi', 
    rarity: 0.60, 
    type: 'Paramecia',
    description: 'Permite amadurecer e apodrecer qualquer coisa tocada'
  },
  { 
    name: 'Hito Hito no Mi, Model: Mink', 
    rarity: 0.60, 
    type: 'Zoan',
    description: 'Permite se transformar em mink antropomórfico'
  },
  { 
    name: 'Mini Mini no Mi', 
    rarity: 0.60, 
    type: 'Paramecia',
    description: 'Permite diminuir drasticamente de tamanho'
  },
  { 
    name: 'Atsu Atsu no Mi', 
    rarity: 0.59, 
    type: 'Paramecia',
    description: 'Permite gerar calor extremo do corpo'
  },
  { 
    name: 'Noko Noko no Mi', 
    rarity: 0.58, 
    type: 'Paramecia',
    description: 'Permite criar e controlar esporos venenosos'
  },
  { 
    name: 'Ami Ami no Mi', 
    rarity: 0.57, 
    type: 'Paramecia',
    description: 'Permite criar redes extremamente resistentes'
  },
  { 
    name: 'Kopi Kopi no Mi', 
    rarity: 0.56, 
    type: 'Paramecia',
    description: 'Permite copiar habilidades de outras pessoas'
  },
  { 
    name: 'Kibi Kibi no Mi', 
    rarity: 0.55, 
    type: 'Paramecia',
    description: 'Permite criar dango que domestica animais instantaneamente'
  },
  { 
    name: 'Mosa Mosa no Mi', 
    rarity: 0.55, 
    type: 'Paramecia',
    description: 'Permite acelerar drasticamente o crescimento de plantas'
  },
  { 
    name: 'Pamu Pamu no Mi', 
    rarity: 0.55, 
    type: 'Paramecia',
    description: 'Permite fazer qualquer parte do corpo inchar e explodir'
  },
  { 
    name: 'Ken Ken no Mi', 
    rarity: 0.55, 
    type: 'Paramecia',
    description: 'Permite criar e controlar espadas de energia'
  },

  // ================================
  // 🟡 PARAMECIAS COMUNS (Rarity: 0.35-0.54)
  // ================================
  { 
    name: 'Gomu Gomu no Mi', 
    rarity: 0.54, 
    type: 'Paramecia',
    description: 'Torna o corpo de borracha, imune a eletricidade e ataques contundentes'
  },
  { 
    name: 'Hana Hana no Mi', 
    rarity: 0.53, 
    type: 'Paramecia',
    description: 'Permite fazer brotar partes do corpo em qualquer superfície'
  },
  { 
    name: 'Bara Bara no Mi', 
    rarity: 0.52, 
    type: 'Paramecia',
    description: 'Permite separar o corpo em pedaços, imune a cortes'
  },
  { 
    name: 'Sube Sube no Mi', 
    rarity: 0.51, 
    type: 'Paramecia',
    description: 'Torna a pele extremamente lisa, desviando ataques'
  },
  { 
    name: 'Bomu Bomu no Mi', 
    rarity: 0.50, 
    type: 'Paramecia',
    description: 'Permite fazer qualquer parte do corpo explodir'
  },
  { 
    name: 'Riki Riki no Mi', 
    rarity: 0.50, 
    type: 'Paramecia',
    description: 'Concede força sobre-humana proporcional ao usuário'
  },
  { 
    name: 'Buki Buki no Mi', 
    rarity: 0.50, 
    type: 'Paramecia',
    description: 'Permite transformar partes do corpo em qualquer arma'
  },
  { 
    name: 'Yari Yari no Mi', 
    rarity: 0.50, 
    type: 'Paramecia',
    description: 'Permite criar e controlar lanças perfurantes'
  },
  { 
    name: 'Kiro Kiro no Mi', 
    rarity: 0.49, 
    type: 'Paramecia',
    description: 'Permite alterar o peso corporal de 1kg a 10.000kg'
  },
  { 
    name: 'Doru Doru no Mi', 
    rarity: 0.48, 
    type: 'Paramecia',
    description: 'Permite criar e controlar cera extremamente dura'
  },
  { 
    name: 'Baku Baku no Mi', 
    rarity: 0.47, 
    type: 'Paramecia',
    description: 'Permite comer e digerir qualquer coisa, incorporando propriedades'
  },
  { 
    name: 'Mane Mane no Mi', 
    rarity: 0.46, 
    type: 'Paramecia',
    description: 'Permite copiar perfeitamente a aparência de outras pessoas'
  },
  { 
    name: 'Supa Supa no Mi', 
    rarity: 0.45, 
    type: 'Paramecia',
    description: 'Permite transformar partes do corpo em lâminas de aço'
  },
  { 
    name: 'Tate Tate no Mi', 
    rarity: 0.45, 
    type: 'Paramecia',
    description: 'Permite criar escudos impenetráveis'
  },
  { 
    name: 'Toge Toge no Mi', 
    rarity: 0.44, 
    type: 'Paramecia',
    description: 'Permite criar espinhos afiados em qualquer parte do corpo'
  },
  { 
    name: 'Ori Ori no Mi', 
    rarity: 0.43, 
    type: 'Paramecia',
    description: 'Permite criar gaiolas e algemas de ferro'
  },
  { 
    name: 'Bane Bane no Mi', 
    rarity: 0.42, 
    type: 'Paramecia',
    description: 'Transforma as pernas em molas poderosas'
  },
  { 
    name: 'Noro Noro no Mi', 
    rarity: 0.41, 
    type: 'Paramecia',
    description: 'Permite desacelerar objetos e pessoas por 30 segundos'
  },
  { 
    name: 'Doa Doa no Mi', 
    rarity: 0.40, 
    type: 'Paramecia',
    description: 'Permite criar portas em qualquer superfície, incluindo ar'
  },
  { 
    name: 'Ton Ton no Mi', 
    rarity: 0.40, 
    type: 'Paramecia',
    description: 'Permite aumentar drasticamente o peso corporal'
  },
  { 
    name: 'Yumi Yumi no Mi', 
    rarity: 0.40, 
    type: 'Paramecia',
    description: 'Permite criar arcos e flechas de energia'
  },
  { 
    name: 'Awa Awa no Mi', 
    rarity: 0.39, 
    type: 'Paramecia',
    description: 'Permite criar bolhas de sabão que drenam força'
  },
  { 
    name: 'Beri Beri no Mi', 
    rarity: 0.38, 
    type: 'Paramecia',
    description: 'Permite separar o corpo em esferas como bagas'
  },
  { 
    name: 'Sabi Sabi no Mi', 
    rarity: 0.37, 
    type: 'Paramecia',
    description: 'Permite enferrujar e corroer metais instantaneamente'
  },
  { 
    name: 'Shari Shari no Mi', 
    rarity: 0.36, 
    type: 'Paramecia',
    description: 'Permite transformar partes do corpo em rodas giratórias'
  },
  { 
    name: 'Fuku Fuku no Mi', 
    rarity: 0.35, 
    type: 'Paramecia',
    description: 'Permite criar e controlar roupas'
  },

  // ================================
  // 🟢 PARAMECIAS BÁSICAS (Rarity: 0.15-0.34)
  // ================================
  { 
    name: 'Kama Kama no Mi', 
    rarity: 0.34, 
    type: 'Paramecia',
    description: 'Permite criar lâminas de vento cortantes com as unhas'
  },
  { 
    name: 'Utau Utau no Mi', 
    rarity: 0.33, 
    type: 'Paramecia',
    description: 'Permite hipnotizar e controlar pessoas através do canto'
  },
  { 
    name: 'Kyubu Kyubu no Mi', 
    rarity: 0.32, 
    type: 'Paramecia',
    description: 'Permite absorver umidade de qualquer coisa'
  },
  { 
    name: 'Modo Modo no Mi', 
    rarity: 0.31, 
    type: 'Paramecia',
    description: 'Permite retornar objetos ao estado anterior'
  },
  { 
    name: 'Peto Peto no Mi', 
    rarity: 0.29, 
    type: 'Paramecia',
    description: 'Permite controlar qualquer animal tocado'
  },
  { 
    name: 'Jara Jara no Mi', 
    rarity: 0.28, 
    type: 'Paramecia',
    description: 'Permite criar correntes e grilhões'
  },
  { 
    name: 'Iro Iro no Mi', 
    rarity: 0.27, 
    type: 'Paramecia',
    description: 'Permite camuflar-se mudando de cor'
  },
  { 
    name: 'Guru Guru no Mi', 
    rarity: 0.26, 
    type: 'Paramecia',
    description: 'Permite criar hélices em qualquer parte do corpo'
  },
  { 
    name: 'Beta Beta no Mi', 
    rarity: 0.25, 
    type: 'Paramecia',
    description: 'Permite criar e controlar substâncias pegajosas'
  },
  { 
    name: 'Hira Hira no Mi', 
    rarity: 0.24, 
    type: 'Paramecia',
    description: 'Permite fazer qualquer coisa ondular como uma bandeira'
  },
  { 
    name: 'Ishi Ishi no Mi', 
    rarity: 0.23, 
    type: 'Paramecia',
    description: 'Permite assimilar e controlar pedras'
  },
  { 
    name: 'Nui Nui no Mi', 
    rarity: 0.22, 
    type: 'Paramecia',
    description: 'Permite costurar qualquer coisa como tecido'
  },
  { 
    name: 'Giro Giro no Mi', 
    rarity: 0.21, 
    type: 'Paramecia',
    description: 'Permite ver através de qualquer coisa e ler mentes'
  },
  { 
    name: 'Ato Ato no Mi', 
    rarity: 0.20, 
    type: 'Paramecia',
    description: 'Permite transformar pessoas e objetos em arte'
  },
  { 
    name: 'Hiso Hiso no Mi', 
    rarity: 0.20, 
    type: 'Paramecia',
    description: 'Permite se comunicar com animais'
  },
  { 
    name: 'Jake Jake no Mi', 
    rarity: 0.19, 
    type: 'Paramecia',
    description: 'Permite se transformar em uma jaqueta e controlar quem a veste'
  },
  { 
    name: 'Pocket Pocket no Mi', 
    rarity: 0.18, 
    type: 'Paramecia',
    description: 'Permite criar bolsos em qualquer parte do corpo'
  },
  { 
    name: 'Bisu Bisu no Mi', 
    rarity: 0.17, 
    type: 'Paramecia',
    description: 'Permite criar e controlar biscoitos extremamente duros'
  },
  { 
    name: 'Pero Pero no Mi', 
    rarity: 0.16, 
    type: 'Paramecia',
    description: 'Permite criar e controlar doces e caramelos'
  },
  { 
    name: 'Bata Bata no Mi', 
    rarity: 0.15, 
    type: 'Paramecia',
    description: 'Permite criar e controlar manteiga'
  },

  // ================================
  // 🦁 ZOAN COMUNS (Rarity: 0.15-0.45)
  // ================================
  { 
    name: 'Hito Hito no Mi', 
    rarity: 0.45, 
    type: 'Zoan',
    description: 'Permite se transformar em humano, concedendo inteligência'
  },
  { 
    name: 'Tori Tori no Mi, Model: Falcon', 
    rarity: 0.42, 
    type: 'Zoan',
    description: 'Permite se transformar em falcão, ideal para voo e velocidade'
  },
  { 
    name: 'Inu Inu no Mi, Model: Dachshund', 
    rarity: 0.40, 
    type: 'Zoan',
    description: 'Permite se transformar em dachshund (salsicha)'
  },
  { 
    name: 'Mogu Mogu no Mi', 
    rarity: 0.38, 
    type: 'Zoan',
    description: 'Permite se transformar em toupeira, ideal para escavação'
  },
  { 
    name: 'Inu Inu no Mi, Model: Jackal', 
    rarity: 0.36, 
    type: 'Zoan',
    description: 'Permite se transformar em chacal do deserto'
  },
  { 
    name: 'Uma Uma no Mi', 
    rarity: 0.35, 
    type: 'Zoan',
    description: 'Permite se transformar em cavalo, aumentando velocidade'
  },
  { 
    name: 'Neko Neko no Mi, Model: Leopard', 
    rarity: 0.34, 
    type: 'Zoan',
    description: 'Permite se transformar em leopardo, predador ágil'
  },
  { 
    name: 'Zou Zou no Mi', 
    rarity: 0.33, 
    type: 'Zoan',
    description: 'Permite se transformar em elefante, força bruta'
  },
  { 
    name: 'Inu Inu no Mi, Model: Wolf', 
    rarity: 0.32, 
    type: 'Zoan',
    description: 'Permite se transformar em lobo, predador em matilha'
  },
  { 
    name: 'Ushi Ushi no Mi, Model: Giraffe', 
    rarity: 0.31, 
    type: 'Zoan',
    description: 'Permite se transformar em girafa, alcance e altura'
  },
  { 
    name: 'Hebi Hebi no Mi, Model: King Cobra', 
    rarity: 0.30, 
    type: 'Zoan',
    description: 'Permite se transformar em cobra real venenosa'
  },
  { 
    name: 'Hebi Hebi no Mi, Model: Anaconda', 
    rarity: 0.29, 
    type: 'Zoan',
    description: 'Permite se transformar em anaconda gigante'
  },
  { 
    name: 'Mushi Mushi no Mi, Model: Kabutomushi', 
    rarity: 0.28, 
    type: 'Zoan',
    description: 'Permite se transformar em besouro rinoceronte'
  },
  { 
    name: 'Mushi Mushi no Mi, Model: Suzumebachi', 
    rarity: 0.27, 
    type: 'Zoan',
    description: 'Permite se transformar em vespa gigante'
  },
  { 
    name: 'Tori Tori no Mi, Model: Albatross', 
    rarity: 0.26, 
    type: 'Zoan',
    description: 'Permite se transformar em albatroz, voo de longa distância'
  },
  { 
    name: 'Inu Inu no Mi, Model: Tanuki', 
    rarity: 0.25, 
    type: 'Zoan',
    description: 'Permite se transformar em tanuki (cão-guaxinim)'
  },
  { 
    name: 'Sara Sara no Mi, Model: Axolotl', 
    rarity: 0.24, 
    type: 'Zoan',
    description: 'Permite se transformar em axolote, regeneração aquática'
  },
  { 
    name: 'Ushi Ushi no Mi, Model: Bison', 
    rarity: 0.23, 
    type: 'Zoan',
    description: 'Permite se transformar em bisão americano'
  },
  { 
    name: 'Tori Tori no Mi, Model: Eagle', 
    rarity: 0.22, 
    type: 'Zoan',
    description: 'Permite se transformar em águia, predador aéreo'
  },
  { 
    name: 'Kuma Kuma no Mi', 
    rarity: 0.21, 
    type: 'Zoan',
    description: 'Permite se transformar em urso, força e resistência'
  },
  { 
    name: 'Batto Batto no Mi, Model: Vampire', 
    rarity: 0.20, 
    type: 'Zoan',
    description: 'Permite se transformar em morcego vampiro'
  },
  { 
    name: 'Neko Neko no Mi, Model: Lion', 
    rarity: 0.19, 
    type: 'Zoan',
    description: 'Permite se transformar em leão, rei dos animais'
  },
  { 
    name: 'Tori Tori no Mi, Model: Raven', 
    rarity: 0.18, 
    type: 'Zoan',
    description: 'Permite se transformar em corvo inteligente'
  },
  { 
    name: 'Hebi Hebi no Mi, Model: Viper', 
    rarity: 0.17, 
    type: 'Zoan',
    description: 'Permite se transformar em víbora venenosa'
  },
  { 
    name: 'Neko Neko no Mi, Model: Tiger', 
    rarity: 0.16, 
    type: 'Zoan',
    description: 'Permite se transformar em tigre feroz'
  },
  { 
    name: 'Saru Saru no Mi', 
    rarity: 0.15, 
    type: 'Zoan',
    description: 'Permite se transformar em macaco ágil'
  },

  // ================================
  // 🔄 DEVIL FRUITS ARTIFICIAIS SMILE (Rarity: 0.05-0.15)
  // ================================
  { 
    name: 'SMILE - Lion', 
    rarity: 0.15, 
    type: 'Zoan',
    description: 'Devil Fruit artificial - Leão (defeituosa, transformação parcial)'
  },
   { 
    name: 'SMILE - Elephant', 
    rarity: 0.14, 
    type: 'Zoan',
    description: 'Devil Fruit artificial - Elefante (defeituosa, transformação parcial)'
  },
  { 
    name: 'SMILE - Gazelle', 
    rarity: 0.13, 
    type: 'Zoan',
    description: 'Devil Fruit artificial - Gazela (defeituosa, transformação parcial)'
  },
  { 
    name: 'SMILE - Gorilla', 
    rarity: 0.12, 
    type: 'Zoan',
    description: 'Devil Fruit artificial - Gorila (defeituosa, transformação parcial)'
  },
  { 
    name: 'SMILE - Hippo', 
    rarity: 0.11, 
    type: 'Zoan',
    description: 'Devil Fruit artificial - Hipopótamo (defeituosa, transformação parcial)'
  },
  { 
    name: 'SMILE - Spider', 
    rarity: 0.10, 
    type: 'Zoan',
    description: 'Devil Fruit artificial - Aranha (defeituosa, transformação parcial)'
  },
  { 
    name: 'SMILE - Snake', 
    rarity: 0.09, 
    type: 'Zoan',
    description: 'Devil Fruit artificial - Cobra (defeituosa, transformação parcial)'
  },
  { 
    name: 'SMILE - Chicken', 
    rarity: 0.08, 
    type: 'Zoan',
    description: 'Devil Fruit artificial - Galinha (defeituosa, transformação parcial)'
  },
  { 
    name: 'SMILE - Giraffe', 
    rarity: 0.07, 
    type: 'Zoan',
    description: 'Devil Fruit artificial - Girafa (defeituosa, transformação parcial)'
  },
  { 
    name: 'SMILE - Sheep', 
    rarity: 0.06, 
    type: 'Zoan',
    description: 'Devil Fruit artificial - Ovelha (defeituosa, transformação parcial)'
  },
  { 
    name: 'SMILE - Bat', 
    rarity: 0.05, 
    type: 'Zoan',
    description: 'Devil Fruit artificial - Morcego (defeituosa, transformação parcial)'
  }
];

export default DEVIL_FRUITS;