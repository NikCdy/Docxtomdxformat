const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const DocxToMdxConverter = require('./index');

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Only DOCX files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Create uploads directory if it doesn't exist
async function createUploadsDir() {
    try {
        await fs.access('uploads');
    } catch {
        await fs.mkdir('uploads');
    }
}

// Serve static files from public directory
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'DOCX to MDX Converter is running!' });
});

// File conversion endpoint
app.post('/convert', upload.single('docx'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        console.log(`Converting file: ${req.file.originalname}`);
        
        const converter = new DocxToMdxConverter();
        const inputPath = req.file.path;
        const outputFileName = req.file.originalname.replace(/\.docx$/i, '.mdx');
        const outputPath = path.join('uploads', `converted-${Date.now()}-${outputFileName}`);
        
        // Convert the file
        await converter.convertDocxToMdx(inputPath, outputPath);
        
        // Read the converted file
        const mdxContent = await fs.readFile(outputPath, 'utf-8');
        
        // Clean up temporary files
        await fs.unlink(inputPath);
        await fs.unlink(outputPath);
        
        // Send the converted content as download
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`);
        res.send(mdxContent);
        
        console.log(`Successfully converted: ${req.file.originalname} -> ${outputFileName}`);
        
    } catch (error) {
        console.error('Conversion error:', error);
        
        // Clean up uploaded file if it exists
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (cleanupError) {
                console.error('Error cleaning up uploaded file:', cleanupError);
            }
        }
        
        res.status(500).send(`Conversion failed: ${error.message}`);
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send('File too large. Maximum size is 10MB.');
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).send('Too many files uploaded.');
        }
    }
    
    if (error.message === 'Only DOCX files are allowed!') {
        return res.status(400).send('Only DOCX files are allowed!');
    }
    
    console.error('Unexpected error:', error);
    res.status(500).send('Internal server error');
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start server
async function startServer() {
    try {
        await createUploadsDir();
        
        app.listen(port, () => {
            console.log(`🚀 DOCX to MDX Converter Server running on http://localhost:${port}`);
            console.log(`📁 Upload directory: ${path.resolve('uploads')}`);
            console.log(`🌐 Open http://localhost:${port} in your browser`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    
    // Clean up uploads directory
    try {
        const files = await fs.readdir('uploads');
        for (const file of files) {
            await fs.unlink(path.join('uploads', file));
        }
        console.log('✅ Cleaned up temporary files');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
    
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;