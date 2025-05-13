import {
  createBot,
  startBot,
  Intents,
  getBotIdFromToken,
  Message,
} from "https://deno.land/x/discordeno@18.0.1/mod.ts";

import "https://deno.land/std@0.223.0/dotenv/load.ts";

import { ensureFile } from "https://deno.land/std@0.223.0/fs/mod.ts";


// 保存先ファイルパス
const MESSAGE_LOG_FILE = "./messages.json";
const WORD_LOG_FILE = "./word.json";
const TARGET_CHANNEL_ID = '1371420197185126560';
const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is missing in .env");

const bot = createBot({
  token,
  botId: getBotIdFromToken(token),
  intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent,

  events: {
    ready: (_bot, payload) => {
      console.log(`${payload.user.username} is ready!`);
    },

    messageCreate: async (bot, message: Message) => {
      if (message.authorId === bot.id) return;


      // if (message.content === "!IKAKIN BRAIN") {
      //   // ボタンを作成
      //   const button = {
      //     type: ComponentType.Button,
      //     style: ButtonStyle.Primary,
      //     label: "クリックしてね",
      //     custom_id: "brain_button", // ボタンがクリックされたときにトリガーされるID
      //   };

      //   // 埋め込みメッセージを作成
      //   const embed = {
      //     title: "IKAKIN BRAIN",
      //     description: "ボタン付きのメッセージが送信されました！",
      //     color: 0x00FF00, // 緑色
      //   };

      //   // メッセージを送信
      //   await bot.sendMessage(message.channelId, {
      //     embeds: [embed],
      //     components: [{ type: ComponentType.ActionRow, components: [button] }],
      //   });
      // }

      logWordsToFile({ content: message.content });

      await logMessageToFile({
        content: message.content
      });


      
      // if (Math.random() > 0.3)
      // {
      //   sendRandomMessage(message.channelId.toString());
      //   return;
      // }
        sendRandomMessage(message.channelId.toString());

      const sendReply = (content: string) =>
        bot.helpers.sendMessage(message.channelId, {
          content,
          messageReference: {
            messageId: message.id,
            channelId: message.channelId,
            guildId: message.guildId!,
            failIfNotExists: false
          },
        });

      // コマンド処理
      const commandReplies: Record<string, string> = {
        "!time": new Date().toLocaleString(),
        "!ika":
          "https://tenor.com/view/seikin_mania-seikin-hikakin-hikakin_mania-%E9%9A%A3%E3%81%AE%E9%83%A8%E5%B1%8B%E3%81%AE%E3%83%A4%E3%83%B3%E3%82%AD%E3%83%BC-gif-26998370",
        "!GodMusic":
          "https://youtube.com/shorts/FbWhI1B0XkE?si=Z_6HbqRqrG4V-SLf",
      };
      if (message.content in commandReplies) {
        return sendReply(commandReplies[message.content]);
      }

      // 内容による返信パターン
      const lowerContent = message.content.toLowerCase();

//       const triggerPatterns: { keywords: string[]; responses: string[] }[] = [
//         {
//           keywords: ["w", "ｗ", "草"],
//           responses: [
//             "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
//             "流石に渋すぎ",
//             "あぁ",
//             "何笑ってんだお前",
//           ],
//         },
//         {
//           keywords: ["?", "？"],
//           responses: [
//             "？",
//             "あたまわるいかて",
//             "知能の低いガキは家に帰れない",
//             "不謹慎だよ",
//             "後ろ",
//             "日本語使えよ",
//           ],
//         },
//         {
//           keywords: ["楽", "酷", "気持", "あつ"],
//           responses: [
//             "ブンブン！ハロー",
//             "いやデカすぎでしょ！！！！",
//             "ヒカキンさん、見てますかぁ！？",
//             "どえらいことになってますぅ〜〜〜！！",
//             "デカキン、爆誕！！！",
//             "デカキン流、漢のタンク講座始まります！",
//           ],
//         },{
//           keywords: ["雑魚", "ざこ", "弱", "よわ"],
//           responses: [
//             "効いてて草",
//             "まさかそれ本気で言ってる？",
//             "ブーメラン突き刺さってるよ",
//             "お前が言うなよｗ",
//           ],
//         },{
//           keywords: ["すご", "神", "うま", "上手"],
//           responses: [
//             "神の所業やん",
//             "上手すぎて草",
//             "それはプロ",
//             "はい優勝〜〜〜！！",
//           ],
//         },{
//         keywords: ["無理", "疲", "だる", "最悪"],
//         responses: [
//           "イカ金特製イカ焼きでもいかが？",
//           "もう休も？",
//           "気持ちはわかる",
//           "それはきつい…",
//           "いかす",
//         ],},{
//         keywords: ["ん", "の", "だ", "あ"],
//         responses: [
//   "どえらいことになってますぅ〜〜〜！！！",
//   "デカキンですぅ〜〜〜！！ブンブンハロー！",
//   "今日はね、ガチでやばいんですけどぉ！！",
//   "いや、これまじで人生変わるレベル！！！",
//   "なんでそうなるの！？！？！？！？",
//   "パニックパニックパニックパニック！！！",
//   "皆さん見てくださいこれ！！！やばすぎィィィ！！！",
//   "さすがにそれはデカすぎぃ！！！",
//   "今すぐチャンネル登録！！押せ！！今！！",
//   "ヒカキンさん、見てますかぁ！？（泣）",
//   "デカキン流、人生逆転術ぅ〜〜〜！！",
//   "そんなことある！？デカキンびっくりですぅ！！",
//   "これが……デカキンの本気（マジ）です！！",
//   "皆さん、落ち着いてください！！落ち着けるかぁ！！！",
//   "マジでびっくりしすぎて体溶けたわ！！",
//         ],
// },



      // ];

      // for (const { keywords, responses } of triggerPatterns) {
      //   if (keywords.some((k) => lowerContent.includes(k))) {
      //     const response = responses[Math.floor(Math.random() * responses.length)];
      //     return sendReply(response);
      //   }
      // }

      // Botへのリプライに対する反応
      if (message.messageReference?.messageId) {
        try {
          const repliedMessage = await bot.helpers.getMessage(
            message.channelId,
            message.messageReference.messageId,
          );

          if (repliedMessage.authorId === bot.id) {
            const responses = [
              "喧嘩か？",
              "やんのかオイ",
              "# 表出ろや",
              "口悪くない？",
              "タイマンはいつ？",
              "タンク行きます",
            ];
            const response = responses[Math.floor(Math.random() * responses.length)];
            return sendReply(response);
          }
        } catch (err) {
          console.error("返信元のメッセージ取得に失敗:", err);
        }
      }
    },
  },
});

