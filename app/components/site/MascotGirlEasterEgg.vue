<script setup>
import { computed, inject, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, watch } from 'vue'

const eggImage = '/images/egg.png'
const DEFAULT_LANGUAGE = 'zh'
const LANGUAGE_STORAGE_KEY = 'atriSiteLanguage'
const DAILY_MOTIVATION_KEY = 'mascot_daily_motivation'
const DAILY_MOTIVATION_LOCK_MS = 24 * 60 * 60 * 1000

const translations = {
  "zh": {
    "mascot.imageAlt": "看板娘隐藏彩蛋",
    "mascot.qa.title": "看板娘问答",
    "mascot.tip.default": "输入问题后，看板娘会根据问题库回答你喵。",
    "mascot.lastQuestion": "上次问：",
    "mascot.placeholder": "输入问题问问看板娘喵...",
    "mascot.submit": "提问",
    "mascot.error": "这个问题不对劲喵，重新再组织语言谢谢喵",
    "mascot.answered": "已回答：{question}",
    "mascot.daily.prefix": "今日份励志文案：{text}",
    "mascot.daily.locked": "今日份励志文案已经领取过啦喵，剩余 {time} 后再来领取。",
    "mascot.time.minutes": "{minutes} 分钟",
    "mascot.time.hours": "{hours} 小时",
    "mascot.time.hoursMinutes": "{hours} 小时 {minutes} 分钟",
    "mascot.quickQuestions": [
      "今日份励志文案",
      "网站有什么内容？",
      "商品怎么买？",
      "故事怎么看？",
      "你是谁？",
      "夸夸我"
    ],
    "mascot.floatingLines": [
      "你发现我啦喵~",
      "欢迎来到隐藏区域。",
      "这里是新闻之后的小彩蛋。",
      "别急，慢慢往下看。",
      "今天也要继续前进。",
      "页面还没结束哦。",
      "要不要再往下看看？",
      "这个网站正在变得更有趣。",
      "蓝色的回忆正在闪闪发光。",
      "你能看到这些随机出现的文字吗？",
      "这里可以放你想写的角色台词。",
      "后面可以换成更有角色感的文案。",
      "这是一段属于看板娘的小空间。",
      "如果你看到这里，说明你真的认真逛了网站。",
      "隐藏彩蛋启动中……",
      "请保持好奇心。",
      "今天的风也很温柔。",
      "慢慢看，不用着急。",
      "我会一直在这里等你。",
      "欢迎回来。",
      "这里藏着一点点蓝色的小惊喜。",
      "如果觉得页面太安静，就让我来说几句话吧。",
      "继续探索吧，后面也许还有东西。",
      "这不是普通模块，是隐藏彩蛋喵。",
      "你已经解锁了看板娘区域。"
    ],
    "mascot.dailyKeywords": [
      "今日份励志文案",
      "今日励志文案",
      "今日份文案",
      "每日励志文案",
      "每日文案",
      "励志文案",
      "给我一句励志文案",
      "来一句励志文案",
      "今天的文案",
      "今天鼓励我",
      "每日鼓励",
      "今日鼓励"
    ],
    "mascot.shyKeywords": [
      "我喜欢你",
      "喜欢你",
      "我爱你",
      "爱你",
      "好喜欢你",
      "超喜欢你",
      "最喜欢你",
      "我想你",
      "想你",
      "抱抱",
      "要抱抱",
      "抱一下",
      "贴贴",
      "要贴贴",
      "亲亲",
      "亲一下",
      "亲爱的",
      "么么哒",
      "啵啵",
      "mua",
      "陪陪我",
      "你陪我",
      "你真可爱",
      "你可爱",
      "看板娘好可爱",
      "喜欢看板娘",
      "你是我的",
      "心动",
      "脸红",
      "害羞",
      "老婆",
      "老公",
      "宝宝",
      "宝贝",
      "小宝",
      "小宝宝",
      "小宝贝",
      "宝",
      "乖宝",
      "宝宝在吗",
      "宝贝在吗",
      "叫我宝宝",
      "叫我宝贝",
      "喊我宝宝",
      "喊我宝贝",
      "做我宝宝",
      "做我宝贝",
      "❤",
      "♥",
      "💕",
      "💗",
      "💖",
      "💘"
    ],
    "mascot.casualKeywords": [
      "嘿嘿",
      "嘿嘿嘿",
      "哈哈",
      "哈哈哈",
      "哈哈哈哈",
      "嘻嘻",
      "嘻嘻嘻",
      "呵呵",
      "哼哼",
      "嗯嗯",
      "嗯",
      "啊",
      "啊啊",
      "哦",
      "哦哦",
      "嗷",
      "嗷嗷",
      "呜呜",
      "哇",
      "哇哦",
      "芜湖",
      "诶嘿",
      "欸嘿",
      "嘿",
      "哈",
      "嘻",
      "hhh",
      "hhhh",
      "haha",
      "hahaha",
      "lol"
    ],
    "mascot.dailyMotivationLines": [
      "今天也要一点点靠近更好的自己喵。",
      "不用一下子变厉害，今天比昨天多前进一步就很棒喵。",
      "慢慢来，真正厉害的人都是一点点练出来的喵。",
      "不要因为暂时做不好就否定自己，你正在成长喵。",
      "今天完成一个小目标，也算是很了不起的胜利喵。",
      "别怕慢，怕的是停下来喵。",
      "你现在遇到的困难，以后都会变成经验喵。",
      "把复杂的问题拆小，一步一步就能解决喵。",
      "今天也辛苦了，但你真的有在变强喵。",
      "不要急着和别人比，先赢过昨天的自己喵。",
      "能坚持修改到现在，说明你已经很认真了喵。",
      "网页是一点点做出来的，能力也是一点点长出来的喵。",
      "先完成，再变好，这是很重要的成长方法喵。",
      "今天也请相信自己一次喵。",
      "哪怕只进步一点点，也是在往前走喵。",
      "你不是不会，只是还在学的路上喵。",
      "遇到 bug 不代表失败，解决它才是升级喵。",
      "现在的努力，以后都会变成你的底气喵。",
      "把今天该做的做好，就已经很厉害了喵。",
      "不要怕代码改坏，真正的理解都是改出来的喵。"
    ],
    "mascot.shyAnswers": [
      "诶、突然这么说……我会害羞的啦喵 ♥",
      "喜、喜欢什么的……不要突然说出来啦喵 ❤",
      "心跳好像有点变快了喵……笨蛋，别一直盯着我看啦 ♥",
      "我、我才没有很开心呢……只是脸有点热喵 ❤",
      "收到你的喜欢了喵……那我也会更努力陪在这里的 ♥",
      "这句话太犯规了喵……看板娘要脸红了 ❤",
      "呜……这种话要小声一点说啦喵 ♥",
      "我听到了喵……不过再说一次的话，我可能会更害羞 ❤",
      "宝宝什么的……这样叫我会很害羞的啦喵 ♥",
      "宝、宝贝？你突然这么叫，我会不知道怎么回答的喵 ❤",
      "不许突然叫这么亲密啦……看板娘要脸红了喵 ♥",
      "你这样说，我会忍不住偷偷开心一下的喵 ❤",
      "贴贴可以先欠着喵……现在、现在先好好逛网站啦 ♥",
      "么么哒什么的太犯规了喵……我听到了哦 ❤",
      "呜哇，今天的你有点会说话喵 ♥",
      "再这样叫我，我就真的要变成粉红色了喵 ❤"
    ],
    "mascot.casualAnswers": [
      "嘿嘿，感觉你心情不错喵。",
      "哈哈，笑出来就很好喵。",
      "嘻嘻，我也跟着开心起来了喵。",
      "收到你的语气词了喵，气氛突然轻松了一点。",
      "嗯嗯，我在听喵。",
      "哇哦，感觉你发现了什么有趣的东西喵。",
      "不用这么严肃也可以喵，慢慢玩就好。",
      "这个语气我接住了喵，要不要继续问我点什么？"
    ],
    "mascot.punctuation.question": [
      "你是在疑惑什么喵？可以把问题说完整一点。",
      "好多问号喵，是不是有哪里没看懂？",
      "疑问收到喵，不过你可以把想问的内容也打出来。",
      "只有问号的话，我只能感觉到你很疑惑喵。"
    ],
    "mascot.punctuation.exclamation": [
      "情绪收到喵！不过可以再告诉我你想表达什么。",
      "哇，好强烈的感叹喵！",
      "你看起来很激动喵，是发生什么了吗？",
      "感叹号我收到了喵，但还缺一点具体内容。"
    ],
    "mascot.punctuation.ellipsis": [
      "你突然沉默了喵，是不是在思考什么问题？",
      "这个省略号有点意味深长喵。",
      "沉默也是一种表达喵，不过我还是想听你说完整。",
      "你是不是想说什么但还没组织好语言喵？"
    ],
    "mascot.punctuation.wave": [
      "这个语气有点软软的喵，有问题可以直接问我。",
      "波浪号收到喵，感觉语气变轻了。",
      "你这个语气好像在撒娇喵。",
      "软乎乎的符号出现了喵。"
    ],
    "mascot.punctuation.comma": [
      "这个停顿有点突然喵，后面的话也说出来吧。",
      "你是不是还没说完喵？",
      "逗号后面应该还有内容喵。",
      "这个停顿我接住了喵，请继续。"
    ],
    "mascot.punctuation.colon": [
      "像是要补充说明了喵，请继续说下去。",
      "冒号后面应该还有重点内容喵。",
      "你是不是准备解释什么喵？",
      "这个符号像是在铺垫下一句话喵。"
    ],
    "mascot.punctuation.quote": [
      "你是不是想引用什么内容喵？可以把文字也发给我。",
      "引号出现了喵，但是里面还没有内容。",
      "是不是想说一句台词喵？",
      "我看到引号了喵，可以把要引用的话补上。"
    ],
    "mascot.punctuation.bracket": [
      "括号里好像还缺点内容喵，把想说的话写进去吧。",
      "空括号有点神秘喵，里面准备放什么？",
      "你是不是想补充说明什么喵？",
      "括号出现了，但内容还没出现喵。"
    ],
    "mascot.punctuation.dash": [
      "这条线有点神秘喵，是不是想分隔什么内容？",
      "横线出现了喵，看起来像分割线。",
      "你是不是想做一个停顿效果喵？",
      "这道线我看见了喵，但我还没看见问题。"
    ],
    "mascot.punctuation.default": [
      "我收到你发来的「{input}」了喵，不过可以再加一点文字让我更好理解。",
      "这个符号「{input}」有点特别喵，但我还需要更多内容。",
      "只发「{input}」的话，我只能猜到你在表达情绪喵。",
      "符号收到喵，不过要是能补一句话，我就更好回答了。"
    ]
  },
  "en": {
    "mascot.imageAlt": "Mascot easter egg",
    "mascot.qa.title": "Mascot Q&A",
    "mascot.tip.default": "Type a question, and the mascot will answer from the question bank.",
    "mascot.lastQuestion": "Last asked: ",
    "mascot.placeholder": "Ask the mascot something...",
    "mascot.submit": "Ask",
    "mascot.error": "This question feels unclear. Please rephrase it and try again.",
    "mascot.answered": "Answered: {question}",
    "mascot.daily.prefix": "Today’s motivation: {text}",
    "mascot.daily.locked": "You have already received today’s motivation. Come back in {time}.",
    "mascot.time.minutes": "{minutes} min",
    "mascot.time.hours": "{hours} hr",
    "mascot.time.hoursMinutes": "{hours} hr {minutes} min",
    "mascot.quickQuestions": [
      "Today’s motivation",
      "What is on this site?",
      "How do I buy merch?",
      "How do I view the story?",
      "Who are you?",
      "Encourage me"
    ],
    "mascot.floatingLines": [
      "You found me!",
      "Welcome to the hidden area.",
      "This is the little easter egg after the news section.",
      "Take your time and keep scrolling.",
      "Let’s keep moving forward today.",
      "The page is not over yet.",
      "Want to look further down?",
      "This website is becoming more interesting.",
      "The blue memories are sparkling.",
      "Can you see these random messages?",
      "You can place character lines here later.",
      "This is a small space for the mascot.",
      "If you reached this point, you really explored the site.",
      "Hidden easter egg activated...",
      "Please stay curious.",
      "The wind feels gentle today.",
      "No rush. Look around slowly.",
      "I will always be waiting here.",
      "Welcome back.",
      "A tiny blue surprise is hidden here.",
      "If the page feels too quiet, let me say something.",
      "Keep exploring. There may be more ahead.",
      "This is not an ordinary module. It is a hidden easter egg.",
      "You have unlocked the mascot area."
    ],
    "mascot.dailyKeywords": [
      "today motivation",
      "daily motivation",
      "motivation",
      "encourage me",
      "give me motivation",
      "today quote",
      "daily quote"
    ],
    "mascot.shyKeywords": [
      "i like you",
      "like you",
      "i love you",
      "love you",
      "miss you",
      "hug",
      "kiss",
      "cute",
      "you are cute",
      "mascot is cute",
      "heart",
      "baby",
      "dear",
      "mua",
      "❤",
      "♥",
      "💕",
      "💗",
      "💖",
      "💘"
    ],
    "mascot.casualKeywords": [
      "hehe",
      "haha",
      "hahaha",
      "lol",
      "hi",
      "hello",
      "wow",
      "hmm",
      "yeah",
      "yay",
      "hey"
    ],
    "mascot.dailyMotivationLines": [
      "Move a little closer to your better self today.",
      "You do not have to become great all at once. One step is already progress.",
      "Take your time. Real skill is built slowly.",
      "Do not deny yourself just because today feels hard. You are growing.",
      "Finishing one small goal today is already a win.",
      "Do not fear being slow. Fear stopping.",
      "The problems you meet now will become experience later.",
      "Break complex things down, and solve them step by step.",
      "You worked hard today, and you are getting stronger.",
      "Do not rush to compare with others. First beat yesterday’s self.",
      "The fact that you kept improving this site shows real effort.",
      "Websites are built step by step, and so are skills.",
      "Finish first, improve later. That is a powerful way to grow.",
      "Trust yourself once today.",
      "Even a tiny step forward still counts."
    ],
    "mascot.shyAnswers": [
      "Eh, saying that so suddenly makes me shy ♥",
      "L-like me? You cannot just say that out of nowhere ❤",
      "My heart feels a little faster... Do not stare at me like that ♥",
      "I am not that happy... my face is just a little warm ❤",
      "I received your affection. I will try harder to stay with you ♥",
      "That line is unfair. The mascot is blushing ❤",
      "Uu... say things like that more quietly ♥",
      "I heard you. If you say it again, I may get even shier ❤"
    ],
    "mascot.casualAnswers": [
      "Hehe, you seem to be in a good mood.",
      "Haha, laughing is good.",
      "I am getting cheerful too.",
      "I caught your tone. The mood feels lighter now.",
      "Mhm, I am listening.",
      "Wow, it feels like you found something fun.",
      "No need to be too serious. Take your time.",
      "I caught that vibe. Want to ask me something else?"
    ],
    "mascot.punctuation.question": [
      "What are you wondering about? Please write the question more clearly.",
      "So many question marks. Is something confusing?",
      "Question marks received, but I need the actual question too.",
      "With only question marks, I can only feel your confusion."
    ],
    "mascot.punctuation.exclamation": [
      "I can feel the emotion! Please tell me what happened.",
      "Wow, that is a strong exclamation!",
      "You seem excited. Did something happen?",
      "I received the exclamation marks, but I still need more detail."
    ],
    "mascot.punctuation.ellipsis": [
      "You suddenly went quiet. Are you thinking about something?",
      "That ellipsis feels meaningful.",
      "Silence is also expression, but I want to hear the rest.",
      "Were you trying to say something but still organizing it?"
    ],
    "mascot.punctuation.wave": [
      "That tone feels soft. You can ask me directly.",
      "Tilde received. The tone feels lighter.",
      "That sounds a little playful.",
      "A soft little symbol appeared."
    ],
    "mascot.punctuation.comma": [
      "That pause is sudden. Say the rest too.",
      "Did you not finish your sentence?",
      "There should be something after that comma.",
      "I caught the pause. Please continue."
    ],
    "mascot.punctuation.colon": [
      "It feels like you are about to explain something. Please continue.",
      "There should be something important after the colon.",
      "Are you preparing to explain something?",
      "That symbol feels like a setup for the next sentence."
    ],
    "mascot.punctuation.quote": [
      "Were you trying to quote something? Please add the text too.",
      "Quotation marks appeared, but there is nothing inside.",
      "Were you trying to say a line?",
      "I saw the quotation marks. Add the words inside."
    ],
    "mascot.punctuation.bracket": [
      "The brackets seem to be missing content.",
      "Empty brackets feel mysterious. What will you put inside?",
      "Were you trying to add an explanation?",
      "Brackets appeared, but the content has not."
    ],
    "mascot.punctuation.dash": [
      "That line feels mysterious. Were you trying to separate something?",
      "A dash appeared. It looks like a divider.",
      "Were you trying to create a pause?",
      "I see the line, but I still do not see the question."
    ],
    "mascot.punctuation.default": [
      "I received “{input}”, but please add some words so I can understand better.",
      "The symbol “{input}” is interesting, but I need more context.",
      "If you only send “{input}”, I can only guess your emotion.",
      "Symbol received. Add one sentence and I can answer better."
    ]
  },
  "ja": {
    "mascot.imageAlt": "看板娘の隠しイースターエッグ",
    "mascot.qa.title": "看板娘Q&A",
    "mascot.tip.default": "質問を入力すると、看板娘が質問庫から答えるにゃ。",
    "mascot.lastQuestion": "前回の質問：",
    "mascot.placeholder": "看板娘に質問してみてにゃ...",
    "mascot.submit": "質問",
    "mascot.error": "この質問は少し分かりにくいにゃ。もう一度言い直してみてくださいにゃ。",
    "mascot.answered": "回答済み：{question}",
    "mascot.daily.prefix": "今日の励まし文：{text}",
    "mascot.daily.locked": "今日の励まし文はもう受け取り済みにゃ。あと {time} でまた受け取れます。",
    "mascot.time.minutes": "{minutes} 分",
    "mascot.time.hours": "{hours} 時間",
    "mascot.time.hoursMinutes": "{hours} 時間 {minutes} 分",
    "mascot.quickQuestions": [
      "今日の励まし文",
      "このサイトの内容は？",
      "グッズはどう買う？",
      "ストーリーはどう見る？",
      "あなたは誰？",
      "褒めて"
    ],
    "mascot.floatingLines": [
      "見つけてくれたにゃ〜",
      "隠しエリアへようこそ。",
      "ここはニュースの後の小さなイースターエッグ。",
      "急がず、ゆっくり下へ見てください。",
      "今日も少しずつ前に進もう。",
      "ページはまだ終わっていないよ。",
      "もう少し下を見てみる？",
      "このサイトはどんどん面白くなっているにゃ。",
      "青い記憶がきらきら光っている。",
      "ランダムに出る文字が見える？",
      "ここにはキャラクターの台詞を入れられるよ。",
      "あとでさらにキャラらしい文に変えられるにゃ。",
      "ここは看板娘だけの小さな空間。",
      "ここまで見たなら、本当に丁寧にサイトを見ている証拠にゃ。",
      "隠しイースターエッグ起動中……",
      "好奇心を忘れないで。",
      "今日の風もやさしいにゃ。",
      "ゆっくり見てね、急がなくていいよ。",
      "私はいつもここで待っているにゃ。",
      "おかえりなさい。",
      "ここには小さな青いサプライズが隠れているにゃ。",
      "ページが静かすぎるなら、私が少し話すにゃ。",
      "探索を続けよう。後ろにまだ何かあるかも。",
      "これは普通のモジュールではなく、隠しイースターエッグにゃ。",
      "看板娘エリアを解放しました。"
    ],
    "mascot.dailyKeywords": [
      "今日の励まし文",
      "今日の文",
      "毎日の励まし",
      "励まし文",
      "励まして",
      "今日励まして",
      "モチベーション",
      "名言"
    ],
    "mascot.shyKeywords": [
      "好き",
      "大好き",
      "愛してる",
      "会いたい",
      "抱っこ",
      "ハグ",
      "キス",
      "かわいい",
      "看板娘かわいい",
      "宝物",
      "赤面",
      "照れる",
      "❤",
      "♥",
      "💕",
      "💗",
      "💖",
      "💘"
    ],
    "mascot.casualKeywords": [
      "へへ",
      "はは",
      "ははは",
      "ふふ",
      "うん",
      "おお",
      "わあ",
      "やった",
      "こんにちは",
      "やあ",
      "hi",
      "hello",
      "lol"
    ],
    "mascot.dailyMotivationLines": [
      "今日も少しだけ、より良い自分に近づこうにゃ。",
      "一気にすごくならなくていい。昨日より一歩進めば十分にゃ。",
      "ゆっくりで大丈夫。本当の力は少しずつ育つにゃ。",
      "今うまくできないからといって、自分を否定しないで。成長中にゃ。",
      "小さな目標を一つ達成できたら、それは立派な勝利にゃ。",
      "遅いことを恐れないで。止まることだけを恐れようにゃ。",
      "今の困難は、あとで経験になるにゃ。",
      "複雑な問題は小さく分ければ、一歩ずつ解けるにゃ。",
      "今日もお疲れさま。あなたはちゃんと強くなっているにゃ。",
      "他人と比べすぎないで、まず昨日の自分に勝とうにゃ。",
      "ここまで直し続けたこと自体、本当に真剣な証拠にゃ。",
      "サイトも能力も、少しずつ作られていくにゃ。",
      "まず完成させて、それから良くする。それが大事にゃ。",
      "今日は一度、自分を信じてみてにゃ。",
      "ほんの少しの前進でも、ちゃんと前に進んでいるにゃ。"
    ],
    "mascot.shyAnswers": [
      "えっ、急にそんなこと言われたら照れるにゃ ♥",
      "す、好きだなんて……急に言わないでにゃ ❤",
      "心臓が少し早くなったにゃ……そんなに見つめないで ♥",
      "う、うれしいわけじゃ……顔が少し熱いだけにゃ ❤",
      "あなたの気持ち、受け取ったにゃ。もっと頑張ってここにいるね ♥",
      "その台詞は反則にゃ。看板娘が赤くなるにゃ ❤",
      "うぅ……そういうことは小さな声で言ってにゃ ♥",
      "聞こえたにゃ。もう一回言われたら、もっと照れるかも ❤"
    ],
    "mascot.casualAnswers": [
      "へへ、なんだか気分がよさそうにゃ。",
      "笑えるなら、それはいいことにゃ。",
      "私まで楽しくなってきたにゃ。",
      "その語気、受け取ったにゃ。少し空気が軽くなったね。",
      "うんうん、聞いているにゃ。",
      "わあ、何か面白いものを見つけたみたいにゃ。",
      "そんなに真面目にならなくても大丈夫。ゆっくり遊んでにゃ。",
      "その雰囲気、受け取ったにゃ。続けて質問する？"
    ],
    "mascot.punctuation.question": [
      "何に疑問を感じているのかにゃ？質問をもう少し書いてみて。",
      "たくさんの疑問符にゃ。分からないところがある？",
      "疑問符は受け取ったけど、聞きたい内容も書いてほしいにゃ。",
      "疑問符だけだと、困っている気持ちしか分からないにゃ。"
    ],
    "mascot.punctuation.exclamation": [
      "強い気持ちは伝わったにゃ！何があったか教えて。",
      "わあ、すごい感嘆符にゃ！",
      "かなり興奮しているみたいにゃ。何かあった？",
      "感嘆符は受け取ったけど、もう少し具体的に教えてにゃ。"
    ],
    "mascot.punctuation.ellipsis": [
      "急に黙ったにゃ。何か考えている？",
      "その省略号、意味深にゃ。",
      "沈黙も表現だけど、続きも聞きたいにゃ。",
      "言いたいことをまだ整理しているのかにゃ？"
    ],
    "mascot.punctuation.wave": [
      "柔らかい語気にゃ。質問があればそのまま聞いてね。",
      "波線を受け取ったにゃ。少し軽い感じがする。",
      "ちょっと甘えているみたいにゃ。",
      "ふわっとした記号が出てきたにゃ。"
    ],
    "mascot.punctuation.comma": [
      "その区切りは少し急にゃ。続きを言ってみて。",
      "まだ言い終わっていないのかにゃ？",
      "読点のあとに何かありそうにゃ。",
      "その間は受け取ったにゃ。続きをどうぞ。"
    ],
    "mascot.punctuation.colon": [
      "補足説明が始まりそうにゃ。続きを聞かせて。",
      "コロンの後に大事な内容がありそうにゃ。",
      "何か説明しようとしているのかにゃ？",
      "次の文への前置きみたいにゃ。"
    ],
    "mascot.punctuation.quote": [
      "何か引用したいのかにゃ？中身の文章も送ってね。",
      "引用符はあるけど、中身がまだないにゃ。",
      "台詞を言おうとしているのかにゃ？",
      "引用符を見たにゃ。中の言葉も足してね。"
    ],
    "mascot.punctuation.bracket": [
      "括弧の中身が足りないみたいにゃ。",
      "空の括弧は少し不思議にゃ。何を入れるの？",
      "補足説明を入れたいのかにゃ？",
      "括弧は出たけど、内容がまだ出ていないにゃ。"
    ],
    "mascot.punctuation.dash": [
      "その線は少し不思議にゃ。何かを分けたいの？",
      "横線が出てきたにゃ。区切り線みたい。",
      "間を作りたいのかにゃ？",
      "線は見えたけど、質問はまだ見えないにゃ。"
    ],
    "mascot.punctuation.default": [
      "「{input}」を受け取ったにゃ。でも少し言葉を足すと分かりやすいにゃ。",
      "「{input}」は少し特別な記号にゃ。でも文脈がもっと必要にゃ。",
      "「{input}」だけだと、気持ちしか推測できないにゃ。",
      "記号は受け取ったにゃ。一文足してくれたらもっと答えやすいにゃ。"
    ]
  }
}

