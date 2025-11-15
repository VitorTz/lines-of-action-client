import './ProjectDescriptionPage.css'
import type { PageType } from '../types/general';


interface ProjectDescriptionPageProps {

    navigate: (page: PageType, data?: any) => void

}


const ProjectDescriptionPage = ({ navigate }: ProjectDescriptionPageProps) => {

  return (
    <div className="app-container">      
      <div className="project-card">
        <header className="project-header">
          <h1>Descrição do Projeto</h1>
        </header>        
        <main className="project-content">          
          <section className="project-section">
            <h2>Objetivo</h2>
            <p>
              Este projeto tem como objetivo o desenvolvimento de uma aplicação web interativa para o jogo Lines of Action (LOA) e deve suportar tanto desktop como dispositivos móveis.
              A aplicação será hospedada no servidor virtual da UFSC (VPS-UFSC) e seguirá a arquitetura MVC.
            </p>
            <p>
              O sistema permitirá que os usuários joguem partidas contra outros jogadores ou contra um bot, com suporte a rankings, scores e persistência de dados em um banco MongoDB. A interface contará com um tabuleiro interativo, modos de visualização claro e escuro, avatares personalizáveis e funcionalidades como chat em tempo real, vídeochat com áudio entre jogadores, e fila dinâmica para gerenciamento de partidas.
            </p>
            <p>
              As partidas poderão ser gravadas em vídeo e áudio utilizando FFMPEG, armazenadas no banco de dados e compartilhadas por URL, com player embutido no sistema. Além disso, será implementado gerenciamento de filas, controle de avatares e administração do espaço de armazenamento de vídeos.
            </p>
            <p>
              A aplicação será desenvolvida com HTML5, CSS3, JavaScript e MongoDB. Também serão aplicadas práticas de segurança, como proteção contra XSS, CSRF, injeção de código e exposição de dados sensíveis.
            </p>
          </section>
          <section className="project-section">
            <h2>Integrantes</h2>
            <ul className="info-list">
              <li><a href="https://www.github.com/BernardoFranceschina" target='_blank'>Bernardo Carlos Franceschina</a></li>
              <li><a href="https://www.github.com/VitorTz" target='_blank'>Vitor Fernando da Silva</a></li>
            </ul>
          </section>          
          <section className="project-section">
            <h2>Recursos Usados</h2>
            <ul className="info-list">
              <li>Javascript</li>
              <li>HTML</li>
              <li>CSS</li>
              <li>MongoDB</li>
            </ul>
          </section>          
          <section className="project-section">
            <h2>Links</h2>
            <ul className="info-list">
              <li>
                <a href="https://presencial.moodle.ufsc.br/course/view.php?id=32192" target="_blank" rel="noopener noreferrer">Moodle da Disciplina (INE5646)</a>
              </li>
              <li>
                <a href="https://github.com/BernardoFranceschina/TrabalhoWeb" target="_blank" rel="noopener noreferrer">Repositório do Projeto</a>
              </li>
            </ul>
          </section>

        </main>
        
      </div>
    </div>
  );
};

export default ProjectDescriptionPage;