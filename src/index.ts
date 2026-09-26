import { ScatterLeaf } from './core/scatter-leaf';

export { ScatterLeaf };
export * from './types';

// Auto-registro no navegador como Custom Element W3C
if (typeof window !== 'undefined' && !customElements.get('scatter-leaf')) {
  customElements.define('scatter-leaf', ScatterLeaf);
}

// Extensão de tipos para suporte a JSX / frameworks
declare global {
  interface HTMLElementTagNameMap {
    'scatter-leaf': ScatterLeaf;
  }
}