const questionBankTranslations = {
  "zh": [
    {
      "keywords": [
        "网站",
        "内容",
        "介绍",
        "有什么",
        "这是哪里",
        "这个网站",
        "干嘛的",
        "网站是干什么的",
        "这里是哪里"
      ],
      "answers": [
        "这里是 ATRI 主题展示网站，里面有首页、新闻、故事、商品和看板娘互动内容喵。",
        "这个网站主要用来展示 ATRI 相关内容，包括新闻资讯、故事介绍、商品周边和一些隐藏互动喵。"
      ]
    },
    {
      "keywords": [
        "首页",
        "主页",
        "主页面",
        "回到首页",
        "首页有什么"
      ],
      "answers": [
        "首页是整个网站的入口，可以看到主要视觉内容，也可以继续往下浏览其他模块喵。",
        "首页就像网站的门面，视觉效果和第一印象都很重要喵。"
      ]
    },
    {
      "keywords": [
        "怎么用",
        "怎么玩",
        "使用方法",
        "操作",
        "浏览",
        "怎么浏览",
        "我该怎么看"
      ],
      "answers": [
        "你可以从首页开始往下浏览，遇到新闻、故事、商品模块时点击对应卡片查看详情喵。",
        "你可以把它当成一个展示型网站，慢慢往下探索每个模块喵。"
      ]
    },
    {
      "keywords": [
        "新闻",
        "资讯",
        "最新消息",
        "消息",
        "公告",
        "新闻模块",
        "news",
        "新闻在哪",
        "资讯在哪",
        "怎么看新闻",
        "新闻怎么看"
      ],
      "answers": [
        "新闻模块可以查看网站里的最新资讯，点击新闻卡片还能进入详细内容喵。",
        "如果你想了解最近发生了什么，就去新闻模块看看喵。"
      ]
    },
    {
      "keywords": [
        "新闻详情",
        "新闻页面",
        "新闻卡片",
        "点击新闻"
      ],
      "answers": [
        "点击新闻卡片后会进入新闻详情页，里面可以展示更完整的新闻内容喵。",
        "新闻卡片负责预览，详情页负责展示完整内容，这样结构会比较清楚喵。"
      ]
    },
    {
      "keywords": [
        "商品",
        "周边",
        "购买",
        "买",
        "怎么买",
        "商品怎么买",
        "购物",
        "merchandise",
        "商品在哪",
        "周边在哪",
        "怎么买周边",
        "买东西",
        "购买商品"
      ],
      "answers": [
        "商品页面可以查看周边内容，喜欢的商品可以进入详情页继续查看喵。",
        "商品模块适合展示图片、名称、价格和详情按钮喵。"
      ]
    },
    {
      "keywords": [
        "价格",
        "多少钱",
        "贵不贵",
        "商品价格"
      ],
      "answers": [
        "商品价格可以放在商品详情页里展示，现在这里主要负责引导你去商品模块查看喵。",
        "商品价格最好放在比较醒目的位置，用户一眼就能看到喵。"
      ]
    },
    {
      "keywords": [
        "没有商品",
        "商品不显示",
        "商品打不开",
        "商品页面打不开"
      ],
      "answers": [
        "如果商品没有显示，可以先检查商品数据、图片路径和页面跳转路径有没有写对喵。",
        "商品页面如果空白，可能是数据没传进去，也可能是图片路径写错了喵。"
      ]
    },
    {
      "keywords": [
        "故事",
        "剧情",
        "故事鉴赏",
        "怎么看故事",
        "story",
        "剧情介绍",
        "故事在哪",
        "剧情在哪",
        "进入故事"
      ],
      "answers": [
        "故事模块可以用来展示剧情介绍、角色经历和世界观内容喵。",
        "故事区域适合放一些有氛围感的文字和图片，让网站更有沉浸感喵。"
      ]
    },
    {
      "keywords": [
        "世界观",
        "背景故事",
        "设定"
      ],
      "answers": [
        "世界观和背景故事可以放在故事模块里，让整个网站更有沉浸感喵。",
        "如果想让网站更完整，可以给故事模块加背景介绍、角色关系和时间线喵。"
      ]
    },
    {
      "keywords": [
        "角色",
        "人物",
        "主角",
        "角色介绍",
        "人物介绍"
      ],
      "answers": [
        "角色模块可以展示人物信息，比如名字、简介、设定和相关图片喵。",
        "角色介绍最好配合图片、姓名、性格和一句代表台词，这样会更有感觉喵。"
      ]
    },
    {
      "keywords": [
        "看板娘",
        "你是谁",
        "你叫什么",
        "你是干嘛的",
        "你是什么"
      ],
      "answers": [
        "我是这个网站里的看板娘，会在隐藏区域陪你聊天和引导浏览喵。",
        "你可以把我理解成网站里的小助手，虽然不是 AI，但我会根据问题库回答喵。"
      ]
    },
    {
      "keywords": [
        "你会什么",
        "你能干什么",
        "你有什么用"
      ],
      "answers": [
        "我可以回答网站相关问题，也可以引导你查看新闻、故事、商品和角色内容喵。",
        "我可以当作网站导航助手，让用户知道每个模块大概是做什么的喵。"
      ]
    },
    {
      "keywords": [
        "你是真人吗",
        "你是ai吗",
        "你是不是ai",
        "你是真ai吗"
      ],
      "answers": [
        "我现在不是接入 AI 的模式喵，我是根据提前写好的问题库来回答你的。",
        "你可以把我当成一个固定问答助手，不是真正的 AI 聊天机器人喵。"
      ]
    },
    {
      "keywords": [
        "搜索",
        "筛选",
        "查找",
        "找商品",
        "找新闻",
        "搜索栏",
        "怎么搜索",
        "如何搜索",
        "搜索怎么用"
      ],
      "answers": [
        "你可以使用搜索栏或筛选功能，快速找到想看的内容喵。",
        "如果内容越来越多，搜索和筛选就会变得很重要喵。"
      ]
    },
    {
      "keywords": [
        "筛选怎么用",
        "怎么筛选",
        "分类",
        "分类查看"
      ],
      "answers": [
        "筛选功能可以按照分类缩小范围，让你更快找到想看的内容喵。",
        "如果东西很多，筛选按钮可以让用户不用一直翻找喵。"
      ]
    },
    {
      "keywords": [
        "返回",
        "back",
        "回首页",
        "返回首页",
        "新闻首页",
        "回去"
      ],
      "answers": [
        "点击 Back 按钮可以回到新闻首页，适合用来从详情页返回列表喵。",
        "返回逻辑做好之后，用户就不会在页面里迷路了喵。"
      ]
    },
    {
      "keywords": [
        "跳转",
        "页面跳转",
        "打不开页面",
        "点不开"
      ],
      "answers": [
        "如果页面跳转不正常，可以检查路由路径、点击事件和目标页面文件名有没有对应喵。",
        "如果点击后没有反应，可能是事件没有绑定成功喵。"
      ]
    },
    {
      "keywords": [
        "卡顿",
        "闪一下",
        "页面闪烁",
        "闪屏"
      ],
      "answers": [
        "页面闪烁通常和状态切换、路由跳转或组件重复渲染有关，可以从这些地方排查喵。",
        "卡顿可能和动画、图片体积、组件重复渲染有关喵。"
      ]
    },
    {
      "keywords": [
        "图片",
        "图片不显示",
        "图片路径",
        "图片加载失败"
      ],
      "answers": [
        "图片不显示时，可以先检查图片有没有放在 public 目录，以及路径是不是从 /images/ 开始喵。",
        "图片路径写错是最常见的问题喵，可以先确认文件名、后缀和大小写。"
      ]
    },
    {
      "keywords": [
        "滚动",
        "不能滚动",
        "页面滚动",
        "滚轮",
        "滚不了"
      ],
      "answers": [
        "页面不能滚动时，可以检查外层容器有没有写 overflow hidden，或者高度是不是被固定住了喵。",
        "滚动失效一般和 height、overflow、position fixed 这些样式有关喵。"
      ]
    },
    {
      "keywords": [
        "动画",
        "动效",
        "效果",
        "动态效果"
      ],
      "answers": [
        "网站动效可以用 CSS animation、transition 或 GSAP 来做，让页面更有生命力喵。",
        "好的动画应该增强氛围，而不是让用户觉得眼花喵。"
      ]
    },
    {
      "keywords": [
        "背景",
        "动态背景",
        "背景图",
        "背景效果"
      ],
      "answers": [
        "背景可以做成渐变、粒子、光效或者 GSAP 动态背景，这样页面会更有氛围喵。",
        "动态背景不要太抢眼，不然会影响前面的内容阅读喵。"
      ]
    },
    {
      "keywords": [
        "问题库",
        "题库",
        "回答库",
        "问答库"
      ],
      "answers": [
        "问题库就是提前准备关键词和回答，用户输入内容后，我会根据关键词匹配对应回复喵。",
        "题库可以慢慢加，不需要一次写完，先覆盖常见问题就很好喵。"
      ]
    },
    {
      "keywords": [
        "为什么回答不了",
        "你不会回答",
        "答不上来",
        "没有回答"
      ],
      "answers": [
        "因为我现在是问题库模式喵，只有问题匹配到关键词时才能回答，后面可以继续扩充题库。",
        "如果我答不上来，说明这个问题还没有被加入问题库喵。"
      ]
    },
    {
      "keywords": [
        "怎么加问题",
        "添加问题",
        "新增问题",
        "扩充题库"
      ],
      "answers": [
        "可以在 questionBank 里继续添加 keywords 和 answers，每一组就是一个新的回答规则喵。",
        "新增问题时，keywords 写用户可能输入的话，answers 写我可以随机回答的内容喵。"
      ]
    },
    {
      "keywords": [
        "关键词",
        "匹配",
        "怎么匹配"
      ],
      "answers": [
        "我会检查用户输入里有没有包含题库关键词，匹配成功后就返回对应回答喵。",
        "关键词越贴近用户说话习惯，匹配效果就越自然喵。"
      ]
    },
    {
      "keywords": [
        "你好",
        "hello",
        "hi",
        "在吗",
        "早上好",
        "晚上好",
        "哈喽"
      ],
      "answers": [
        "我在这里喵，有什么想问我的都可以试试看。",
        "你好喵，欢迎来到这个隐藏区域。"
      ]
    },
    {
      "keywords": [
        "谢谢",
        "感谢",
        "辛苦了"
      ],
      "answers": [
        "不用谢喵，能帮到你我也很开心。",
        "嘿嘿，不客气喵。"
      ]
    },
    {
      "keywords": [
        "夸夸我",
        "鼓励",
        "加油",
        "累了",
        "没动力",
        "不想做了"
      ],
      "answers": [
        "你已经做得很不错了喵！能一步步把网站改到现在，说明你真的在进步。继续冲喵！",
        "网页不是一下子做好的喵，现在每改好一个细节，项目就更完整一点。"
      ]
    },
    {
      "keywords": [
        "难受",
        "烦",
        "崩溃",
        "做不出来",
        "好难"
      ],
      "answers": [
        "先别急喵，网页就是一点点改出来的。你现在遇到问题，说明你已经做到比较复杂的部分了。",
        "先把问题拆小喵，一次只解决一个点，会轻松很多。"
      ]
    },
    {
      "keywords": [
        "开心",
        "成功了",
        "好了",
        "可以了",
        "有效果了"
      ],
      "answers": [
        "太好了喵！看到效果跑出来的时候真的很有成就感，继续保持这个节奏。",
        "效果出来了喵，恭喜你又完成一个小节点。"
      ]
    },
    {
      "keywords": [
        "代码",
        "怎么改代码",
        "文件",
        "组件",
        "vue",
        "nuxt"
      ],
      "answers": [
        "这个网站是用 Nuxt 和 Vue 组件来组织的，页面效果一般可以从对应的 .vue 文件里修改喵。",
        "如果要改页面结构，通常看 template；要改样式，就看 style；要改逻辑，就看 script 喵。"
      ]
    },
    {
      "keywords": [
        "css",
        "样式",
        "布局",
        "排版",
        "不好看"
      ],
      "answers": [
        "样式和排版主要看 CSS，可以从宽高、间距、圆角、阴影、颜色和布局方式这几个方向调整喵。",
        "布局想变好看，重点是层次感、留白和对齐喵。"
      ]
    },
    {
      "keywords": [
        "报错",
        "错误",
        "bug",
        "bug了",
        "出错了"
      ],
      "answers": [
        "遇到报错时，先看控制台提示，再检查变量名、文件路径、组件引用和标签有没有写错喵。",
        "Bug 可以一点点排查，先确认是样式问题、逻辑问题，还是路径问题喵。"
      ]
    },
    {
      "keywords": [
        "vscode",
        "编辑器",
        "运行",
        "插件"
      ],
      "answers": [
        "写网页时可以用 VS Code，常用插件有 Vue、ESLint、Prettier 和 Live Server 之类的工具喵。",
        "运行 Nuxt 项目时，一般在终端里执行 npm run dev 喵。"
      ]
    },
    {
      "keywords": [
        "好看吗",
        "怎么样",
        "页面怎么样",
        "布局怎么样"
      ],
      "answers": [
        "现在这个网站已经有完整模块感了喵，后面可以继续优化细节，比如间距、动效、层次和交互反馈。",
        "页面已经不只是练习代码了，开始有项目感了喵。"
      ]
    },
    {
      "keywords": [
        "还能加什么",
        "添加什么功能",
        "功能建议",
        "优化建议"
      ],
      "answers": [
        "后面可以加搜索筛选、收藏、角色详情、商品详情、返回动效、看板娘问答和页面彩蛋喵。",
        "功能不用一次加太多，先把现有模块做精致会更重要喵。"
      ]
    }
  ],
  "en": [
    {
      "keywords": [
        "site",
        "website",
        "content",
        "what is this",
        "what is here",
        "introduction"
      ],
      "answers": [
        "This is an ATRI themed showcase site with home, news, story, merchandise, characters, and mascot interaction.",
        "It is a visual website for browsing ATRI related content and hidden interactions."
      ]
    },
    {
      "keywords": [
        "home",
        "homepage",
        "main page"
      ],
      "answers": [
        "The home page is the entrance of the site and gives the first visual impression.",
        "Start from the home page and scroll down to explore each module."
      ]
    },
    {
      "keywords": [
        "how to use",
        "how to browse",
        "operation",
        "guide"
      ],
      "answers": [
        "Start from the home page, scroll down, and click cards in news, story, or merchandise sections to see details.",
        "You can treat it as a showcase site and explore each module slowly."
      ]
    },
    {
      "keywords": [
        "news",
        "announcement",
        "updates",
        "latest"
      ],
      "answers": [
        "The news section shows the latest updates. Click a card to open its details.",
        "If you want to know what is new, check the news module."
      ]
    },
    {
      "keywords": [
        "news detail",
        "news page",
        "news card",
        "click news"
      ],
      "answers": [
        "Clicking a news card opens the detail page with fuller information.",
        "Cards are previews, while detail pages hold the complete content."
      ]
    },
    {
      "keywords": [
        "merch",
        "merchandise",
        "product",
        "buy",
        "purchase",
        "goods"
      ],
      "answers": [
        "The merchandise module can show goods and lead users to product details.",
        "A good product section should include images, names, prices, and a detail button."
      ]
    },
    {
      "keywords": [
        "price",
        "how much",
        "cost"
      ],
      "answers": [
        "Price information is usually shown on the product detail page.",
        "Prices should be placed where users can notice them quickly."
      ]
    },
    {
      "keywords": [
        "product not showing",
        "product broken",
        "cannot open product"
      ],
      "answers": [
        "Check the product data, image paths, and route path first.",
        "A blank product page is often caused by missing data or a wrong image path."
      ]
    },
    {
      "keywords": [
        "story",
        "plot",
        "narrative",
        "background story"
      ],
      "answers": [
        "The story module is for plot, character experiences, and world setting.",
        "Atmospheric text and images can make the story area more immersive."
      ]
    },
    {
      "keywords": [
        "worldview",
        "setting",
        "world setting"
      ],
      "answers": [
        "World setting belongs in the story module and helps users understand the atmosphere.",
        "You can add background, character relationships, and a timeline later."
      ]
    },
    {
      "keywords": [
        "character",
        "characters",
        "profile",
        "cast"
      ],
      "answers": [
        "The character module shows names, profiles, settings, and images.",
        "Character cards feel stronger with a name, personality, image, and signature line."
      ]
    },
    {
      "keywords": [
        "mascot",
        "who are you",
        "what are you",
        "your name"
      ],
      "answers": [
        "I am the mascot hidden in this site, here to chat and guide you.",
        "Think of me as a small site helper powered by a question bank."
      ]
    },
    {
      "keywords": [
        "what can you do",
        "your function",
        "what are you for"
      ],
      "answers": [
        "I can answer site-related questions and guide you to news, story, goods, and characters.",
        "I make the website feel more interactive."
      ]
    },
    {
      "keywords": [
        "are you ai",
        "real ai",
        "human"
      ],
      "answers": [
        "This version is not connected to live AI. It answers through a prepared question bank.",
        "I am a fixed Q&A mascot, not a real-time AI chatbot."
      ]
    },
    {
      "keywords": [
        "search",
        "filter",
        "find",
        "search bar"
      ],
      "answers": [
        "Search and filters help users find content faster.",
        "When the site has more content, search and filtering become very important."
      ]
    },
    {
      "keywords": [
        "category",
        "filter category",
        "classification"
      ],
      "answers": [
        "Filters narrow down categories so users can find content faster.",
        "If there are many items, filters prevent endless scrolling."
      ]
    },
    {
      "keywords": [
        "back",
        "return",
        "go home"
      ],
      "answers": [
        "A Back button should take users back to the page they came from.",
        "Good return logic helps users avoid getting lost."
      ]
    },
    {
      "keywords": [
        "route",
        "jump",
        "cannot open",
        "click not working"
      ],
      "answers": [
        "Check the route path, click event, and target file name.",
        "If clicking does nothing, the event may not be bound correctly."
      ]
    },
    {
      "keywords": [
        "lag",
        "flash",
        "flicker",
        "screen flicker"
      ],
      "answers": [
        "Flickering is often related to state switching, routing, or repeated rendering.",
        "Lag may come from animations, heavy images, or repeated components."
      ]
    },
    {
      "keywords": [
        "image",
        "image not showing",
        "image path",
        "image failed"
      ],
      "answers": [
        "Check that images are in the public folder and paths start with /images/.",
        "Wrong file names, extensions, or capitalization are common causes."
      ]
    },
    {
      "keywords": [
        "scroll",
        "cannot scroll",
        "mouse wheel"
      ],
      "answers": [
        "Check overflow, fixed height, and position fixed settings.",
        "Scroll issues often come from height, overflow, or fixed containers."
      ]
    },
    {
      "keywords": [
        "animation",
        "effect",
        "motion"
      ],
      "answers": [
        "Use CSS transitions, animations, or GSAP to make the site feel alive.",
        "Good animation should support the atmosphere, not distract users."
      ]
    },
    {
      "keywords": [
        "background",
        "dynamic background"
      ],
      "answers": [
        "A background can use gradients, particles, light spots, or GSAP motion.",
        "Dynamic backgrounds should not overpower the main content."
      ]
    },
    {
      "keywords": [
        "question bank",
        "answer bank",
        "faq"
      ],
      "answers": [
        "A question bank stores keywords and answers. User input is matched against the keywords.",
        "You can expand the bank gradually instead of finishing it all at once."
      ]
    },
    {
      "keywords": [
        "cannot answer",
        "no answer",
        "you do not know"
      ],
      "answers": [
        "I can only answer when the input matches the current question bank.",
        "If I cannot answer, that question probably has not been added yet."
      ]
    },
    {
      "keywords": [
        "add question",
        "new question",
        "expand bank"
      ],
      "answers": [
        "Add a new group with keywords and answers to the question bank.",
        "Keywords should match how users actually speak."
      ]
    },
    {
      "keywords": [
        "keyword",
        "match",
        "matching"
      ],
      "answers": [
        "I check whether the user input contains any keywords, then return a matching answer.",
        "More natural keywords make matching feel better."
      ]
    },
    {
      "keywords": [
        "hello",
        "hi",
        "good morning",
        "good evening"
      ],
      "answers": [
        "I am here. Feel free to ask me something.",
        "Hello, welcome to this hidden area."
      ]
    },
    {
      "keywords": [
        "thanks",
        "thank you"
      ],
      "answers": [
        "You are welcome. I am happy to help.",
        "Hehe, no problem."
      ]
    },
    {
      "keywords": [
        "encourage me",
        "cheer me up",
        "tired",
        "no motivation"
      ],
      "answers": [
        "You are doing well. Every detail you improve makes this project more complete.",
        "Do not give up. You have already built a lot."
      ]
    },
    {
      "keywords": [
        "sad",
        "frustrated",
        "hard",
        "too hard",
        "cannot do it"
      ],
      "answers": [
        "Do not rush. Websites are built step by step.",
        "Break the problem down and solve one piece at a time."
      ]
    },
    {
      "keywords": [
        "happy",
        "it worked",
        "done",
        "success"
      ],
      "answers": [
        "Great! Seeing the effect work is a real achievement.",
        "That step is done, and the website is more complete now."
      ]
    },
    {
      "keywords": [
        "code",
        "vue",
        "nuxt",
        "component",
        "file"
      ],
      "answers": [
        "Nuxt and Vue organize the site through pages and components.",
        "For structure check template, for style check CSS, and for logic check script."
      ]
    },
    {
      "keywords": [
        "css",
        "style",
        "layout",
        "ugly"
      ],
      "answers": [
        "Improve layout through spacing, alignment, colors, shadows, and hierarchy.",
        "Good layout depends on hierarchy, whitespace, and consistency."
      ]
    },
    {
      "keywords": [
        "bug",
        "error",
        "broken"
      ],
      "answers": [
        "Check the console first, then variables, paths, components, and tags.",
        "Bugs can be solved step by step. First locate the type of problem."
      ]
    },
    {
      "keywords": [
        "vscode",
        "editor",
        "plugin",
        "run"
      ],
      "answers": [
        "VS Code works well with Vue, ESLint, Prettier, and related plugins.",
        "For Nuxt projects, you usually run npm run dev."
      ]
    },
    {
      "keywords": [
        "how is it",
        "does it look good",
        "layout"
      ],
      "answers": [
        "The site already feels like a complete project. More polish in spacing, motion, and hierarchy will help.",
        "The direction is right. Keep unifying the visual style."
      ]
    },
    {
      "keywords": [
        "what else",
        "feature suggestion",
        "optimization"
      ],
      "answers": [
        "You can add search, filters, favorites, character details, product details, back-to-top, and more easter eggs.",
        "Do not add too much at once. Polish the current modules first."
      ]
    }
  ],
  "ja": [
    {
      "keywords": [
        "サイト",
        "内容",
        "紹介",
        "ここはどこ",
        "何のサイト",
        "これは何"
      ],
      "answers": [
        "ここはATRIテーマの展示サイトで、ホーム、ニュース、ストーリー、グッズ、キャラクター、看板娘の互动がありますにゃ。",
        "ATRI関連の内容と隠し互动を楽しむためのビジュアルサイトにゃ。"
      ]
    },
    {
      "keywords": [
        "ホーム",
        "トップページ",
        "メインページ"
      ],
      "answers": [
        "ホームはサイトの入口で、最初の雰囲気を見せる大事な場所にゃ。",
        "まずホームから下へスクロールして各モジュールを見てみてにゃ。"
      ]
    },
    {
      "keywords": [
        "使い方",
        "どう見る",
        "操作",
        "閲覧"
      ],
      "answers": [
        "ホームから下へ進み、ニュースやストーリー、グッズのカードをクリックして詳細を見るにゃ。",
        "展示型サイトとして、ゆっくり各モジュールを探索してにゃ。"
      ]
    },
    {
      "keywords": [
        "ニュース",
        "お知らせ",
        "最新情報",
        "news"
      ],
      "answers": [
        "ニュースモジュールでは最新情報を確認でき、カードをクリックすると詳細を見られるにゃ。",
        "最近の情報を知りたいならニュースを見てにゃ。"
      ]
    },
    {
      "keywords": [
        "ニュース詳細",
        "ニュースページ",
        "ニュースカード"
      ],
      "answers": [
        "ニュースカードをクリックすると、より詳しい内容の詳細ページに入るにゃ。",
        "カードはプレビュー、詳細ページは完整な内容を見せる役割にゃ。"
      ]
    },
    {
      "keywords": [
        "商品",
        "グッズ",
        "購入",
        "買う",
        "merchandise"
      ],
      "answers": [
        "グッズモジュールでは関連商品を見て、詳細へ進めるにゃ。",
        "商品欄には画像、名前、価格、詳細ボタンを置くと分かりやすいにゃ。"
      ]
    },
    {
      "keywords": [
        "価格",
        "いくら",
        "値段"
      ],
      "answers": [
        "価格は商品詳細ページに置くと見やすいにゃ。",
        "値段はユーザーがすぐ見つけられる位置に置くのが大事にゃ。"
      ]
    },
    {
      "keywords": [
        "商品が出ない",
        "商品が開かない",
        "商品ページ"
      ],
      "answers": [
        "商品が表示されない時は、データ、画像パス、ルートを確認してにゃ。",
        "空白ページはデータ未渡しや画像パス間違いが多いにゃ。"
      ]
    },
    {
      "keywords": [
        "ストーリー",
        "物語",
        "剧情",
        "story"
      ],
      "answers": [
        "ストーリーモジュールでは剧情、角色の経験、世界観を見せられるにゃ。",
        "雰囲気のある文章と画像で、もっと没入感が出るにゃ。"
      ]
    },
    {
      "keywords": [
        "世界観",
        "設定",
        "背景"
      ],
      "answers": [
        "世界観はストーリー欄に入れると、サイト全体の雰囲気が伝わるにゃ。",
        "背景、角色关系、タイムラインを足すとさらに完整になるにゃ。"
      ]
    },
    {
      "keywords": [
        "キャラクター",
        "角色",
        "人物",
        "紹介"
      ],
      "answers": [
        "キャラクター欄では名前、プロフィール、設定、画像を見せられるにゃ。",
        "画像、名前、性格、代表台詞があるとキャラ紹介が強くなるにゃ。"
      ]
    },
    {
      "keywords": [
        "看板娘",
        "あなたは誰",
        "何者",
        "名前"
      ],
      "answers": [
        "私はこのサイトに隠れている看板娘で、案内とチャットを担当しているにゃ。",
        "質問庫で答える小さなサイト助手だと思ってにゃ。"
      ]
    },
    {
      "keywords": [
        "何ができる",
        "できること",
        "役割"
      ],
      "answers": [
        "ニュース、ストーリー、グッズ、角色などのサイト関連質問に答えられるにゃ。",
        "サイトを少し賑やかで互动のある感じにする役割にゃ。"
      ]
    },
    {
      "keywords": [
        "ai",
        "AI",
        "本物",
        "人間"
      ],
      "answers": [
        "この版本はリアルタイムAIではなく、準備した質問庫で答えるにゃ。",
        "固定Q&Aの看板娘で、本物のAIチャットではないにゃ。"
      ]
    },
    {
      "keywords": [
        "検索",
        "フィルター",
        "探す"
      ],
      "answers": [
        "検索とフィルターがあると、見たい内容を早く探せるにゃ。",
        "内容が増えたら検索と絞り込みはとても大事にゃ。"
      ]
    },
    {
      "keywords": [
        "分類",
        "カテゴリ",
        "絞り込み"
      ],
      "answers": [
        "分類フィルターで範囲を狭めると、探しやすくなるにゃ。",
        "項目が多い時、フィルターがあるとずっと便利にゃ。"
      ]
    },
    {
      "keywords": [
        "戻る",
        "back",
        "ホームに戻る"
      ],
      "answers": [
        "戻るボタンは、ユーザーが来たページへ自然に戻れるようにするのが大事にゃ。",
        "戻る処理がよければ、ユーザーは迷いにくいにゃ。"
      ]
    },
    {
      "keywords": [
        "遷移",
        "ページ遷移",
        "開かない",
        "クリックできない"
      ],
      "answers": [
        "ルート、クリックイベント、目標ファイル名が合っているか確認してにゃ。",
        "クリックして反応しない時は、イベント绑定を確認するにゃ。"
      ]
    },
    {
      "keywords": [
        "カクつく",
        "点滅",
        "闪烁",
        "ちらつく"
      ],
      "answers": [
        "ちらつきは状態切替、ルート遷移、重复レンダリングが原因のことが多いにゃ。",
        "カクつきはアニメ、画像サイズ、组件重复が原因かもしれないにゃ。"
      ]
    },
    {
      "keywords": [
        "画像",
        "画像が出ない",
        "画像パス"
      ],
      "answers": [
        "画像は public に置いて、/images/ から始まるパスか確認してにゃ。",
        "ファイル名、拡張子、大文字小文字の違いもよくある原因にゃ。"
      ]
    },
    {
      "keywords": [
        "スクロール",
        "滚动",
        "動かない"
      ],
      "answers": [
        "overflow、固定高さ、position fixed を確認してにゃ。",
        "スクロール問題は height と overflow が原因になりやすいにゃ。"
      ]
    },
    {
      "keywords": [
        "アニメ",
        "動き",
        "効果"
      ],
      "answers": [
        "CSS animation、transition、GSAPでサイトに動きを出せるにゃ。",
        "良いアニメは雰囲気を強めるもので、邪魔にならないことが大事にゃ。"
      ]
    },
    {
      "keywords": [
        "背景",
        "動的背景",
        "背景画像"
      ],
      "answers": [
        "背景はグラデーション、光、粒子、GSAP動きで雰囲気を作れるにゃ。",
        "動的背景は目立ちすぎないようにするのが大事にゃ。"
      ]
    },
    {
      "keywords": [
        "質問庫",
        "問題庫",
        "回答庫"
      ],
      "answers": [
        "質問庫はキーワードと回答を先に用意し、入力と照合して答える仕組みにゃ。",
        "一度に全部作らなくても、よくある質問から増やせば大丈夫にゃ。"
      ]
    },
    {
      "keywords": [
        "答えられない",
        "分からない",
        "回答できない"
      ],
      "answers": [
        "私は質問庫に合う時だけ答えられるにゃ。",
        "答えられない時は、その質問がまだ追加されていない可能性が高いにゃ。"
      ]
    },
    {
      "keywords": [
        "質問を追加",
        "新しい質問",
        "追加方法"
      ],
      "answers": [
        "questionBank に keywords と answers の組を追加すれば、新しい回答规则になるにゃ。",
        "keywords にはユーザーが言いそうな言葉を書くとよいにゃ。"
      ]
    },
    {
      "keywords": [
        "キーワード",
        "マッチ",
        "照合"
      ],
      "answers": [
        "入力にキーワードが含まれているか確認して、合う回答を返すにゃ。",
        "自然な言葉のキーワードを入れると、マッチがよくなるにゃ。"
      ]
    },
    {
      "keywords": [
        "こんにちは",
        "hello",
        "hi",
        "いる"
      ],
      "answers": [
        "ここにいるにゃ。聞きたいことを試してみて。",
        "こんにちはにゃ、隠しエリアへようこそ。"
      ]
    },
    {
      "keywords": [
        "ありがとう",
        "感謝",
        "お疲れ"
      ],
      "answers": [
        "どういたしましてにゃ。役に立てたらうれしいにゃ。",
        "へへ、こちらこそにゃ。"
      ]
    },
    {
      "keywords": [
        "褒めて",
        "励まして",
        "疲れた",
        "やる気ない"
      ],
      "answers": [
        "ここまで一つずつ直してきたのは本当に進歩にゃ。继续していこうにゃ！",
        "小さな修正でも、サイトは確実に完整に近づいているにゃ。"
      ]
    },
    {
      "keywords": [
        "つらい",
        "難しい",
        "できない",
        "崩壊",
        "烦"
      ],
      "answers": [
        "焦らないでにゃ。サイトは少しずつ作るものにゃ。",
        "問題を小さく分けて、一つずつ解けば軽くなるにゃ。"
      ]
    },
    {
      "keywords": [
        "成功",
        "できた",
        "嬉しい",
        "完成"
      ],
      "answers": [
        "よかったにゃ！效果が出ると達成感があるね。",
        "この一歩でサイトがまた完整になったにゃ。"
      ]
    },
    {
      "keywords": [
        "コード",
        "vue",
        "nuxt",
        "组件",
        "ファイル"
      ],
      "answers": [
        "Nuxt と Vue は pages と components でサイトを整理するにゃ。",
        "结构は template、样式は style、ロジックは script を見るにゃ。"
      ]
    },
    {
      "keywords": [
        "css",
        "样式",
        "レイアウト",
        "見た目"
      ],
      "answers": [
        "レイアウトは余白、整列、色、影、层次でかなり良くなるにゃ。",
        "大事なのは层次感、余白、統一感にゃ。"
      ]
    },
    {
      "keywords": [
        "バグ",
        "エラー",
        "bug",
        "壊れた"
      ],
      "answers": [
        "まずコンソールを見て、变量、路径、组件、タグを確認してにゃ。",
        "バグは一つずつ原因を分ければ解決できるにゃ。"
      ]
    },
    {
      "keywords": [
        "vscode",
        "エディタ",
        "插件",
        "実行"
      ],
      "answers": [
        "VS Code は Vue、ESLint、Prettier などと相性がいいにゃ。",
        "Nuxt 项目なら一般的に npm run dev で起動するにゃ。"
      ]
    },
    {
      "keywords": [
        "どう",
        "見た目",
        "レイアウト",
        "いい感じ"
      ],
      "answers": [
        "今のサイトはもう项目感が出ているにゃ。余白、动效、层次を整えるともっと良くなるにゃ。",
        "方向は合っているにゃ。视觉をもっと统一すると完成度が上がるにゃ。"
      ]
    },
    {
      "keywords": [
        "何を追加",
        "機能追加",
        "改善案"
      ],
      "answers": [
        "検索、筛选、お気に入り、角色詳細、商品詳細、トップへ戻る、さらに隠し要素を足せるにゃ。",
        "一度に多く足さず、今ある模块を精致にするのも大事にゃ。"
      ]
    }
  ]
}

