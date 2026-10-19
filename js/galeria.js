'use strict';

function configurarGaleria() {
    elementos['btn-fechar-animal'].addEventListener('click', fecharAnimal);
    elementos['modal-animal'].addEventListener('click', (evento) => {
        if (evento.target === elementos['modal-animal']) fecharAnimal();
    });
    gerarCards();
}

function gerarCards() {
    const fragmento = document.createDocumentFragment();
    animais.forEach((animal) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = `card ${animal.classeTamanho || ''}`.trim();
        card.id = `card-${animal.id}`;
        card.setAttribute('aria-label', `Conhecer ${animal.nome}`);

        const imagem = document.createElement('img');
        imagem.className = 'imagem-card';
        imagem.alt = animal.nome;
        imagem.loading = 'lazy';
        prepararImagemAnimal(imagem, animal.img, animal.nome);

        const nome = document.createElement('span');
        nome.className = 'nome-animal';
        nome.textContent = animal.nome;

        card.append(imagem, nome);
        card.addEventListener('click', () => abrirAnimal(animal.id));
        fragmento.appendChild(card);
    });
    elementos['grid-animais'].replaceChildren(fragmento);
}

function abrirAnimal(animalId) {
    const animal = animais.find((item) => item.id === animalId);
    if (!animal) return;
    const aberturaGuiada = estado.telaAtual === 'dante';
    if (aberturaGuiada) {
        if (cardTutorial?.id !== `card-${animalId}`) return;
        mudarTela('galeria');
    }
    ocultarGuiaFecharAnimal();

    estado.animalAberto = animal;
    prepararImagemAnimal(elementos['modal-img'], animal.imgModal || animal.img, animal.nome);
    elementos['modal-img'].alt = animal.nome;
    elementos['modal-titulo'].textContent = animal.nome;
    elementos['modal-cientifico'].textContent = animal.cientifico;

    elementos['modal-tags-container'].replaceChildren();
    (animal.destaques || []).forEach((destaque) => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = destaque;
        elementos['modal-tags-container'].appendChild(tag);
    });

    elementos['modal-texto'].replaceChildren();
    animal.descricao.split('\n').filter(Boolean).forEach((paragrafo) => {
        const p = document.createElement('p');
        p.textContent = paragrafo;
        elementos['modal-texto'].appendChild(p);
    });

    const fonte = (animal.fonte || '').trim();
    const credito = (animal.creditoImagem || '').trim();
    elementos['modal-fonte'].textContent = fonte ? `Fonte consultada: ${fonte}` : '';
    elementos['modal-fonte'].hidden = !fonte;
    elementos['modal-credito-imagem'].textContent = credito ? `Crédito da imagem: ${credito}` : '';
    elementos['modal-credito-imagem'].hidden = !credito;
    elementos['modal-referencias'].hidden = !fonte && !credito;
    elementos['modal-animal'].querySelector('.modal-content').scrollTop = 0;

    if (aberturaGuiada) mostrarGuiaFecharAnimal();
    abrirModal(elementos['modal-animal'], elementos['btn-fechar-animal'], document.getElementById(`card-${animal.id}`));
    tocarSomAnimal(animal.audio);
}

function fecharAnimal() {
    ocultarGuiaFecharAnimal();
    pararAudioAnimal();
    estado.animalAberto = null;
    fecharModal(elementos['modal-animal']);
}
