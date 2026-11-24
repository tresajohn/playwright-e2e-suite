import { Logger, LogLevel } from './logger';

function capture(level: 'info' | 'warn' | 'error', fn: () => void): string {
  let captured = '';
  const orig = console[level];
  console[level] = (msg: string) => {
    captured = msg;
  };
  fn();
  console[level] = orig;
  return captured;
}

// pretty format (CI unset)
{
  delete process.env.CI;
  const logger = new Logger('TestCtx');
  const out = capture('info', () => logger.info('hello world'));
  if (!/\[INFO\]/.test(out)) throw new Error(`missing level in: ${out}`);
  if (!/\[TestCtx\]/.test(out)) throw new Error(`missing context in: ${out}`);
  if (!/hello world/.test(out)) throw new Error(`missing message in: ${out}`);
}

// JSON format (CI=true)
{
  process.env.CI = 'true';
  const logger = new Logger('CICtx');
  const out = capture('info', () => logger.info('structured'));
  const parsed = JSON.parse(out);
  if (parsed.level !== 'INFO') throw new Error(`level wrong: ${parsed.level}`);
  if (parsed.ctx !== 'CICtx') throw new Error(`ctx wrong: ${parsed.ctx}`);
  if (parsed.msg !== 'structured') throw new Error(`msg wrong: ${parsed.msg}`);
  if ('error' in parsed) throw new Error('error key must be absent when no error arg');
  delete process.env.CI;
}

// error() with error arg — JSON has error key
{
  process.env.CI = 'true';
  const logger = new Logger('ErrCtx');
  const out = capture('error', () => logger.error('boom', new Error('cause')));
  const parsed = JSON.parse(out);
  if (!('error' in parsed)) throw new Error('error key missing when error arg provided');
  delete process.env.CI;
}

// level filter: WARN blocks INFO
{
  Logger.setLogLevel(LogLevel.WARN);
  const logger = new Logger('FilterCtx');
  const out = capture('info', () => logger.info('should be silent'));
  if (out !== '') throw new Error(`info should be filtered at WARN level, got: ${out}`);
  Logger.setLogLevel(LogLevel.INFO);
}

// CI='' is falsy — pretty format not JSON
{
  process.env.CI = '';
  const logger = new Logger('EmptyCI');
  const out = capture('info', () => logger.info('empty ci'));
  if (/^\{/.test(out)) throw new Error(`should not be JSON when CI='', got: ${out}`);
  delete process.env.CI;
}

console.log('All Logger tests passed');
