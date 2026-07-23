declare module 'turndown-plugin-gfm' {
    import TurndownService = require('turndown')

    type TurndownPlugin = (service: TurndownService) => void

    export const gfm: TurndownPlugin
    export const highlightedCodeBlock: TurndownPlugin
    export const strikethrough: TurndownPlugin
    export const tables: TurndownPlugin
    export const taskListItems: TurndownPlugin
}
