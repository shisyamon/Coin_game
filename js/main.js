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
var IMG_SCORE_NUM = 'res/score_num_thin.png';
var key_jump = 32;
var NUM_MAX_ITEM = 50;
var aScore;

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
  game.preload([IMG_GROUND,
                IMG_PLAYER,
                IMG_COIN_YELLOW,
                IMG_SCORE_NUM]);
  
  
  game.onload = function() {
    
    var pause = new Pause();
    
    var aPlayer = new Player(200, 200);
    
    var Coin = new Item(0, 10, 32, 32);
    
    aScore = new Score();
    
    //コインを出現させる。
    itemList = new Array();
    for (var i = 0; i < NUM_MAX_ITEM; i++) {
      var aCoin = new Item(0, Math.round(Math.random() * 2 + 7), 32, 32);
      itemList.push(aCoin);
    }
    
    // 地面を敷き詰める。
    groundList = new Array();
    for (var x = 0; x < game.width; x += 64) {
      var ground = new Sprite(64, 64);
      ground.image = game.assets[IMG_GROUND];
      ground.x = x;
      ground.y = game.height - 64;
      
      // 衝突判定のために配列に保存する。
      // 衝突させる物体(コイン、アイテムなど)が増えるにつれ重くなるので1枚のデカいテクスチャに変える可能性アリ
      groundList.push(ground);
      
      game.rootScene.addEventListener
        ("enterframe", function(){
         if (itemList.length < NUM_MAX_ITEM) {
         for (var i = 0; i < NUM_MAX_ITEM - itemList.length; i++) {
         var aCoin = new Item(0, Math.round(Math.random() * 2 + 7), 32, 32);
         itemList.push(aCoin);
         }
         }
         });
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
  // enchant.jsでは変数を予め宣言する必要は無い。
  // フィールドに値を設定するときはthis.xxxのようにして書く。
  // x, y: 座標
  // frame: 表示する画像
  // count: フレームカウント用
  // direction: キャラの向き。1が右、-1が左
  var that = this;
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
     
     if(game.input.a) {
     game.pause();
     }
   
     // 壁との衝突判定
     // 微調整の余地アリ
     if (this.x < 0) {
      this.x = 0;
     }else if(this.x > game.width - this.width) {
      this.x = game.width - this.width;
     }
   
     // 地面との衝突判定
     groundList.forEach (function(aGround, i) {
       if (that.intersect(aGround)) {
         that.y = aGround.y - that.height;
       }
     });
     
     // アイテムとの衝突判定
     itemList.forEach (function(aItem, i) {
      if (that.intersect(aItem)) {
        aScore.addPoint(aItem.getPoint());
        aItem.remove();
      }
     });
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
   var that = this;
   this.point = 0;
   if (id == 0) {
    img_name = IMG_COIN_YELLOW;
    this.point = 100;
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
     groundList.forEach (function(aGround, i) {
       if (that.intersect(aGround)) {
         that.remove();
       }
     });
    });
   game.rootScene.addChild(this);
   },
   
   // スコアを返す
   getPoint: function() {
    return this.point;
   },
   
   // 地面やプレイヤーに衝突した時の処理
   remove: function() {
    var that = this;
    game.rootScene.removeChild(this);
    itemList.forEach( function(aItem, i) {
    if (that == aItem) {
      itemList.splice(i, 1);
    }
    });
    delete this;
   }
  });

// スコア表示
var Score = enchant.Class.create
  (enchant.Group, {
   initialize: function() {
   enchant.Group.call(this);
   var that = this;
   this.x = 10;
   this.y = 20;
   this.digits = new Array();
   this.score = 1500;
   this.score2 = 0;
   // スコアは8桁
   for (var i = 0; i < 8; i++) {
   var aDigit = this.digits[i];
   aDigit = new Sprite(28, 28);
   aDigit.image = game.assets[IMG_SCORE_NUM];
   aDigit.x = 210 - i * 28;
   aDigit.y = 0;
   aDigit.frame = 10;
   this.digits.push(aDigit);
   this.addChild(aDigit);
   }
   game.rootScene.addChild(this);
   this.addEventListener
    ("enterframe", function(){
     if (this.score > 9999999) {
      this.score = 99999999;
     }else if(this.score < 0) {
      this.score = 0;
     }
     
     // 徐々にスコアがカウントされるアレ。
     var step = 10;
     if (Math.abs(this.score - this.score2) >= 500) {
      step = 500;
     }
     if (this.score2 < this.score) {
      this.score2 += step;
     }else if(this.score2 > this.score) {
      this.score2 -= step;
     }else{
     this.score2 = this.score;
     }
     var str = String(this.score2);
     var ary = str.split("").reverse();
     this.digits.forEach
      (function(aDigit, i){
       if (ary[i] != null) {
       aDigit.frame = ary[i];
       }else{
       // ここを0にすると0埋め、10にすると空白で埋められる。
       aDigit.frame = 0;
       }
       
       });
     });
   },
   
   addPoint: function(point) {
   console.log(this.score + " " + point);
    this.score += point;
   }
   });

// デバッグ用の一時停止プログラム。
// 画面右上の四角をクリックすると停止と実行が切り替わる。
var Pause = enchant.Class.create
(enchant.Entity, {
 initialize: function() {
 enchant.Entity.call(this);

 this.x = 745;
 this.y = 10;
 this.width = 50;
 this.height = 50;
 this.flag = 1;
 this.touchEnabled = "enabled";
 this.backgroundColor = "#ffa500";
 this.addEventListener
 ("touchstart", function() {
  if (this.flag == 1) {
  game.pause();
  this.flag = 2;
  }else if (this.flag == 2) {
  game.resume();
  this.flag = 1;
  }
  });
 game.rootScene.addChild(this);
 }
 });

