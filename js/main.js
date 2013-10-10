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

var gameImages = [];
gameImages.addImage = function(aFilePath){
  if(!aFilePath) {
    return 'null';
  }
  this[this.length] = aFilePath;
  return aFilePath;
};
var IMG_GROUND          = gameImages.addImage('res/ground_r1.png');
var IMG_PLAYER          = gameImages.addImage('res/chara1_4x.png');
var IMG_COIN_YELLOW     = gameImages.addImage('res/coin_yellow.png');
var IMG_SCORE_NUM       = gameImages.addImage('res/score_num_thin.png');
var IMG_SCORE_NUM_BIG   = gameImages.addImage('res/score_num_big.png');
var IMG_TIMER_NUM       = gameImages.addImage('res/timer_num.png');
var IMG_TIMER_NUM_MINI  = gameImages.addImage('res/timer_num_mini.png');
var IMG_TITLE           = gameImages.addImage('res/title.png');
var IMG_STARTBUTTON     = gameImages.addImage('res/start.png');
var IMG_KEY_INFO        = gameImages.addImage('res/info_key.png');
var IMG_INFORM          = gameImages.addImage('res/period.png');
var IMG_RESULT_TXT      = gameImages.addImage('res/result_1.png');
var IMG_RESULT_PT       = gameImages.addImage('res/pts.png');
var IMG_RETURNTOTITLE   = gameImages.addImage('res/rett_txt.png');
var IMG_RANKING         = gameImages.addImage('res/rank_txt.png');

var RANKING_LENGTH = 10;
var FPS = 30;
var GAME_SPEED = 1;
var KEY_JUMP = 32;
var NUM_MAX_ITEM = 10;
var GAME_TIMER = 20.0;
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
  
  // ゲームスピードの設定
  game.speed = GAME_SPEED * (30 / game.fps);
  
  game.scale = 1.0;
  
  // キー(移動以外)の設定
  game.keybind(KEY_JUMP, 'a'); //ジャンプ
  
  
  // 画像のロード
  // プログラムで使う画像は全てここで読み込む
  game.preload(gameImages);
  
  
  game.onload = function() {
    // スコア管理用
	//var score = this.score = {};
    this.score2 = new Ranking();
    this.gameLaunch();
  };
  // ゲーム実行。タイトル画面へ。
  game.gameLaunch = function() {
    var aTitle = new Title();
    game.pushScene(aTitle);
    aTitle.addEventListener('gamestart', function(){
      console.log("aaa");
      game.popScene();
      game.pushScene(new Game());
    });
  };
  
  // デバッグ用。コンソールで使用
  game.setFps = function(fps) {
    game.fps = fps;
    game.speed = GAME_SPEED * (30 / game.fps);
    return;
  }
  
  game.start();
};

