/**
 * enchant();
 * Preparation for using enchant.js.
 * (Exporting enchant.js class to global namespace.
 *  ex. enchant.Sprite -> Sprite etc..)
 *
 * enchant.js を使う前に必要な処理。
 * (enchant.js 本体や、読み込んだプラグインの中で定義されている enchant.Foo, enchant.Plugin.Bar などのクラスを、
 *  それぞれグローバルの Foo, Bar にエクスポートする。)
 */
enchant();

var IMG_GROUND = 'res/ground_test.png';

/*
 * window.onload
 *
 * The function which will be executed after loading page.
 * Command in enchant.js such as "new Core();" will cause an error if executed before entire page is loaded.
 *
 * ページがロードされた際に実行される関数。
 * すべての処理はページがロードされてから行うため、 window.onload の中で実行する。
 * 特に new Core(); は、<body> タグが存在しないとエラーになるので注意。
 */
window.onload = function(){
  // ゲーム画面を開く
  var game = new Core(800, 600);
  
  // フレームレートの設定
  game.fps = 30;
  
  // 画像のロード
  // プログラムで使う画像は全てここで読み込む
  game.preload([IMG_GROUND]);
  
  
  game.onload = function() {
    
    // 地面を敷き詰める。
    for (var x = 0; x < game.width; x += 64) {
      var ground = new Sprite(64, 64);
      ground.image = game.assets[IMG_GROUND];
      ground.x = x;
      ground.y = game.height - 64;
      game.rootScene.addChild(ground);
    }
      
  }
  game.start();
};
