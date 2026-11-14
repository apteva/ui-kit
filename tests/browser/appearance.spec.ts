import { test, expect, type Page } from '@playwright/test';

async function ready(page: Page, path = '/') {
  await page.goto(path);
  await expect(page.locator('output')).toContainText(/terminal|clean/);
}
async function appearance(page: Page, theme: string, mode: string) {
  await page.getByLabel('Theme', { exact: true }).selectOption(theme);
  await page.getByLabel('Mode', { exact: true }).selectOption(mode);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  if (mode !== 'auto') await expect(page.locator('html')).toHaveAttribute('data-mode', mode);
}
async function tokens(page: Page) {
  return page.evaluate(() => {
    const css = getComputedStyle(document.documentElement);
    const names = ['bg','bg-card','bg-subtle','bg-hover','bg-input','bg-overlay','text','text-muted','text-dim','border','border-subtle','border-strong','accent','accent-hover','accent-muted','success','warn','error','info','recurring','activity-thought','font-base','font-mono-fixed','radius-sm','radius-md','radius-lg','shadow-card','shadow-popover'];
    return Object.fromEntries(names.map(name => [name,css.getPropertyValue(`--${name}`).trim()]));
  });
}
async function styles(page: Page) {
  // Theme changes animate some existing components; compare their settled style.
  await page.locator('.sample-card').evaluate(async () => {
    await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {})));
  });
  return page.evaluate(() => {
    const properties = ['display','fontFamily','fontSize','lineHeight','color','backgroundColor','borderTopWidth','borderTopStyle','borderTopColor','borderRadius','paddingTop','paddingLeft','marginLeft','marginTop','textDecorationLine','gap'];
    const selectors = ['.sample-card','.link-card','.sample-card button','.sample-card dl','.sample-card dd','.sample-card a','.sample-card svg','.sample-card .rounded-md','.sample-card .rounded-lg'];
    return Object.fromEntries(selectors.map(selector => {
      const element = document.querySelector(selector);
      if (!element) throw new Error(`Missing gallery selector: ${selector}`);
      const computed = getComputedStyle(element);
      return [selector,Object.fromEntries(properties.map(name => [name, (computed as any)[name]]))];
    }));
  });
}

test('packed exports, declarations and peer React work in a separate app', async ({page}) => {
  const errors: string[] = [];page.on('pageerror', error => errors.push(error.message));
  await ready(page);
  expect(await page.evaluate(() => (window as any).hostGuard)).toBe(true);
  expect(await (await page.request.get('/metadata')).json()).toMatchObject({reactShared:true,version:'0.4.0'});
  expect(errors).toEqual([]);
});

for (const theme of ['terminal','clean']) for (const mode of ['dark','light'] as const) {
  test(`${theme}/${mode} matches dashboard component appearance`, async ({page,context}) => {
    await page.emulateMedia({colorScheme:mode});
    await ready(page);await appearance(page,theme,mode);
    const actual = await styles(page);
    const metadata = await (await page.request.get('/metadata')).json();
    if (metadata.reference) {
      const reference = await context.newPage();await reference.emulateMedia({colorScheme:mode});
      await ready(reference,'/?reference');
      // Reference doesn't import standalone styles; only the current dashboard CSS.
      await appearance(reference,theme,mode);
      expect(await tokens(page)).toEqual(await tokens(reference));
      expect(actual).toEqual(await styles(reference));
      await reference.close();
    }
    await expect(page.locator('#surface')).toHaveCSS('font-size','15px');
    await expect(page.locator('.sample-card')).toHaveCSS('border-top-width','1px');
    await expect(page.locator('.sample-card .rounded-md').first()).toHaveCSS('border-radius',theme === 'terminal' ? '4px' : '8px');
    await expect(page.locator('.link-card')).toHaveCSS('text-decoration-line','none');
    await expect(page.locator('.sample-card dd').first()).toHaveCSS('margin-left','0px');
    await page.locator('.link-card').hover();
    const expected = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--border-strong').trim());
    await expect.poll(() => page.locator('.link-card').evaluate((node,value) => { const probe=document.createElement('div');probe.style.color=value;document.body.append(probe);const color=getComputedStyle(probe).color;probe.remove();return getComputedStyle(node).borderTopColor===color; },expected)).toBe(true);
    await page.getByLabel('Theme',{exact:true}).focus();
    await expect(page.getByLabel('Theme',{exact:true})).toHaveCSS('outline-width','2px');
    await page.screenshot({path:test.info().outputPath(`${theme}-${mode}.png`),fullPage:true});
  });
}

test('styles stay inside the opted-in wrapper',async ({page})=>{
  await ready(page);
  await expect(page.locator('#outside')).toHaveCSS('display','block');
  await expect(page.locator('#outside')).toHaveCSS('border-top-width','0px');
  await expect(page.locator('#outside')).toHaveCSS('border-radius','0px');
  await expect(page.locator('#outside')).toHaveCSS('font-size','16px');
});

