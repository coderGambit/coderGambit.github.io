
var backgroundCTX;
var forgroundCTX;
var enemyCTX;
var groundCTX;

var backgroundAudio;
var jumpAudio; 
var gameOverAudio;
var enemyCollisionAudio;
var musicCheckbox;
var sfxCheckbox;

var sfxOn;
var musicOn;

var timeElement;
var scoreElement;
var gameOverScoreElement;
var score = 0;
var totalTime = 0;
var timeInterval;

var isGameOver;

/********PLAYER********/
var playerCharacter;
var playerSpriteWidth = 120;
var playrSpriteHeight = 207;
var playerSpriteTotalWidth = 120;
var playerSpriteTotalHeight = 1242;

/********ENEMIES********/

/********FLY MAN********/
var NAME_FLYMAN = "Fly Man";
var flyManImageSparite;
var flyManSpriteWidth = 122;
var flyManSpriteHeight = 139;
var flyManSpriteTotalHeight = 139;
var flyManSpriteTotalWidth = 244;

/********WING MAN*******/
var NAME_WINGMAN = "Wing Man";
var wingManImageSparite;
var wingManSpriteWidth = 216;
var wingManSpriteHeight = 150;
var wingManTotalSpriteWidth = 216;
var wingManTotalSpriteHeight = 750;

/********SPIKE MAN*******/
var NAME_SPIKEMAN = "Spike Man";
var spikeManImageSparite;
var spikeManSpriteWidth = 120;
var spikeManSpriteHeight = 159;
var spikeManTotalSpriteWidth = 240;
var spikeManTotalSpriteHeight = 477;

var enemyArr = [];
/********ENEMIES********/
var newEnemyIteration = 60 * 10;
var currentIteration = 0;


/********Environment********/
var ground = [];
var groundImageSparite;
var groundSpriteWidth = 380;
var groundSpriteHeight = 254;
var groundTotalSpriteWidth = groundSpriteWidth;
var groundTotalSpriteHeight = groundSpriteHeight * 4;

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getLandSartingPoint(ground){
    return ground.drawnHeight * (159 / 254);
}

function setPlayerCharacter(x){
    
    var firstGround = ground[0];
    
    !playerCharacter ? playerCharacter = getPlayerCharacter() : null;
    // need to find the y position of the actual ground inside the ground image
    // the ground starts 62.6% (159/254) pixels down from the y position of the image
    // after finding the ground, you need to minus the height of the player so that the foot is resting on the start of the ground
    var y = firstGround.y + getLandSartingPoint(ground[0]) - playerCharacter.drawnHeight;
        
    if(playerCharacter.img.complete){
        playerCharacter.initialState(x, y, forgroundCTX);
    }
    else{
        playerCharacter.img.onload = function(){
            playerCharacter.initialState(x, y, forgroundCTX);
        }
    }
}

function setupGround(){
    
    for(var i = 0; i < 6; i++){
       
        if(i === 0){
            ground[i] = new Ground(3, 3);
        }
        else{
            var scale = getRandomInt(2, 4);
            ground[i] = new Ground(scale, scale);
        }
        ground[i].createSprite(groundImageSparite, null, groundSpriteWidth, groundSpriteHeight, groundTotalSpriteWidth, groundTotalSpriteHeight);
    }
    // load first ground, the load the rest recursively, each based on the coordinates of the one before it
    groundLoad(0);
}

function groundLoad(position){
    
    if(position === 0){
        
        if(ground[position].img.complete){
            ground[position].initialState(groundCTX, 0, getRandomInt(0, 3), 0, getRandomInt(380, 800 - ground[position].drawnHeight));
            setPlayerCharacter(0);
            groundLoad(position + 1);
            
        }
        else{
            ground[position].img.onload = function(){
                ground[position].initialState(groundCTX, 0, getRandomInt(0, 3), 0, getRandomInt(380, 800 - ground[position].drawnHeight));
                setPlayerCharacter(0);
                groundLoad(position + 1);
            }
        }
    }
    else if(position >= ground.length){
        return;
    }
    else{
        calcNextGroundPosition(position, true);
    }
}

