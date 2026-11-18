# Carvahall — Palancar Valley

Reconstrução explorável em Three.js do vilarejo de Carvahall, no vale Palancar, baseada principalmente em *Eragon* e *Eldest*, de Christopher Paolini.

## Abrir
https://eitaluis.github.io/CARVAHALL/

## Controles
- **WASD**: mover
- **Mouse**: olhar
- **Shift**: correr
- **Espaço**: pular
- **H**: núcleo / Seven Sheaves
- **J**: oficina de Horst
- **G**: rio Anora
- **F**: cataratas de Igualda
- **M / N**: próximo / anterior ponto de interesse
- **T**: acampamento sazonal dos mercadores
- **L**: mostrar / ocultar variante histórica do rebanho (Eldest)
- **Tab**: mostrar / ocultar minimapa
- **Roda do mouse sobre o mapa**: alternar escala

Clique na tela para capturar o mouse; use **Esc** para liberar o cursor.

## Estrutura
O projeto foi organizado em módulos carregados em sequência pelo index.html:

1. js/00-scene-core.js — cena, câmera, renderer, aleatoriedade e iluminação
2. js/01-procedural-materials.js — texturas e materiais procedurais
3. js/02-valley-terrain.js — relevo do vale
4. js/03-river-roads-falls.js — estradas, rio Anora e cataratas
5. js/04-forest-ground-cover.js — pinheiros e vegetação baixa
6. js/05-rural-architecture.js — casas, estruturas rurais e edifícios nomeados
7. js/06-rural-life-details.js — celeiro e rebanho histórico opcional (L)
8. js/06-seasonal-merchants.js — acampamento sazonal
9. js/07-points-minimap-shortcuts.js — POIs, minimapa e atalhos
10. js/08-player-animation.js — jogador, colisões, controles e loop de animação
11. css/style.css — interface e estilos

A ordem de carregamento é importante: módulos posteriores usam objetos e funções criados pelos anteriores.

## Critério de fidelidade
As relações geográficas, materiais, edifícios e elementos descritos nos romances são tratados como cânone. A posição exata de casas, caminhos secundários, cercas e objetos de uso cotidiano é interpretativa sempre que os livros não fornecem um mapa ou coordenadas. Consulte docs/base-canon-e-interpretacoes.md.

A divisão em arquivos melhora a manutenção e permite evoluir cada parte separadamente; por si só, ela não garante aumento de FPS. Otimizações de desempenho devem ser feitas na geometria, nos materiais, nas sombras e no número de chamadas de desenho.