const injectedI18n = inject('atriI18n', null)
const localLanguage = ref(DEFAULT_LANGUAGE)
const mascotRoot = ref(null)
const activeTexts = ref([])
const activeAnswer = ref(null)
const qaInput = ref('')
const qaTip = ref('')
const qaStatus = ref('normal')
const lastQuestion = ref('')
const isAsking = ref(false)

let showTimer = null
let nextTimer = null
let answerTimer = null
let textId = 0
let answerId = 0
let isLoopRunning = false
let mascotObserver = null
let isMascotVisible = false

const BATCH_COUNT = 5
const SHOW_TIME = 7000
const NEXT_GAP = 800
const ANSWER_SHOW_TIME = 5600

const currentLanguage = computed(() => {
  const injectedLanguage = injectedI18n?.currentLanguage?.value

  return normalizeLanguage(injectedLanguage || localLanguage.value)
})

const quickQuestions = computed(() => getList('mascot.quickQuestions'))

function normalizeLanguage(language) {
  return ['zh', 'en', 'ja'].includes(language) ? language : DEFAULT_LANGUAGE
}

function formatMessage(message, params = {}) {
  if (Array.isArray(message) || typeof message !== 'string') return message

  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, value)
  }, message)
}

function t(key, params = {}) {
  const language = currentLanguage.value
  const message =
    translations[language]?.[key] ??
    translations[DEFAULT_LANGUAGE]?.[key] ??
    key

  return formatMessage(message, params)
}

