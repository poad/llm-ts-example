# graphrag-local-example (not working)

## Usage

```shell
docker compose down; docker compose up -d
cd batch
curl -sSL 'https://huggingface.co/mmnga/RakutenAI-7B-chat-gguf/resolve/main/RakutenAI-7B-chat-q2_K.gguf?download=true' -o RakutenAI-7B-chat-q2_K.gguf
# curl -sSL 'https://huggingface.co/mmnga/RakutenAI-7B-chat-gguf/resolve/main/RakutenAI-7B-chat-q8_0.gguf?download=true' -o models/RakutenAI-7B-chat-q8_0.gguf
pnpm install -r
pnpm build
pnpm start
cd ../app
pnpm dev
```
