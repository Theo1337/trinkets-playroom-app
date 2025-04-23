import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FirstPhase = ({ setPhase }) => {
  const [noPhrase, setNoPhrase] = useState("Não");
  const [phraseIndex, setPhraseIndex] = useState(0); // Track the current index
  const phrases = [
    "Não",
    "Certeza?",
    "Por favorzinho",
    "Eu juro que eu não te peço mais nada",
    "Sabe que eu te amo né?",
    "Eu te imploro",
    "Você é tão linda, sabia?",
    "100 reais no pix se você fizer...",
    "ᵖᵒʳ ᶠᵃᵛᵒʳ",
  ];

  const playAnimation = () => {
    const end = Date.now() + 3 * 1000; // 3 seconds
    const colors = [
      "#a786ff",
      "#fd8bbc",
      "#eca184",
      "#f8deb1",
      "#ff6f61",
      "#6fffbf",
      "#ffcc00",
      "#00ccff",
      "#ff99ff",
      "#99ccff",
      "#ff6666",
      "#66ff66",
    ];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 12,
        angle: 60,
        spread: 75,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 12,
        angle: 120,
        spread: 75,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  const handleNoClick = () => {
    if (phraseIndex === phrases.length - 1) return;
    // Increment the index and loop back to the start if necessary
    const nextIndex = (phraseIndex + 1) % phrases.length;
    setPhraseIndex(nextIndex);
    setNoPhrase(phrases[nextIndex]);
  };

  useEffect(() => {
    setTimeout(playAnimation, 1000); // Play animation after 1 second
  }, []);

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="font-logo text-center text-4xl md:text-7xl text-shadow-xl">
        Olá, meu amoor!
      </div>
      <div className="text-center mt-4 flex gap-1.5 items-center justify-center">
        Vim passar aqui para dizer que estamos completando
        <div className="text-xl font-bold underline">O 4 MESES JUNTOS!</div>
      </div>
      <div>
        E eu (Theo) <b>t</b>enho uma{" "}
        <i className="hover:underline cursor-pointer transition ">
          surpresin<b>h</b>a
        </i>{" "}
        para voc<b>e</b>!
        <i>
          (ris<b>o</b>s)
        </i>
      </div>
      <div className="mt-4 text-center">
        Mas para isso, você vai precisar passar por uma série de testes difíceis
        e desafiadores. Não se preocupe, você vai passar!
      </div>
      <div className="mt-20 text-center font-bold text-2xl uppercase">
        Quer começar?
      </div>
      <div className="flex gap-8 items-center justify-center">
        {phraseIndex === phrases.length - 1 && (
          <Button
            onClick={() => {
              setPhase(<SecondPhase setPhase={setPhase} />);
            }}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white"
          >
            Sim
          </Button>
        )}
        <Button
          onClick={handleNoClick}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white"
        >
          {noPhrase}
        </Button>
      </div>
    </div>
  );
};