function getList(key) {
  const value = t(key)

  return Array.isArray(value) ? value : []
}

function getSavedLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE

  try {
    return normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY) || DEFAULT_LANGUAGE)
  } catch {
    return DEFAULT_LANGUAGE
  }
}

function handleLanguageChange(event) {
  localLanguage.value = normalizeLanguage(event.detail?.language)
}

function updateDefaultTip() {
  if (qaStatus.value === 'normal' && !activeAnswer.value) {
    qaTip.value = t('mascot.tip.default')
  }
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomPick(array) {
  if (!array?.length) return ''

  return array[randomNumber(0, array.length - 1)]
}

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5)
}

function getBatchLines(count = BATCH_COUNT) {
  return shuffleArray(getList('mascot.floatingLines')).slice(0, count)
}

function normalizeText(text) {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[？?！!。.,，、~～]/g, '')
}

function normalizeRawText(text) {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, '')
}

function isOnlyPunctuation(text) {
  const compactText = String(text).trim().replace(/\s+/g, '')

  if (!compactText) return false

  return /^[\p{P}\p{S}]+$/u.test(compactText)
}

function formatRemainTime(ms) {
  const totalMinutes = Math.ceil(ms / 1000 / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours <= 0) {
    return t('mascot.time.minutes', { minutes })
  }

  if (minutes <= 0) {
    return t('mascot.time.hours', { hours })
  }

  return t('mascot.time.hoursMinutes', { hours, minutes })
}

