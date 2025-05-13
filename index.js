console.log('index.js を実行中...');
require('dotenv').config();

const {
	Client, GatewayIntentBits, Partials, SlashCommandBuilder, ActionRowBuilder,
	ButtonBuilder, ButtonStyle, EmbedBuilder, REST, Routes
} = require('discord.js');

const fs = require('fs');
const kuromoji = require("kuromoji");

const commands = [
	new SlashCommandBuilder()
		.setName('ウィルキン')
		.setDescription('ウィルキンメッセージを送信！'),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.Message, Partials.Channel, Partials.User],
});

const path = './word.json';

let wordData = loadWordDataSafely(path);
client.once('ready', () => {
	console.log('起動完了');
});

var bot_talk = false;

function loadWordDataSafely(filePath) {
    if (!fs.existsSync(filePath)) return [];

    const raw = fs.readFileSync(filePath, 'utf8');
    if (raw.trim().length === 0) return [];

    try {
        return JSON.parse(raw);
    } catch (err) {
        console.error(`⚠️ ${filePath} の JSON パースエラー:`, err.message);
        return [];
    }
}

// 🔍 kuromoji の準備
kuromoji.builder({ dicPath: "node_modules/kuromoji/dict" }).build((err, tokenizer) => {
    if (err) throw err;

client.on('messageCreate', async message => {
    // bot_talkがONのとき、かつメッセージの送信者が自分以外であれば処理
    if (bot_talk && message.author.id !== client.user.id) {
        const tokens = tokenizer.tokenize(message.content);
        const processedWords = tokens.map((token) => ({
            word: token.surface_form,
            pos: token.pos,
            timestamp: message.createdTimestamp,
            authorId: message.author.id,
            messageId: message.id,
            channelId: message.channel.id,
        }));

        // 重複チェックとカウントの更新
        processedWords.forEach(word => {
            let existingWord = wordData.find(w => w.word === word.word);
            if (existingWord) {
                existingWord.count += 1; // カウントを増やす
            } else {
                word.count = 1; // 新しい単語の場合はカウント1
                wordData.push(word);
            }
        });

        // JSONファイルに保存
        fs.writeFileSync('./word.json', JSON.stringify(wordData, null, 2), 'utf8');

        // 応答を生成
        const replyText = generateReply(message.content, wordData);
        message.channel.send(replyText);
    }
	else{
		if (message.author.bot) return;
        const tokens = tokenizer.tokenize(message.content);
        const processedWords = tokens.map((token) => ({
            word: token.surface_form,
            pos: token.pos,
            timestamp: message.createdTimestamp,
            authorId: message.author.id,
            messageId: message.id,
            channelId: message.channel.id,
        }));

        // 重複チェックとカウントの更新
        processedWords.forEach(word => {
            let existingWord = wordData.find(w => w.word === word.word);
            if (existingWord) {
                existingWord.count += 1; // カウントを増やす
            } else {
                word.count = 1; // 新しい単語の場合はカウント1
                wordData.push(word);
            }
        });

        // JSONファイルに保存
        fs.writeFileSync('./word.json', JSON.stringify(wordData, null, 2), 'utf8');

        // 応答を生成
        const replyText = generateReply(message.content, wordData);
        message.channel.send(replyText);
	}
});
});


// 🔘 スラッシュコマンドの応答
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        // スラッシュコマンドの処理
        if (interaction.commandName === 'ウィルキン') {
            const embed = new EmbedBuilder()
                .setTitle('ウィルキン・ブレインへようこそ')
                .setDescription('私を管理します。')
                .setColor(0x0099ff);

            const button = new ButtonBuilder()
                .setCustomId('studymode')
                .setLabel('学習モード')
                .setStyle(ButtonStyle.Primary);

            const button_1 = new ButtonBuilder()
                .setCustomId('Botenbal')
                .setLabel('bot検知')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(button, button_1);

            await interaction.reply({ embeds: [embed], components: [row] });
        }
    } else if (interaction.isButton()) {
        // ボタンインタラクションの処理
        if (interaction.customId === 'studymode') {
            studyModeUsers.add(interaction.user.id); // 学習モードON
            await interaction.reply({
                content: '学習モードを有効にしました！',
                ephemeral: true,
            });
        }
        if (interaction.customId === 'Botenbal') {
            bot_talk = !bot_talk; // bot_talkの状態をトグル
            await interaction.reply({
                content: `botとの会話を${bot_talk ? '有効' : '無効'}にしました！`,
                ephemeral: true,
            });
        }
    }
});

