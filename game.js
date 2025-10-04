class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  preload() {
    // ассеты из Phaser Labs
    this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
    this.load.image('platform', 'https://labs.phaser.io/assets/platforms/platform.png');
    this.load.spritesheet('dude', 'https://labs.phaser.io/assets/sprites/dude.png',
      { frameWidth: 32, frameHeight: 48 });
    this.load.image('star', 'https://labs.phaser.io/assets/demoscene/star.png');
    this.load.image('bomb', 'https://labs.phaser.io/assets/sprites/bomb.png');
    this.load.image('friend', 'https://labs.phaser.io/assets/sprites/phaser3-logo.png');

    // звуки
    this.load.audio('pickup', 'https://labs.phaser.io/assets/audio/SoundEffects/p-ping.mp3');
    this.load.audio('death', 'https://labs.phaser.io/assets/audio/SoundEffects/shoot1.wav');
    this.load.audio('win', 'https://labs.phaser.io/assets/audio/SoundEffects/key.wav');
  }

  create() {
    this.add.image(400, 300, 'sky');
    this.add.text(180, 200, '⚔️ Adventure Quest ⚔️', { fontSize: '40px', fill: '#fff' });
    this.add.text(230, 320, 'Нажми ПРОБЕЛ чтобы начать', { fontSize: '22px', fill: '#fff' });

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('Level1', { lives: 3, score: 0 });
    });
  }
}

// ======= Базовый уровень с общей логикой =======
class BaseLevel extends Phaser.Scene {
  constructor(key, nextLevel) {
    super(key);
    this.nextLevel = nextLevel;
  }

  create(data) {
    this.lives = data.lives;
    this.score = data.score;

    this.add.image(400, 300, 'sky');

    // платформы
    this.platforms = this.physics.add.staticGroup();
    this.createPlatforms();

    // игрок
    this.player = this.physics.add.sprite(100, 450, 'dude');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.createAnimations();
    this.physics.add.collider(this.player, this.platforms);

    // звёзды
    this.stars = this.physics.add.group({ key: 'star', repeat: 10, setXY: { x: 12, y: 0, stepX: 70 } });
    this.stars.children.iterate(star => { star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)); });
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

    // враги
    this.bombs = this.physics.add.group();
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

    // текст
    this.cursors = this.input.keyboard.createCursorKeys();
    this.scoreText = this.add.text(16, 16, 'Счёт: ' + this.score, { fontSize: '20px', fill: '#fff' });
    this.livesText = this.add.text(680, 16, 'Жизни: ' + this.lives, { fontSize: '20px', fill: '#fff' });
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  createAnimations() {
    if (!this.anims.exists('left')) {
      this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10, repeat: -1 });
      this.anims.create({ key: 'turn', frames: [{ key: 'dude', frame: 4 }], frameRate: 20 });
      this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10, repeat: -1 });
    }
  }

  collectStar(player, star) {
    star.disableBody(true, true);
    this.sound.play('pickup');
    this.score += 10;
    this.scoreText.setText('Счёт: ' + this.score);

    if (this.stars.countActive(true) === 0) {
      // если это финальный уровень → к другу
      if (this.nextLevel === 'EndScene') {
        this.scene.start('Level4', { lives: this.lives, score: this.score });
      } else {
        this.scene.start(this.nextLevel, { lives: this.lives, score: this.score });
      }
    }
  }

  hitBomb(player, bomb) {
    this.lives--;
    this.livesText.setText('Жизни: ' + this.lives);
    this.sound.play('death');

    if (this.lives <= 0) {
      this.physics.pause();
      player.setTint(0xff0000);
      this.scene.start('GameOver');
    } else {
      this.player.setX(100);
      this.player.setY(450);
    }
  }
}

// === Уровни ===
class Level1 extends BaseLevel {
  constructor() { super('Level1', 'Level2'); }
  createPlatforms() {
    this.platforms.create(400, 568, 'platform').setScale(2).refreshBody();
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(50, 250, 'platform');
    this.platforms.create(750, 220, 'platform');
  }
}

class Level2 extends BaseLevel {
  constructor() { super('Level2', 'Level3'); }
  createPlatforms() {
    this.platforms.create(400, 568, 'platform').setScale(2).refreshBody();
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(650, 350, 'platform');
    this.platforms.create(400, 220, 'platform');
  }
}

class Level3 extends BaseLevel {
  constructor() { super('Level3', 'Level4'); }
  createPlatforms() {
    this.platforms.create(400, 568, 'platform').setScale(2).refreshBody();
    this.platforms.create(100, 400, 'platform');
    this.platforms.create(700, 300, 'platform');
    this.platforms.create(400, 150, 'platform');
  }
}

class Level4 extends Phaser.Scene {
  constructor() { super('Level4'); }

  create(data) {
    this.lives = data.lives;
    this.score = data.score;

    this.add.image(400, 300, 'sky');

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'platform').setScale(2).refreshBody();
    this.platforms.create(200, 400, 'platform');
    this.platforms.create(650, 300, 'platform');

    this.player = this.physics.add.sprite(100, 450, 'dude');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.platforms);

    this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'turn', frames: [{ key: 'dude', frame: 4 }], frameRate: 20 });
    this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10, repeat: -1 });

    this.friend = this.physics.add.sprite(750, 100, 'friend');
    this.physics.add.collider(this.friend, this.platforms);
    this.physics.add.overlap(this.player, this.friend, () => {
      this.sound.play('win');
      this.scene.start('EndScene', { score: this.score });
    });

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }
}

class EndScene extends Phaser.Scene {
  constructor() { super('EndScene'); }
  create(data) {
    this.add.image(400, 300, 'sky');
    this.add.text(200, 250, '🎉 Ты спас друга! 🎉', { fontSize: '32px', fill: '#fff' });
    this.add.text(220, 300, 'Твой счёт: ' + data.score, { fontSize: '24px', fill: '#fff' });
    this.add.text(180, 380, 'Нажми ПРОБЕЛ чтобы снова играть', { fontSize: '20px', fill: '#fff' });

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('MenuScene');
    });
  }
}

class GameOver extends Phaser.Scene {
  constructor() { super('GameOver'); }
  create() {
    this.add.image(400, 300, 'sky');
    this.add.text(250, 250, '💀 Game Over 💀', { fontSize: '40px', fill: '#ff0000' });
    this.add.text(200, 350, 'Нажми ПРОБЕЛ чтобы попробовать снова', { fontSize: '20px', fill: '#fff' });

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('MenuScene');
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: { default: 'arcade', arcade: { gravity: { y: 300 }, debug: false } },
  scene: [MenuScene, Level1, Level2, Level3, Level4, EndScene, GameOver]
};

const game = new Phaser.Game(config);