function includesAnyKeyword(input, keywordList, normalizer = normalizeText) {
  return keywordList.some((keyword) => {
    const cleanKeyword = normalizer(keyword)

    return cleanKeyword && input.includes(cleanKeyword)
  })
}

function isDailyMotivationQuestion(question) {
  const input = normalizeText(question)

  return includesAnyKeyword(input, getList('mascot.dailyKeywords'))
}

function isShyQuestion(question) {
  const input = normalizeRawText(question)

  return includesAnyKeyword(input, getList('mascot.shyKeywords'), normalizeRawText)
}

function isCasualExpression(question) {
  const input = normalizeRawText(question).replace(/[？?！!。.,，、~～]/g, '')

  if (!input) return false

  const casualKeywords = getList('mascot.casualKeywords').map((keyword) => normalizeRawText(keyword))

  if (casualKeywords.includes(input)) return true

  return /^(哈|嘿|嘻|呵|嗯|啊|哦|嗷|呜|哇|诶|欸|哼)+$/.test(input)
    || /^(h+|ha+|haha+|lol)+$/i.test(input)
    || /^(へ|は|ふ|うん|おお|わあ)+$/.test(input)
}

function getCasualAnswer() {
  return {
    type: 'casual',
    icon: '♪',
    text: randomPick(getList('mascot.casualAnswers'))
  }
}

