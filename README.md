# tinymce-plugin-mergeop

A [tinymce](https://www.tiny.cloud/) plugin that provides merge operation

## Usage

```ts
const plugins = ["mergeop indent2em"] 
const toolbar = ["mergeop_config mergeop_trigger"]
```
## config
```ts
tinymce.init({
    // ...
    mergeop: {
        windowTitle: string
        windowCancelText: string
        windowConfirmText: string
        configBtnText: string
        configBtnIcon: string
        configLocKey: string
        mergeTriggerStyle: string
    }
})
```
> note: [indent2em](http://tinymce.ax-z.cn/more-plugins/indent2em.php) plugin is required if you need indent-first-line requirement

## License

MIT