import path from 'path';
import "./bootstrap/app.js";
import createCommandManager from './Core/CommandManager.js';

import initRelations from "./config/sequelize_relations.js";

(async function () {

    initRelations();

    const commandsDir = path.join(CONSTANTS.DIR, 'app', 'Commands');

    const commander = await createCommandManager(commandsDir);

    commander.execute();

})();
