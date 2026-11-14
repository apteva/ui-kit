import { initializeTheme } from '@apteva/ui-kit/theme';
const options = { defaultTheme: 'terminal' as const, defaultMode: 'auto' as const, storageKey: 'consumer.appearance' };
// The test captures these before the document's body and React bundle exist.
(window as any).firstTheme = initializeTheme(options);
(window as any).firstBody = document.body;