function getShyAnswer() {
  return {
    type: 'shy',
    icon: '♥',
    text: randomPick(getList('mascot.shyAnswers'))
  }
}

function getDailyMotivationAnswer() {
  const dailyLines = getList('mascot.dailyMotivationLines')

  if (typeof window === 'undefined') {
    return {
      type: 'daily',
      icon: '✨',
      text: t('mascot.daily.prefix', { text: randomPick(dailyLines) })
    }
  }

  const now = Date.now()
  const storageKey = `${DAILY_MOTIVATION_KEY}_${currentLanguage.value}`
  const savedText = window.localStorage.getItem(storageKey)

  if (savedText) {
    try {
      const savedData = JSON.parse(savedText)
      const lastReceivedAt = Number(savedData.receivedAt || 0)
      const passedTime = now - lastReceivedAt

      if (passedTime < DAILY_MOTIVATION_LOCK_MS) {
        const remainTime = DAILY_MOTIVATION_LOCK_MS - passedTime

        return {
          type: 'daily-locked',
          icon: '⏳',
          text: t('mascot.daily.locked', { time: formatRemainTime(remainTime) })
        }
      }
    } catch (error) {
      window.localStorage.removeItem(storageKey)
    }
  }

  const dailyText = randomPick(dailyLines)

  window.localStorage.setItem(
    storageKey,
    JSON.stringify({
      text: dailyText,
      receivedAt: now,
      unlockAt: now + DAILY_MOTIVATION_LOCK_MS
    })
  )

  return {
    type: 'daily',
    icon: '✨',
    text: t('mascot.daily.prefix', { text: dailyText })
  }
}

function getPunctuationText(key, params = {}) {
  return formatMessage(randomPick(getList(key)), params)
}

function getPunctuationAnswer(question) {
  const input = String(question).trim().replace(/\s+/g, '')

  if (!isOnlyPunctuation(input)) return null

  if (/^[?？]+$/.test(input)) {
    return { type: 'punctuation', icon: '？', text: getPunctuationText('mascot.punctuation.question') }
  }

  if (/^[!！]+$/.test(input)) {
    return { type: 'punctuation', icon: '！', text: getPunctuationText('mascot.punctuation.exclamation') }
  }

  if (/^(\.{2,}|…+|。+)$/.test(input)) {
    return { type: 'punctuation', icon: '…', text: getPunctuationText('mascot.punctuation.ellipsis') }
  }

  if (/^[~～]+$/.test(input)) {
    return { type: 'punctuation', icon: '～', text: getPunctuationText('mascot.punctuation.wave') }
  }

  if (/^[,，、]+$/.test(input)) {
    return { type: 'punctuation', icon: '，', text: getPunctuationText('mascot.punctuation.comma') }
  }

  if (/^[;；:：]+$/.test(input)) {
    return { type: 'punctuation', icon: '：', text: getPunctuationText('mascot.punctuation.colon') }
  }

  if (/^["“”'‘’]+$/.test(input)) {
    return { type: 'punctuation', icon: '”', text: getPunctuationText('mascot.punctuation.quote') }
  }

  if (/^[()（）\[\]【】{}《》<>]+$/.test(input)) {
    return { type: 'punctuation', icon: '（）', text: getPunctuationText('mascot.punctuation.bracket') }
  }

  if (/^[-—_]+$/.test(input)) {
    return { type: 'punctuation', icon: '—', text: getPunctuationText('mascot.punctuation.dash') }
  }

  return {
    type: 'punctuation',
    icon: input.slice(0, 2),
    text: getPunctuationText('mascot.punctuation.default', { input })
  }
}

function getQuestionBank() {
  return questionBankTranslations[currentLanguage.value] || questionBankTranslations[DEFAULT_LANGUAGE]
}

function getMascotAnswer(question) {
  if (isDailyMotivationQuestion(question)) {
    return getDailyMotivationAnswer()
  }

  if (isShyQuestion(question)) {
    return getShyAnswer()
  }

  if (isCasualExpression(question)) {
    return getCasualAnswer()
  }

  const punctuationResult = getPunctuationAnswer(question)

  if (punctuationResult) {
    return punctuationResult
  }

  const input = normalizeText(question)

  if (!input || input.length < 2) {
    return {
      type: 'error',
      icon: '!',
      text: t('mascot.error')
    }
  }

  let bestItem = null
  let bestScore = 0

  getQuestionBank().forEach((item) => {
    let score = 0

    item.keywords.forEach((keyword) => {
      const cleanKeyword = normalizeText(keyword)

      if (!cleanKeyword) return

      if (input === cleanKeyword) {
        score += 100
      } else if (input.includes(cleanKeyword)) {
        score += 10 + cleanKeyword.length
      } else if (cleanKeyword.includes(input) && input.length >= 2) {
        score += 4
      }
    })

    if (score > bestScore) {
      bestScore = score
      bestItem = item
    }
  })

  if (bestItem) {
    return {
      type: 'normal',
      icon: '',
      text: randomPick(bestItem.answers)
    }
  }

  return {
    type: 'error',
    icon: '!',
    text: t('mascot.error')
  }
}

function getRandomPosition(index) {
  const areas = [
    { left: [10, 30], top: [8, 24], rotate: [-7, 2] },
    { left: [34, 62], top: [4, 18], rotate: [-4, 4] },
    { left: [66, 90], top: [8, 26], rotate: [-2, 7] },
    { left: [6, 24], top: [34, 58], rotate: [-6, 3] },
    { left: [76, 96], top: [34, 62], rotate: [-3, 6] },
    { left: [14, 34], top: [68, 88], rotate: [-5, 5] },
    { left: [64, 88], top: [70, 90], rotate: [-5, 5] }
  ]

  const area = areas[index % areas.length]

  return {
    left: `${randomNumber(area.left[0], area.left[1])}%`,
    top: `${randomNumber(area.top[0], area.top[1])}%`,
    transform: `translate(-50%, -50%) rotate(${randomNumber(area.rotate[0], area.rotate[1])}deg)`,
    '--float-x': `${randomNumber(-12, 12)}px`,
    '--float-y': `${randomNumber(-28, -12)}px`,
    '--delay': `${index * 0.12}s`
  }
}

function getAnswerPosition() {
  return {
    left: '50%',
    top: '46%',
    transform: 'translate(-50%, -100%) rotate(-2deg)',
    '--float-x': '6px',
    '--float-y': '-18px',
    '--delay': '0s'
  }
}

function showAnswerText(answer, type = 'normal', icon = '') {
  if (answerTimer) {
    window.clearTimeout(answerTimer)
    answerTimer = null
  }

  answerId += 1

  activeAnswer.value = {
    id: answerId,
    text: answer,
    type,
    icon,
    style: getAnswerPosition()
  }

  answerTimer = window.setTimeout(() => {
    activeAnswer.value = null
    updateDefaultTip()
  }, ANSWER_SHOW_TIME)
}

function askMascot(questionText = '') {
  if (isAsking.value) return

  const question = questionText || qaInput.value
  const cleanQuestion = question.trim()

  if (!cleanQuestion) {
    const result = getMascotAnswer(cleanQuestion)

    qaStatus.value = 'error'
    qaTip.value = result.text
    showAnswerText(result.text, 'error', result.icon)
    return
  }

  lastQuestion.value = cleanQuestion
  qaInput.value = ''

  const result = getMascotAnswer(cleanQuestion)

  if (result.type === 'error') {
    qaStatus.value = 'error'
    qaTip.value = result.text
    showAnswerText(result.text, 'error', result.icon)
    return
  }

  if (result.type === 'punctuation') {
    qaStatus.value = 'punctuation'
    qaTip.value = result.text
    showAnswerText(result.text, 'punctuation', result.icon)
    return
  }

  if (result.type === 'daily') {
    qaStatus.value = 'daily'
    qaTip.value = result.text
    showAnswerText(result.text, 'daily', result.icon)
    return
  }

  if (result.type === 'daily-locked') {
    qaStatus.value = 'daily-locked'
    qaTip.value = result.text
    showAnswerText(result.text, 'daily-locked', result.icon)
    return
  }

  if (result.type === 'shy') {
    qaStatus.value = 'shy'
    qaTip.value = result.text
    showAnswerText(result.text, 'shy', result.icon)
    return
  }

  if (result.type === 'casual') {
    qaStatus.value = 'casual'
    qaTip.value = result.text
    showAnswerText(result.text, 'casual', result.icon)
    return
  }

  qaStatus.value = 'normal'
  qaTip.value = t('mascot.answered', { question: cleanQuestion })
  showAnswerText(result.text, 'normal', result.icon)
}

function clearTimers() {
  if (showTimer) {
    window.clearTimeout(showTimer)
    showTimer = null
  }

  if (nextTimer) {
    window.clearTimeout(nextTimer)
    nextTimer = null
  }
}

function clearAnswerTimer() {
  if (answerTimer) {
    window.clearTimeout(answerTimer)
    answerTimer = null
  }
}

function clearTexts() {
  activeTexts.value = []
}

function createTextBatch() {
  if (!isLoopRunning) return

  clearTimers()
  clearTexts()

  const batchLines = getBatchLines()

  activeTexts.value = batchLines.map((text, index) => {
    textId += 1

    return {
      id: textId,
      text,
      style: getRandomPosition(index)
    }
  })

  showTimer = window.setTimeout(() => {
    clearTexts()

    if (!isLoopRunning) return

    nextTimer = window.setTimeout(() => {
      createTextBatch()
    }, NEXT_GAP)
  }, SHOW_TIME)
}

function startLoop() {
  if (isLoopRunning) return

  isLoopRunning = true
  clearTimers()
  clearTexts()

  nextTimer = window.setTimeout(() => {
    createTextBatch()
  }, 300)
}

function stopLoop() {
  isLoopRunning = false
  clearTimers()
  clearTexts()
}

function handleVisibilityChange() {
  if (document.hidden) {
    stopLoop()
  } else if (isMascotVisible) {
    startLoop()
  }
}

function handleMascotVisibility([entry]) {
  isMascotVisible = Boolean(entry?.isIntersecting)

  if (isMascotVisible && !document.hidden) {
    startLoop()
  } else {
    stopLoop()
  }
}

watch(currentLanguage, () => {
  qaStatus.value = 'normal'
  activeAnswer.value = null
  qaTip.value = t('mascot.tip.default')
  clearAnswerTimer()

  if (isLoopRunning) {
    clearTimers()
    createTextBatch()
  }
})

onMounted(() => {
  localLanguage.value = getSavedLanguage()
  qaTip.value = t('mascot.tip.default')

  if (typeof window !== 'undefined') {
    window.addEventListener('atri-language-change', handleLanguageChange)
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)

  if (mascotRoot.value && typeof IntersectionObserver !== 'undefined') {
    mascotObserver = new IntersectionObserver(handleMascotVisibility, {
      rootMargin: '240px 0px',
      threshold: 0.08
    })

    mascotObserver.observe(mascotRoot.value)
  } else {
    isMascotVisible = true
    startLoop()
  }
})

onActivated(() => {
  if (isMascotVisible) {
    startLoop()
  }
})

onDeactivated(() => {
  stopLoop()
})

onBeforeUnmount(() => {
  mascotObserver?.disconnect()
  stopLoop()
  clearAnswerTimer()

  if (typeof window !== 'undefined') {
    window.removeEventListener('atri-language-change', handleLanguageChange)
  }

  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <section ref="mascotRoot" class="mascot-easteregg-module">
    <div class="mascot-stage">
      <p
        v-for="item in activeTexts"
        :key="item.id"
        class="mascot-random-text"
        :style="item.style"
      >
        {{ item.text }}
      </p>

      <p
        v-if="activeAnswer"
        :key="activeAnswer.id"
        class="mascot-answer-pop"
        :class="{
          'is-error': activeAnswer.type === 'error',
          'is-punctuation': activeAnswer.type === 'punctuation',
          'is-daily': activeAnswer.type === 'daily',
          'is-daily-locked': activeAnswer.type === 'daily-locked',
          'is-shy': activeAnswer.type === 'shy',
          'is-casual': activeAnswer.type === 'casual'
        }"
        :style="activeAnswer.style"
      >
        <span
          v-if="activeAnswer.icon"
          class="mascot-answer-icon"
          :class="{
            'is-error': activeAnswer.type === 'error',
            'is-punctuation': activeAnswer.type === 'punctuation',
            'is-daily': activeAnswer.type === 'daily',
            'is-daily-locked': activeAnswer.type === 'daily-locked',
            'is-shy': activeAnswer.type === 'shy',
            'is-casual': activeAnswer.type === 'casual'
          }"
        >
          {{ activeAnswer.icon }}
        </span>

        <span>{{ activeAnswer.text }}</span>
      </p>

      <img
        :src="eggImage"
        :alt="t('mascot.imageAlt')"
        class="mascot-image"
        decoding="async"
        loading="lazy"
      >

      <div
        class="mascot-qa-card"
        :class="{
          'is-error': qaStatus === 'error',
          'is-punctuation': qaStatus === 'punctuation',
          'is-daily': qaStatus === 'daily',
          'is-daily-locked': qaStatus === 'daily-locked',
          'is-shy': qaStatus === 'shy',
          'is-casual': qaStatus === 'casual'
        }"
      >
        <div class="mascot-qa-header">
          <span class="mascot-qa-dot"></span>
          <span>{{ t('mascot.qa.title') }}</span>
        </div>

        <p
          class="mascot-qa-tip"
          :class="{
            'is-error': qaStatus === 'error',
            'is-punctuation': qaStatus === 'punctuation',
            'is-daily': qaStatus === 'daily',
            'is-daily-locked': qaStatus === 'daily-locked',
            'is-shy': qaStatus === 'shy',
            'is-casual': qaStatus === 'casual'
          }"
        >
          <span
            v-if="qaStatus === 'error'"
            class="mascot-tip-icon is-error"
          >
            !
          </span>

          <span
            v-if="qaStatus === 'punctuation'"
            class="mascot-tip-icon is-punctuation"
          >
            ?
          </span>

          <span
            v-if="qaStatus === 'daily'"
            class="mascot-tip-icon is-daily"
          >
            ✨
          </span>

          <span
            v-if="qaStatus === 'daily-locked'"
            class="mascot-tip-icon is-daily-locked"
          >
            ⏳
          </span>

          <span
            v-if="qaStatus === 'shy'"
            class="mascot-tip-icon is-shy"
          >
            ♥
          </span>

          <span
            v-if="qaStatus === 'casual'"
            class="mascot-tip-icon is-casual"
          >
            ♪
          </span>

          <span>{{ qaTip }}</span>
        </p>

        <form
          class="mascot-qa-form"
          @submit.prevent="askMascot()"
        >
          <div class="mascot-input-wrap">
            <span
              v-if="lastQuestion && !qaInput"
              class="mascot-last-question"
            >
              {{ t('mascot.lastQuestion') }}{{ lastQuestion }}
            </span>

            <input
              v-model="qaInput"
              class="mascot-qa-input"
              :class="{
                'is-error': qaStatus === 'error',
                'is-punctuation': qaStatus === 'punctuation',
                'is-daily': qaStatus === 'daily',
                'is-daily-locked': qaStatus === 'daily-locked',
                'is-shy': qaStatus === 'shy',
                'is-casual': qaStatus === 'casual',
                'has-last-question': lastQuestion && !qaInput
              }"
              type="text"
              :placeholder="lastQuestion ? '' : t('mascot.placeholder')"
              :disabled="isAsking"
            >
          </div>

          <button
            class="mascot-qa-button"
            type="submit"
            :disabled="isAsking"
          >
            {{ t('mascot.submit') }}
          </button>
        </form>

        <div class="mascot-quick-list">
          <button
            v-for="question in quickQuestions"
            :key="question"
            class="mascot-quick-button"
            type="button"
            :disabled="isAsking"
            @click="askMascot(question)"
          >
            {{ question }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mascot-easteregg-module {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 130vh;
  overflow: hidden;
  background: #fff;
  content-visibility: auto;
  contain-intrinsic-size: 1300px;
}

.mascot-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(1400px, 100%);
  min-height: 1200px;
  overflow: visible;
}

