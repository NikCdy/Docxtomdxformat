const fs = require('fs').promises;
const path = require('path');
const mammoth = require('mammoth');
const TurndownService = require('turndown');
const { Command } = require('commander');
const chalk = require('chalk');

class DocxToMdxConverter {
  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      fence: '```'
    });
    
    // Configure turndown for better MDX compatibility
    this.configureTurndown();
  }

  configureTurndown() {
    // Custom rules for better MDX output
    this.turndownService.addRule('strikethrough', {
      filter: ['del', 's'],
      replacement: (content) => `~~${content}~~`
    });

    // Handle images with JSX-style imports
    this.turndownService.addRule('image', {
      filter: 'img',
      replacement: (content, node) => {
        const alt = node.getAttribute('alt') || '';
        const src = node.getAttribute('src') || '';
        const title = node.getAttribute('title') || '';
        
        if (src.startsWith('data:')) {
          // For embedded images, we'll need to extract them
          return `![${alt}](${src}${title ? ` "${title}"` : ''})`;
        }
        
        return `<img src="${src}" alt="${alt}"${title ? ` title="${title}"` : ''} />`;
      }
    });

    // Handle tables with JSX syntax
    this.turndownService.addRule('table', {
      filter: 'table',
      replacement: (content) => {
        return `\n\n<div className="table-container">\n\n${content}\n\n</div>\n\n`;
      }
    });
  }

  async convertDocxToMdx(inputPath, outputPath = null) {
    try {
      console.log(chalk.blue(`📖 Reading DOCX file: ${inputPath}`));
      
      // Check if input file exists
      await fs.access(inputPath);
      
      // Convert DOCX to HTML using mammoth
      const result = await mammoth.convertToHtml({ path: inputPath });
      const html = result.value;
      
      if (result.messages.length > 0) {
        console.log(chalk.yellow('⚠️  Conversion warnings:'));
        result.messages.forEach(message => {
          console.log(chalk.yellow(`   ${message.message}`));
        });
      }

      // Convert HTML to Markdown
      console.log(chalk.blue('🔄 Converting to Markdown...'));
      let markdown = this.turndownService.turndown(html);

      // Post-process for MDX
      markdown = this.postProcessForMdx(markdown);

      // Determine output path
      if (!outputPath) {
        const inputDir = path.dirname(inputPath);
        const inputName = path.basename(inputPath, path.extname(inputPath));
        outputPath = path.join(inputDir, `${inputName}.mdx`);
      }

      // Add MDX frontmatter
      const mdxContent = this.addMdxFrontmatter(markdown, inputPath);

      // Write MDX file
      await fs.writeFile(outputPath, mdxContent, 'utf8');
      
      console.log(chalk.green(`✅ Successfully converted to: ${outputPath}`));
      return outputPath;

    } catch (error) {
      console.error(chalk.red(`❌ Error converting file: ${error.message}`));
      throw error;
    }
  }

  postProcessForMdx(markdown) {
    // Clean up common conversion issues
    markdown = markdown
      // Fix multiple empty lines
      .replace(/\n{3,}/g, '\n\n')
      // Fix code blocks
      .replace(/```(\w+)?\n\n/g, '```$1\n')
      // Fix list formatting
      .replace(/^(\s*)-\s*\n/gm, '$1- ')
      // Fix headings with extra spaces
      .replace(/^(#{1,6})\s+(.+)$/gm, '$1 $2');

    return markdown.trim();
  }

  addMdxFrontmatter(content, originalPath) {
    const fileName = path.basename(originalPath, path.extname(originalPath));
    const frontmatter = `---
title: "${fileName}"
description: "Converted from DOCX file"
date: "${new Date().toISOString().split('T')[0]}"
---

`;

    return frontmatter + content;
  }

  async convertDirectory(inputDir, outputDir = null) {
    try {
      console.log(chalk.blue(`📁 Processing directory: ${inputDir}`));
      
      const files = await fs.readdir(inputDir);
      const docxFiles = files.filter(file => 
        path.extname(file).toLowerCase() === '.docx' && 
        !path.basename(file).startsWith('~') // Skip temp files
      );

      if (docxFiles.length === 0) {
        console.log(chalk.yellow('⚠️  No DOCX files found in directory'));
        return [];
      }

      const outputPaths = [];
      
      for (const file of docxFiles) {
        const inputPath = path.join(inputDir, file);
        let outputPath = null;
        
        if (outputDir) {
          await fs.mkdir(outputDir, { recursive: true });
          const fileName = path.basename(file, path.extname(file));
          outputPath = path.join(outputDir, `${fileName}.mdx`);
        }
        
        try {
          const convertedPath = await this.convertDocxToMdx(inputPath, outputPath);
          outputPaths.push(convertedPath);
        } catch (error) {
          console.error(chalk.red(`❌ Failed to convert ${file}: ${error.message}`));
        }
      }

      console.log(chalk.green(`✅ Converted ${outputPaths.length} files successfully`));
      return outputPaths;

    } catch (error) {
      console.error(chalk.red(`❌ Error processing directory: ${error.message}`));
      throw error;
    }
  }
}

// Only run CLI when file is executed directly (not required as module)
if (require.main === module) {
  // CLI Setup
  const program = new Command();

  program
    .name('docx-to-mdx')
    .description('Convert DOCX files to MDX format')
    .version('1.0.0');

  program
    .command('convert')
    .description('Convert a DOCX file or directory to MDX')
    .argument('<input>', 'Input DOCX file or directory path')
    .option('-o, --output <path>', 'Output file or directory path')
    .option('-d, --directory', 'Process entire directory')
    .action(async (input, options) => {
      const converter = new DocxToMdxConverter();
      
      try {
        const stats = await fs.stat(input);
        
        if (stats.isDirectory() || options.directory) {
          await converter.convertDirectory(input, options.output);
        } else {
          await converter.convertDocxToMdx(input, options.output);
        }
      } catch (error) {
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });

  // Default action - interactive mode
  if (process.argv.length === 2) {
    console.log(chalk.cyan('📄 DOCX to MDX Converter'));
    console.log(chalk.gray('Usage examples:'));
    console.log(chalk.white('  node index.js convert document.docx'));
    console.log(chalk.white('  node index.js convert document.docx -o output.mdx'));
    console.log(chalk.white('  node index.js convert ./docs -d -o ./output'));
    console.log('');
    program.help();
  }

  program.parse();
}

module.exports = DocxToMdxConverter;