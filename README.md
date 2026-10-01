# juego-game

CHẤM: game nối chấm chiếm tam giác trên điện thoại, chơi với máy.

## Chạy tại máy

```sh
python -m http.server 5173 --directory triangle-duel/dist
```

Mở http://localhost:5173.

## Vercel

Import repository này, giữ Root Directory ở gốc repository. Cấu hình
`vercel.json` phục vụ trực tiếp `triangle-duel/dist`, không cần cài dependency
hoặc build. Production branch: `main`.

## Kiểm tra luật chơi

```sh
node triangle-duel/verify.mjs
```