.mascot-image {
  position: relative;
  z-index: 2;
  display: block;
  width: min(1200px, 96vw);
  max-height: none;
  object-fit: contain;
  user-select: none;
  filter: drop-shadow(0 38px 46px rgba(40, 105, 150, 0.24));
  animation: mascot-idle 5.2s ease-in-out infinite;
}

.mascot-random-text,
.mascot-answer-pop {
  position: absolute;
  z-index: 4;
  max-width: 420px;
  margin: 0;
  padding: 0;
  color: #fff;
  font-size: clamp(22px, 2.4vw, 36px);
  font-weight: 900;
  line-height: 1.35;
  letter-spacing: 0.06em;
  white-space: nowrap;
  -webkit-text-stroke: 1.2px rgba(38, 148, 220, 0.95);
  text-shadow:
    0 0 4px rgba(255, 255, 255, 1),
    0 0 10px rgba(108, 205, 255, 0.95),
    0 0 22px rgba(72, 174, 255, 0.82),
    0 0 38px rgba(72, 174, 255, 0.48),
    0 5px 12px rgba(20, 58, 86, 0.32);
  scale: 1;
  opacity: 1;
  filter: blur(0);
  animation:
    mascot-text-pop 1.05s cubic-bezier(0.16, 1, 0.3, 1) both,
    mascot-text-float 3.2s ease-in-out infinite,
    mascot-text-glow 2.6s ease-in-out infinite;
  animation-delay:
    var(--delay, 0s),
    var(--delay, 0s),
    var(--delay, 0s);
  pointer-events: none;
}

.mascot-answer-pop {
  z-index: 7;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  max-width: 560px;
  padding: 10px 18px;
  border-radius: 999px;
  white-space: normal;
  text-align: center;
  background: rgba(238, 249, 255, 0.2);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.mascot-answer-pop.is-error {
  color: #fff;
  -webkit-text-stroke: 1.2px rgba(255, 61, 61, 0.95);
  background: rgba(255, 235, 235, 0.42);
  text-shadow:
    0 0 4px rgba(255, 255, 255, 1),
    0 0 10px rgba(255, 105, 105, 0.95),
    0 0 22px rgba(255, 68, 68, 0.82),
    0 0 38px rgba(255, 68, 68, 0.48),
    0 5px 12px rgba(108, 22, 22, 0.32);
}

.mascot-answer-pop.is-punctuation {
  color: #fff;
  -webkit-text-stroke: 1.2px rgba(255, 170, 45, 0.95);
  background: rgba(255, 248, 226, 0.46);
  text-shadow:
    0 0 4px rgba(255, 255, 255, 1),
    0 0 10px rgba(255, 202, 97, 0.95),
    0 0 22px rgba(255, 178, 56, 0.82),
    0 0 38px rgba(255, 178, 56, 0.48),
    0 5px 12px rgba(122, 74, 12, 0.28);
}

.mascot-answer-pop.is-daily {
  color: #fff;
  -webkit-text-stroke: 1.2px rgba(92, 181, 255, 0.95);
  background: rgba(230, 247, 255, 0.5);
  text-shadow:
    0 0 4px rgba(255, 255, 255, 1),
    0 0 10px rgba(112, 205, 255, 0.95),
    0 0 22px rgba(78, 176, 255, 0.82),
    0 0 38px rgba(78, 176, 255, 0.48),
    0 5px 12px rgba(22, 72, 108, 0.32);
}

.mascot-answer-pop.is-daily-locked {
  color: #fff;
  -webkit-text-stroke: 1.2px rgba(150, 150, 150, 0.95);
  background: rgba(245, 245, 245, 0.54);
  text-shadow:
    0 0 4px rgba(255, 255, 255, 1),
    0 0 10px rgba(180, 180, 180, 0.95),
    0 0 22px rgba(145, 145, 145, 0.72),
    0 5px 12px rgba(70, 70, 70, 0.28);
}

.mascot-answer-pop.is-shy {
  color: #fff;
  -webkit-text-stroke: 1.2px rgba(255, 94, 166, 0.95);
  background: rgba(255, 232, 244, 0.58);
  text-shadow:
    0 0 4px rgba(255, 255, 255, 1),
    0 0 10px rgba(255, 142, 200, 0.95),
    0 0 22px rgba(255, 92, 170, 0.82),
    0 0 38px rgba(255, 92, 170, 0.5),
    0 5px 12px rgba(128, 28, 78, 0.3);
  animation:
    mascot-text-pop 1.05s cubic-bezier(0.16, 1, 0.3, 1) both,
    mascot-shy-bounce 2.4s ease-in-out infinite,
    mascot-text-glow 2.6s ease-in-out infinite;
}

.mascot-answer-pop.is-casual {
  color: #fff;
  -webkit-text-stroke: 1.2px rgba(105, 180, 255, 0.95);
  background: rgba(232, 247, 255, 0.48);
  text-shadow:
    0 0 4px rgba(255, 255, 255, 1),
    0 0 10px rgba(132, 210, 255, 0.95),
    0 0 22px rgba(88, 180, 255, 0.78),
    0 0 34px rgba(88, 180, 255, 0.42),
    0 5px 12px rgba(30, 82, 120, 0.28);
}

.mascot-answer-pop.is-shy::before,
.mascot-answer-pop.is-shy::after {
  content: '♥';
  position: absolute;
  z-index: -1;
  color: #ff75b8;
  font-size: 28px;
  -webkit-text-stroke: 0;
  text-shadow:
    0 0 8px rgba(255, 160, 210, 0.9),
    0 0 18px rgba(255, 112, 185, 0.65);
  animation: mascot-heart-float 2.2s ease-in-out infinite;
}

.mascot-answer-pop.is-shy::before {
  left: -18px;
  top: -22px;
}

.mascot-answer-pop.is-shy::after {
  right: -16px;
  bottom: -24px;
  animation-delay: 0.45s;
}

.mascot-answer-icon,
.mascot-tip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 999px;
  color: #fff;
  font-weight: 1000;
}

.mascot-answer-icon {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  font-size: 22px;
  -webkit-text-stroke: 0;
  text-shadow: none;
}

.mascot-tip-icon {
  width: 20px;
  height: 20px;
  font-size: 15px;
}

.mascot-answer-icon.is-error,
.mascot-tip-icon.is-error {
  background: #ff3d3d;
  box-shadow:
    0 0 0 4px rgba(255, 70, 70, 0.16),
    0 0 18px rgba(255, 61, 61, 0.65);
}

.mascot-answer-icon.is-punctuation,
.mascot-tip-icon.is-punctuation {
  background: #ffae32;
  box-shadow:
    0 0 0 4px rgba(255, 182, 66, 0.18),
    0 0 18px rgba(255, 170, 45, 0.68);
}

.mascot-answer-icon.is-daily,
.mascot-tip-icon.is-daily {
  background: #58bfff;
  box-shadow:
    0 0 0 4px rgba(88, 191, 255, 0.18),
    0 0 18px rgba(88, 191, 255, 0.7);
}

.mascot-answer-icon.is-daily-locked,
.mascot-tip-icon.is-daily-locked {
  background: #9a9a9a;
  box-shadow:
    0 0 0 4px rgba(160, 160, 160, 0.16),
    0 0 18px rgba(130, 130, 130, 0.5);
}

