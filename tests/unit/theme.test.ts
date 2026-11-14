import { describe, expect, test } from 'bun:test';
import { createThemeController, initializeTheme } from '../../src/theme';
function environment(saved?: string) {
  const values = new Map<string,string>(saved ? [['appearance', saved]] : []);
  const events = new Map<string,Set<Function>>(), changes = new Set<Function>();
  const root = { dataset: {} as Record<string,string>, style: {} as Record<string,string> };
  let dark = false;
  const media = { get matches() { return dark; }, addEventListener(_type:string,fn:Function) { changes.add(fn); }, removeEventListener(_type:string,fn:Function) { changes.delete(fn); } };
  const target = { document:{documentElement:root}, localStorage:{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value)}},matchMedia:()=>media,
    addEventListener(type:string,fn:Function) { if(!events.has(type))events.set(type,new Set());events.get(type)!.add(fn); },removeEventListener(type:string,fn:Function){events.get(type)?.delete(fn)} };
  return { options:{window:target as unknown as Window,storageKey:'appearance',defaultTheme:'clean' as const,defaultMode:'auto' as const},root,values,target,
    system(value:boolean){dark=value;for(const fn of changes)fn()},storage(value:string|null){for(const fn of events.get('storage')??[])fn({key:'appearance',newValue:value})},listeners:()=>changes.size+(events.get('storage')?.size??0) };
}
describe('portable appearance contract',()=>{
  test('initializes stored appearance before rendering, using the resolved OS mode',()=>{
    const env=environment('{"theme":"terminal","mode":"auto"}');env.system(true);
    expect(initializeTheme(env.options)).toEqual({theme:'terminal',mode:'auto',resolvedMode:'dark'});
    expect(env.root.dataset).toEqual({theme:'terminal',mode:'dark'});expect(env.root.style.colorScheme).toBe('dark');
  });
  test('malformed and unsupported stored preferences fall back to the host defaults',()=>{
    for(const saved of ['bad json','{"theme":"unknown","mode":"system"}','null']) {
      const env=environment(saved);expect(initializeTheme(env.options)).toEqual({theme:'clean',mode:'auto',resolvedMode:'light'});
    }
  });
  test('tracks OS changes only in automatic mode, while persisting explicit choices',()=>{
    const env=environment(),controller=createThemeController(env.options),stop=controller.start();
    env.system(true);expect(controller.getSnapshot().resolvedMode).toBe('dark');
    controller.setMode('light');env.system(false);env.system(true);expect(controller.getSnapshot().resolvedMode).toBe('light');
    controller.setTheme('terminal');expect(JSON.parse(env.values.get('appearance')!)).toEqual({theme:'terminal',mode:'light'});
    controller.setMode('auto');expect(controller.getSnapshot().resolvedMode).toBe('dark');stop();expect(env.listeners()).toBe(0);
  });
  test('synchronizes other tabs and resets when their preference is removed',()=>{
    const env=environment(),controller=createThemeController(env.options),stop=controller.start();
    env.storage('{"theme":"terminal","mode":"dark"}');expect(controller.getSnapshot()).toEqual({theme:'terminal',mode:'dark',resolvedMode:'dark'});
    expect(env.values.has('appearance')).toBe(false); // A storage notification does not write back and loop.
    env.storage(null);expect(controller.getSnapshot()).toEqual({theme:'clean',mode:'auto',resolvedMode:'light'});stop();
  });
  test('blocked storage keeps controls and OS mode functional',()=>{
    const env=environment();Object.defineProperty(env.target,'localStorage',{get(){throw Error('blocked')}});
    const controller=createThemeController(env.options),stop=controller.start();controller.setTheme('terminal');controller.setMode('dark');
    expect(env.root.dataset).toEqual({theme:'terminal',mode:'dark'});stop();
  });
  test('shares subscriptions safely across strict-mode mount cleanup and repeated starts',()=>{
    const env=environment(),controller=createThemeController(env.options);let renders=0;const unsubscribe=controller.subscribe(()=>renders++);
    const first=controller.start(),second=controller.start();first();first();expect(env.listeners()).toBe(2);
    const snapshot=controller.getSnapshot();env.system(false);expect(controller.getSnapshot()).toBe(snapshot);expect(renders).toBe(0);
    env.system(true);expect(renders).toBe(1);second();expect(env.listeners()).toBe(0);unsubscribe();
  });
  test('server-side initialization requires no browser globals',()=>{
    expect(initializeTheme({defaultTheme:'clean',defaultMode:'dark'})).toEqual({theme:'clean',mode:'dark',resolvedMode:'dark'});
  });
});
