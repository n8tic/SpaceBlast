// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 1440;  // 90% of 1600
canvas.height = 900;  // 90% of 1000

// Browser detection for special handling
const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
console.log('Browser detected:', isChrome ? 'Chrome' : 'Other');

// Initialize audio context globally
window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.audioContext = null;
window.audioEnabled = false;

// Initialize audio unlock function
function unlockAudio() {
    console.log('Attempting to unlock audio...');
    
    // Create and play a silent buffer to unlock the audio
    if (!window.audioEnabled) {
        try {
            // Initialize audio context if not already done
            if (!window.audioContext) {
                window.audioContext = new AudioContext();
                console.log('AudioContext created');
            }
            
            // Resume audio context if suspended
            if (window.audioContext.state === 'suspended') {
                window.audioContext.resume().then(() => {
                    console.log('AudioContext resumed successfully');
                    window.audioEnabled = true;
                }).catch(e => console.error('Failed to resume AudioContext:', e));
            }
            
            // Play all sounds at zero volume just to prime them
            Object.values(game.audio).forEach(sound => {
                if (sound instanceof Audio) {
                    sound.volume = 0; // Mute the sound
                    sound.play()
                        .then(() => {
                            sound.pause();
                            sound.currentTime = 0;
                            console.log('Primed audio:', sound.src);
                            window.audioEnabled = true;
                        })
                        .catch(e => console.log('Could not prime audio:', e));
                }
            });
            
            // Create and play a silent buffer
            const buffer = window.audioContext.createBuffer(1, 1, 22050);
            const source = window.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(window.audioContext.destination);
            source.start(0);
            
            console.log('Audio context unlocked');
            window.audioEnabled = true;
        } catch (e) {
            console.error('Error unlocking audio:', e);
        }
    }

    if (window.audioEnabled && game.audio.bgm.paused) {
        game.audio.bgm.play().catch(e => console.log('BGM play error:', e));
    }
}

