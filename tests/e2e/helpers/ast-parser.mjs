import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(process.cwd());

export function resolveRepoPath(relPath) {
  return path.resolve(REPO_ROOT, relPath);
}

export function readFileContent(relPath) {
  const fullPath = resolveRepoPath(relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File does not exist: ${relPath} (resolved: ${fullPath})`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

export function fileExists(relPath) {
  return fs.existsSync(resolveRepoPath(relPath));
}

export function hasPattern(content, pattern) {
  if (pattern instanceof RegExp) {
    return pattern.test(content);
  }
  return content.includes(pattern);
}

export function countOccurrences(content, pattern) {
  if (pattern instanceof RegExp) {
    const matches = content.match(pattern);
    return matches ? matches.length : 0;
  }
  return content.split(pattern).length - 1;
}

export function extractCssVariables(cssContent) {
  const vars = {};
  const varRegex = /(--[a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = varRegex.exec(cssContent)) !== null) {
    vars[match[1].trim()] = match[2].trim();
  }
  return vars;
}

export function extractScopedCssVariables(cssContent, scopeSelector) {
  const vars = {};
  const escaped = scopeSelector.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const scopeRegex = new RegExp(`${escaped}\\s*\\{([^}]+)\\}`, 'g');
  const scopeMatch = scopeRegex.exec(cssContent);
  if (!scopeMatch) return vars;
  
  const block = scopeMatch[1];
  const varRegex = /(--[a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = varRegex.exec(block)) !== null) {
    vars[match[1].trim()] = match[2].trim();
  }
  return vars;
}

// Relative luminance and contrast calculation (WCAG 2.1)
function hexToRgb(hex) {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function luminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function getContrastRatio(hex1, hex2) {
  try {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    const lum1 = luminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = luminance(rgb2.r, rgb2.g, rgb2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch {
    return 1;
  }
}
