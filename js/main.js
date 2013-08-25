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
var IMG_PLAYER = 'res/chara1_4x.png';
var IMG_COIN_YELLOW = 'res/coin_yellow.png';
var key_jump = 32;
var NUM_COIN = 100;

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
  game = new Core(800, 600);
  
  // フレームレートの設定
  game.fps = 29.97;
  
  // キー(移動以外)の設定
  game.keybind(key_jump, 'a'); //ジャンプ
  
  
  // 画像のロード
  // プログラムで使う画像は全てここで読み込む
  game.preload([IMG_GROUND, IMG_PLAYER, IMG_COIN_YELLOW]);
  
  
  game.onload = function() {
    
    var aPlayer = new Player(200, 200);
    var Coin = new Item(0, 10, 32, 32);
    
    //コインを出現させる。
    coinList = [];
    for (var i = 0; i < NUM_COIN; i++) {
      var aCoin = new Item(0, Math.round(Math.random() * 2 + 7), 32, 32);
      coinList.push(aCoin);
    }
    
    // 地面を敷き詰める。
    groundList = [];
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
  }
  game.start();
};

var Player = enchant.Class.create
(enchant.Sprite,{
 
 initialize: function(x, y) {
  enchant.Sprite.call(this, 64, 64);
  // enchant.jsでは変数を予め宣言する必要は無い。(逆に宣言してしまうとエラーになる？)
  // フィールドに値を設定するときはthis.xxxのようにして書く。
  // x, y: 座標
  // frame: 表示する画像
  // count: フレームカウント用
  // direction: キャラの向き。1が右、-1が左
  this.image = game.assets[IMG_PLAYER];
  this.x = x;
  this.y = y;
  this.frame = 0;
  this.count = 0;
  this.direction = 1;
 
  this.addEventListener
    ('enterframe', function() {
     this.y += 5;
     
     this.count++;
     if (this.count > 2) {
      this.count = 1;
     }
     
   
     // こじつけくさい(オブジェクト指向っぽくない)からボツ予定
     var delta = 10;
     if (game.input.left) {
      this.x -= delta;
      this.frame = this.count;
      this.direction = -1;
     }else if (game.input.right) {
      this.x += delta;
      this.frame = this.count;
      this.direction = 1;
     }else{
      this.frame = 0;
     }
     this.scaleX = this.direction;
   
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
 
 game.rootScene.addChild(this);
 }
});

// enchant.jsのスプライト(Sprite)クラスを継承し、Itemクラスを作成。
var Item = enchant.Class.create
  (enchant.Sprite, {
   // コンストラクタ。
   // 引数について
   // id: 落下物の種類 (0:黄色コイン)
   // delta: 1フレーム毎に落下させる量(単位:ピクセル)
   // spr_width: スプライトの横幅
   // spr_height: スプライトの縦幅
   initialize: function(id, delta, spr_width, spr_height) {
   var img_name;
   if (id == 0) {
    img_name = IMG_COIN_YELLOW;
   }
   enchant.Sprite.call(this, spr_width, spr_height, img_name);
   this.image = game.assets[img_name];
   // アイテムの出現位置をセット。x座標は画面内に収まるように、y座標は画面外にセット。
   this.x = Math.round(Math.random() * (game.width - this.width));
   this.y = -1 * Math.round(Math.random() * 200);
   // フレーム毎の処理
   this.addEventListener
    ("enterframe", function() {
     this.y += delta;
     
     // 地面との衝突判定
     for (var i = 0; i < groundList.length; i++) {
      var aGround = groundList[i];
      if (this.intersect(aGround)) {
        this.remove();
      }
     }
     });
   game.rootScene.addChild(this);
   },
   
   // 地面やプレイヤーに衝突した時の処理
   remove: function() {
    game.rootScene.removeChild(this);
    delete this;
   }
  });


