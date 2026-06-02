import MiniApp from "@common/MiniApp";
import { UI } from '@/UI';
import '@/style.sass';

new UI(new MiniApp("chart-plot", { themed: true, autoremove: true }).insertIntoPage());