test('automatic OS changes, explicit overrides, persistence and legacy useColorMode',async ({page})=>{
  await page.emulateMedia({colorScheme:'light'});await ready(page);
  await expect(page.locator('output')).toHaveText('terminal/auto/light/light');
  await page.emulateMedia({colorScheme:'dark'});
  await expect(page.locator('output')).toHaveText('terminal/auto/dark/dark');
  await appearance(page,'clean','light');
  await expect(page.locator('output')).toHaveText('clean/light/light/light');
  await page.emulateMedia({colorScheme:'light'});await page.emulateMedia({colorScheme:'dark'});
  await expect(page.locator('output')).toHaveText('clean/light/light/light');
  // Dark utility variants follow resolved mode, even when the OS disagrees.
  const neutral = await page.locator('.sample-card .rounded-md').first().evaluate(node=>getComputedStyle(node).color);
  await page.reload();await expect(page.locator('output')).toHaveText('clean/light/light/light');
  expect(await page.locator('.sample-card .rounded-md').first().evaluate(node=>getComputedStyle(node).color)).toBe(neutral);
  await page.getByLabel('Mode',{exact:true}).selectOption('auto');
  await expect(page.locator('output')).toHaveText('clean/auto/dark/dark');
});

test('cross-tab preference updates, removal, clear, and unrelated keys',async ({page,context})=>{
  await page.emulateMedia({colorScheme:'light'});await ready(page);
  const other=await context.newPage();await other.emulateMedia({colorScheme:'light'});await ready(other);
  await appearance(page,'clean','dark');await expect(other.locator('output')).toHaveText('clean/dark/dark/dark');
  await page.evaluate(()=>localStorage.setItem('other.appearance','unrelated'));await expect(other.locator('output')).toHaveText('clean/dark/dark/dark');
  await page.evaluate(()=>localStorage.removeItem('consumer.appearance'));await expect(other.locator('output')).toHaveText('terminal/auto/light/light');
  await appearance(page,'terminal','dark');await expect(other.locator('output')).toHaveText('terminal/dark/dark/dark');
  await page.evaluate(()=>localStorage.clear());await expect(other.locator('output')).toHaveText('terminal/auto/light/light');
});

test('blocked storage retains working controls and OS tracking',async ({page})=>{
  await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError')}}));
  await page.emulateMedia({colorScheme:'light'});await ready(page);
  await appearance(page,'clean','dark');await expect(page.locator('output')).toHaveText('clean/dark/dark/dark');
  await page.getByLabel('Mode',{exact:true}).selectOption('auto');await expect(page.locator('output')).toHaveText('clean/auto/light/light');
  await page.emulateMedia({colorScheme:'dark'});await expect(page.locator('output')).toHaveText('clean/auto/dark/dark');
});

test('blocking initializer applies saved appearance before body or React exists',async ({page})=>{
  await page.addInitScript(()=>localStorage.setItem('consumer.appearance',JSON.stringify({theme:'clean',mode:'dark'})));
  await page.emulateMedia({colorScheme:'light'});await page.goto('/?defer');
  expect(await page.evaluate(()=>(window as any).firstBody)).toBe(null);
  expect(await page.evaluate(()=>(window as any).firstTheme)).toEqual({theme:'clean',mode:'dark',resolvedMode:'dark'});
  await expect(page.locator('html')).toHaveAttribute('data-theme','clean');await expect(page.locator('html')).toHaveAttribute('data-mode','dark');
  await expect(page.locator('#root')).toBeEmpty();
  await page.waitForFunction(()=>typeof (window as any).mount==='function');await page.evaluate(()=>(window as any).mount());
  await expect(page.locator('output')).toHaveText('clean/dark/dark/dark');
});

test('provider unmount releases OS and storage listeners, then remount restores preferences',async ({page})=>{
  await page.emulateMedia({colorScheme:'light'});await ready(page);
  await page.evaluate(()=>(window as any).unmount());
  await expect(page.locator('#root')).toBeEmpty();
  await page.emulateMedia({colorScheme:'dark'});
  await page.evaluate(()=>window.dispatchEvent(new StorageEvent('storage',{
    key:'consumer.appearance',newValue:JSON.stringify({theme:'clean',mode:'dark'}),storageArea:localStorage,
  })));
  await expect(page.locator('html')).toHaveAttribute('data-theme','terminal');
  await expect(page.locator('html')).toHaveAttribute('data-mode','light');
  await page.evaluate(()=>(window as any).mount());
  await expect(page.locator('output')).toHaveText('terminal/auto/dark/dark');
});
