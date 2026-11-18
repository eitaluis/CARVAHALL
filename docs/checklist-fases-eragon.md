# Checklist de desenvolvimento — Carvahall de Eragon

**Regra de escopo:** todas as fases constroem uma única Carvahall, limitada ao que é descrito em *Eragon*. A feira de inverno é uma situação sazonal alternativa também narrada nesse livro. Não há alternância para períodos posteriores.

## Fase 0 — pesquisa e fidelidade textual
- [x] Consultar a vista panorâmica do vale Palancar e a primeira chegada de Eragon a Carvahall.
- [x] Extrair as características das casas, telhados, varandas, chaminés, luzes e atmosfera de fim de tarde.
- [x] Separar os detalhes precisos do açougue de Sloan.
- [x] Registrar Horst como ferreiro, sem inventar uma planta canônica da forja.
- [x] Identificar a taverna como estabelecimento sem nome fornecido no volume.
- [x] Localizar a tanoaria de Gedric nos arredores e o barracão de peles.
- [x] Levantar a descrição do mercado de inverno, do acampamento e da rua principal.
- [x] Separar a fazenda de Garrow como cenário distante, não como parte da vila.

## Fase 1 — geografia e paisagem do vale
- [x] Base de terreno navegável do vale Palancar.
- [x] Rio Anora e percurso em direção ao sul.
- [x] Cataratas de Igualda e encosta rochosa.
- [x] Solo em tons claros, arenosos e secos.
- [x] Relva morta, capim e vegetação rasteira.
- [x] Pinheiros concentrados nas bordas da paisagem, sem transformar o núcleo da vila numa floresta.
- [ ] Revisar visualmente escala, orientação e distância entre a vila e as cataratas depois do primeiro teste no navegador.
- [ ] Ajustar as parcelas agrícolas para manter a leitura de pequenos campos quadrados vistos de longe.

## Fase 2 — núcleo construído de Carvahall
- [x] Casas de troncos, marrons, com volumes sólidos e telhados baixos.
- [x] Variação de telhados de palha e shingles.
- [x] Varandas largas, portas, janelas e chaminés.
- [x] Fumaça de lenha e luz quente nas janelas.
- [x] Reorganização das casas em agrupamento compacto em torno da rua de entrada.
- [ ] Revisar número, escala e espaçamento das casas conforme a exploração real.
- [ ] Melhorar a leitura de cada construção de fora e garantir interiores acessíveis.

## Fase 3 — ofícios e estabelecimentos mencionados
- [x] Açougue de Sloan com sala espaçosa, lareira de pedra, balcão e palha no piso.
- [x] Forja de Horst como edifício de trabalho interpretativo.
- [x] Taverna genérica, sem nome próprio inventado.
- [x] Tanoaria de Gedric na periferia, com tinas, barracão e peles penduradas.
- [ ] Ajustar detalhes internos e objetos após inspeção em primeira pessoa.
- [ ] Conferir acessos, colisões e passagens nas portas.

## Fase 4 — feira e mercadores de inverno
- [x] Campo de acampamento na periferia.
- [x] Carroças, tendas e fogueiras espalhadas de forma irregular.
- [x] Quatro tendas coloridas dos trovadores.
- [x] Bancas de comércio na rua principal.
- [x] Cavalos e figuras humanas estáticas para sugerir a circulação da feira.
- [x] Neve pisoteada e áreas derretidas por fogueiras.
- [x] Atalho T para alternar entre o fim de tarde cotidiano e o mercado de inverno.
- [ ] Refinar a densidade de pessoas e a disposição das bancas depois de observar a cena.

## Fase 5 — atmosfera e exploração
- [x] Controles WASD, mouse, Shift e Espaço.
- [x] Minimapa com posição do jogador e pontos de interesse.
- [x] Atalhos H, J, G e F para locais principais.
- [x] Animação de fumaça, água e fogo.
- [ ] Revisar colisões e a velocidade de deslocamento no mundo inteiro.
- [ ] Revisar sombras, distância de visão e densidade de geometria.
- [ ] Conferir desempenho em computador comum e ajustar o nível de detalhe.

## Fase 6 — validação de fidelidade
- [ ] Testar a página publicada no navegador.
- [ ] Percorrer a rua principal e visitar cada edifício.
- [ ] Inspecionar o açougue, a forja e a tanoaria por dentro.
- [ ] Ativar o mercado de inverno e conferir a ligação entre campo e rua.
- [ ] Corrigir os pontos indicados na exploração antes de considerar a versão aprovada.

## Exclusões de escopo
- Não acrescentar muralhas, trincheiras, paliçadas ou construções defensivas.
- Não acrescentar rebanhos ou acontecimentos que não façam parte do estado de Carvahall mostrado em *Eragon*.
- Não criar uma versão incendiada ou arruinada da vila.
- Não dar nome próprio à taverna.
- Não incluir o poço de Fisk nem a oficina de Fisk.
- Não deslocar a fazenda de Garrow para dentro da vila.
- Não tratar coordenadas artísticas como medidas fornecidas pelo livro.

## Estrutura atual dos arquivos
- `index.html`: interface e carregamento dos módulos.
- `css/style.css`: estilos da interface.
- `js/00-scene-core.js`: cena, câmera, aleatoriedade, relevo-base e luz.
- `js/01-procedural-materials.js`: texturas e materiais.
- `js/02-valley-terrain.js`: superfície e paleta do vale.
- `js/03-river-roads-falls.js`: Anora, caminhos e cataratas.
- `js/04-forest-ground-cover.js`: pinheiros, capim e vegetação rasteira.
- `js/05-rural-architecture.js`: casas, açougue, forja, taverna e tanoaria.
- `js/06-winter-market.js`: acampamento, feira, cavalos e multidão de inverno.
- `js/07-points-minimap-shortcuts.js`: pontos, minimapa e teletransportes.
- `js/08-player-animation.js`: jogador, colisões, controles e animação.
