import fs from 'fs';
import path from 'path';

const API_SRC = path.join(__dirname, '..');

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__' && entry.name !== 'node_modules') walk(full, files);
    } else if (/\.(ts|js)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

describe('Security audit — SQL and input safety', () => {
  it('does not use unsafe raw SQL helpers', () => {
    const files = walk(API_SRC);
    const offenders: string[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      if (/\$queryRawUnsafe|\$executeRawUnsafe|queryRawUnsafe|executeRawUnsafe/.test(content)) {
        offenders.push(path.relative(API_SRC, file));
      }
    }

    expect(offenders).toEqual([]);
  });

  it('uses Prisma parameterized raw queries for spatial search', () => {
    const searchFile = path.join(API_SRC, 'routes/search.ts');
    const content = fs.readFileSync(searchFile, 'utf8');

    expect(content).toContain('$queryRaw');
    expect(content).toContain('${longitude}');
    expect(content).toContain('${latitude}');
    expect(content).toContain('${radiusInMeters}');
    expect(content).not.toContain('$queryRawUnsafe');
  });

  it('uses sanitizeString on moderation input paths', () => {
    const moderationFile = path.join(API_SRC, 'routes/moderation.ts');
    const content = fs.readFileSync(moderationFile, 'utf8');
    expect(content).toContain('sanitizeString');
  });
});