await startBot(bot);


let context: string[] = []; // 会話履歴の保存

async function logMessageToFile(log: {content: string;}) {
  await ensureFile(MESSAGE_LOG_FILE); // メッセージ用のログファイルを確認

  try {
    const current = await Deno.readTextFile(MESSAGE_LOG_FILE);
    const json = current.trim() ? JSON.parse(current) : [];

    // 会話履歴にメッセージを追加
    context.push(log.content);
    if (context.length > 5) { // 履歴は最大5つまで保持
      context.shift();
    }

    // ログファイルへの書き込み
    const newLog = { ...log, count: 1 };
    json.push(newLog);

    await Deno.writeTextFile(MESSAGE_LOG_FILE, JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("ログの書き込みエラー:", err);
  }
}

async function generateResponseBasedOnContext() {
  try {
    // 会話履歴を1つの文字列に結合（context配列に会話履歴が格納されている）
    const contextMessage = context.join("");
    
    // N-gramに基づくランダムなメッセージを生成
    const generatedMessage = await generateRandomMessageFromWords();

    if (generatedMessage) {
      // コンテキストに基づく適切な応答を生成（例えば、感情に合わせて応答を生成）
      return `あなたが言ったことに基づいて、こう思いました: ${generatedMessage}`;
    } else {
      // コンテキストが不足している場合はフォールバック
      return "最近どうしてる？";
    }
  } catch (err) {
    console.error("コンテキスト応答生成エラー:", err);
    return "エラーが発生しました。もう一度やり直してください。";
  }
}


// 既存のlogWordsToFile関数を修正して、トリグラムも保存するようにします。
async function logWordsToFile(log: { content: string }) {
  await ensureFile(WORD_LOG_FILE); // 単語用ログファイル

  try {
    const current = await Deno.readTextFile(WORD_LOG_FILE);
    const json = current.trim()
      ? JSON.parse(current)
      : { words: [], bigrams: {}, trigrams: {}, starts: [], ends: [] };

    const words = log.content
      .replace(/[^\p{L}\p{N}ー々〆]+/gu, " ")
      .replace(/(ので|って|から|けど|そして|それで|のに|が|を|に|で|と|は|も|の|へ|や|ね|よ|な|ぞ|さ|か|わ)/g, " $1 ")
      .split(/\s+/)
      .filter(Boolean);

    // 文頭・文末処理
    if (words.length >= 1) {
      const start = words[0];
      json.starts[start] = (json.starts[start] || 0) + 1;

      const end = words[words.length - 1];
      json.ends[end] = (json.ends[end] || 0) + 1;

      if (!json.starts.includes(start)) json.starts.push(start);
      if (!json.ends.includes(end)) json.ends.push(end);
    }

    // 単語のカウント
    for (const word of words) {
      const existing = json.words.find((entry: any) => entry.word === word);
      if (existing) {
        existing.count++;
      } else {
        json.words.push({ word, count: 1 });
      }
    }

    // バイグラムとトリグラムを作成
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = words[i] + "" + words[i + 1];
      json.bigrams[bigram] = (json.bigrams[bigram] || 0) + 1;

      if (i < words.length - 2) {
        const trigram = words[i] + "" + words[i + 1] + "" + words[i + 2];
        json.trigrams[trigram] = (json.trigrams[trigram] || 0) + 1;
      }
    }

    // 保存
    await Deno.writeTextFile(WORD_LOG_FILE, JSON.stringify(json, null, 2));

  } catch (err) {
    console.error("Error saving words:", err);
  }
}




