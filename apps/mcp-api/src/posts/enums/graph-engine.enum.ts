export enum GraphEngine {
  MERMAID = 'mermaid', // diagramas: fluxograma, arquitetura, timeline — renderizado via Puppeteer in-process
  CHART = 'chart', // gráficos de dados: pizza, barra, linha — renderizado via chartjs-node-canvas in-process
}
