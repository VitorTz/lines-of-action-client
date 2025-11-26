import type { PageType } from "../types/general";
import "./AboutPage.css";

interface AboutPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const AboutPage = ({ navigate }: AboutPageProps) => {
  return (
    <div className="app-container">
      <div className="about-card">
        <main className="about-content">
          <section className="about-section">
            <h2>Sobre o Jogo</h2>
            <p>
              Lines of Action (LoA) é um jogo eletrônico de tabuleiro para dois
              jogadores, jogado num tabuleiro 8x8 com vinte e quatro peças (doze
              pretas e doze brancas), inventado por Claude Soucie por volta de
              1960.
            </p>
            <p>
              Foi pela primeira vez publicado por Sid Sacksoan em 1969 em “A
              Gamut of Games” e foi um sucesso imediato entre os aficionados
              deste tipo de jogos.
            </p>
            <p>
              O LoA é indicado para maiores de dez anos e tem uma duração média
              de jogo de meia hora. Até ao momento não foi descoberto nenhuma
              sequência de jogadas que garanta uma probabilidade vitória de
              100%.
            </p>
          </section>
          <section className="about-section">
            <h2>Regras</h2>
            <ol className="rules-list">
              <li>
                Cada jogador controla doze peças de uma cor, um jogador controla
                as peças pretas e o outro as brancas.
              </li>
              <li>
                As peças pretas são colocadas em duas filas, seis na fila de
                cima e seis na fila de baixo. As peças brancas são colocadas em
                duas colunas, seis na coluna da esquerda e seis na coluna da
                direita.
              </li>
              <li>O jogador com as peças pretas joga primeiro.</li>
              <li>
                Em cada volta, o jogador tem que mover uma peça, um certo número
                de casas em linha recta. O número de casas é exactamente igual
                ao número de peças, independentemente da sua cor, que existem na
                linha de movimento (Lines of Action = “Linhas de Acção”).
              </li>
              <li>O jogador pode saltar por cima das próprias peças.</li>
              <li>
                O jogador não pode saltar por cima das peças do adversário, mas
                pode captura-las, se a sua peça parar sobre a peça do
                adversário.
              </li>
              <li>
                O objetivo do jogo é colocar todas as peças que possui ligadas.
                As ligações entre peças podem ser verticais, horizontais ou
                diagonais. O primeiro jogador a consegui-lo é o vencedor.
              </li>
              <li>
                Se um jogador ficar reduzido, por capturas, a uma peça, esse
                jogador é o vencedor.
              </li>
              <li>
                Se numa jogada, ocorrer uma situação de vitória para ambos os
                jogadores, o jogador que efectuou essa jogada é o vencedor.
              </li>
              <li>
                Se um jogador não conseguir fazer nenhuma jogada, este jogador
                perde.
              </li>
            </ol>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AboutPage;
