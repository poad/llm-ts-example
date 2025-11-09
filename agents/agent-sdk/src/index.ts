import { query } from '@anthropic-ai/claude-agent-sdk';

(async () => {
  const stream = query({
    prompt:
      'Node.js のプログラムでフィボナッチ数列を出力するプログラムを TypeScript 書いて、現在の作業ディレクトリに output.ts という名前で保存してください。ファイルパスは相対パスで ./output.ts としてください。',
    options: {
      // systemPrompt: '',
      allowedTools: ['Write'],
      cwd: process.cwd(),
    },
  });

  for await (const message of stream) {
    // 実行途中の出力をログ表示
    console.log(message);
  }

  console.log('\n処理を完了しました。');
})();
