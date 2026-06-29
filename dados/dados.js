// BANCO DE DADOS DOS ANIMAIS 
const animais = [
    {
        id: 'lobo-guara',
        nome: 'Lobo-Guará',
        img: 'assets/lobo-guara/imagem.jpg',
        audio: 'assets/lobo-guara/audio.mp3',
        cientifico: 'Chrysocyon brachyurus',
        destaques: ['⚖️ 20 a 30 kg', '🍽️ Onívoro', '🐺 Típico do Cerrado', '🍅 40% da dieta é a fruta-do-lobo'],
        classeTamanho: 'tamanho-alto',
        descricao: 'É uma espécie de canídeo endêmico da América do Sul, sendo ele um animal típico do Cerrado.\nCaracterizado por pernas longas e finas e uma densa pelagem avermelhada.\nSeus hábitos são crepusculares, são solitários e só se encontram no período do estro da fêmea.',
        fonte: 'https://www.inaturalist.org/taxa/42091-Chrysocyon-brachyurus'
    },
    {
        id: 'onca-pintada',
        nome: 'Onça-Pintada',
        img: 'assets/onca-pintada/imagem.jpg',
        audio: 'assets/onca-pintada/audio.mp3',
        cientifico: 'Panthera onca',
        destaques: ['⚖️ 65 a 100 kg', '🥩 Carnívoro', '👑 Topo da Cadeia Alimentar'],
        classeTamanho: 'tamanho-gigante',
        descricao: 'É uma espécie de mamífero carnívoro encontrado nas américas, sendo o maior felino do continente americano e o terceiro no ranking mundial.\nHábitos crepusculares e solitários.\nSeus hábitos de caça consistem em emboscadas, ocupando o topo da cadeia alimentar.',
        fonte: 'https://www.inaturalist.org/taxa/41970-Panthera-onca'
    },
    {
        id: 'urutu',
        nome: 'Urutu',
        img: 'assets/urutu/imagem.jpg',
        audio: 'assets/urutu/audio.mp3',
        cientifico: 'Bothrops alternatus',
        destaques: ['🐍 Réptil (Viperidae)', '🥩 Carnívoro', '☠️ Veneno altamente tóxico'],
        classeTamanho: '',
        descricao: 'Réptil da família Viperidae, seu padrão na pele é manchas em forma de ferradura sob o fundo castanho escuro no dorso.\nApresenta o sistema de inoculação de veneno mais sofisticado das serpentes, a solenóglifa.\nO veneno delas é um dos mais tóxicos entre as jararacas.\nExtremamente ágil no bote.',
        fonte: 'https://www.inaturalist.org/taxa/539037-Bothrops-alternatus'
    },
    {
        id: 'saua',
        nome: 'Sauá',
        img: 'assets/saua/imagem.jpg',
        audio: 'assets/saua/audio.mp3',
        cientifico: 'Callicebus personatus',
        destaques: ['🐒 Primata', '🍽️ Onívoro Oportunista', '⛰️ Geofágico (come solo)'],
        classeTamanho: '',
        descricao: 'Endêmico do Brasil com uma alimentação oportunista, de modo que se alimenta com base no que está disponível em cada estação, sem muita seletividade alimentar.\nSão monogâmicos, de modo a manterem um parceiro durante toda sua vida.\nGeofágicos (às vezes comem solo).\nPreferem viver no alto dos galhos das árvores ao invés do chão para evitar de serem predador, principalmente, por cobras.',
        fonte: 'https://www.inaturalist.org/taxa/43683-Callicebus-personatus'
    },
    {
        id: 'seriema',
        nome: 'Seriema',
        img: 'assets/seriema/imagem.jpg',
        audio: 'assets/seriema/audio.mp3',
        cientifico: 'Cariama cristata',
        destaques: ['📏 70 a 90 cm', '🍽️ Onívora', '🏃 Pode correr a 25 km/h'],
        classeTamanho: 'tamanho-largo',
        descricao: 'Amplamente distribuída na América do sul, pertencente à família “cariamidae”.\nComum em florestas abertas, arbustos espinhosos, savanas, campos sujos e pastagens; incluindo o Cerrado e a Caatinga, por exemplo.\nAves territoriais e diurnas, geralmente vive sozinha ou em pares.\nPodem alcançar uma velocidade de 25 km/h antes de tomar voo.\nSua vocalização é muito marcante e pode ser ouvido a mais de um quilômetro de distância.\nSão monogâmicas e põe cerca de 2 a 3 ovos.',
        fonte: 'https://www.inaturalist.org/taxa/14-Cariama-cristata'
    },
    {
        id: 'onca-parda',
        nome: 'Onça-Parda',
        img: 'assets/onca-parda/imagem.jpg',
        audio: 'assets/onca-parda/audio.mp3',
        cientifico: 'Puma concolor',
        destaques: ['🐈 Felino de grande porte', '🥩 Carnívoro', '🧗 Excelente escaladora'],
        classeTamanho: 'tamanho-largo',
        descricao: 'Mamífero com maior distribuição geográfica no ocidente.\nAnimal solitário e mais ativo à noite, alimentando-se principalmente de cervídeos.\nApesar de apresentar hábitos terrestres, ela é uma excelente escaladora e capaz de nadar longas distâncias.\nA presença da onça-pintada influencia diretamente na alimentação da onça parda, de modo que ela passa a atacar animais de pequeno porte.\nAmpla variedade de vocalização, usando em contextos sexual, parental e agonístico.',
        fonte: 'https://www.inaturalist.org/taxa/42007-Puma-concolor'
    },
    {
        id: 'bugio',
        nome: 'Bugio',
        img: 'assets/bugio/imagem.jpg',
        audio: 'assets/bugio/audio.mp3',
        cientifico: 'Alouatta caraya',
        destaques: ['🐒 Primata', '🍃 Predominantemente folívora', '🗣️ Forte vocalização territorial'],
        classeTamanho: '',
        descricao: 'Habitam florestas tropicais e savanas do sudeste e centro do Brasil.\nDimorfismo sexual, de modo que os machos são totalmente pretos e as fêmeas um coloração de castanho claro.\nVocalização principalmente para sinalizar a outros grupos a posse de determinado espaço.',
        fonte: 'https://www.inaturalist.org/taxa/43435-Alouatta-caraya'
    },
    {
        id: 'ema',
        nome: 'Ema',
        img: 'assets/ema/imagem.jpg',
        audio: 'assets/ema/audio.mp3',
        cientifico: 'Rhea americana',
        destaques: ['📏 Até 1,70 m', '🍽️ Onívoro', '🚹 O macho cuida dos ovos'],
        classeTamanho: 'tamanho-alto',
        descricao: 'Nativa da América do sul.\nÉ uma ave não voadora de modo que usa suas asas para se equilibrar durante a corrida.\nConsiderada a maior ave brasileira. O cuidado parental é realizado pelos machos.\nA vocalização ocorre durante o período de reprodução.',
        fonte: 'https://www.inaturalist.org/taxa/20512-Rhea-americana'
    },
    {
        id: 'gato-mourisco',
        nome: 'Gato-Mourisco',
        img: 'assets/gato-mourisco/imagem.jpg',
        audio: 'assets/gato-mourisco/audio.mp3',
        cientifico: 'Herpailurus yagouaroundi',
        destaques: ['🐈 2x maior que gato doméstico', '🥩 Carnívoro', '🏜️ Vive de florestas a desertos'],
        classeTamanho: '',
        descricao: 'Nativo das Américas. Apresenta um corpo alongado, cabeça pequena e estreita, orelhas pequenas e redondas, focinho curto e cauda longa.\nTipicamente solitários, mas podem formar pares na natureza.\nEstá presente em uma grande variedade de habitats, desde florestas tropicais e deciduais até desertos e arbustos espinhosos.',
        fonte: ''
    },
    {
        id: 'tico-tico',
        nome: 'Tico-Tico',
        img: 'assets/tico-tico/imagem.jpg',
        audio: 'assets/tico-tico/audio.mp3',
        cientifico: 'Coryphospingus cucullatus',
        destaques: ['⚖️ 11 a 18 gramas', '🌾 Sementes, frutas e insetos', '🔴 Crista avermelhada no macho'],
        classeTamanho: '',
        descricao: 'Hábitats naturais são florestas secas e tropicais ou subtropicais.\nDimorfismo sexual muito evidente, de modo que o macho apresenta uma plumagem no topo da cabeça de cor avermelhada, em forma de crista.\nApresenta comportamento discreto e solitário.',
        fonte: 'https://www.wikiaves.com.br/wiki/tico-tico-rei'
    },
    {
        id: 'tatu-galinha',
        nome: 'Tatu-Galinha',
        img: 'assets/tatu-galinha/imagem.jpg',
        audio: 'assets/tatu-galinha/audio.mp3',
        cientifico: 'Dasypus novemcinctus',
        destaques: ['🦡 Mamífero', '🐜 Insetívoro (Formigas/Cupins)', '🕳️ Escava tocas de até 2,1m'],
        classeTamanho: '',
        descricao: 'Encontrado nas Américas. Animal solitário, com hábitos noturnos, principalmente.\nAlimenta-se de formigas, cupins e outros invertebrados pequenos.\nSão extensos cavadores, suas tocas chegam a ter 2,1 metros de profundidade.\nMachos são agressivos quando se trata de território, principalmente quando outro macho se aproxima da sua área de vida.',
        fonte: 'https://www.inaturalist.org/taxa/47075-Dasypus-novemcinctus'
    },
    {
        id: 'coruja',
        nome: 'Coruja-Buraqueira',
        img: 'assets/coruja/imagem.jpg',
        audio: 'assets/coruja/audio.mp3',
        cientifico: 'Athene cunicularia',
        destaques: ['🦅 Ave de Rapina', '🦗 Carnívoro-insetívoro', '🔇 Voo suave e silencioso'],
        classeTamanho: 'tamanho-alto',
        descricao: 'Ocorre desde o Canadá até a Terra do Fogo. Consomem as presas mais abundantes de acordo com a estação (generalista).\nApresentam um voo suave e silencioso.\nOs machos são ligeiramente maiores que as fêmeas, e as fêmeas são ligeiramente mais escuras que os machos, principalmente na face.\nAo qualquer sinal de perigo emitem um som forte, alto e estridente.',
        fonte: 'https://www.wikiaves.com.br/wiki/coruja-buraqueira'
    },
    {
        id: 'pica-pau',
        nome: 'Pica-Pau',
        img: 'assets/pica-pau/imagem.jpg',
        audio: 'assets/pica-pau/audio.mp3',
        cientifico: 'Dryocopus lineatus',
        destaques: ['🦅 Ave', '🐛 Insetos, larvas e frutos', '👨‍👩‍👦 Ambos os pais cuidam da prole'],
        classeTamanho: '',
        descricao: 'Presente na América Central e América do Sul, sendo encontrada em todo o Brasil.\nPara encontrar seus alimentos, começa a dar fortes pancadas, retirando lascas grandes de madeira e usando a longa língua (que tem cerdas nas pontas) para capturar formigas e insetos.\nApresentam dimorfismo sexual, de modo que o macho apresenta uma faixa próxima ao bico de cor vermelha, de modo que as fêmeas apresentam a região anterior da cabeça preta e sem faixa vermelha.\nVivem em pares ou em grupos familiares.',
        fonte: 'https://www.wikiaves.com.br/wiki/pica-pau-de-banda-branca'
    },
    {
        id: 'cascavel',
        nome: 'Cascavel',
        img: 'assets/cascavel/imagem.jpg',
        audio: 'assets/cascavel/audio.mp3',
        cientifico: 'Crotalus durissus',
        destaques: ['🐍 Réptil (Viperidae)', '🐁 Mamíferos e aves', '🔔 Alerta via chocalho caudal'],
        classeTamanho: '',
        descricao: 'Facilmente identificada na natureza pelo seu chocalho caudal.\nDispositivo de alerta, é composto por segmentos ocos e córneos que são frouxamente conectados e toda vez que ocorre a muda de pele, um segmento é adicionado.\nSeu revestimento é castanho, com losangos verticais escuros.\nSão noturnas, mas emergem no pôr do sol para caçar suas presas.\nApesar de terem um veneno perigoso, são víboras reservadas e tímidas.',
        fonte: 'https://www.inaturalist.org/taxa/30693-Crotalus-durissus'
    },
    {
        id: 'gafanhoto',
        nome: 'Gafanhoto-Soldado',
        img: 'assets/gafanhoto/imagem.jpg',
        audio: 'assets/gafanhoto/audio.mp3',
        cientifico: 'Chromacris speciosa',
        destaques: ['📏 20 a 50 mm', '🍃 Solanáceas (Ex: Lobeira)', '🟢 Adultos verdes / Ninfas negras'],
        classeTamanho: '',
        descricao: 'Tem ampla distribuição no Brasil, América do Sul e América Central.\nAdultos: apresentam coloração verde e amarela.\nNinfas: negras com manchas vermelhas.\nMachos medem entre 20-30 milímetros e as fêmeas entre 35-50 milímetros.',
        fonte: 'https://www.inaturalist.org/taxa/320746-Chromacris-speciosa'
    },
    {
        id: 'sapo-cururu',
        nome: 'Sapo-Cururu',
        img: 'assets/sapo-cururu/imagem.jpg',
        audio: 'assets/sapo-cururu/audio.mp3',
        cientifico: 'Rhinella marina',
        destaques: ['📏 10 a 15 cm', '🍽️ Onívoro (Insetos e pequenos vertebrados)', '🌙 Mais ativo à noite'],
        classeTamanho: '',
        descricao: 'Nativo das Américas Central e do Sul.\nMais ativo durante a noite e pode viver longe da água, procurando a água somente para se reproduzir.\nDimorfismo sexual: As fêmeas são maiores de cor sépia ou marrom, enquanto os machos são menores e mais claros.\nUma das poucas espécies onívoras de sapos.',
        fonte: 'https://www.inaturalist.org/taxa/553515-Rhinella-marina'
    }
];