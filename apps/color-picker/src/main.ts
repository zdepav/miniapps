import MiniApp from "@common/MiniApp";
import ColorPicker from '@/ColorPicker';
import RGBModule from '@/modules/RGBModule';
import HSLModule from '@/modules/HSLModule';
import HSVModule from '@/modules/HSVModule';
import HSVWheelModule from '@/modules/HSVWheelModule';
import CMYKModule from '@/modules/CMYKModule';
import ConfigModule from '@/modules/ConfigModule';
import PaletteModule from '@/modules/PaletteModule';
import PreviewModule from '@/modules/PreviewModule';
import '@/style.sass';


const app: MiniApp = new MiniApp("color-picker", { themed: true, autoremove: true });
app.onData((key: string): void => {
    if (key === 'no-config') {
        app.container.classList.add('no-config');
    }
});
const picker: ColorPicker = new ColorPicker(app.insertIntoPage());
picker.addModule(PreviewModule);
const paletteModule: PaletteModule = picker.addModule(PaletteModule);
picker.addModule(HSVWheelModule);
picker.addModule(RGBModule);
picker.addModule(HSLModule);
picker.addModule(HSVModule);
picker.addModule(CMYKModule);
picker.addModule(ConfigModule);
paletteModule.setSlot(0);
