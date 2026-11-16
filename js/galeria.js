'use strict';

function configurarGaleria() {
    elementos['btn-fechar-animal'].addEventListener('click', fecharAnimal);
    elementos['modal-animal'].addEventListener('click', (evento) => {
        if (evento.target === elementos['modal-animal'] && elementos['guia-fechar-animal'].hidden) fecharAnimal();
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

        const nome = document.createElement('span');
        nome.className = 'nome-animal';
        nome.textContent = animal.nome;

        card.append(imagem, nome);
        const credito = (animal.creditoImagem || '').trim();
        if (credito) {
            const creditoFoto = document.createElement('span');
            creditoFoto.className = 'credito-foto';
            creditoFoto.setAttribute('aria-hidden', 'true');
            creditoFoto.textContent = credito;
            card.classList.add('com-credito');
            card.appendChild(creditoFoto);
        }
        // Um substituto não leva o crédito da foto original.
        prepararImagemAnimal(imagem, animal.img, animal.nome, () => {
            card.querySelector('.credito-foto')?.remove();
            card.classList.remove('com-credito');
        });
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
    const credito = (animal.creditoImagem || '').trim();
    // O crédito sobre a foto é discreto e some se a foto for trocada pelo substituto.
    elementos['modal-credito-foto'].textContent = credito;
    elementos['modal-credito-foto'].hidden = !credito;
    prepararImagemAnimal(elementos['modal-img'], animal.imgModal || animal.img, animal.nome, () => {
        elementos['modal-credito-foto'].hidden = true;
    });
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
    const fonteAudio = (animal.fonteAudio || '').trim();
    elementos['modal-fonte'].textContent = fonte ? `Fonte das informações: ${fonte}` : '';
    elementos['modal-fonte'].hidden = !fonte;
    elementos['modal-fonte-audio'].textContent = fonteAudio ? `Fonte do som: ${fonteAudio}` : '';
    elementos['modal-fonte-audio'].hidden = !fonteAudio;
    elementos['modal-credito-imagem'].textContent = credito ? `Crédito da imagem: ${credito}` : '';
    elementos['modal-credito-imagem'].hidden = !credito;
    elementos['modal-referencias'].hidden = !fonte && !fonteAudio && !credito;

    if (aberturaGuiada) mostrarGuiaFecharAnimal();
    abrirModal(elementos['modal-animal'], elementos['btn-fechar-animal'], document.getElementById(`card-${animal.id}`));
    elementos['modal-animal'].querySelector('.modal-content').scrollTop = 0;
    tocarSomAnimal(animal.audio);
}

function fecharAnimal() {
    ocultarGuiaFecharAnimal();
    pararAudioAnimal();
    estado.animalAberto = null;
    fecharModal(elementos['modal-animal']);
}
