var demo = {};
var ship, bullet, bullets, enemyGroup, cursors, shootSound, filter, sprite, boomEffect, deadSound, theme;
var bulletvelocity = 700, nextFire = 0, fireRate = 300;
var speed = 6;
var centerX = 800/2;
var centerY = 600/2;
var distance = 300;
var speed = 6;
var star;
var texture;

var max = 50;
var xx = [];
var yy = [];
var zz = [];

demo.level1 = function() {};
demo.level1.prototype = {
  preload: function() {
    game.load.spritesheet('ship', './assets/sprites/ship.png', 85, 65);
    game.load.spritesheet('vhs', './assets/sprites/vhs.png', 85, 65);
    game.load.spritesheet('bullet', './assets/sprites/bullet.png', 64, 22);
    game.load.spritesheet('boomEffect', './assets/effects/explosion.png', 80, 80);
    game.load.image('bg', './assets/backgrounds/space.png');
    game.load.image('star', './assets/sprites/star.png');
    game.load.audio('shootSound', 'assets/sounds/shoot.wav');
    game.load.audio('deadSound', 'assets/sounds/dark-shoot.wav');
    game.load.audio('theme', 'assets/bgm/theme.ogg');
  },
  create: function(){
    game.stage.backgroundColor = '#800080';
    game.physics.startSystem(Phaser.Physics.ARCADE);
    addChangeStateEventListeners();
    
    theme = game.add.audio('theme', 0.3, true);
    theme.play();
    shootSound = game.add.audio('shootSound');
    shootSound.addMarker('shoot', 0, 2);
    deadSound = game.add.audio('deadSound');
    deadSound.addMarker('dead', 0, 2);
    game.world.setBounds(0, 0, 800, 600);
    
    //game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    //var bg = game.add.sprite(0, 0, 'bg');
    star = game.make.sprite(0, 0, 'star');
    texture = game.add.renderTexture(800, 600, 'texture');

    game.add.sprite(0, 0, texture);

    for (var i = 0; i < max; i++)
    {
        xx[i] = Math.floor(Math.random() * 800) - 400;
        yy[i] = Math.floor(Math.random() * 600) - 300;
        zz[i] = Math.floor(Math.random() * 1700) - 100;
    }
    
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(50, 'bullet');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('scale.x', 0.6);
    bullets.setAll('scale.y', 0.6);
    ship = game.add.sprite(centerX/2, centerY, 'ship');
    ship.anchor.setTo(0.5, 0.5);
    //ship.scale.setTo(1.5, 1.5);

    game.physics.enable(ship);
    ship.body.collideWorldBounds = true;
    ship.body.gravity.x = -1000;
    ship.body.bounce.x = 0.3;
    ship.animations.add('fly', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    
    cursors = game.input.keyboard.createCursorKeys();
    
    enemyGroup = game.add.group();
    enemyGroup.enableBody = true;
    enemyGroup.physicsBodyType = Phaser.Physics.ARCADE;
    
    for (var i = 0; i < 5; i++) {
      enemyGroup.create(700, 150 * i + 100, 'vhs');
    }
    
    enemyGroup.forEach(this.moveEnemy);
    enemyGroup.setAll('anchor.y', 0.5);
    enemyGroup.setAll('anchor.x', 0.5);
    enemyGroup.setAll('scale.x', 1.7);
    enemyGroup.setAll('scale.y', 1.7);
  },
  
  moveEnemy: function (it) {
    game.add.tween(it).to({x: 50}, 2000, 'Elastic.easeOut', true, 0, -1, true);
  },
  
  rotateEnemy: function (it) {
    it.rotation += 0.05;
  },
  
  update: function() {
    texture.clear();
    for (var i = 0; i < max; i++)
    {
        var perspective = distance / (distance - zz[i]);
        var x = game.world.centerX + xx[i] * perspective;
        var y = game.world.centerY + yy[i] * perspective;
        zz[i] += speed;
        if (zz[i] > 300)
        {
            zz[i] -= 600;
        }
        texture.renderXY(star, x, y);
    }
    enemyGroup.forEach(this.rotateEnemy);
    ship.animations.play('fly', 30, true);
    if (cursors.left.isDown) {
      ship.body.velocity.x = -400;
    } else if (cursors.right.isDown) {
      ship.body.velocity.x = 400;
    } else { ship.body.velocity.x = 0 }
    if (cursors.up.isDown){
      ship.body.velocity.y = -300;
    }
    else if (cursors.down.isDown) {
      ship.body.velocity.y = 300;
    }
    else { ship.body.velocity.y = 0 }    
    if (game.input.keyboard.isDown(Phaser.Keyboard.Z)) {
      this.fire();
    }
    game.physics.arcade.overlap(enemyGroup, bullets, this.hitGroup);
    game.physics.arcade.overlap(enemyGroup, ship, this.gameOver);
  },
    
  fire: function() {
    if(game.time.now > nextFire) {
      nextFire = game.time.now + fireRate;
      bullet = bullets.getFirstDead();
      bullet.reset(ship.x, ship.y);
      bullet.animations.add('shoot', [0, 1, 2, 3, 4, 5, 6]);
      bullet.animations.play('shoot', 14, true);
      bullet.body.velocity.x = 500;
      bullet.anchor.setTo(0.5, 0.5);
      shootSound.play('shoot');
    }
  },
  
  gameOver: function(e) {
    boomEffect = game.add.sprite(ship.x, ship.y-35, 'boomEffect');
    ship.kill();
    e.kill();
    boom = boomEffect.animations.add('boomEffect', [0, 1, 2, 3, 4, 5]);
    boom.killOnComplete=true;
    boomEffect.animations.play('boomEffect', 14, false);
    deadSound.play('dead');
    theme.stop();
    changeState('gameOver');
  },

  hitGroup: function(e) {
    boomEffect = game.add.sprite(e.x, e.y-35, 'boomEffect');
    bullet.kill();
    e.kill();
    boom = boomEffect.animations.add('boomEffect', [0, 1, 2, 3, 4, 5]);
    boom.killOnComplete=true;
    boomEffect.animations.play('boomEffect', 14, false);
    deadSound.play('dead');
  }
};

function changeState(stateName) {
  game.state.start(stateName);
}

function addKeyCallback(key, fn, args) {
  game.input.keyboard.addKey(key).onDown.add(fn, null, null, args)
}

function addChangeStateEventListeners() {
  addKeyCallback(Phaser.Keyboard.ZERO,  changeState, 0)
  addKeyCallback(Phaser.Keyboard.ONE,   changeState, 1)
  addKeyCallback(Phaser.Keyboard.TWO,   changeState, 2)
  addKeyCallback(Phaser.Keyboard.THREE, changeState, 3)
  addKeyCallback(Phaser.Keyboard.FOUR,  changeState, 4)
  addKeyCallback(Phaser.Keyboard.FIVE,  changeState, 5)
  addKeyCallback(Phaser.Keyboard.SIX,   changeState, 6)
  addKeyCallback(Phaser.Keyboard.SEVEN, changeState, 7)
  addKeyCallback(Phaser.Keyboard.EIGHT, changeState, 8)
  addKeyCallback(Phaser.Keyboard.NINE,  changeState, 9)
}