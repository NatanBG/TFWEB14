import path from 'path';
import db from '../config/db.js';
import "../bootstrap/app.js";
import { readdir } from 'fs/promises';
import { Sequelize } from 'sequelize';

export default async function createSeedManager(dir) {

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
        const res = await db.query('SELECT MAX(step) AS max FROM seeds');
        const max = res.rows[0].max;
        return (max ?? 0);
    }

    const executedSeeds = await (async function () {
        const { rows } = await db.query('SELECT name, step FROM seeds ORDER BY id ASC');

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
            if (file in executedSeeds) {
                continue;
            }

            const fileContent = await import(path.join(dir, file));

            const seed = fileContent.default;

            console.log(`Running ${file}...`);

            try {
                await seed.up();
            } catch (error) {
                if (error instanceof Sequelize.DatabaseError) {
                    console.error(`\n❌ Erro ao executar seed ${file}`);
                    console.error('💡 As tabelas ou os campos da seed não foram criadas.');
                    console.error('➡ Execute as migrations antes de rodar os seeds.');
                    console.error(`Detalhes técnicos: ${error.message}`);
                    process.exit(1);
                } else {
                    throw error;
                }
            }
            await db.query('INSERT INTO seeds (name, step) VALUES ($1, $2)', [file, nextStep]);

            executedCount++;
        }

        (executedCount > 0) ? (console.log('Seeds complete.')) : (console.log('No Seeds to run.'));

        await db.end();
    }

    const rollback = async () => {

        if (lastStep === 0) {
            console.log('No seeds to rollback.');
            await db.end();
            return;
        }

        for (const seed in executedSeeds) {
            const seedStep = executedSeeds[seed];

            if (seedStep !== lastStep) {
                continue;
            }

            console.log(`Rollback ${seed}...`);

            const fileContent = await import(path.join(dir, seed));

            const content = fileContent.default;
            await content.down();
            await db.query('DELETE FROM seeds WHERE NAME = $1', [seed]);
        }



        console.log(`Rollback step ${lastStep} complete.`);
        await db.end();

    };

    return {
        execute: execute,
        rollback: rollback
    };

}
