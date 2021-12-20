#!/usr/bin/env node
// lol unfinished

import fs from 'fs';
import chalk from 'chalk';
import { dirname } from 'esm-dirname';
import createPrompt from 'prompt-sync';
import { exec } from 'child_process';
import { parse } from 'path';

const __dirname = dirname(import.meta);
const prompt = createPrompt();

process.argv.shift();
process.argv.shift();
const args = process.argv;
console.log(chalk.blue('a-macos-project-manager'));

let command = process.argv.shift();

function fetchTemplate (template) {
    if (template == 'standard') {
        return "mkdir ~/Projects/${Project.name} && cd ~/Projects/${Project.name} && echo 'You can find your project at ~/Projects/${Project.name}'"
    } else {
        let path = '~/.ampm/' + template + '.template';
        try {
            return fs.readFileSync(path, 'utf8');
        } catch (err) {
            console.log('Unable to find template at path ', path);
            return "exit 1";
        }
    }
}

function parseTemplate (template, { name }) {
    return template
        .split('${Project.name}').join(name)
}

function runTemplate (template) {
    return new Promise((resolve, reject) => {
        let exit = false;
        if (template.includes('sudo')) exit = prompt(chalk.red('This template contains the word "sudo", which could run scripts as an administrator. Leave blank to continue.'));
        if (exit.length) return console.log(chalk.red('Exited'));
        exec(`# Template
cd ~
${template}
`, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            if (stderr) {
                return reject(stderr);
            }
            resolve(stdout);
        });
    });
}

(async () => {
    if (!command) return console.log(chalk.green('version 1.0.0'));
    if (command === 'create' || command === 'c') {
        const fromTemplate = args.includes('--template') || args.includes('--from-template') || args.includes('-t');
        const name = prompt(chalk.yellow('Project name > '));
        let template = 'standard';
        if (fromTemplate) template = prompt(chalk.yellow('Template > ')) || 'standard';
        console.log(name, template)
        let templateCode = fetchTemplate(template);
        let parsed = parseTemplate(templateCode, { name: name });
        runTemplate(templateCode).then(result => {
            console.log(result);
            console.log(chalk.green('Project created!'));
        })
    }
})();