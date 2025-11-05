import { useSettingsStore, Language } from '../store/settingsStore';
import { quizData as quizDataFR, QuizQuestion } from '../data/quizData';

// English translations for quiz data
const quizDataEN: QuizQuestion[] = [
    {
        question: "Which of these symptoms is typical of hypoglycemia?",
        options: ["Intense thirst", "Dizziness and weakness", "Frequent need to urinate"],
        correctAnswerIndex: 1,
        explanation: "Hypoglycemia (low blood sugar) causes tremors, sweating, weakness, and dizziness. Thirst and urination are signs of hyperglycemia."
    },
    {
        question: "To correct hypoglycemia, 15g of sugar is usually given. This is equivalent to:",
        options: ["A large glass of soda", "3 sugar cubes", "A whole apple"],
        correctAnswerIndex: 1,
        explanation: "3 sugar cubes (5g each) or a small juice box represents about 15g of fast-acting carbohydrates, ideal for raising blood sugar."
    },
    {
        question: "How often is it recommended to change an insulin pump catheter?",
        options: ["Every day", "Every 2 to 3 days", "Every week"],
        correctAnswerIndex: 1,
        explanation: "Changing the infusion site every 2 to 3 days is crucial to ensure good insulin absorption and prevent infections or lipodystrophy."
    },
    {
        question: "Which type of food has the SLOWEST impact on blood sugar?",
        options: ["Candies", "White bread", "Lentils"],
        correctAnswerIndex: 2,
        explanation: "Lentils, rich in fiber and protein, are complex carbohydrates. Their digestion is slower, leading to a gradual increase in blood sugar."
    },
    {
        question: "What do 'ketones' (or ketone bodies) in the blood or urine mean?",
        options: ["An excess of sugar in the body", "A significant lack of insulin", "Good hydration"],
        correctAnswerIndex: 1,
        explanation: "The presence of ketones indicates that the body lacks insulin and is starting to burn fat for energy. It's a warning sign that requires prompt action."
    },
    {
        question: "After a correction injection for hyperglycemia, how long should you wait before re-checking/re-correcting?",
        options: ["30 minutes", "1 hour", "At least 2-3 hours"],
        correctAnswerIndex: 2,
        explanation: "Fast-acting insulin takes time to fully work. You must wait at least the delay defined in the PAI (often 2-3h) to avoid insulin 'stacking' and the risk of hypoglycemia."
    },
    {
        question: "What is the main advantage of counting 'net' carbs (total - fiber)?",
        options: ["It's easier to calculate", "It's more accurate because fiber has little impact on blood sugar", "It allows you to eat more"],
        correctAnswerIndex: 1,
        explanation: "Fibers are not digested in the same way as other carbohydrates and raise blood sugar very little. Net carb counting is therefore often more accurate."
    }
];

const quizDataTR: QuizQuestion[] = [
    {
        question: "Bu belirtilerden hangisi hipogliseminin tipik bir belirtisidir?",
        options: ["Yoğun susuzluk", "Baş dönmesi ve halsizlik", "Sık idrara çıkma ihtiyacı"],
        correctAnswerIndex: 1,
        explanation: "Hipoglisemi (düşük kan şekeri) titreme, terleme, halsizlik ve baş dönmesine neden olur. Susuzluk ve idrara çıkma hiperglisemi belirtileridir."
    },
    {
        question: "Hipoglisemiyi düzeltmek için genellikle 15g şeker verilir. Bu neye eşdeğerdir:",
        options: ["Büyük bir bardak gazoz", "3 küp şeker", "Bütün bir elma"],
        correctAnswerIndex: 1,
        explanation: "3 küp şeker (her biri 5g) veya küçük bir meyve suyu kutusu, kan şekerini yükseltmek için ideal olan yaklaşık 15g hızlı etkili karbonhidratı temsil eder."
    },
    {
        question: "Bir insülin pompası kateterinin ne sıklıkla değiştirilmesi önerilir?",
        options: ["Her gün", "Her 2 ila 3 günde bir", "Her hafta"],
        correctAnswerIndex: 1,
        explanation: "İnfüzyon bölgesini her 2 ila 3 günde bir değiştirmek, iyi insülin emilimini sağlamak ve enfeksiyonları veya lipodistrofiyi önlemek için çok önemlidir."
    },
    {
        question: "Hangi tür yiyeceğin kan şekeri üzerinde en YAVAŞ etkisi vardır?",
        options: ["Şekerlemeler", "Beyaz ekmek", "Mercimek"],
        correctAnswerIndex: 2,
        explanation: "Lif ve protein açısından zengin olan mercimek, kompleks karbonhidratlardır. Sindirimleri daha yavaştır, bu da kan şekerinde kademeli bir artışa neden olur."
    },
    {
        question: "Kandaki veya idrardaki 'ketonlar' ne anlama gelir?",
        options: ["Vücutta aşırı şeker", "Önemli bir insülin eksikliği", "İyi hidrasyon"],
        correctAnswerIndex: 1,
        explanation: "Ketonların varlığı, vücudun insülin eksikliği olduğunu ve enerji için yağ yakmaya başladığını gösterir. Bu, hızlı hareket gerektiren bir uyarı işaretidir."
    },
    {
        question: "Hiperglisemi için bir düzeltme enjeksiyonundan sonra, tekrar kontrol etmeden/düzeltmeden önce ne kadar beklemelisiniz?",
        options: ["30 dakika", "1 saat", "En az 2-3 saat"],
        correctAnswerIndex: 2,
        explanation: "Hızlı etkili insülinin tam olarak etki etmesi zaman alır. İnsülin 'birikmesini' ve hipoglisemi riskini önlemek için PAI'de tanımlanan süreyi (genellikle 2-3 saat) beklemelisiniz."
    },
    {
        question: "'Net' karbonhidratları (toplam - lif) saymanın ana avantajı nedir?",
        options: ["Hesaplaması daha kolaydır", "Liflerin kan şekeri üzerinde çok az etkisi olduğu için daha doğrudur", "Daha fazla yemenizi sağlar"],
        correctAnswerIndex: 1,
        explanation: "Lifler diğer karbonhidratlarla aynı şekilde sindirilmez ve kan şekerini çok az yükseltir. Bu nedenle net karbonhidrat sayımı genellikle daha doğrudur."
    }
];

