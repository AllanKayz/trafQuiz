const fs = require('fs');
const path = require('path');
const { app } = require('electron');

function getUploadDir() {
    const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
    let baseDir;
    if (isDev) {
        baseDir = path.join(__dirname, '../../public');
    } else {
        baseDir = app.getPath('userData');
    }
    const uploadDir = path.join(baseDir, 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
}

async function saveFile(name, type, buffer) {
    const uploadDir = getUploadDir();
    // Sanitize filename to prevent path traversal
    const sanitizedName = path.basename(name);
    const fileName = `${Date.now()}-${sanitizedName}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, Buffer.from(buffer));

    return {
        url: `uploads/${fileName}`,
        name: sanitizedName,
        type: type
    };
}

module.exports = { saveFile, getUploadDir };
