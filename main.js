var game = new Phaser.Game(800, 600, Phaser.AUTO);
game.state.add('menu', demo.menu);
game.state.add('level1', demo.level1);
game.state.add('gameOver', demo.gameOver);
game.state.start('menu');