const quizDataAR: QuizQuestion[] = [
    {
        question: "أي من هذه الأعراض يعتبر نموذجيًا لنقص السكر في الدم؟",
        options: ["عطش شديد", "دوار وضعف", "حاجة متكررة للتبول"],
        correctAnswerIndex: 1,
        explanation: "يسبب نقص السكر في الدم (انخفاض نسبة السكر في الدم) الرعشة والتعرق والضعف والدوار. العطش والتبول من علامات ارتفاع السكر في الدم."
    },
    {
        question: "لتصحيح نقص السكر في الدم، عادة ما يتم إعطاء 15 جرامًا من السكر. هذا يعادل:",
        options: ["كوب كبير من الصودا", "3 مكعبات سكر", "تفاحة كاملة"],
        correctAnswerIndex: 1,
        explanation: "3 مكعبات سكر (5 جرام لكل منها) أو علبة عصير صغيرة تمثل حوالي 15 جرامًا من الكربوهيدرات سريعة المفعول، وهي مثالية لرفع نسبة السكر في الدم."
    },
    {
        question: "كم مرة يوصى بتغيير قسطرة مضخة الأنسولين؟",
        options: ["كل يوم", "كل 2 إلى 3 أيام", "كل أسبوع"],
        correctAnswerIndex: 1,
        explanation: "يعد تغيير موقع التسريب كل 2 إلى 3 أيام أمرًا بالغ الأهمية لضمان امتصاص جيد للأنسولين ومنع الالتهابات أو ضمور الدهون."
    },
    {
        question: "أي نوع من الطعام له أبطأ تأثير على نسبة السكر في الدم؟",
        options: ["الحلويات", "الخبز الأبيض", "العدس"],
        correctAnswerIndex: 2,
        explanation: "العدس، الغني بالألياف والبروتين، هو من الكربوهيدرات المعقدة. هضمه أبطأ، مما يؤدي إلى زيادة تدريجية في نسبة السكر في الدم."
    },
    {
        question: "ماذا تعني 'الكيتونات' في الدم أو البول؟",
        options: ["زيادة السكر في الجسم", "نقص كبير في الأنسولين", "ترطيب جيد"],
        correctAnswerIndex: 1,
        explanation: "يشير وجود الكيتونات إلى أن الجسم يفتقر إلى الأنسولين ويبدأ في حرق الدهون للحصول على الطاقة. إنها علامة تحذير تتطلب اتخاذ إجراء سريع."
    },
    {
        question: "بعد حقنة تصحيحية لارتفاع السكر في الدم، كم من الوقت يجب أن تنتظر قبل إعادة الفحص/إعادة التصحيح؟",
        options: ["30 دقيقة", "ساعة واحدة", "على الأقل 2-3 ساعات"],
        correctAnswerIndex: 2,
        explanation: "يستغرق الأنسولين سريع المفعول وقتًا حتى يعمل بشكل كامل. يجب عليك الانتظار على الأقل للتأخير المحدد في PAI (غالبًا 2-3 ساعات) لتجنب 'تراكم' الأنسولين وخطر نقص السكر في الدم."
    },
    {
        question: "ما هي الميزة الرئيسية لحساب الكربوهيدرات 'الصافية' (الإجمالي - الألياف)؟",
        options: ["من الأسهل حسابها", "إنها أكثر دقة لأن الألياف لها تأثير ضئيل على نسبة السكر في الدم", "تسمح لك بتناول المزيد"],
        correctAnswerIndex: 1,
        explanation: "لا يتم هضم الألياف بنفس طريقة الكربوهيدرات الأخرى وترفع نسبة السكر في الدم بشكل طفيف جدًا. وبالتالي، غالبًا ما يكون حساب الكربوهيدرات الصافية أكثر دقة."
    }
];

const quizDataUR: QuizQuestion[] = [
    {
        question: "ان میں سے کون سی علامت ہائپوگلیسیمیا کی عام علامت ہے؟",
        options: ["شدید پیاس", "چکر آنا اور کمزوری", "بار بار پیشاب آنے کی ضرورت"],
        correctAnswerIndex: 1,
        explanation: "ہائپوگلیسیمیا (کم بلڈ شوگر) کپکپی، پسینہ، کمزوری، اور چکر آنے کا سبب بنتا ہے۔ پیاس اور پیشاب ہائپرگلیسیمیا کی علامات ہیں۔"
    },
    {
        question: "ہائپوگلیسیمیا کو درست کرنے کے لئے، عام طور پر 15 گرام چینی دی جاتی ہے۔ یہ اس کے برابر ہے:",
        options: ["ایک بڑا گلاس سوڈا", "3 چینی کے کیوبز", "ایک پورا سیب"],
        correctAnswerIndex: 1,
        explanation: "3 چینی کے کیوبز (ہر ایک 5 گرام) یا ایک چھوٹا جوس باکس تقریباً 15 گرام تیزی سے کام کرنے والے کاربوہائیڈریٹ کی نمائندگی کرتا ہے، جو بلڈ شوگر بڑھانے کے لئے مثالی ہے۔"
    },
    {
        question: "انسولین پمپ کیتھیٹر کو کتنی بار تبدیل کرنے کی سفارش کی جاتی ہے؟",
        options: ["ہر روز", "ہر 2 سے 3 دن میں", "ہر ہفتے"],
        correctAnswerIndex: 1,
        explanation: "انفیوژن سائٹ کو ہر 2 سے 3 دن میں تبدیل کرنا اچھے انسولین جذب کو یقینی بنانے اور انفیکشن یا لیپوڈیسٹروفی کو روکنے کے لئے بہت ضروری ہے۔"
    },
    {
        question: "کس قسم کی خوراک کا بلڈ شوگر پر سب سے سست اثر ہوتا ہے؟",
        options: ["کینڈی", "سفید روٹی", "دال"],
        correctAnswerIndex: 2,
        explanation: "دال، جو فائبر اور پروٹین سے بھرپور ہوتی ہے، پیچیدہ کاربوہائیڈریٹ ہیں۔ ان کا ہاضمہ سست ہوتا ہے، جس کی وجہ سے بلڈ شوگر میں بتدریج اضافہ ہوتا ہے۔"
    },
    {
        question: "خون یا پیشاب میں 'کیٹونز' کا کیا مطلب ہے؟",
        options: ["جسم میں اضافی شکر", "انسولین کی نمایاں کمی", "اچھی ہائیڈریشن"],
        correctAnswerIndex: 1,
        explanation: "کیٹونز کی موجودگی اس بات کی نشاندہی کرتی ہے کہ جسم میں انسولین کی کمی ہے اور وہ توانائی کے لیے چربی جلانا شروع کر رہا ہے۔ یہ ایک انتباہی علامت ہے جس پر فوری کارروائی کی ضرورت ہے۔"
    },
    {
        question: "ہائپرگلیسیمیا کے لئے اصلاحی انجیکشن کے بعد، دوبارہ جانچنے/اصلاح کرنے سے پہلے آپ کو کتنا انتظار کرنا چاہئے؟",
        options: ["30 منٹ", "1 گھنٹہ", "کم از کم 2-3 گھنٹے"],
        correctAnswerIndex: 2,
        explanation: "تیزی سے کام کرنے والی انسولین کو مکمل طور پر کام کرنے میں وقت لگتا ہے۔ انسولین 'اسٹیکنگ' اور ہائپوگلیسیمیا کے خطرے سے بچنے کے لئے آپ کو کم از کم PAI میں بیان کردہ تاخیر (اکثر 2-3 گھنٹے) کا انتظار کرنا ہوگا۔"
    },
    {
        question: "'نیٹ' کاربوہائیڈریٹ (کل - فائبر) شمار کرنے کا بنیادی فائدہ کیا ہے؟",
        options: ["اس کا حساب لگانا آسان ہے", "یہ زیادہ درست ہے کیونکہ فائبر کا بلڈ شوگر پر بہت کم اثر پڑتا ہے", "یہ آپ کو زیادہ کھانے کی اجازت دیتا ہے"],
        correctAnswerIndex: 1,
        explanation: "فائبر دوسرے کاربوہائیڈریٹ کی طرح ہضم نہیں ہوتے ہیں اور بلڈ شوگر کو بہت کم بڑھاتے ہیں۔ لہذا نیٹ کارب کا شمار اکثر زیادہ درست ہوتا ہے۔"
    }
];

