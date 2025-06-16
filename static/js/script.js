// alert("我们这的憋佬仔\n脖上喜欢挂玉牌\n香炉供台上摆\n长大才开白黄牌\n虔诚拜三拜\n钱包里多几百\n易的是六合彩\n难的是等河牌\n来财，来\n上北下南左西右东\n东南东北\n西北西南\n步步高升\n八方来财\n四海为家家兴旺\n百事可乐\n千事吉祥\n万事如意\n顺风顺水\n天道酬勤\n鹏程万里\n宗旨利滚利\n对应， 好运， 八方来\n来，来财\n散了才能聚\n你不出手？\n说聊斋")

//来财，来，来财

var LANGUAGES = {
    "_": { defaultLanguage: "cn", defaultVOLanguage: "cn", defaultSpeed: 20, defaultRandmo: "on" },
    
    "cn": {
        audioList: [
            "static/audio/cn/lc.wav",
            "static/audio/cn/l.wav",
            "static/audio/cn/blz.wav",
            "static/audio/cn/ck.wav",
            "static/audio/cn/yly.wav",
            "static/audio/cn/dzht.wav"
        ],
        texts: {
            "page-title": "八方来财",
            "doc-title": "八方来财 - 鳖佬仔，挂玉牌，拜三拜，来财！",
            "page-descriptions": "鳖佬仔，挂玉牌，拜三拜，好运八方来，来财，来，来财",
            "counter-descriptions": ["八方来财", "天降横财", "来，来财！", "财从八方来"],
            "counter-unit": ["来财", "虔诚拜三拜", ],
            "counter-button": ["拜三拜", "来财"],
            "show-credits-text": "查看感谢页",
            "repository-desc": "源代码",
            "options-txt-vo-lang": "语音语言",
            "options-txt-random_speed": "随机速度",
            "options-txt-speed": "速度",
            "options-txt-lang": "界面语言",
            "dialogs-close": "关闭",
        },
    }, 
    
};

const progress = [0, 1];

