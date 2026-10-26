
const $ = (id) => document.getElementById(id);

const personagem = $("personagem");
const obstaculo = $("obstaculo");
const fala = $("fala");
const pontosTexto = $("pontos");
const estrelasTexto = $("estrelas");
const faseTexto = $("fase");

const inicio = $("inicio");
const perguntaBox = $("perguntaBox");
const final = $("final");

const perguntaTexto = $("pergunta");
const alternativas = $("alternativas");
const feedback = $("feedback");

const andarBtn = $("andarBtn");
const pularBtn = $("pularBtn");
const musicaBtn = $("musicaBtn");

const desafios = [
  {
    pergunta: "🎨 Quais são as três cores primárias tradicionais na pintura?",
    opcoes: [
      "Vermelho, amarelo e azul",
      "Verde, rosa e roxo",
      "Preto, branco e cinza",
      "Laranja, verde e violeta"
    ],
    correta: 0,
    explicacao: "Na pintura tradicional, vermelho, amarelo e azul são ensinados como cores primárias."
  },
  {
    pergunta: "🌈 Quais cores misturamos para obter o verde na pintura?",
    opcoes: [
      "Vermelho e azul",
      "Amarelo e azul",
      "Vermelho e amarelo",
      "Preto e branco"
    ],
    correta: 1,
    explicacao: "Misturando amarelo e azul, podemos obter verde."
  },
  {
    pergunta: "🖌️ Qual material é muito usado para pintar com tinta?",
    opcoes: [
      "Régua",
      "Compasso",
      "Pincel",
      "Borracha"
    ],
    correta: 2,
    explicacao: "O pincel ajuda a espalhar a tinta e criar diferentes traços."
  },
  {
    pergunta: "🟠 Qual destas figuras tem três lados?",
    opcoes: [
      "Círculo",
      "Quadrado",
      "Retângulo",
      "Triângulo"
    ],
    correta: 3,
    explicacao: "O triângulo tem três lados e três vértices."
  },
  {
    pergunta: "🖼️ O que é uma colagem artística?",
    opcoes: [
      "Uma conta matemática",
      "Uma obra feita juntando materiais",
      "Um tipo de dança",
      "Um instrumento musical"
    ],
    correta: 1,
    explicacao: "Na colagem, juntamos materiais como papéis, recortes, tecidos e imagens para criar uma composição."
  }
];

const emojisObstaculos = ["🪵", "🍄", "🪨", "🌿", "🌈"];

let fase = 0;
let pontos = 0;
let estrelas = 0;
let posicao = 7;
let jogando = false;
let bloqueado = false;
let audioContext = null;
let musicaAtiva = false;
let temporizadorMusica = null;
let notaAtual = 0;

const notas = [
  523.25, 659.25, 783.99, 659.25,
  587.33, 698.46, 880.00, 698.46,
  523.25, 587.33, 659.25, 523.25,
  392.00, 523.25, 659.25, 587.33
];

function atualizarPainel() {
  pontosTexto.textContent = pontos;
  estrelasTexto.textContent = estrelas;
  faseTexto.textContent = `${Math.min(fase + 1, desafios.length)}/${desafios.length}`;
}

function falar(texto) {
  fala.textContent = texto;
}

function moverPersonagem() {
  personagem.style.left = `${posicao}%`;
}

function animarAndada() {
  personagem.classList.remove("pulando");
  personagem.classList.add("andando");

  $("poeira").classList.remove("ativa");
  void $("poeira").offsetWidth;
  $("poeira").classList.add("ativa");

  setTimeout(() => {
    personagem.classList.remove("andando");
  }, 450);
}

function animarPulo() {
  return new Promise((resolve) => {
    personagem.classList.remove("andando");
    personagem.classList.remove("pulando");

    void personagem.offsetWidth;
    personagem.classList.add("pulando");

    setTimeout(() => {
      personagem.classList.remove("pulando");
      resolve();
    }, 750);
  });
}

function atualizarObstaculo() {
  obstaculo.textContent = emojisObstaculos[fase % emojisObstaculos.length];
  obstaculo.style.left = "43%";
  obstaculo.style.display = "block";
}

function iniciarJogo() {
  fase = 0;
  pontos = 0;
  estrelas = 0;
  posicao = 7;
  jogando = true;
  bloqueado = false;

  inicio.classList.add("escondido");
  final.classList.add("escondido");
  perguntaBox.classList.add("escondido");

  personagem.style.left = `${posicao}%`;
  personagem.classList.remove("andando", "pulando");

  atualizarObstaculo();
  atualizarPainel();

  falar("Vamos explorar! Caminhe até o primeiro obstáculo.");
}

function andar() {
  if (!jogando || bloqueado) return;

  if (posicao < 36) {
    posicao = Math.min(posicao + 9, 36);
    moverPersonagem();
    animarAndada();

    if (posicao >= 30) {
      falar("Olhe! Um obstáculo mágico. Descubra como passar!");
      mostrarPergunta();
    } else {
      falar("Continue caminhando pela floresta!");
    }
  } else {
    mostrarPergunta();
  }
}

function pular() {
  if (!jogando || bloqueado) return;

  if (posicao < 30) {
    falar("Caminhe até encontrar um obstáculo primeiro!");
    return;
  }

  mostrarPergunta();
}

