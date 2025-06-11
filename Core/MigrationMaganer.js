import path from 'path';
import db from '../config/db.js';
import "../bootstrap/app.js";
import { readdir } from 'fs/promises';

export default async function createMigrationManager(dir) {

    const files = await (async () => {
        const files = await readdir(dir);
        const result = [];

        for (const file of files) {
            if (!file.endsWith('.js')) continue;
            const mod = await import(path.join(dir, file));
            const data = mod.default;
            result.push([file, data]);
        }

        result.sort((a, b) => a[0].localeCompare(b[0]));

        return Object.fromEntries(result);
    })();

    async function getLastStep() {
        const res = await db.query('SELECT MAX(step) AS max FROM migrations');
        const max = res.rows[0].max;
        return (max ?? 0);
    }

    const executedMigrations = await (async function () {
        const { rows } = await db.query('SELECT name, step FROM migrations ORDER BY id DESC');

        const result = [];

        for (const row of rows) {
            result.push([row.name, row.step]);
        }

        return Object.fromEntries(result);
    })();

    const lastStep = await getLastStep();

    const nextStep = lastStep + 1;

    const execute = async () => {

        let executedCount = 0;

        for (const file in files) {
            if (file in executedMigrations) {
                continue;
            }

            const fileContent = await import(path.join(dir, file));

            const migration = fileContent.default;

            console.log(`Running ${file}...`);
            await migration.up();
            await db.query('INSERT INTO migrations (name, step) VALUES ($1, $2)', [file, nextStep]);

            executedCount++;
        }

        (executedCount > 0) ? (console.log('Migrations complete.')) : (console.log('No migrations to run.'));

        await db.end();
    }

    const rollback = async () => {

        if (lastStep === 0) {
            console.log('No migrations to rollback.');
            await db.end();
            return;
        }

        for (const migration in executedMigrations) {
            const migrationStep = executedMigrations[migration];

            if (migrationStep !== lastStep) {
                continue;
            }

            console.log(`Rollback ${migration}...`);

            const fileContent = await import(path.join(dir, migration));

            const content = fileContent.default;
            await content.down();
            await db.query('DELETE FROM migrations WHERE NAME = $1', [migration]);
        }



        console.log(`Rollback step ${lastStep} complete.`);

        await db.end();
    };

    return {
        execute: execute,
        rollback: rollback
    };

}