(() => {
    const $ = mdui.$;

    // 初始化 cachedObjects 变量用于存储已缓存的对象URL
    var cachedObjects = {};

    // 尝试缓存静态对象，如果已缓存则直接返回，否则异步获取并缓存
    function cacheStaticObj(origUrl) {
        if (cachedObjects[origUrl]) {
            return cachedObjects[origUrl];
        } else {
            setTimeout(() => {
                fetch("static/" + origUrl)
                    .then((response) => response.blob())
                    .then((blob) => {
                        const blobUrl = URL.createObjectURL(blob);
                        cachedObjects[origUrl] = blobUrl;
                    })
                    .catch((error) => {
                        console.error(`Error caching object from ${origUrl}: ${error}`);
                    });
            }, 1);
            return origUrl;
        }
    }

    let firstSquish = true;

    // 获取本地存储的语言设置，如果没有则使用默认值
    var current_language = localStorage.getItem("lang") || LANGUAGES._.defaultLanguage;
    var current_vo_language = localStorage.getItem("volang") || LANGUAGES._.defaultVOLanguage;
    var current_speed = localStorage.getItem("speed") || LANGUAGES._.defaultSpeed;
    var current_random_type = localStorage.getItem("random") || LANGUAGES._.defaultRandmo;

    // 获取本地化文本，支持回退到英文
    function getLocalText(textId, language = null, fallback = true) {
        let curLang = LANGUAGES[language || current_language];
        let localTexts = curLang.texts;
        if (localTexts[textId] != undefined) {
            let value = localTexts[textId];
            if (value instanceof Array) {
                return randomChoice(value); // if there are multiple translations available for this text id, it randomly selects one of them and returns it.
            } else {
                return value;
            }
        }
        if (fallback) return getLocalText(textId, language = "en", fallback = false);
        else return null;
    }

    // 更新页面所有相关文本为当前选择的语言
    function multiLangMutation() {
        let curLang = LANGUAGES[current_language];
        let localTexts = curLang.texts;
        Object.entries(localTexts).forEach(([textId, value]) => {
            if (!(value instanceof Array))
                if (document.getElementById(textId) != undefined)
                    document.getElementById(textId).innerHTML = value; // replaces the innerHTML of the element with the given textId with its translated version.
        });
        refreshDynamicTexts()
    }

    multiLangMutation() // 页面加载时立即调用多语言替换函数

    // 获取当前语音语言的音频列表
    function getLocalAudioList() {
        return LANGUAGES[current_vo_language].audioList;
    }

    // 获取本地计数器元素并初始化
    const localCounter = document.querySelector('#local-counter');
    let localCount = localStorage.getItem('count-v2') || 0;

    // 显示计数器
    localCounter.textContent = localCount.toLocaleString('en-US');

    // 初始化计数按钮并添加事件监听
    const counterButton = document.querySelector('#counter-button');

    // 预加载音频并转为Base64
    async function convertMp3FilesToBase64(dict) {
        const promises = [];
        for (const lang in dict) {
            if (dict.hasOwnProperty(lang)) {
                const audioList = dict[lang].audioList;
                if (Array.isArray(audioList)) {
                    for (let i = 0; i < audioList.length; i++) {
                        const url = audioList[i];
                        if (typeof url === "string" && url.endsWith(".mp3")) {
                            promises.push(loadAndEncode("static/" + url).then(result => dict[lang].audioList[i] = result));
                        }
                    }
                }
            }
        }
        progress[1] = promises.length
        await Promise.all(promises);
        return dict;
    }

    // 更新进度条显示
    function upadteProgress() {
        progress[0] += 1
        counterButton.innerText = `${((progress[0] / progress[1]) * 100) | 0}%`
    }

    // 加载并编码音频为Base64
    function loadAndEncode(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function () {
                upadteProgress()
                if (xhr.status === 200) {
                    const buffer = xhr.response;
                    const blob = new Blob([buffer], { type: "audio/mpeg" });
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = function () {
                        const base64data = reader.result;
                        resolve(base64data);
                    }
                } else {
                    reject(xhr.statusText);
                }
            };
            xhr.onerror = function () {
                upadteProgress()
                reject(xhr.statusText);
            };
            xhr.send();
        });
    }

    // 添加计数按钮点击事件
    function addBtnEvent() {
        // 新增：背景音乐播放器，仅首次点击时自动播放
        let bgmStarted = false;
        let bgmAudio = null;

        counterButton.addEventListener('click', (e) => {
            // 自动播放背景音乐
            if (!bgmStarted) {
                bgmStarted = true;
                bgmAudio = new Audio('static/audio/bgm.mp3'); // 请确保此路径下有bgm.mp3
                bgmAudio.volume = 0.5;
                bgmAudio.loop = true;
                // 兼容部分浏览器策略
                bgmAudio.play().catch(() => {});
            }
            localCount++;
            localCounter.textContent = localCount.toLocaleString('en-US');
            localStorage.setItem('count-v2', localCount);
            triggerRipple(e);
            playKuru();
            animateHerta();
            refreshDynamicTexts();
        });
    }

    window.onload = function () {
        // 页面加载后，预加载音频并初始化按钮事件
        convertMp3FilesToBase64(LANGUAGES)
            .catch(error => {
                console.error(error);
            })
            .finally(() => {
                refreshDynamicTexts();
                addBtnEvent();
                document.getElementById('loading').remove()
            });
    }

    // 缓存动画图片
    cacheStaticObj("img/lc/1.png");
    cacheStaticObj("img/lc/2.png");

    // 从数组中随机选取一个元素
    function randomChoice(myArr) {
        const randomIndex = Math.floor(Math.random() * myArr.length);
        const randomItem = myArr[randomIndex];
        return randomItem;
    }

    // 随机打乱数组顺序（Fisher-Yates算法）
    function randomShuffle(myArr) {
        for (let i = myArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [myArr[i], myArr[j]] = [myArr[j], myArr[i]];
        }
        return myArr;
    }

    // 获取随机音频URL
    function getRandomAudioUrl() {
        var localAudioList = getLocalAudioList();
        if (current_vo_language == "ja") {
            const randomIndex = Math.floor(Math.random() * 2) + 1;
            return localAudioList[randomIndex];
        }
        const randomIndex = Math.floor(Math.random() * localAudioList.length);
        return localAudioList[randomIndex];
    }

    // 播放音频
    function playKuru() {
        let audioUrl;
        if (firstSquish) {
            firstSquish = false;
            audioUrl = getLocalAudioList()[0];
        } else {
            audioUrl = getRandomAudioUrl();
        }
        let audio = new Audio();//cacheStaticObj(audioUrl));
        audio.src = audioUrl;
        audio.play();
        audio.addEventListener("ended", function () {
            this.remove();
        });
    }

    // 动画效果：黑塔图片从右向左移动
    function animateHerta() {
        let id = null;
        const random = Math.floor(Math.random() * 2) + 1;
        const elem = document.createElement("img");
        let RunSpeed = Math.floor(current_speed);
        elem.src = cacheStaticObj(`img/lc/${random}.png`);
        elem.style.position = "absolute";
        elem.style.right = "-500px";
        elem.style.top = counterButton.getClientRects()[0].bottom + scrollY - 430 + "px"
        elem.style.zIndex = "-10";
        document.body.appendChild(elem);

        if (current_random_type == "on") {
            if (window.innerWidth >= 1280) {
                const randomSpeed = Math.floor(Math.random() * 30) + 20;
                const ReversalSpeed = Math.floor(randomSpeed);
                RunSpeed = Math.floor(randomSpeed);
            } else {
                const randomSpeed = Math.floor(Math.random() * 40) + 50;
                const ReversalSpeed = 100 - Math.floor(randomSpeed);
                RunSpeed = Math.floor(window.innerWidth / ReversalSpeed);
            }
        } else {
            const ReversalSpeed = 100 - Math.floor(current_speed);
            RunSpeed = Math.floor(window.innerWidth / ReversalSpeed);
        }

        let pos = -500;
        const limit = window.innerWidth + 500;
        clearInterval(id);
        id = setInterval(() => {
            if (pos >= limit) {
                clearInterval(id);
                elem.remove()
            } else {
                pos += RunSpeed;
                elem.style.right = pos + 'px';
            }
        }, 12);
    }

    // 按钮点击涟漪效果
    function triggerRipple(e) {
        let ripple = document.createElement("span");

        ripple.classList.add("ripple");

        const counter_button = document.getElementById("counter-button");
        counter_button.appendChild(ripple);

        let x = e.clientX - e.target.offsetLeft;
        let y = e.clientY - e.target.offsetTop;

        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        setTimeout(() => {
            ripple.remove();
        }, 300);
    }

    // 刷新所有动态文本（如多种描述等）
    function refreshDynamicTexts() {
        if (progress[0] !== progress[1]) return;
        let curLang = LANGUAGES[current_language];
        let localTexts = curLang.texts;
        Object.entries(localTexts).forEach(([textId, value]) => {
            if (value instanceof Array)
                if (document.getElementById(textId) != undefined)
                    document.getElementById(textId).innerHTML = randomChoice(value);
        });
    }

    // NOTE Github pages 部署已废弃，相关跳转已注释
    // if (location.hostname.endsWith("duiqt.github.io")) {
    //     window.location.href = "https://herta.onrender.com";
    // }

    // 生成bilibili图标SVG
    function bilibiliIcon(color) {
        return `<i class="mdui-list-item-icon mdui-icon">
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" style="fill: ${color};">
        <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path d="M488.6 104.1C505.3 122.2 513 143.8 511.9 169.8V372.2C511.5 398.6 502.7 420.3 485.4 437.3C468.2 454.3 446.3 463.2 419.9 464H92.02C65.57 463.2 43.81 454.2 26.74 436.8C9.682 419.4 .7667 396.5 0 368.2V169.8C.7667 143.8 9.682 122.2 26.74 104.1C43.81 87.75 65.57 78.77 92.02 78H121.4L96.05 52.19C90.3 46.46 87.42 39.19 87.42 30.4C87.42 21.6 90.3 14.34 96.05 8.603C101.8 2.868 109.1 0 117.9 0C126.7 0 134 2.868 139.8 8.603L213.1 78H301.1L375.6 8.603C381.7 2.868 389.2 0 398 0C406.8 0 414.1 2.868 419.9 8.603C425.6 14.34 428.5 21.6 428.5 30.4C428.5 39.19 425.6 46.46 419.9 52.19L394.6 78L423.9 78C450.3 78.77 471.9 87.75 488.6 104.1H488.6zM449.8 173.8C449.4 164.2 446.1 156.4 439.1 150.3C433.9 144.2 425.1 140.9 416.4 140.5H96.05C86.46 140.9 78.6 144.2 72.47 150.3C66.33 156.4 63.07 164.2 62.69 173.8V368.2C62.69 377.4 65.95 385.2 72.47 391.7C78.99 398.2 86.85 401.5 96.05 401.5H416.4C425.6 401.5 433.4 398.2 439.7 391.7C446 385.2 449.4 377.4 449.8 368.2L449.8 173.8zM185.5 216.5C191.8 222.8 195.2 230.6 195.6 239.7V273C195.2 282.2 191.9 289.9 185.8 296.2C179.6 302.5 171.8 305.7 162.2 305.7C152.6 305.7 144.7 302.5 138.6 296.2C132.5 289.9 129.2 282.2 128.8 273V239.7C129.2 230.6 132.6 222.8 138.9 216.5C145.2 210.2 152.1 206.9 162.2 206.5C171.4 206.9 179.2 210.2 185.5 216.5H185.5zM377 216.5C383.3 222.8 386.7 230.6 387.1 239.7V273C386.7 282.2 383.4 289.9 377.3 296.2C371.2 302.5 363.3 305.7 353.7 305.7C344.1 305.7 336.3 302.5 330.1 296.2C323.1 289.9 320.7 282.2 320.4 273V239.7C320.7 230.6 324.1 222.8 330.4 216.5C336.7 210.2 344.5 206.9 353.7 206.5C362.9 206.9 370.7 210.2 377 216.5H377z"/>
        </svg>
        </i>`;
    }

    // 生成头像（带社交链接）
    function addAvatar(socialLink, currentIcon) {
        if (!currentIcon.includes('https://')) {
            currentIcon = 'static/credits/' + currentIcon;
        }
        let avatar = `<img src="${currentIcon}"/>`;
        if (socialLink == '') return avatar;
        return `<a href="${socialLink}" target="_blank">${avatar}</a>`;
    }

    // 显示设置弹窗（圆角简约风格）
    function showOptions() {
        if (document.getElementById('custom-options-dialog')) return;

        // 弹窗遮罩
        const dialog = document.createElement('div');
        dialog.id = 'custom-options-dialog';
        dialog.style.position = 'fixed';
        dialog.style.left = '0';
        dialog.style.top = '0';
        dialog.style.width = '100vw';
        dialog.style.height = '100vh';
        dialog.style.background = 'rgba(0,0,0,0.18)';
        dialog.style.zIndex = '9999';
        dialog.style.display = 'flex';
        dialog.style.alignItems = 'center';
        dialog.style.justifyContent = 'center';

        // 弹窗内容
        const content = document.createElement('div');
        content.style.background = '#fff';
        content.style.borderRadius = '18px';
        content.style.padding = '32px 28px 24px 28px';
        content.style.minWidth = '320px';
        content.style.maxWidth = '92vw';
        content.style.boxShadow = '0 6px 32px 0 rgba(0,0,0,0.10)';
        content.style.display = 'flex';
        content.style.flexDirection = 'column';
        content.style.gap = '18px';
        content.style.fontFamily = 'system-ui, sans-serif';

        // 通用行样式
        function makeRow(inner) {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.gap = '12px';
            row.innerHTML = inner;
            return row;
        }

        // 语言选项
        const langRow = makeRow(`
            <label id="options-txt-lang" style="flex:1; font-size:15px; color:#333;">${getLocalText('options-txt-lang')}</label>
            <select id="language-selector" style="flex:2; border-radius:8px; border:1px solid #e0e0e0; padding:7px 12px; font-size:15px; background:#f7f7fa;">
                <option value="cn">简体中文</option>
            </select>
        `);

        // VO语言选项
        const voRow = makeRow(`
            <label id="options-txt-vo-lang" style="flex:1; font-size:15px; color:#333;">${getLocalText('options-txt-vo-lang')}</label>
            <select id="vo-language-selector" style="flex:2; border-radius:8px; border:1px solid #e0e0e0; padding:7px 12px; font-size:15px; background:#f7f7fa;">
                <option value="cn">中文</option>
            </select>
        `);

        // 随机速度选项
        const randomRow = makeRow(`
            <label id="options-txt-random_speed" style="flex:1; font-size:15px; color:#333;">${getLocalText('options-txt-random_speed')}</label>
            <select id="random-speed-type" style="flex:2; border-radius:8px; border:1px solid #e0e0e0; padding:7px 12px; font-size:15px; background:#f7f7fa;">
                <option value="off">OFF</option>
                <option value="on">ON</option>
            </select>
        `);

        // 速度滑块
        const speedRow = makeRow(`
            <label id="options-txt-speed" style="flex:1; font-size:15px; color:#333;">${getLocalText('options-txt-speed')}</label>
            <input type="range" step="1" min="0" max="95" id="speed-progress-bar" style="flex:2; margin-left:8px; accent-color:#1976d2; border-radius:8px; height:4px; background:#e0e0e0;" />
        `);

        // 关于按钮
        const aboutBtn = document.createElement('button');
        aboutBtn.textContent = '关于';
        aboutBtn.style.margin = '18px 8px 0 0';
        aboutBtn.style.display = 'inline-block';
        aboutBtn.style.padding = '10px 24px';
        aboutBtn.style.background = '#e0e0e0';
        aboutBtn.style.color = '#333';
        aboutBtn.style.border = 'none';
        aboutBtn.style.borderRadius = '22px';
        aboutBtn.style.fontSize = '16px';
        aboutBtn.style.fontWeight = '500';
        aboutBtn.style.letterSpacing = '1px';
        aboutBtn.style.boxShadow = '0 2px 8px 0 rgba(25,118,210,0.04)';
        aboutBtn.style.cursor = 'pointer';
        aboutBtn.onmouseover = () => aboutBtn.style.background = '#d0d0d0';
        aboutBtn.onmouseout = () => aboutBtn.style.background = '#e0e0e0';
        aboutBtn.onclick = function () {
            window.alert('八方来财：\nhttps://github.com/FlyingIce000/laicai\n\n原项目：\nhttps://github.com/duiqt/herta_kuru\n\n本站仅供娱乐，禁止用于商业用途。\n若您认为本站侵犯了您的合法权益，请联系ceo@xxidc.top🙏');
        };

        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.textContent = getLocalText('dialogs-close');
        closeBtn.style.margin = '18px auto 0 auto';
        closeBtn.style.display = 'inline-block';
        closeBtn.style.padding = '10px 36px';
        closeBtn.style.background = '#1976d2';
        closeBtn.style.color = '#fff';
        closeBtn.style.border = 'none';
        closeBtn.style.borderRadius = '22px';
        closeBtn.style.fontSize = '16px';
        closeBtn.style.fontWeight = '500';
        closeBtn.style.letterSpacing = '1px';
        closeBtn.style.boxShadow = '0 2px 8px 0 rgba(25,118,210,0.08)';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onmouseover = () => closeBtn.style.background = '#1565c0';
        closeBtn.onmouseout = () => closeBtn.style.background = '#1976d2';

        // 按钮行
        const btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.justifyContent = 'center';
        btnRow.style.gap = '8px';
        btnRow.appendChild(aboutBtn);
        btnRow.appendChild(closeBtn);

        // 组装内容
        content.appendChild(langRow);
        content.appendChild(voRow);
        content.appendChild(randomRow);
        content.appendChild(speedRow);
        content.appendChild(btnRow);
        dialog.appendChild(content);
        document.body.appendChild(dialog);

        // 设置初始值
        document.getElementById('language-selector').value = current_language;
        document.getElementById('vo-language-selector').value = current_vo_language;
        document.getElementById('random-speed-type').value = current_random_type;
        document.getElementById('speed-progress-bar').value = current_speed;

        // 随机速度控制滑块可用性
        function updateSliderState() {
            const slider = document.getElementById('speed-progress-bar');
            if (document.getElementById('random-speed-type').value === 'on') {
                slider.disabled = true;
                slider.style.opacity = '0.5';
            } else {
                slider.disabled = false;
                slider.style.opacity = '1';
            }
        }
        updateSliderState();

        // 事件绑定
        document.getElementById('language-selector').addEventListener('change', (ev) => {
            current_language = ev.target.value;
            localStorage.setItem('lang', ev.target.value);
            multiLangMutation();
        });
        document.getElementById('vo-language-selector').addEventListener('change', (ev) => {
            current_vo_language = ev.target.value;
            localStorage.setItem('volang', ev.target.value);
        });
        document.getElementById('random-speed-type').addEventListener('change', (ev) => {
            current_random_type = ev.target.value;
            localStorage.setItem('random', ev.target.value);
            updateSliderState();
        });
        document.getElementById('speed-progress-bar').addEventListener('change', (ev) => {
            current_speed = ev.target.value;
            localStorage.setItem('speed', ev.target.value);
        });

        // 关闭弹窗
        closeBtn.onclick = function () {
            dialog.remove();
        };
        // 点击遮罩关闭
        dialog.onclick = function (e) {
            if (e.target === dialog) dialog.remove();
        };
    }

    $("#show-options-opt").on("click", () => showOptions())
})();

