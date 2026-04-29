# CENIPA Intelligence — Monitoramento e Curadoria de Acidentes Aéreos

Dashboard interativo para visualização e curadoria de ocorrências aeronáuticas brasileiras a partir dos datasets públicos do CENIPA.

---

## Visão geral

O projeto carrega os CSVs no navegador, faz o cruzamento (`join`) automático entre ocorrências e aeronaves pela coluna `codigo_ocorrencia` (ou `occurrence_id`) e apresenta os dados em um painel de inteligência com mapa interativo, filtros dinâmicos, painel de detalhe completo e área de curadoria persistente.

### Principais funcionalidades

- **Mapa interativo** (Leaflet.js) com tema claro/escuro:
  - **Light** — OpenStreetMap
  - **Dark** — CartoDB Dark Matter
- **Marcadores coloridos por classificação:**
  - 🔴 Acidente
  - 🟠 Incidente Grave
  - 🔵 Incidente
- **Linhas de rota** entre origem e destino quando ambos os aeródromos têm coordenadas ICAO conhecidas. Ao focar uma ocorrência, círculos verde/azul-marinho marcam pontos de partida e chegada.
- **Filtros dinâmicos:** Ano, Estado (UF), Modelo de Aeronave e Fabricante (os dois últimos com autocomplete *fuzzy* e setas/Enter para selecionar). Tudo é atualizado em tempo real — mapa, lista, contadores e legenda.
- **Filtros rápidos por chip** no topo: somente curadas, somente com fatalidades.
- **Legenda clicável:** clique para isolar uma classificação (mostra só Acidentes, por exemplo); Ctrl/Cmd+clique para combinar várias. Os contadores na legenda atualizam ignorando o próprio filtro de classe, assim você sempre vê quantos haveria de cada tipo.
- **Painel de detalhe completo** com todos os campos do CSV agrupados em seções:
  - *Topo:* Tipo, Classificação, Data/Hora, Aeronaves Envolvidas, Cidade/UF, País, Aeródromo, Origem→Destino
  - *Aeronave:* Equipamento, Matrícula, Modelo, Fabricante, Motor (tipo + nº de motores), Ano de Fabricação (com idade na época), Peso Máx. Decolagem (kg/lb conforme fonte), Assentos, País/Categoria de Registro
  - *Operação:* Operador / Aviação, Tipo de Operação, Fase da Operação
  - *Consequências:* Nível de Dano, Fatalidades
  - *Investigação* (quando há dado): badge colorido de status (Encerrada/Em andamento/Reaberta), Comando SERIPA, Recomendações Emitidas, Número do relatório com botão de busca por PDF
- **Tooltip resumida** ao passar o mouse no marcador: Tipo, Modelo, Operador, Motor·Ano, Origem, Destino, Fatalidades, Local.
- **Modo foco:** clicar em um marcador isola aquela ocorrência no mapa, mostra a rota completa origem→destino e centraliza a câmera. Banner azul-marinho mostra "✕ Sair do foco".
- **Curadoria persistente** (via `localStorage`): cada ocorrência aceita
  - Narrativa do acidente (texto livre)
  - URL de fotos (aparece no painel e na tooltip do marcador)
  - Links externos / relatórios
  Os dados ficam salvos no navegador entre sessões. Botão **Apagar** remove a curadoria do registro atual.
- **Estatísticas no topo:** total, filtradas, curadas e fatalidades. As duas últimas são chips clicáveis que aplicam o filtro correspondente.
- **Painel retraível** (botão ✕) com botão **≡ Painel** flutuante para reabrir.
- Visual estilo dashboard de inteligência, paleta navy (`#000080`).

---

## Estrutura do projeto

```
Projeto aeronautica/
├── index.html              # marcação da aplicação (ponto de entrada)
├── styles.css              # estilos
├── script.js               # lógica (carga, filtros, mapa, curadoria, tradução)
├── README.md
├── data/                   # CSVs do CENIPA
│   ├── ocorrencia.csv      # ocorrências (português) — fonte primária
│   ├── aeronave.csv        # aeronaves  (português) — fonte primária
│   ├── occurrences.csv     # ocorrências (inglês) — fallback
│   └── aircrafts.csv       # aeronaves  (inglês) — fallback
└── docs/
    └── dicionario_de_dados.pdf  # glossário oficial CENIPA
```

Roda 100% no navegador — sem build, backend ou banco de dados. Bibliotecas externas via CDN:

