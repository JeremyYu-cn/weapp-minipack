import Entry from './index';
import commander from 'commander';

const program = new commander.Command()
.version('0.0.1')
.option('-c, --config <type>', 'config file path',) // set config file path
.parse(process.argv);

program.parse();

const options = program.opts();

console.log(options);

new Entry({ command: program }).init().start();
