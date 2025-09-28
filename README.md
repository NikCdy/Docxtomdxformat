# 📄 DOCX to MDX Converter

A modern web application that converts Microsoft Word (.docx) files to MDX (Markdown with JSX) format. Features both a beautiful web interface and command-line interface.

## 🌟 Features

- **🖥️ Web Interface**: Beautiful, responsive web UI with drag & drop upload
- **⌨️ Command Line**: Powerful CLI for batch processing
- **⚡ Fast Conversion**: Efficient processing of DOCX files
- **🎨 Preserve Formatting**: Maintains headings, lists, bold, italic text
- **📝 MDX Output**: Perfect for React documentation and modern blogs
- **📤 File Upload**: Supports files up to 10MB
- **📊 Real-time Progress**: Visual feedback during conversion

## 🚀 Quick Start

### Web Interface

1. **Install dependencies:**
```bash
npm install
```

2. **Start the server:**
```bash
npm start
```

3. **Open your browser** and go to `http://localhost:3000`

4. **Upload your DOCX file** and download the converted MDX!

### Command Line Interface

**Convert a single file:**
```bash
node index.js convert document.docx
```

**Convert with custom output:**
```bash
node index.js convert document.docx -o output.mdx
```

**Convert a directory:**
```bash
node index.js convert ./docs -d -o ./output
```

## 🎯 Usage

### Web Interface Steps

1. **📁 Upload**: Drag and drop your DOCX file or click to browse
2. **🔄 Convert**: Click the "Convert to MDX" button  
3. **💾 Download**: Download the converted MDX file automatically

### Programmatic Usage

```javascript
const DocxToMdxConverter = require('./index');

const converter = new DocxToMdxConverter();
await converter.convertFile('input.docx', 'output.mdx');
```

## 🌐 Server API

- `GET /` - Web interface
- `POST /convert` - File conversion endpoint (multipart/form-data)
- `GET /health` - Health check endpoint

### Example API Usage

```bash
curl -X POST -F "docx=@document.docx" http://localhost:3000/convert -o output.mdx
```

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `mammoth` | Extract text and formatting from DOCX files |
| `turndown` | Convert HTML to Markdown |
| `express` | Web server framework |
| `multer` | File upload handling |
| `commander` | Command-line interface |
| `chalk` | Terminal styling |

## 🎨 Output Format

The converter generates clean MDX files with:

- ✅ Standard Markdown syntax
- ✅ JSX-compatible formatting
- ✅ Preserved headings, lists, and basic text formatting
- ✅ Properly escaped special characters
- ✅ Clean, readable structure

### Example Output

**Input DOCX:** A Word document with headings, lists, and formatted text

**Output MDX:**
```mdx
# Document Title

This is a paragraph with **bold text** and *italic text*.

## Section Heading

- List item 1
- List item 2
- List item 3

### Subsection

More content here with proper formatting preserved.
```

## 🔧 Development

**Start in development mode with auto-reload:**
```bash
npm run dev
```

**Run tests:**
```bash
npm test
```

**Convert files via CLI:**
```bash
npm run convert your-file.docx
```

## 🌐 Browser Support

The web interface works on all modern browsers:
- ✅ Chrome 60+
- ✅ Firefox 55+  
- ✅ Safari 12+
- ✅ Edge 79+

## 📁 Project Structure

```
docxtomd/
├── index.js           # Main converter class & CLI
├── server.js          # Express web server
├── public/
│   └── index.html     # Web interface
├── uploads/           # Temporary upload directory
├── package.json       # Dependencies and scripts
└── README.md         # This file
```

## 🔒 Security Features

- File type validation (DOCX only)
- File size limits (10MB max)
- Automatic cleanup of temporary files
- Safe file handling with proper error handling

## 🚀 Deployment

For production deployment:

1. **Set environment variables:**
```bash
export NODE_ENV=production
export PORT=3000
```

2. **Start the server:**
```bash
npm start
```

3. **Optional: Use PM2 for process management:**
```bash
npm install -g pm2
pm2 start server.js --name "docx-converter"
```

## 🐛 Troubleshooting

**Server won't start:**
- Check if port 3000 is available
- Ensure all dependencies are installed: `npm install`

**Conversion fails:**
- Verify the uploaded file is a valid DOCX
- Check file size (must be under 10MB)
- Ensure the DOCX file isn't password protected

**Web interface not loading:**
- Verify server is running: check console output
- Try accessing `http://localhost:3000/health`

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⭐ Support

If you find this project helpful, please give it a star on GitHub!