// For Chrome, we need a more aggressive approach to unlock audio
if (isChrome) {
    // Setup a visible "Start" button to get user interaction if needed
    const startButton = document.createElement('button');
    startButton.textContent = 'Start the Game';
    startButton.style.position = 'absolute';
    startButton.style.top = '60%';
    startButton.style.left = '50%';
    startButton.style.transform = 'translate(-50%, -50%)';
    startButton.style.fontSize = '28px';
    startButton.style.padding = '22px 60px';
    startButton.style.background = 'linear-gradient(90deg, #00eaff 0%, #0050ff 100%)';
    startButton.style.color = '#fff';
    startButton.style.border = '2px solid #00eaff';
    startButton.style.borderRadius = '14px';
    startButton.style.cursor = 'pointer';
    startButton.style.zIndex = '1000';
    startButton.style.boxShadow = '0 0 32px 8px #00eaff99, 0 0 0 2px #00eaff44 inset';
    startButton.style.letterSpacing = '2px';
    startButton.style.fontFamily = 'Orbitron, "Segoe UI", Arial, sans-serif';
    startButton.style.textShadow = '0 0 8px #00eaff, 0 0 2px #fff';
    startButton.onmouseover = () => {
        startButton.style.background = 'linear-gradient(90deg, #0050ff 0%, #00eaff 100%)';
        startButton.style.color = '#00eaff';
        startButton.style.border = '2px solid #fff';
    };
    startButton.onmouseout = () => {
        startButton.style.background = 'linear-gradient(90deg, #00eaff 0%, #0050ff 100%)';
        startButton.style.color = '#fff';
        startButton.style.border = '2px solid #00eaff';
    };
    
    // --- Add instruction/about overlay ---
    const instructionDiv = document.createElement('div');
    instructionDiv.style.position = 'absolute';
    instructionDiv.style.top = '10%';
    instructionDiv.style.left = '50%';
    instructionDiv.style.transform = 'translateX(-50%)';
    instructionDiv.style.background = 'linear-gradient(135deg, rgba(20,30,60,0.95) 60%, rgba(40,80,180,0.85) 100%)';
    instructionDiv.style.color = '#00eaff';
    instructionDiv.style.padding = '36px 48px';
    instructionDiv.style.borderRadius = '18px';
    instructionDiv.style.fontSize = '22px';
    instructionDiv.style.textAlign = 'left';
    instructionDiv.style.zIndex = '999';
    instructionDiv.style.boxShadow = '0 0 32px 8px #00eaff55, 0 0 0 2px #00eaff44 inset';
    instructionDiv.style.fontFamily = 'Orbitron, "Segoe UI", Arial, sans-serif';
    instructionDiv.innerHTML = `
        <h2 style="margin-top:0;text-align:center;font-family:Orbitron,Arial,sans-serif;letter-spacing:2px;color:#fff;text-shadow:0 0 8px #00eaff,0 0 2px #fff;">How to Play</h2>
        <ul style="list-style:none;padding:0;line-height:2.2;">
            <li><b>Move Ship:</b> Move your mouse</li>
            <li><b>Shoot:</b> Left Click</li>
            <li><b>Switch Weapon:</b> Right Click</li>
            <li><b>Use Bomb:</b> Press <b>B</b></li>
            <li><b>Pause/Resume:</b> Press <b>P</b></li>
            <li><b>Restart Game:</b> Click anywhere after Game Over</li>
        </ul>
        <div style="margin-top:18px;font-size:17px;text-align:center;opacity:0.9;color:#fff;text-shadow:0 0 6px #00eaff;">Defeat enemies, collect power-ups, and survive as long as you can!</div>
    `;
    document.body.appendChild(instructionDiv);
    // --- End instruction/about overlay ---
    
    // Only show the button if we're in Chrome
    document.body.appendChild(startButton);
    
    startButton.addEventListener('click', () => {
        unlockAudio();
        window.audioEnabled = true;
        startButton.remove(); // Remove after clicked
        instructionDiv.remove(); // Remove instructions after clicked
        
        // Start the game if it hasn't started yet
        if (!window.gameStarted) {
            window.gameStarted = true;
            init();
            game.audio.bgm.play().catch(e => console.log('BGM play error:', e)); // Play BGM immediately
            gameLoop();
        }
    });
    
    // Alternative methods to unlock audio
    document.addEventListener('click', unlockAudio, { once: false });
    document.addEventListener('touchstart', unlockAudio, { once: false });
    document.addEventListener('keydown', unlockAudio, { once: false });
} else {
    // For non-Chrome browsers, use our standard approach
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
}

// Game state
const game = {
    player: null,
    enemies: [],
    bullets: [],
    explosions: [],
    score: 0,
    wave: 1,
    enemiesDefeated: 0,
    lastEnemySpawn: 0,
    enemySpawnDelay: 1000,
    mouseX: canvas.width / 2,
    mouseY: canvas.height - 100,
    isGameOver: false,
    boss: null,
    isBossWave: false,
    lastWeaponSwitch: 0,
    weaponSwitchDelay: 500, // Prevent too frequent weapon switching
    isPaused: false, // Add pause state
    audio: {
        laser: new Audio('sounds/laser.mp3'),
        plasma: new Audio('sounds/plasma.mp3'),
        ion: new Audio('sounds/ion.mp3'),
        quantum: new Audio('sounds/quantum.mp3'),
        nova: new Audio('sounds/nova.mp3'),
        pulse: new Audio('sounds/pulse.mp3'),
        beam: new Audio('sounds/beam.mp3'),
        wave: new Audio('sounds/wave.mp3'),
        explosion: new Audio('sounds/explosion.mp3'),
        powerup: new Audio('sounds/powerup.mp3'),
        hit: new Audio('sounds/hit.mp3'),
        playerHit: new Audio('sounds/playerhit.mp3'),
        gameOver: new Audio('sounds/gameover.mp3'),
        bomb: new Audio('sounds/bomb.mp3'),
        bgm: new Audio('sounds/bgm.mp3'),
        isMuted: false,
        volume: 0.3, // Default volume at 30%
        masterVolume: 1.0
    },
    powerUps: [],
    weaponBoostEndTime: 0,
    isWeaponBoosted: false,
    bombCount: 0,
    hasMissileUpgrade: false, // Track missile upgrade
    lastMissileTime: 0, // Track last missile fire time
};

