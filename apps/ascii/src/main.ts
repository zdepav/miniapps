import MiniApp from "@common/MiniApp";
import "@/style.sass"


new MiniApp("ascii-table", { themed: true, autoremove: true }).insertIntoPage(// language=html
`<table>
  <thead>
    <tr><th>Dec</th><th>Hx</th><th>Oct</th><th>Chr</th><th class="left">Esc</th><th class="desc">Description</th></tr>
  </thead>
  <tbody>
    <tr><td class="i">0</td><td class="i">00</td><td class="i">000</td><td class="char soft">NUL</td><td class="esc">\\0</td><td class="desc">Null</td></tr>
    <tr><td class="i">1</td><td class="i">01</td><td class="i">001</td><td class="char soft">SOH</td><td class="esc soft">\\x01</td><td class="desc">Start of Heading</td></tr>
    <tr><td class="i">2</td><td class="i">02</td><td class="i">002</td><td class="char soft">STX</td><td class="esc soft">\\x02</td><td class="desc">Start of Text</td></tr>
    <tr><td class="i">3</td><td class="i">03</td><td class="i">003</td><td class="char soft">ETX</td><td class="esc soft">\\x03</td><td class="desc">End of Text</td></tr>
    <tr><td class="i">4</td><td class="i">04</td><td class="i">004</td><td class="char soft">EOT</td><td class="esc soft">\\x04</td><td class="desc">End of Transmission</td></tr>
    <tr><td class="i">5</td><td class="i">05</td><td class="i">005</td><td class="char soft">ENQ</td><td class="esc soft">\\x05</td><td class="desc">Enquiry</td></tr>
    <tr><td class="i">6</td><td class="i">06</td><td class="i">006</td><td class="char soft">ACK</td><td class="esc soft">\\x06</td><td class="desc">Acknowledgement</td></tr>
    <tr><td class="i">7</td><td class="i">07</td><td class="i">007</td><td class="char soft">BEL</td><td class="esc">\\a</td><td class="desc">Bell</td></tr>
    <tr><td class="i">8</td><td class="i">08</td><td class="i">010</td><td class="char soft">BS</td><td class="esc">\\b</td><td class="desc">Backspace</td></tr>
    <tr><td class="i">9</td><td class="i">09</td><td class="i">011</td><td class="char soft">TAB</td><td class="esc">\\t</td><td class="desc">Horizontal Tab</td></tr>
    <tr><td class="i">10</td><td class="i">0A</td><td class="i">012</td><td class="char soft">LF</td><td class="esc">\\n</td><td class="desc">Line Feed</td></tr>
    <tr><td class="i">11</td><td class="i">0B</td><td class="i">013</td><td class="char soft">VT</td><td class="esc">\\v</td><td class="desc">Vertical Tab</td></tr>
    <tr><td class="i">12</td><td class="i">0C</td><td class="i">014</td><td class="char soft">FF</td><td class="esc">\\f</td><td class="desc">Form Feed</td></tr>
    <tr><td class="i">13</td><td class="i">0D</td><td class="i">015</td><td class="char soft">CR</td><td class="esc">\\r</td><td class="desc">Carriage Return</td></tr>
    <tr><td class="i">14</td><td class="i">0E</td><td class="i">016</td><td class="char soft">SO</td><td class="esc soft">\\x0E</td><td class="desc">Shift Out</td></tr>
    <tr><td class="i">15</td><td class="i">0F</td><td class="i">017</td><td class="char soft">SI</td><td class="esc soft">\\x0F</td><td class="desc">Shift In</td></tr>
    <tr><td class="i">16</td><td class="i">10</td><td class="i">020</td><td class="char soft">DLE</td><td class="esc soft">\\x10</td><td class="desc">Data Link Escape</td></tr>
    <tr><td class="i">17</td><td class="i">11</td><td class="i">021</td><td class="char soft">DC1</td><td class="esc soft">\\x11</td><td class="desc">Device Control 1</td></tr>
    <tr><td class="i">18</td><td class="i">12</td><td class="i">022</td><td class="char soft">DC2</td><td class="esc soft">\\x12</td><td class="desc">Device Control 2</td></tr>
    <tr><td class="i">19</td><td class="i">13</td><td class="i">023</td><td class="char soft">DC3</td><td class="esc soft">\\x13</td><td class="desc">Device Control 3</td></tr>
    <tr><td class="i">20</td><td class="i">14</td><td class="i">024</td><td class="char soft">DC4</td><td class="esc soft">\\x14</td><td class="desc">Device Control 4</td></tr>
    <tr><td class="i">21</td><td class="i">15</td><td class="i">025</td><td class="char soft">NAK</td><td class="esc soft">\\x15</td><td class="desc">Negative Acknowledgement</td></tr>
    <tr><td class="i">22</td><td class="i">16</td><td class="i">026</td><td class="char soft">SYN</td><td class="esc soft">\\x16</td><td class="desc">Synchronous Idle</td></tr>
    <tr><td class="i">23</td><td class="i">17</td><td class="i">027</td><td class="char soft">ETB</td><td class="esc soft">\\x17</td><td class="desc">End of Transmission Block</td></tr>
    <tr><td class="i">24</td><td class="i">18</td><td class="i">030</td><td class="char soft">CAN</td><td class="esc soft">\\x18</td><td class="desc">Cancel</td></tr>
    <tr><td class="i">25</td><td class="i">19</td><td class="i">031</td><td class="char soft">EM</td><td class="esc soft">\\x19</td><td class="desc">End of Medium</td></tr>
    <tr><td class="i">26</td><td class="i">1A</td><td class="i">032</td><td class="char soft">SUB</td><td class="esc soft">\\x1A</td><td class="desc">Substitute</td></tr>
    <tr><td class="i">27</td><td class="i">1B</td><td class="i">033</td><td class="char soft">ESC</td><td class="esc">\\e</td><td class="desc">Escape</td></tr>
    <tr><td class="i">28</td><td class="i">1C</td><td class="i">034</td><td class="char soft">FS</td><td class="esc soft">\\x1C</td><td class="desc">File Separator</td></tr>
    <tr><td class="i">29</td><td class="i">1D</td><td class="i">035</td><td class="char soft">GS</td><td class="esc soft">\\x1D</td><td class="desc">Group Separator</td></tr>
    <tr><td class="i">30</td><td class="i">1E</td><td class="i">036</td><td class="char soft">RS</td><td class="esc soft">\\x1E</td><td class="desc">Record Separator</td></tr>
    <tr><td class="i">31</td><td class="i">1F</td><td class="i">037</td><td class="char soft">US</td><td class="esc soft">\\x1F</td><td class="desc">Unit Separator</td></tr>
  </tbody>
</table>
<table>
  <thead>
    <tr><th>Dec</th><th>Hx</th><th>Oct</th><th>Chr</th><th class="left">HTML</th><th class="desc">Description</th></tr>
  </thead>
  <tbody>
    <tr><td class="i">32</td><td class="i">20</td><td class="i">040</td><td class="char soft">SPC</td><td class="esc soft">&amp;#32;</td><td class="desc">Space</td></tr>
    <tr><td class="i">33</td><td class="i">21</td><td class="i">041</td><td class="char">!</td><td class="esc soft">&amp;#33;</td><td class="desc">Exclamation mark</td></tr>
    <tr><td class="i">34</td><td class="i">22</td><td class="i">042</td><td class="char">&quot;</td><td class="esc">&amp;quot;</td><td class="desc">Quotation mark</td></tr>
    <tr><td class="i">35</td><td class="i">23</td><td class="i">043</td><td class="char">#</td><td class="esc soft">&amp;#35;</td><td class="desc">Number sign</td></tr>
    <tr><td class="i">36</td><td class="i">24</td><td class="i">044</td><td class="char">$</td><td class="esc soft">&amp;#36;</td><td class="desc">Dollar sign</td></tr>
    <tr><td class="i">37</td><td class="i">25</td><td class="i">045</td><td class="char">%</td><td class="esc soft">&amp;#37;</td><td class="desc">Percent sign</td></tr>
    <tr><td class="i">38</td><td class="i">26</td><td class="i">046</td><td class="char">&amp;</td><td class="esc">&amp;amp;</td><td class="desc">Ampersand</td></tr>
    <tr><td class="i">39</td><td class="i">27</td><td class="i">047</td><td class="char">'</td><td class="esc">&amp;apos;</td><td class="desc">Apostrophe</td></tr>
    <tr><td class="i">40</td><td class="i">28</td><td class="i">050</td><td class="char">(</td><td class="esc soft">&amp;#40;</td><td class="desc">Left parenthesis</td></tr>
    <tr><td class="i">41</td><td class="i">29</td><td class="i">051</td><td class="char">)</td><td class="esc soft">&amp;#41;</td><td class="desc">Right parenthesis</td></tr>
    <tr><td class="i">42</td><td class="i">2A</td><td class="i">052</td><td class="char">*</td><td class="esc soft">&amp;#42;</td><td class="desc">Asterisk</td></tr>
    <tr><td class="i">43</td><td class="i">2B</td><td class="i">053</td><td class="char">+</td><td class="esc soft">&amp;#43;</td><td class="desc">Plus sign</td></tr>
    <tr><td class="i">44</td><td class="i">2C</td><td class="i">054</td><td class="char">,</td><td class="esc soft">&amp;#44;</td><td class="desc">Comma</td></tr>
    <tr><td class="i">45</td><td class="i">2D</td><td class="i">055</td><td class="char">-</td><td class="esc soft">&amp;#45;</td><td class="desc">Hyphen-minus</td></tr>
    <tr><td class="i">46</td><td class="i">2E</td><td class="i">056</td><td class="char">.</td><td class="esc soft">&amp;#46;</td><td class="desc">Full stop</td></tr>
    <tr><td class="i">47</td><td class="i">2F</td><td class="i">057</td><td class="char">/</td><td class="esc soft">&amp;#47;</td><td class="desc">Slash</td></tr>
    <tr><td class="i">48</td><td class="i">30</td><td class="i">060</td><td class="char">0</td><td class="esc soft">&amp;#48;</td><td class="desc">Digit zero</td></tr>
    <tr><td class="i">49</td><td class="i">31</td><td class="i">061</td><td class="char">1</td><td class="esc soft">&amp;#49;</td><td class="desc">Digit one</td></tr>
    <tr><td class="i">50</td><td class="i">32</td><td class="i">062</td><td class="char">2</td><td class="esc soft">&amp;#50;</td><td class="desc">Digit two</td></tr>
    <tr><td class="i">51</td><td class="i">33</td><td class="i">063</td><td class="char">3</td><td class="esc soft">&amp;#51;</td><td class="desc">Digit three</td></tr>
    <tr><td class="i">52</td><td class="i">34</td><td class="i">064</td><td class="char">4</td><td class="esc soft">&amp;#52;</td><td class="desc">Digit four</td></tr>
    <tr><td class="i">53</td><td class="i">35</td><td class="i">065</td><td class="char">5</td><td class="esc soft">&amp;#53;</td><td class="desc">Digit five</td></tr>
    <tr><td class="i">54</td><td class="i">36</td><td class="i">066</td><td class="char">6</td><td class="esc soft">&amp;#54;</td><td class="desc">Digit six</td></tr>
    <tr><td class="i">55</td><td class="i">37</td><td class="i">067</td><td class="char">7</td><td class="esc soft">&amp;#55;</td><td class="desc">Digit seven</td></tr>
    <tr><td class="i">56</td><td class="i">38</td><td class="i">070</td><td class="char">8</td><td class="esc soft">&amp;#56;</td><td class="desc">Digit eight</td></tr>
    <tr><td class="i">57</td><td class="i">39</td><td class="i">071</td><td class="char">9</td><td class="esc soft">&amp;#57;</td><td class="desc">Digit nine</td></tr>
    <tr><td class="i">58</td><td class="i">3A</td><td class="i">072</td><td class="char">:</td><td class="esc soft">&amp;#58;</td><td class="desc">Colon</td></tr>
    <tr><td class="i">59</td><td class="i">3B</td><td class="i">073</td><td class="char">;</td><td class="esc soft">&amp;#59;</td><td class="desc">Semicolon</td></tr>
    <tr><td class="i">60</td><td class="i">3C</td><td class="i">074</td><td class="char">&lt;</td><td class="esc">&amp;lt;</td><td class="desc">Less-than sign</td></tr>
    <tr><td class="i">61</td><td class="i">3D</td><td class="i">075</td><td class="char">=</td><td class="esc soft">&amp;#61;</td><td class="desc">Equals sign</td></tr>
    <tr><td class="i">62</td><td class="i">3E</td><td class="i">076</td><td class="char">&gt;</td><td class="esc">&amp;gt;</td><td class="desc">Greater-than sign</td></tr>
    <tr><td class="i">63</td><td class="i">3F</td><td class="i">077</td><td class="char">?</td><td class="esc soft">&amp;#63;</td><td class="desc">Question mark</td></tr>
  </tbody>
</table>
<table>
  <thead>
    <tr><th>Dec</th><th>Hx</th><th>Oct</th><th>Chr</th><th class="left">HTML</th><th class="desc">Description</th></tr>
  </thead>
  <tbody>
    <tr><td class="i">64</td><td class="i">40</td><td class="i">100</td><td class="char">@</td><td class="esc soft">&amp;#64;</td><td class="desc">At sign</td></tr>
    <tr><td class="i">65</td><td class="i">41</td><td class="i">101</td><td class="char">A</td><td class="esc soft">&amp;#65;</td><td class="desc">Lowercase A</td></tr>
    <tr><td class="i">66</td><td class="i">42</td><td class="i">102</td><td class="char">B</td><td class="esc soft">&amp;#66;</td><td class="desc">Lowercase B</td></tr>
    <tr><td class="i">67</td><td class="i">43</td><td class="i">103</td><td class="char">C</td><td class="esc soft">&amp;#67;</td><td class="desc">Lowercase C</td></tr>
    <tr><td class="i">68</td><td class="i">44</td><td class="i">104</td><td class="char">D</td><td class="esc soft">&amp;#68;</td><td class="desc">Lowercase D</td></tr>
    <tr><td class="i">69</td><td class="i">45</td><td class="i">105</td><td class="char">E</td><td class="esc soft">&amp;#69;</td><td class="desc">Lowercase E</td></tr>
    <tr><td class="i">70</td><td class="i">46</td><td class="i">106</td><td class="char">F</td><td class="esc soft">&amp;#70;</td><td class="desc">Lowercase F</td></tr>
    <tr><td class="i">71</td><td class="i">47</td><td class="i">107</td><td class="char">G</td><td class="esc soft">&amp;#71;</td><td class="desc">Lowercase G</td></tr>
    <tr><td class="i">72</td><td class="i">48</td><td class="i">110</td><td class="char">H</td><td class="esc soft">&amp;#72;</td><td class="desc">Lowercase H</td></tr>
    <tr><td class="i">73</td><td class="i">49</td><td class="i">111</td><td class="char">I</td><td class="esc soft">&amp;#73;</td><td class="desc">Lowercase I</td></tr>
    <tr><td class="i">74</td><td class="i">4A</td><td class="i">112</td><td class="char">J</td><td class="esc soft">&amp;#74;</td><td class="desc">Lowercase J</td></tr>
    <tr><td class="i">75</td><td class="i">4B</td><td class="i">113</td><td class="char">K</td><td class="esc soft">&amp;#75;</td><td class="desc">Lowercase K</td></tr>
    <tr><td class="i">76</td><td class="i">4C</td><td class="i">114</td><td class="char">L</td><td class="esc soft">&amp;#76;</td><td class="desc">Lowercase L</td></tr>
    <tr><td class="i">77</td><td class="i">4D</td><td class="i">115</td><td class="char">M</td><td class="esc soft">&amp;#77;</td><td class="desc">Lowercase M</td></tr>
    <tr><td class="i">78</td><td class="i">4E</td><td class="i">116</td><td class="char">N</td><td class="esc soft">&amp;#78;</td><td class="desc">Lowercase N</td></tr>
    <tr><td class="i">79</td><td class="i">4F</td><td class="i">117</td><td class="char">O</td><td class="esc soft">&amp;#79;</td><td class="desc">Lowercase O</td></tr>
    <tr><td class="i">80</td><td class="i">50</td><td class="i">120</td><td class="char">P</td><td class="esc soft">&amp;#80;</td><td class="desc">Lowercase P</td></tr>
    <tr><td class="i">81</td><td class="i">51</td><td class="i">121</td><td class="char">Q</td><td class="esc soft">&amp;#81;</td><td class="desc">Lowercase Q</td></tr>
    <tr><td class="i">82</td><td class="i">52</td><td class="i">122</td><td class="char">R</td><td class="esc soft">&amp;#82;</td><td class="desc">Lowercase R</td></tr>
    <tr><td class="i">83</td><td class="i">53</td><td class="i">123</td><td class="char">S</td><td class="esc soft">&amp;#83;</td><td class="desc">Lowercase S</td></tr>
    <tr><td class="i">84</td><td class="i">54</td><td class="i">124</td><td class="char">T</td><td class="esc soft">&amp;#84;</td><td class="desc">Lowercase T</td></tr>
    <tr><td class="i">85</td><td class="i">55</td><td class="i">125</td><td class="char">U</td><td class="esc soft">&amp;#85;</td><td class="desc">Lowercase U</td></tr>
    <tr><td class="i">86</td><td class="i">56</td><td class="i">126</td><td class="char">V</td><td class="esc soft">&amp;#86;</td><td class="desc">Lowercase V</td></tr>
    <tr><td class="i">87</td><td class="i">57</td><td class="i">127</td><td class="char">W</td><td class="esc soft">&amp;#87;</td><td class="desc">Lowercase W</td></tr>
    <tr><td class="i">88</td><td class="i">58</td><td class="i">130</td><td class="char">X</td><td class="esc soft">&amp;#88;</td><td class="desc">Lowercase X</td></tr>
    <tr><td class="i">89</td><td class="i">59</td><td class="i">131</td><td class="char">Y</td><td class="esc soft">&amp;#89;</td><td class="desc">Lowercase Y</td></tr>
    <tr><td class="i">90</td><td class="i">5A</td><td class="i">132</td><td class="char">Z</td><td class="esc soft">&amp;#90;</td><td class="desc">Lowercase Z</td></tr>
    <tr><td class="i">91</td><td class="i">5B</td><td class="i">133</td><td class="char">[</td><td class="esc soft">&amp;#91;</td><td class="desc">Left bracket</td></tr>
    <tr><td class="i">92</td><td class="i">5C</td><td class="i">134</td><td class="char">\\</td><td class="esc soft">&amp;#92;</td><td class="desc">Backslash</td></tr>
    <tr><td class="i">93</td><td class="i">5D</td><td class="i">135</td><td class="char">]</td><td class="esc soft">&amp;#93;</td><td class="desc">Right bracket</td></tr>
    <tr><td class="i">94</td><td class="i">5E</td><td class="i">136</td><td class="char">^</td><td class="esc soft">&amp;#94;</td><td class="desc">Caret</td></tr>
    <tr><td class="i">95</td><td class="i">5F</td><td class="i">137</td><td class="char">_</td><td class="esc soft">&amp;#95;</td><td class="desc">Underscore</td></tr>
  </tbody>
</table>
<table>
  <thead>
    <tr><th>Dec</th><th>Hx</th><th>Oct</th><th>Chr</th><th class="left">HTML</th><th class="desc">Description</th></tr>
  </thead>
  <tbody>
    <tr><td class="i">96</td><td class="i">60</td><td class="i">140</td><td class="char">\`</td><td class="esc soft">&amp;#96;</td><td class="desc">Backtick</td></tr>
    <tr><td class="i">97</td><td class="i">61</td><td class="i">141</td><td class="char">a</td><td class="esc soft">&amp;#97;</td><td class="desc">Lowercase A</td></tr>
    <tr><td class="i">98</td><td class="i">62</td><td class="i">142</td><td class="char">b</td><td class="esc soft">&amp;#98;</td><td class="desc">Lowercase B</td></tr>
    <tr><td class="i">99</td><td class="i">63</td><td class="i">143</td><td class="char">c</td><td class="esc soft">&amp;#99;</td><td class="desc">Lowercase C</td></tr>
    <tr><td class="i">100</td><td class="i">64</td><td class="i">144</td><td class="char">d</td><td class="esc soft">&amp;#100;</td><td class="desc">Lowercase D</td></tr>
    <tr><td class="i">101</td><td class="i">65</td><td class="i">145</td><td class="char">e</td><td class="esc soft">&amp;#101;</td><td class="desc">Lowercase E</td></tr>
    <tr><td class="i">102</td><td class="i">66</td><td class="i">146</td><td class="char">f</td><td class="esc soft">&amp;#102;</td><td class="desc">Lowercase F</td></tr>
    <tr><td class="i">103</td><td class="i">67</td><td class="i">147</td><td class="char">g</td><td class="esc soft">&amp;#103;</td><td class="desc">Lowercase G</td></tr>
    <tr><td class="i">104</td><td class="i">68</td><td class="i">150</td><td class="char">h</td><td class="esc soft">&amp;#104;</td><td class="desc">Lowercase H</td></tr>
    <tr><td class="i">105</td><td class="i">69</td><td class="i">151</td><td class="char">i</td><td class="esc soft">&amp;#105;</td><td class="desc">Lowercase I</td></tr>
    <tr><td class="i">106</td><td class="i">6A</td><td class="i">152</td><td class="char">j</td><td class="esc soft">&amp;#106;</td><td class="desc">Lowercase J</td></tr>
    <tr><td class="i">107</td><td class="i">6B</td><td class="i">153</td><td class="char">k</td><td class="esc soft">&amp;#107;</td><td class="desc">Lowercase K</td></tr>
    <tr><td class="i">108</td><td class="i">6C</td><td class="i">154</td><td class="char">l</td><td class="esc soft">&amp;#108;</td><td class="desc">Lowercase L</td></tr>
    <tr><td class="i">109</td><td class="i">6D</td><td class="i">155</td><td class="char">m</td><td class="esc soft">&amp;#109;</td><td class="desc">Lowercase M</td></tr>
    <tr><td class="i">110</td><td class="i">6E</td><td class="i">156</td><td class="char">n</td><td class="esc soft">&amp;#110;</td><td class="desc">Lowercase N</td></tr>
    <tr><td class="i">111</td><td class="i">6F</td><td class="i">157</td><td class="char">o</td><td class="esc soft">&amp;#111;</td><td class="desc">Lowercase O</td></tr>
    <tr><td class="i">112</td><td class="i">70</td><td class="i">160</td><td class="char">p</td><td class="esc soft">&amp;#112;</td><td class="desc">Lowercase P</td></tr>
    <tr><td class="i">113</td><td class="i">71</td><td class="i">161</td><td class="char">q</td><td class="esc soft">&amp;#113;</td><td class="desc">Lowercase Q</td></tr>
    <tr><td class="i">114</td><td class="i">72</td><td class="i">162</td><td class="char">r</td><td class="esc soft">&amp;#114;</td><td class="desc">Lowercase R</td></tr>
    <tr><td class="i">115</td><td class="i">73</td><td class="i">163</td><td class="char">s</td><td class="esc soft">&amp;#115;</td><td class="desc">Lowercase S</td></tr>
    <tr><td class="i">116</td><td class="i">74</td><td class="i">164</td><td class="char">t</td><td class="esc soft">&amp;#116;</td><td class="desc">Lowercase T</td></tr>
    <tr><td class="i">117</td><td class="i">75</td><td class="i">165</td><td class="char">u</td><td class="esc soft">&amp;#117;</td><td class="desc">Lowercase U</td></tr>
    <tr><td class="i">118</td><td class="i">76</td><td class="i">166</td><td class="char">v</td><td class="esc soft">&amp;#118;</td><td class="desc">Lowercase V</td></tr>
    <tr><td class="i">119</td><td class="i">77</td><td class="i">167</td><td class="char">w</td><td class="esc soft">&amp;#119;</td><td class="desc">Lowercase W</td></tr>
    <tr><td class="i">120</td><td class="i">78</td><td class="i">170</td><td class="char">x</td><td class="esc soft">&amp;#120;</td><td class="desc">Lowercase X</td></tr>
    <tr><td class="i">121</td><td class="i">79</td><td class="i">171</td><td class="char">y</td><td class="esc soft">&amp;#121;</td><td class="desc">Lowercase Y</td></tr>
    <tr><td class="i">122</td><td class="i">7A</td><td class="i">172</td><td class="char">z</td><td class="esc soft">&amp;#122;</td><td class="desc">Lowercase Z</td></tr>
    <tr><td class="i">123</td><td class="i">7B</td><td class="i">173</td><td class="char">{</td><td class="esc soft">&amp;#123;</td><td class="desc">Left brace</td></tr>
    <tr><td class="i">124</td><td class="i">7C</td><td class="i">174</td><td class="char">|</td><td class="esc soft">&amp;#124;</td><td class="desc">Vertical bar</td></tr>
    <tr><td class="i">125</td><td class="i">7D</td><td class="i">175</td><td class="char">}</td><td class="esc soft">&amp;#125;</td><td class="desc">Right brace</td></tr>
    <tr><td class="i">126</td><td class="i">7E</td><td class="i">176</td><td class="char">~</td><td class="esc soft">&amp;#126;</td><td class="desc">Tilde</td></tr>
    <tr><td class="i">127</td><td class="i">7F</td><td class="i">177</td><td class="char soft">DEL</td><td class="esc soft">&amp;#127;</td><td class="desc">Delete</td></tr>
  </tbody>
</table>`
);
