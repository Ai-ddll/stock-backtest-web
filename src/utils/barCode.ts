/** 将股票代码转为 5 分钟 K 线 code，如 601398 → sh601398 */
export function symbolToBarCode(symbol: string): string {
  if (symbol.startsWith('sh') || symbol.startsWith('sz')) {
    return symbol.toLowerCase()
  }
  if (symbol.startsWith('6')) {
    return `sh${symbol}`
  }
  return `sz${symbol}`
}