const SecondPhase = ({ setPhase }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  // Array of questions with options
  const questions = [
    {
      question: "Em que dia nós começamos a conversar?",
      options: ["29/10", "29/11", "29/12", "07/10"],
      correctAnswer: "29/10",
      trivia:
        "A nossa primeira conversa foi no dia 07/10, massssss a gente conta como se fosse no dia 29/10 (porque não foi muito bem uma conversa nékk).",
    },
    {
      question: `Quem disse "eu te amo" primeiro?`,
      options: ["Ana", "Theo"],
      correctAnswer: "Ana",
      trivia: `O Theo não lembra muito bem, mas, a Ana disse "eu não quero dizer coisas de namorado mas eu queria dizer eu te amo", foi algo assim, o Theo não lembra muito bem.`,
    },
    {
      question: "A quanto tempo eu (Theo) gosta da Ana (você)?",
      options: ["5 meses", "6 meses", "10 meses", "4 meses"],
      correctAnswer: "10 meses",
      trivia:
        "Há 10 meses o Theo viu a Ana pela primeira vez, e desde então ele gosta muito dela. A Ana é a namorada do Theo, e ele gosta dela muito.",
    },
    {
      question: "A cor preferida do Theo é:",
      options: ["Azul", "Vermelho", "Amarelo", "Verde"],
      correctAnswer: "Azul",
      trivia:
        "Um azulzinho celeste é muito lindo... coloquei aqui apenas para lembrar você",
    },
    {
      question:
        "O que a Ana (você) sonhou comigo tocando? (Lembra daquele sonho onde eu estava tocando algo e desmaiei?)",
      options: ["Piano", "Violão", "Berimbau?", "Punheta (piada)"],
      correctAnswer: "Violão",
      trivia:
        "No dia 01 de dezembro, a Ana me contou (contou para o Theo) que sonhou que eu (Theo) mandei um video para ela tocando violão, e no video eu acabo desmaiando, e você ficou muito preocupada.... sonho esquisito....",
    },
    {
      question: "Quem eu (Theo) ama muito?",
      options: ["Ana", "Theo", "Alfredo", "Chico"],
      correctAnswer: "Ana",
      trivia:
        "Eu (Theo) amo a Ana, e ela é a minha namorada, e eu amo ela muito, a Ana é a mulher da vida do Theo.",
    },
  ];

  const handleOptionClick = (option) => {
    if (isCorrect == false) return;

    setSelectedOption(option);
    if (option === questions[currentQuestionIndex].correctAnswer) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
      setTimeout(() => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsCorrect(null);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="font-logo text-6xl mb-12">Quiz</div>
      <div className="text-center text-3xl mb-8">
        {questions[currentQuestionIndex].question}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {questions[currentQuestionIndex].options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`p-4 border rounded-lg text-center text-xl font-bold ${
              selectedOption === option
                ? option === questions[currentQuestionIndex].correctAnswer
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
                : "bg-white hover:bg-white/40 transition min-w-64 min-h-32"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="">
        {isCorrect === true && (
          <div className="flex items-center justify-center flex-col ">
            <div className="text-green-500 mt-8 text-xl uppercase">
              Resposta correta! 🎉
            </div>
            <div className="max-w-[500px] text-center">
              {questions[currentQuestionIndex].trivia}
            </div>
            <Button
              onClick={() => {
                if (currentQuestionIndex < questions.length - 1) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                  setSelectedOption(null);
                  setIsCorrect(null);
                } else {
                  setPhase(<ThirdPhase setPhase={setPhase} />);
                }
              }}
              className="bg-green-500 hover:bg-green-600 transition mt-4"
            >
              Continuar
              <ArrowRight />
            </Button>
          </div>
        )}
        {isCorrect === false && (
          <div className="text-red-500 mt-8 text-xl uppercase">
            Resposta errada. Tente novamente!
          </div>
        )}
      </div>
    </div>
  );
};

const ThirdPhase = ({ setPhase }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="font-logo text-6xl mb-12">Seguinte....</div>
      <div className="text-center text-lg flex items-center justify-center gap-4 flex-col">
        Nós achamos uma carta perdida em que Theo havia se declarado para Ana,
        segue abaixo:
        <div className="text-lg mt-4 max-w-[600px] text-center bg-white p-12 rounded shadow-md">
          Olá, se você es<b>t</b>á lendo isso provavelment<b>e</b> eu morri.....
          brincadeiraa<b>a</b>a, oiii meu a<b>m</b>or, eu só queria dizer que eu
          te amo muito mesmo, esses últimos tempos não tem sido tão fáceis, mas
          não é nada que a gente não possa passar, certo? Mesmo com tudo isso
          rolando, eu quero que você pare e pense no que eu vou dizer agora:
          {}{" "}
          <b
            onClick={() => {
              setPhase(<FinalPhase setPhase={setPhase} />);
            }}
            className="font-normal hover:text-red-500 transition hover:underline cursor-pointer"
          >
            Eu te amo
          </b>
          . Nada no mundo vai mudar isso, nada no mundo vai me impedir de dizer
          isso, mesmo se eu estiver sem forças para dizer isso, eu vou arranjar
          e te dizer isso... Você é a garota mais linda do mundo, e a mulher
          perfeita para mim. Eu te amo tanto que talvez algum dia eu
          simplesmente exploda de tanta felicidade só por você estar ao meu
          lado... Se você soubesse o que se passa na minha cabeça você
          provavelmente não ia acreditar, o quanto eu prezo passar tempo com
          você, o quanto eu AMO te fazer rir, o quanto você me faz bem....
          Então, se você algum dia duvidar se eu realmente te amo, lembre-se do
          que eu escrevi nessa carta...
          <br />
          <i>(Consegue achar o segredo dessa carta?)</i>
          <div className="mt-12 ml-64 w-max">
            <b>A</b>ssinado com carinho <b>Theo</b>
          </div>
        </div>
      </div>
    </div>
  );
};

const FinalPhase = ({ setPhase }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-lg">
      <div className="font-logo text-6xl mb-6">Desculpas....</div>
      <div className="text-center text-xl">
        Desculpa não ter sido o melhor dos presentes, eu queria muito fazer algo
        mais legal e divertido, eu até conseguiria mas eu sou muito ansioso e
        quero te mostrar isso logo, então, novamente, desculpa não ter sido o
        melhor presente, MASSSSS, eu tenho outra surpresa para você
      </div>
      <div className="text-center text-lg  mt-12">
        Achou algumas letras estranhas? Junte todas e digite ao Theo (no
        Discord) a frase que forma e então receberá sua surpresa...
        <div className="mt-4 text-neutral-600 text-sm">
          Você pode recarregar a página para rever tudo...
          <div className="uppercase text-xs text-neutral-400">
            Sim, vai ter confetti....
          </div>
        </div>
      </div>
    </div>
  );
};

function Home() {
  const [phase, setPhase] = useState(null);

  useEffect(() => {
    setPhase(<FinalPhase setPhase={setPhase} />);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-lg">
      <div className=" container max-w-screen-lg flex items-center justify-center ">
        {phase}
      </div>
    </div>
  );
}

export default Home;
