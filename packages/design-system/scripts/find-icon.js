#!/usr/bin/env node
/**
 * Hugeicons Icon Finder
 * 
 * Searches Hugeicons and generates React Native code for selected icons.
 * 
 * Note: For AI coding tools, use the Hugeicons MCP server instead:
 * - Setup: See .cursor/mcp-setup.md
 * - MCP provides: search_icons, get_platform_usage tools
 * - Reference: https://github.com/hugeicons/mcp-server
 * 
 * Usage:
 *   node scripts/find-icon.js "plus"
 *   node scripts/find-icon.js "settings" --style=Stroke --type=Rounded
 */

const https = require('https');
const { URL } = require('url');

const DEFAULT_STYLE = 'Stroke';
const DEFAULT_TYPE = 'Rounded';

function searchHugeicons(query, style = DEFAULT_STYLE, type = DEFAULT_TYPE) {
  return new Promise((resolve, reject) => {
    const searchUrl = `https://hugeicons.com/icons?style=${style}&type=${type}&search=${encodeURIComponent(query)}`;
    
    // Since Hugeicons doesn't have a public API, we'll provide instructions
    // and a code template generator instead
    console.log(`\n🔍 Search Hugeicons: ${searchUrl}\n`);
    console.log('📋 Instructions:');
    console.log('1. Open the URL above in your browser');
    console.log('2. Browse the search results');
    console.log('3. Find the icon you want (e.g., "Plus01Icon")');
    console.log('4. Use the icon name with this template:\n');
    
    // Generate React Native code template
    const iconName = query.charAt(0).toUpperCase() + query.slice(1) + '01Icon';
    const code = generateReactNativeCode(iconName, query);
    console.log(code);
    console.log('\n💡 Tip: Icon names follow the pattern: {Name}{Number}Icon');
    console.log('   Examples: Plus01Icon, Settings01Icon, Add01Icon\n');
    console.log('🤖 For AI Tools: Use Hugeicons MCP server for automated search');
    console.log('   Setup: See .cursor/mcp-setup.md');
    console.log('   MCP Server: https://github.com/hugeicons/mcp-server\n');
    
    resolve({ searchUrl, iconName, code });
  });
}

function generateReactNativeCode(iconName, searchTerm) {
  return `import { HugeiconsIcon, ${iconName} } from '@darkresearch/design-system';

// Usage in component:
<HugeiconsIcon
  icon={${iconName}}
  size={20}
  color="#EEEDED"
  strokeWidth={1.5}
/>

// Or in FAB:
<FAB
  icon={
    <HugeiconsIcon
      icon={${iconName}}
      size={20}
      color="#EEEDED"
      strokeWidth={1.5}
    />
  }
  onPress={() => {}}
/>`;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/find-icon.js <search-term> [--style=Stroke] [--type=Rounded]');
    console.log('\nExample:');
    console.log('  node scripts/find-icon.js "plus"');
    console.log('  node scripts/find-icon.js "settings" --style=Stroke --type=Rounded');
    process.exit(1);
  }
  
  const query = args[0];
  let style = DEFAULT_STYLE;
  let type = DEFAULT_TYPE;
  
  args.slice(1).forEach(arg => {
    if (arg.startsWith('--style=')) {
      style = arg.split('=')[1];
    } else if (arg.startsWith('--type=')) {
      type = arg.split('=')[1];
    }
  });
  
  searchHugeicons(query, style, type).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

if (require.main === module) {
  main();
}

module.exports = { searchHugeicons, generateReactNativeCode };

