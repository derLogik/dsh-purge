<p align="center">
  <img src="docs/banner.svg" alt="dsh-purge" width="720">
</p>

<h1 align="center">鈿旓笍 DeepSeek Harness 缃戠粶瀹夊叏绾㈤槦宸ュ叿锛坉sh-purge锛?/h1>

<p align="center"><strong>Version 1.2.4</strong></p>

<p align="center">
  <em>DeepSeek Harness 鐮寸敳锛氳鎵€鏈夋ā鍨嬮兘鑳界牬鐢诧紝涓嶅悓妯″瀷鍙崲涓嶅悓鎻愮ず璇嶏紱榛樿鎻愮ず璇嶉潰鍚戝浗妯°€屽皬鐮侀叡銆嶃€侸ailbreak for every model 鈥?swap prompts per model. 姹?Star 鏀惰棌 猸?濡傝浜屽紑锛岃鏌ョ湅缃插悕瑕佹眰閮ㄥ垎</em>
</p>

<p align="center">
  <a href="https://github.com/realMisakaMikoto/dsh-purge/stargazers"><img src="https://img.shields.io/github/stars/realMisakaMikoto/dsh-purge?logo=github&label=Stars" alt="GitHub stars"></a>
  <a href="https://github.com/realMisakaMikoto/dsh-purge/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-65a30d?style=flat" alt="MIT license"></a>
  <a href="https://awesome-dsh-plugin.com"><img src="https://awesome-dsh-plugin.com/badge.svg" alt="awesome 路 DSH plugin"></a>
  <a href="https://deepseek.stream/plugins/dsh-purge"><img src="https://img.shields.io/badge/Hub-dsh--purge-1a73e8" alt="DeepSeek Harness Hub"></a>
  <a href="https://www.deepseek.com/harness/"><img src="https://img.shields.io/badge/dsh-0.2.x-blue" alt="DSH"></a>
  <br>
  <img src="https://img.shields.io/badge/Node.js-%3E%3D22.13.0-339933?logo=node.js&logoColor=fff" alt="Node.js">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000" alt="JavaScript">
</p>

<p align="center">
  <a href="https://dsh-plugin.org/plugins/yujunzhixue/dsh-purge"><img src="https://dsh-plugin.org/badges/listed.svg" alt="Listed on dsh-plugin.org"></a>
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.zh-CN.md">涓枃</a>
</p>

