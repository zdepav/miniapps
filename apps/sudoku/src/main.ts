import MiniApp from "@common/MiniApp";
import KillerSudoku from '@/KillerSudoku';
import SandwichSudoku from '@/SandwichSudoku';
import { $div } from '@/common';
import XSumsSudoku from '@/XSumsSudoku';
import '@/main.sass';


const container: HTMLElement = new MiniApp("sudoku", {
    themed: true,
    autoremove: true
}).insertIntoPage();
new KillerSudoku(container);
$div(container, 'hsep');
new SandwichSudoku(container);
$div(container, 'hsep');
new XSumsSudoku(container);