const quizDataPS: QuizQuestion[] = [
    {
        question: "د دې نښو څخه کوم یو د هایپوګلیسیمیا ځانګړی نښه ده؟",
        options: ["شدیده تنده", "سرخوږی او ضعف", "په مکرر ډول د ادرار کولو اړتیا"],
        correctAnswerIndex: 1,
        explanation: "هایپوګلیسیمیا (د وینې ټیټ شکر) د لړزې، خولې، ضعف او سرخوږي لامل کیږي. تنده او ادرار د هایپرګلیسیمیا نښې دي."
    },
    {
        question: "د هایپوګلیسیمیا د سمولو لپاره، معمولا 15 ګرامه بوره ورکول کیږي. دا د دې سره مساوي ده:",
        options: ["یو لوی ګیلاس سوډا", "3 د بورې کیوبونه", "یوه پوره مڼه"],
        correctAnswerIndex: 1,
        explanation: "3 د بورې کیوبونه (هر یو 5 ګرامه) یا د جوس یو کوچنی بکس شاوخوا 15 ګرامه ګړندي کاربوهایډریټ استازیتوب کوي، چې د وینې د شکر لوړولو لپاره غوره دی."
    },
    {
        question: "د انسولین پمپ کیتیټر څو ځله بدلولو سپارښتنه کیږي؟",
        options: ["هره ورځ", "هر 2 څخه تر 3 ورځو پورې", "هره اونۍ"],
        correctAnswerIndex: 1,
        explanation: "د 2 څخه تر 3 ورځو پورې د انفیوژن سایټ بدلول د انسولین ښه جذب ډاډمن کولو او د انتاناتو یا لیپوډیسټروفي مخنیوي لپاره خورا مهم دي."
    },
    {
        question: "کوم ډول خواړه د وینې په شکر باندې ترټولو ورو اغیزه لري؟",
        options: ["کینډی", "سپینه ډوډۍ", "دال"],
        correctAnswerIndex: 2,
        explanation: "دال، چې په فایبر او پروټین کې بډای دی، پیچلي کاربوهایډریټ دي. د دوی هضم ورو دی، چې د وینې په شکر کې د تدریجي زیاتوالي لامل کیږي."
    },
    {
        question: "په وینه یا ادرار کې 'کیٹونز' څه معنی لري؟",
        options: ["په بدن کې د بورې ډیروالی", "د انسولین د پام وړ نشتوالی", "ښه هایډریشن"],
        correctAnswerIndex: 1,
        explanation: "د کیټونز شتون په ګوته کوي چې بدن د انسولین کمښت لري او د انرژі لپاره د غوړ سوځول پیل کوي. دا یوه خبرداری نښه ده چې چټک اقدام ته اړتیا لري."
    },
    {
        question: "د هایپرګلیسیمیا لپاره د سمون انجیکشن وروسته، تاسو باید د بیا کتنې / بیا سمون څخه مخکې څومره انتظار وکړئ؟",
        options: ["30 دقیقې", "1 ساعت", "لږترلږه 2-3 ساعته"],
        correctAnswerIndex: 2,
        explanation: "ګړندي عمل کونکي انسولین په بشپړ ډول کار کولو لپاره وخت نیسي. تاسو باید لږترلږه په PAI کې تعریف شوي ځنډ (اکثرا 2-3 ساعته) انتظار وکړئ ترڅو د انسولین 'سټیکینګ' او د هایپوګلیسیمیا خطر څخه مخنیوی وشي."
    },
    {
        question: "د 'خالص' کاربوهایډریټ (ټول - فایبر) شمیرلو اصلي ګټه څه ده؟",
        options: ["دا محاسبه کول اسانه دي", "دا ډیر دقیق دی ځکه چې فایبر د وینې په شکر باندې لږ اغیزه لري", "دا تاسو ته اجازه درکوي چې ډیر وخورئ"],
        correctAnswerIndex: 1,
        explanation: "فایبرونه د نورو کاربوهایډریټ په څیر نه هضم کیږي او د وینې شکر ډیر لږ لوړوي. له همدې امله د خالص کاربوهایډریټ شمیرل اکثرا ډیر دقیق وي."
    }
];

const quizDataUK: QuizQuestion[] = [
    {
        question: "Який з цих симптомів є типовим для гіпоглікемії?",
        options: ["Сильна спрага", "Запаморочення та слабкість", "Часта потреба в сечовипусканні"],
        correctAnswerIndex: 1,
        explanation: "Гіпоглікемія (низький рівень цукру в крові) викликає тремтіння, пітливість, слабкість і запаморочення. Спрага і сечовипускання є ознаками гіперглікемії."
    },
    {
        question: "Для корекції гіпоглікемії зазвичай дають 15 г цукру. Це еквівалентно:",
        options: ["Велика склянка газованої води", "3 кубики цукру", "Ціле яблуко"],
        correctAnswerIndex: 1,
        explanation: "3 кубики цукру (по 5 г кожен) або невелика коробка соку становлять близько 15 г швидкодіючих вуглеводів, ідеально підходять для підвищення рівня цукру в крові."
    },
    {
        question: "Як часто рекомендується міняти катетер інсулінової помпи?",
        options: ["Щодня", "Кожні 2-3 дні", "Щотижня"],
        correctAnswerIndex: 1,
        explanation: "Зміна місця інфузії кожні 2-3 дні є надзвичайно важливою для забезпечення хорошого всмоктування інсуліну та запобігання інфекціям або ліподистрофії."
    },
    {
        question: "Який тип їжі має НАЙПОВІЛЬНІШИЙ вплив на рівень цукру в крові?",
        options: ["Цукерки", "Білий хліб", "Сочевиця"],
        correctAnswerIndex: 2,
        explanation: "Сочевиця, багата на клітковину та білок, є складним вуглеводом. Її травлення відбувається повільніше, що призводить до поступового підвищення рівня цукру в крові."
    },
    {
        question: "Що означають 'кетони' в крові або сечі?",
        options: ["Надлишок цукру в організмі", "Значна нестача інсуліну", "Хороша гідратація"],
        correctAnswerIndex: 1,
        explanation: "Наявність кетонів вказує на те, що в організмі не вистачає інсуліну і він починає спалювати жир для отримання енергії. Це попереджувальний знак, який вимагає негайних дій."
    },
    {
        question: "Після корекційної ін'єкції при гіперглікемії, скільки часу потрібно чекати перед повторною перевіркою/корекцією?",
        options: ["30 хвилин", "1 година", "Щонайменше 2-3 години"],
        correctAnswerIndex: 2,
        explanation: "Швидкодіючий інсулін потребує часу, щоб повністю подіяти. Ви повинні зачекати принаймні затримку, визначену в PAI (часто 2-3 години), щоб уникнути 'накопичення' інсуліну та ризику гіпоглікемії."
    },
    {
        question: "Яка головна перевага підрахунку 'чистих' вуглеводів (загальні - клітковина)?",
        options: ["Це легше розрахувати", "Це точніше, оскільки клітковина мало впливає на рівень цукру в крові", "Це дозволяє їсти більше"],
        correctAnswerIndex: 1,
        explanation: "Клітковина не перетравлюється так само, як інші вуглеводи, і дуже мало підвищує рівень цукру в крові. Тому підрахунок чистих вуглеводів часто є більш точним."
    }
];

