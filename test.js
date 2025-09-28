import DocxToMdxConverter from './index.js';
import fs from 'fs/promises';
import path from 'path';

// Test function to demonstrate the converter
async function testConverter() {
  console.log('🧪 Testing DOCX to MDX Converter...\n');
  
  const converter = new DocxToMdxConverter();
  
  // Create test directory
  const testDir = './test-files';
  try {
    await fs.mkdir(testDir, { recursive: true });
    console.log('✅ Test directory created');
  } catch (error) {
    console.log('📁 Test directory already exists');
  }

  // Create a sample markdown content to simulate what would be extracted from DOCX
  const sampleMdxContent = `---
title: "Sample Document"
description: "A sample document converted from DOCX"
author: "DOCX to MDX Converter"
date: "${new Date().toISOString().split('T')[0]}"
---

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

# Sample Document

This is a **bold** text and *italic* text converted from DOCX format.

<Alert>
  This document was automatically converted from DOCX to MDX format.
</Alert>

## Features

Our converter supports:

- **Text formatting** (bold, italic, underline)
- Headers and subheaders
- Lists (ordered and unordered)
- Tables
- Images
- Links

### Interactive Components

You can now use React components in your converted documents:

<Button variant="primary" size="lg">
  Click me!
</Button>

## Code Examples

\`\`\`javascript
function convertDocxToMdx(input, output) {
  console.log('Converting...', input, '->', output);
  return 'Success!';
}
\`\`\`

> **Note**: This is a blockquote that was preserved during conversion.

## Links and References

- [MDX Documentation](https://mdxjs.com/)
- [React Components](https://reactjs.org/)

---

*Document converted on ${new Date().toLocaleDateString()}*`;

  // Write sample MDX file
  const sampleFile = path.join(testDir, 'sample-output.mdx');
  try {
    await fs.writeFile(sampleFile, sampleMdxContent);
    console.log('✅ Sample MDX file created:', sampleFile);
  } catch (error) {
    console.log('❌ Failed to create sample file:', error.message);
  }

  console.log('\n📋 To test the converter with real DOCX files:');
  console.log('1. Place a DOCX file in this directory');
  console.log('2. Run: npm run convert your-file.docx');
  console.log('3. Or use CLI: npx docx-to-mdx convert your-file.docx');
  console.log('4. Check the generated MDX file');
  
  console.log('\n🌐 To use the web interface:');
  console.log('1. Open web-interface.html in your browser');
  console.log('2. Upload a DOCX file');
  console.log('3. Download the converted MDX file');
  
  console.log('\n✨ Sample MDX content has been generated in:', sampleFile);
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testConverter();
}