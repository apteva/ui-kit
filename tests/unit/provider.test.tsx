import { test, expect } from 'bun:test';
import { renderToString } from 'react-dom/server';
import { ThemeProvider, useTheme } from '../../src/ThemeProvider';
function Snapshot() {
  const {theme,mode,resolvedMode} = useTheme();
  return <span>{`${theme}/${mode}/${resolvedMode}`}</span>;
}
test('server rendering uses a deterministic default snapshot and no document mutation',()=>{
  const root = {dataset:{},style:{}};
  const target = {
    localStorage:{getItem:()=>JSON.stringify({theme:'clean',mode:'light'})},
    matchMedia:()=>({matches:false}),document:{documentElement:root},
  } as unknown as Window;
  expect(renderToString(<ThemeProvider window={target}><Snapshot /></ThemeProvider>)).toBe('<span>terminal/auto/dark</span>');
  expect(root.dataset).toEqual({});
});