// 雪花飘落效果（随机图片、🕯️、💰符号）
const snowflakeCount = 20;
function randomBetween(a, b) {
    return Math.random() * (b - a) + a;
}
function createSnowflake() {
    // 随机选择内容：图片、🕯️、💰
    const types = [
        { type: 'img', src: 'static/img/ll.png' },
        { type: 'emoji', char: '🕯️' },
        { type: 'emoji', char: '💰' }
    ];
    const pick = types[Math.floor(Math.random() * types.length)];

    let snowflake;
    if (pick.type === 'img') {
        snowflake = document.createElement('img');
        snowflake.src = pick.src;
    } else {
        snowflake = document.createElement('span');
        snowflake.textContent = pick.char;
        snowflake.style.fontSize = '30px'; // 固定为30px
        snowflake.style.fontFamily = 'system-ui,apple color emoji,Segoe UI Emoji,NotoColorEmoji,Segoe UI Symbol,Android Emoji,EmojiSymbols';
    }

    snowflake.style.position = 'fixed';
    snowflake.style.zIndex = 9999;
    snowflake.style.pointerEvents = 'none';

    // 判断是否为PC端或大屏幕设备
    let minSize = 60, maxSize = 80;
    if (window.innerWidth >= 1024) {
        minSize = 100;
        maxSize = 150;
    }
    const size = randomBetween(minSize, maxSize);
    if (pick.type === 'img') {
        snowflake.style.width = size + 'px';
    } // emoji 固定30px，不再设置
    snowflake.style.opacity = randomBetween(0.7, 1);
    snowflake.style.left = randomBetween(0, window.innerWidth - (pick.type === 'img' ? size : 50)) + 'px';
    snowflake.style.top = '-60px';
    snowflake.style.transition = 'top linear, left linear, opacity linear';
    document.body.appendChild(snowflake);

    const duration = randomBetween(2, 3); // seconds
    const endLeft = parseFloat(snowflake.style.left) + randomBetween(-100, 100);
    setTimeout(() => {
        snowflake.style.transition = `top ${duration}s linear, left ${duration}s linear, opacity ${duration}s linear`;
        snowflake.style.top = window.innerHeight + 60 + 'px';
        snowflake.style.left = Math.max(0, Math.min(window.innerWidth - (pick.type === 'img' ? size : 30), endLeft)) + 'px';
        snowflake.style.opacity = 0.5;
    }, 50);

    setTimeout(() => {
        snowflake.remove();
    }, duration * 1000 + 1000);
}
setInterval(() => {
    if (document.hidden) return;
    createSnowflake();
}, 500);
// 初始生成几片
for (let i = 0; i < snowflakeCount; i++) {
    setTimeout(createSnowflake, i * 1000);
}

