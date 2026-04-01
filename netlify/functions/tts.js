/**
 * 叡智コーチ - テキスト読み上げ (OpenAI TTS)
 * 温かみのある自然な日本語音声を生成します。
 */

const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "OpenAI APIキーが設定されていません。" }),
    };
  }

  try {
    const { text, voice } = JSON.parse(event.body);
    if (!text) {
      return { statusCode: 400, body: JSON.stringify({ error: "テキストが空です" }) };
    }
    const allowedVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
    const selectedVoice = allowedVoices.includes(voice) ? voice : "shimmer";

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1-hd",
        input: text,
        voice: selectedVoice,
        response_format: "mp3",
        speed: 0.95,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "音声生成に失敗しました: " + errText }),
      };
    }

    const audioBuffer = await response.buffer();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store, no-cache",
      },
      body: audioBuffer.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "エラーが発生しました: " + err.message }),
    };
  }
};
