// src/data/devilFruits.ts

export interface DevilFruitData {
  name: string;
  rarity: number; // 0.0 - 1.0
  type: 'Paramecia' | 'Zoan' | 'Logia';
  description: string;
}

export const DEVIL_FRUITS: DevilFruitData[] = [
  // FRUTAS LENDÁRIAS E MÍTICAS (Raridade 0.90+)
  { 
    name: 'Hito Hito no Mi, Model: Nika', 
    rarity: 1, 
    type: 'Zoan',
    description: 'Permite ao usuário se transformar no lendário "Deus do Sol" Nika, concedendo propriedades de borracha e liberdade absoluta'
  },
  { 
    name: 'Kami Kami no Mi', 
    rarity: 1, 
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
    name: 'Tori Tori no Mi, Model: Thunderbird', 
    rarity: 0.93, 
    type: 'Zoan',
    description: 'Permite se transformar na ave mítica que controla tempestades'
  },
  { 
    name: 'Yami Yami no Mi', 
    rarity: 0.92, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em trevas, anulando outros poderes de Devil Fruit'
  },
  { 
    name: 'Inochi Inochi no Mi', 
    rarity: 0.92, 
    type: 'Paramecia',
    description: 'Permite manipular a força vital e conceder vida verdadeira'
  },
  { 
    name: 'Inu Inu no Mi, Model: Kyubi no Kitsune', 
    rarity: 0.92, 
    type: 'Zoan',
    description: 'Permite se transformar na raposa mítica de nove caudas'
  },
  { 
    name: 'Uma Uma no Mi, Model: Pegasus', 
    rarity: 0.91, 
    type: 'Zoan',
    description: 'Permite se transformar em Pégaso, cavalo alado mítico'
  },
  { 
    name: 'Uma Uma no Mi, Model: Unicorn', 
    rarity: 0.91, 
    type: 'Zoan',
    description: 'Permite se transformar em unicórnio com poderes de purificação'
  },
  { 
    name: 'Gura Gura no Mi', 
    rarity: 0.9, 
    type: 'Paramecia',
    description: 'Permite criar terremotos e ondas de choque devastadoras, considerada a mais destrutiva'
  },
  { 
    name: 'Neko Neko no Mi, Model: Sphinx', 
    rarity: 0.9, 
    type: 'Zoan',
    description: 'Permite se transformar na esfinge mítica com enigmas mortais'
  },

  // LOGIAS SUPREMAS E AVANÇADAS
  { 
    name: 'Ope Ope no Mi', 
    rarity: 0.89, 
    type: 'Paramecia',
    description: 'Permite criar uma "sala" onde o usuário pode manipular tudo, incluindo cirurgia da imortalidade'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Hydra', 
    rarity: 0.89, 
    type: 'Zoan',
    description: 'Permite se transformar na hidra de múltiplas cabeças'
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
    name: 'Tori Tori no Mi, Model: Garuda', 
    rarity: 0.88, 
    type: 'Zoan',
    description: 'Permite se transformar na ave divina Garuda'
  },
  { 
    name: 'Unmei Unmei no Mi', 
    rarity: 0.88, 
    type: 'Paramecia',
    description: 'Permite alterar probabilidades e destinos'
  },
  { 
    name: 'Pika Pika no Mi', 
    rarity: 0.87, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em luz, atacando à velocidade da luz'
  },
  { 
    name: 'Soru Soru no Mi', 
    rarity: 0.87, 
    type: 'Paramecia',
    description: 'Permite manipular almas, dar vida a objetos e roubar anos de vida'
  },
  { 
    name: 'Hebi Hebi no Mi, Model: Quetzalcoatl', 
    rarity: 0.87, 
    type: 'Zoan',
    description: 'Permite se transformar na serpente emplumada asteca'
  },
  { 
    name: 'Magu Magu no Mi', 
    rarity: 0.86, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em magma, superior ao fogo em temperatura'
  },
  { 
    name: 'Zushi Zushi no Mi', 
    rarity: 0.86, 
    type: 'Paramecia',
    description: 'Permite controlar a gravidade, criando buracos negros e meteoros'
  },
  { 
    name: 'Inu Inu no Mi, Model: Fenrir', 
    rarity: 0.86, 
    type: 'Zoan',
    description: 'Permite se transformar no lobo gigante da mitologia nórdica'
  },
  { 
    name: 'Nami Nami no Mi', 
    rarity: 0.85, 
    type: 'Logia',
    description: 'Permite controlar ondas e marés'
  },
  { 
    name: 'Nikyu Nikyu no Mi', 
    rarity: 0.85, 
    type: 'Paramecia',
    description: 'Permite repelir qualquer coisa com almofadas nas mãos, incluindo dor e fadiga'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Allosaurus', 
    rarity: 0.85, 
    type: 'Zoan',
    description: 'Permite se transformar em um Allosaurus, predador ancestral feroz'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Tyrannosaurus Rex', 
    rarity: 0.85, 
    type: 'Zoan',
    description: 'Permite se transformar no rei dos dinossauros'
  },
  { 
    name: 'Neko Neko no Mi, Model: Manticore', 
    rarity: 0.85, 
    type: 'Zoan',
    description: 'Permite se transformar na criatura com corpo de leão e cauda venenosa'
  },
  { 
    name: 'Sekai Sekai no Mi', 
    rarity: 0.85, 
    type: 'Paramecia',
    description: 'Permite criar mundos de bolso temporários'
  },
  { 
    name: 'Genjitsu Genjitsu no Mi', 
    rarity: 0.85, 
    type: 'Paramecia',
    description: 'Permite alterar a realidade em pequena escala'
  },
  { 
    name: 'Honoo Honoo no Mi', 
    rarity: 0.84, 
    type: 'Logia',
    description: 'Permite controlar chamas sagradas que queimam a alma'
  },
  { 
    name: 'Hobi Hobi no Mi', 
    rarity: 0.84, 
    type: 'Paramecia',
    description: 'Permite transformar pessoas em brinquedos e apagar suas memórias'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Spinosaurus', 
    rarity: 0.84, 
    type: 'Zoan',
    description: 'Permite se transformar em um Spinosaurus, maior predador terrestre'
  },
  { 
    name: 'Uma Uma no Mi, Model: Sleipnir', 
    rarity: 0.84, 
    type: 'Zoan',
    description: 'Permite se transformar no cavalo de oito patas de Odin'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Pteranodon', 
    rarity: 0.83, 
    type: 'Zoan',
    description: 'Permite se transformar em um Pteranodon, réptil voador ancestral'
  },
  { 
    name: 'Toki Toki no Mi', 
    rarity: 0.83, 
    type: 'Paramecia',
    description: 'Permite viajar no tempo apenas para o futuro'
  },
  { 
    name: 'Tori Tori no Mi, Model: Simurgh', 
    rarity: 0.83, 
    type: 'Zoan',
    description: 'Permite se transformar na ave mítica persa'
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
    name: 'Yomi Yomi no Mi', 
    rarity: 0.82, 
    type: 'Paramecia',
    description: 'Permite ressuscitar uma vez após a morte e manipular a alma'
  },
  { 
    name: 'Ushi Ushi no Mi, Model: Minotaur', 
    rarity: 0.82, 
    type: 'Zoan',
    description: 'Permite se transformar no minotauro do labirinto'
  },
  { 
    name: 'Kokuu Kokuu no Mi', 
    rarity: 0.82, 
    type: 'Paramecia',
    description: 'Permite criar vácuo e anular matéria'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Brachiosaurus', 
    rarity: 0.81, 
    type: 'Zoan',
    description: 'Permite se transformar em um Brachiosaurus, dinossauro herbívoro gigante'
  },
  { 
    name: 'Mochi Mochi no Mi', 
    rarity: 0.81, 
    type: 'Paramecia',
    description: 'Permite criar e controlar mochi, funcionando como uma Logia especial'
  },
  { 
    name: 'Hebi Hebi no Mi, Model: Jormungandr', 
    rarity: 0.81, 
    type: 'Zoan',
    description: 'Permite se transformar na serpente mundial nórdica'
  },
  { 
    name: 'Denki Denki no Mi', 
    rarity: 0.8, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em eletricidade pura'
  },
  { 
    name: 'Ito Ito no Mi', 
    rarity: 0.8, 
    type: 'Paramecia',
    description: 'Permite criar e controlar fios extremamente resistentes, controlando pessoas'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Triceratops', 
    rarity: 0.8, 
    type: 'Zoan',
    description: 'Permite se transformar em um Triceratops com chifres perfurantes'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Wyvern', 
    rarity: 0.8, 
    type: 'Zoan',
    description: 'Permite se transformar em wyvern, dragão de duas patas'
  },
  { 
    name: 'Maho Maho no Mi', 
    rarity: 0.8, 
    type: 'Paramecia',
    description: 'Permite usar magia básica com limitações'
  },
  { 
    name: 'Sonzai Sonzai no Mi', 
    rarity: 0.8, 
    type: 'Paramecia',
    description: 'Permite apagar temporariamente a existência'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Pachycephalosaurus', 
    rarity: 0.79, 
    type: 'Zoan',
    description: 'Permite se transformar em um Pachycephalosaurus com cabeça blindada'
  },
  { 
    name: 'Memo Memo no Mi', 
    rarity: 0.79, 
    type: 'Paramecia',
    description: 'Permite manipular e extrair memórias como filmes físicos'
  },
  { 
    name: 'Ookami Ookami no Mi, Model: Cerberus', 
    rarity: 0.79, 
    type: 'Zoan',
    description: 'Permite se transformar no cão de três cabeças do submundo'
  },
  { 
    name: 'Tori Tori no Mi, Model: Quetzalcoatlus', 
    rarity: 0.79, 
    type: 'Zoan',
    description: 'Permite se transformar no maior pterossauro conhecido'
  },
  { 
    name: 'Bunshi Bunshi no Mi', 
    rarity: 0.79, 
    type: 'Paramecia',
    description: 'Permite manipular moléculas'
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
    name: 'Mira Mira no Mi', 
    rarity: 0.78, 
    type: 'Paramecia',
    description: 'Permite criar espelhos e viajar através do mundo dos espelhos'
  },
  { 
    name: 'Tori Tori no Mi, Model: Roc', 
    rarity: 0.78, 
    type: 'Zoan',
    description: 'Permite se transformar na ave gigante das Mil e Uma Noites'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Velociraptor', 
    rarity: 0.78, 
    type: 'Zoan',
    description: 'Permite se transformar em velociraptor, caçador em matilha'
  },
  { 
    name: 'Neko Neko no Mi, Model: Saber Tiger', 
    rarity: 0.77, 
    type: 'Zoan',
    description: 'Permite se transformar em um tigre dente-de-sabre'
  },
  { 
    name: 'Buku Buku no Mi', 
    rarity: 0.77, 
    type: 'Paramecia',
    description: 'Permite manipular livros e aprisionar pessoas dentro deles'
  },
  { 
    name: 'Kitsune Kitsune no Mi, Model: Inari', 
    rarity: 0.77, 
    type: 'Zoan',
    description: 'Permite se transformar na raposa divina japonesa'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Stegosaurus', 
    rarity: 0.77, 
    type: 'Zoan',
    description: 'Permite se transformar em estegossauro com placas defensivas'
  },
  { 
    name: 'Chikyuu Chikyuu no Mi', 
    rarity: 0.77, 
    type: 'Paramecia',
    description: 'Permite controlar placas tectônicas'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Carnotaurus', 
    rarity: 0.76, 
    type: 'Zoan',
    description: 'Permite se transformar em um Carnotaurus, predador veloz'
  },
  { 
    name: 'Shibo Shibo no Mi', 
    rarity: 0.76, 
    type: 'Paramecia',
    description: 'Permite drenar líquidos de qualquer coisa, incluindo pessoas'
  },
  { 
    name: 'Tatsu Tatsu no Mi, Model: Ryujin', 
    rarity: 0.76, 
    type: 'Zoan',
    description: 'Permite se transformar no deus dragão dos mares'
  },
  { 
    name: 'Ryu Ryu no Mi, Model: Ankylosaurus', 
    rarity: 0.76, 
    type: 'Zoan',
    description: 'Permite se transformar em anquilossauro blindado'
  },
  { 
    name: 'Denshi Denshi no Mi', 
    rarity: 0.76, 
    type: 'Paramecia',
    description: 'Permite controlar elétrons e campos eletromagnéticos'
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
  { 
    name: 'Netsu Netsu no Mi', 
    rarity: 0.75, 
    type: 'Paramecia',
    description: 'Permite absorver e transferir calor de qualquer fonte'
  },
  { 
    name: 'Oni Oni no Mi, Model: Raijin', 
    rarity: 0.75, 
    type: 'Zoan',
    description: 'Permite se transformar no demônio do trovão'
  },
  { 
    name: 'Kage Kage no Mi (Advanced)', 
    rarity: 0.75, 
    type: 'Paramecia',
    description: 'Permite viajar através das sombras'
  },
  { 
    name: 'Mori Mori no Mi', 
    rarity: 0.74, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em floresta, criando plantas e árvores'
  },
  { 
    name: 'Mero Mero no Mi', 
    rarity: 0.74, 
    type: 'Paramecia',
    description: 'Permite petrificar pessoas através da paixão e atração'
  },
  { 
    name: 'Tengu Tengu no Mi', 
    rarity: 0.74, 
    type: 'Zoan',
    description: 'Permite se transformar no guerreiro alado japonês'
  },
  { 
    name: 'Houshasen Houshasen no Mi', 
    rarity: 0.74, 
    type: 'Paramecia',
    description: 'Permite controlar radiação'
  },
  { 
    name: 'Plasma Plasma no Mi', 
    rarity: 0.73, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em plasma superaquecido'
  },
  { 
    name: 'Doku Doku no Mi', 
    rarity: 0.73, 
    type: 'Paramecia',
    description: 'Permite criar e controlar venenos mortais de vários tipos'
  },
  { 
    name: 'Kappa Kappa no Mi', 
    rarity: 0.73, 
    type: 'Zoan',
    description: 'Permite se transformar na criatura aquática japonesa'
  },
  { 
    name: 'Ryuushi Ryuushi no Mi', 
    rarity: 0.73, 
    type: 'Paramecia',
    description: 'Permite manipular partículas subatômicas'
  },
  { 
    name: 'Kaze Kaze no Mi', 
    rarity: 0.72, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em vento'
  },
  { 
    name: 'Kage Kage no Mi', 
    rarity: 0.72, 
    type: 'Paramecia',
    description: 'Permite manipular sombras, roubar almas e criar zumbis'
  },
  { 
    name: 'Baku Baku no Mi, Model: Dream Eater', 
    rarity: 0.72, 
    type: 'Zoan',
    description: 'Permite se transformar no devorador de pesadelos'
  },
  { 
    name: 'Jiba Jiba no Mi', 
    rarity: 0.72, 
    type: 'Paramecia',
    description: 'Permite controlar campos magnéticos'
  },
  { 
    name: 'Oto Oto no Mi', 
    rarity: 0.71, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em ondas sonoras'
  },
  { 
    name: 'Horu Horu no Mi', 
    rarity: 0.71, 
    type: 'Paramecia',
    description: 'Permite manipular hormônios do corpo, alterando gênero e emoções'
  },
  { 
    name: 'Yuki Yuki no Mi, Model: Yeti', 
    rarity: 0.71, 
    type: 'Zoan',
    description: 'Permite se transformar no abominável homem das neves'
  },
  { 
    name: 'Kasoku Kasoku no Mi', 
    rarity: 0.71, 
    type: 'Paramecia',
    description: 'Permite acelerar qualquer processo'
  },
  { 
    name: 'Fuwa Fuwa no Mi', 
    rarity: 0.7, 
    type: 'Paramecia',
    description: 'Permite fazer objetos não-vivos levitarem e controlá-los'
  },
  { 
    name: 'Shiku Shiku no Mi', 
    rarity: 0.7, 
    type: 'Paramecia',
    description: 'Permite infectar pessoas com qualquer doença'
  },
  { 
    name: 'Hito Hito no Mi, Model: Giant', 
    rarity: 0.7, 
    type: 'Zoan',
    description: 'Permite se transformar em um gigante humano'
  },
  { 
    name: 'Kiri Kiri no Mi', 
    rarity: 0.7, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em névoa densa'
  },
  { 
    name: 'Umare Umare no Mi', 
    rarity: 0.7, 
    type: 'Paramecia',
    description: 'Permite acelerar nascimentos e criação'
  },
  { 
    name: 'Mizu Mizu no Mi, Model: Kelpie', 
    rarity: 0.7, 
    type: 'Zoan',
    description: 'Permite se transformar no cavalo aquático escocês'
  },
  { 
    name: 'Mera Mera no Mi', 
    rarity: 0.69, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em fogo, criando chamas intensas'
  },
  { 
    name: 'Chiyu Chiyu no Mi', 
    rarity: 0.69, 
    type: 'Paramecia',
    description: 'Permite curar ferimentos instantaneamente através de lágrimas'
  },
  { 
    name: 'Teishi Teishi no Mi', 
    rarity: 0.69, 
    type: 'Paramecia',
    description: 'Permite parar qualquer movimento ou processo'
  },
  { 
    name: 'Hie Hie no Mi', 
    rarity: 0.68, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em gelo, congelando tudo ao redor'
  },
  { 
    name: 'Bari Bari no Mi', 
    rarity: 0.68, 
    type: 'Paramecia',
    description: 'Permite criar barreiras impenetráveis de vários tamanhos'
  },
  { 
    name: 'Yume Yume no Mi', 
    rarity: 0.68, 
    type: 'Paramecia',
    description: 'Permite entrar e controlar sonhos'
  },
  { 
    name: 'Gasu Gasu no Mi', 
    rarity: 0.67, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em vários tipos de gases'
  },
  { 
    name: 'Nagi Nagi no Mi', 
    rarity: 0.67, 
    type: 'Paramecia',
    description: 'Permite anular todos os sons em uma área específica'
  },
  { 
    name: 'Fukugen Fukugen no Mi', 
    rarity: 0.67, 
    type: 'Paramecia',
    description: 'Permite restaurar qualquer coisa ao estado original'
  },
  { 
    name: 'Yuki Yuki no Mi', 
    rarity: 0.66, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em neve, criando tempestades'
  },
  { 
    name: 'Suke Suke no Mi', 
    rarity: 0.66, 
    type: 'Paramecia',
    description: 'Permite se tornar invisível junto com tudo que toca'
  },
  { 
    name: 'Numa Numa no Mi', 
    rarity: 0.65, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em lama viscosa'
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
    name: 'Hito Hito no Mi, Model: Fishman', 
    rarity: 0.65, 
    type: 'Zoan',
    description: 'Permite se transformar em homem-peixe'
  },
  { 
    name: 'Kokoro Kokoro no Mi', 
    rarity: 0.65, 
    type: 'Paramecia',
    description: 'Permite ler e manipular emoções de outras pessoas'
  },
  { 
    name: 'Ame Ame no Mi', 
    rarity: 0.64, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em chuva e água'
  },
  { 
    name: 'Kira Kira no Mi', 
    rarity: 0.64, 
    type: 'Paramecia',
    description: 'Permite transformar partes do corpo em diamante'
  },
  { 
    name: 'Henka Henka no Mi', 
    rarity: 0.64, 
    type: 'Paramecia',
    description: 'Permite transformar materiais em outros'
  },
  { 
    name: 'Suna Suna no Mi', 
    rarity: 0.63, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em areia, absorvendo umidade'
  },
  { 
    name: 'Goe Goe no Mi', 
    rarity: 0.63, 
    type: 'Paramecia',
    description: 'Permite criar ondas sonoras destrutivas através da voz'
  },
  { 
    name: 'Moku Moku no Mi', 
    rarity: 0.62, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em fumaça densa'
  },
  { 
    name: 'Kachi Kachi no Mi', 
    rarity: 0.62, 
    type: 'Paramecia',
    description: 'Permite endurecer o corpo e gerar calor intenso'
  },
  { 
    name: 'Zoukyou Zoukyou no Mi', 
    rarity: 0.62, 
    type: 'Paramecia',
    description: 'Permite amplificar qualquer coisa'
  },
  { 
    name: 'Doro Doro no Mi', 
    rarity: 0.61, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em lama'
  },
  { 
    name: 'Nemu Nemu no Mi', 
    rarity: 0.61, 
    type: 'Paramecia',
    description: 'Permite induzir sono profundo e controlar sonhos'
  },
  { 
    name: 'Shukushou Shukushou no Mi', 
    rarity: 0.61, 
    type: 'Paramecia',
    description: 'Permite diminuir qualquer coisa'
  },
  { 
    name: 'Hai Hai no Mi', 
    rarity: 0.6, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em cinzas'
  },
  { 
    name: 'Juku Juku no Mi', 
    rarity: 0.6, 
    type: 'Paramecia',
    description: 'Permite amadurecer e apodrecer qualquer coisa tocada'
  },
  { 
    name: 'Hito Hito no Mi, Model: Mink', 
    rarity: 0.6, 
    type: 'Zoan',
    description: 'Permite se transformar em mink antropomórfico'
  },
  { 
    name: 'Mini Mini no Mi', 
    rarity: 0.6, 
    type: 'Paramecia',
    description: 'Permite diminuir drasticamente de tamanho'
  },
  { 
    name: 'Kagi Kagi no Mi', 
    rarity: 0.6, 
    type: 'Paramecia',
    description: 'Permite abrir e fechar qualquer coisa como se fosse uma fechadura'
  },
  { 
    name: 'Seimei Seimei no Mi', 
    rarity: 0.6, 
    type: 'Paramecia',
    description: 'Permite dar vida temporária a objetos inanimados'
  },
  { 
    name: 'Bunretsu Bunretsu no Mi', 
    rarity: 0.59, 
    type: 'Paramecia',
    description: 'Permite dividir qualquer coisa'
  },
  { 
    name: 'Atsu Atsu no Mi', 
    rarity: 0.59, 
    type: 'Paramecia',
    description: 'Permite gerar calor extremo do corpo'
  },
  { 
    name: 'Kibo Kibo no Mi', 
    rarity: 0.58, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em esperança materializada'
  },
  { 
    name: 'Noko Noko no Mi', 
    rarity: 0.58, 
    type: 'Paramecia',
    description: 'Permite criar e controlar esporos venenosos'
  },
  { 
    name: 'Tamashii Tamashii no Mi', 
    rarity: 0.58, 
    type: 'Paramecia',
    description: 'Permite manipular almas de forma limitada'
  },
  { 
    name: 'Gattai Gattai no Mi', 
    rarity: 0.58, 
    type: 'Paramecia',
    description: 'Permite fundir objetos e pessoas'
  },
  { 
    name: 'Akumu Akumu no Mi', 
    rarity: 0.57, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em pesadelos'
  },
  { 
    name: 'Ami Ami no Mi', 
    rarity: 0.57, 
    type: 'Paramecia',
    description: 'Permite criar redes extremamente resistentes'
  },
  { 
    name: 'Kioku Kioku no Mi', 
    rarity: 0.56, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em memórias'
  },
  { 
    name: 'Kopi Kopi no Mi', 
    rarity: 0.56, 
    type: 'Paramecia',
    description: 'Permite copiar habilidades de outras pessoas'
  },
  { 
    name: 'Hansha Hansha no Mi', 
    rarity: 0.56, 
    type: 'Paramecia',
    description: 'Permite refletir qualquer ataque'
  },
  { 
    name: 'Inseki Inseki no Mi', 
    rarity: 0.56, 
    type: 'Logia',
    description: 'Permite controlar meteoros e poeira cósmica'
  },
  { 
    name: 'Rei Rei no Mi', 
    rarity: 0.55, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em energia espiritual'
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
  { 
    name: 'Niji Niji no Mi', 
    rarity: 0.55, 
    type: 'Paramecia',
    description: 'Permite criar e controlar arco-íris sólidos'
  },
  { 
    name: 'Ishiki Ishiki no Mi', 
    rarity: 0.55, 
    type: 'Paramecia',
    description: 'Permite transferir consciência entre corpos'
  },
  { 
    name: 'Juuryoku Juuryoku no Mi', 
    rarity: 0.55, 
    type: 'Logia',
    description: 'Permite se transformar em ondas gravitacionais'
  },
  { 
    name: 'Hoshi Hoshi no Mi', 
    rarity: 0.54, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em poeira estelar'
  },
  { 
    name: 'Gomu Gomu no Mi', 
    rarity: 0.54, 
    type: 'Paramecia',
    description: 'Torna o corpo de borracha, imune a eletricidade e ataques contundentes'
  },
  { 
    name: 'Kyuushuu Kyuushuu no Mi', 
    rarity: 0.54, 
    type: 'Paramecia',
    description: 'Permite absorver qualquer energia'
  },
  { 
    name: 'Arashi Arashi no Mi', 
    rarity: 0.54, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em tempestades'
  },
  { 
    name: 'Gin Gin no Mi', 
    rarity: 0.53, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em prata líquida'
  },
  { 
    name: 'Hana Hana no Mi', 
    rarity: 0.53, 
    type: 'Paramecia',
    description: 'Permite fazer brotar partes do corpo em qualquer superfície'
  },
  { 
    name: 'Denjiha Denjiha no Mi', 
    rarity: 0.53, 
    type: 'Logia',
    description: 'Permite controlar ondas eletromagnéticas'
  },
  { 
    name: 'Tsunami Tsunami no Mi', 
    rarity: 0.53, 
    type: 'Logia',
    description: 'Permite controlar ondas gigantes'
  },
  { 
    name: 'Kin Kin no Mi', 
    rarity: 0.52, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em ouro líquido'
  },
  { 
    name: 'Bara Bara no Mi', 
    rarity: 0.52, 
    type: 'Paramecia',
    description: 'Permite separar o corpo em pedaços, imune a cortes'
  },
  { 
    name: 'Chishiki Chishiki no Mi', 
    rarity: 0.52, 
    type: 'Paramecia',
    description: 'Permite absorver e transferir conhecimento'
  },
  { 
    name: 'Kumo Kumo no Mi (Storm)', 
    rarity: 0.52, 
    type: 'Logia',
    description: 'Permite controlar nuvens de tempestade'
  },
  { 
    name: 'Doku Doku no Mi (Logia)', 
    rarity: 0.51, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em veneno gasoso'
  },
  { 
    name: 'Sube Sube no Mi', 
    rarity: 0.51, 
    type: 'Paramecia',
    description: 'Torna a pele extremamente lisa, desviando ataques'
  },
  { 
    name: 'Kachi Kachi no Mi (Victory)', 
    rarity: 0.51, 
    type: 'Paramecia',
    description: 'Permite aumentar chances de vitória'
  },
  { 
    name: 'Tatsumaki Tatsumaki no Mi', 
    rarity: 0.51, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em tornados'
  },
  { 
    name: 'Bomu Bomu no Mi', 
    rarity: 0.5, 
    type: 'Paramecia',
    description: 'Permite fazer qualquer parte do corpo explodir'
  },
   { 
    name: 'Riki Riki no Mi', 
    rarity: 0.5, 
    type: 'Paramecia',
    description: 'Concede força sobre-humana proporcional ao usuário'
  },
  { 
    name: 'Buki Buki no Mi', 
    rarity: 0.5, 
    type: 'Paramecia',
    description: 'Permite transformar partes do corpo em qualquer arma'
  },
  { 
    name: 'Yari Yari no Mi', 
    rarity: 0.5, 
    type: 'Paramecia',
    description: 'Permite criar e controlar lanças perfurantes'
  },
  { 
    name: 'Kuuki Kuuki no Mi', 
    rarity: 0.5, 
    type: 'Paramecia',
    description: 'Permite controlar a pressão do ar'
  },
  { 
    name: 'Kusuri Kusuri no Mi', 
    rarity: 0.5, 
    type: 'Paramecia',
    description: 'Permite criar medicamentos e poções com efeitos variados'
  },
  { 
    name: 'Hikari Hikari no Mi', 
    rarity: 0.5, 
    type: 'Logia',
    description: 'Permite controlar luz sólida'
  },
  { 
    name: 'Kiro Kiro no Mi', 
    rarity: 0.49, 
    type: 'Paramecia',
    description: 'Permite alterar o peso corporal de 1kg a 10.000kg'
  },
  { 
    name: 'Onpa Onpa no Mi', 
    rarity: 0.49, 
    type: 'Paramecia',
    description: 'Permite criar ondas sônicas destrutivas'
  },
  { 
    name: 'Kouri Kouri no Mi', 
    rarity: 0.49, 
    type: 'Logia',
    description: 'Permite controlar gelo seco e temperaturas extremas'
  },
  { 
    name: 'Jishin Jishin no Mi', 
    rarity: 0.49, 
    type: 'Logia',
    description: 'Permite controlar tremores sísmicos'
  },
  { 
    name: 'Doru Doru no Mi', 
    rarity: 0.48, 
    type: 'Paramecia',
    description: 'Permite criar e controlar cera extremamente dura'
  },
  { 
    name: 'Ongaku Ongaku no Mi', 
    rarity: 0.48, 
    type: 'Paramecia',
    description: 'Permite materializar música como ataques'
  },
  { 
    name: 'Kioku Kioku no Mi (Paramecia)', 
    rarity: 0.48, 
    type: 'Paramecia',
    description: 'Permite apagar, modificar ou restaurar memórias'
  },
  { 
    name: 'Kage Kage no Mi (Logia)', 
    rarity: 0.48, 
    type: 'Logia',
    description: 'Permite se transformar em sombras vivas'
  },
  { 
    name: 'Kasai Kasai no Mi', 
    rarity: 0.48, 
    type: 'Logia',
    description: 'Permite controlar fogo frio (chamas que congelam)'
  },
  { 
    name: 'Baku Baku no Mi', 
    rarity: 0.47, 
    type: 'Paramecia',
    description: 'Permite comer e digerir qualquer coisa, incorporando propriedades'
  },
  { 
    name: 'Shindou Shindou no Mi', 
    rarity: 0.47, 
    type: 'Paramecia',
    description: 'Permite criar vibrações em qualquer frequência'
  },
  { 
    name: 'Jouki Jouki no Mi', 
    rarity: 0.47, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em vapor'
  },
  { 
    name: 'Kazan Kazan no Mi', 
    rarity: 0.47, 
    type: 'Logia',
    description: 'Permite controlar atividade vulcânica'
  },
  { 
    name: 'Mane Mane no Mi', 
    rarity: 0.46, 
    type: 'Paramecia',
    description: 'Permite copiar perfeitamente a aparência de outras pessoas'
  },
  { 
    name: 'Ginou Ginou no Mi', 
    rarity: 0.46, 
    type: 'Paramecia',
    description: 'Permite copiar e usar habilidades de outras pessoas'
  },
  { 
    name: 'Karada Karada no Mi', 
    rarity: 0.46, 
    type: 'Paramecia',
    description: 'Permite modificar a anatomia corporal'
  },
  { 
    name: 'Reito Reito no Mi', 
    rarity: 0.46, 
    type: 'Logia',
    description: 'Permite controlar temperaturas sub-zero'
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
    name: 'Hito Hito no Mi', 
    rarity: 0.45, 
    type: 'Zoan',
    description: 'Permite se transformar em humano, concedendo inteligência'
  },
  { 
    name: 'Denwa Denwa no Mi', 
    rarity: 0.45, 
    type: 'Paramecia',
    description: 'Permite se comunicar telepaticamente com qualquer pessoa'
  },
  { 
    name: 'Doku Doku no Mi (Cure)', 
    rarity: 0.45, 
    type: 'Paramecia',
    description: 'Permite neutralizar qualquer veneno ou doença'
  },
  { 
    name: 'Abura Abura no Mi', 
    rarity: 0.45, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em óleo'
  },
  { 
    name: 'Netsu Netsu no Mi (Logia)', 
    rarity: 0.45, 
    type: 'Logia',
    description: 'Permite controlar e se transformar em calor puro'
  },
  { 
    name: 'Toge Toge no Mi', 
    rarity: 0.44, 
    type: 'Paramecia',
    description: 'Permite criar espinhos afiados em qualquer parte do corpo'
  },
  { 
    name: 'Keiken Keiken no Mi', 
    rarity: 0.44, 
    type: 'Paramecia',
    description: 'Permite transferir experiências e muscle memory'
  },
  { 
    name: 'Netsuryou Netsuryou no Mi', 
    rarity: 0.44, 
    type: 'Paramecia',
    description: 'Permite manipular energia térmica'
  },
  { 
    name: 'Kemuri Kemuri no Mi', 
    rarity: 0.44, 
    type: 'Logia',
    description: 'Permite controlar fumaça tóxica'
  },
  { 
    name: 'Ori Ori no Mi', 
    rarity: 0.43, 
    type: 'Paramecia',
    description: 'Permite criar gaiolas e algemas de ferro'
  },
  { 
    name: 'Mousou Mousou no Mi', 
    rarity: 0.43, 
    type: 'Paramecia',
    description: 'Permite materializar ilusões temporariamente'
  },
  { 
    name: 'Bane Bane no Mi', 
    rarity: 0.42, 
    type: 'Paramecia',
    description: 'Transforma as pernas em molas poderosas'
  },
  { 
    name: 'Tori Tori no Mi, Model: Falcon', 
    rarity: 0.42, 
    type: 'Zoan',
    description: 'Permite se transformar em falcão, ideal para voo e velocidade'
  },
  { 
    name: 'Wakai Wakai no Mi', 
    rarity: 0.42, 
    type: 'Paramecia',
    description: 'Permite rejuvenescer pessoas e objetos'
  },
  { 
    name: 'Undou Undou no Mi', 
    rarity: 0.42, 
    type: 'Paramecia',
    description: 'Permite controlar energia cinética'
  },
  { 
    name: 'Noro Noro no Mi', 
    rarity: 0.41, 
    type: 'Paramecia',
    description: 'Permite desacelerar objetos e pessoas por 30 segundos'
  },
  { 
    name: 'Kanjo Kanjo no Mi', 
    rarity: 0.41, 
    type: 'Paramecia',
    description: 'Permite manipular e transferir emoções'
  },
  { 
    name: 'Ichi Ichi no Mi', 
    rarity: 0.41, 
    type: 'Paramecia',
    description: 'Permite teletransportar instantaneamente'
  },
  { 
    name: 'Doa Doa no Mi', 
    rarity: 0.4, 
    type: 'Paramecia',
    description: 'Permite criar portas em qualquer superfície, incluindo ar'
  },
  { 
    name: 'Ton Ton no Mi', 
    rarity: 0.4, 
    type: 'Paramecia',
    description: 'Permite aumentar drasticamente o peso corporal'
  },
  { 
    name: 'Yumi Yumi no Mi', 
    rarity: 0.4, 
    type: 'Paramecia',
    description: 'Permite criar arcos e flechas de energia'
  },
  { 
    name: 'Inu Inu no Mi, Model: Dachshund', 
    rarity: 0.4, 
    type: 'Zoan',
    description: 'Permite se transformar em dachshund (salsicha)'
  },
  { 
    name: 'Seichou Seichou no Mi', 
    rarity: 0.4, 
    type: 'Paramecia',
    description: 'Permite acelerar o crescimento de qualquer ser vivo'
  },
  { 
    name: 'Kasa Kasa no Mi', 
    rarity: 0.4, 
    type: 'Paramecia',
    description: 'Permite controlar guarda-chuvas e criar escudos de chuva'
  },
  { 
    name: 'Kujira Kujira no Mi', 
    rarity: 0.4, 
    type: 'Zoan',
    description: 'Permite se transformar em baleia gigante'
  },
  { 
    name: 'Awa Awa no Mi', 
    rarity: 0.39, 
    type: 'Paramecia',
    description: 'Permite criar bolhas de sabão que drenam força'
  },
  { 
    name: 'Seikaku Seikaku no Mi', 
    rarity: 0.39, 
    type: 'Paramecia',
    description: 'Permite alterar personalidades temporariamente'
  },
  { 
    name: 'Basho Basho no Mi', 
    rarity: 0.39, 
    type: 'Paramecia',
    description: 'Permite trocar posições de objetos'
  },
  { 
    name: 'Beri Beri no Mi', 
    rarity: 0.38, 
    type: 'Paramecia',
    description: 'Permite separar o corpo em esferas como bagas'
  },
  { 
    name: 'Mogu Mogu no Mi', 
    rarity: 0.38, 
    type: 'Zoan',
    description: 'Permite se transformar em toupeira, ideal para escavação'
  },
  { 
    name: 'Rouka Rouka no Mi', 
    rarity: 0.38, 
    type: 'Paramecia',
    description: 'Permite acelerar o envelhecimento'
  },
  { 
    name: 'Sabi Sabi no Mi', 
    rarity: 0.37, 
    type: 'Paramecia',
    description: 'Permite enferrujar e corroer metais instantaneamente'
  },
  { 
    name: 'Kyogi Kyogi no Mi', 
    rarity: 0.37, 
    type: 'Paramecia',
    description: 'Permite criar jogos com regras obrigatórias'
  },
  { 
    name: 'Kyori Kyori no Mi', 
    rarity: 0.37, 
    type: 'Paramecia',
    description: 'Permite manipular distâncias'
  },
  { 
    name: 'Shari Shari no Mi', 
    rarity: 0.36, 
    type: 'Paramecia',
    description: 'Permite transformar partes do corpo em rodas giratórias'
  },
  { 
    name: 'Inu Inu no Mi, Model: Jackal', 
    rarity: 0.36, 
    type: 'Zoan',
    description: 'Permite se transformar em chacal do deserto'
  },
  { 
    name: 'Un Un no Mi', 
    rarity: 0.36, 
    type: 'Paramecia',
    description: 'Permite manipular sorte e probabilidades menores'
  },
  { 
    name: 'Fuku Fuku no Mi', 
    rarity: 0.35, 
    type: 'Paramecia',
    description: 'Permite criar e controlar roupas'
  },
  { 
    name: 'Uma Uma no Mi', 
    rarity: 0.35, 
    type: 'Zoan',
    description: 'Permite se transformar em cavalo, aumentando velocidade'
  },
  { 
    name: 'Ryouri Ryouri no Mi', 
    rarity: 0.35, 
    type: 'Paramecia',
    description: 'Permite cozinhar qualquer coisa e dar propriedades especiais à comida'
  },
  { 
    name: 'Saizu Saizu no Mi', 
    rarity: 0.35, 
    type: 'Paramecia',
    description: 'Permite alterar tamanhos proporcionalmente'
  },
  { 
    name: 'Mushi Mushi no Mi, Model: Mantis', 
    rarity: 0.35, 
    type: 'Zoan',
    description: 'Permite se transformar em louva-a-deus gigante'
  },
  { 
    name: 'Kama Kama no Mi', 
    rarity: 0.34, 
    type: 'Paramecia',
    description: 'Permite criar lâminas de vento cortantes com as unhas'
  },
  { 
    name: 'Neko Neko no Mi, Model: Leopard', 
    rarity: 0.34, 
    type: 'Zoan',
    description: 'Permite se transformar em leopardo, predador ágil'
  },
  { 
    name: 'Shoubu Shoubu no Mi', 
    rarity: 0.34, 
    type: 'Paramecia',
    description: 'Permite forçar duelos com condições específicas'
  },
  { 
    name: 'Same Same no Mi', 
    rarity: 0.34, 
    type: 'Zoan',
    description: 'Permite se transformar em tubarão terrestre'
  },
  { 
    name: 'Utau Utau no Mi', 
    rarity: 0.33, 
    type: 'Paramecia',
    description: 'Permite hipnotizar e controlar pessoas através do canto'
  },
  { 
    name: 'Zou Zou no Mi', 
    rarity: 0.33, 
    type: 'Zoan',
    description: 'Permite se transformar em elefante, força bruta'
  },
  { 
    name: 'Make Make no Mi', 
    rarity: 0.33, 
    type: 'Paramecia',
    description: 'Permite causar azar e fracassos'
  },
  { 
    name: 'Katachi Katachi no Mi', 
    rarity: 0.33, 
    type: 'Paramecia',
    description: 'Permite alterar formas de objetos'
  },
  { 
    name: 'Kyubu Kyubu no Mi', 
    rarity: 0.32, 
    type: 'Paramecia',
    description: 'Permite absorver umidade de qualquer coisa'
  },
  { 
    name: 'Inu Inu no Mi, Model: Wolf', 
    rarity: 0.32, 
    type: 'Zoan',
    description: 'Permite se transformar em lobo, predador em matilha'
  },
  { 
    name: 'Mushi Mushi no Mi, Model: Scorpion', 
    rarity: 0.32, 
    type: 'Zoan',
    description: 'Permite se transformar em escorpião venenoso'
  },
  { 
    name: 'Modo Modo no Mi', 
    rarity: 0.31, 
    type: 'Paramecia',
    description: 'Permite retornar objetos ao estado anterior'
  },
  { 
    name: 'Ushi Ushi no Mi, Model: Giraffe', 
    rarity: 0.31, 
    type: 'Zoan',
    description: 'Permite se transformar em girafa, alcance e altura'
  },
  { 
    name: 'Kitsune Kitsune no Mi', 
    rarity: 0.31, 
    type: 'Zoan',
    description: 'Permite se transformar em raposa astuta'
  },
  { 
    name: 'Iro Iro no Mi (Advanced)', 
    rarity: 0.31, 
    type: 'Paramecia',
    description: 'Permite controlar cores e luz'
  },
  { 
    name: 'Hebi Hebi no Mi, Model: King Cobra', 
    rarity: 0.3, 
    type: 'Zoan',
    description: 'Permite se transformar em cobra real venenosa'
  },
  { 
    name: 'Uo Uo no Mi, Model: Shark', 
    rarity: 0.3, 
    type: 'Zoan',
    description: 'Permite se transformar em tubarão predador'
  },
  { 
    name: 'Kumo Kumo no Mi, Model: Black Widow', 
    rarity: 0.3, 
    type: 'Zoan',
    description: 'Permite se transformar em viúva-negra'
  },
  { 
    name: 'Mushi Mushi no Mi, Model: Butterfly', 
    rarity: 0.3, 
    type: 'Zoan',
    description: 'Permite se transformar em borboleta com escamas venenosas'
  },
  { 
    name: 'Hebi Hebi no Mi, Model: Anaconda', 
    rarity: 0.29, 
    type: 'Zoan',
    description: 'Permite se transformar em anaconda gigante'
  },
  { 
    name: 'Peto Peto no Mi', 
    rarity: 0.29, 
    type: 'Paramecia',
    description: 'Permite controlar qualquer animal tocado'
  },
  { 
    name: 'Ookami Ookami no Mi', 
    rarity: 0.29, 
    type: 'Zoan',
    description: 'Permite se transformar em lobo alfa'
  },
  { 
    name: 'Kanji Kanji no Mi', 
    rarity: 0.29, 
    type: 'Paramecia',
    description: 'Permite materializar palavras escritas'
  },
  { 
    name: 'Jara Jara no Mi', 
    rarity: 0.28, 
    type: 'Paramecia',
    description: 'Permite criar correntes e grilhões'
  },
  { 
    name: 'Neko Neko no Mi, Model: Lion', 
    rarity: 0.28, 
    type: 'Zoan',
    description: 'Permite se transformar em leão, rei dos animais'
  },
  { 
    name: 'Kumo Kumo no Mi, Model: Tarantula', 
    rarity: 0.28, 
    type: 'Zoan',
    description: 'Permite se transformar em tarântula gigante'
  },
  { 
    name: 'Mushi Mushi no Mi, Model: Dragonfly', 
    rarity: 0.28, 
    type: 'Zoan',
    description: 'Permite se transformar em libélula de alta velocidade'
  },
  { 
    name: 'Iro Iro no Mi', 
    rarity: 0.27, 
    type: 'Paramecia',
    description: 'Permite camuflar-se mudando de cor'
  },
  { 
    name: 'Neko Neko no Mi, Model: Tiger', 
    rarity: 0.27, 
    type: 'Zoan',
    description: 'Permite se transformar em tigre feroz'
  },
  { 
    name: 'Shika Shika no Mi', 
    rarity: 0.27, 
    type: 'Zoan',
    description: 'Permite se transformar em cervo majestoso'
  },
  { 
    name: 'Bangou Bangou no Mi', 
    rarity: 0.27, 
    type: 'Paramecia',
    description: 'Permite manipular números e estatísticas'
  },
  { 
    name: 'Guru Guru no Mi', 
    rarity: 0.26, 
    type: 'Paramecia',
    description: 'Permite criar hélices em qualquer parte do corpo'
  },
  { 
    name: 'Tori Tori no Mi, Model: Albatross', 
    rarity: 0.26, 
    type: 'Zoan',
    description: 'Permite se transformar em albatroz, voo de longa distância'
  },
  { 
    name: 'Kuma Kuma no Mi', 
    rarity: 0.26, 
    type: 'Zoan',
    description: 'Permite se transformar em urso, força e resistência'
  },
  { 
    name: 'Wani Wani no Mi', 
    rarity: 0.26, 
    type: 'Zoan',
    description: 'Permite se transformar em crocodilo gigante'
  },
  { 
    name: 'Tanuki Tanuki no Mi', 
    rarity: 0.26, 
    type: 'Zoan',
    description: 'Permite se transformar em tanuki travesso'
  },
  { 
    name: 'Beta Beta no Mi', 
    rarity: 0.25, 
    type: 'Paramecia',
    description: 'Permite criar e controlar substâncias pegajosas'
  },
  { 
    name: 'Inu Inu no Mi, Model: Tanuki', 
    rarity: 0.25, 
    type: 'Zoan',
    description: 'Permite se transformar em tanuki (cão-guaxinim)'
  },
  { 
    name: 'Ushi Ushi no Mi, Model: Bison', 
    rarity: 0.25, 
    type: 'Zoan',
    description: 'Permite se transformar em bisão americano'
  },
  { 
    name: 'Kame Kame no Mi', 
    rarity: 0.25, 
    type: 'Zoan',
    description: 'Permite se transformar em tartaruga marinha'
  },
  { 
    name: 'Iruka Iruka no Mi', 
    rarity: 0.25, 
    type: 'Zoan',
    description: 'Permite se transformar em golfinho inteligente'
  },
  { 
    name: 'Mushi Mushi no Mi, Model: Ant', 
    rarity: 0.25, 
    type: 'Zoan',
    description: 'Permite se transformar em formiga com força sobre-humana'
  },
  { 
    name: 'Keisan Keisan no Mi', 
    rarity: 0.25, 
    type: 'Paramecia',
    description: 'Permite realizar cálculos impossíveis instantaneamente'
  },
  { 
    name: 'Hira Hira no Mi', 
    rarity: 0.24, 
    type: 'Paramecia',
    description: 'Permite fazer qualquer coisa ondular como uma bandeira'
  },
  { 
    name: 'Sara Sara no Mi, Model: Axolotl', 
    rarity: 0.24, 
    type: 'Zoan',
    description: 'Permite se transformar em axolote, regeneração aquática'
  },
  { 
    name: 'Tori Tori no Mi, Model: Eagle', 
    rarity: 0.24, 
    type: 'Zoan',
    description: 'Permite se transformar em águia, predador aéreo'
  },
  { 
    name: 'Tokage Tokage no Mi', 
    rarity: 0.24, 
    type: 'Zoan',
    description: 'Permite se transformar em lagarto com regeneração'
  },
  { 
    name: 'Ishi Ishi no Mi', 
    rarity: 0.23, 
    type: 'Paramecia',
    description: 'Permite assimilar e controlar pedras'
  },
  { 
    name: 'Azarashi Azarashi no Mi', 
    rarity: 0.23, 
    type: 'Zoan',
    description: 'Permite se transformar em foca'
  },
  { 
    name: 'Tako Tako no Mi', 
    rarity: 0.23, 
    type: 'Zoan',
    description: 'Permite se transformar em polvo gigante'
  },
  { 
    name: 'Nui Nui no Mi', 
    rarity: 0.22, 
    type: 'Paramecia',
    description: 'Permite costurar qualquer coisa como tecido'
  },
  { 
    name: 'Tori Tori no Mi, Model: Raven', 
    rarity: 0.22, 
    type: 'Zoan',
    description: 'Permite se transformar em corvo inteligente'
  },
  { 
    name: 'Kaeru Kaeru no Mi', 
    rarity: 0.22, 
    type: 'Zoan',
    description: 'Permite se transformar em sapo venenoso'
  },
  { 
    name: 'Ika Ika no Mi', 
    rarity: 0.22, 
    type: 'Zoan',
    description: 'Permite se transformar em lula colossal'
  },
  { 
    name: 'Giro Giro no Mi', 
    rarity: 0.21, 
    type: 'Paramecia',
    description: 'Permite ver através de qualquer coisa e ler mentes'
  },
  { 
    name: 'Batto Batto no Mi, Model: Vampire', 
    rarity: 0.21, 
    type: 'Zoan',
    description: 'Permite se transformar em morcego vampiro'
  },
  { 
    name: 'Penguin Penguin no Mi', 
    rarity: 0.21, 
    type: 'Zoan',
    description: 'Permite se transformar em pinguim imperial'
  },
  { 
    name: 'Kani Kani no Mi', 
    rarity: 0.21, 
    type: 'Zoan',
    description: 'Permite se transformar em caranguejo gigante'
  },
  { 
    name: 'Ato Ato no Mi', 
    rarity: 0.2, 
    type: 'Paramecia',
    description: 'Permite transformar pessoas e objetos em arte'
  },
  { 
    name: 'Hiso Hiso no Mi', 
    rarity: 0.2, 
    type: 'Paramecia',
    description: 'Permite se comunicar com animais'
  },
  { 
    name: 'Tori Tori no Mi, Model: Owl', 
    rarity: 0.2, 
    type: 'Zoan',
    description: 'Permite se transformar em coruja noturna'
  },
  { 
    name: 'Namekuji Namekuji no Mi', 
    rarity: 0.2, 
    type: 'Zoan',
    description: 'Permite se transformar em lesma gigante'
  },
  { 
    name: 'Ebi Ebi no Mi', 
    rarity: 0.2, 
    type: 'Zoan',
    description: 'Permite se transformar em lagosta blindada'
  },
  { 
    name: 'Jake Jake no Mi', 
    rarity: 0.19, 
    type: 'Paramecia',
    description: 'Permite se transformar em uma jaqueta e controlar quem a veste'
  },
  { 
    name: 'Tori Tori no Mi, Model: Condor', 
    rarity: 0.19, 
    type: 'Zoan',
    description: 'Permite se transformar em condor gigante'
  },
  { 
    name: 'Pocket Pocket no Mi', 
    rarity: 0.18, 
    type: 'Paramecia',
    description: 'Permite criar bolsos em qualquer parte do corpo'
  },
  { 
    name: 'Mushi Mushi no Mi, Model: Suzumebachi', 
    rarity: 0.18, 
    type: 'Zoan',
    description: 'Permite se transformar em vespa gigante'
  },
  { 
    name: 'Bisu Bisu no Mi', 
    rarity: 0.17, 
    type: 'Paramecia',
    description: 'Permite criar e controlar biscoitos extremamente duros'
  },
  { 
    name: 'Hebi Hebi no Mi, Model: Viper', 
    rarity: 0.17, 
    type: 'Zoan',
    description: 'Permite se transformar em víbora venenosa'
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
  { 
    name: 'Saru Saru no Mi', 
    rarity: 0.15, 
    type: 'Zoan',
    description: 'Permite se transformar em macaco ágil'
  },
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
    rarity: 0.1, 
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
  },
  { 
    name: 'SMILE - Rabbit', 
    rarity: 0.05, 
    type: 'Zoan',
    description: 'Devil Fruit artificial - Coelho (defeituosa, transformação parcial)'
  },
  { 
    name: 'SMILE - Mouse', 
    rarity: 0.04, 
    type: 'Zoan',
    description: 'Devil Fruit artificial - Rato (defeituosa, transformação parcial)'
  },
  { 
    name: 'SMILE - Pig', 
    rarity: 0.04, 
    type: 'Zoan',
    description: 'Devil Fruit artificial - Porco (defeituosa, transformação parcial)'
  }
];

export default DEVIL_FRUITS;