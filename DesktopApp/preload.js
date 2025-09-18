const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');

function safeReadJson(absPath){
  const text = fs.readFileSync(absPath, 'utf-8');
  return JSON.parse(text);
}

const shortcutsRoot = path.join(__dirname, '..', 'CtrlHelpApp', 'Shortcuts');

function normalizeKey(name){
  const map = {
    'Control':'Ctrl', 'Menu':'Alt', 'Return':'Enter', 'Back':'Backspace',
    'Add':'+', 'Subtract':'-', 'Multiply':'*', 'Divide':'/', 'Decimal':'.',
    'Number0':'0','Number1':'1','Number2':'2','Number3':'3','Number4':'4','Number5':'5','Number6':'6','Number7':'7','Number8':'8','Number9':'9',
    'NumberPad0':'Num0','NumberPad1':'Num1','NumberPad2':'Num2','NumberPad3':'Num3','NumberPad4':'Num4','NumberPad5':'Num5','NumberPad6':'Num6','NumberPad7':'Num7','NumberPad8':'Num8','NumberPad9':'Num9',
    'Left':'Sol','Right':'Sağ','Up':'Yukarı','Down':'Aşağı',
    'PageUp':'PageUp','PageDown':'PageDown'
  };
  return map[name] || name;
}

function convertShortcutFile(json){
  // json: array of { groupInternalName, shortcuts: [...] }
  return json.map(g=>({
    group: g.groupInternalName,
    shortcuts: (g.shortcuts||[]).map(sc=>({
      desc: (sc.displayNames && (sc.displayNames['tr-tr']||sc.displayNames['en-us'])) || sc.internalName,
      keys: (sc.keyCombination||[]).map(combo=> combo.map(k=> normalizeKey(k)))
    }))
  }));
}

contextBridge.exposeInMainWorld('appEnv', { platform: process.platform });

contextBridge.exposeInMainWorld('ctrlLib', {
  listApps: () => {
    try{
      const idx = safeReadJson(path.join(shortcutsRoot,'apps.json'));
      return idx.map(group => ({
        group: group.groupInternalName,
        apps: group.apps.map(a=>({ name: a.appDisplayName, file: a.shortcutsFile }))
      }));
    }catch{ return []; }
  },
  loadApp: (relativePath) => {
    try{
      const abs = path.join(shortcutsRoot, relativePath);
      const json = safeReadJson(abs);
      return convertShortcutFile(json);
    }catch{ return []; }
  }
});