.mascot-answer-icon.is-shy,
.mascot-tip-icon.is-shy {
  background: #ff75b8;
  box-shadow:
    0 0 0 4px rgba(255, 117, 184, 0.18),
    0 0 18px rgba(255, 94, 166, 0.72);
}

.mascot-answer-icon.is-casual,
.mascot-tip-icon.is-casual {
  background: #6ec8ff;
  box-shadow:
    0 0 0 4px rgba(110, 200, 255, 0.18),
    0 0 18px rgba(88, 180, 255, 0.68);
}

.mascot-qa-card {
  position: absolute;
  left: 50%;
  top: 56%;
  bottom: auto;
  z-index: 6;
  width: min(520px, calc(100% - 36px));
  padding: 18px;
  border: 1px solid rgba(111, 197, 255, 0.32);
  border-radius: 26px;
  background: rgba(238, 249, 255, 0.42);
  box-shadow:
    0 24px 60px rgba(50, 133, 190, 0.18),
    inset 0 0 18px rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transform: translate(-50%, -50%);
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease;
}

.mascot-qa-card.is-error {
  border-color: rgba(255, 78, 78, 0.58);
  background: rgba(255, 241, 241, 0.52);
  box-shadow:
    0 24px 60px rgba(219, 72, 72, 0.2),
    inset 0 0 18px rgba(255, 255, 255, 0.6);
}

.mascot-qa-card.is-punctuation {
  border-color: rgba(255, 181, 61, 0.58);
  background: rgba(255, 250, 232, 0.56);
  box-shadow:
    0 24px 60px rgba(219, 151, 48, 0.18),
    inset 0 0 18px rgba(255, 255, 255, 0.62);
}

.mascot-qa-card.is-daily {
  border-color: rgba(88, 191, 255, 0.58);
  background: rgba(232, 248, 255, 0.58);
  box-shadow:
    0 24px 60px rgba(60, 155, 220, 0.18),
    inset 0 0 18px rgba(255, 255, 255, 0.62);
}

.mascot-qa-card.is-daily-locked {
  border-color: rgba(160, 160, 160, 0.48);
  background: rgba(246, 246, 246, 0.58);
  box-shadow:
    0 24px 60px rgba(120, 120, 120, 0.14),
    inset 0 0 18px rgba(255, 255, 255, 0.62);
}

.mascot-qa-card.is-shy {
  border-color: rgba(255, 117, 184, 0.58);
  background: rgba(255, 238, 247, 0.62);
  box-shadow:
    0 24px 60px rgba(226, 78, 151, 0.2),
    inset 0 0 18px rgba(255, 255, 255, 0.65);
}

.mascot-qa-card.is-casual {
  border-color: rgba(110, 200, 255, 0.5);
  background: rgba(236, 249, 255, 0.58);
  box-shadow:
    0 24px 60px rgba(60, 155, 220, 0.16),
    inset 0 0 18px rgba(255, 255, 255, 0.62);
}

.mascot-qa-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #2088cf;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.mascot-qa-card.is-error .mascot-qa-header {
  color: #e54343;
}

.mascot-qa-card.is-punctuation .mascot-qa-header {
  color: #d98a18;
}

.mascot-qa-card.is-daily .mascot-qa-header {
  color: #238fd6;
}

.mascot-qa-card.is-daily-locked .mascot-qa-header {
  color: #777;
}

.mascot-qa-card.is-shy .mascot-qa-header {
  color: #e85a9f;
}

.mascot-qa-card.is-casual .mascot-qa-header {
  color: #238fd6;
}

.mascot-qa-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #64c8ff;
  box-shadow: 0 0 14px rgba(91, 199, 255, 0.9);
}

.mascot-qa-card.is-error .mascot-qa-dot {
  background: #ff4b4b;
  box-shadow: 0 0 14px rgba(255, 75, 75, 0.9);
}

.mascot-qa-card.is-punctuation .mascot-qa-dot {
  background: #ffae32;
  box-shadow: 0 0 14px rgba(255, 174, 50, 0.9);
}

.mascot-qa-card.is-daily .mascot-qa-dot {
  background: #58bfff;
  box-shadow: 0 0 14px rgba(88, 191, 255, 0.9);
}

.mascot-qa-card.is-daily-locked .mascot-qa-dot {
  background: #9a9a9a;
  box-shadow: 0 0 14px rgba(150, 150, 150, 0.6);
}

.mascot-qa-card.is-shy .mascot-qa-dot {
  background: #ff75b8;
  box-shadow: 0 0 14px rgba(255, 117, 184, 0.9);
}

.mascot-qa-card.is-casual .mascot-qa-dot {
  background: #6ec8ff;
  box-shadow: 0 0 14px rgba(110, 200, 255, 0.85);
}

.mascot-qa-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.34);
  color: #2b7dae;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.6;
  box-shadow: inset 0 0 16px rgba(119, 203, 255, 0.1);
}

.mascot-qa-tip.is-error {
  background: rgba(255, 235, 235, 0.76);
  color: #e54343;
  box-shadow: inset 0 0 16px rgba(255, 87, 87, 0.12);
}

.mascot-qa-tip.is-punctuation {
  background: rgba(255, 248, 226, 0.82);
  color: #d98a18;
  box-shadow: inset 0 0 16px rgba(255, 185, 73, 0.14);
}

.mascot-qa-tip.is-daily {
  background: rgba(232, 248, 255, 0.86);
  color: #238fd6;
  box-shadow: inset 0 0 16px rgba(88, 191, 255, 0.16);
}

.mascot-qa-tip.is-daily-locked {
  background: rgba(246, 246, 246, 0.86);
  color: #777;
  box-shadow: inset 0 0 16px rgba(120, 120, 120, 0.12);
}

.mascot-qa-tip.is-shy {
  background: rgba(255, 238, 247, 0.88);
  color: #e85a9f;
  box-shadow: inset 0 0 16px rgba(255, 117, 184, 0.16);
}

.mascot-qa-tip.is-casual {
  background: rgba(232, 248, 255, 0.86);
  color: #238fd6;
  box-shadow: inset 0 0 16px rgba(110, 200, 255, 0.16);
}

.mascot-qa-form {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.mascot-input-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
}

.mascot-last-question {
  position: absolute;
  left: 18px;
  top: 50%;
  z-index: 2;
  max-width: calc(100% - 34px);
  overflow: hidden;
  color: rgba(67, 139, 183, 0.34);
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  filter: blur(0.35px);
  opacity: 0.86;
  transform: translateY(-50%);
  pointer-events: none;
  user-select: none;
}

.mascot-qa-card.is-error .mascot-last-question {
  color: rgba(217, 59, 59, 0.34);
}

.mascot-qa-card.is-punctuation .mascot-last-question {
  color: rgba(217, 138, 24, 0.34);
}

.mascot-qa-card.is-daily .mascot-last-question {
  color: rgba(35, 143, 214, 0.34);
}

.mascot-qa-card.is-daily-locked .mascot-last-question {
  color: rgba(119, 119, 119, 0.34);
}

.mascot-qa-card.is-shy .mascot-last-question {
  color: rgba(232, 90, 159, 0.34);
}

.mascot-qa-card.is-casual .mascot-last-question {
  color: rgba(35, 143, 214, 0.34);
}

.mascot-qa-input {
  width: 100%;
  min-width: 0;
  height: 44px;
  padding: 0 15px;
  border: 1px solid rgba(88, 184, 245, 0.32);
  border-radius: 999px;
  outline: none;
  background: rgba(255, 255, 255, 0.48);
  color: #2b7dae;
  font-size: 14px;
  font-weight: 700;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.mascot-qa-input.has-last-question {
  color: transparent;
  caret-color: #2b7dae;
}

.mascot-qa-input::placeholder {
  color: rgba(67, 139, 183, 0.55);
}

.mascot-qa-input:focus {
  border-color: rgba(74, 180, 248, 0.9);
  background: rgba(255, 255, 255, 0.62);
  box-shadow: 0 0 0 4px rgba(113, 205, 255, 0.18);
}

.mascot-qa-input.is-error {
  border-color: rgba(255, 78, 78, 0.75);
  color: #d93b3b;
  box-shadow: 0 0 0 4px rgba(255, 82, 82, 0.14);
}

.mascot-qa-input.is-punctuation {
  border-color: rgba(255, 181, 61, 0.76);
  color: #d98a18;
  box-shadow: 0 0 0 4px rgba(255, 181, 61, 0.16);
}

.mascot-qa-input.is-daily {
  border-color: rgba(88, 191, 255, 0.76);
  color: #238fd6;
  box-shadow: 0 0 0 4px rgba(88, 191, 255, 0.16);
}

.mascot-qa-input.is-daily-locked {
  border-color: rgba(160, 160, 160, 0.6);
  color: #777;
  box-shadow: 0 0 0 4px rgba(160, 160, 160, 0.12);
}

.mascot-qa-input.is-shy {
  border-color: rgba(255, 117, 184, 0.76);
  color: #e85a9f;
  box-shadow: 0 0 0 4px rgba(255, 117, 184, 0.16);
}

.mascot-qa-input.is-casual {
  border-color: rgba(110, 200, 255, 0.72);
  color: #238fd6;
  box-shadow: 0 0 0 4px rgba(110, 200, 255, 0.14);
}

.mascot-qa-input.has-last-question.is-error,
.mascot-qa-input.has-last-question.is-punctuation,
.mascot-qa-input.has-last-question.is-daily,
.mascot-qa-input.has-last-question.is-daily-locked,
.mascot-qa-input.has-last-question.is-shy,
.mascot-qa-input.has-last-question.is-casual {
  color: transparent;
}

.mascot-qa-input:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.mascot-qa-button {
  flex: 0 0 auto;
  height: 44px;
  padding: 0 20px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #7bd4ff, #42aaf0);
  color: #fff;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(50, 152, 220, 0.26);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.mascot-qa-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 26px rgba(50, 152, 220, 0.34);
}

.mascot-qa-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
}

.mascot-quick-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.mascot-quick-button {
  width: 100%;
  min-height: 42px;
  padding: 8px 10px;
  border: 1px solid rgba(100, 190, 246, 0.32);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.36);
  color: #328fd0;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    opacity 0.2s ease;
}

.mascot-quick-button:hover {
  transform: translateY(-2px);
  background: rgba(223, 246, 255, 0.7);
}

.mascot-quick-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
}

@keyframes mascot-text-pop {
  0% {
    opacity: 0;
    filter: blur(12px);
    scale: 0.72;
  }

  100% {
    opacity: 1;
    filter: blur(0);
    scale: 1;
  }
}

@keyframes mascot-idle {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@keyframes mascot-text-float {
  0%,
  100% {
    translate: 0 0;
  }

  50% {
    translate: var(--float-x) var(--float-y);
  }
}

@keyframes mascot-text-glow {
  0%,
  100% {
    opacity: 0.92;
  }

  50% {
    opacity: 1;
  }
}

@keyframes mascot-shy-bounce {
  0%,
  100% {
    translate: 0 0;
    scale: 1;
  }

  50% {
    translate: 0 -12px;
    scale: 1.035;
  }
}

@keyframes mascot-heart-float {
  0%,
  100% {
    transform: translateY(0) scale(0.9) rotate(-8deg);
    opacity: 0.7;
  }

  50% {
    transform: translateY(-12px) scale(1.18) rotate(8deg);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .mascot-easteregg-module {
    min-height: 100vh;
  }

  .mascot-stage {
    min-height: 820px;
  }

  .mascot-image {
    width: min(620px, 98vw);
  }

  .mascot-random-text,
  .mascot-answer-pop {
    max-width: 320px;
    font-size: 18px;
    white-space: normal;
  }

  .mascot-answer-pop {
    top: 46% !important;
    max-width: 340px;
    padding: 9px 13px;
  }

  .mascot-answer-icon {
    min-width: 26px;
    height: 26px;
    font-size: 18px;
  }

  .mascot-qa-card {
    top: 58%;
    bottom: auto;
    padding: 15px;
    border-radius: 22px;
  }

  .mascot-qa-form {
    flex-direction: column;
  }

  .mascot-qa-button {
    width: 100%;
  }

  .mascot-quick-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .mascot-stage {
    min-height: 760px;
  }

  .mascot-image {
    width: min(460px, 100vw);
  }

  .mascot-random-text,
  .mascot-answer-pop {
    max-width: 270px;
    font-size: 16px;
  }

  .mascot-qa-tip {
    font-size: 13px;
  }

  .mascot-last-question {
    font-size: 12px;
  }

  .mascot-quick-button {
    font-size: 12px;
    min-height: 38px;
  }
}
</style>