function calcNextGroundPosition(position, loadNext){
    
    // since the grounds are drawn in a circukar queue, the first ground will get the y and y values from the last ground, all others will get the values from the ground just before it
    var prev_ground;
    var curr_ground = ground[position];
    // this condition will only be true when this method is being called from the moveGround method
    // position is never 0 when this method is called from the setupGround method
    if(position === 0){
        prev_ground = ground[(ground.length - 1)];
    }
    else{
        prev_ground = ground[(position - 1)];
    }
    
    var x = prev_ground.x + prev_ground.drawnWidth + getRandomInt(60, 180);
    
    if(!loadNext){
        var scale = getRandomInt(2, 4);
        curr_ground.reCalculateWidthScale(scale);
        curr_ground.reCalculateHeightScale(scale);
    }
    
    var y = getRandomInt(getYForNextGround(prev_ground), curr_ground.baseLimit);

    if(curr_ground.img.complete){  
        curr_ground.initialState(groundCTX, 0, getRandomInt(0, 3), x, y);
    }
    else{
        curr_ground.img.onload = function(){
            curr_ground.initialState(groundCTX, 0, getRandomInt(0, 3), x, y);

        }
    }
    if(loadNext){
        groundLoad(position + 1);
    }
}

function getYForNextGround(prev_ground){
    
    var draftY = (prev_ground.y - 199);
    while(draftY <= 380){
        ++draftY;
    }
    return draftY;
}

function init(){
    
    musicCheckbox = document.getElementById("music");
    sfxCheckbox = document.getElementById("sfx");
    musicOn = musicCheckbox.checked;
    sfxOn = sfxCheckbox.checked;
    
    handleVisibility();
    setBackgroundAudio();
    setupJumpAudio();
    setupEnemyCollisionAudio();
    setupGameOverAudio();
    
    document.addEventListener("keydown", monitorKeyDown, false);
    document.addEventListener("keyup", monitorKeyUp, false);
    backgroundCTX = document.getElementById("backgroundCanvas").getContext("2d");
    forgroundCTX = document.getElementById("foregroundCanvas").getContext("2d");
    enemyCTX = document.getElementById("enemyCanvas").getContext("2d");
    groundCTX = document.getElementById("groundCanvas").getContext("2d");
    timeElement = document.getElementById("time");
    scoreElement = document.getElementById("score");
    gameOverScoreElement = document.getElementById("scoreText");
    background = new Background();
    timeInterval = setInterval(timeCounter, 998);
    
    groundImageSparite = new Image();
    groundImageSparite.src = "./assets/img/Spritesheets/ground.png";
    setupGround(); 
    playerCharacter = getPlayerCharacter();
    
    addEnemy(null, null, NAME_FLYMAN);
    addEnemy(null, null, NAME_WINGMAN);
//  addEnemy(null, null, NAME_SPIKEMAN);
    animate();
}

// onchange attribute set in html for checkbox
function toggleSFX(){
    sfxOn = sfxCheckbox.checked;
}

// onchange attribute set in html for checkbox
function toggleMusic(){
    musicOn = musicCheckbox.checked;
    playBackgroundAudio();// call this method since background audio is always playing
    playGameOverAudio();//call this method just in case the game is over and the user wants the audio off
}

function addToScore(bonus){
    score += bonus;
}

function stopTime() {
    clearInterval(timeInterval);
    timeElement.innerHTML = "Time: ";
    scoreElement.innerHTML = "Score: " + 0;
    totalTime = 0; 
    score = 0;
}

function setTimeInterval(interval){
    timeInterval = setInterval(timeCounter, interval);
}

function gameOver(enemyCollide){
    
    isGameOver = true;
    document.getElementById('gameOver').style.display = "block";
    gameOverScoreElement.innerHTML = "Your Score " + score + "!";
    backgroundAudio.pause();
    stopTime();
    
    if(enemyCollide){
        playEnemyCollisionAudio();
    }
    playGameOverAudio();
    currentIteration = 0;
}

function restart(){
    
    isGameOver = false;
    gameOverAudio.pause();
    document.getElementById('gameOver').style.display = "none";
    resetGame();
    playBackgroundAudio();
    setTimeInterval(998);
    requestAnimationFrame(animate); 
    background.speed = 0.75;
}

