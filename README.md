# Carvahall — Eragon

Reconstrução 3D explorável de Carvahall, no vale Palancar, baseada **exclusivamente em *Eragon*, de Christopher Paolini**.

## Abrir
https://eitaluis.github.io/CARVAHALL/

## Cena-base
A entrada padrão reproduz a vila ao anoitecer: construções robustas de troncos, telhados baixos de palha ou shingles, varandas largas, fumaça nas chaminés, janelas com luz quente, solo claro e capim seco. O Anora, as cataratas de Igualda e a paisagem do vale estruturam o cenário.

A tecla **T** ativa o mercado de inverno, outra situação descrita no mesmo romance. A feira possui queda de neve, fumaça de fogueiras e movimento sutil dos visitantes.

## Direção visual
A apresentação visual foi refinada para uma ambientação naturalista e cinematográfica, tendo como referência de qualidade ambiental jogos de mundo aberto como **Assassin's Creed**. Isso é uma escolha artística, não um detalhe canônico do romance: horizonte velado por neblina, céu em gradiente, terreno orgânico, árvores de copas irregulares, escarpas contínuas e construções rurais com estrutura, volume e sinais de uso.

## Controles
- **WASD**: mover
- **Mouse**: olhar
- **Shift**: correr
- **Espaço**: pular
- **H**: centro da vila
- **J**: forja de Horst
- **G**: rio Anora
- **F**: cataratas de Igualda
- **M / N**: próximo / anterior ponto de interesse
- **T**: alternar o mercado de inverno
- **Tab**: mostrar / ocultar minimapa
- **Roda do mouse sobre o mapa**: alternar visão geral / zoom local
- **Esc**: liberar o cursor

Clique na cena para capturar o mouse.

## Estrutura do projeto
O HTML carrega os arquivos JavaScript em sequência, mantendo a divisão por responsabilidade:

1. `js/00-scene-core.js` — cena, câmera, aleatoriedade, terreno-base e iluminação
2. `js/01-procedural-materials.js` — solo, madeira, palha, shingles e pedra
3. `js/02-valley-terrain.js` — superfície e cores do vale Palancar
4. `js/03-river-roads-falls.js` — rio Anora, estradas e cataratas de Igualda
5. `js/04-forest-ground-cover.js` — pinheiros, capim seco, moitas e seixos
6. `js/05-rural-architecture.js` — casas, açougue de Sloan, forja de Horst, taverna não nomeada e tanoaria de Gedric
7. `js/06-winter-market.js` — feira, tendas de lona texturizada, carroças, fogueiras, cavalos e visitantes
8. `js/07-points-minimap-shortcuts.js` — pontos de interesse, minimapa e teletransportes
9. `js/08-player-animation.js` — movimento, colisões, controles e animação ambiente
10. `css/style.css` — interface e estilos
11. `tests/smoke-test.mjs` — teste de renderização WebGL e alternância da feira em Chromium
12. `.github/workflows/carvahall-smoke-test.yml` — execução automática do teste a cada atualização de código

## Documentação
- [Documento-base de cânone e interpretação](docs/base-canon-eragon.md)
- [Checklist de desenvolvimento por fases](docs/checklist-fases-eragon.md)

O documento-base separa descrições diretas do romance das decisões interpretativas (coordenadas, planta da vila e detalhes não descritos). O checklist registra as etapas de construção, interiores, acessos e feira. A build 08 acrescenta cinco frentes: correção e teste de animação dos moradores, reutilização de geometrias nas construções e interiores, ponto de entrada mais próximo da rua, vegetação de primeiro plano mais presente e cachoeira alinhada à piscina. A validação técnica em Chromium passou na build anterior; a inspeção visual e a medição de desempenho da build 08 permanecem pendentes.

## Refinamento recente — personagens e interiores

Os moradores agora têm proporções corporais mais definidas, rosto legível, olhos, nariz, orelhas, cabelo, mãos, botas, cinto e roupas em camadas. Horst, Sloan e Katrina recebem silhuetas e vestuário diferenciados; os traços físicos não descritos no romance permanecem decisões artísticas. Na feira, vendedores, compradores, mulheres, viajantes e crianças também têm roupas e acessórios distintos.

Os interiores ganharam tábuas de piso, estrutura de madeira, prateleiras e luz local. A taverna permanece sem nome e recebe elementos descritos no romance, como os chifres de Urgal; o açougue mantém a sala ampla, lareira, balcão e palha; a forja ganha mais leitura de oficina. A disposição dos objetos e a decoração não descrita são interpretações.

