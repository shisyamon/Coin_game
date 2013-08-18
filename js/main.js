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
var IMG_PLAYER = 'res/chara1_4x.png'
var key_jump = 32;

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
  
  // キー(移動以外)の設定
  game.keybind(key_jump, 'a'); //ジャンプ
  
  
  // 画像のロード
  // プログラムで使う画像は全てここで読み込む
  game.preload([IMG_GROUND, IMG_PLAYER]);
  
  
  game.onload = function() {
    
    
    var player = new Sprite(64, 64);
    player.image = game.assets[IMG_PLAYER];
    player.x = 100;
    player.y = 100;
    game.rootScene.addChild(player);
    
    // 地面を敷き詰める。
    var groundList = [];
    for (var x = 0; x < game.width; x += 64) {
      var ground = new Sprite(64, 64);
      ground.image = game.assets[IMG_GROUND];
      ground.x = x;
      ground.y = game.height - 64;
      
      // 衝突判定のために配列に保存する。
      // 衝突させる物体(コイン、アイテムなど)が増えるにつれ重くなるので1枚のデカいテクスチャに変える可能性アリ
      groundList.push(ground);
      // 画面に出す。
      game.rootScene.addChild(ground);
    }
    
    // 操作キャラのフレーム毎の処理
    // TODO: spriteクラスを継承してplayerクラスを作り、フィールドを定義したり自作メソッドが呼び出せるようにする。
    player.addEventListener
    ("enterframe", function(){
      this.y += 5;
     
     
      // こじつけくさい(オブジェクト指向っぽくない)からボツ予定
      var delta = 5;
      if (game.input.left) {
        this.x -= delta;
      }else if (game.input.right) {
        this.x += delta;
      }
     
     
      // 壁との衝突判定
      // 微調整の余地アリ
      if (this.x < 0) {
        this.x = 0;
      }else if(this.x > game.width - this.width) {
        this.x = game.width - this.width;
      }
     
      // 地面との衝突判定
      for (var i = 0; i < groundList.length; i++) {
      var aGround = groundList[i];
        if (this.intersect(aGround)) {
          this.y = aGround.y - this.height;
        }
      }
    });
  }
  game.start();
};
