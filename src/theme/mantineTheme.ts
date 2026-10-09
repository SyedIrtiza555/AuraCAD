// src/theme/mantineTheme.ts
// Mantine Theme Configuration implementing 60-30-10 Color Rule from Huemint Palette
// Palette: 000000-83dd24-ec1e25-29aae0 (90% size scale)

import { createTheme, MantineColorsTuple, localStorageColorSchemeManager } from '@mantine/core';

// 1. 10-Shade Scales derived from Huemint Palette
const brandCyan: MantineColorsTuple = [
  '#e8f7fc',
  '#c8edf9',
  '#a4e1f5',
  '#7cd4f1',
  '#54c7ed',
  '#29aae0', // Core Brand Cyan (#29aae0)
  '#1f8ec0',
  '#1772a0',
  '#105780',
  '#083d60'
];

const brandLime: MantineColorsTuple = [
  '#f1fbe5',
  '#e0f7bf',
  '#cdf394',
  '#b8ee66',
  '#a0e73a',
  '#83dd24', // Core Electric Lime (#83dd24)
  '#6ebc1c',
  '#5a9c15',
  '#457c0e',
  '#305c08'
];

const brandCrimson: MantineColorsTuple = [
  '#fde8e9',
  '#fbc7c9',
  '#f7a1a4',
  '#f3767a',
  '#ef4a50',
  '#ec1e25', // Core Crimson Scarlet (#ec1e25)
  '#c9151c',
  '#a60e14',
  '#83080d',
  '#600407'
];

// 60% Dominant Dark Obsidian scale
const obsidianDark: MantineColorsTuple = [
  '#d5d7e0', // 0: text primary
  '#acaebf', // 1: text secondary
  '#8c8fa3', // 2: text muted
  '#5c5f73', // 3: subtle borders
  '#3c3f53', // 4: active borders
  '#262938', // 5: elevated hover
  '#1a1d28', // 6: cards / surfaces (30% secondary)
  '#12141c', // 7: panel backgrounds
  '#0a0b10', // 8: base workspace canvas
  '#050608'  // 9: deep obsidian black (60% dominant)
];

// Color Scheme Manager with LocalStorage Persistence
export const colorSchemeManager = localStorageColorSchemeManager({
  key: 'auracad-color-scheme-preference'
});

// Mantine Theme Override with 90% Scale Factor
export const mantineTheme = createTheme({
  // Only use Mantine UI 90% smaller than usual:
  scale: 0.9,
  primaryColor: 'brandCyan',
  defaultRadius: 'md',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace',

  colors: {
    brandCyan,
    brandLime,
    brandCrimson,
    dark: obsidianDark
  },

  // High-Density Component Defaults
  components: {
    Button: {
      defaultProps: {
        size: 'xs',
        radius: 'md'
      }
    },
    Badge: {
      defaultProps: {
        size: 'xs',
        radius: 'sm'
      }
    },
    TextInput: {
      defaultProps: {
        size: 'xs',
        radius: 'md'
      }
    },
    Select: {
      defaultProps: {
        size: 'xs',
        radius: 'md'
      }
    },
    Textarea: {
      defaultProps: {
        size: 'xs',
        radius: 'md'
      }
    },
    Card: {
      defaultProps: {
        radius: 'md',
        withBorder: true
      }
    },
    Paper: {
      defaultProps: {
        radius: 'md'
      }
    },
    Modal: {
      defaultProps: {
        radius: 'lg',
        overlayProps: {
          backgroundOpacity: 0.5,
          blur: 4
        }
      }
    },
    Drawer: {
      defaultProps: {
        radius: 'md',
        overlayProps: {
          backgroundOpacity: 0.5,
          blur: 4
        }
      }
    }
  }
});
