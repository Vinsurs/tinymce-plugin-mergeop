declare module "tinymce" {
    type MergeopConfig = {
        windowTitle: string
        windowCancelText: string
        windowConfirmText: string
        configBtnText: string
        /** @see https://www.tiny.cloud/docs/advanced/editor-icon-identifiers/ */
        configBtnIcon: string
        configLocKey: string
        mergeTriggerStyle: string
    }
    interface RawEditorSettings {
        mergeop?: Partial<MergeopConfig>
    }
    type MergeopValue = Partial<{
        mergeEmpty: boolean
        removeEmpty: boolean
        removeStyle: boolean
        indent: boolean
        align: string
        imageFloat: string
        removeSize: boolean
        removeFamily: boolean
        removeVerboseHtml: boolean
    }>
}
export {};