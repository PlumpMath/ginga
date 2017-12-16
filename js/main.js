var game = new Phaser.Game(800, 600, Phaser.AUTO)
game.state.add('menu', demo.menu)
game.state.add('level1', demo.level1)
game.state.add('level2', demo.level2)
game.state.add('level3', demo.level3)
game.state.add('level4', demo.level4)
game.state.add('gameOver', demo.gameOver)
game.state.add('end', demo.end)
game.state.start('menu')
