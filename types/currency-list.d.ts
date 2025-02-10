declare module 'currency-list/data/cldr.json' {
  const currencies: Record<string, {
    name: string;
    code: string;
    symbol?: string;
    number?: string;
  }>;
  export default currencies;
} 