function resetGame(){
    setupGround();
    playerCharacter.resetPlayer();
    resetEnemies();
    groundCTX.clearRect(0, 0, 800, 800);
    enemyCTX.clearRect(0, 0, 800, 800);
    background.speed = 1;
}

function setupGameOverAudio(){
    !gameOverAudio ? gameOverAudio = new Audio("./assets/audio/whacked.mp3") : null;
    gameOverAudio.loop = true;
}

function playGameOverAudio(){
    musicOn && isGameOver ? gameOverAudio.play() : gameOverAudio.pause();
}

function setupEnemyCollisionAudio(){
    !enemyCollisionAudio ? enemyCollisionAudio = new Audio("./assets/audio/threeTone1.mp3") : null;
}

function playEnemyCollisionAudio(){
    sfxOn ? enemyCollisionAudio.play() : null;
}

function playJumpSound(){
    sfxOn && !isGameOver ? (!jumpAudio ? (!setupJumpAudio() ? null : jumpAudio.play()) : jumpAudio.play()) : null;
}

function setupJumpAudio(){
    return !jumpAudio ? jumpAudio = new Audio("./assets/audio/phaseJump1.mp3") : jumpAudio;
}

function setBackgroundAudio(){
    !backgroundAudio ? backgroundAudio = new Audio("./assets/audio/background_music.mp3") : null;
    backgroundAudio.loop = true;
    playBackgroundAudio();
}

function playBackgroundAudio(){ 
    musicOn && !isGameOver ? (backgroundAudio.paused ? backgroundAudio.play() : null) : backgroundAudio.pause();
}

function handleVisibility(){
    
    document.addEventListener('visibilitychange', function(){
        
        if(document.hidden)
            backgroundAudio.pause();
        else
            playBackgroundAudio();
    });
}

function addEnemy(scaleX, scaleY, enemyName){
    
    switch(enemyName){
        
        case NAME_FLYMAN:
            enemyArr[enemyArr.length] = getFlyMan(scaleX, scaleY);
            break;
            
        case NAME_WINGMAN:
            enemyArr[enemyArr.length] = getWingMan(scaleX, scaleY);
            break;
            
        case NAME_SPIKEMAN:
            enemyArr[enemyArr.length] = getSpikeMan(scaleX, scaleY);
            break;
    }
}

function resetEnemies(){
    enemyArr.splice(0, enemyArr.length);
    addEnemy(null, null, NAME_FLYMAN);
    addEnemy(null, null, NAME_WINGMAN);
}

function getPlayerCharacter(){
    
    if(playerCharacter instanceof PlayerSprite){
        return playerCharacter;
    }
    else{
        return new PlayerSprite(3, 3).createSprite(null, "./assets/img/Spritesheets/player.png", playerSpriteWidth, playrSpriteHeight, playerSpriteTotalWidth, playerSpriteTotalHeight);
    }
}

function getFlyMan(scaleX, scaleY){
    
    var flyMan;
    if(!scaleX || !scaleY){
        flyMan = new FlyMan(3, 3);
    }
    else{
        flyMan = new FlyMan(scaleX, scaleY);
    }
    
    flyMan.createSprite(null, "./assets/img/Spritesheets/flyMan.png", flyManSpriteWidth, flyManSpriteHeight, flyManSpriteTotalWidth, flyManSpriteTotalHeight);
    flyMan.img.onload = function(){
        flyMan.initialState(enemyCTX);
    }
    return flyMan;
}

function getWingMan(scaleX, scaleY){
    
    var wingMan;
    if(!scaleX || !scaleY){
        wingMan = new WingMan(3, 3);
    }
    else{
        wingMan = new WingMan(scaleX, scaleY);
    }
    
    wingMan.createSprite(null, "./assets/img/Spritesheets/wingMan.png", wingManSpriteWidth, wingManSpriteHeight, wingManTotalSpriteWidth, wingManTotalSpriteHeight);
    wingMan.img.onload = function(){
        wingMan.initialState(enemyCTX);
    }
    return wingMan;
}

