// BANCO DE DADOS DOS ANIMAIS
// A ordem dos registros corresponde às posições nth-child do mosaico em css/style.css.
const animais = [
    {
        id: 'gato-mourisco',
        nome: 'Gato-Mourisco',
        img: 'assets/animais/gato-mourisco/imagem.jpg',
        audio: 'assets/animais/gato-mourisco/audio.mp3',
        cientifico: 'Herpailurus yagouaroundi',
        destaques: ['🐈 2x maior que gato doméstico', '🥩 Carnívoro', '🏜️ Vive de florestas a desertos'],
        classeTamanho: '',
        descricao: 'Nativo das Américas. Apresenta um corpo alongado, cabeça pequena e estreita, orelhas pequenas e redondas, focinho curto e cauda longa.\nTipicamente solitários, mas podem formar pares na natureza.\nEstá presente em uma grande variedade de habitats, desde florestas tropicais e deciduais até desertos e arbustos espinhosos.',
        fonte: ''
    },
    {
        id: 'gafanhoto',
        nome: 'Gafanhoto-Soldado',
        img: 'assets/animais/gafanhoto/imagem.png',
        audio: 'assets/animais/gafanhoto/audio.mp3',
        cientifico: 'Chromacris speciosa',
        destaques: ['📏 20 a 50 mm', '🍃 Solanáceas (Ex: Lobeira)', '🟢 Adultos verdes / Ninfas negras'],
        classeTamanho: 'tamanho-alto',
        descricao: 'Tem ampla distribuição no Brasil, América do Sul e América Central.\nAdultos: apresentam coloração verde e amarela.\nNinfas: negras com manchas vermelhas.\nMachos medem entre 20-30 milímetros e as fêmeas entre 35-50 milímetros.',
        fonte: 'https://www.inaturalist.org/taxa/320746-Chromacris-speciosa'
    },
    {
        id: 'cascavel',
        nome: 'Cascavel',
        img: 'assets/animais/cascavel/imagem.png',
        audio: 'assets/animais/cascavel/audio.mp3',
        cientifico: 'Crotalus durissus',
        destaques: ['🐍 Réptil (Viperidae)', '🐁 Mamíferos e aves', '🔔 Alerta via chocalho caudal'],
        classeTamanho: '',
        descricao: 'Facilmente identificada na natureza pelo seu chocalho caudal.\nDispositivo de alerta, é composto por segmentos ocos e córneos que são frouxamente conectados e toda vez que ocorre a muda de pele, um segmento é adicionado.\nSeu revestimento é castanho, com losangos verticais escuros, e cores claras na margem.\nSão noturnas, mas emergem no pôr do sol para caçar suas presas.\nApesar de terem um veneno perigoso, são víboras reservadas e tímidas, mas não gostam de ser manuseadas.',
        fonte: 'https://www.inaturalist.org/taxa/30693-Crotalus-durissus'
    },
    {
        id: 'tamandua',
        nome: 'Tamanduá-Bandeira',
        img: 'assets/animais/tamandua/imagem.jpg',
        audio: 'assets/animais/tamandua/audio.mp3',
        cientifico: 'Myrmecophaga tridactyla',
        destaques: ['⚖️ 25 a 45 kg', '🐜 Insetívoro', '👅 Língua de até 60 cm'],
        classeTamanho: 'tamanho-largo',
        descricao: 'É um mamífero eutério nativo das Américas Central e do Sul.\nPossui garras desenvolvidas nas patas anteriores e cauda volumosa e peluda.\nAlimenta-se principalmente de formigas e cupins, usando sua longa língua pegajosa.',
        fonte: 'https://www.inaturalist.org/taxa/47106-Myrmecophaga-tridactyla'
    },
    {
        id: 'lobo-guara',
        nome: 'Lobo-Guará',
        img: 'assets/animais/lobo-guara/imagem.jpg',
        imgModal: 'assets/animais/lobo-guara/imagem-modal.png',
        audio: 'assets/animais/lobo-guara/audio.mp3',
        cientifico: 'Chrysocyon brachyurus',
        destaques: ['⚖️ 20 a 30 kg', '🍽️ Onívoro', '🐺 Típico do Cerrado', '🍅 40% da dieta é a fruta-do-lobo'],
        classeTamanho: 'tamanho-alto',
        descricao: 'É uma espécie de canídeo endêmico da América do Sul, sendo ele um animal típico do Cerrado.\nCaracterizado por pernas longas e finas e uma densa pelagem avermelhada.\nSeus hábitos são crepusculares, são solitários e só se encontram no período do estro da fêmea.',
        fonte: 'https://www.inaturalist.org/taxa/42091-Chrysocyon-brachyurus'
    },
    {
        id: 'saua',
        nome: 'Sauá',
        img: 'assets/animais/saua/imagem.png',
        audio: 'assets/animais/saua/audio.mp3',
        cientifico: 'Callicebus personatus',
        destaques: ['🐒 Primata', '🍽️ Onívoro Oportunista', '⛰️ Geofágico (come solo)'],
        classeTamanho: '',
        descricao: 'Endêmico do Brasil com uma alimentação oportunista, de modo que se alimenta com base no que está disponível em cada estação, sem muita seletividade alimentar.\nSão monogâmicos, de modo a manterem um parceiro durante toda sua vida.\nGeofágicos (às vezes comem solo).\nPreferem viver no alto dos galhos das árvores ao invés do chão para evitar de serem predador, principalmente, por cobras.',
        fonte: 'https://www.inaturalist.org/taxa/43683-Callicebus-personatus'
    },
    {
        id: 'sapo-cururu',
        nome: 'Sapo-Cururu',
        img: 'assets/animais/sapo-cururu/imagem.jpg',
        audio: 'assets/animais/sapo-cururu/audio.mp3',
        cientifico: 'Rhinella marina',
        destaques: ['📏 10 a 15 cm', '🍽️ Onívoro (Pequenos vertebrados e invertebrados)', '🌙 Mais ativo à noite'],
        classeTamanho: '',
        descricao: 'Nativo das Américas Central e do Sul.\nMais ativo durante a noite e pode viver longe da água, procurando a água somente para se reproduzir.\nDimorfismo sexual: As fêmeas são maiores de cor sépia ou marrom, enquanto os machos são menores e mais claros.\nUma das poucas espécies onívoras de sapos.',
        fonte: 'https://www.inaturalist.org/taxa/553515-Rhinella-marina'
    },
    {
        id: 'jaguatirica',
        nome: 'Jaguatirica',
        img: 'assets/animais/jaguatirica/imagem.jpg',
        audio: 'assets/animais/jaguatirica/audio.mp3',
        cientifico: 'Leopardus pardalis',
        destaques: ['⚖️ 8 a 16 kg', '🥩 Carnívoro', '🌳 Noturno e solitário'],
        classeTamanho: 'tamanho-gigante',
        descricao: 'É um felino de médio porte nativo do continente americano.\nExcelente escaladora e nadadora, possui pelagem amarelada com rosetas e manchas pretas que garantem camuflagem na vegetação densa.',
        fonte: 'https://www.inaturalist.org/taxa/41980-Leopardus-pardalis'
    },
    {
        id: 'seriema',
        nome: 'Seriema',
        img: 'assets/animais/seriema/imagem.jpg',
        audio: 'assets/animais/seriema/audio.mp3',
        cientifico: 'Cariama cristata',
        destaques: ['📏 70 a 90 cm', '🍽️ Onívora', '🏃 Pode correr a 25 km/h'],
        classeTamanho: 'tamanho-alto',
        descricao: 'Amplamente distribuída na América do sul, pertencente à família “cariamidae”.\nComum em florestas abertas, arbustos espinhosos, savanas, campos sujos e pastagens; incluindo o Cerrado e a Caatinga, por exemplo.\nAves territoriais e diurnas, geralmente vive sozinha ou em pares.\nPodem alcançar uma velocidade de 25 km/h antes de tomar voo.\nSua vocalização é muito marcante e pode ser ouvido a mais de um quilômetro de distância.\nSão monogâmicas e põe cerca de 2 a 3 ovos.',
        fonte: 'https://www.inaturalist.org/taxa/14-Cariama-cristata'
    },
    {
        id: 'tatu-galinha',
        nome: 'Tatu-Galinha',
        img: 'assets/animais/tatu-galinha/imagem.jpg',
        audio: 'assets/animais/tatu-galinha/audio.mp3',
        cientifico: 'Dasypus novemcinctus',
        destaques: ['🦡 Mamífero', '🐜 Insetívoro (Formigas/Cupins)', '🕳️ Escava tocas de até 2,1m'],
        classeTamanho: '',
        descricao: 'Encontrado nas Américas. Animal solitário, com hábitos noturnos, principalmente.\nAlimenta-se de formigas, cupins e outros invertebrados pequenos.\nSão extensos cavadores, suas tocas chegam a ter 2,1 metros de profundidade.\nMachos são agressivos quando se trata de território, principalmente quando outro macho se aproxima da sua área de vida.',
        fonte: 'https://www.inaturalist.org/taxa/47075-Dasypus-novemcinctus'
    },
    {
        id: 'raposa-do-campo',
        nome: 'Raposa-do-Campo',
        img: 'assets/animais/raposa-do-campo/imagem.jpg',
        audio: 'assets/animais/raposa-do-campo/audio.mp3',
        cientifico: '',
        destaques: [],
        classeTamanho: 'tamanho-gigante',
        descricao: 'Informações sobre este animal serão adicionadas em breve.',
        fonte: ''
    },
    {
        id: 'anta',
        nome: 'Anta',
        img: 'assets/animais/anta/imagem.jpg',
        audio: 'assets/animais/anta/audio.mp3',
        cientifico: 'Tapirus terrestris',
        destaques: ['⚖️ Até 300 kg', '🌿 Herbívoro', '💧 Maior mamífero terrestre do Brasil'],
        classeTamanho: '',
        descricao: 'A anta brasileira é o maior mamífero terrestre da América do Sul.\nPossui uma pequena tromba móvel (probóscide) usada para pegar folhas e frutos.\nSão excelentes nadadoras e desempenham papel vital como dispersoras de sementes.',
        fonte: 'https://www.inaturalist.org/taxa/43355-Tapirus-terrestris'
    },
    {
        id: 'coruja',
        nome: 'Coruja-Buraqueira',
        img: 'assets/animais/coruja/imagem.png',
        imgModal: 'assets/animais/coruja/imagem-modal.png',
        audio: 'assets/animais/coruja/audio.mp3',
        cientifico: 'Athene cunicularia',
        destaques: ['🦅 Ave de Rapina', '🦗 Carnívoro-insetívoro', '🔇 Voo suave e silencioso'],
        classeTamanho: 'tamanho-alto',
        descricao: 'Ocorre desde o Canadá até a Terra do Fogo (extremo da América do Sul), com exceções na bacia Amazônia (porém com o aumento das rodovias, acabou por ser observadas algumas no estado de Manaus).\nConsomem as presas mais abundantes de acordo com a estação (generalista).\nApresentam um voo suave e silencioso.\nOs machos são ligeiramente maiores que as fêmeas, e as fêmeas são ligeiramente mais escuras que os machos, principalmente na face.\nAo qualquer sinal de perigo emitem um som forte, alto e estridente.',
        fonte: 'https://www.wikiaves.com.br/wiki/coruja-buraqueira'
    },
    {
        id: 'bugio',
        nome: 'Bugio',
        img: 'assets/animais/bugio/imagem.jpg',
        audio: 'assets/animais/bugio/audio.mp3',
        cientifico: 'Alouatta caraya',
        destaques: ['🐒 Primata', '🍃 Predominantemente folívora', '🗣️ Forte vocalização territorial'],
        classeTamanho: 'tamanho-alto',
        descricao: 'Habitam florestas tropicais e savanas do sudeste e centro do Brasil.\nDimorfismo sexual, de modo que os machos são totalmente pretos e as fêmeas um coloração de castanho claro.\nVocalização principalmente para sinalizar a outros grupos a posse de determinado espaço.\nDieta predominantemente folívora, mas pode variar para dietas mais onívoras.',
        fonte: 'https://www.inaturalist.org/taxa/43435-Alouatta-caraya'
    },
    {
        id: 'onca-pintada',
        nome: 'Onça-Pintada',
        img: 'assets/animais/onca-pintada/imagem.jpg',
        audio: 'assets/animais/onca-pintada/audio.mp3',
        cientifico: 'Panthera onca',
        destaques: ['⚖️ 65 a 100 kg', '🥩 Carnívoro', '👑 Topo da Cadeia Alimentar'],
        classeTamanho: 'tamanho-alto',
        descricao: 'É uma espécie de mamífero carnívoro encontrado nas américas, sendo o maior felino do continente americano e o terceiro no ranking mundial.\nHábitos crepusculares e solitários.\nSeus hábitos de caça consistem em emboscadas, ocupando o topo da cadeia alimentar.',
        fonte: 'https://www.inaturalist.org/taxa/41970-Panthera-onca'
    },
    {
        id: 'pica-pau',
        nome: 'Pica-Pau',
        img: 'assets/animais/pica-pau/imagem.png',
        audio: 'assets/animais/pica-pau/audio.mp3',
        cientifico: 'Dryocopus lineatus',
        destaques: ['🦅 Ave', '🐛 Insetos, larvas, sementes e frutos', '👨‍👩‍👦 Ambos os pais cuidam da prole'],
        classeTamanho: 'tamanho-alto',
        descricao: 'Presente na América Central e América do Sul, sendo encontrada em todo o Brasil.\nPara encontrar seus alimentos, começa a dar fortes pancadas, retirando lascas grandes de madeira e usando a longa língua (que tem cerdas nas pontas) para capturar formigas e insetos.\nApresentam dimorfismo sexual, de modo que o macho apresenta uma faixa próxima ao bico de cor vermelha, de modo que as fêmeas apresentam a região anterior da cabeça preta e sem faixa vermelha.\nVivem em pares ou em grupos familiares.',
        fonte: 'https://www.wikiaves.com.br/wiki/pica-pau-de-banda-branca'
    },
    {
        id: 'jacare',
        nome: 'Jacaré-do-Pantanal',
        img: 'assets/animais/jacare/imagem.jpg',
        audio: 'assets/animais/jacare/audio.mp3',
        cientifico: 'Caiman yacare',
        destaques: ['📏 2 a 3 metros', '🥩 Carnívoro/Piscívoro', '🐊 Réptil semiaquático'],
        classeTamanho: 'tamanho-gigante',
        descricao: 'Espécie de crocodiliano nativa do centro da América do Sul.\nAlimenta-se principalmente de peixes, caramujos e pequenos invertebrados.\nDesempenha papel ecológico crucial no controle de populações aquáticas.',
        fonte: 'https://www.inaturalist.org/taxa/116527-Caiman-yacare'
    },
    {
        id: 'onca-parda',
        nome: 'Onça-Parda',
        img: 'assets/animais/onca-parda/imagem.png',
        audio: 'assets/animais/onca-parda/audio.mp3',
        cientifico: 'Puma concolor',
        destaques: ['🐈 Felino de grande porte', '🥩 Carnívoro', '🧗 Excelente escaladora'],
        classeTamanho: 'tamanho-largo',
        descricao: 'Mamífero com maior distribuição geográfica no ocidente.\nAnimal solitário e mais ativo à noite, alimentando-se principalmente de cervídeos.\nApesar de apresentar hábitos terrestres, ela é uma excelente escaladora e capaz de nadar longas distâncias.\nA presença da onça-pintada influencia diretamente na alimentação da onça parda, de modo que ela passa a atacar animais de pequeno porte.\nAmpla variedade de vocalização, usando em contextos sexual, parental e agonístico.',
        fonte: 'https://www.inaturalist.org/taxa/42007-Puma-concolor'
    }
];