async function sendRandomMessage(channelId: string) {
  try {
    // ランダムメッセージを生成
    if (Math.random() > 0.3) {    
      const randomMessage = await generateRandomMessageFromWords();

      if (randomMessage) {
        await bot.helpers.sendMessage(channelId, { content: randomMessage });
      }
    }
    else{
      const randomMessage = await sendRandomMessageFromLog(channelId);

      if (randomMessage) {
        await bot.helpers.sendMessage(channelId, { content: randomMessage });
      }
    }
  } catch (err) {
    console.error("エラーが発生しました:", err);
  }
}


async function sendRandomMessageFromLog(channelId: string): Promise<string | null> {
  try {
    // message.jsonの内容を読み込む
    const current = await Deno.readTextFile(MESSAGE_LOG_FILE);
    const data = current.trim() ? JSON.parse(current) : [];

    // メッセージの選択肢がない場合は終了
    if (data.length === 0) {
      console.log("選択するメッセージがありません");
      return null;
    }

    // totalCountを計算：すべてのcountの合計
    const totalCount = data.reduce((sum: number, entry: any) => sum + entry.count, 0);

    // 乱数を生成し、それに基づいてメッセージを選ぶ
    let randomValue = Math.random() * totalCount;
    let selectedMessage: string | null = null;

    // メッセージリストを順にチェックして、乱数を使ってメッセージを選択
    for (const entry of data) {
      randomValue -= entry.count;
      if (randomValue <= 0) {
        selectedMessage = entry.content;
        break;
      }
    }

    // メッセージが見つかれば返す
    return selectedMessage;

  } catch (err) {
    console.error("エラーが発生しました:", err);
    return null;
  }
}


async function generateRandomMessageFromWords() {
  try {
    const current = await Deno.readTextFile(WORD_LOG_FILE);
    const data = current.trim()
      ? JSON.parse(current)
      : { words: [], bigrams: {}, trigrams: {}, starts: [], ends: [] };

    if (!data.starts.length || !Object.keys(data.bigrams).length || !Object.keys(data.trigrams).length || !data.ends.length) {
      console.log("データ不足");
      return null;
    }

    // 文の構築
    const sentence: string[] = [];

    // 文頭
    let currentWord = data.starts[Math.floor(Math.random() * data.starts.length)];
    sentence.push(currentWord);

    // 中間（3～5語）
    const desiredLength = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < desiredLength; i++) {
      // トリグラムの候補を取得
      const nextCandidates = Object.keys(data.trigrams)
        .filter(b => b.startsWith(currentWord + ""));

      if (nextCandidates.length === 0) break;

      const nextTrigram = nextCandidates[Math.floor(Math.random() * nextCandidates.length)];
      const nextWord = nextTrigram.split("")[2]; // トリグラムの最後の単語を取得
      sentence.push(nextWord);
      currentWord = nextWord;
    }

    // 文末を選んでつなぐ（あれば）
    const endingWord = data.ends[Math.floor(Math.random() * data.ends.length)];
    sentence.push(endingWord);

    return sentence.join("");
  } catch (err) {
    console.error("文生成エラー:", err);
    return null;
  }
}


async function sendGeneratedMessage(channelId: string) {
  const generatedMessage = await generateRandomMessageFromWords();
  if (generatedMessage) {
    await bot.helpers.sendMessage(channelId, { content: generatedMessage });
  }
}


// ボタンがクリックされたときの処理
// bot.on("interactionCreate", async (interaction) => {
//   if (interaction.isButton()) {
//     if (interaction.customId === "brain_button") {
//       await interaction.reply({
//         content: "ボタンがクリックされました！",
//         ephemeral: true, // 一時的なメッセージ（他の人には見えない）
//       });
//     }
//   }
// });