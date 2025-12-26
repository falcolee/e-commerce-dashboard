#!/usr/bin/env node

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { ScanCommand } from './commands/ScanCommand';
import { ExtractCommand } from './commands/ExtractCommand';
import { TransformCommand } from './commands/TransformCommand';
import { FullCommand } from './commands/FullCommand';
import chalk from 'chalk';
import * as fs from 'fs';

type KeyFormatOption = 'camelCase' | 'snake_case' | 'kebab-case';

const argv = yargs(hideBin(process.argv))
  .command(
    'scan',
    'Scan for target React/TypeScript files',
    (yargs) => {
      return yargs
        .option('target', {
          alias: 't',
          describe: 'Target file or directory path',
          type: 'array',
          default: []
        })
        .option('output', {
          alias: 'o',
          describe: 'Output file for scan results',
          type: 'string',
          default: 'scan-results.json'
        });
    },
    async (argv) => {
      try {
        const scanCommand = new ScanCommand();
        const scanResult = await scanCommand.execute(argv.target as string[]);
        await scanCommand.saveScanResults(scanResult, argv.output as string);
      } catch (error) {
        console.error(chalk.red('Scan failed:'), error);
        process.exit(1);
      }
    }
  )
  .command(
    'extract',
    'Extract static text from files and generate translation map',
    (yargs) => {
      return yargs
        .option('files', {
          alias: 'f',
          describe: 'Files to process (comma-separated) or scan results file',
          type: 'string',
          required: true
        })
        .option('output', {
          alias: 'o',
          describe: 'Output translation file path',
          type: 'string',
          default: 'src/locales/en/common.json'
        })
        .option('key-format', {
          alias: 'k',
          describe: 'Translation key format',
          choices: ['camelCase', 'snake_case', 'kebab-case'],
          default: 'camelCase'
        });
    },
    async (argv) => {
      try {
        const extractCommand = new ExtractCommand(argv.keyFormat as KeyFormatOption);

        // Check if files argument is a path to a scan results file
        if (argv.files && (argv.files as string).endsWith('.json')) {
          const result = await extractCommand.executeFromScanResults(
            argv.files as string,
            argv.output as string
          );
          extractCommand.generateExtractionReport(result);
        } else {
          // Treat as comma-separated file list
          const files = (argv.files as string).split(',').map(f => f.trim());
          const result = await extractCommand.execute(files, argv.output as string);
          extractCommand.generateExtractionReport(result);
        }
      } catch (error) {
        console.error(chalk.red('Extract failed:'), error);
        process.exit(1);
      }
    }
  )
  .command(
    'transform',
    'Transform source files to use i18n hooks',
    (yargs) => {
      return yargs
        .option('files', {
          alias: 'f',
          describe: 'Files to transform (comma-separated) or scan results file',
          type: 'string',
          required: true
        })
        .option('translation', {
          alias: 't',
          describe: 'Translation file path',
          type: 'string',
          default: 'src/locales/en/common.json'
        })
        .option('dry-run', {
          alias: 'd',
          describe: 'Analyze transformations without modifying files',
          type: 'boolean',
          default: false
        });
    },
    async (argv) => {
      try {
        const transformCommand = new TransformCommand();

        if (argv.dryRun) {
          if ((argv.files as string).endsWith('.json')) {
            const filesList = JSON.parse(fs.readFileSync(argv.files as string, 'utf8'));
            const files = filesList.files || filesList;
            await transformCommand.dryRun(files, argv.translation as string);
          } else {
            const files = (argv.files as string).split(',').map(f => f.trim());
            await transformCommand.dryRun(files, argv.translation as string);
          }
        } else {
          let result;
          if ((argv.files as string).endsWith('.json')) {
            result = await transformCommand.executeFromFilesList(
              argv.files as string,
              argv.translation as string
            );
          } else {
            const files = (argv.files as string).split(',').map(f => f.trim());
            result = await transformCommand.execute(files, argv.translation as string);
          }
          transformCommand.generateTransformReport(result);
        }
      } catch (error) {
        console.error(chalk.red('Transform failed:'), error);
        process.exit(1);
      }
    }
  )
  .command(
    'full',
    'Run complete i18n automation workflow',
    (yargs) => {
      return yargs
        .option('target', {
          alias: 't',
          describe: 'Target file or directory path',
          type: 'array',
          default: []
        })
        .option('key-format', {
          alias: 'k',
          describe: 'Translation key format',
          choices: ['camelCase', 'snake_case', 'kebab-case'],
          default: 'camelCase'
        })
        .option('dry-run', {
          alias: 'd',
          describe: 'Run analysis without applying transformations',
          type: 'boolean',
          default: false
        })
        .option('report', {
          alias: 'r',
          describe: 'Generate analysis report only',
          type: 'boolean',
          default: false
        });
    },
    async (argv) => {
      try {
        const fullCommand = new FullCommand(argv.keyFormat as KeyFormatOption);

        if (argv.report) {
          await fullCommand.generateReport(argv.target as string[]);
        } else if (argv.dryRun) {
          await fullCommand.dryRun(argv.target as string[]);
        } else {
          await fullCommand.execute(argv.target as string[]);
        }
      } catch (error) {
        console.error(chalk.red('Full workflow failed:'), error);
        process.exit(1);
      }
    }
  )
  .demandCommand(1, 'You need to specify a command')
  .help()
  .alias('help', 'h')
  .version('1.0.0')
  .alias('version', 'v')
  .epilogue(`
Examples:
  # Scan for files
  $ npx ts-node src/i18n/cli/index.ts scan --target "src/pages/admin/Products.tsx"

  # Extract text
  $ npx ts-node src/i18n/cli/index.ts extract --files "src/pages/admin/Products.tsx,src/pages/Login.tsx"

  # Transform code
  $ npx ts-node src/i18n/cli/index.ts transform --files "src/pages/admin/Products.tsx"

  # Run full workflow
  $ npx ts-node src/i18n/cli/index.ts full --target "src/pages/admin/Products.tsx" --target "src/pages/Login.tsx"

  # Dry run analysis
  $ npx ts-node src/i18n/cli/index.ts full --target "src/pages/admin" --dry-run

  # Generate analysis report
  $ npx ts-node src/i18n/cli/index.ts full --target "src/pages/admin" --report
  `)
  .strict()
  .parse();