// enchant.jsのSceneクラスを継承したTitleクラス。
// ここにタイトルに表示するものを書く。
// 進捗 70%くらい
var Title = enchant.Class.create(enchant.Scene, {
    initialize: function() {
      enchant.Scene.call(this);
      this.backgroundColor = "#FFFFFF";
      
      var that = this;
      var titlePic = game.assets[IMG_TITLE];
      var startbuttonPic = game.assets[IMG_STARTBUTTON];
      var keyinfoPic = game.assets[IMG_KEY_INFO];
      
      var demoGroup = new Group();
      this.addChild(demoGroup);
      this.demo(demoGroup);
      var textGroup = new Group();
      this.addChild(textGroup);

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
      
      startbuttonSprite.addEventListener('touchstart', function(){
        var e = new enchant.Event("gamestart");
        that.dispatchEvent(e);
      });
      },
      
    // タイトル画面の裏で動くデモアニメーション
    // 進捗 90%くらい
    demo: function(aGroup){
      var max_coin = 30;
      var that = this;
      var secondGroup = new Group();
      aGroup.addChild(secondGroup);
      
      this.objectList = [];
      var groundList = this.objectList['ground'] = [];
      var itemList = this.objectList['item'] = [];
      
      var aGround = new Sprite(game.width, 64);
      aGround.image = game.assets[IMG_GROUND];
      aGround.x = 0;
      aGround.y = game.height - aGround.height;
      groundList.push(aGround);
      aGroup.addChild(aGround);
      
      var aLayer = new Entity();
      aLayer.backgroundColor = "#FFFFFF";
      aLayer.width = game.width;
      aLayer.height = game.height;
      aLayer.x = 0;
      aLayer.y = 0;
      aLayer.opacity = 0.6;
      aGroup.addChild(aLayer);
      
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
    }
  });
  
  var Game = enchant.Class.create(enchant.Scene, {
      initialize: function() {
        enchant.Scene.call(this);
        game.pushScene(this);
        this.imgInform = game.assets[IMG_INFORM];
        var that = this;
        
        this.objectList = [];
        var itemList = this.objectList['item'] = [];
        var groundList = this.objectList['ground'] = [];
        aGroup = new Group();
        this.addChild(aGroup);
        
        var pause = new Pause();
        this.addChild(pause);
        
        this.aScore = new Score();
//        console.log(this.aScore.score);
        this.aScore.y = -64;
        this.addChild(this.aScore);
        
        this.aTimer = new Timer();
        this.aTimer.y = -90;
        this.addChild(this.aTimer);
        
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
//            itemList.push(aCoin);
            }
          }
        });
            
        this.aTimer.addEventListener('timeup', function(){
//        game.popScene();
//        console.log("dettteiu");
          var debug = true;
          if (debug == true) {
            that.timeUp(); 
          }
        });

        this.ready();
      },
      
      // ゲームが始まる直前のアニメーション
      // 進捗80%
      ready: function(){
        var that = this;
        var imgReady = new Sprite(this.imgInform.width, this.imgInform.height / 3);
        imgReady.image = this.imgInform;
        imgReady.x = (game.width - imgReady.width) / 2;
        imgReady.y = -(imgReady.height);
        this.addChild(imgReady);

        // 公式の方法だとキーに変数を使用できないのでこの書き方になってる。
        // この方法だとフレームレートに依存しない動きが可能。
        // game.fps = 1秒
        var cue = {};
        cue[0] = function() {
          this.aScore.tl.moveTo(this.aScore.x, 20, game.fps, enchant.Easing.CUBIC_EASEOUT);
          this.aTimer.tl.moveTo(this.aTimer.x, 10, game.fps, enchant.Easing.BOUNCE_EASEOUT);
          this.aPlayer.tl.delay(game.fps * 0.2).moveTo(this.aPlayer.x, game.height - 128, game.fps * 1.5, enchant.Easing.EXPO_EASEOUT);
          imgReady.tl.moveTo(imgReady.x, (game.height - imgReady.height) / 2 - 20 , game.fps * 0.2, enchant.Easing.LINEAR).moveBy(0, 20 , game.fps * 1.8, enchant.Easing.LINEAR).and().fadeOut(game.fps * 1.8, enchant.Easing.QUAD_EASEIN);
        };
        cue[game.fps] = function() {

        };
        cue[game.fps * 2.0] = function() {
          this.aPlayer.enableOperation();
          imgReady.frame = 1;
          imgReady.tl.show().delay(game.fps * 0.2).moveTo(imgReady.x, -imgReady.y, game.fps * 1.0, enchant.Easing.BACK_EASEINOUT);
          this.aTimer.startTimer();
          this.objectList['item'].forEach(function(aItem, i){
            aItem.enableAction();
          });
        };
        this.tl.cue(cue);

//      this.tl.cue({
//      0: function() {
//      this.aScore.tl.moveTo(this.aScore.x, 20, game.fps, enchant.Easing.CUBIC_EASEOUT);
//      this.aTimer.tl.moveTo(this.aTimer.x, 10, game.fps, enchant.Easing.BOUNCE_EASEOUT).delay(game.fps * 0.2).then(function (){this.startCounter();});                
//      },
//      30 : function() {

//      }
//      });

      },
          
      // タイムアップ時のアニメーション
      // 進捗60%
      timeUp: function() {
        var that = this;
        var imgTimeUp = new Sprite(this.imgInform.width, this.imgInform.height / 3);
        var aEntity = new Entity();
        
        // スコア管理。
        game.score2.setLastScore('last1p', this.aScore.getScore());
        game.score2.addScoreToRanking('rank1p', this.aScore.getScore());
        
        // タイムアップ文字
        imgTimeUp.image = game.assets[IMG_INFORM];
        imgTimeUp.frame = 2;
        imgTimeUp.x = (game.width - imgTimeUp.width) / 2;
        imgTimeUp.y = -imgTimeUp.height;
        this.addChild(imgTimeUp);
        
        // フェードアウト用の白の一枚絵
        aEntity.opacity = 0;
        aEntity.width = game.width;
        aEntity.height = game.height;
        aEntity.backgroundColor = "#FFFFFF";
        this.addChild(aEntity);
        
        // アニメーション定義。cueでまとめたほうが良いかも
        imgTimeUp.tl.moveTo(imgTimeUp.x, (game.height - imgTimeUp.height) / 2, game.fps * 1.0, enchant.Easing.ELASTIC_EASEOUT);
        aEntity.tl.delay(game.fps * 1.5).fadeIn(game.fps).then(function(){
          var aResult = new Result(that);
          game.popScene();
          game.pushScene(aResult);
        });
        
        // オブジェクト動作制御
        this.aTimer.stopTimer();
        this.objectList['item'].forEach(function(aItem, i){
          aItem.disableAction();
        });
        this.aPlayer.disableOperation();
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
                
                this.count += game.speed;
                if (this.count > 2) {
                  this.count = 1;
                }
                
                // こじつけくさい(オブジェクト指向っぽくない)からボツ予定
                // これでいきます。
                var delta = 10;
                if (this.operationEnabled == true) {
                  if (isKeyLeftPress) {
                    this.x -= game.speed * delta;
                    this.frame = this.count;
                    this.direction = -1;
                  }else if (isKeyRightPress) {
                    this.x += game.speed * delta;
                    this.frame = this.count;
                    this.direction = 1;
                  }else{
                    this.frame = 0;
                  }
                  this.scaleX = this.direction;
                }
                
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
              this.y -= 40;
              this.state = 1;
              this.jumpCount--;
              this.olddelta_y = 0;
              this.ts = this.te = 0;
            }
            if (this.state == 1) {
              this.te += game.speed;
              this.frame = 1;
              var delta_t = (this.te - this.ts) / 1.0;
              var delta_y = (23 * delta_t - 0.5 * 3.2 * Math.pow(delta_t, 2.0));
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
            this.y = -1 * Math.round(Math.random() * 200) - this.height;
            // フレーム毎の処理
            this.addEventListener("enterframe", function() {
              if (that.actionEnabled == true) {
                this.y += game.speed * delta;
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
            
            this.addEventListener
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
                    var e = new enchant.Event('timeup');
                    that.dispatchEvent(e);
                    that.framecount = GAME_TIMER * game.fps;
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
          startTimer: function(){
            this.countEnabled = true;
          },
          stopTimer: function() {
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
          },
          getScore: function() {
            return this.score;
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
      
      var Result = enchant.Class.create(enchant.Scene, {
        initialize: function(gamemain) {
          enchant.Scene.call(this);
          var that = this;
          var gamemode = 1;
//          this.aGame = gamemain;
          this.playerScore = gamemain.aScore.getScore();
          var resultPic = game.assets[IMG_RESULT_TXT];
          var returnToTitlePic = game.assets[IMG_RETURNTOTITLE];
          var rankingPic = game.assets[IMG_RANKING];
          
          var aEntity = new Entity();
          aEntity.backgroundColor = "#FFFFFF";
          aEntity.width = game.width;
          aEntity.height = game.height;
          this.addChild(aEntity);
          var aGroup = new Group();
          this.addChild(aGroup);
          
          var textGroup = new Group();
          this.addChild(textGroup);
          
          var resultSprite = new Sprite(resultPic.width, resultPic.height);
          resultSprite.image = resultPic;
          resultSprite.x = (game.width - resultSprite.width) / 2;
          resultSprite.y = 80;
          textGroup.addChild(resultSprite);
          
          var rankSprite = new Sprite(rankingPic.width, rankingPic.height);
          rankSprite.image = rankingPic;
          rankSprite.x = 50;
          rankSprite.y = game.height - 90;
//          textGroup.addChild(rankSprite);
          
          
          var exitSprite = new Sprite(returnToTitlePic.width, returnToTitlePic.height);
          exitSprite.image = returnToTitlePic;
          exitSprite.x = game.width - exitSprite.width - 20;
          exitSprite.y = game.height - 90;
          exitSprite.touchEnabled = 'enable';
          textGroup.addChild(exitSprite);
          exitSprite.addEventListener("touchstart", function(){
            game.popScene();
            game.gameLaunch();
//          arguments.callee で自分自身(呼び出している関数)への参照を取得することができる。
//          参照 http://jsdo.it/phi/pQYE
            this.removeEventListener("touchstart", arguments.callee);
          });
          
          this.showScore(textGroup);
          
//          if (gamemode == 1) {
//            var restartEntity = new Entity();
//            restartEntity.x = (200 + Math.random() * 50);
//            restartEntity.y = 400;
//            restartEntity.width = 40;
//            restartEntity.height = 40;
//            restartEntity.touchEnabled = "enable";
//            restartEntity.backgroundColor = "#ffa500";
//            this.addChild(restartEntity);
//            restartEntity.addEventListener("touchstart", function(){
////              game.removeScene(that.aGame);
//              game.popScene();
//              game.gameLaunch();
//            });
//          }
          
        },
        showScore: function(textGroup) {
          var digitsGroup = new Group();
          var digits = new Array();
          var digitPic = game.assets[IMG_SCORE_NUM_BIG];
          var pointPic = game.assets[IMG_RESULT_PT];
          textGroup.addChild(digitsGroup);
          
          var pointSprite = new Sprite(pointPic.width, pointPic.height);
          pointSprite.image = pointPic;
          pointSprite.x = (game.width + digitPic.width) / 2 - pointPic.width;
          pointSprite.y = (game.height - digitPic.height) / 2;
          textGroup.addChild(pointSprite);
          
          // スコアは8桁
          for (var i = 0; i < 8; i++) {
            var aDigit = digits[i];
            aDigit = new Sprite(digitPic.width / 10, digitPic.height);
            aDigit.image = digitPic;
            aDigit.x = (game.width + digitPic.width) / 2 - (i + 2) * (digitPic.width / 10);
            aDigit.y = (game.height - digitPic.height) / 2;
            aDigit.frame = 10;
            digits.push(aDigit);
            this.addChild(aDigit);
          }
          
          var str = String(this.playerScore);
          var ary = str.split("").reverse();
          digits.forEach(function(aDigit, i){
              if (ary[i] != null) {
                aDigit.frame = ary[i];
              }else{
                // ここを0にすると0埋め、10にすると空白で埋められる。
                aDigit.frame = 0;
              }
          });
        }
      });
      
      var Ranking = enchant.Class.create({
        initialize: function() {
          var score = this.score = {};
          score['last1p'] = 0;
          score['last2p'] = 0;
          score['rank1p'] = [];
          score['rank2p'] = [];
        },
        
        setLastScore: function(mode, aScore) {
          if(!(mode in this.score)) {
            console.log("aaab");
            return;
          }
          if (aScore > 0) {
            this.score[mode] = aScore;
          }
        },
        
        addScoreToRanking: function(mode, aScore) {
          if(!(mode in this.score)) {
            console.log("aaabc");
            return;
          }
          var aRanking = this.score[mode];
          aRanking.push(aScore);
          aRanking.sort(
              function (a, b) {
                if( a > b ) return -1;
                if( a < b ) return 1;
                return 0;
              });
          
          
          var ct = aRanking.length - RANKING_LENGTH;
          for (var i = 0; i < ct; i++) {
            aRanking.pop();
          }
          
          aRanking.forEach(function(x, i){
            console.log(x);
          });
        }
      });