- [Leaflet 1.9.4](https://leafletjs.com/) — mapa
- [PapaParse 5.4.1](https://www.papaparse.com/) — leitura dos CSVs

---

## Fontes de dados (PT e EN)

Os quatro CSVs na pasta correspondem ao mesmo dataset CENIPA, em dois idiomas:

| Português (preferido) | Inglês (fallback) | Conteúdo |
|---|---|---|
| `ocorrencia.csv` | `occurrences.csv` | Dados da ocorrência (data, local, classificação, tipo, investigação, recomendações, etc.) |
| `aeronave.csv` | `aircrafts.csv` | Dados das aeronaves envolvidas (equipamento, motor, fabricante, modelo, fatalidades, dano, etc.) |

O sistema tenta carregar primeiro o par português (valores já em PT, sem tradução). Se não encontrar os arquivos, cai automaticamente para o par inglês — nesse caso, um dicionário interno (`PT_TRANSLATIONS` em `script.js`, com ~90 termos do glossário CENIPA) traduz os valores antes de exibir, para que a interface fique sempre em português independentemente da fonte.

Os dois pares são equivalentes em conteúdo (mesmas ocorrências, mesmos `occurrence_id`); a única diferença real é que o peso máximo de decolagem aparece em kg no PT e em Lbs no EN — a unidade exibida é ajustada automaticamente.

### Codificação

Os CSVs portugueses já vêm em UTF-8. Os ingleses costumam vir em ISO-8859-1; se forem substituídos, converta para UTF-8 antes de usar (caso contrário caracteres como "Í", "Ã", "Ç" ficam quebrados):

```bash
iconv -f ISO-8859-1 -t UTF-8 data/occurrences.csv -o tmp && mv tmp data/occurrences.csv
iconv -f ISO-8859-1 -t UTF-8 data/aircrafts.csv   -o tmp && mv tmp data/aircrafts.csv
```

---

## Como abrir o projeto

> Importante: navegadores modernos **bloqueiam o carregamento de CSVs via `file://`** por motivos de segurança. É preciso servir os arquivos via HTTP local. Qualquer um dos servidores abaixo serve.

### Opção 1 — Python

Na raiz do projeto:

```bash
python -m http.server 8000
```

Abra: <http://localhost:8000/index.html>

### Opção 2 — Node.js

```bash
npx serve .
```

A URL aparece no terminal (em geral <http://localhost:3000>).

### Opção 3 — VS Code

Instale **Live Server** → clique com o botão direito em `index.html` → *Open with Live Server*.

### Opção 4 — PHP

```bash
php -S localhost:8000
```

E abra <http://localhost:8000/index.html>.

---

## Como usar

1. **Filtrar:** ajuste Ano, UF, Modelo e Fabricante no painel direito. Os campos de modelo/fabricante aceitam digitação parcial (busca *fuzzy*); use ↑↓ + Enter para escolher uma sugestão. O mapa, a lista e os contadores se atualizam em tempo real.
2. **Filtrar por classe:** clique numa entrada da legenda do mapa para isolar (ex.: só Acidentes). Ctrl/Cmd+clique soma várias. Clique de novo na ativa para restaurar tudo.
3. **Atalhos no topo:** os números "Curadas" e "Fatalidades" no header são clicáveis — viram chips de filtro.
4. **Selecionar uma ocorrência:** clique num marcador do mapa **ou** num item da lista. O painel direito é preenchido com todos os campos do CSV e o mapa entra em modo foco (mostra só aquela ocorrência + linha de rota origem→destino).
5. **Sair do foco:** clique no banner "✕ Sair do foco" no topo do mapa, ou clique no marcador focado novamente.
6. **Tema do mapa:** botões **Light** / **Dark** no canto superior esquerdo.
7. **Curar:** preencha narrativa, URL de foto e links no painel direito → **Salvar curadoria**. Um ponto verde (●) aparece nas ocorrências curadas na lista e um anel verde no marcador. **Apagar** remove a curadoria daquele registro.
8. **Recolher o painel:** botão ✕ no canto superior direito do painel; reabre pelo botão **≡ Painel** que aparece sobre o mapa.
9. **Persistência:** as curadorias ficam em `localStorage` (chave `cenipa.curation.v1`) e sobrevivem ao fechamento do navegador. Limpar dados do site apaga.

---

## Sobre o link do Relatório

O CSV do CENIPA **não traz URL para o PDF do relatório** — apenas o número (ex.: `A-001/CENIPA/2012`), um flag publicado/não-publicado e a data de publicação. Para encontrar o PDF, o painel mostra:

- O número do relatório em fonte monospace
- Um badge colorido (verde **Publicado em DD/MM/AAAA** ou cinza **Pendente de publicação**)
- Quando publicado, um link **Buscar PDF ↗** que abre uma busca no Google com o número entre aspas + `filetype:pdf`, geralmente devolvendo o PDF oficial do site do CENIPA

Se quiser linkar diretamente para um PDF específico, edite o link externo do registro pelo formulário de curadoria (campo "Links Externos / Relatórios").

---

## Observação técnica sobre coordenadas

O CSV do CENIPA **não inclui latitude/longitude**. Para plotar:

1. Se algum dia o CSV for substituído por uma versão enriquecida com `latitude`/`longitude`, o sistema usa direto.
2. Caso contrário, ancora o marcador no **centróide da UF** com um *jitter* determinístico baseado em `localidade + codigo_ocorrencia`, de modo que ocorrências do mesmo estado se espalhem visualmente.
3. Para os pontos de origem e destino do voo, o sistema mantém uma tabela embutida com ~90 aeródromos brasileiros codificados pelo padrão **ICAO** (`SBSP`, `SBGR`, `SBBR`, etc.) e desenha a linha tracejada entre eles quando ambos são reconhecidos.

A posição da ocorrência é, portanto, **aproximada por estado** — útil para análise distribucional, não para localização exata. As linhas de rota, em contraste, são **precisas** para os aeródromos catalogados.

---

## Tecnologias

- HTML5, CSS3 (Grid, Flexbox, *custom properties*), JavaScript (ES6+ e *async/await*)
- [Leaflet.js](https://leafletjs.com/) para o mapa
- [PapaParse](https://www.papaparse.com/) para os CSVs
- `localStorage` para curadoria persistente
- `fetch` + `TextDecoder` (UTF-8) para carregar os CSVs

Sem dependências de instalação. Sem build step.

---

## Fonte dos dados

Datasets públicos do **CENIPA — Centro de Investigação e Prevenção de Acidentes Aeronáuticos** (Força Aérea Brasileira). Glossário oficial em `dicionario_de_dados.pdf`.
