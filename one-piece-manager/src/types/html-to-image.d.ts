declare module 'html-to-image' {
  export interface Options {
    quality?: number
    width?: number
    height?: number
    style?: Partial<CSSStyleDeclaration>
    filter?: (node: Element) => boolean
    backgroundColor?: string
    pixelRatio?: number
    useCORS?: boolean
    allowTaint?: boolean
    includeQueryParams?: boolean
  }

  export function toPng(node: HTMLElement, options?: Options): Promise<string>
  export function toJpeg(node: HTMLElement, options?: Options): Promise<string>
  export function toSvg(node: HTMLElement, options?: Options): Promise<string>
  export function toCanvas(node: HTMLElement, options?: Options): Promise<HTMLCanvasElement>
  export function toPixelData(node: HTMLElement, options?: Options): Promise<Uint8ClampedArray>
}
