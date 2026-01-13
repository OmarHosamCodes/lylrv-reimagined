declare module "*.css" {
    const stylesheet: CSSStyleSheet;
    export default stylesheet;
}

declare module "*.css?inline" {
    const css: string;
    export default css;
}
