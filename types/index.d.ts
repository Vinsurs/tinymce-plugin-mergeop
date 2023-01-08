import { TinyMCE, MergeopConfig as _$0, MergeopValue as _$1 } from "tinymce"
declare global {
    declare const tinymce: TinyMCE
    declare interface MergeopConfig extends _$0  {}
    declare interface MergeopValue extends _$1  {}
}