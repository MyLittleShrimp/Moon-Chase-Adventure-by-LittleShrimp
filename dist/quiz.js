// Original question wording; museum and public education references accompany every explanation.
export const QUIZ_PASS_COUNT=3;
export const QUIZ_ROUND_SIZE=5;
const source=(title,url)=>({title,url});
const refs={
 ceramic:source('故宫博物院 · 交泰尊与陶瓷工艺术语','https://www.dpm.org.cn/collection/ceramic/227183.html'),
 cloisonne:source('故宫博物院 · 掐丝珐琅','https://www.dpm.org.cn/lemmas/242343.html'),
 kesi:source('故宫博物院 · 通经断纬','https://www.dpm.org.cn/lemmas/242976.html'),
 bronzeIce:source('中国国家博物馆 · 凤凰故国·铜方鉴缶','https://www.chnmuseum.cn/portals/0/web/zt/202409fhgg/'),
 jadeSuit:source('中国国家博物馆 · 金缕玉柙','https://www.chnmuseum.cn/zp/zpml/kgfjp/202010/t20201013_247855.shtml'),
 inlay:source('故宫博物院 · 错金嵌松石樽','https://www.dpm.org.cn/collection/bronze/228563.html'),
 shell:source('故宫博物院 · 黑漆嵌螺钿间描金职贡图长方盒','https://www.dpm.org.cn/collection/lacquerware/228256.html'),
 lanting:source('台北故宫博物院 · 定武兰亭真本','https://digitalarchive.npm.gov.tw/Collection/Detail/14853?dep=P'),
 fuchun:source('台北故宫博物院 · 富春山居图','https://digitalarchive.npm.gov.tw/Painting/Content?Dept=P&pid=1193'),
 jizhi:source('台北故宫博物院 · 祭侄文稿','https://digitalarchive.npm.gov.tw/Collection/Detail/3?dep=P'),
 cattle:source('故宫博物院 · 韩滉五牛图卷','https://www.dpm.org.cn/collection/paint/234599.html'),
 luoshen:source('故宫博物院 · 洛神赋图卷（宋摹）','https://www.dpm.org.cn/collection/paint/234597.html'),
 handscroll:source('故宫博物院 · 宋克章草书进学解卷','https://www.dpm.org.cn/collection/handwriting/228331.html'),
 paintingTerms:source('故宫博物院 · 梁诗正写本与书画术语','https://www.dpm.org.cn/ancient/special/179776.html'),
 album:source('中国国家图书馆 · 拓片的装裱与修复','https://www.nlc.cn/pcab/gjxf/gjxf_xfxm/20230704_216431.shtml'),
 irrigation:source('承德市文物局 · 都江堰的文化遗产','https://wwj.chengde.gov.cn/art/2025/12/8/art_962_1094945.html'),
 zhangqian:source('中国国家博物馆 · 和合共生·封泥','https://www.chnmuseum.cn/portals/0/web/zt/202209hhgs/'),
 printing:source('中央纪委国家监委网站 · 梦溪笔谈的科技贡献','https://www.ccdi.gov.cn/lswhn/shijian/202209/t20220930_221618_m.html'),
 study:source('故宫博物院 · 文房用品','https://www.dpm.org.cn/collection/studies.html'),
 ding:source('中国国家博物馆 · 青铜之王','https://www.chnmuseum.cn/portals/0/web/zt/100n/guobao_content-4.html'),
 zun:source('中国国家博物馆 · 四羊方尊','https://www.chnmuseum.cn/Portals/0/web/zt/100n/guobao_content-8.html'),
 sancai:source('故宫博物院 · 唐三彩','https://www.dpm.org.cn/lemmas/239403.html'),
 oracle:source('中国国家博物馆 · 甲骨记忆','https://m.chnmuseum.cn/fw/zx_1010/gbxw/201911/t20191119_170999.shtml'),
 qingming:source('故宫博物院 · 清明上河图','https://www.dpm.org.cn/collection/paint/228226.html'),
 landscape:source('故宫博物院 · 千里江山图','https://www.dpm.org.cn/collection/paint/228354.html'),
 banquet:source('故宫博物院 · 韩熙载夜宴图','https://www.dpm.org.cn/collection/paint/228200.html'),
 sedan:source('故宫博物院 · 步辇图','https://intl.dpm.org.cn/Ceramics/64087.html'),
 jade:source('雅安市政府 · 蔺相如完璧归赵','https://www.yaan.gov.cn/credit/staticPage/15a7618f-02d0-46ba-9ce4-ab034e0bbf98.html'),
 idioms:source('北京市教委 · 成语典故','https://jw.beijing.gov.cn/language/ywsh/201606/t20160623_1056389.html'),
 goujian:source('绍兴市社科联 · 勾践','https://sxsk.sx.gov.cn/art/2024/11/14/art_1229811755_58722501.html'),
 practice:source('首都文明网 · 闻鸡起舞','https://www.bjwmb.gov.cn/zxfw/wmwx/ctmd/202011/t20201108_423189.htm'),
 history:source('中国国家博物馆 · 中华史诗美术大展','https://en.chnmuseum.cn/Portals/0/web/exhibition/exhibitions/161120Chines-Epic/')
};
// The first choice is the source answer; the run shuffles all choices before display.
const q=(id,category,prompt,choices,explanation,ref)=>({id,category,prompt,choices,answer:0,explanation,source:refs[ref]});
export const QUIZ_BANK=[
 q('study-tools','文物工艺','下列哪一组都是传统“文房四宝”？',['笔、墨、纸、砚','琴、棋、书、画','笔、墨、纸、镇尺','香炉、笔洗、印章、砚'],'文房四宝指书写所用的笔、墨、纸、砚。镇尺和笔洗也是文房用具，但不在“四宝”之列。','study'),
 q('ding-use','文物工艺','在成为重要礼器之前，“鼎”原本主要用来做什么？',['烹煮食物','测量时刻','储存粮种','演奏礼乐'],'鼎早期是烹煮、盛放食物的器具，后来逐渐承载礼制与权力的象征意义。','ding'),
 q('zun-use','文物工艺','青铜器“四羊方尊”中的“尊”，主要属于哪类器具？',['盛酒器','炊煮器','打击乐器','计量器'],'尊是古代盛酒器。商周时期的青铜尊也常用于祭祀礼仪。','zun'),
 q('sancai-material','文物工艺','展签上的“唐三彩”，从工艺上说属于哪一种？',['低温彩色铅釉陶','高温青花瓷','彩绘青铜器','无釉白瓷'],'唐三彩属于低温彩色铅釉陶。“陶”与“瓷”不能只凭器物是否彩色来区分。','sancai'),
 q('oracle-medium','文物工艺','商代甲骨文主要刻写在哪些材料上？',['龟甲和兽骨','竹简和木牍','丝绸和麻纸','铜镜和石碑'],'商代王室把占卜与记事内容刻在龟甲、兽骨上，这些文字被称为甲骨文。','oracle'),
 q('ding-era','文物工艺','“后母戊”青铜方鼎所属的时代是？',['商代','秦代','汉代','唐代'],'后母戊鼎是商代青铜铸造的代表器物，制作巨大器身需要成熟的工艺与协作。','ding'),
 q('qingming-artist','书画鉴赏','北宋《清明上河图》的作者是谁？',['张择端','王希孟','顾闳中','阎立本'],'张择端以人物、舟车与市街描写，展现了北宋都城及汴河两岸的生活。','qingming'),
 q('qingming-city','书画鉴赏','《清明上河图》描绘的北宋都城汴京，对应今天哪座城市？',['开封','杭州','洛阳','南京'],'汴京即今天的河南开封。画卷把郊野、河运和城中街市联系在一起。','qingming'),
 q('landscape-artist','书画鉴赏','《千里江山图》与哪位画家相联系？',['王希孟','张择端','韩滉','顾恺之'],'故宫藏《千里江山图》为北宋王希孟的传世名作，画面展现绵延辽阔的山河。','landscape'),
 q('landscape-style','书画鉴赏','《千里江山图》最具代表性的绘画风格是？',['青绿山水','水墨写意花鸟','白描人物','工笔走兽'],'这幅长卷以青绿山水著称，在传统画法基础上形成了鲜明的山水面貌。','landscape'),
 q('banquet-artist','书画鉴赏','《韩熙载夜宴图》的创作传统归于哪位五代画家？',['顾闳中','阎立本','吴道子','王希孟'],'该图归于顾闳中，现藏故宫的画卷为宋摹本，表现了韩熙载夜宴的多个场景。','banquet'),
 q('sedan-event','书画鉴赏','《步辇图》所表现的历史交往，与哪一项最相关？',['唐太宗接见吐蕃使者','汉武帝派遣张骞出使','郑和下西洋','玄奘归国译经'],'《步辇图》表现唐太宗接见吐蕃使者禄东赞的场面，与唐蕃交往有关。','sedan'),
 q('jade-envoy','历史典故','“完璧归赵”中，护送和氏璧出使秦国的是谁？',['蔺相如','廉颇','李牧','赵奢'],'蔺相如奉命带和氏璧出使秦国，在交涉中设法使宝玉完整回到赵国。','jade'),
 q('apology','历史典故','“负荆请罪”中，主动向蔺相如认错的是谁？',['廉颇','赵括','白起','乐毅'],'廉颇理解了蔺相如以国事为重的用意，背着荆条登门请罪，两人最终和好。','idioms'),
 q('goujian','历史典故','“卧薪尝胆”的故事通常与哪位国君联系在一起？',['越王勾践','吴王夫差','齐桓公','晋文公'],'这一成语通常用来讲述越王勾践在受挫后自我磨砺、谋求复兴的故事。','goujian'),
 q('morning-practice','历史典故','“闻鸡起舞”的故事中，相互勉励练剑的两人是？',['祖逖与刘琨','李白与杜甫','廉颇与蔺相如','管仲与鲍叔牙'],'故事见于《晋书·祖逖传》，祖逖和刘琨听到鸡鸣后起身练剑，后用来比喻及时奋发。','practice'),
 q('paper-strategy','历史典故','“纸上谈兵”这一典故通常用来谈论哪位战国人物？',['赵括','孙膑','吴起','田单'],'典故联系赵括在长平之战中的经历，用来提醒人们不能只会谈论理论而缺乏实际运用。','idioms'),
 q('shiji-form','历史典故','司马迁《史记》开创的史书体例是？',['纪传体','编年体','国别体','纪事本末体'],'《史记》以本纪、世家、列传等部分组织历史，开创了纪传体史书的写法。','history'),
 q('blue-white-pigment','文物工艺','青花瓷蓝色纹饰所用的主要呈色原料是？',['含钴的色料','含铜的红色料','金粉','朱砂'],'青花以含钴色料绘纹，再罩透明釉烧成，蓝色纹饰位于釉层之下。','ceramic'),
 q('cloisonne-craft','文物工艺','俗称“景泰蓝”的工艺是哪一种？',['铜胎掐丝珐琅','瓷胎青花','木胎描金','石胎浮雕'],'细铜丝在铜胎表面围出纹样，丝间填入珐琅釉料，经过烧制等工序形成装饰。','cloisonne'),
 q('kesi-weaving','文物工艺','“通经断纬”最能说明哪种传统丝织工艺？',['缂丝','刺绣','蜡染','夹缬'],'缂丝的经线贯通，彩色纬线依图案局部织入，因此可以织出轮廓清晰的花纹。','kesi'),
 q('bronze-ice','文物工艺','曾侯乙铜方鉴缶的内外两器之间，放入冰块主要为了什么？',['给内器中的酒降温','使青铜快速成型','测量冰块重量','打磨器物表面'],'内侧方缶盛酒，外侧方鉴与它之间留出的空隙盛冰，构成古代的冷酒用具。','bronzeIce'),
 q('jade-suit-use','文物工艺','汉代“金缕玉衣”主要用于哪种场合？',['贵族丧葬','将士出征','宫廷舞蹈','日常朝会'],'玉衣是由玉片连缀而成的殓服；名称中的“金缕”指编缀玉片所用的金丝。','jadeSuit'),
 q('metal-inlay','文物工艺','传统器物“错金银”装饰的一种常见做法是？',['把金银丝片嵌入器表凹槽','把整件器物铸成纯金','在器内填入金银粉','用金银水浸泡木器'],'嵌错工艺把金银丝片嵌入预留槽内，再磨平，使纹饰与器面结合。','inlay'),
 q('shell-inlay','文物工艺','漆器上的“螺钿”装饰，主要利用什么材料的光泽？',['贝壳','云母纸','彩色玻璃','金属箔'],'螺钿取贝壳中光泽适宜的部分，制成纹样后嵌入木器或漆器表面。','shell'),
 q('moulded-decoration','文物工艺','瓷器纹饰中的“模印”，通常怎样形成图案？',['用花纹印模压在半干坯体上','在烧成后贴纸花','用金属丝焊出轮廓','把釉面全部磨去'],'模印在坯体尚未完全干燥时压出纹样，施釉烧成后仍能看到凹凸变化。','ceramic'),
 q('openwork','文物工艺','展签写着“镂空”，器物纹饰通常具有哪种特点？',['部分材料被雕去，形成通透孔隙','表面完全没有纹饰','纹样只用墨线绘制','器物整体封闭不透光'],'镂空装饰通过雕去局部材料形成透空纹样，区别于只在表面绘画。','ceramic'),
 q('celadon-color','文物工艺','传统青釉瓷的青绿色，主要与釉料中的哪种元素有关？',['铁','金','银','钴'],'含铁釉料在合适的烧成条件下可以呈现青绿色；成色也受配方与窑内气氛影响。','ceramic'),
 q('lanting-author','书画鉴赏','兰亭雅集后写下《兰亭序》的书法家是谁？',['王羲之','颜真卿','柳公权','欧阳询'],'王羲之与友人在兰亭聚会、赋诗，所写序文成为流传深远的书法名篇。','lanting'),
 q('fuchun-author','书画鉴赏','元代山水名作《富春山居图》的作者是？',['黄公望','倪瓒','吴镇','王蒙'],'黄公望以富春山水入画，这件长卷是理解其山水画风格的重要作品。','fuchun'),
 q('jizhi-author','书画鉴赏','《祭侄文稿》是谁为殉难的侄儿所写？',['颜真卿','褚遂良','赵孟頫','米芾'],'颜真卿为侄儿颜季明写下祭文，稿中的涂改与笔势保留了书写时的强烈情感。','jizhi'),
 q('cattle-author','书画鉴赏','唐代《五牛图》的作者是谁？',['韩滉','韩干','吴道子','周昉'],'韩滉笔下五头牛姿态各异，以有力的线条表现形体与神态。','cattle'),
 q('luoshen-literature','书画鉴赏','《洛神赋图》的故事取材于哪位文学家的《洛神赋》？',['曹植','陶渊明','司马相如','屈原'],'画作把曹植笔下人与洛神相遇、离别的故事转化为连续画面；故宫藏卷为宋摹本。','luoshen'),
 q('scroll-direction','书画鉴赏','传统书画手卷通常按什么方向逐段展开欣赏？',['从右向左','从左向右','从下向上','从中间向两端同时展开'],'手卷横向展开，通常从右向左逐段观赏，适于在案头近距离细看。','handscroll'),
 q('scroll-tail','书画鉴赏','书画手卷的“尾纸”（拖尾）常可供鉴赏者做什么？',['题写跋语','调制颜料','研磨墨块','固定墙上挂钩'],'尾纸位于画心之后的装裱部分，除保护作用外，也常留下鉴赏者的题跋。','cattle'),
 q('baimiao-technique','书画鉴赏','中国画中的“白描”主要采用什么方式表现物象？',['用墨线勾勒，不施彩色','用白色颜料覆盖画面','用彩色块面代替轮廓','只用金粉描绘轮廓'],'白描重在线条的组织与变化，以墨线勾画形象，不靠彩色填涂。','paintingTerms'),
 q('album-format','书画鉴赏','蝴蝶装、推篷装和经折装，可以是哪种拓本装裱形式的式样？',['册页装','立轴装','镜框装','屏风装'],'拓本可以装成册页，蝴蝶装、推篷装和经折装都是常见式样。','album'),
 q('gold-pigment','书画鉴赏','书画材料里的“泥金”通常指什么？',['以金箔等制成的金色颜料','含金沙的普通泥土','烧成金色的陶土','调入黄色的墨汁'],'泥金把金料研细并加入胶等材料制成，可用于书写或绘画。','paintingTerms'),
 q('dujiangyan-builder','历史典故','主持修建都江堰的战国蜀郡太守是谁？',['李冰','郑国','西门豹','大禹'],'李冰主持建堰，工程利用当地水势分水、排沙，至今仍发挥作用。','irrigation'),
 q('zhangqian-mission','历史典故','汉武帝时期，受命出使西域、推动东西交流的是谁？',['张骞','班超','甘英','苏武'],'张骞出使西域，促进了汉朝与西域的联系，后来受封博望侯。','zhangqian'),
 q('zhenghe-dynasty','历史典故','郑和率领船队七下西洋，发生在哪个朝代？',['明代','宋代','元代','清代'],'郑和的远航始于明永乐年间，促进了中国与亚非多地的交往。','history'),
 q('movable-type-record','历史典故','详细记载毕昇活字印刷术的《梦溪笔谈》，作者是谁？',['沈括','宋应星','徐光启','李时珍'],'沈括在《梦溪笔谈》中记录多种技术，包括毕昇的活字印刷方法。','printing'),
 q('retreat-three','历史典故','“退避三舍”典故中的晋国国君重耳，后来被称为？',['晋文公','晋献公','晋惠公','晋景公'],'重耳即晋文公，典故把他的退让与城濮之战联系起来。','idioms'),
 q('rescue-zhao','历史典故','“围魏救赵”中，孙膑主张怎样解除赵国的危急？',['进攻魏国要地，迫使魏军回救','直接攻打齐国都城','撤去赵国全部城防','把军队调去攻打楚国'],'魏军围赵，齐军攻魏迫其回援，以此解除赵国之围。','idioms'),
 q('cavalry-reform','历史典故','推动“胡服骑射”改革的战国国君是谁？',['赵武灵王','秦孝公','魏文侯','齐宣王'],'赵武灵王调整军服、发展骑射，以增强军队机动性。','idioms'),
 q('stolen-tally','历史典故','“窃符救赵”中的魏国公子魏无忌，封号是什么？',['信陵君','平原君','孟尝君','春申君'],'信陵君取得兵符、调动魏军援赵，成为这一典故的主角。','idioms'),
 q('mountains-water','历史典故','“高山流水”知音故事中的两位人物是？',['伯牙与钟子期','嵇康与阮籍','李白与杜甫','管仲与鲍叔牙'],'伯牙弹琴，钟子期领会琴中意境，后人常借此说知音难得。','idioms'),
 q('well-rumour','历史典故','“穿井得一人”故事中，丁家打井后实际得到的是什么？',['节省了一个人的取水劳力','从井中救出一个人','在井里发现一尊人像','雇到一个专门看井的人'],'丁家省了取水劳力，传闻却变成挖出一个人，提醒人们核实信息。','idioms')
];
function shuffled(items,rng){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function createQuizRun(previousIds=[],rng=Math.random){
 const fresh=QUIZ_BANK.filter(q=>!previousIds.includes(q.id));
 const pool=shuffled(fresh.length>=QUIZ_ROUND_SIZE?fresh:QUIZ_BANK,rng);
 // Include all three themes so a visit feels like a small museum tour.
 const selected=[];for(const category of ['文物工艺','书画鉴赏','历史典故'])selected.push(pool.find(q=>q.category===category));
 const round=[...selected.filter(Boolean),...pool.filter(q=>!selected.includes(q))].slice(0,QUIZ_ROUND_SIZE);
 const questions=shuffled(round,rng).map(q=>{const order=shuffled([0,1,2,3],rng);return {...q,choices:order.map(i=>q.choices[i]),answer:order.indexOf(q.answer)};});
 return {questions,index:0,correct:0,attempts:0,selected:null,won:false,finished:false};
}
export function answerQuiz(run,option){
 if(run.finished||run.selected!==null||!Number.isInteger(option)||option<0||option>3)return run;
 const correct=run.correct+Number(option===run.questions[run.index].answer),attempts=run.attempts+1,won=correct>=QUIZ_PASS_COUNT;
 return {...run,correct,attempts,selected:option,won,finished:won||attempts===run.questions.length};
}
export function nextQuizQuestion(run){return run.selected===null||run.finished?run:{...run,index:run.index+1,selected:null};}