function generateReply(currentText, wordData) {
	// 学習した単語を基に文を生成
	const sentence = generateSentence(wordData);
	return sentence;
}

function generateSentence(wordData) {
    // 単語の出現回数に応じて重みをつける
    const weightedWords = wordData.flatMap(w => Array(w.count).fill(w));

    // 名詞、動詞、形容詞、助詞、感動詞、フィラーの単語をそれぞれフィルタリング
    const nouns = weightedWords.filter(w => w.pos === '名詞').map(w => w.word);
    const verbs = weightedWords.filter(w => w.pos === '動詞').map(w => w.word);
    const adjectives = weightedWords.filter(w => w.pos === '形容詞').map(w => w.word);
    const particles = weightedWords.filter(w => w.pos === '助詞').map(w => w.word);
    const interjections = weightedWords.filter(w => w.pos === '感動詞').map(w => w.word);
    const fillers = weightedWords.filter(w => w.pos === 'フィラー').map(w => w.word);

    // ランダムに名詞、動詞、形容詞を組み合わせて文を生成
    const subject = nouns[Math.floor(Math.random() * nouns.length)];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)] || '';
    const particle = particles[Math.floor(Math.random() * particles.length)];
    const interjection = interjections[Math.floor(Math.random() * interjections.length)] || '';
    const filler = fillers[Math.floor(Math.random() * fillers.length)] || '';

    // 生成する文のパターン
    const sentencePatterns = [
        `${interjection} ${subject}${particle}${verb}ことが${adjective}です。`,
        `${subject}${particle}${verb}ことは${adjective}です。`,
        `${filler}${subject}${particle}${verb}ことを${adjective}と思います。`,
        `私は${subject}${particle}${verb}するのは${adjective}だと${filler}思います。`,
        `${subject}${particle}${verb}ことが大切です。`,
        `${interjection} ${subject}${particle}${verb}ことは${adjective}だと思います。`,
        `${subject}${particle}${verb}のが${adjective}です。`,
        `${subject}${particle}${verb}ことを楽しみにしています。`,
        `${interjection} ${subject}${particle}${verb}するのが好きです。`,
        `あなたは${subject}${particle}${verb}ことに興味がありますか？`,
        `${filler} ${subject}${particle}${verb}ことは意外と${adjective}です。`,
        `私は${subject}${particle}${verb}のが好きだと思います。`,
        `${subject}${particle}${verb}ことを${adjective}であると感じます。`,
        `${subject}${particle}${verb}のは少し${adjective}かもしれません。`,
        `${interjection} ${subject}${particle}${verb}するのが${adjective}で楽しいです。`,
        `${subject}${particle}${verb}ことに${adjective}な気持ちを持っています。`,
        `あなたが${subject}${particle}${verb}ことは${adjective}だと${filler}思います。`,
        `${subject}${particle}${verb}ことは${adjective}ではありません。`,
        `${interjection} ${subject}${particle}${verb}のは${adjective}だと思います。`,
        `私は${subject}${particle}${verb}ことができるのは${adjective}だと思います。`
    ];

    // ランダムに文を選択
    return sentencePatterns[Math.floor(Math.random() * sentencePatterns.length)];
}

let studyModeUsers = new Set();




client.login(process.env.DISCORD_TOKEN);