function getSpikeMan(scaleX, scaleY){
    
    spikeMan;
    
    if(!scaleX || !scaleY){
        spikeMan = new SpikeMan(3, 3);
    }
    else{
        spikeMan = new SpikeMan(scaleX, scaleY);
    }
    
    spikeMan.createSprite(null, "./assets/img/Spritesheets/spikeMan.png", spikeManSpriteWidth, spikeManSpriteHeight, spikeManTotalSpriteWidth, spikeManTotalSpriteHeight);
    spikeMan.img.onload = function(){
        spikeMan.initialState(enemyCTX);
    }
    return spikeMan;
}

function timeCounter(){
    timeElement.innerHTML = "Time: " + getFormattedTime(++totalTime);
    score++;
    scoreElement.innerHTML = "Score: " + score;
}

function getGroundCoordinates(){
    
    var xValues = [];
    var yValues = [];
    var groundWidth = [];
    var groundHeight = [];
    var values = [xValues, yValues, groundWidth, groundHeight];
    
    for(var i = 0; i < ground.length; i++){
        
        if(ground[i].x + ground[i].drawnWidth >= 0 && ground[i].x <= (800 - (playerCharacter.drawnWidth / 2))){
            xValues[i] = ground[i].x;
            yValues[i] = ground[i].y;
            groundWidth[i] = ground[i].drawnWidth;
            groundHeight[i] = ground[i].drawnHeight;
        }
    }
    return values;
}

function onLand(x, y){
    
    var onLand = false;
    var coordinates = getGroundCoordinates();
    var halfOfPlayer = playerCharacter.drawnWidth / 2;
    
    for(var i = 0; i < coordinates[0].length; i++){
        
        var xValue = coordinates[0][i];
        var yValue = coordinates[1][i];
        var width = coordinates[2][i];
        var height = coordinates[3][i];
        
        // adding and subtracting half the player width on each side allows for one foot to be placed on the land
        if(x >= (xValue - halfOfPlayer) && x <= (xValue + width - halfOfPlayer)){
         
            //console.log("Character X: " + x + " Land x: " + xValue);
            
            var landStartValue = yValue + Math.floor(height * (159 / 254)) - playerCharacter.drawnHeight;
            
            if(y >= landStartValue && y <= landStartValue + 1){
                onLand = true;
                break;
            }
        }
            
    }
    return onLand;
}

function getLandY(x, y){
    
    var landY = undefined;
    var coordinates = getGroundCoordinates();
    var halfOfPlayer = playerCharacter.drawnWidth / 2;
    
    for(var i = 0; i < coordinates[0].length; i++){
        
        var xValue = coordinates[0][i];
        var yValue = coordinates[1][i];
        var width = coordinates[2][i];
        var height = coordinates[3][i];
        
        // adding and subtracting half the player width on each side allows for one foot to be placed on the land
        if(x >= (xValue - halfOfPlayer) && x <= (xValue + width - halfOfPlayer)){
         
            var landStartValue = yValue + (height * (159 / 254)) - playerCharacter.drawnHeight;
            if(landStartValue >= y){
                landY = landStartValue;
                break;
            }
        }
            
    }
    return landY;
}

function getFormattedTime(totalTime){
    
    var seconds = (totalTime % 60);
    var minutes = (Math.floor((totalTime / 60)) % 60);
    
    return (minutes >= 1) ? minutes / 1 + "m " + seconds + "s"
                           : seconds + "s";
}

function getTime(){
    return totalTime;
}

function Background(){
    
    this.backgroundImage = new Image();
    this.backgroundImage.src = "./assets/img/PNG/Background/bg1.png";
    this.speed = 0.75;
    this.x = 0;
    this.y = 0;
}

Background.prototype.drawBackground = function(){
     this.x -= this.speed;
     backgroundCTX.drawImage(this.backgroundImage, this.x, this.y);
     backgroundCTX.drawImage(this.backgroundImage, this.x + this.backgroundImage.width, this.y);
    
    if(this.x <= -this.backgroundImage.width){
        this.x = 0;
    }
    
};

Background.prototype.render = function(){
    
    backgroundCTX.save();
    backgroundCTX.clearRect(0, 0, this.backgroundImage.width, this.backgroundImage.height);
    this.drawBackground();
    backgroundCTX.restore();
}