## Teste automático de navegador
O GitHub Actions executa um teste headless com Chromium a cada atualização de código. Ele confirma o carregamento dos nove módulos, a produção de quadros e triângulos WebGL, e o atalho T do mercado de inverno. As capturas da cena-base e do mercado ficam disponíveis como artefato na execução do workflow: [Carvahall browser smoke test](https://github.com/eitaluis/CARVAHALL/actions/workflows/carvahall-smoke-test.yml).

## Diagnóstico
A página mostra o nome do arquivo e a mensagem quando ocorre um erro de execução. Também expõe `window.CARVAHALL_READY`, `window.CARVAHALL_LOADED_MODULES`, `window.CARVAHALL_RENDERED_FRAMES` e `window.CARVAHALL_RENDER_STATS` para conferir o carregamento, a renderização e métricas básicas da cena. Erros do cliente ficam registrados em `window.CARVAHALL_RUNTIME_ERRORS`.

## Desempenho
A separação em módulos facilita manutenção e evolução, mas não aumenta FPS por si só. O desempenho depende principalmente da geometria, do número de chamadas de desenho, das sombras, dos materiais e da distância de renderização.

## Escopo
Carvahall deve permanecer fiel ao primeiro romance. A feira de inverno é a única alternância de situação narrativa incluída nesta versão; não há variantes de épocas posteriores. A fazenda de Garrow é um cenário separado e distante da vila, não parte do núcleo urbano.


## Nova rodada de naturalismo visual
A direção foi ajustada para evitar o aspecto blocado/low-poly. As montanhas agora usam encostas assimétricas e cristas menos repetitivas; a catarata foi reconstruída como uma queda contínua que conecta a escarpa ao leito, com fluxo e névoa local animados. As copas dos pinheiros passaram a ser compostas por tufos orgânicos independentes, com vento sutil, e a vegetação rasteira foi adensada.

As peças arquitetônicas e o mobiliário receberam arestas suavizadas; troncos e vigas ganharam irregularidade. Moradores e mercadores foram reconstruídos com volumes anatômicos arredondados e articulações reais nos ombros e quadris. A animação agora inclui respiração, mudança de peso, olhares, gestos e pequenos deslocamentos de alguns compradores.

A inspeção visual em navegador continua pendente: as mudanças estão publicadas, mas ainda precisam ser verificadas em execução, especialmente a conexão da catarata com a piscina, a leitura das montanhas, a densidade das copas e a performance.


## Build 09 — reconstrução estrutural e novos avanços
- Ponto inicial aproximado da rua principal para uma leitura mais imediata das construções.
- Capim e moitas distribuídos também nas bordas da vila, com clareiras para estradas e edifícios.
- Pinheiros um pouco mais altos e com variação tonal menos clara.
- Cachoeira mais estreita, posicionada junto à escarpa e curvada em direção à piscina.
- Textura de madeira mais clara, reutilização de geometrias repetidas e moradores adicionais no eixo da rua.

A validação Chromium da build 07 passou com captura da cena-base e do mercado. A build 08 ainda precisa passar pelo mesmo teste e ter suas novas capturas revisadas antes de ser considerada aprovada.


## Build 09 — reconstrução arquitetônica e dos interiores
A arquitetura recebeu uma reconstrução estrutural: as casas passam a ter fundação pétrea, paredes de toras com vãos de portas e janelas, empenas reforçadas com vigas, telhados mais inclinados e portas arqueadas. As lareiras receberam alvenaria irregular e boca escurecida.

Os interiores agora têm piso em tábuas corridas, rodapés, postes de madeira e caibros aparentes sob o telhado. Taverna, açougue, forja, moradia e tanoaria têm arranjos próprios de mesas, assentos, prateleiras, instrumentos de trabalho e áreas de uso. A tanoaria também passou a usar a mesma lógica de telhado e sala de trabalho.

A catarata foi substituída por uma queda vertical junto à escarpa, com poço de impacto, névoa e espuma local, mais um canal que segue em direção ao Anora. As árvores agora usam três variantes de copa; os caminhos receberam ombros de terra, sulcos e cascalho; moradores adicionais caminham lentamente pela rua.

O teste automático passou a produzir imagens separadas para cada interior e para a catarata. A revisão visual dessas capturas e a confirmação da navegação interna continuam pendentes até a execução do teste e inspeção das imagens.


A cobertura de shingles também deixou de usar retângulos regulares em grade: a nova textura usa telhas sobrepostas, bordas arredondadas, larguras variadas, fibras e desgaste irregular para afastar a leitura de blocos. A nova versão usa o cache-buster `20261118-09`.