function mostrarPergunta() {
  if (!jogando || bloqueado) return;

  bloqueado = true;
  perguntaBox.classList.remove("escondido");

  const desafio = desafios[fase];
  perguntaTexto.textContent = desafio.pergunta;
  feedback.textContent = "";
  alternativas.innerHTML = "";

  desafio.opcoes.forEach((opcao, indice) => {
    const botao = document.createElement("button");
    botao.textContent = opcao;

    botao.addEventListener("click", () => {
      responder(indice, botao);
    });

    alternativas.appendChild(botao);
  });
}

function responder(indice, botaoClicado) {
  if (!bloqueado || !jogando) return;

  const desafio = desafios[fase];
  const botoes = alternativas.querySelectorAll("button");

  botoes.forEach((botao) => {
    botao.disabled = true;
  });

  if (indice === desafio.correta) {
    botaoClicado.classList.add("correta");
    feedback.textContent = "🎉 Muito bem! " + desafio.explicacao;

    pontos += 20;
    estrelas++;

    atualizarPainel();
    falar("Resposta certa! Prepare-se para pular!");

    setTimeout(async () => {
      await animarPulo();

      posicao = 7;
      moverPersonagem();

      fase++;
      perguntaBox.classList.add("escondido");

      if (fase >= desafios.length) {
        terminarJogo();
        return;
      }

      atualizarObstaculo();
      atualizarPainel();

      bloqueado = false;
      falar("Você venceu o obstáculo! Continue pela floresta.");
    }, 1600);
  } else {
    botaoClicado.classList.add("errada");
    botoes[desafio.correta].classList.add("correta");

    feedback.textContent =
      "Ops! " + desafio.explicacao + " Vamos tentar de novo!";

    falar("Não foi dessa vez. Voltando ao início da floresta!");

    setTimeout(() => {
      posicao = 7;
      moverPersonagem();

      fase = 0;
      pontos = 0;
      estrelas = 0;

      atualizarPainel();
      atualizarObstaculo();

      perguntaBox.classList.add("escondido");
      bloqueado = false;

      falar("Tente novamente, artista! Você consegue!");
    }, 2200);
  }
}

function terminarJogo() {
  jogando = false;
  bloqueado = true;

  obstaculo.style.display = "none";
  posicao = 85;
  moverPersonagem();

  perguntaBox.classList.add("escondido");
  final.classList.remove("escondido");

  $("tituloFinal").textContent = "🏆 Mestre da Arte!";
  $("textoFinal").textContent =
    `Você completou os ${desafios.length} desafios, conquistou ${estrelas} estrelas e fez ${pontos} pontos! A floresta está cheia de cores graças a você!`;

  falar("Parabéns! Você concluiu a aventura!");
}

andarBtn.addEventListener("click", andar);
pularBtn.addEventListener("click", pular);

$("iniciarBtn").addEventListener("click", iniciarJogo);
$("jogarNovamente").addEventListener("click", iniciarJogo);

// Controles do teclado
document.addEventListener("keydown", (evento) => {
  if (
    ["ArrowRight", "ArrowLeft", "ArrowUp", " "].includes(evento.key)
  ) {
    evento.preventDefault();
  }

  if (evento.key === "ArrowRight") andar();
  if (evento.key === "ArrowLeft") {
    if (jogando && !bloqueado) {
      posicao = Math.max(7, posicao - 5);
      moverPersonagem();
      animarAndada();
    }
  }

  if (evento.key === "ArrowUp" || evento.key === " ") pular();
});

// Música de fundo criada com Web Audio API
function tocarNota(frequencia, duracao = 0.25) {
  if (!audioContext || !musicaAtiva) return;

  const oscilador = audioContext.createOscillator();
  const volume = audioContext.createGain();

  oscilador.type = "sine";
  oscilador.frequency.value = frequencia;

  volume.gain.value =
    Number($("volumeMusica").value) / 100 * 0.045;

  oscilador.connect(volume);
  volume.connect(audioContext.destination);

  const agora = audioContext.currentTime;

  volume.gain.setValueAtTime(0.001, agora);
  volume.gain.exponentialRampToValueAtTime(0.2 * Number($("volumeMusica").value) / 100, agora + 0.03);
  volume.gain.exponentialRampToValueAtTime(0.001, agora + duracao);

  oscilador.start(agora);
  oscilador.stop(agora + duracao);
}

function tocarMelodia() {
  if (!musicaAtiva) return;

  tocarNota(notas[notaAtual % notas.length], 0.3);
  notaAtual++;

  temporizadorMusica = setTimeout(tocarMelodia, 360);
}

async function alternarMusica() {
  if (!audioContext) {
    const AudioAPI = window.AudioContext || window.webkitAudioContext;

    if (!AudioAPI) {
      falar("Seu navegador não permite reproduzir a música.");
      return;
    }

    audioContext = new AudioAPI();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  musicaAtiva = !musicaAtiva;

  if (musicaAtiva) {
    musicaBtn.textContent = "🔇 Desligar música";
    notaAtual = 0;
    tocarMelodia();
  } else {
    musicaBtn.textContent = "🎵 Ligar música";
    clearTimeout(temporizadorMusica);
  }
}

musicaBtn.addEventListener("click", alternarMusica);

// Criar controle de volume
const volumeContainer = document.createElement("label");
volumeContainer.className = "volume-container";
volumeContainer.innerHTML = `
  <span>🔉 Volume</span>
  <input id="volumeMusica" type="range"
         min="0" max="100" value="35"
         aria-label="Volume da música">
`;

musicaBtn.insertAdjacentElement("afterend", volumeContainer);

// Estado inicial
atualizarPainel();