const translations = {
    fr: {
        // Common
        "common_loading": "Chargement",
        "common_optional": "Optionnel",
        "common_confirm": "Confirmer",
        "common_cancel": "Annuler",
        "common_save": "Enregistrer",
        "common_saveChanges": "Enregistrer les changements",
        "common_creating": "Création...",
        "common_firstName": "Prénom",
        "common_name": "Nom",
        "common_birthDate": "Date de naissance",
        "common_min": "Min",
        "common_max": "Max",
        "common_rapid": "Rapide",
        "common_correction": "Correction",
        "common_carbs": "Glucides",
        "common_description": "Description",
        "common_datetime": "Date et Heure",

        // Navigation
        "nav_home": "Accueil",
        "nav_journal": "Activité",
        "nav_calculator": "Calcul",
        "nav_emergency": "Urgence",
        "nav_settings": "Réglages",

        // Auth & Onboarding
        "auth_appTitle": "Diab'Assistant T1",
        "auth_loginTitle": "Connexion",
        "auth_signupTitle": "Inscription",
        "auth_username": "Pseudo",
        "auth_password": "Mot de passe",
        "auth_confirmPassword": "Confirmer le mot de passe",
        "auth_loginButton": "Se connecter",
        "auth_signupButton": "Créer mon compte",
        "auth_noAccount": "Pas encore de compte ?",
        "auth_signupLink": "S'inscrire",
        "auth_hasAccount": "Déjà un compte ?",
        "auth_loginLink": "Se connecter",
        "onboarding_welcome": "Bienvenue !",
        "onboarding_subtitle": "Configurez le profil de votre enfant.",
        "onboarding_firstNamePlaceholder": "ex: Léo",
        "onboarding_startButton": "Commencer",
        "onboarding_helperText": "Ces informations sont stockées localement sur votre appareil et ne sont jamais partagées.",
        
        // Dashboard
        "greeting_morning": "Bonjour",
        "greeting_afternoon": "Bon après-midi",
        "greeting_evening": "Bonsoir",
        "dashboard_currentGlucose": "Glycémie actuelle",
        "dashboard_noMeasure": "Aucune mesure",
        "dashboard_todayChecks": (count: number) => `${count} contrôle${count > 1 ? 's' : ''} aujourd'hui`,
        "dashboard_action_calculate": "Calculer",
        "dashboard_action_bolus": "Bolus",
        "dashboard_action_measure": "Mesure",
        "dashboard_action_emergency": "Urgence",
        "dashboard_eventsTitle": "Agenda à venir",
        "dashboard_noEvents": "Aucun événement prévu.",
        "dashboard_addEvent": "Ajouter un événement",
        "dashboard_todayAt": (time: string) => `Aujourd'hui à ${time}`,
        "dashboard_tomorrowAt": (time: string) => `Demain à ${time}`,
        "dashboard_dataAnalysisTitle": "Analyse des Données",
        "dashboard_dataAnalysisText": "Visualisez les tendances et les statistiques pour mieux comprendre la gestion du diabète.",
        "dashboard_dataAnalysisButton": "Voir mes rapports",
        
        // Toasts
        "toast_passwordsDoNotMatch": "Les mots de passe ne correspondent pas.",
        "toast_fillAllFields": "Veuillez remplir tous les champs.",
        "toast_profileCreated": (name: string) => `Profil pour ${name} créé !`,
        "toast_userNotFound": "Utilisateur non trouvé, veuillez vous reconnecter.",
        "toast_invalidGlycemia": "Veuillez entrer une glycémie valide.",
        "toast_invalidKetone": "Veuillez entrer une valeur de cétone valide.",
        "toast_invalidDose": "Veuillez entrer une dose valide.",
        "toast_measureAdded": (gly: number) => `Mesure de ${gly.toFixed(2)} g/L ajoutée.`,
        "toast_bolusAdded": (dose: number) => `Bolus de ${dose} U ajouté.`,
        "toast_eventAdded": "Événement ajouté avec succès !",
        "toast_settingsSaved": "Réglages enregistrés !",
        "toast_nameAndBirthdateRequired": "Le prénom et la date de naissance sont requis.",
        "toast_calculationIncomplete": "Le calcul doit être effectué avant de pouvoir enregistrer.",
        "toast_bolusSaved": (dose: number) => `Bolus de ${dose}U et données associées enregistrés.`,
        "toast_bolusSaveError": "Erreur lors de l'enregistrement du bolus.",
        "toast_foodNameRequired": "Le nom de l'aliment est requis.",
        "toast_invalidCarbs": "Veuillez entrer une valeur de glucides valide.",
        "toast_invalidFiber": "Veuillez entrer une valeur de fibres valide.",
        "toast_foodUpdated": (name: string) => `${name} mis à jour.`,
        "toast_foodAdded": (name: string) => `${name} ajouté à la bibliothèque.`,
        "toast_invalidWeight": "Veuillez entrer un poids valide.",
        "toast_fillAllFieldsCorrectly": "Veuillez remplir correctement tous les champs requis.",
        "toast_invalidQuantity": "Veuillez entrer une quantité valide.",
        "toast_titleRequired": "Le titre est requis.",
        "toast_datetimeRequired": "La date et l'heure sont requises.",
        "toast_eventCompleted": (title: string) => `Événement "${title}" marqué comme terminé.`,
        "toast_eventReactivated": (title: string) => `Événement "${title}" réactivé.`,

        // Settings
        "settings_title": "Réglages",
        "settings_language": "Langue",
        "settings_profile": "Profil",
        "settings_glycemicTargets": "Objectifs glycémiques",
        "settings_ratios": "Ratios (1U pour...)",
        "settings_emergencyContacts": "Contacts d'urgence",
        "settings_contactRelation": "Lien (ex: Maman)",
        "settings_contactPhone": "Téléphone",
        "settings_addContact": "Ajouter un contact",
        "settings_logout": "Se déconnecter",
        "settings_viewPai": "Consulter le PAI",
        "settings_translateFood": "Traduire les aliments",
        "settings_translateFood_description": "Traduit automatiquement les noms d'aliments de la bibliothèque si une traduction est disponible.",

        // Meal Times
        "mealTimes": {
            "petit_dej": "Petit-déjeuner",
            "dejeuner": "Déjeuner",
            "gouter": "Goûter",
            "diner": "Dîner"
        },
        
        // Calculator
        "calculator_title": "Calculateur de Dose",
        "calculator_glycemiaAndTimeTitle": "Glycémie et Moment",
        "calculator_glycemiaLabel": "Glycémie (g/L)",
        "calculator_mealTimeLabel": "Moment du repas",
        "calculator_resultTitle": "Dose Recommandée",
        "calculator_resultMealDose": (dose: number, carbs: number) => `Bolus repas (${carbs}g) : ${dose.toFixed(1)} U`,
        "calculator_resultCorrectionDose": (dose: number, gly: string) => `Correction (${gly} g/L) : +${dose} U`,
        "calculator_saveButton": "Enregistrer le bolus et le repas",
        "calculator_bolusDetails": (repas: number, corr: number) => `Repas: ${repas.toFixed(1)}U, Correction: ${corr}U`,

        // Dose Explanation
        "doseExplanation_title": "Détail du Calcul",
        "doseExplanation_mealTitle": "Bolus Repas",
        "doseExplanation_mealDetail": (carbs: number, ratio: number) => `${carbs}g de glucides / ratio de ${ratio}g par unité.`,
        "doseExplanation_correctionTitle": "Bolus Correction",
        "doseExplanation_correctionDetail": (gly: string) => `Basé sur la glycémie de ${gly} g/L et le schéma de correction.`,
        "doseExplanation_warningTitle": "Avertissement",
        "doseExplanation_totalTitle": "Total Arrondi",
        "doseExplanation_close": "Fermer",

        // Journal / History
        "journal_title": "Fil d'Activité",
        "journal_empty": "Votre histoire commence ici. Chaque mesure, repas ou injection apparaîtra sur cette frise chronologique.",
        "journal_emptyPeriod": "Aucune activité enregistrée pour cette période.",
        "journal_glycemia": "Glycémie",
        "journal_ketone": "Cétone",
        "journal_carbs": (carbs: number) => `${Math.round(carbs)} g`,
        "journal_bolus": "Bolus",
        "journal_viewDay": "Jour",
        "journal_viewWeek": "Semaine",
        "journal_viewMonth": "Mois",
        "journal_thisWeek": "Cette semaine",
        "journal_showDetails": "Voir détails",
        "journal_hideDetails": "Masquer les détails",
        "journal_task_measureBreakfast": "Mesure avant petit-déjeuner",
        "journal_task_bolusBreakfast": "Bolus pour petit-déjeuner",
        "journal_task_measureLunch": "Mesure avant déjeuner",
        "journal_task_bolusLunch": "Bolus pour déjeuner",
        "journal_task_measureDinner": "Mesure avant dîner",
        "journal_task_bolusDinner": "Bolus pour dîner",
        "journal_task_addMeasure": "Ajouter Mesure",
        "journal_task_calculateBolus": "Calculer Bolus",
        "history_today": "Aujourd'hui",
        "history_yesterday": "Hier",
        "history_glucose_title": "Glycémie",
        "history_meal_title": "Repas",
        "history_bolus_title": "Bolus Repas",
        "history_activity_title": "Activité",
        "history_note_title": "Note",
        "history_carbs_unit": "g",
        "history_insulin_unit": "U",
        "history_activity_unit": "min",
        "mock_activity_type_walk": "Marche",
        "mock_note_details": "Impression de fatigue après le déjeuner.",
        
        // Food Library
        "foodLibrary_title": "Bibliothèque d'Aliments",
        "foodLibrary_searchPlaceholder": (count: number) => `Rechercher parmi ${count} aliments...`,
        "foodLibrary_per100": (unit: 'g' | 'ml') => `/ 100${unit}`,
        "foodLibrary_addFood": "Ajouter un aliment",
        "foodLibrary_noResults": (term: string) => `Aucun résultat pour "${term}".`,
        
        // Add Food Modal
        "addFood_addTitle": "Ajouter un Aliment",
        "addFood_editTitle": "Modifier l'Aliment",
        "addFood_foodNameLabel": "Nom de l'aliment",
        "addFood_foodNamePlaceholder": "ex: Compote de pommes",
        "addFood_per100g": "Pour 100g",
        "addFood_per100ml": "Pour 100ml",
        "addFood_totalCarbsLabel": "Glucides totaux",
        "addFood_fiberLabel": "Fibres",
        "addFood_manualCategory": "Manuel",
        "addFood_manualSource": "Ajout manuel",

        // Add Food Confirmation Modal
        "addFood_confirm_title": "Ajouter au repas",
        "addFood_confirm_quantity": "Quantité consommée",
        "addFood_confirm_calculatedCarbs": "Glucides calculés",
        "addFood_confirm_addToMeal": "Ajouter au repas",
        
        // Carb Indicator
        "carbIndicator_level_low": "Faible",
        "carbIndicator_level_medium": "Modéré",
        "carbIndicator_level_high": "Élevé",

        // Meal Builder
        "mealBuilder_title": "Composition du Repas",
        "mealBuilder_searchPlaceholder": "Chercher un aliment...",
        "mealBuilder_start": "Commencez par chercher un aliment ou utiliser un calculateur.",
        "mealBuilder_totalCarbs": "Glucides totaux",
        "mealBuilder_netCarbs": "Glucides nets",
        "mealBuilder_packagingCalc": "Calcul via emballage",
        "mealBuilder_photoScan": "Scan par photo",
        
        // Packaging Calculator
        "packaging_title": "Calculateur d'Emballage",
        "packaging_foodNamePlaceholder": "ex: Gâteau au chocolat",
        "packaging_grams": "Grammes (g)",
        "packaging_milliliters": "Millilitres (ml)",
        "packaging_labelInfo": "Informations de l'étiquette",
        "packaging_forWeight": "Pour",
        "packaging_consumedWeight": "Poids consommé",
        "packaging_consumedWeightPlaceholder": "ex: 65",
        "packaging_totalCarbsResult": "Total glucides pour la portion",
        "packaging_addToMeal": "Ajouter au repas",
        "packaging_calculatedFoodName": (name: string) => `${name} (calculé)`,
        "packaging_calculatedCategory": "Calculé",
        "packaging_source": "Calcul emballage",

        // Edit Meal Item
        "editMeal_title": "Modifier la quantité",
        "editMeal_newQuantityLabel": "Nouvelle quantité",

        // Emergency
        "emergency_title": "Urgence",
        "emergency_contactsTitle": "Contacts d'Urgence",
        "emergency_generalServices": "Services Généraux",
        "emergency_samu": "SAMU",
        "emergency_european": "N° Européen",
        "emergency_personalContacts": "Contacts Personnels",
        "emergency_noContacts": "Aucun contact personnel ajouté. Vous pouvez les ajouter dans les réglages.",
        "emergency_hypoButton": "Hypo",
        "emergency_hypoSubtitle": "Baisse de sucre",
        "emergency_hyperButton": "Hyper",
        "emergency_hyperSubtitle": "Excès de sucre",
        "emergency_ketoneButton": "Acétone",
        "emergency_ketoneSubtitle": "Cétones élevées",
        "emergency_patientTitle": "Infos Patient",
        "emergencyProtocols": {
            "hypo": {
                "title": "Protocole Hypoglycémie",
                "step1": (gly_min: number) => `Si la glycémie est inférieure à ${gly_min.toFixed(2)} g/L.`,
                "step2": "Donner 15g de sucre rapide (3 morceaux de sucre, 1 briquette de jus de fruit, 1 cuillère de miel).",
                "step3": "Contrôler la glycémie 15 minutes plus tard.",
                "step4": "Si la glycémie n'est pas remontée, redonner 15g de sucre et recontrôler 15 minutes après.",
                "step5": "Si les symptômes sont sévères (perte de connaissance, convulsions), appeler le 15 immédiatement."
            },
            "hyper": {
                "title": "Protocole Hyperglycémie",
                "step1": (gly_max: number) => `Si la glycémie est supérieure à ${gly_max.toFixed(2)} g/L.`,
                "step2": "Faire une injection de correction d'insuline rapide selon le schéma du PAI.",
                "step3": (delay: number) => `Contrôler la glycémie ${delay} heures plus tard. Ne pas refaire de correction avant ce délai.`,
                "step4": "Faire boire de l'eau. Encourager l'activité physique si l'état le permet et s'il n'y a pas d'acétone.",
                "step5": "Si la glycémie reste très élevée ou si des symptômes apparaissent (vomissements, douleurs), vérifier l'acétone."
            },
            "acetone": {
                "title": "Protocole Acétone",
                "step1": "Si la présence d'acétone est confirmée (lecteur de glycémie/cétonémie ou bandelettes urinaires).",
                "step2": "Faire une injection de correction d'insuline rapide MÊME SI LA GLYCÉMIE N'EST PAS ÉLEVÉE.",
                "step3": "Faire boire beaucoup d'eau, toutes les 15-30 minutes.",
                "step4": "Contrôler la glycémie et l'acétone toutes les 2 heures.",
                "step5": "Si l'acétone ne baisse pas, ou en cas de vomissements, contacter le diabétologue ou appeler le 15."
            }
        },

        // PAI
        "pai_title": (name: string) => `PAI de ${name}`,
        "pai_subtitle": "Protocole d'Accueil Individualisé",
        "pai_generalInfo": "Informations Générales",
        "pai_glycemicTargets": "Objectifs Glycémiques",
        "pai_target": "Objectif Cible",
        "pai_ratios": "Ratios d'Insuline",
        "pai_ratiosSubtitle": "1 unité d'insuline pour X grammes de glucides",
        "pai_correctionSchema": "Schéma de Correction",
        "pai_correctionSchemaSubtitle": "Unités à ajouter en fonction de la glycémie",
        "pai_correctionRuleFirst": (max: number) => `Si ≤ ${max.toFixed(2)} g/L`,
        "pai_correctionRuleNext": (prevMax: number, max: number) => `Si > ${prevMax.toFixed(2)} et ≤ ${max.toFixed(2)} g/L`,
        "pai_correctionDelay": (hours: number) => `Attendre au moins ${hours}h entre 2 corrections.`,
        "pai_notes": "Notes Additionnelles",
        "pai_noNotes": "Aucune note additionnelle.",

        // Quick Add
        "quickAdd_measureTitle": "Ajout Rapide : Mesure",
        "quickAdd_glycemiaLabel": "Glycémie (g/L)",
        "quickAdd_ketoneLabel": "Cétone (mmol/L)",
        "quickAdd_bolusTitle": "Ajout Rapide : Bolus",
        "quickAdd_doseLabel": "Dose (Unités)",
        "quickAdd_injectionType": "Type d'injection",
        "quickAdd_rapid": "Repas / Rapide",

        // Add Event Modal
        "addEvent_title": "Ajouter à l'agenda",
        "addEvent_appointment": "Rendez-vous",
        "addEvent_note": "Note",
        "addEvent_doctorLabel": "Titre / Médecin",
        "addEvent_eventTitleLabel": "Titre de l'événement",
        "addEvent_additionalInfoLabel": "Infos additionnelles",
        "addEvent_doctorPlaceholder": "ex: Dr. Martin",
        "addEvent_eventTitlePlaceholder": "ex: Anniversaire de Chloé",
        "addEvent_additionalInfoPlaceholder": "ex: Hôpital Necker, 2ème étage",
        "addEvent_descriptionPlaceholder": "ex: Ne pas oublier le cadeau",

        // Reports
        "reports_title": "Rapports",
        "reports_days": (d: number) => `${d} jours`,
        "reports_keyStats": "Statistiques Clés",
        "reports_tir": "Temps dans la cible",
        "reports_avgGlucose": "Moyenne glyc.",
        "reports_hypos": "Hypos (<0.80)",
        "reports_hypers": "Hypers (>1.60)",
        "reports_noDataPeriod": "Pas assez de données pour cette période.",
        "reports_dailyChart": "Graphique Journalier",
        "reports_noData": "Aucune donnée de glycémie pour ce jour.",
        "reports_selectDayWithData": "Sélectionnez un autre jour pour voir le graphique.",

        // Quiz
        "quiz_title": "Le Saviez-vous ?",
        "quiz_nextQuestion": "Question suivante",

        // Progress & Achievements
        "progress_gardenTitle": "Le Jardin du Bien-être",
        "progress_dailyGoals": "Objectifs du Jour",
        "progress_water": "Hydratation",
        "progress_activity": "Activité Physique",
        "progress_checks": "Contrôles Gly.",
        "progress_quiz": "Bon à Savoir",
        "progress_completed": "Terminé !",
        "progress_pending": "À faire",
        "progress_weeklyGoal": "Objectif de la Semaine",
        "badge_morningCheck_title": "Contrôle Matinal",
        "badge_mealLogger_title": "Chef Comptable",
        "badge_tripleCheck_title": "Le Trio",
        "badge_perfectDay_title": "Jour Parfait",

        // This should be the last key, it's used to check if the file is loaded
        "locale": "fr"
    },
    en: {
        "common_loading": "Loading",
        "common_optional": "Optional",
        "common_confirm": "Confirm",
        "common_cancel": "Cancel",
        "common_save": "Save",
        "common_saveChanges": "Save Changes",
        "common_creating": "Creating...",
        "common_firstName": "First Name",
        "common_name": "Name",
        "common_birthDate": "Birth Date",
        "common_min": "Min",
        "common_max": "Max",
        "common_rapid": "Rapid",
        "common_correction": "Correction",
        "common_carbs": "Carbs",
        "common_description": "Description",
        "common_datetime": "Date and Time",
        "nav_home": "Home",
        "nav_journal": "Activity",
        "nav_calculator": "Calculator",
        "nav_emergency": "Emergency",
        "nav_settings": "Settings",
        "auth_appTitle": "Diab'Assistant T1",
        "auth_loginTitle": "Login",
        "auth_signupTitle": "Sign Up",
        "auth_username": "Username",
        "auth_password": "Password",
        "auth_confirmPassword": "Confirm Password",
        "auth_loginButton": "Login",
        "auth_signupButton": "Create my account",
        "auth_noAccount": "Don't have an account yet?",
        "auth_signupLink": "Sign up",
        "auth_hasAccount": "Already have an account?",
        "auth_loginLink": "Login",
        "onboarding_welcome": "Welcome!",
        "onboarding_subtitle": "Set up your child's profile.",
        "onboarding_firstNamePlaceholder": "e.g., Leo",
        "onboarding_startButton": "Get Started",
        "onboarding_helperText": "This information is stored locally on your device and is never shared.",
        "greeting_morning": "Good morning",
        "greeting_afternoon": "Good afternoon",
        "greeting_evening": "Good evening",
        "dashboard_currentGlucose": "Current Glucose",
        "dashboard_noMeasure": "No measurement",
        "dashboard_todayChecks": (count: number) => `${count} check${count > 1 ? 's' : ''} today`,
        "dashboard_action_calculate": "Calculate",
        "dashboard_action_bolus": "Bolus",
        "dashboard_action_measure": "Measure",
        "dashboard_action_emergency": "Emergency",
        "dashboard_eventsTitle": "Upcoming Agenda",
        "dashboard_noEvents": "No upcoming events.",
        "dashboard_addEvent": "Add an event",
        "dashboard_todayAt": (time: string) => `Today at ${time}`,
        "dashboard_tomorrowAt": (time: string) => `Tomorrow at ${time}`,
        "dashboard_dataAnalysisTitle": "Data Analysis",
        "dashboard_dataAnalysisText": "View trends and statistics to better understand diabetes management.",
        "dashboard_dataAnalysisButton": "View my reports",
        "toast_passwordsDoNotMatch": "Passwords do not match.",
        "toast_fillAllFields": "Please fill in all fields.",
        "toast_profileCreated": (name: string) => `Profile for ${name} created!`,
        "toast_userNotFound": "User not found, please log in again.",
        "toast_invalidGlycemia": "Please enter a valid blood glucose level.",
        "toast_invalidKetone": "Please enter a valid ketone value.",
        "toast_invalidDose": "Please enter a valid dose.",
        "toast_measureAdded": (gly: number) => `Measurement of ${gly.toFixed(2)} g/L added.`,
        "toast_bolusAdded": (dose: number) => `Bolus of ${dose} U added.`,
        "toast_eventAdded": "Event added successfully!",
        "toast_settingsSaved": "Settings saved!",
        "toast_nameAndBirthdateRequired": "First name and birth date are required.",
        "toast_calculationIncomplete": "Calculation must be done before saving.",
        "toast_bolusSaved": (dose: number) => `Bolus of ${dose}U and related data saved.`,
        "toast_bolusSaveError": "Error saving bolus.",
        "toast_foodNameRequired": "Food name is required.",
        "toast_invalidCarbs": "Please enter a valid carbohydrate value.",
        "toast_invalidFiber": "Please enter a valid fiber value.",
        "toast_foodUpdated": (name: string) => `${name} updated.`,
        "toast_foodAdded": (name: string) => `${name} added to the library.`,
        "toast_invalidWeight": "Please enter a valid weight.",
        "toast_fillAllFieldsCorrectly": "Please fill all required fields correctly.",
        "toast_invalidQuantity": "Please enter a valid quantity.",
        "toast_titleRequired": "Title is required.",
        "toast_datetimeRequired": "Date and time are required.",
        "toast_eventCompleted": (title: string) => `Event "${title}" marked as completed.`,
        "toast_eventReactivated": (title: string) => `Event "${title}" reactivated.`,
        "settings_title": "Settings",
        "settings_language": "Language",
        "settings_profile": "Profile",
        "settings_glycemicTargets": "Glycemic Targets",
        "settings_ratios": "Ratios (1U for...)",
        "settings_emergencyContacts": "Emergency Contacts",
        "settings_contactRelation": "Relation (e.g., Mom)",
        "settings_contactPhone": "Phone",
        "settings_addContact": "Add a contact",
        "settings_logout": "Log out",
        "settings_viewPai": "View PAI",
        "settings_translateFood": "Translate foods",
        "settings_translateFood_description": "Automatically translates food names from the library if a translation is available.",
        "mealTimes": {
            "petit_dej": "Breakfast",
            "dejeuner": "Lunch",
            "gouter": "Snack",
            "diner": "Dinner"
        },
        "calculator_title": "Dose Calculator",
        "calculator_glycemiaAndTimeTitle": "Glycemia & Time",
        "calculator_glycemiaLabel": "Glycemia (g/L)",
        "calculator_mealTimeLabel": "Meal Time",
        "calculator_resultTitle": "Recommended Dose",
        "calculator_resultMealDose": (dose: number, carbs: number) => `Meal bolus (${carbs}g): ${dose.toFixed(1)} U`,
        "calculator_resultCorrectionDose": (dose: number, gly: string) => `Correction (${gly} g/L): +${dose} U`,
        "calculator_saveButton": "Save Bolus and Meal",
        "calculator_bolusDetails": (repas: number, corr: number) => `Meal: ${repas.toFixed(1)}U, Correction: ${corr}U`,
        "doseExplanation_title": "Calculation Details",
        "doseExplanation_mealTitle": "Meal Bolus",
        "doseExplanation_mealDetail": (carbs: number, ratio: number) => `${carbs}g of carbs / ratio of ${ratio}g per unit.`,
        "doseExplanation_correctionTitle": "Correction Bolus",
        "doseExplanation_correctionDetail": (gly: string) => `Based on glycemia of ${gly} g/L and correction schema.`,
        "doseExplanation_warningTitle": "Warning",
        "doseExplanation_totalTitle": "Rounded Total",
        "doseExplanation_close": "Close",
        "journal_title": "Activity Feed",
        "journal_empty": "Your story starts here. Every measurement, meal, or injection will appear on this timeline.",
        "journal_emptyPeriod": "No activity recorded for this period.",
        "journal_glycemia": "Glycemia",
        "journal_ketone": "Ketone",
        "journal_carbs": (carbs: number) => `${Math.round(carbs)} g`,
        "journal_bolus": "Bolus",
        "journal_viewDay": "Day",
        "journal_viewWeek": "Week",
        "journal_viewMonth": "Month",
        "journal_thisWeek": "This week",
        "journal_showDetails": "Show details",
        "journal_hideDetails": "Hide details",
        "journal_task_measureBreakfast": "Measure before breakfast",
        "journal_task_bolusBreakfast": "Bolus for breakfast",
        "journal_task_measureLunch": "Measure before lunch",
        "journal_task_bolusLunch": "Bolus for lunch",
        "journal_task_measureDinner": "Measure before dinner",
        "journal_task_bolusDinner": "Bolus for dinner",
        "journal_task_addMeasure": "Add Measure",
        "journal_task_calculateBolus": "Calculate Bolus",
        "history_today": "Today",
        "history_yesterday": "Yesterday",
        "history_glucose_title": "Glucose",
        "history_meal_title": "Meal",
        "history_bolus_title": "Meal Bolus",
        "history_activity_title": "Activity",
        "history_note_title": "Note",
        "history_carbs_unit": "g",
        "history_insulin_unit": "U",
        "history_activity_unit": "min",
        "mock_activity_type_walk": "Walk",
        "mock_note_details": "Feeling tired after lunch.",
        "foodLibrary_title": "Food Library",
        "foodLibrary_searchPlaceholder": (count: number) => `Search among ${count} foods...`,
        "foodLibrary_per100": (unit: 'g' | 'ml') => `/ 100${unit}`,
        "foodLibrary_addFood": "Add a food item",
        "foodLibrary_noResults": (term: string) => `No results for "${term}".`,
        "addFood_addTitle": "Add Food",
        "addFood_editTitle": "Edit Food",
        "addFood_foodNameLabel": "Food name",
        "addFood_foodNamePlaceholder": "e.g., Applesauce",
        "addFood_per100g": "Per 100g",
        "addFood_per100ml": "Per 100ml",
        "addFood_totalCarbsLabel": "Total carbs",
        "addFood_fiberLabel": "Fiber",
        "addFood_manualCategory": "Manual",
        "addFood_manualSource": "Manual entry",
        "addFood_confirm_title": "Add to meal",
        "addFood_confirm_quantity": "Consumed quantity",
        "addFood_confirm_calculatedCarbs": "Calculated carbs",
        "addFood_confirm_addToMeal": "Add to meal",
        "carbIndicator_level_low": "Low",
        "carbIndicator_level_medium": "Medium",
        "carbIndicator_level_high": "High",
        "mealBuilder_title": "Meal Composition",
        "mealBuilder_searchPlaceholder": "Search for a food...",
        "mealBuilder_start": "Start by searching for a food or using a calculator.",
        "mealBuilder_totalCarbs": "Total carbs",
        "mealBuilder_netCarbs": "Net carbs",
        "mealBuilder_packagingCalc": "Packaging calculator",
        "mealBuilder_photoScan": "Scan by photo",
        "packaging_title": "Packaging Calculator",
        "packaging_foodNamePlaceholder": "e.g., Chocolate cake",
        "packaging_grams": "Grams (g)",
        "packaging_milliliters": "Milliliters (ml)",
        "packaging_labelInfo": "Label information",
        "packaging_forWeight": "For",
        "packaging_consumedWeight": "Consumed weight",
        "packaging_consumedWeightPlaceholder": "e.g., 65",
        "packaging_totalCarbsResult": "Total carbs for the portion",
        "packaging_addToMeal": "Add to meal",
        "packaging_calculatedFoodName": (name: string) => `${name} (calculated)`,
        "packaging_calculatedCategory": "Calculated",
        "packaging_source": "Packaging calculation",
        "editMeal_title": "Edit quantity",
        "editMeal_newQuantityLabel": "New quantity",
        "emergency_title": "Emergency",
        "emergency_contactsTitle": "Emergency Contacts",
        "emergency_generalServices": "General Services",
        "emergency_samu": "SAMU (Medical)",
        "emergency_european": "European Number",
        "emergency_personalContacts": "Personal Contacts",
        "emergency_noContacts": "No personal contacts added. You can add them in the settings.",
        "emergency_hypoButton": "Hypo",
        "emergency_hypoSubtitle": "Low sugar",
        "emergency_hyperButton": "Hyper",
        "emergency_hyperSubtitle": "High sugar",
        "emergency_ketoneButton": "Ketone",
        "emergency_ketoneSubtitle": "High ketones",
        "emergency_patientTitle": "Patient Info",
        "emergencyProtocols": {
            "hypo": {
                "title": "Hypoglycemia Protocol",
                "step1": (gly_min: number) => `If blood glucose is below ${gly_min.toFixed(2)} g/L.`,
                "step2": "Give 15g of fast-acting sugar (3 sugar cubes, 1 juice box, 1 spoon of honey).",
                "step3": "Check blood glucose 15 minutes later.",
                "step4": "If blood glucose has not risen, give another 15g of sugar and recheck in 15 minutes.",
                "step5": "If symptoms are severe (loss of consciousness, seizures), call emergency services immediately."
            },
            "hyper": {
                "title": "Hyperglycemia Protocol",
                "step1": (gly_max: number) => `If blood glucose is above ${gly_max.toFixed(2)} g/L.`,
                "step2": "Give a correction bolus of rapid-acting insulin according to the PAI schema.",
                "step3": (delay: number) => `Check blood glucose ${delay} hours later. Do not give another correction before then.`,
                "step4": "Encourage drinking water. Encourage physical activity if condition allows and there are no ketones.",
                "step5": "If blood glucose remains very high or symptoms appear (vomiting, pain), check for ketones."
            },
            "acetone": {
                "title": "Ketone Protocol",
                "step1": "If the presence of ketones is confirmed (blood glucose/ketone meter or urine strips).",
                "step2": "Give a correction bolus of rapid-acting insulin EVEN IF BLOOD GLUCOSE IS NOT HIGH.",
                "step3": "Encourage drinking lots of water, every 15-30 minutes.",
                "step4": "Check blood glucose and ketones every 2 hours.",
                "step5": "If ketones do not decrease, or in case of vomiting, contact the diabetologist or call emergency services."
            }
        },
        "pai_title": (name: string) => `PAI for ${name}`,
        "pai_subtitle": "Individualized Welcome Protocol",
        "pai_generalInfo": "General Information",
        "pai_glycemicTargets": "Glycemic Targets",
        "pai_target": "Target Goal",
        "pai_ratios": "Insulin Ratios",
        "pai_ratiosSubtitle": "1 unit of insulin for X grams of carbohydrates",
        "pai_correctionSchema": "Correction Schema",
        "pai_correctionSchemaSubtitle": "Units to add based on blood glucose",
        "pai_correctionRuleFirst": (max: number) => `If ≤ ${max.toFixed(2)} g/L`,
        "pai_correctionRuleNext": (prevMax: number, max: number) => `If > ${prevMax.toFixed(2)} and ≤ ${max.toFixed(2)} g/L`,
        "pai_correctionDelay": (hours: number) => `Wait at least ${hours}h between 2 corrections.`,
        "pai_notes": "Additional Notes",
        "pai_noNotes": "No additional notes.",
        "quickAdd_measureTitle": "Quick Add: Measurement",
        "quickAdd_glycemiaLabel": "Glycemia (g/L)",
        "quickAdd_ketoneLabel": "Ketone (mmol/L)",
        "quickAdd_bolusTitle": "Quick Add: Bolus",
        "quickAdd_doseLabel": "Dose (Units)",
        "quickAdd_injectionType": "Injection type",
        "quickAdd_rapid": "Meal / Rapid",
        "addEvent_title": "Add to agenda",
        "addEvent_appointment": "Appointment",
        "addEvent_note": "Note",
        "addEvent_doctorLabel": "Title / Doctor",
        "addEvent_eventTitleLabel": "Event title",
        "addEvent_additionalInfoLabel": "Additional info",
        "addEvent_doctorPlaceholder": "e.g., Dr. Smith",
        "addEvent_eventTitlePlaceholder": "e.g., Chloe's birthday",
        "addEvent_additionalInfoPlaceholder": "e.g., City Hospital, 2nd floor",
        "addEvent_descriptionPlaceholder": "e.g., Don't forget the gift",
        "reports_title": "Reports",
        "reports_days": (d: number) => `${d} days`,
        "reports_keyStats": "Key Stats",
        "reports_tir": "Time in range",
        "reports_avgGlucose": "Avg. glucose",
        "reports_hypos": "Hypos (<0.80)",
        "reports_hypers": "Hypers (>1.60)",
        "reports_noDataPeriod": "Not enough data for this period.",
        "reports_dailyChart": "Daily Chart",
        "reports_noData": "No glucose data for this day.",
        "reports_selectDayWithData": "Select another day to see the chart.",
        "quiz_title": "Did You Know?",
        "quiz_nextQuestion": "Next question",
        "progress_gardenTitle": "Wellness Garden",
        "progress_dailyGoals": "Daily Goals",
        "progress_water": "Hydration",
        "progress_activity": "Physical Activity",
        "progress_checks": "BG Checks",
        "progress_quiz": "Did You Know?",
        "progress_completed": "Completed!",
        "progress_pending": "To do",
        "progress_weeklyGoal": "Weekly Goal",
        "badge_morningCheck_title": "Morning Check",
        "badge_mealLogger_title": "Chief Accountant",
        "badge_tripleCheck_title": "The Trio",
        "badge_perfectDay_title": "Perfect Day",
        "locale": "en"
    }
};

const rtlLangs: Language[] = ['ar', 'ur', 'ps'];

const getTranslatedQuizData = (lang: Language): QuizQuestion[] => {
    switch(lang) {
        case 'en': return quizDataEN;
        case 'tr': return quizDataTR;
        case 'ar': return quizDataAR;
        case 'ur': return quizDataUR;
        case 'ps': return quizDataPS;
        case 'uk': return quizDataUK;
        default: return quizDataFR;
    }
}


const useTranslations = () => {
  const { language } = useSettingsStore();

  const selectedTranslations = (translations as any)[language] || translations.fr;
  
  return {
      ...selectedTranslations,
      isRTL: rtlLangs.includes(language),
      quizData: getTranslatedQuizData(language)
  };
};

export default useTranslations;