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
var IMG_TIMER_NUM = 'res/timer_num.png';
var IMG_TIMER_NUM_MINI = 'res/timer_num_mini.png';
var IMG_TITLE = 'res/title.png';
var IMG_STARTBUTTON = 'res/start.png';
var IMG_KEY_INFO = 'res/info_key.png';
var FPS = 30;
var KEY_JUMP = 32;
var NUM_MAX_ITEM = 30;
var GAME_TIMER = 30; // タイマーはfps依存
var GRAVITY = 9.8;
var aScore;
var aTimer;

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
  game.fps = FPS;
  
  game.scale = 1.0;
  
  // キー(移動以外)の設定
  game.keybind(KEY_JUMP, 'a'); //ジャンプ
  
  
  // 画像のロード
  // プログラムで使う画像は全てここで読み込む
  game.preload([IMG_GROUND,
    IMG_PLAYER,
    IMG_COIN_YELLOW,
    IMG_SCORE_NUM,
    IMG_TIMER_NUM,
    IMG_TIMER_NUM_MINI,
    IMG_TITLE,
    IMG_STARTBUTTON,
  IMG_KEY_INFO]);
  
  
  game.onload = function() {
    
    var aTitle = new Title();
      aTitle.addEventListener("gamestart", function () {
        Game();
    });
    // 大幅変更前
    
    // 操作キャラのフレーム毎の処理
    // TODO: spriteクラスを継承してplayerクラスを作り、フィールドを定義したり自作メソッドが呼び出せるようにする。
  }
  game.start();
};

