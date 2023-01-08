import type { MergeopValue, MergeopConfig } from "tinymce"
tinymce.PluginManager.add('mergeop', function(editor) {
  const pluginName = "合并操作"
  const def: MergeopConfig = {
    windowTitle: "配置一键排版",
    windowCancelText: "取消",
    windowConfirmText: "保存配置",
    configBtnText: "配置",
    /** @see https://www.tiny.cloud/docs/advanced/editor-icon-identifiers/ */
    configBtnIcon: "preferences",
    configLocKey: "mergeop_config_loc_key",
    mergeTriggerStyle: ""
  }
  const config: MergeopConfig = Object.assign({}, def, editor.getParam("mergeop", {}))
  const alignCommandMap = new Map([
    ['1', "JustifyLeft"],
    ['2', "JustifyLeft"],
    ['3', "JustifyCenter"],
    ['4', "JustifyRight"],
  ])
  const locConfig = {
    get(): MergeopValue | undefined {
      const _config = localStorage.getItem(config.configLocKey)
      return  _config ? JSON.parse(_config) : void 0
    },
    set(_config: MergeopValue) {
      localStorage.setItem(config.configLocKey, JSON.stringify(_config))
    }
  }
  const openDialog = function () {
    return editor.windowManager.open<MergeopValue>({
      title: config.windowTitle,
      body: {
        type: 'panel',
        classes: ['djdjd','ddd'],
        items: [
          {
            type: 'grid',
            columns: 2,
            items: [
              {
                type: 'checkbox',
                name: 'mergeEmpty',
                label: '合并空行'
              },
              {
                type: 'checkbox',
                name: 'removeEmpty',
                label: '清除空行'
              },
              {
                type: 'checkbox',
                name: 'removeStyle',
                label: '清除格式'
              },
              {
                type: 'checkbox',
                name: "indent",
                label: '首行缩进'
              },
            ]
          },
          {
            type: 'selectbox',
            name: "align",
            items: [
              { value: '1', text: '默认'},
              { value: '2', text: '左对齐'},
              { value: '3', text: '居中'},
              { value: '4', text: '右对齐'}
            ],
            label: "对齐方式"
          },
          {
            type: 'selectbox',
            name: "imageFloat",
            items: [
              { value: '1', text: '默认'},
              { value: '2', text: '左对齐'},
              { value: '3', text: '居中'},
              { value: '4', text: '右对齐'},
            ],
            label: "图片浮动"
          },
          {
            type: 'checkbox',
            name: "removeSize",
            label: '清除字号'
          },
          {
            type: 'checkbox',
            name: "removeFamily",
            label: '清除字体'
          },
          {
            type: 'checkbox',
            name: "removeVerboseHtml",
            label: '清除冗余HTML代码'
          },
        ]
      },
      buttons: [
        {
          type: 'cancel',
          text: config.windowCancelText,
        },
        {
          type: 'submit',
          text: config.windowConfirmText,
          primary: true
        }
      ],
      onSubmit: function (api) {
        locConfig.set(api.getData())
        api.close()
      },
      initialData: locConfig.get()
    });
  };
  function manipute(data: MergeopValue, cb: CallableFunction) {
    function done() {
      if (!editor.selection.isCollapsed()) {
        editor.selection.collapse(false)
      }
      editor.focus(true)
      cb()
    }
    
    editor.execCommand("SelectAll")
    let selBlocks = editor.selection.getSelectedBlocks()
    if (!selBlocks || selBlocks.length === 0) {
      done()
      return;
    }
    // note: must no.1
    if (data.imageFloat) {
      selBlocks = editor.selection.getSelectedBlocks()
      if (data.imageFloat === '1' || !selBlocks || selBlocks.length === 0) {
        // noop
      } else {
        const floatMode = {
          left: {
            value: "2",
            properties: [
              { name: "float", value: "left" }
            ]
          },
          center: {
            value: "3",
            properties: [
              { name: "display", value: "block" },  
              { name: "margin-left", value: "auto" },  
              { name: "margin-right", value: "auto" }  
            ]
          },
          right: {
            value: "4",
            properties: [
              { name: "float", value: "right" }
            ]
          }
        }
        // walk
        tinymce.util.Tools.each(selBlocks, block => {
          if (!editor.dom.isEmpty(block) && block.firstChild) {
            const walker = new tinymce.dom.TreeWalker(block.firstChild, block)
            do {
              const current = walker.current()
              if (current.nodeName.toUpperCase() === "IMG") {
                // avoid float influence
                editor.dom.setStyle(block, "overflow","hidden")
                const cs = editor.dom.parseStyle(editor.dom.getAttrib(current, "style"))
                // polish
                const keys = Object.keys(cs)
                if (keys.length !== 0) {
                  // @ts-ignore
                  Array.from(new Set(Object.keys(floatMode).reduce((prev, next: keyof typeof floatMode) => {
                    prev.push(...Reflect.get(floatMode, next).properties.map(l => l.name))
                    return prev
                  }, [] as string[]))).forEach(prop => Reflect.deleteProperty(cs, prop))
                }
                // patch
                if (data.imageFloat === floatMode.left.value) {
                  floatMode.left.properties.forEach(l => {
                    Reflect.set(cs, l.name, l.value, cs)
                  })
                } else if (data.imageFloat === floatMode.center.value) {
                  floatMode.center.properties.forEach(l => {
                    Reflect.set(cs, l.name, l.value, cs)
                  })
                } else if (data.imageFloat === floatMode.right.value) {
                  floatMode.right.properties.forEach(l => {
                    Reflect.set(cs, l.name, l.value, cs)
                  })
                }
                // decorate
                editor.dom.setAttrib(current, "style", editor.dom.serializeStyle(cs))
              }
            } while(walker.next(false));
          }
        })
      }
    }
    let emptyLineCount = 0
    if (data.mergeEmpty) {
      let joinedEmptyLineCount = 0
      tinymce.util.Tools.each(selBlocks, block => {
        if (editor.dom.isEmpty(block)) {
          emptyLineCount++;
          if (joinedEmptyLineCount + 1 >= 2) {
            editor.dom.remove(block, false)
            emptyLineCount--;
          } else {
            joinedEmptyLineCount++;
          }
        } else {
          joinedEmptyLineCount = 0
        }
      })
    }
    if (data.removeEmpty) {
      if (!(data.mergeEmpty && emptyLineCount===0)) {
        selBlocks = editor.selection.getSelectedBlocks()
        tinymce.util.Tools.each(selBlocks, block => {
          if (editor.dom.isEmpty(block)) {
            editor.dom.remove(block, false)
          }
        })
      }
    }
    if (data.removeStyle) {
      editor.execCommand("RemoveFormat")
    }
    if (data.indent) {
      // indent2em plugin requied
      if (editor.hasPlugin("indent2em")) {
        editor.execCommand("indent2em")  
      }
    }
    if (data.align) {
      const cmd = alignCommandMap.get(data.align)
      cmd && editor.execCommand(cmd)
    }
    
    if (data.removeSize) {
      editor.execCommand('FontSize',false,'16px')
    }
    if (data.removeFamily) {
      editor.execCommand('FontName', false, 'Arial')
    }
    if (data.removeVerboseHtml) {
      // Todo
    }
    done()
  }
  editor.ui.registry.addButton('mergeop_config', {
    type: "button",
    text: config.configBtnText,
    tooltip: pluginName,
    icon: config.configBtnIcon,
    onAction: function () {
      openDialog();
    },
  });
  editor.ui.registry.addButton('mergeop_trigger', {
    type: "button",
    text: "<span id='mergeop_trigger' style='color: white'>一键排版</span>",
    tooltip: pluginName,
    onAction(api) {
      if (api.isDisabled()) return;
      api.setDisabled(true)
      const data = locConfig.get()
      if (data) {
        manipute(data, () => {
          api.setDisabled(false)
          editor.notificationManager.open({
            type: "success",
            text: "操作成功",
            timeout: 1500,
            closeButton: false
          })
        })
      }
    },
    onSetup() {
      tinymce.DOM.addStyle(`button:has(#mergeop_trigger) { background: #207ab7; ${config.mergeTriggerStyle}}`)
      return () => {}
    }
  })
  return {
    getMetadata() {
      return {
        name: pluginName,
        url: "https://npmjs.com/package/tinymce-plugin-mergeop"
      }
    },
  }
})