function animate(){
    
    if(!isGameOver){
        checkForCollision();
        background.render();
        movePlayer();
        moveGround();
        moveEnemy();
        intensify();
        requestAnimationFrame(animate); 
    }
}

function intensify(){

    if(currentIteration++ > newEnemyIteration){
        
        var scale = getRandomInt(2, 3);
        var name = Math.random() > 0.5 ? NAME_WINGMAN : NAME_FLYMAN;
        addEnemy(scale, scale, name);
        currentIteration = 0;
    }
    
    background.speed += background.speed * 0.0001;
    for(var i = 0; i < ground.length; i++){
        ground[i].speed += ground[i].speed * 0.0001;
    }
}

function getLandSpeed(){
    return !ground[0] ? 1 : ground[0].speed;
}

function checkForCollision(){
   
    var collisionOnY, collisionOnX;
    
    for(var i = 0; i < enemyArr.length; i++){
        
        collisionOnY = (((playerCharacter.top >= enemyArr[i].top) && (playerCharacter.top <= enemyArr[i].bottom)) 
                            ||
                       ((playerCharacter.bottom <= enemyArr[i].bottom) && (playerCharacter.bottom >= enemyArr[i].top)));
        
        collisionOnX = (((playerCharacter.left >= enemyArr[i].left) && (playerCharacter.left <= enemyArr[i].right)) 
                            || 
                       ((playerCharacter.right <= enemyArr[i].right) && (playerCharacter.right >= enemyArr[i].left)))
        
        if(collisionOnX && collisionOnY){
            gameOver(true);
            break;
        }
    }
}

function movePlayer(){
    
    if(playerCharacter.isLoaded){
        playerCharacter.move(forgroundCTX); 
        playerCharacter.drawSprite(playerCharacter.currentColumn, playerCharacter.currentRow, playerCharacter.x, playerCharacter.y, forgroundCTX);
    }  
    
}

//function movePlayer(){
//    
//    if(playerCharacter.isLoaded){
//        
//        KEY.isDown(KEY.LEFT) || KEY.isDown(KEY.LEFT_Z_BUTTON) ? playerCharacter.forward = false : 
//                                (KEY.isDown(KEY.RIGHT) || KEY.isDown(KEY.RIGHT_X_BUTTON) ? playerCharacter.forward = true : (playerCharacter.forward !== undefined ? playerCharacter.forward = undefined : null));
//        
//        KEY.isDown(KEY.JUMP) || KEY.isDown(KEY.JUMP_UP) ? playerCharacter.jumping = true : null;        
//        KEY.isDown(KEY.RUN) ? playerCharacter.run = true : null;
//        playerCharacter.move(forgroundCTX); 
//    }  
//    
//}

function moveEnemy(){
    
    for(var i = 0; i < enemyArr.length; i++){
        
        if(!enemyArr[i].animationFinished){
        
            if(enemyLoaded(i)){   
                enemyArr[i].move();
            }
        }
        else if(enemyLoaded(i)){
            enemyArr[i].initialState(enemyCTX);
        }
    }
    
    if(enemyLoaded()){
        
        enemyCTX.clearRect(0, 0, 800, 800);

        for(var i = 0; i < enemyArr.length; i++){

            if(enemyLoaded(i)){
                
                var enemy = enemyArr[i];
                enemy.switchImage();
                enemy.drawSprite(enemy.currentColumn, enemy.currentRow, enemy.x, enemy.y, enemyCTX);
            }
        }
    }
}

function enemyLoaded(i){
    
    if(i !== undefined && !isNaN(i))
        return enemyArr[i].isLoaded;
    else
       return enemyArr[0].isLoaded || enemyArr[1].isLoaded;// || enemyArr[2].isLoaded
}

function moveGround(){
     
    if(groundLoaded()){
        groundCTX.clearRect(0, 0, 800, 800);
    }
    
    for(var i = 0; i < ground.length; i++){
        
        if(!ground[i].animationFinished){
        
            if(groundLoaded(i)){   
                ground[i].move(groundCTX);
            }
        }
        else if(groundLoaded(i)){
            calcNextGroundPosition(i, false);
        }
    }
}