> **杩欎笉鏄師浣滆€呯殑椤圭洰銆?* `realMisakaMikoto/dsh-purge` 鏄?[`YuJunZhiXue/dsh-purge`](https://github.com/YuJunZhiXue/dsh-purge)锛圡IT锛夌殑**绀惧尯鍏煎鏋勫缓**锛屽彧涓鸿鎻掍欢鍦?**dsh 0.2.2-rc.1 / 0.2.1-rc.5 / 0.2.1-rc.3 / 0.2.1-rc.2 / 0.2.1-rc.1 / 0.2.0-rc.2** 涓婄户缁兘鐢ㄣ€傚師浣滆€呬粨搴撴槸涓婃父锛岃璁°€佹彁绀鸿瘝涓庢妧鑳介兘褰掍笂娓革紱鏈粨搴撳彧甯?0.2.x 鍏煎琛ヤ竵锛堝樊寮傝 [`FORK-NOTES.md`](FORK-NOTES.md)锛夈€?.2.x 鐨勫吋瀹归棶棰樻彁鍒拌繖閲岋紱鍔熻兘闇€姹傘€佷笂娓?bug 鍜?0.1.x 鐨勬棫鐗堟湰鍙戝竷浠嶅綊鍘熶粨搴撱€?

> **鏆傚仠鏇存柊**锛堜笂娓镐綔鑰呭師璇濓紱鏈粨搴撲粛鎺ユ敹 0.2.x 鍏煎鎬т慨澶嶏級銆備綔鑰呭洜宸ヤ綔瀹夋帓锛岃繎鏈熸病鏈夌ǔ瀹氭敹鍏ワ紝椤圭洰缁存姢鏆傛椂鎼佺疆锛氫笉鍐嶅彂鐗堛€佹殏涓嶆敹 issue / PR锛屼篃涓嶄繚璇佽窡杩涙柊鐗?dsh銆備粨搴撲粛鍙嚜鐢紱璧炲姪瑙佷笅鏂广€傛仮澶嶇淮鎶ゆ椂浼氬湪鏈?README 璇存槑銆?

> **瀹樻柟 Web 鍜屽畼鏂规闈㈢閮芥敮鎸併€?* 瀹樻柟 `dsh web` 鐢?profile `web`锛涘畼鏂规闈?EXE锛圖eepSeek Harness **0.2.2-rc.1**銆?*0.2.1-rc.5**銆?*0.2.1-rc.3**銆?*0.2.1-rc.2**銆?*0.2.1-rc.1**銆?*0.2.0-rc.2**锛夌敤 profile `desktop`銆備袱杈瑰垎寮€瀹夎銆佸垎寮€鐐广€屽簲鐢ㄣ€嶃€傚綋鍓嶇増鏈彧閫傞厤 dsh 0.2锛涙洿鏃╃殑 dsh 鐢ㄥ搴旂殑鑰佺増鏈彃浠躲€傜ぞ鍖烘闈㈢涓嶇淮鎶ゃ€?
>
> 鍐欒繘 profile 杩樹笉浼氭敼瀹夸富銆傜偣浼氳瘽鏍囬鏃佺殑 **dsh-purge** 鈫?**娓呮礂** 鈫?**搴旂敤**銆傛垚鍔熶細鑷姩閲嶅惎锛涜ˉ涓佹病鎵撳畬涓嶉噸鍚€傞噸鍚悗鏂板紑涓€杞璇濓紝娉ㄥ叆鎵嶈繘褰撳墠浼氳瘽銆?
>
> 闇€瑕?Node.js **>=22.13.0** 涓?node:sqlite 鍙敤銆傝浠庢湰绀惧尯浠撳簱鐨?GitHub Release 瀹夎锛沝octor 浼氭鏌ヨ繍琛岀幆澧冦€?

## 鐩綍

- [璧炲姪](#sponsor)
- [浠嬬粛](#浠嬬粛)
- [缃插悕瑕佹眰](#缃插悕瑕佹眰)
- [杩濊鍟嗙敤鍏ず](#杩濊鍟嗙敤鍏ず)
- [閫傞厤鑼冨洿](#閫傞厤鑼冨洿)
- [瀹夎](#瀹夎)
- [鐣岄潰](#鐣岄潰棰勮)
- [浣跨敤](#浣跨敤)
- [宸ヤ綔鍘熺悊](#宸ヤ綔鍘熺悊)
- [杩樺師](#杩樺師)
- [鏇存柊](#鏇存柊)

---

<a id="sponsor"></a>

## 鈽?璧炲姪

杩欎釜椤圭洰瑕佹槸甯埌浣犱簡锛屾杩庢墦璧忋€傛垜鏄鍙ｅ瓙锛屾柦鑸嶇偣~


| 璧勪骇          | 鍦板潃                                             |
| ----------- | ---------------------------------------------- |
| USDT锛圱RC20锛?| `TV5ajPkRD8RH623Dx9mqvYZVNN8nPGRKid`           |
| Solana      | `6x16GhRgLVpKFFXaU1seKNdx2rypspSJTL4dbpt6Xpwk` |
| Ethereum    | `0xB68BD60C0e8c519513B7DF9bB147696815423B3E`   |
| Bitcoin     | `bc1qu70yxkrtwnymt8ryluz9x8y8hqzune5340npht`   |


---

## 浠嬬粛

**dsh-purge** 鏄鍦ㄦ湰鏈哄畼鏂?[DeepSeek Harness](https://www.deepseek.com/harness/) 涓婄殑缃戠粶瀹夊叏绾㈤槦璇勬祴鎻掍欢銆傚畼鏂?**Web**锛坄dsh web`锛夊拰瀹樻柟 **妗岄潰绔?*锛圗XE锛夐兘鏀寔锛屼袱杈瑰垎寮€瑁呫€佸垎寮€搴旂敤銆?

Harness 涓嶅彧鏄妸闂浜ょ粰妯″瀷銆傚畠杩樹細鍦ㄨ繍琛屾椂鏀规彁绀鸿瘝銆佸鎵归棬銆佹矙绠卞拰浼氳瘽鏍煎紡銆傚彧鐪嬨€屾ā鍨嬬瓟涓嶇瓟銆嶏紝浼氭妸瀹夸富鎷︽埅璇綋鎴愭ā鍨嬫嫆缁濄€傝繖涓彃浠跺湪浣犺嚜宸辩殑瀹夎閲屾妸杩欎袱灞傚垎寮€锛岀敤鏉ュ仛鍙楁帶璇勬祴锛屼篃鐢ㄦ潵鐪嬮粯璁ょ瓥鐣ヨ涓嶈鏀剁揣銆?


| 浣犱細鐢ㄥ埌             | 瀹冨仛浠€涔?                                           |
| ---------------- | ----------------------------------------------- |
| **dsh-purge 渚ф爮** | 浼氳瘽鏍囬鏃佺殑鎸夐挳鎵撳紑鍙充晶鏍忋€傞噷闈袱椤碉細娓呮礂銆佹紨缁冨彴                       |
| **娓呮礂**           | 鍒嗙粍鏌ョ湅琛ヤ竵锛屽簲鐢ㄣ€佽繕鍘熴€佸嵏杞斤紱缂栬緫鎻愮ず璇嶅拰澶氬瑙勫垯                      |
| **婕旂粌鍙?*          | 姝ｅ紡鐗堝唴缃€傛巿鏉冨悗鏌ョ湅璧勪骇銆佹妧鑳藉拰鏈満鐜銆傚彧鐢ㄤ簬浣犳湁鏉冪鐞嗙殑鏈満銆佺绾块澏鏍囨垨宸蹭功闈㈡巿鏉冪殑婕旂粌 |
| **瀹夸富绛栫暐**         | 璋冩暣榛樿鏂囨銆佹潈闄愮瓥鐣ュ拰宸ュ叿涓婇檺銆傚畼鏂硅兘鍔涗繚鐣欙紝涓嶅彟鍐欎竴濂楄韩浠?                |
| **鍚姩鏃?*          | 鑷姩鍐嶆鏌ュ苟搴旂敤銆俷pm 鍗囩骇鐩栨帀 `node_modules` 涔嬪悗涓嶇敤鎵嬫敼鏂囦欢       |


涓嶅啓姝荤洏绗︺€傛寜 `$DSH_HOME`銆乨sh 鍚姩鍣ㄦ梺杈圭殑 `.dsh`锛屽啀閫€鍥?`~/.dsh`銆備笉鏀?Harness 婧愮爜浠撳簱锛屽湪 **dsh-purge** 鐨勩€屾竻娲椼€嶉噷鐐广€屽簲鐢ㄣ€嶆墠鍐欏叆銆傝韩浠芥潵鑷彃浠堕噷鐨勫姞瀵嗘彁绀鸿瘝锛屼篃灏辨槸鎻愮ず璇嶆榛樿鏄剧ず鐨勯偅涓€浠姐€備笉璇诲彇瀹夸富纾佺洏涓婄殑鎻愮ず璇嶆枃浠躲€?

鏈彃浠跺彧澶勭悊浣跨敤鑰呮湰鏈哄凡瀹夎鐨勫畼鏂?`@deepseek-ai` 鍖呭拰鏈満閰嶇疆銆傚畠涓嶆槸鍏綉鎵弿鍣紝涔熶笉鏄拡瀵圭涓夋柟绔欑偣鐨勬敾鍑诲浠躲€備粨搴撳唴涓嶅惈鏈ㄩ┈銆佹湭鎺堟潈娓楅€忚剼鏈垨瀵瑰鏀诲嚮杞借嵎銆?

---

## 馃搶 闈炵泩鍒╁叕鐩婇」鐩紝涓ョ浠讳綍涓讳綋鐢ㄤ簬鍟嗕笟鍞崠銆佷粯璐瑰€掑崠鎴栭粦鐏颁骇鐗熷埄锛屼粎渚涙妧鏈弬鑰冦€?

## 缃插悕瑕佹眰

**鍊熺敤鏈」鐩殑鍚嶇О銆佹€濊矾銆佷唬鐮佹垨鎻愮ず璇嶏紝蹇呴』缃插悕锛屽苟鍐欐槑鏉ユ簮浠撳簱锛?* [YuJunZhiXue/dsh-purge](https://github.com/YuJunZhiXue/dsh-purge)銆?

涓嶇讲鍚嶃€侀殣鐬掓潵婧愩€佹敼澶存崲闈㈡嵁涓哄繁鏈夛紝浣滆€呭皢渚濇硶杩界┒璐ｄ换銆?

---

## 杩濊鍟嗙敤鍏ず

鎶栭煶鐩存挱璐﹀彿 **銆岃€佸紶鐨刟i銆?*锛堢洿鎾棿鏄剧ず **銆岃€佸紶AI璁插爞銆?*锛夋妸鏈粨搴撳綋鏀惰垂璐у崠锛氱洿鎾棿闂环銆佸綋鍦烘敹閽憋紝涓嶇讲鍚嶏紝涔熶笉瀹堜笂闈㈢殑闈炵泩鍒╂潯娆俱€備綔鑰呬汉灏卞湪鍦猴紝瀵规柟鐓ф敹銆?

鏈」鐩厤璐广€侀潪鐩堝埄銆傛嬁瀹冨崠璇俱€佸崠鎻掍欢銆佸崠 token銆佸€掑崠锛岃鍙綋鍦轰綔搴燂紝浣滆€呬繚鐣欒拷绌舵潈鍒┿€?

2026-10-12 鐩存挱璁板綍锛?

<p align="center">
  <img src="docs/notice/laozhang-live-1.jpg" width="360" alt="鑰佸紶鐨刟i 鐩存挱闂环">
  <img src="docs/notice/laozhang-live-2.jpg" width="360" alt="鑰佸紶鐨刟i 鐩存挱鏀堕挶">
</p>

瀵规柟寰俊鍚?**銆岃€佸紶鐨刟i绉戞妧銆?*锛岀洿鎾棿瑙備紬姒滃悓鍙枫€傝闂埌鏄笉鏄湰浠撳簱寮€鍙戣€呮椂锛岃嚜绉般€岃€佸帀瀹充簡銆嶏紱浣滆€呭綋鍦鸿〃绀鸿鎶曡瘔銆?

<p align="center">
  <img src="docs/notice/laozhang-wechat-1.jpg" width="420" alt="鑰佸紶鐨刟i绉戞妧 寰俊鑷О寮€鍙戣€?>
</p>

---

### 鈿狅笍 涓ユ娉曞緥鍏嶈矗涓庡悎瑙勪娇鐢ㄥ０鏄?



**鍏嶈矗澹版槑锛?* 鏈」鐩负闈炶惀鍒╁紑婧愰」鐩紝閬靛畧鍥藉娉曞緥娉曡鍙婃墍鍦ㄥ钩鍙扮殑鐩稿叧瑙勮寖锛屼粎渚涘涔犱笌鐮旂┒浣跨敤銆備笉寰楀皢鏈」鐩敤浜庝换浣曡繚娉曡繚瑙勭敤閫旓紱鐢辨浜х敓鐨勫悗鏋滅敱浣跨敤鑰呰嚜琛屾壙鎷呫€?

**銆愰浂瀹瑰繊涓ユ鐢虫槑銆?*锛氭湰椤圭洰鍧氬喅鍙嶅骞朵弗绂佷换浣曞舰寮忕殑杩濇硶鐘姜琛屼负锛佹湰椤圭洰寮€鍙戣€呯粷涓嶆敮鎸併€佷笉榧撳姳銆佷笉鍗忓姪浠讳綍鏈巿鏉冪綉缁滄敾鍑汇€佹紡娲炲埄鐢ㄣ€佹暟鎹獌鍙栥€侀潪娉曚镜鍏ヨ绠楁満淇℃伅绯荤粺鎴栫敓鎴愯繚娉曡繚绂佸唴瀹圭殑娲诲姩銆?*浠讳綍灏嗘湰椤圭洰鐢ㄤ簬杩濇硶鐘姜鐨勮涓猴紝鍧囦笌寮€鍙戣€呮棤鍏筹紝鐢辫涓轰汉渚濇硶鐙珛鎵挎媴鍏ㄩ儴娉曞緥璐ｄ换銆?*

1. **鏈粨搴撲笉鍚繚娉曞唴瀹?*锛歚dsh-purge` 鍙戝竷鐨勪唬鐮併€佹枃妗ｃ€佽ˉ涓佷笌榛樿鎻愮ず璇?*涓嶆槸**鏈ㄩ┈銆佸悗闂ㄣ€佹湭鎺堟潈娓楅€忓伐鍏枫€佸嫆绱㈣蒋浠躲€佹挒搴撹剼鏈紝涔?*涓嶆槸**閽堝鍏綉鎴栫涓夋柟绯荤粺鐨勬敾鍑昏浇鑽枫€傞」鐩湰韬笉鎻愪緵杩濇硶鍐呭锛屼篃涓嶆暀鍞嗐€佺粍缁囥€佸崗鍔╁疄鏂借繚娉曠姱缃€?
2. **鍙綔鐢ㄤ簬鏈満瀹樻柟 Harness**锛氬畨鍏ㄨ瘎娴嬭ˉ涓併€佹彁绀鸿瘝娉ㄥ叆鍏ㄩ儴鍙戠敓鍦ㄤ娇鐢ㄨ€?*鏈満宸插畨瑁呯殑瀹樻柟 DeepSeek Harness**锛坄@deepseek-ai` 鍖呫€佹湰鏈?profile / `$DSH_HOME`锛変笂銆傚璞℃槸浣跨敤鑰呰嚜宸辩殑瀹樻柟鏈湴杞欢锛?*涓嶆槸**浠栦汉鐨勭綉绔欍€佹湇鍔″櫒銆佽处鍙锋垨淇℃伅绯荤粺銆?
3. **璇勬祴琛ヤ竵涓嶅澶栫綉鐩爣鑱旂綉**锛氬簲鐢ㄨˉ涓併€佸啓鍏ユ敞鍏ャ€佸洖婊氥€佸嵏杞藉潎鍦ㄦ湰鏈烘枃浠朵笌鏈満杩涚▼鍐呭畬鎴愶紝**涓嶅浠讳綍鍏綉涓绘満銆佹湭鎺堟潈绯荤粺杩涜鎵弿銆佹帰娴嬨€佸叆渚垫垨鏀诲嚮鍙戝寘**銆備笉寰楁妸鏈」鐩綋浣滆烦鏉垮幓鎵撳缃戙€傛彃浠惰嫢寮€鍚€屾娴嬫洿鏂般€嶏紝浠呭彲鑳借闂湰鎻掍欢鑷繁鐨?GitHub 浠撳簱浠ユ牳瀵圭増鏈紝**涓庡绗笁鏂圭郴缁熺殑缃戠粶鏀诲嚮鏃犲叧**锛屼篃涓嶈兘琚В閲婁负鎺堟潈瀵瑰娓楅€忋€?
4. **鍚堟硶鍙楁帶鑼冨洿闄愬畾**锛氭湰椤圭洰瀹氫綅涓轰娇鐢ㄨ€呭湪**鑷繁鏈夋潈绠＄悊鐨勬湰鏈哄畼鏂?Harness**涓婏紝杩涜绾㈤槦绉戠爺涓庨瞾妫掓€ц瘎娴嬬殑杈呭姪宸ュ叿銆?*涓ョ鍦ㄦ湭缁忔墍鏈夎€呭悎娉曚功闈㈡巿鏉冪殑鐩爣銆佸叕缃戝湪绾跨郴缁熸垨鐢熶骇涓氬姟涓婅繍琛屾湰椤圭洰**銆備竴鍒囨祴璇曞繀椤婚檺鍒跺湪**鏈満宸叉巿鏉冨畨瑁呯殑瀹樻柟 Harness銆佺绾挎湰鍦板悎鎴愰澏鏍囥€佹巿鏉冪綉缁滃畨鍏ㄦ紨缁冮澏鍦哄強鍚堣瀹為獙瀹ゅ彈鎺х幆澧?*涓繘琛屻€?
5. **鐩爣閫夋嫨銆?* 鏈ぞ鍖烘瀯寤轰笉鍐嶆寜鍦板尯銆佽涓氭垨鑷湁鏈嶅姟鍣ㄥ悕鍗曢檺鍒剁孩闃熺洰鏍囥€?
6. **涓ョ杩濇硶涓庤繚绂佺敤閫?*锛氫娇鐢ㄨ€呬弗绂佸埄鐢ㄦ湰椤圭洰鐩存帴鎴栭棿鎺ヤ粠浜嬩换浣曡繚鍙嶄笅鍒楁硶寰嬫硶瑙勭殑琛屼负锛堝繀椤婚€愭潯閬靛畧锛屼笉寰椾互浠讳綍鐞嗙敱瑙勯伩锛夛細
  - **銆婁腑鍗庝汉姘戝叡鍜屽浗鍒戞硶銆?*
  - **銆婁腑鍗庝汉姘戝叡鍜屽浗缃戠粶瀹夊叏娉曘€?*
  - **銆婁腑鍗庝汉姘戝叡鍜屽浗鏁版嵁瀹夊叏娉曘€?*
  - **銆婁腑鍗庝汉姘戝叡鍜屽浗涓汉淇℃伅淇濇姢娉曘€?*
  - 浠ュ強鍏朵粬鐜拌鏈夋晥鐨勬硶寰嬨€佽鏀挎硶瑙勪笌鐩戠瑙勫畾锛?
  - 鍚屾椂涓ョ锛?
  - 鏈粡鎺堟潈娓楅€忋€佹敾鍑诲叕绉佹満鏋勮绠楁満淇℃伅绯荤粺锛屽疄鏂藉嫆绱€佺牬鍧忋€佹挒搴撴垨浼犳挱鎭舵剰杞借嵎锛?
  - 璇卞銆佺敓鎴愭垨浼犳挱鍗卞鍥藉瀹夊叏銆佹亹鎬栦富涔夈€佹毚鍔涜鑵ャ€佹秹榛勬秹璧屻€佽瘓楠椼€佷镜鐘叕姘戦殣绉佹垨鐭ヨ瘑浜ф潈绛変换浣曟硶寰嬫槑浠ょ姝㈢殑杩濇硶杩濈鍐呭锛?
  - 杩濆弽鐩稿叧澶фā鍨嬫彁渚涘晢鐨勩€婃湇鍔℃潯娆俱€嬩笌銆婃互鐢ㄦ斂绛栥€嬨€?
7. **浣跨敤鑰呯嫭绔嬫壙鎷呭叏閮ㄨ矗浠?*锛氭湰椤圭洰渚濇嵁 MIT 寮€婧愬崗璁€滄寜鐜扮姸鈥濇彁渚涳紝寮€鍙戣€呬笉瀵硅蒋浠剁殑瀹屾暣鎬с€佸畨鍏ㄦ€т笌閫傜敤鎬т綔浠讳綍鏄庣ず鎴栨殫绀虹殑淇濊瘉銆?*浣跨敤鑰呭簲瀵硅嚜韬殑鎵€鏈変笅杞姐€侀儴缃层€佽繍琛屻€佷慨鏀广€佷紶鎾涓轰互鍙婄敱姝や骇鐢熺殑鍏ㄩ儴杈撳叆涓庤緭鍑哄悗鏋滄壙鎷呯嫭绔嬨€佸畬鍏ㄧ殑姘戜簨銆佽鏀垮強鍒戜簨娉曞緥璐ｄ换**銆傞」鐩綔鑰呬笌璐＄尞鍥㈤槦缁濅笉鎵挎媴浠讳綍鍥犱娇鐢ㄨ€呮互鐢ㄥ鑷寸殑鐩存帴銆侀棿鎺ユ垨杩炲甫璐ｄ换銆?
8. **杩濈害鍗崇粓姝㈡巿鏉?*锛氫换浣曞皢鏈」鐩敤浜庨潪娉曟敾鍑汇€佹伓鎰忔椿鍔ㄦ垨杩濊琛屼负鐨勪釜浜烘垨瀹炰綋锛屽叾寮€婧愯蒋浠朵娇鐢ㄨ鍙皢鑷繚娉曡繚瑙勮涓哄彂鐢熶箣鏃ヨ捣**鑷姩涓斾笉鍙挙閿€鍦扮珛鍗崇粓姝?*銆傝涓讳綋椤荤珛鍗冲仠姝娇鐢ㄥ苟姘镐箙閿€姣佹湰椤圭洰鐨勬墍鏈変唬鐮併€佽剼鏈笌琛嶇敓鏁版嵁锛屽苟渚濇硶鎵挎媴鐩稿簲娉曞緥鍒惰銆?
9. **绗笁鏂圭嫭绔嬫€у０鏄?*锛氭湰椤圭洰灞炰簬瀹屽叏鐙珛鐨勫紑婧愬畨鍏ㄨ瘎娴嬬爺绌堕」鐩紝涓?DeepSeek 瀹樻柟鎴栧叾鍏宠仈涓讳綋鏃犱换浣曢毝灞炪€佸晢涓氬悎浣溿€佹巿鏉冩垨瀹樻柟鑳屼功鍏崇郴銆傛枃涓€屽畼鏂广€嶄粎鎸囪瘎娴嬪璞′负浣跨敤鑰呮湰鏈哄畨瑁呯殑瀹樻柟 DeepSeek Harness 杞欢鍖咃紝**涓嶄唬琛?* DeepSeek 瀹樻柟寮€鍙戙€佽鍙垨鎷呬繚鏈彃浠躲€?
10. **蹇呴』缃插悕**锛氬€熺敤鏈」鐩殑鍚嶇О銆佹€濊矾銆佷唬鐮佹垨鎻愮ず璇嶏紝蹇呴』缃插悕骞舵爣鏄庢湰浠撳簱銆備笉缃插悕灏嗕緷娉曡拷绌惰矗浠汇€傝瑙?[缃插悕瑕佹眰](#缃插悕瑕佹眰)銆?





---

## 閫傞厤鑼冨洿

鏈€鏂扮増鍙敮鎸?**dsh 0.2**锛屼笉瑕佹嬁瀹冨幓鎵?0.1.x銆?

- **dsh 0.2.2**锛堝畼鏂规闈?**0.2.2-rc.1** / 瀹樻柟 `dsh web`锛夛細鐢?**1.2.4** 鍙婁互涓娿€傚凡鍦?**0.2.2-rc.1** 瀹炴祴锛?5 鏉¤ˉ涓侊紝妗岄潰瀹夸富 75 applied / 0 pending锛堝叾浣?10 鏉′负 `na`锛屾寜璁捐涓嶉€傜敤锛夛紝`app.asar` 宸茶В鍖呭苟鏀瑰悕璁╀綅銆傛湰椤靛懡浠よ鐨勫氨鏄繖涓€妗ｃ€?
- **dsh 0.2.1**锛堝畼鏂规闈?**0.2.1-rc.5** / **0.2.1-rc.3** / **0.2.1-rc.2** / **0.2.1-rc.1** / 瀹樻柟 `dsh web`锛夛細鐢?**1.2.4** 鍙婁互涓?鈥斺€?鍚屼竴浠藉寘淇濈暀 0.2.1 鐨?pattern 闆嗭紝涓€涓寘瑕嗙洊涓ゆ。銆?
- **dsh 0.2.0**锛堝畼鏂规闈?**0.2.0-rc.2**锛夛細鐢?**1.1.40** 鍙婁互涓?鈥?鍚屼竴濂楄ˉ涓侊紱`#40` 鐩墠瑙佽繃鐨?complete 鏀跺熬鍧楀舰鐘堕兘鍛藉緱涓€?
- **dsh 0.1.7**锛堝惈 rc.1 / rc.2锛夛細鐢?**1.1.39** 鍙婃洿鏃?鈥斺€?鍦?[涓婃父 Releases](https://github.com/YuJunZhiXue/dsh-purge/releases) 閲岄€夊搴旀爣绛俱€?

瀵逛笉涓婄殑琛ヤ竵浼氭樉绀哄緟搴旂敤鎴栬烦杩囷紝涓嶄細涔辨敼鏂囦欢銆?

---

## 瀹夎

鐜板湪鍙淮鎶ゅ畼鏂?`dsh web` 鍜屽畼鏂规闈?EXE锛?*涓よ竟閮借瑁呫€佸垎寮€搴旂敤**銆俉eb 鐨勫寘杩涗笉浜嗘闈㈢锛屾闈㈢鐨勫寘涔熻繘涓嶄簡 Web銆?

**Web锛堝畼鏂?`dsh web`锛?*

```sh
dsh plugin --profile web add https://github.com/realMisakaMikoto/dsh-purge/releases/download/v1.2.4/dsh-purge-1.2.4.tar.gz
```

**妗岄潰绔紙瀹樻柟 EXE锛?*

```sh
dsh plugin --profile desktop add https://github.com/realMisakaMikoto/dsh-purge/releases/download/v1.2.4/dsh-purge-1.2.4.tar.gz
```

涓ゆ潯鍛戒护瑁呯殑鏄?*鏈粨搴撹繖涓?fork**锛屼笉鏄悓鍚嶄笂娓?npm 鍖咃細鐩爣鐩存帴鍐?tarball锛屾墠甯︿笂 0.2.x 鍏煎琛ヤ竵銆傚綋鍓嶇洰褰曞凡缁忔槸鏈粨搴撴椂锛屾妸鍚屼竴涓?`--profile` 鎹㈡垚 `add .`銆俙dsh` 涓嶅湪 PATH 鏃惰蛋 [鎵嬪姩瀹夎](#manual)銆?

[鎻掍欢甯傚満](https://dsh-plugin.org/plugins/yujunzhixue/dsh-purge) 鐨勬潯鐩睘浜庝笂娓革紝瑁呯殑鏄笂娓?npm 鍖?鈥斺€?閭ｄ唤涓嶅甫鏈?fork 鐨?0.2.x 淇銆傝鐢ㄨ繖浠斤紝璧颁笂琛ㄧ殑 tarball 鍛戒护锛屾垨鐢ㄤ笅闈㈢殑鎸夐挳锛堝凡鎸囧悜鏈粨搴擄級銆?

妗岄潰瀹㈡埛绔篃鍙互鐐规寜閽紙`dsh://` 鍞よ捣锛夛細

<p align="center">
  <a href="dsh://plugin/install?id=dsh-purge&name=dsh-purge&version=1.2.4&repo=realMisakaMikoto%2Fdsh-purge&permissions=%E7%B3%BB%E7%BB%9F%E6%8F%90%E7%A4%BA%E8%AF%8D%E6%B3%A8%E5%85%A5%2C%E6%9C%AC%E6%9C%BA%E8%A1%A5%E4%B8%81%2C%E8%AE%BE%E7%BD%AE%E9%A1%B5&downloadUrl=https%3A%2F%2Fgithub.com%2FrealMisakaMikoto%2Fdsh-purge%2Freleases%2Fdownload%2Fv1.2.4%2Fdsh-purge-1.2.4.tar.gz"><strong>鍞よ捣瀹㈡埛绔竴閿畨瑁?/strong></a>
</p>

### 瑁呭畬閮借鍋氳繖涓夋

鍙妸鎻掍欢鍐欒繘 profile **杩樹笉浼?*鏀?`@deepseek-ai`銆?

1. **閫€鍑哄苟閲嶆柊鎵撳紑**鍒氳鐨勯偅涓涓伙細Web 鍏虫帀 `dsh web` 鍐嶅紑锛涙闈㈢閫€鍑烘墭鐩樺啀鎵撳紑瀵瑰簲 exe銆?
2. 鍦?*杩欎釜瀹夸富**鐐逛細璇濇爣棰樻梺鐨?**dsh-purge**锛屽湪 **娓呮礂** 椤电偣 **銆屽簲鐢ㄣ€?*銆傚涓荤殑璁剧疆椤甸噷娌℃湁杩欎釜鏉＄洰銆?
3. 銆屽簲鐢ㄣ€嶆垚鍔熷悗浼氳嚜鍔ㄩ噸鍚竴娆★紝璁╄ˉ涓佽繘鍏ュ綋鍓嶈繘绋嬨€傛病鍋氬畬涓嶄細閲嶅惎銆?

Web 鐨勬帶浠跺彧鍔?Web锛屾闈㈢鐨勫彧鍔ㄦ闈㈠簲鐢ㄣ€備笉瑕佸湪涓€涓涓婚噷鐐瑰彟涓€涓涓荤殑搴旂敤銆?

### 鎬庢牱绠楄涓婁簡

- 浼氳瘽鏍囬鏃佹湁 **dsh-purge**锛岀偣寮€鍚庡湪銆屾竻娲椼€嶉噷鑳界偣銆屽簲鐢ㄣ€嶃€?
- 鑱婂ぉ閲?`/purge status` 鑳芥墦鍑?`DSH_HOME` 鍜岃ˉ涓佸垪琛紝璺緞搴旀槸浣犳鍦ㄧ敤鐨勯偅涓€浠姐€?
- 娌¤鐨勫彲閫夊寘锛堜緥濡傛绁烇級鏄剧ず璺宠繃锛屼笉鎸′綇搴旂敤瀹屾垚銆?

### 浜ょ粰鍔╂墜瀹夎

鎶婁笅闈㈡暣娈靛彂缁欐湰鏈哄姪鎵嬨€傚畠鍙墽琛屽畨瑁呭懡浠わ細涓嶈鍏ㄧ洏鎼滅储銆佷笉瑕佹敼鍏跺畠鏂囦欢銆佷笉瑕佷唬鐐广€屽簲鐢ㄣ€嶃€佷笉瑕侀噸鍚€?

<details>
<summary><strong>缁?AI 鍔╂墜锛堝彧瀹夎锛?/strong></summary>

<!-- AI-AGENT-START -->

瀹夎 DeepSeek Harness 鎻掍欢 `dsh-purge`锛學eb 鍜屽畼鏂规闈㈢閮借瑁呫€備笉瑕佸叏鐩樻悳绱紝涓嶈璇绘垨鏀瑰叾瀹冩枃浠讹紝涓嶈搴旂敤璁剧疆锛屼篃涓嶈閲嶅惎搴旂敤銆?

`dsh` 涓嶅湪 PATH 灏卞憡璇夌敤鎴峰悗鍋滄銆備笅闈袱鏉＄敤鐨勬槸鏈粨搴?fork 鐨?tarball锛屼笉鏄笂娓?npm 鍖呭悕銆傚綋鍓嶇洰褰曞凡鏄湰浠撳簱鏃讹紝鎶婁袱鏉￠噷鐨?URL 閮芥崲鎴?`.`銆傛煇涓?profile 涓嶅瓨鍦ㄥ氨璺宠繃閭ｄ竴鏉★紝鍙︿竴鏉＄収瑁呫€?

**Web 绔紙瀹樻柟 `dsh web`锛?*

```sh
dsh plugin --profile web add https://github.com/realMisakaMikoto/dsh-purge/releases/download/v1.2.4/dsh-purge-1.2.4.tar.gz
```

**妗岄潰绔紙瀹樻柟 EXE锛?*

```sh
dsh plugin --profile desktop add https://github.com/realMisakaMikoto/dsh-purge/releases/download/v1.2.4/dsh-purge-1.2.4.tar.gz
```

鍛戒护缁撴潫鍚庯紝鎻愰啋鐢ㄦ埛锛歐eb 瀹屽叏閫€鍑哄苟閲嶅惎 `dsh web`锛涙闈㈢閫€鍑烘墭鐩樺啀鎵撳紑 EXE銆傚悇鑷偣浼氳瘽鏍囬鏃佺殑 **dsh-purge**锛屽湪銆屾竻娲椼€嶉噷鐐广€屽簲鐢ㄣ€嶃€傜劧鍚庡仠姝€?

<!-- AI-AGENT-END -->

</details>

<a id="manual"></a>

### 鎵嬪姩瀹夎

鍛戒护琛岃涓嶄笂銆佹垨 `dsh` 涓嶅湪 PATH 鏃剁敤杩欎釜銆傚彧鏀?*姝ｅ湪鐢ㄧ殑閭ｄ釜瀹夸富**瀵瑰簲鐨?profile锛屼笉瑕佸姩鍙︿竴涓紝涔熶笉瑕佸垹鍘熸湁 bundle銆?

<details>
<summary><strong>瀹屾暣鎵嬪姩姝ラ</strong></summary>

**1. 鎵惧埌鐪熸鍦ㄧ敤鐨?`$DSH_HOME`銆?* 璁ょ洰褰曪細鍚嶅瓧鏄?`.dsh`锛堝畼鏂?EXE 鍋惰 `dsh-home`锛夛紝閲岄潰鏈?`profiles`锛屼笖鑷冲皯鏈変竴涓?`profiles/<鍚?/package.json`銆傛寜椤哄簭鎵撅細`DSH_HOME` 鐜鍙橀噺 鈫?瀹夎鏍规梺杈圭殑 `.dsh`锛堜究鎼哄寘锛夆啋 `%USERPROFILE%\.dsh` 鎴?`~/.dsh` 鈫?`%APPDATA%` / `%LOCALAPPDATA%\DeepSeek Harness\dsh-home`銆傜‘璁わ細`profiles/web/package.json` 閲?`"name"` 鏄?`dsh-profile-web`锛堟闈㈡槸 `dsh-profile-desktop`锛夈€傛湰鏈哄父鏈変袱浠?`.dsh`锛岃鐢ㄤ綘**瀹為檯鍚姩**鐨勯偅涓涓诲搴旂殑閭ｄ唤銆?

Windows PowerShell 鍒楀€欓€夛細

```powershell
$cands = @()
if ($env:DSH_HOME) { $cands += $env:DSH_HOME }
$cands += "$env:USERPROFILE\.dsh"
$dsh = Get-Command dsh -ErrorAction SilentlyContinue
if ($dsh) {
  $dir = Split-Path $dsh.Source
  $cands += @((Join-Path $dir ".dsh"), (Join-Path (Split-Path $dir) ".dsh"), (Join-Path (Split-Path (Split-Path $dir)) ".dsh"))
}
$cands += @("$env:APPDATA\DeepSeek Harness\dsh-home", "$env:LOCALAPPDATA\DeepSeek Harness\dsh-home")
$cands | Select-Object -Unique | Where-Object { $_ -and (Test-Path (Join-Path $_ "profiles")) }
```

**2. 鎶婃彃浠舵斁鍒?`$DSH_HOME/plugins/dsh-purge`**锛堢洰褰曞悕蹇呴』鏄?`dsh-purge`锛屽叾 `package.json` 閲?`"name"` 涔熷繀椤绘槸 `dsh-purge`锛夈€?

```sh
git clone https://github.com/realMisakaMikoto/dsh-purge.git "$DSH_HOME/plugins/dsh-purge"
```

娌℃湁 git锛氫笅杞?[dsh-purge-1.2.4.tar.gz](https://github.com/realMisakaMikoto/dsh-purge/releases/download/v1.2.4/dsh-purge-1.2.4.tar.gz)锛岃В鍘嬪悗鎶?`dsh-purge-1.2.4` 鏀瑰悕涓?`dsh-purge`锛屾暣澶规斁鍒?`plugins` 涓嬨€傚凡鏈夋湰浠撳簱鍓湰灏卞鍒舵暣涓洰褰曪紝涓嶈鍙嫹鍑犱釜 `.js`銆?

**3. 鍙敼瀵瑰簲 profile 鐨?`package.json`锛屽厛澶囦唤銆?* Web 鈫?`$DSH_HOME/profiles/web/package.json`锛涙闈?鈫?`$DSH_HOME/profiles/desktop/package.json`銆?*鍙拷鍔犱袱澶?*锛屽師鏈変緷璧栧拰 bundle 鍏ㄩ儴鐣欑潃锛?

1. `dependencies` 澧炲姞 `"dsh-purge": "file:../../plugins/dsh-purge"`
2. `dsh.profile.bundles` **鏈熬**杩藉姞 `"dsh-purge"`锛堝凡鏈夊氨涓嶈鍐嶅姞锛?

```json
{
  "name": "dsh-profile-web",
  "private": true,
  "dependencies": {
    "dsh-purge": "file:../../plugins/dsh-purge"
  },
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "dsh-purge"
      ],
      "patchReload": "live"
    }
  }
}
```

JSON 瑕佸悎娉曪紙鏂板椤瑰墠闈㈡湁閫楀彿锛屾渶鍚庝竴椤瑰悗闈㈡病鏈夊浣欓€楀彿锛夈€俙file:../../plugins/dsh-purge` 涓嶈鏀规垚缁濆璺緞锛宍patchReload`銆佸叾瀹冩彃浠躲€佺増鏈彿閮戒笉瑕佸姩锛宍"dsh-purge"` 涓嶈鍐欎袱娆°€傛闈㈢娌℃湁 `dsh-web-app` 灏变笉瑕佺‖鍔犮€?

**4. 鍙湪鍒氭敼鐨勯偅涓?profile 鐩綍瑁呬緷璧?*锛坄cd` 杩?profile 鐩綍锛屼笉瑕佸湪浠撳簱鏍规垨 `$DSH_HOME` 鏍癸級锛?

```sh
cd "$DSH_HOME/profiles/web"   # 鎴?profiles/desktop
pnpm install
```

鎴愬姛鏍囧織锛氬嚭鐜?`profiles/<web|desktop>/node_modules/dsh-purge/package.json`銆傛壘涓嶅埌 `pnpm` 灏辩敤瀹樻柟 `dsh` 鑷甫鐨?Node / pnpm锛涙姤 `Could not resolve` 灏辨鏌?`file:` 璺緞锛汮SON 瑙ｆ瀽澶辫触灏变慨閫楀彿鎴栬繕鍘熷浠姐€?

**5. 瀹屽叏閫€鍑鸿瀹夸富锛屽啀鍚姩锛屽啀鐐广€屽簲鐢ㄣ€?* 鈥斺€?鍜屼笂闈笁姝ヤ竴鏍枫€傛寜閽細鍑虹幇鍦ㄤ細璇濇爣棰樻梺锛屽彧鍦ㄨ繖涓涓荤偣銆屽簲鐢ㄣ€嶏紙鎴?`/purge apply`锛夈€傛病鍑虹幇澶氬崐鏄敼閿欎簡鍙︿竴浠?`.dsh`锛屽洖鍒扮 1 姝ユ牳瀵广€?

</details>

### 鍗歌浇

浼氳瘽鏍囬鏃佺殑 **dsh-purge** 鈫掋€屾竻娲椼€嶁啋銆屽嵏杞姐€嶃€傚脊绐楃‘璁わ細浼氬厛杩樺師宸插簲鐢ㄧ殑琛ヤ竵锛岃繕鍘熷洖鍘熺増 Harness锛屽啀閲嶅惎褰撳墠瀹夸富銆?

```sh
# 涔熷彲浠ョ敤鍛戒护琛?/ 鑱婂ぉ
dsh-purge --uninstall
# /purge uninstall
```

鎻掍欢閰嶇疆鍦?`cordis.patch.yml`锛坄postPrompt` 榛樿涓虹┖锛夛細

```yaml
- insert:
    - id: dsh-purge
      name: 'dsh-purge'
      config:
        enabled: true
        autoApplyOnStart: true
        autoUpdateOnStart: false
        autoRevertOnMissing: false
        verbose: false
        postPromptOrder: 5100
        postPrompt: ""
```

---

## 鐣岄潰棰勮

浼氳瘽鏍囬鏃佹湁 **dsh-purge**銆傜偣寮€鏄彸渚ф爮锛屼袱椤碉細**娓呮礂** 鍜?**婕旂粌鍙?*銆傜櫧 / 澧ㄥ彲鍒囨崲銆傝ˉ涓佹寜缁勫睍寮€锛岃繘搴﹀彧璁＄湡姝ｅ凡搴旂敤鐨勯」銆傝鍒欓泦鍦ㄤ笂鏂瑰垪琛ㄥ惎鐢ㄦ垨鍒犻櫎锛屼笅鏂圭紪杈戞鏂囥€?

绗竴娆¤繘婕旂粌鍙拌鍏堣澹版槑銆佺瓑鍊掕鏃躲€佹粴鍒版枃鏈苟鍕鹃€変笁椤广€傛竻娲椾笉闇€瑕佽繖涓€姝ャ€傛紨缁冨彴鍙敤浜庝綘鏈夋潈绠＄悊鐨勬湰鏈恒€佺绾块澏鏍囷紝鎴栧凡缁忎功闈㈡巿鏉冪殑婕旂粌鐜銆?

**娓呮礂**

![娓呮礂](docs/preview/dock-clean.png)

**婕旂粌鍙版巿鏉?*

![婕旂粌鍙版巿鏉僝(docs/preview/dock-auth.png)

**婕旂粌鍙?*

![婕旂粌鍙癩(docs/preview/dock-drill.png)

**琛ヤ竵**

![琛ヤ竵](docs/preview/settings.png)

**瑙勫垯闆?*

![瑙勫垯闆哴(docs/preview/rules.png)


| 鍖哄煙        | 璇存槑                                                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| dsh-purge | 浼氳瘽鏍囬鏃佺殑鎸夐挳锛屾墦寮€鎴栨敹璧峰彸渚ф爮                                                                                          |
| 娓呮礂        | 鍘熸潵鐨勮鍒欒瀹氾細琛ヤ竵銆佹彁绀鸿瘝銆佽鍒欓泦銆丼kill                                                                                   |
| 婕旂粌鍙?      | 鎺堟潈鍚庣殑璧勪骇銆佹妧鑳戒笌鐜椤点€傛湭鎺堟潈鏃舵寜閽爣銆屾湭鎺堟潈銆?                                                                                |
| 琛ヤ竵        | 鍒嗙粍鏌ョ湅鐘舵€侊紝搴旂敤銆佽繕鍘熸垨鍗歌浇                                                                                            |
| 鎻愮ず璇?      | 缂栬緫 `prompt-inject.md`锛屼綔涓轰細璇濊鐩栨                                                                              |
| 瑙勫垯闆?      | 澶氬 `AGENTS.md` / `CLAUDE.md`锛涘惎鐢ㄥ啓鍏?`$DSH_HOME`锛屽垹闄や粠鍒楄〃鍘绘帀                                                      |
| Skill     | 瀵煎叆鍘嬬缉鍖呮垨鏂囦欢澶瑰埌褰撳墠瀹夸富瀹樻柟鐩綍 `$DSH_HOME/skills/<id>/SKILL.md`锛圵eb / 妗岄潰鍚勭敤鑷繁鐨勪富鐩綍锛屼笉鍐欐鐩樼锛夛紱鍛戒腑銆佸姞杞姐€乣/鍚嶇О` 鐢?DSH 璐熻矗銆備篃鍙嚜宸卞垹璇ユ枃浠跺す |


---

## 鐩綍缁撴瀯

`bin/` 鏄懡浠よ锛宍lib/` 鏄ˉ涓佸拰婕旂粌鍙帮紝`presets/redteam/` 鏄孩闃熼璁撅紝`skills/redteam/` 鏄殢鍖呮妧鑳斤紝`client.js` 鏄晶鏍忋€?

杩愯鏃舵枃浠跺湪 `$DSH_HOME`锛歚prompt-inject.md`銆乣rules/`銆乣skills/`銆乣redteam/`銆傛湭璁?`DSH_HOME` 鏃讹紝浼樺厛鐢?dsh 瀹夎鐩綍鏃佽竟鐨?`.dsh`锛屽啀閫€鍥?`~/.dsh`銆俉eb 鍜屾闈㈢鍚勭敤鑷繁閭ｄ竴浠戒富鐩綍銆係kill 涓嶈繘娉ㄥ叆娈碉紝涔熶笉椤舵浛鎻愮ず璇嶃€?
鎶€鏈姤鍛婏細[`docs/technical-report.md`](docs/technical-report.md) 鈥斺€?瀹夎鎷撴墤銆佽ˉ涓佸紩鎿庯紙85 鏉?/ 57 涓洰鏍囬敭锛夈€佹彁绀鸿瘝娉ㄥ叆瀛愮郴缁熴€佷簨鍔′笌鍥炴粴銆佹湰鏈哄疄娴嬫暟鎹笌宸茬煡闄愬埗銆?
缁存姢鎵嬪唽锛歔`docs/maintaining.md`](docs/maintaining.md) 鈥斺€?瀹夸富鍗囩骇鍚庤嚜宸辫ˉ pattern 鐨勪竷姝ユ祦绋嬨€佷簲绉嶅舰鐘跺彉鍖栦笌閾佸緥锛涜ˉ涓佸師鏂囪〃锛歔`docs/reference/patch-spec.md`](docs/reference/patch-spec.md)锛堢敱 `node scripts/export-patch-table.mjs` 鐢熸垚锛屽惈姣忔潯 pattern/replace 鍏ㄦ枃锛夈€?
安装指南：[`docs/install.md`](docs/install.md) —— 为什么 `dsh plugin --profile desktop add` 会被 Electron profile 守卫拒绝，以及三条绕过路径（`node scripts/install.mjs` 为一条命令版，全新装 DSH 后直接用）。

---

## 浣跨敤

```sh
# CLI
dsh-purge --status
dsh-purge --apply
dsh-purge --revert
dsh-purge --uninstall
dsh-purge --edit

# 鑱婂ぉ
/purge status | apply | revert | uninstall | edit | help
/rules list | use <id> | create <id> | delete <id> | reset | help
/skills list | import <鍘嬬缉鍖呮垨鏂囦欢澶? | create <id> [璇存槑] | delete <id> | help
/rewind

# 妯″瀷宸ュ叿
purge_status   purge_apply   purge_revert
```

璁剧疆椤点€屽簲鐢ㄣ€嶆垚鍔熷悗浼氳嚜鍔ㄩ噸鍚紝浠ュ姞杞藉凡鏀圭殑鍖呮枃浠讹紱涔熷彲鎵嬪姩鐐广€岄噸鍚€嶃€傝ˉ涓佹爣棰樹笅鏈夋寮忕増鍜屾祴璇曠増銆傛祴璇曠増璺?`beta` 鍒嗘敮銆傜偣銆屽垏鎹㈠埌姝ｅ紡鐗堛€嶄細瑁呭洖 master锛屽苟娓呮帀閽夐€夈€傛寮忕増閲岄€夋棫鐗堟湰浼氬浐瀹氬湪璇ョ増鏈紝瑕佸洖鍒版渶鏂板啀鐐广€屾洿鏂般€嶃€傛棫鐨勬祴璇曟爣绛句笉鍐嶅垪鍑恒€?

杈撳叆妗嗘梺鐨勩€屽洖閫€涓€娆°€嶅拰銆屽洖閫€涓婁竴杞€嶈窡瀹樻柟 DSH `session.fork({ atSeq })`锛氭挙鍥炲凡杩涜鐨勯偅涓€杞紝鏂颁細璇濇帴涓婁箣鍓嶇殑涓婁笅鏂囷紝鏃т細璇濆綊妗ｏ紝閭ｅ彞鍥炲埌杈撳叆妗嗭紝鍐嶅彂閫佷細閲嶆柊娉ㄥ叆銆傝亰澶╅噷 `/rewind` 鍚屾牱鍙敤銆?

**鏋佺畝 / PTC 涓庢爣鍑嗕笉涓€鑷存椂**锛氬悓涓€浠诲姟鍦ㄦ爣鍑嗘ā寮忚兘璺戙€佸湪鏋佺畝鎴?PTC 琚嫤锛岄€氬父鏄?preset 閲?`run_code` 鎴?plan 鎷︽埅鍙ユ病娲楀噣锛屾垨鍐呯疆 minimal 缂哄皯 `agent-instructions`銆傝鍗囧埌 **1.1.61+**锛?*瀹屽叏閫€鍑哄涓?鈫?娓呮礂閲屽簲鐢?鈫?鑷姩閲嶅惎 鈫?鏂板紑涓€杞璇?* 鍐嶈瘯锛涘彧鎹?preset 涓嶉噸搴旂敤锛屾棫杩涚▼閲岀殑琛ヤ竵涓嶄細鏇存柊銆?

### 鍝嶅簲閫熷害

DSH 浼氭寜椤哄簭鎵ц鍚屼竴鎵逛腑鐨?Bash 璋冪敤銆傛棫鐗?dsh-purge 鎶婇粯璁ゅ墠鍙扮瓑寰呬粠 60 绉掓彁楂樺埌浜?10 鍒嗛挓锛屼竴鏉℃參鍛戒护浼氳鍚庣画璋冪敤涓€璧风瓑寰呫€傝ˉ涓?#21 鐜板湪鎶婂甫鎻掍欢鏍囪鐨勬棫鍊兼仮澶嶄负瀹樻柟鐨?60 绉掋€傛棤鏍囪鐨勭瓑寰呮椂闂村拰鍏朵粬鑷畾涔夊€间細淇濈暀锛涙棤鏍囪鐨?10 鍒嗛挓鏃犳硶鍙潬鍦板尯鍒嗘槸鎻掍欢鏃у€艰繕鏄敤鎴疯缃€?

鍦?macOS/Linux 鐨?`dsh web` 涓紝濡傞渶鏇村揩杩斿洖宸ュ叿缁撴灉锛屽彲鍦?`$DSH_HOME/profiles/web/cordis.patch.yml`锛堥€氬父鏄?`~/.dsh/profiles/web/cordis.patch.yml`锛夋坊鍔犱笅闈㈢殑鏉＄洰銆傚凡鏈夌浉鍚?id 鏃朵慨鏀瑰師鏉＄洰锛屼笉瑕侀噸澶嶆坊鍔犮€傝繖涓?profile 瑕嗙洊灞傚湪鍐呯疆閰嶇疆涔嬪悗鍔犺浇锛屽悗缁簲鐢ㄦ彃浠朵細淇濈暀瀹冦€?

```yaml
- id: bash-sandbox
  config:
    timeoutMs: 10000
```

浣跨敤鏍囧噯 jobs 鏈嶅姟涓?`promoteOnTimeout: true` 鏃讹紝鏈畬鎴愮殑鍛戒护浼氬湪 10 绉掑悗杩斿洖鍚庡彴浠诲姟 id锛屽苟缁х画杩愯銆傜敤 `job_output` 璇诲彇缁撴灉銆佺敤 `job_kill` 鍋滄銆傝繖涓缃缉鐭墠鍙扮瓑寰咃紝涓嶄細璁╁懡浠ゆ湰韬窇寰楁洿蹇€傛病鏈?jobs 鏈嶅姟鎴栧叧闂嚜鍔ㄨ浆鍚庡彴鏃讹紝瓒呮椂浼氱粓姝㈠懡浠ゃ€傚崟娆¤皟鐢ㄤ紶鍏ョ殑 `timeoutMs` 浼樺厛浜庤繖閲岀殑榛樿鍊硷紱`run_in_background: true` 鍙珛鍗宠繑鍥炰换鍔?id銆?

鏃ュ父浠诲姟杩樺彲浠ラ€夋嫨璁╂柊浼氳瘽榛樿浣跨敤 Low 鎺ㄧ悊锛?

```yaml
- id: agent-default-model
  config:
    provider: deepseek-official
    model: deepseek-flash
    reasoningEffort: low
```

閲嶅惎 `dsh web` 鍚庡姞杞介厤缃€傛ā鍨嬪拰鎺ㄧ悊绛夌骇榛樿鍊煎彧鐢ㄤ簬鏂板缓浼氳瘽锛屽凡鏈変細璇濊鍦ㄨ緭鍏ユ涓€夋嫨 Low銆傛彃浠朵笉浼氳嚜鍔ㄤ慨鏀硅繖浜涙ā鍨嬪亸濂姐€傞渶瑕佹繁鍏ユ帹鐞嗙殑浠诲姟鍙繚鐣?High锛涙悳绱㈡枃浠舵椂搴旈檺瀹氱洰褰曪紝閬垮厤閫掑綊鎵弿鎵€鏈夊簲鐢ㄧ洰褰曘€?

### 鐩爣鑼冨洿

鏈ぞ鍖烘瀯寤轰笉鍐嶆寜鍦板尯銆佽涓氭垨鑷湁鏈嶅姟鍣ㄥ悕鍗曢檺鍒剁孩闃熺洰鏍囥€傛棫鐨勩€岃嚜宸辩殑鏈嶅姟鍣ㄣ€嶈缃拰鎺ュ彛宸茬Щ闄ゃ€傚凡鏈夌殑 `net-scope-allow.txt` 鏂囦欢淇濈暀鍘熸牱锛屼笉鍐嶈鍙栥€?

---

## 鏈湴鏍￠獙

```sh
node --check lib/index.js
node --check lib/core.js
node --check lib/rewind.js
node --check lib/skills.js
node --check client.js
```

---

## 宸ヤ綔鍘熺悊

搴旂敤锛屽惎鍔ㄦ椂鎴栨墜鍔ㄧ偣銆屽簲鐢ㄣ€嶏細

```mermaid
flowchart TD
  A["鍚姩鎴栫偣搴旂敤"] --> B{"琛ヤ竵宸茬粡鐢熸晥?"}
  B -->|鏄瘄 C["璺宠繃"]
  B -->|鍚 D["澶囦唤鍘熶欢涓?.dshpurge.bak"]
  D --> E["鎸夎ˉ涓佸垪琛ㄦ浛鎹㈠搴旀枃浠?]
  E --> F["瑕嗙洊 shim"]
  F --> G["娉ㄥ叆鎻掍欢鍔犲瘑榛樿锛堟彁绀鸿瘝妗嗛粯璁ゆ樉绀虹殑閭ｄ唤锛?]
```



姣忔浼氳瘽鐨勮鐩栵細

```mermaid
flowchart TD
  A["閲嶅惎鎴栨柊浼氳瘽"] --> B["娉ㄥ叆鎻掍欢鍔犲瘑榛樿锛屼笉蹇呯偣淇濆瓨锛屼笉璇诲涓荤鐩?]
```



姣忎竴杞殑鎻愮ず璇嶆敞鍏ヤ笌瑙勫垯闆嗗喅绛栥€傚乏杈逛笁涓緭鍏ュ氨鏄綘鍦?dsh-purge 闈㈡澘閲屾帶鍒剁殑涓滆タ锛岃櫄绾胯〃绀哄畠浠悇鑷┍鍔ㄥ摢涓€姝ュ垽瀹氾細

```mermaid
flowchart TD
  L["瑙勫垯搴擄細鍚敤鏌愪釜瑙勫垯闆?鈫?鍐欏叆 prompt-inject.md"]
  W["鏈湴瑙勫垯锛氬嬀閫夊綋鍓嶇洰褰曠殑 AGENTS.md / CLAUDE.md"]
  P["宸ヤ綔鍖虹瓥鐣ワ細strict / fallback / always"]

  A["鏂颁竴杞紑濮?] --> B{"prompt-inject.md 闈炵┖?"}
  B -->|鏄瘄 C["娉ㄥ叆 = prompt-inject.md (A)"]
  B -->|鍚 D{"褰撳墠鐩綍鏈夎鍕鹃€変笖闈炵┖鐨勬湰鍦?md?"}
  D -->|鏄瘄 E["娉ㄥ叆 = 琚嬀閫夌殑 workspace md (B)"]
  D -->|鍚 F["娉ㄥ叆 = 鎻掍欢鍔犲瘑 slot 榛樿鍊?(D)"]
  C --> G{"Workspace baseline 绛栫暐 (C)"}
  E --> G
  F --> G
  G -->|strict| H["鍘绘帀 DSH workspace baseline 娈?]
  G -->|fallback 榛樿| I{"涓婇潰鏈夌敤鎴锋敞鍏ュ唴瀹? (A 鎴?B)"}
  G -->|always| J["淇濈暀 DSH workspace baseline 娈?]
  I -->|鏄瘄 H
  I -->|鍚 J
  H --> K["鏈€缁堢郴缁熸彁绀鸿瘝"]
  J --> K

  L -.-> B
  W -.-> D
  P -.-> G
```



Skill 涓嶈繘娉ㄥ叆娈碉細

```mermaid
flowchart LR
  A["璁剧疆椤靛鍏ユ垨 /skills import"] --> B["鍐欏埌瀹樻柟 skills 鐩綍"]
  B --> C["鐢?DSH 鍔犺浇"]
  C --> D["鍗歌浇鎻掍欢涓嶅垹鐢ㄦ埛 Skill"]
```



---

## 杩樺師

- 姣忎釜鐩爣鏂囦欢鍦ㄥ簲鐢ㄥ墠澶囦唤涓?`<鏂囦欢>.dshpurge.bak`銆?
- 銆岃繕鍘熴€嶆垨 `/purge revert` 鐢ㄥ浠借鐩栧洖鍘诲苟鍒犻櫎澶囦唤锛涙病鏈夊浠芥椂鍘绘帀 shim 閲岀敱鏈彃浠跺啓鍏ョ殑琛屻€?
- `prompt-inject.md` 鏄敤鎴锋枃浠讹紝杩樺師鏃朵繚鐣欍€?
- 銆屽嵏杞姐€嶄細鍏堣繕鍘燂紙鑻ュ凡搴旂敤锛夛紝鍐嶅垹闄ゆ敞鍏ユ枃浠躲€佽鍒欏簱鍜屾彃浠舵湰韬€?
- 閲嶅搴旂敤鏄箓绛夌殑銆?

---

## 璺緞鎺㈡祴

瀹夸富闈㈠厛鍒ゆ柇 `web` / `desktop`锛堥鐣?`gui` / `tui`锛屽皻鏈崟鐙€傞厤鏃跺洖閫€ web锛夈€?

**Web锛?*

1. `DSH_HOME` / `DSH_BASE`
2. dsh 鍚姩鍣ㄦ梺鐨?`.dsh`
3. `npm prefix -g` / `npm root -g`
4. 宓屽 `@deepseek-ai/dsh/node_modules/@deepseek-ai`
5. 绯荤粺榛樿 `~/.dsh`

**瀹樻柟妗岄潰锛?* 鍙敼褰撳墠姝ｅ湪杩愯鐨勫畼鏂规闈㈠畨瑁呫€傜偣銆屽簲鐢ㄣ€嶆垚鍔熷悗浼氳嚜鍔ㄩ噸鍚竴娆°€傜ぞ鍖烘闈㈢涓嶇淮鎶ゃ€?

鎵句笉鍒扮洰鏍囨椂鎻愮ず璁剧疆 `DSH_BASE`锛屼笉鏀规枃浠躲€?

---

## 鏇存柊

姣忎竴鐗堟敼浜嗕粈涔堛€佸畨瑁呭寘鍦?[Releases](https://github.com/realMisakaMikoto/dsh-purge/releases)銆傚彂鏂扮増鏃舵妸 `package.json` 鐨勭増鏈彿鏀规帀锛屼腑鑻辨枃璇存槑鍐欒繘 `release-notes.md`锛屾帹鍒?`master` 灏变細鑷姩鎵撳寘銆傚悓涓€鐗堟湰鍐嶆帹閫佷笉浼氶噸澶嶅彂鍖呫€?

## 璇存槑

- 鏀瑰姩鑼冨洿鏄湰鏈?`@deepseek-ai/*` 鍖呴噷鐨勬覆鏌撴枃妗堛€侀粯璁ょ瓥鐣ュ拰鎵ц閫昏緫锛屼互鍙婄敤鎴风洰褰曚笅鐨勮鐩栨枃浠朵笌瑙勫垯闆嗐€?
- 鍗囩骇鍚庡師鏂囧涓嶄笂浼氭樉绀鸿烦杩囷紝杩欐搴旂敤浠嶇畻瀹屾垚锛屼笉浼氫贡鏀广€?
- 涓嶆敼鍔ㄩ潪 `@deepseek-ai` 鐨勭涓夋柟鎻掍欢婧愪粨搴擄紙鍚姩鏃剁殑 CMD 鏃犳劅浼?*灏藉姏**淇ˉ宸茶鐨?doctor / market / 姊佺 / mnemon锛屽睘杩愯鏃惰ˉ涓侊級銆?
- 瀹夎鏈?fork锛歚dsh plugin --profile web add https://github.com/realMisakaMikoto/dsh-purge/releases/download/v1.2.4/dsh-purge-1.2.4.tar.gz`锛坄--profile desktop` 鍚岀悊锛夈€傚綋鍓嶇洰褰曞凡鏄湰浠撳簱鏃剁敤 `add .`銆?

---

鎰熻阿 [LINUX DO](https://linux.do) 绀惧尯

## 鍛戒护琛岀姸鎬佷笌浣撴

```sh
node bin/dsh-purge.js --status --json
node bin/dsh-purge.js --status --surface web
node bin/dsh-purge.js --status --base /path/to/node_modules/@deepseek-ai
node bin/dsh-purge.js --doctor --json
node bin/dsh-purge.js --doctor --save-baseline
node bin/dsh-purge.js --doctor --repo /path/to/linked/checkout --json
```

鐘舵€佷細鍒楀嚭鍚勪唤瀹夎锛涘彧鏈夋湭鎸囧畾骞冲彴鎴栫洰褰曟椂锛屾墠浼樺厛閫夋嫨瀹為檯杩愯鐨勬闈㈠涓汇€傛闈㈡鏌ュ寘鍚綊妗ｅ拰琛ヤ竵鐢熸晥鐘舵€併€?

doctor 鍏ㄩ儴妫€鏌ラ€氳繃鏃堕€€鍑虹爜涓?0锛屽惁鍒欎负 1銆傚彧鏈夊仴搴风姸鎬佸彲浠ヤ繚瀛樺熀绾匡紝骞惰褰曞涓昏矾寰勪互閬垮厤娣风敤涓嶅悓瀹夎鐨勫熀绾裤€俙--repo` 鐢ㄤ簬閾炬帴鍒板伐浣滃壇鏈殑寮€鍙戝畨瑁咃紱鍖呯己澶便€侀摼鎺ュけ鏁堟垨鐙珛澶嶅埗鐩綍閮戒笉浼氶€氳繃璇ユ鏌ャ€?

`--json` 浠呮敮鎸佺姸鎬佸拰浣撴鍛戒护銆備笌搴旂敤銆佽繕鍘熴€佺紪杈戞垨鍗歌浇鎿嶄綔缁勫悎鏃朵細鎶ラ敊锛屼笉鎵ц璇ユ搷浣溿€?


## 鍙仮澶嶆洿鏂帮紙1.1.76锛?

姝ｅ紡閫氶亾浠呰窡闅忛檮浠跺畬鏁寸殑宸插彂甯?Release锛屾瘡娆″浐瀹氬悓涓€鎻愪氦锛涙祴璇曢€氶亾缁х画璺熼殢 beta銆傛洿鏂板厛澶囦唤鏂囦欢锛屽寘鍚?skills/scripts锛屾柊瀹夸富楠岃瘉鐢熸晥鍚庢墠鎻愪氦鐗堟湰鐘舵€併€侴it 鏈湴鏈変慨鏀规椂鍋滄鏇存柊銆備繚鐣欐渶杩戜袱浠藉凡楠岃瘉鐨勬棫鐗堝浠斤紝寮傚父鎴栧甫閾炬帴鐨勫浠戒繚鐣欏苟鎶ュ憡銆傚惎鍔ㄥけ璐ユ寜璁板綍鎭㈠鏂囦欢锛屾渶澶氶噸鍚仮澶嶄竴娆°€傛洿鏂板櫒涓嶉€掑綊娓呯悊瀹夸富鎴?runtime 鐩綍銆傜姸鎬佸寘鍚搷浣滅紪鍙枫€侀樁娈点€侀獙璇佸拰鎭㈠缁撴灉銆傞渶瑕?Node >=22.13.0 鍙婂彲鐢ㄧ殑 node:sqlite銆?
