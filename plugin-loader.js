const fs = require('fs');
const path = require('path');

function loadPlugins() {
    const commands = new Map();
    const pluginFolder = path.join(__dirname, 'plugins');
    const pluginFiles = fs.readdirSync(pluginFolder).filter(file => file.endsWith('.js'));

    for (const file of pluginFiles) {
        try {
            const pluginPath = path.join(pluginFolder, file);
            const plugin = require(pluginPath);
            if (plugin.command) {
                for (const cmd of plugin.command) {
                    commands.set(cmd, plugin);
                }
            }
        } catch (error) {
            console.error(`Error loading plugin ${file}:`, error);
        }
    }
    return commands;
}

module.exports = { loadPlugins };