function groundLoaded(i){
    
    if(i !== undefined && !isNaN(i))
        return ground[i].isLoaded;
    else
       return ground[0].isLoaded || ground[1].isLoaded || ground[2].isLoaded 
              || ground[3].isLoaded || ground[4].isLoaded || ground[5].isLoaded;
}


function monitorKeyDown(event){
    KEY.onKeyDown(event);
}

function monitorKeyUp(event){ 
    
    KEY.onKeyUp(event);
    
//    if(event.keyCode === KEY.LEFT || event.keyCode === KEY.RIGHT){
//        playerCharacter.clearSprite(forgroundCTX);
//        playerCharacter.initialState(playerCharacter.x, playerCharacter.y, forgroundCTX);
//    }
}

onload = init;

var KEY = {
    
    pressed: {},
    LEFT: 37,// will be used for left direction
    LEFT_Z_BUTTON: 90,// will be used for left direction
    RIGHT: 39,// will be used for right direction
    RIGHT_X_BUTTON: 88,// will be used for right direction
    JUMP: 32,//spacebar used for jump
    JUMP_UP: 38,//up arrow used for jump
    RUN: 66,
    
    isDown: function(keyCode){
        return this.pressed[keyCode];
    },
    
    onKeyDown: function(event){
        
        var keyCode = event.keyCode;
        if(keyCode === this.LEFT 
           || keyCode === this.RIGHT
           || keyCode === this.LEFT_Z_BUTTON
           || keyCode === this.RIGHT_X_BUTTON
           || keyCode === this.JUMP
           || keyCode === this.JUMP_UP
           ||keyCode === this.RUN){
            
            this.pressed[keyCode] = true;
        }
    },
    
    onKeyUp: function(event){
        
        var keyCode = event.keyCode;
        if(keyCode === this.LEFT 
           || keyCode === this.RIGHT
           || keyCode === this.LEFT_Z_BUTTON
           || keyCode === this.RIGHT_X_BUTTON
           || keyCode === this.JUMP
           || keyCode === this.JUMP_UP
           ||keyCode === this.RUN){
            
            this.pressed[keyCode] = false;
        }
    }
    
//    leftPressed: false,
//    leftZPressed: false,
//    rightPressed: false, 
//    rightXPressed: false,
//    jumpPressed: false,
//    jumpUpPressed: false,
//    runPressed: false,
//    
//    isDown: function(keyCode){
//        
//        switch(keyCode){
//    
//            case this.LEFT: return this.leftPressed;
//            case this.LEFT_Z_BUTTON: return this.leftZPressed;
//            case this.RIGHT: return this.rightPressed;
//            case this.RIGHT_X_BUTTON: return this.rightPressed;
//            case this.JUMP: return this.jumpPressed;
//            case this.JUMP_UP: return this.jumpUpPressed;
//            case this.RUN: return this.runPressed;
//            
//        }
//    },
//    
//    onKeyDown: function(event){
//        
//        switch(event.keyCode){
//              
//            case this.LEFT: this.leftPressed = true; break;
//            case this.LEFT_Z_BUTTON: this.leftZPressed = true; break;
//            case this.RIGHT: this.rightPressed = true; break;
//            case this.RIGHT_X_BUTTON: this.rightXPressed = true; break;
//            case this.JUMP: this.jumpPressed = true; break;
//            case this.JUMP_UP: this.jumpUpPressed = true; break;
//            case this.RUN: this.runPressed = true; break;
//        }
//    },
//    
//    onKeyUp: function(event){
//        
//        switch(event.keyCode){
//              
//            case this.LEFT: this.leftPressed = false; break;
//            case this.LEFT_Z_BUTTON: this.leftZPressed = false; break;
//            case this.RIGHT: this.rightPressed = false; break;
//            case this.RIGHT_X_BUTTON: this.rightXPressed = false; break;
//            case this.JUMP: this.jumpPressed = false; break;
//            case this.JUMP_UP: this.jumpUpPressed = false; break;
//            case this.RUN: this.runPressed = false; break;
//        }
//    }
};