// Add these new classes at the top of the file
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speed = 1 + Math.random() * 2;
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Nebula {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.width = 200 + Math.random() * 300;
        this.height = 200 + Math.random() * 300;
        this.color = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 255}, 0.1)`;
        this.speed = 0.5 + Math.random() * 1;
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = -this.height;
            this.x = Math.random() * canvas.width;
        }
    }

    draw(ctx) {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.width/2
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width/2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Add these properties to the game object
let stars = [];
let nebulae = [];

// Preload audio files
function preloadAudio() {
    return new Promise((resolve) => {
        console.log('Preloading audio files...');
        const audioFiles = Object.values(game.audio).filter(item => item instanceof Audio);
        let loadedCount = 0;
        
        audioFiles.forEach(audio => {
            // Set load event
            audio.addEventListener('canplaythrough', () => {
                loadedCount++;
                console.log(`Loaded audio ${loadedCount}/${audioFiles.length}`);
                if (loadedCount === audioFiles.length) {
                    console.log('All audio files loaded successfully');
                    resolve();
                }
            }, { once: true });
            
            // Set error event
            audio.addEventListener('error', (e) => {
                console.error('Error loading audio:', audio.src, e);
                loadedCount++;
                if (loadedCount === audioFiles.length) {
                    console.log('Audio loading completed with some errors');
                    resolve();
                }
            }, { once: true });
            
            // Force reload
            audio.load();
        });
        
        // Fallback if loading takes too long
        setTimeout(() => {
            console.log('Audio preload timeout - continuing anyway');
            resolve();
        }, 3000);
    });
}

// Move event listeners outside of init so they are only added once
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    game.mouseX = e.clientX - rect.left;
    game.mouseY = e.clientY - rect.top;
});

canvas.addEventListener('click', () => {
    if (!game.isGameOver) {
        const bullets = game.player.shoot();
        game.bullets.push(...bullets);
        playSound(game.player.weaponType);
    } else {
        init(); // Restart game
    }
});

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (!game.isGameOver) {
        const now = Date.now();
        if (now - game.lastWeaponSwitch >= game.weaponSwitchDelay) {
            game.player.cycleWeapon();
            game.lastWeaponSwitch = now;
        }
    }
});

// Initialize game
function init() {
    // Ensure BGM is paused and reset before starting a new game
    if (game.audio.bgm) {
        game.audio.bgm.pause();
        game.audio.bgm.currentTime = 0;
        game.audio.bgm.volume = 1.0; // Ensure BGM is always at full volume
    }
    game.player = new Player(canvas.width / 2, canvas.height - 120);
    game.enemies = [];
    game.bullets = [];
    game.explosions = [];
    game.score = 0;
    game.wave = 1;
    game.enemiesDefeated = 0;
    game.isGameOver = false;
    game.boss = null;
    game.isBossWave = false;
    game.powerUps = [];
    game.weaponBoostEndTime = 0;
    game.isWeaponBoosted = false;
    game.bombCount = 0;
    game.hasMissileUpgrade = false;
    game.lastMissileTime = 0;
    
    // Initialize space background
    for (let i = 0; i < 100; i++) {
        stars.push(new Star());
    }
    for (let i = 0; i < 3; i++) {
        nebulae.push(new Nebula());
    }

    // Initialize audio volume and trigger audio playback once
    updateAudioVolume();
    
    // Attempt to play and then immediately pause all sounds to unblock audio
    Object.entries(game.audio).forEach(([key, sound]) => {
        if (sound instanceof Audio && key !== 'bgm') {
            sound.volume = 0; // Temporarily mute
            sound.play().then(() => {
                sound.pause();
                sound.currentTime = 0;
                sound.volume = game.audio.volume * game.audio.masterVolume;
                console.log('Initialized audio:', sound.src);
            }).catch(e => console.log('Could not initialize audio:', e.message));
        }
    });

    game.audio.bgm.loop = true;
    game.audio.bgm.volume = 1.0;
}

// Spawn enemies
function spawnEnemy() {
    if (game.isBossWave) return;
    
    const now = Date.now();
    if (now - game.lastEnemySpawn >= game.enemySpawnDelay) {
        game.enemies.push(new Enemy());
        game.lastEnemySpawn = now;
        
        // Adjust spawn rate based on wave
        game.enemySpawnDelay = Math.max(200, 1000 - (game.wave * 50));
    }
}

// Update game state
function update() {
    if (game.isGameOver) return;

    // Update player
    game.player.update(game.mouseX, game.mouseY);

    // Check for boss wave
    if (game.wave % 3 === 0 && !game.isBossWave && game.enemies.length === 0) {
        game.isBossWave = true;
        game.boss = new Boss(game.wave);
    }

    // Spawn enemies if not in boss wave
    if (!game.isBossWave) {
        spawnEnemy();
    }

    // Update bullets
    game.bullets = game.bullets.filter(bullet => !bullet.update());

    // Update enemies
    game.enemies = game.enemies.filter(enemy => {
        const isOutOfBounds = enemy.update();
        if (isOutOfBounds) {
            // Instead of game over, just remove the enemy and continue
            game.score = Math.max(0, game.score - 5); // Small score penalty for letting enemies escape
            return false;
        }
        return true;
    });

    // Update boss
    if (game.boss) {
        game.boss.update(game.mouseX, game.mouseY);
        
        // Check boss bullet collisions
        game.boss.bullets.forEach(bullet => {
            if (Utils.checkCollision(bullet, game.player)) {
                if (game.player.takeDamage()) {
                    game.isGameOver = true;
                    // Play hit sound
                    playSound('hit');
                    playSound('playerHit');
                    // Play game over sound after a short delay
                    setTimeout(() => {
                        playSound('gameOver');
                    }, 500);
                } else {
                    // Play hit sound even if not game over
                    playSound('hit');
                    playSound('playerHit');
                    // Add collision effect at player position
                    game.explosions.push(new Explosion(game.player.x, game.player.y, '#fff'));
                }
            }
        });

        // Check boss missile collisions
        game.boss.missiles.forEach(missile => {
            if (Utils.checkCollision(missile, game.player)) {
                if (game.player.takeDamage()) {
                    game.isGameOver = true;
                    // Play hit sound
                    playSound('hit');
                    playSound('playerHit');
                    // Play game over sound after a short delay
                    setTimeout(() => {
                        playSound('gameOver');
                    }, 500);
                } else {
                    // Play hit sound even if not game over
                    playSound('hit');
                    playSound('playerHit');
                }
            }
        });
    }

    // Update explosions
    game.explosions = game.explosions.filter(explosion => !explosion.update());

    // Update power-ups
    game.powerUps = game.powerUps.filter(powerUp => !powerUp.update());

    // Check power-up collisions with player
    game.powerUps.forEach((powerUp, index) => {
        if (Utils.checkCollision(powerUp, game.player)) {
            if (powerUp.type === 'weapon') {
                game.isWeaponBoosted = true;
                game.weaponBoostEndTime = Date.now() + 10000; // 10 seconds
            } else if (powerUp.type === 'bomb') {
                game.bombCount++;
                playSound('bomb');
            } else if (powerUp.type === 'weaponUpgrade' && powerUp.weaponType) {
                // Only upgrade the matching weapon type
                if (game.player.weaponType === powerUp.weaponType && game.player.weaponLevel < 3) {
                    game.player.weaponLevel++;
                }
            } else if (powerUp.type === 'missileUpgrade') {
                game.hasMissileUpgrade = true;
            }
            playSound('powerup');
            game.powerUps.splice(index, 1);
        }
    });

    // Check if weapon boost has expired
    if (game.isWeaponBoosted && Date.now() > game.weaponBoostEndTime) {
        game.isWeaponBoosted = false;
    }

    // Check collisions
    game.enemies.forEach((enemy, enemyIndex) => {
        game.bullets.forEach((bullet, bulletIndex) => {
            if (Utils.checkCollision(enemy, bullet)) {
                // Remove enemy and bullet
                game.enemies.splice(enemyIndex, 1);
                game.bullets.splice(bulletIndex, 1);
                
                // Add explosion
                game.explosions.push(new Explosion(enemy.x, enemy.y, enemy.baseColor));
                
                // Play explosion sound with the new function
                playSound('explosion');
                
                // Check for power-up drop
                if (enemy.willDropPowerUp) {
                    game.powerUps.push(new PowerUp(enemy.x, enemy.y, enemy.powerUpType));
                }
                // Random chance to drop a weapon upgrade
                if (Math.random() < 0.05) { // 5% chance
                    // Pick a random upgrade type: weapon or missile
                    if (Math.random() < 0.9) { // 90% chance for weapon upgrade
                        const weaponTypes = ['laser', 'plasma', 'ion', 'quantum', 'nova', 'pulse', 'beam', 'wave'];
                        const weaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
                        game.powerUps.push(new PowerUp(enemy.x, enemy.y, 'weaponUpgrade', weaponType));
                    } else { // 10% chance for missile upgrade
                        game.powerUps.push(new PowerUp(enemy.x, enemy.y, 'missileUpgrade'));
                    }
                }
                
                // Update score and check for weapon upgrade
                game.score += 10;
                game.enemiesDefeated++;
                
                if (game.enemiesDefeated % 30 === 0) {
                    game.wave++;
                    game.enemySpawnDelay = Math.max(200, game.enemySpawnDelay - 100);
                }
            } else if (Utils.checkCollision(bullet, enemy)) {
                // Add collision effect at enemy position (for non-destroying hit)
                game.explosions.push(new Explosion(enemy.x, enemy.y, '#ff0'));
            }
        });

        // Check collision with player
        if (Utils.checkCollision(enemy, game.player)) {
            if (game.player.takeDamage()) {
                game.isGameOver = true;
                // Play hit sound
                playSound('hit');
                playSound('playerHit');
                // Play game over sound after a short delay
                setTimeout(() => {
                    playSound('gameOver');
                }, 500);
            } else {
                // Play hit sound even if not game over
                playSound('hit');
                playSound('playerHit');
                // Add collision effect at player position
                game.explosions.push(new Explosion(game.player.x, game.player.y, '#fff'));
            }
        }
    });

    // Check boss collisions
    if (game.boss) {
        game.bullets.forEach((bullet, bulletIndex) => {
            if (Utils.checkCollision(bullet, game.boss)) {
                game.bullets.splice(bulletIndex, 1);
                if (game.boss.takeDamage(10)) {
                    // Boss defeated
                    for (let i = 0; i < 5; i++) {
                        game.explosions.push(new Explosion(
                            game.boss.x + Utils.random(-game.boss.width/2, game.boss.width/2),
                            game.boss.y + Utils.random(-game.boss.height/2, game.boss.height/2),
                            game.boss.color
                        ));
                    }
                    // Play explosion sound
                    playSound('explosion');
                    
                    game.score += 100;
                    game.wave++;
                    game.boss = null;
                    game.isBossWave = false;
                }
            }
        });

        // Check collision with player
        if (Utils.checkCollision(game.boss, game.player)) {
            if (game.player.takeDamage()) {
                game.isGameOver = true;
                // Play hit sound
                playSound('hit');
                playSound('playerHit');
                // Play game over sound after a short delay
                setTimeout(() => {
                    playSound('gameOver');
                }, 500);
            } else {
                // Play hit sound even if not game over
                playSound('hit');
                playSound('playerHit');
                // Add collision effect at player position
                game.explosions.push(new Explosion(game.player.x, game.player.y, '#fff'));
            }
        }
    }

    // Update space background
    stars.forEach(star => star.update());
    nebulae.forEach(nebula => nebula.update());

    // Auto-fire missile if upgrade is collected
    if (game.hasMissileUpgrade) {
        const now = Date.now();
        if (now - game.lastMissileTime > 2000) { // Fire every 2 seconds
            game.lastMissileTime = now;
            // Fire missile straight up from player
            game.bullets.push(new Bullet(game.player.x, game.player.y - game.player.height / 2, 'missile'));
            playSound('bomb'); // Use bomb sound for now
        }
    }
}

// Render game
function render() {
    // Clear canvas with dark blue background
    ctx.fillStyle = '#0C1D3B';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw space background
    nebulae.forEach(nebula => nebula.draw(ctx));
    stars.forEach(star => star.draw(ctx));

    // Draw game objects
    game.player.draw(ctx);
    game.enemies.forEach(enemy => enemy.draw(ctx));
    game.bullets.forEach(bullet => bullet.draw(ctx));
    game.explosions.forEach(explosion => explosion.draw(ctx));
    
    // Draw boss and its projectiles
    if (game.boss) {
        game.boss.draw(ctx);
        game.boss.bullets.forEach(bullet => bullet.draw(ctx));
        game.boss.missiles.forEach(missile => missile.draw(ctx));

        // Draw boss health bar
        const bossHealthWidth = 600;
        const bossHealthHeight = 30;
        const bossHealthX = (canvas.width - bossHealthWidth) / 2;
        const bossHealthY = 20;

        // Health bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(bossHealthX - 5, bossHealthY - 5, bossHealthWidth + 10, bossHealthHeight + 10);

        // Health bar
        ctx.fillStyle = '#ff3333';
        const healthPercentage = game.boss.health / game.boss.maxHealth;
        ctx.fillRect(bossHealthX, bossHealthY, bossHealthWidth * healthPercentage, bossHealthHeight);

        // Health text
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BOSS', canvas.width / 2, bossHealthY + bossHealthHeight + 30);
    }

    // Draw power-ups
    game.powerUps.forEach(powerUp => powerUp.draw(ctx));

    // Draw weapon boost indicator if active
    if (game.isWeaponBoosted) {
        const timeLeft = Math.max(0, game.weaponBoostEndTime - Date.now());
        const timePercentage = timeLeft / 10000;
        
        ctx.fillStyle = '#ff00ff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Weapon Boost: ${Math.ceil(timeLeft/1000)}s`, canvas.width - 240, 100);
        
        // Draw boost bar
        ctx.fillStyle = 'rgba(255, 0, 255, 0.3)';
        ctx.fillRect(canvas.width - 240, 110, 200, 10);
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(canvas.width - 240, 110, 200 * timePercentage, 10);
    }

    // Draw bomb count if available
    if (game.bombCount > 0) {
        const bombBarX = canvas.width - 240;
        const bombBarY = 160;  // Moved down to match the gap size
        
        // Draw bomb text
        ctx.fillStyle = '#ff6600';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('BOMBS', bombBarX, bombBarY - 5);
        
        // Draw usage instruction
        ctx.fillStyle = '#ff6600';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Press B to use', bombBarX, bombBarY + 20);
    }

    // Draw weapon bar in top right
    const bottomBarWidth = 200;
    const bottomBarHeight = 20;
    const bottomBarX = canvas.width - 240;  // Position from right edge
    const bottomBarY = 50;  // Position from top
    
    // Draw background bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(bottomBarX, bottomBarY, bottomBarWidth, bottomBarHeight);
    
    // Draw filled portion based on weapon level
    ctx.fillStyle = game.player.getWeaponColor();
    const filledWidth = (bottomBarWidth / 3) * game.player.weaponLevel;
    ctx.fillRect(bottomBarX, bottomBarY, filledWidth, bottomBarHeight);
    
    // Draw weapon name
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${game.player.weaponType.toUpperCase()}`, bottomBarX, bottomBarY - 5);

    // Draw missile upgrade status
    if (game.hasMissileUpgrade) {
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#ffaa00';
        ctx.textAlign = 'right';
        ctx.fillText('MISSILE READY', bottomBarX + bottomBarWidth, bottomBarY - 5);
    }

    // Draw game over screen
    if (game.isGameOver) {
        // Stop background music
        if (game.audio.bgm && !game.audio.bgm.paused) {
            game.audio.bgm.pause();
            game.audio.bgm.currentTime = 0;
        }
        // Futuristic Game Over overlay
        ctx.save();
        ctx.globalAlpha = 1.0;
        // Draw glowing gradient background
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, 'rgba(20,30,60,0.95)');
        grad.addColorStop(1, 'rgba(40,80,180,0.85)');
        ctx.fillStyle = grad;
        ctx.fillRect(canvas.width/2-400, canvas.height/2-200, 800, 400);
        // Outer glow
        ctx.shadowColor = '#00eaff';
        ctx.shadowBlur = 40;
        ctx.strokeStyle = '#00eaff';
        ctx.lineWidth = 6;
        ctx.strokeRect(canvas.width/2-400, canvas.height/2-200, 800, 400);
        ctx.shadowBlur = 0;
        // Game Over text
        ctx.font = 'bold 90px Orbitron, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#00eaff';
        ctx.shadowBlur = 18;
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 60);
        ctx.shadowBlur = 0;
        // Final Score
        ctx.font = '48px Orbitron, Arial, sans-serif';
        ctx.fillStyle = '#00eaff';
        ctx.fillText(`Final Score: ${game.score}`, canvas.width / 2, canvas.height / 2 + 30);
        // Restart instruction
        ctx.font = '32px Orbitron, Arial, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.85;
        ctx.fillText('Click to Restart', canvas.width / 2, canvas.height / 2 + 100);
        ctx.globalAlpha = 1.0;
        ctx.restore();
    } else {
        // Draw score and wave in top-left corner
        const barX = 40;
        const barY = 50;
        const barSpacing = 40;

        // Score text
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        const scoreText = `SCORE: ${game.score}`;
        const waveText = `WAVE: ${game.wave}`;
        ctx.fillText(scoreText, barX, barY);
        ctx.fillText(waveText, barX, barY + barSpacing);
    }
}

// Game loop
function gameLoop() {
    if (!game.isPaused) {
        update();
        render();
    } else {
        // Draw paused overlay
        render();
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
        ctx.font = 'bold 72px Orbitron, Arial, sans-serif';
        ctx.fillStyle = '#00eaff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#00eaff';
        ctx.shadowBlur = 20;
        ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
        ctx.shadowBlur = 0;
        ctx.restore();
    }
    requestAnimationFrame(gameLoop);
}

// Start game after preloading audio
window.addEventListener('load', () => {
    window.gameStarted = false;
    
    preloadAudio().then(() => {
        console.log('Audio preloading completed');
        
        // For non-Chrome browsers, start the game immediately
        if (!isChrome) {
            window.gameStarted = true;
            console.log('Starting game automatically');
            init();
            gameLoop();
        } else {
            console.log('Waiting for user interaction in Chrome before starting');
            // For Chrome, the game starts when the user clicks the start button
        }
    });
});

// Add this function to handle audio volume
function updateAudioVolume() {
    const volume = game.audio.isMuted ? 0 : game.audio.volume * game.audio.masterVolume;
    Object.entries(game.audio).forEach(([key, sound]) => {
        if (sound instanceof Audio && key !== 'bgm') {
            sound.volume = volume;
        }
    });
}

// Add bomb key handler
document.addEventListener('keydown', (e) => {
    if (e.key === 'b' && game.bombCount > 0 && !game.isGameOver) {
        // Activate bomb
        game.bombCount--;
        // Play bomb sound
        playSound('bomb');
        
        // Destroy all enemies on screen
        game.enemies.forEach(enemy => {
            game.explosions.push(new Explosion(enemy.x, enemy.y, enemy.baseColor));
            game.score += 10;
            game.enemiesDefeated++;
        });
        game.enemies = [];
        
        // Also damage boss if present
        if (game.boss) {
            game.boss.takeDamage(50);
        }
    }
});

// Add a dedicated sound function at the end of the file
function playSound(soundType) {
    if (!game.audio[soundType] || game.audio.isMuted) {
        return;
    }
    try {
        const sound = new Audio(game.audio[soundType].src);
        sound.volume = game.audio.volume * game.audio.masterVolume;
        sound.play().catch(error => {
            console.error('Sound play failed:', error);
        });
    } catch (e) {
        console.error('Error playing sound:', e);
    }
}

// Add pause key handler
document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        game.isPaused = !game.isPaused;
    }
}); 