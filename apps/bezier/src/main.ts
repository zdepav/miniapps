import MiniApp from "@common/MiniApp";
import { initializeUI } from '@/bezier';
import '@/style.sass';

const container: HTMLElement = new MiniApp("bezier", {
    themed: true,
    autoremove: true
}).insertIntoPage(// language=html
`<canvas width="800" height="800" id="ma-bezier-canvas"></canvas>
<form>
  <table>
    <tr>
      <td><span class="option">1st (red) control point position</span></td>
      <td colspan="2">
        <label>X: <input type="number" id="ma-bezier-rx" min="0" max="100" value="1"/></label>
      </td>
      <td colspan="2">
        <label>Y: <input type="number" id="ma-bezier-ry" min="0" max="100" value="99"/></label>
      </td>
    </tr>
    <tr>
      <td><span class="option">2nd (green) control point position</span></td>
      <td colspan="2">
        <label>X: <input type="number" id="ma-bezier-gx" min="0" max="100" value="99"/></label>
      </td>
      <td colspan="2">
        <label>Y: <input type="number" id="ma-bezier-gy" min="0" max="100" value="1"/></label>
      </td>
    </tr>
    <tr>
      <td colspan="5"><i>Note: You can also use drag-and-drop to move control points</i></td>
    </tr>
    <tr style="height: 16px"></tr>
    <tr>
      <td><span class="option">Show 1st (red) quadratic bezier curve</span></td>
      <td colspan="4">
        <label class="checkbox-container">
          <input type="checkbox" id="ma-bezier-show-r" checked="checked"/>
          <span class="checkbox r"></span>
        </label>
      </td>
    </tr>
    <tr>
      <td><span class="option">Show 2nd (green) quadratic bezier curve</span></td>
      <td colspan="4">
        <label class="checkbox-container">
          <input type="checkbox" id="ma-bezier-show-g" checked="checked"/>
          <span class="checkbox g"></span>
        </label>
      </td>
    </tr>
    <tr>
      <td><span class="option">Show cubic bezier curve (yellow)</span></td>
      <td colspan="4">
        <label class="checkbox-container">
          <input type="checkbox" id="ma-bezier-show-y" checked="checked"/>
          <span class="checkbox y"></span>
        </label>
      </td>
    </tr>
    <tr>
      <td><span class="option">Draw guiding lines</span></td>
      <td>
        <label class="checkbox-container">
          <input type="checkbox" id="ma-bezier-show-net" checked="checked"/>
          <span class="checkbox b"></span>
        </label>
      </td>
      <td colspan="3">
        <div id="ma-bezier-net-density-box">
          <label for="ma-bezier-net-density" class="option">Density</label>
          <input type="number" id="ma-bezier-net-density" min="1" max="1000" value="50"/>
        </div>
      </td>
    </tr>
  </table>
</form>`
);
initializeUI(container);
