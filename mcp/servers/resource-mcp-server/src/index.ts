import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// サーバの準備
const server = new McpServer({
  name: 'resources-mcp-server',
  version: '1.0.0',
});

// 買い物リストリソース登録
const filePath = `file://${process.cwd()}/shopping.txt`;

const metadata = {
  title: '買い物リスト',
  description: '食材・日用品などの購入予定アイテムを記載したテキストファイルです。',
  mimeType: 'text/plain',
};

// 買い物リストをリソースとして追加
server.registerResource(
  'shopping.txt',
  filePath,
  metadata,
  async (uri: URL) => {
    try {
      const localPath = fileURLToPath(uri).replace('file://', '');
      const text = await fs.readFile(localPath, 'utf-8');
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text,
          },
        ],
      };
    } catch (err) {
      console.error(`リソースの読み込みに失敗しました。: ${err}`);
      process.exit(1);
    }
  },
);

server.registerPrompt(
  'shopping-list-prompt',
  {
    title: '買い物リスト提示プロンプト',
    description: 'あらかじめ用意した買い物リストを返します',
    argsSchema: {},
  },
  async () => {
    try {
      const localPath = fileURLToPath(new URL(filePath));
      const text = await fs.readFile(localPath, 'utf-8');
      return {
        messages: [
          {
            role: 'assistant',
            content: {
              type: 'text',
              text: '`以下は買い物リストです',
            },
          },
          {
            role: 'assistant',
            content: {
              type: 'text',
              text: `${text}`,
            },
          },
        ],
      };
    } catch (err) {
      console.error(`プロンプトの読み込みに失敗しました: ${err}`);
      process.exit(1);
    }
  },
);

// メイン
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('stdio上で動作するリソースMCPサーバ');
}

main().catch((err) => {
  console.error('致命的なエラー:', err);
  process.exit(1);
});