var Title = enchant.Class.create(enchant.Scene, {
    initialize: function() {
      var that = this;
      enchant.Scene.call(this);
      var demoGroup = new Group();
      this.addChild(demoGroup);
      this.demo(demoGroup);
      var textGroup = new Group();
      this.addChild(textGroup);
      var titlePic = game.assets[IMG_TITLE];
      var startbuttonPic = game.assets[IMG_STARTBUTTON];
      var keyinfoPic = game.assets[IMG_KEY_INFO];
      var titleSprite = new Sprite(titlePic.width, titlePic.height);
      titleSprite.image = titlePic;
      titleSprite.x = (game.width - titleSprite.width) / 2;
      titleSprite.y = 80; 
      textGroup.addChild(titleSprite);
      var startbuttonSprite = new Sprite(startbuttonPic.width, startbuttonPic.height);
        startbuttonSprite.image = startbuttonPic;
        startbuttonSprite.x = (game.width - startbuttonSprite.width) / 2;
        startbuttonSprite.y = 350;
        textGroup.addChild(startbuttonSprite);
        var keyinfoSprite = new Sprite(keyinfoPic.width, keyinfoPic.height);
        keyinfoSprite.image = keyinfoPic;
        keyinfoSprite.x = (game.width - keyinfoSprite.width) / 2;
        keyinfoSprite.y = 540;
        textGroup.addChild(keyinfoSprite);
        this.backgroundColor = "#FFFFFF";
          startbuttonSprite.addEventListener('touchstart', function(){
            game.popScene();
            delete that;
            var e = new enchant.Event("gamestart");
            that.dispatchEvent(e);
        });
        game.pushScene(this);
      },
    // タイトル画面の裏で動くデモアニメーション
    demo: function(aGroup){
      var max_coin = 30;
      var that = this;
      var secondGroup = new Group();
      this.objectList = [];
      var groundList = this.objectList['ground'] = [];
      var itemList = this.objectList['item'] = [];
      var aGround = new Sprite(game.width, 64);
      aGround.image = game.assets[IMG_GROUND];
      aGround.x = 0;
      aGround.y = game.height - aGround.height;
      groundList.push(aGround);
      aGroup.addChild(aGround);
      
      for (var i = 0; i < max_coin; i++) {
        var aItem = new Item(0, Math.round(Math.random() * 2 + 7), secondGroup, this.objectList);
        aItem.enableAction();
      }
      
      aGroup.addEventListener('enterframe', function(){
        for (var i = 0; i < max_coin - itemList.length; i++) {
          var aItem = new Item(0, Math.round(Math.random() * 2 + 7), secondGroup, that.objectList);
          aItem.enableAction();
        }
      });
      aGroup.addChild(secondGroup);
      var aLayer = new Entity();
      aLayer.backgroundColor = "#FFFFFF";
      aLayer.width = game.width;
      aLayer.height = game.height;
      aLayer.x = 0;
      aLayer.y = 0;
      aLayer.opacity = 0.6;
      aGroup.addChild(aLayer);
     
    }
  });
  
  var Game = enchant.Class.create(enchant.Scene, {
      initialize: function() {
        var that = this;
        enchant.Scene.call(this);
        game.pushScene(this);
        this.objectList = [];
        var itemList = this.objectList['item'] = [];
        var groundList = this.objectList['ground'] = [];
        aGroup = new Group();
        this.addChild(aGroup);
        var pause = new Pause();
        this.addChild(pause);
        this.aScore = new Score();
        this.addChild(this.aScore);
        this.aScore.y = -64;
        this.aTimer = new Timer();
        this.addChild(this.aTimer);
        this.aTimer.y = -90;
        this.aPlayer = new Player(this.objectList, this.aScore);
        this.aPlayer.y = -(this.aPlayer.height);
        this.addChild(this.aPlayer);
        //  var testPlayer = new Player(300, 100);
        //  testPlayer.tl.moveTo(300, game.height -128, 45, enchant.Easing.CUBIC_EASEOUT);

        
        //コインを出現させる。
        for (var i = 0; i < NUM_MAX_ITEM; i++) {
          var aCoin = new Item(0, Math.round(Math.random() * 2 + 7), aGroup, this.objectList);
        }
          
          // 地面を敷き詰める。
          for (var x = 0; x < game.width; x += game.width) {
            var ground = new Sprite(game.width, 64);
            ground.image = game.assets[IMG_GROUND];
            ground.x = x;
            ground.y = game.height - 64;
            
            // 衝突判定のために配列に保存する。
            // 衝突させる物体(コイン、アイテムなど)が増えるにつれ重くなるので1枚のデカいテクスチャに変える可能性アリ
            groundList.push(ground);
            
            // 画面に出す。
            this.addChild(ground);
          }
          
            this.addEventListener("enterframe", function(){
              if (itemList.length < NUM_MAX_ITEM) {
                for (var i = 0; i < NUM_MAX_ITEM - itemList.length; i++) {
                    var aCoin = new Item(0, Math.round(Math.random() * 2 + 7), aGroup, this.objectList);
                    aCoin.enableAction();
//                    itemList.push(aCoin);
                  }
                }
            });
            
            this.ready();
          },
          // ゲームが始まる直前のアニメーション
          // 進捗80%
          ready: function(){
            var that = this;
            // 公式の方法だとキーに変数を使用できないのでこの書き方になってる。
            // この方法だとフレームレートに依存しない動きが可能。
            // game.fps = 1秒
            var cue = {};
            cue[0] = function() {
              this.aScore.tl.moveTo(this.aScore.x, 20, game.fps, enchant.Easing.CUBIC_EASEOUT);
              this.aTimer.tl.moveTo(this.aTimer.x, 10, game.fps, enchant.Easing.BOUNCE_EASEOUT);
              this.aPlayer.tl.delay(game.fps * 0.2).moveTo(this.aPlayer.x, game.height - 128, game.fps * 1.0, enchant.Easing.EXPO_EASEOUT);
            };
            cue[game.fps] = function() {
              this.aPlayer.enableOperation();
            };
            cue[game.fps * 2.0] = function() {
              this.aTimer.startCounter();
              this.objectList['item'].forEach(function(aItem, i){
                aItem.enableAction();
              });
            };
            this.tl.cue(cue);

//            this.tl.cue({
//              0: function() {
//                this.aScore.tl.moveTo(this.aScore.x, 20, game.fps, enchant.Easing.CUBIC_EASEOUT);
//                this.aTimer.tl.moveTo(this.aTimer.x, 10, game.fps, enchant.Easing.BOUNCE_EASEOUT).delay(game.fps * 0.2).then(function (){this.startCounter();});                
//              },
//              30 : function() {
//                
//              }
//            });

          }
      });
      
      var Player = enchant.Class.create(enchant.Sprite,{  
          initialize: function(objectList, aScore) {
            enchant.Sprite.call(this, 64, 64);
            // enchant.jsでは変数を予め宣言する必要は無い。
            // フィールドに値を設定するときはthis.xxxのようにして書く。
            // x, y: 座標
            // frame: 表示する画像
            // count: フレームカウント用
            // direction: キャラの向き。1が右、-1が左
            var that = this;
            var SPACE_JUMP = 2;
            var VELOCITY = 9.8;
            this.aScore = aScore;
            this.operationEnabled = false;
            this.image = game.assets[IMG_PLAYER];
            this.objectList = objectList;
            this.x = 200;
            this.y = game.height - 64;
//            this.x = x;
//            this.y = y;
            this.frame = 0;
            this.count = 0;
            this.direction = 1;
            this.ts = game.frame;
            this.te = game.frame;
            this.state = 0;
            this.olddelta_y = 0;
            this.oldState = 0;
            this.jumpCount = SPACE_JUMP;
            
            var isKeyDown = false;
            var isKeyUpPress = false;
            var isKeyDownPress = false;
            var isKeyLeftPress = false;
            var isKeyRightPress = false;
            var isKeySpacePress = false;
            
              document.addEventListener('keydown', function(e) {
                if (that.operationEnabled == true) {
                  switch(e.keyCode) {
                  case 32:
                    isKeySpacePress = true;
                    that.jump(1);
                    break;
                  case 37: isKeyLeftPress = true; break;
                  case 38: isKeyUpPress = true; break;
                  case 39: isKeyRightPress = true; break;
                  case 40: isKeyDownPress = true; break;
                  }
                }
            }, true);
              document.addEventListener('keyup', function(e) {
                if (that.operationEnabled == true) {
                  switch(e.keyCode) {
                  case 32: isKeySpacePress = false; break;
                  case 37: isKeyLeftPress = false; break;
                  case 38: isKeyUpPress = false; break;
                  case 39: isKeyRightPress = false; break;
                  case 40: isKeyDownPress = false; break;
                  }
                } 
            }, true);
            
              this.addEventListener('enterframe', function() {
                //this.y += 10;
                
                this.count++;
                if (this.count > 2) {
                  this.count = 1;
                }
                
                // こじつけくさい(オブジェクト指向っぽくない)からボツ予定
                // これでいきます。
                var delta = 10;
                if (isKeyLeftPress) {
                  this.x -= delta;
                  this.frame = this.count;
                  this.direction = -1;
                }else if (isKeyRightPress) {
                  this.x += delta;
                  this.frame = this.count;
                  this.direction = 1;
                }else{
                  this.frame = 0;
                }
                this.scaleX = this.direction;
                
                this.jump();
                
                // 壁との衝突判定
                // 微調整の余地アリ
                if (this.x < 0) {
                  this.x = 0;
                }else if(this.x > game.width - this.width) {
                  this.x = game.width - this.width;
                }
                
                // 地面との衝突判定
                  this.objectList['ground'].forEach (function(aGround, i) {
                    if (that.intersect(aGround) || that.y + that.height > game.width) {
                      that.state = 0;
                      that.ts = that.te = 0;
                      that.jumpCount = SPACE_JUMP;
                      that.y = aGround.y - that.height;
                    }
                });
                
                // アイテムとの衝突判定
                  this.objectList['item'].forEach (function(aItem, i) {
                    if (that.operationEnabled == true) {
                      if (that.intersect(aItem)) {
                        that.aScore.addPoint(aItem.getPoint());
                        aItem.remove();
                      }
                    }
                });
            });
          },
          
          jump: function(jumpFlag){
            if (jumpFlag == 1 && this.jumpCount > 0) {
              this.y -= 30;
              this.state = 1;
              this.jumpCount--;
              this.olddelta_y = 0;
              this.ts = this.te = 0;
            }
            if (this.state == 1) {
              this.te++;
              this.frame = 1;
              var delta_t = (this.te - this.ts) / 1.0;
              var delta_y = (23 * delta_t - 0.5 * 2.5 * Math.pow(delta_t, 2.0));
              this.y -= (delta_y - this.olddelta_y);
              this.olddelta_y = delta_y;	
            } 
          },
          enableOperation: function() {
            this.operationEnabled = true;
          },
          disableOperation: function() {
            this.operationEnabled = false;
          }
      });
      
      // enchant.jsのスプライト(Sprite)クラスを継承し、Itemクラスを作成。
      var Item = enchant.Class.create
      (enchant.Sprite, {
          // コンストラクタ。
          // 引数について
          // id: 落下物の種類 (0:黄色コイン)
          // delta: 1フレーム毎に落下させる量(単位:ピクセル)
          // group: 追加するグループ
          // objectList: アイテムや地面などのリスト
          initialize: function(id, delta, group, objectList) {
            var img_name;
            var that = this;
            this.actionEnabled = false;
            this.objectList = objectList;
            this.group = group;
            this.point = 0;
            if (id == 0) {
              img_name = IMG_COIN_YELLOW;
              this.point = 100;
            }
            var aImage = game.assets[img_name];
            enchant.Sprite.call(this, aImage.width, aImage.height, img_name);
            this.image = aImage;
            // アイテムの出現位置をセット。x座標は画面内に収まるように、y座標は画面外にセット。
            this.x = Math.round(Math.random() * (game.width - this.width));
            this.y = -1 * Math.round(Math.random() * 200);
            // フレーム毎の処理
            this.addEventListener("enterframe", function() {
              if (that.actionEnabled == true) {
                this.y += delta;
              }
              // 地面との衝突判定
              that.objectList['ground'].forEach (function(aGround, i) {
                if (that.intersect(aGround)) {
                  that.remove();
                }
              });
            });
            this.objectList['item'].push(this);
            group.addChild(this);
          },
          
          // スコアを返す
          getPoint: function() {
            return this.point;
          },
          
          // 地面やプレイヤーに衝突した時の処理
          remove: function() {
            var that = this;
            this.group.removeChild(this);
              this.objectList['item'].forEach( function(aItem, i) {
                if (that == aItem) {
                  that.objectList['item'].splice(i, 1);
                }
            });
            delete this;
          },
          
          enableAction: function() {
            this.actionEnabled = true;
          },
          
          disableAction: function() {
            this.actionEnabled = false;
          }
      });
      
      // タイマー表示
      var Timer = enchant.Class.create
      (enchant.Group, {
          initialize: function() {
            enchant.Group.call(this);
            this.countEnabled = false;
            var that = this;
            this.framecount = 0;
            this.x = 310;
            this.y = 10;
            this.digits = new Array();
            for (var i = 0; i < 4; i++) {
              var aDigit = this.digits[i];
              if(i < 2) {
                aDigit = new Sprite(80, 90);
                aDigit.image = game.assets[IMG_TIMER_NUM];
                aDigit.x = i * aDigit.width;
              }else{
                aDigit = new Sprite(30, 34);
                aDigit.image = game.assets[IMG_TIMER_NUM_MINI];
                aDigit.x = this.digits[1].x + this.digits[1].width + (i-2) * aDigit.width;
                aDigit.y = this.digits[1].y + this.digits[1].height - aDigit.height;
              }
              this.digits.push(aDigit);
              this.addChild(aDigit);
            }
            
            game.addEventListener
              ("enterframe", function() {
                if (that.countEnabled == true) {
                  that.framecount++;
                }
                var last = GAME_TIMER * game.fps - that.framecount;
                var sec = parseInt(last / game.fps);
                var msec = (last / game.fps) - sec;
                var secAry = String(sec).split("");
                if (sec < 10) {
                  secAry = '0' + secAry;
                }
                var msecAry = String(msec).split("");
                
                if (last < 0) {
                  that.framecount = 0;
                }
                for (var i = 0; i < 4; i++) {
                  if (i < 2) {
                    that.digits[i].frame = secAry[i];
                  }else{
                    that.digits[i].frame = msecAry[i];
                  }
                }
            });
          },
          startCounter: function(){
            this.countEnabled = true;
          },
          stopCounter: function() {
            this.countEnabled = false;
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
            this.score = 0;
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
            this.score += point;
          }
      });
      
      // デバッグ用の一時停止プログラム。
      // 画面右上の四角をクリックすると停止と実行が切り替わる。
      var Pause = enchant.Class.create(enchant.Entity, {
          initialize: function() {
            enchant.Entity.call(this);
            this.x = 745;
            this.y = 10;
            this.width = 50;
            this.height = 50;
            this.flag = 1;
            this.touchEnabled = "enabled";
            this.backgroundColor = "#ffa500";
              this.addEventListener("touchstart", function() {
                if (this.flag == 1) {
                  game.pause();
                  this.flag = 2;
                }else if (this.flag == 2) {
                  game.resume();
                  this.flag = 1;
                }
            });
          }
      });
