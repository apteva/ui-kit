import * as React from 'react';
import { createRoot } from 'react-dom/client';
import {
  ThemeProvider, useTheme, useColorMode, Card, CardHeader, Row, DataList,
  StatusPill, KPI, AgentMark, AvatarStack, Timeline, isHostUIRequest,
} from '@apteva/ui-kit';
import type { ThemeName, ThemeMode, AppHost, ThemeOptions } from '@apteva/ui-kit';
import '@apteva/ui-kit/theme.css';
import '@apteva/ui-kit/styles.css';

const options: ThemeOptions = { defaultTheme: 'terminal', defaultMode: 'auto', storageKey: 'consumer.appearance' };
function Gallery() {
  const appearance = useTheme(), colorMode = useColorMode();
  (window as any).appearance = appearance;
  (window as any).colorMode = colorMode;
  (window as any).hostGuard = isHostUIRequest({chatAssistant: {launcher: 'hidden'}});
  return <>
    <div id="outside" className="flex border rounded-md text-sm">Host content</div>
    <div className="apteva-ui apteva-page" id="surface">
      <label>Theme <select aria-label="Theme" value={appearance.theme} onChange={e => appearance.setTheme(e.target.value as ThemeName)}>
        <option value="terminal">Terminal</option><option value="clean">Clean</option>
      </select></label>
      <label>Mode <select aria-label="Mode" value={appearance.mode} onChange={e => appearance.setMode(e.target.value as ThemeMode)}>
        <option value="auto">System</option><option value="dark">Dark</option><option value="light">Light</option>
      </select></label>
      <output>{appearance.theme}/{appearance.mode}/{appearance.resolvedMode}/{colorMode}</output>
      <Card className="sample-card">
        <CardHeader title="Shared card" subtitle="Standalone consumer" vendor={{name:'Apteva',color:{light:'#123456',dark:'#abcdef'}}} action={{label:'Open',href:'#open'}} status={{label:'Live',variant:'live'}} />
        <Row title="A row" subtitle="Details" onClick={() => {}} leading={<AgentMark size="sm" />} trailing={<StatusPill variant="success">Ready</StatusPill>} />
        <DataList items={[{label:'Owner',value:'Apteva'},{label:'State',value:'Ready'}]} />
        <KPI label="Items" value="42" delta="+3" tone="positive" />
        <AvatarStack users={[{name:'Ada'},{name:'Lin'}]} />
        <Timeline events={[{id:'one',timestamp:'2026-11-14T12:00:00Z',title:'Created',tone:'success'}]} />
      </Card>
      <Card href="#card" className="link-card">Linked card</Card>
    </div>
  </>;
}
let root: ReturnType<typeof createRoot>;
(window as any).unmount = () => root.unmount();
(window as any).mount = () => (root = createRoot(document.getElementById('root')!)).render(<React.StrictMode><ThemeProvider {...options}><Gallery /></ThemeProvider></React.StrictMode>);
if (!location.search.includes('defer')) (window as any).mount();
