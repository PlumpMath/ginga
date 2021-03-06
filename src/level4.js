var enemy, enemyGroup, boomEffect, bgm4, filter, sprite, ship, lives

demo.level4 = function () {}
demo.level4.prototype = {
  preload: function () {},
  create: function () {
    manager.currentLevel = 4
    bgm4 = game.add.audio('bgm4', 0.4, true)
    bgm4.play()
    lives = 70
    var fragmentSrc = [

      'precision mediump float;',

      'uniform float     time;',
      'uniform vec2      resolution;',
      'uniform sampler2D iChannel0;',

      'void main( void ) {',

      'float t = time;',

      'vec2 uv = gl_FragCoord.xy / resolution.xy;',
      'vec2 texcoord = gl_FragCoord.xy / vec2(resolution.y);',

      'texcoord.y -= t*0.2;',

      'float zz = 1.0/(1.0-uv.y*1.7);',
      'texcoord.y -= zz * sign(zz);',

      'vec2 maa = texcoord.xy * vec2(zz, 1.0) - vec2(zz, 0.0) ;',
      'vec2 maa2 = (texcoord.xy * vec2(zz, 1.0) - vec2(zz, 0.0))*0.3 ;',
      'vec4 stone = texture2D(iChannel0, maa);',
      'vec4 blips = texture2D(iChannel0, maa);',
      'vec4 mixer = texture2D(iChannel0, maa2);',

      'float shade = abs(1.0/zz);',

      'vec3 outp = mix(shade*stone.rgb, mix(1.0, shade, abs(sin(t+maa.y-sin(maa.x))))*blips.rgb, min(1.0, pow(mixer.g*2.1, 2.0)));',
      'gl_FragColor = vec4(outp,1.0);',

      '}'
    ]

    //  Texture must be power-of-two sized or the filter will break
    sprite = game.add.sprite(0, 0, 'guts')
    sprite.width = 800
    sprite.height = 600
    var customUniforms = {
      iChannel0: { type: 'sampler2D', value: sprite.texture, textureData: { repeat: true } }
    }
    filter = new Phaser.Filter(game, customUniforms, fragmentSrc)
    filter.setResolution(800, 600)
    sprite.filters = [ filter ]
    ship = new demo.Prefabs.Ship(game, game.world.centerX / 2, game.world.centerY)
    game.add.existing(ship)
    enemy = game.add.sprite(1000, 300, 'boss')
    game.physics.enable(enemy)
    enemy.enableBody = true
    enemy.body.bounce.y = 0.5
    enemy.body.bounce.x = 0.5
    enemy.anchor.setTo(0.5, 0.5)
    enemy.physicsBodyType = Phaser.Physics.ARCADE
    enemy.animations.add('move', [0, 1, 2, 3, 4, 5, 6])
    game.add.tween(enemy).to({x: 100, y: 300}, 5000, 'Linear', true, 0, -1, true)
    enemyGroup = game.add.group()
    enemyGroup.enableBody = true
    enemyGroup.physicsBodyType = Phaser.Physics.ARCADE
    game.time.events.loop(10000, this.makeEnemies, this)
  },

  update: function () {
    enemy.animations.play('move', 3, true)
    filter.update()
    game.physics.arcade.collide(enemy)
    game.physics.arcade.overlap(enemy, ship.bullets, this.hitGroup)
    game.physics.arcade.overlap(enemy, ship, this.gameOver)
    game.physics.arcade.overlap(enemyGroup, ship, this.gameOver)
    enemyGroup.forEach(this.rotateEnemy)
  },

  moveEnemy: function (it) {
    it.animations.add('smile', [0, 1, 2])
    game.add.tween(it).to({x: ship.x, y: ship.y}, 1500, 'Linear', true, 0, -1, true)
  },

  makeEnemies: function () {
    enemyGroup.create(enemy.x, enemy.y, 'bossFire')
    enemyGroup.forEach(this.moveEnemy)
    enemyGroup.setAll('anchor.y', 0.5)
    enemyGroup.setAll('anchor.x', 0.5)
    enemyGroup.setAll('scale.x', 0.7)
    enemyGroup.setAll('scale.y', 0.7)
  },

  rotateEnemy: function (it) {
    game.add.tween(it).to({x: ship.x, y: ship.y}, 500, 'Linear', true, 0, -1, false)
    // it.body.gravity.x = 500
    it.animations.play('smile', 2, true)
    it.rotation += 0.05
  },

  gameOver: function (e, s) {
    ship.gameOver(e, s, bgm4)
  },

  hitGroup: function (e, b) {
    boomEffect = game.add.sprite(b.x + 20, b.y, 'boomEffect')
    b.kill()
    if (lives === 0) {
      e.kill()
      bgm4.stop()
      ship.kill()
      game.state.start('end')
    } else {
      lives = lives - 1
    }

    var boom = boomEffect.animations.add('boomEffect', [0, 1, 2, 3, 4, 5])
    boom.killOnComplete = true
    boomEffect.animations.play('boomEffect', 14, false)
    ship.deadSound.play('dead')
    manager.highscore += 100
  }
}
