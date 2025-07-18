import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadTemplate = (templateName, replacements) => {
    try {
        // Read the template file
        const templatePath = path.join(__dirname, `${templateName}.html`);
        let html = fs.readFileSync(templatePath, 'utf8');
        
        // Replace placeholders with actual values
        for (const [key, value] of Object.entries(replacements)) {
            html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        
        return html;
    } catch (err) {
        console.error('Error loading email template:', err);
        throw new Error('Could not load email template');
    }
};

export default loadTemplate;