// --- 新增：定时旋转图片特效 ---
function showRotatingImage() {
    const img = document.createElement('img');
    img.src = 'static/img/ll2.png'; // 可替换为任意图片
    img.style.position = 'fixed';
    img.style.zIndex = 9999;
    img.style.pointerEvents = 'none';
    img.style.transition = 'opacity 0.3s, transform 0.3s';
    img.style.opacity = '0';

    // 判断是否为PC端或大屏幕设备
    let size = 180;
    if (window.innerWidth >= 1024) {
        size = 500;
    }

    if (window.innerWidth >= 760 || window.innerWidth < 1024) {
        size = 300;
    }

    img.style.width = size + 'px';
    img.style.height = size + 'px';

    // 随机位置
    const left = Math.random() * (window.innerWidth - size - 20);
    const top = Math.random() * (window.innerHeight - size - 20);
    img.style.left = left + 'px';
    img.style.top = top + 'px';

    // 初始旋转角度
    img.style.transform = 'rotate(0deg) scale(0.7)';

    document.body.appendChild(img);

    // 出现动画
    setTimeout(() => {
        img.style.opacity = '1';
        img.style.transform = 'rotate(0deg) scale(1)';
    }, 10);

    // 旋转动画
    setTimeout(() => {
        img.style.transition = 'transform 1.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s';
        img.style.transform = 'rotate(360deg) scale(1.1)';
    }, 300);

    // 消失动画
    setTimeout(() => {
        img.style.opacity = '0';
        img.style.transform = 'rotate(360deg) scale(0.7)';
    }, 1700);

    // 移除节点
    setTimeout(() => {
        img.remove();
    }, 2000);
}

showRotatingImage();
// 每3秒触发一次
setInterval(showRotatingImage, 3000);

