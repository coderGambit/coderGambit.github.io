var spriteChangeSpeed = 50;// speed at which the images of the sprite is changed
var spriteChangeSpeedInterval = 6;// every multiple of 6, the sprite image changes, when the player is running, this value will be less
var DEFAULT_PLAYER_SPEED = 4;// speed at which the player moves across the screen
var RUN_SPEED = 6;// speed at whic the player runs
var jumpHeightLimit = 150;
var animator = new Animator();

var debugCounter = 0;
var debugFPS = 60;

function PlayerSprite(heightScale, widthScale){
    this.scaleX = heightScale;
    this.scaleY = widthScale;
    this.spriteSpeedChangeTime = Math.round(60 * 0.1); 
};

PlayerSprite.prototype.createSprite = function(img, path, singleSpriteWidth, singleSpriteHeight, entireSpriteWidth, entireSpriteHeight){
    
    if(!img){
        this.img = new Image();
    }
    else{
        this.img = img;
    }
    
    if(!this.img.src){
        
        if(path){
            this.img.src = path;
            this.path = path;
        }
        else{
            console.log("The image has no source, and there was no path specified");
        }
    }
   
    this.destination = undefined;
    this.startValue = undefined;
    this.distance = undefined;
    this.currentIteration = 0;
    this.totalIteration = 0.5 * 60;
    this.landY = undefined;
    
    this.singleSpriteWidth = singleSpriteWidth;
    this.singleSpriteHeight = singleSpriteHeight;
    this.entireSpriteWidth = entireSpriteWidth;
    this.entireSpriteHeight = entireSpriteHeight;
    this.coloumnCount = Math.floor(this.entireSpriteWidth / this.singleSpriteWidth);
    this.rowCount = Math.floor(this.entireSpriteHeight / this.singleSpriteHeight);
    this.currentColumn;//keeps track of the column drawn
    this.currentRow;//keeps track of current row to be drawn
    this.spriteSpeedCurrentTime = 0; 
    this.drawnWidth = this.singleSpriteWidth / this.scaleX;
    this.drawnHeight = this.singleSpriteHeight / this.scaleY;
    
    this.goingLeft = false;
    this.goingRight = false
    this.jump = false;
    this.falling = true;
    this.jumping = false;
    this.isLoaded = false;
    
    this.left;
    this.right;
    this.top;
    this.bottom;
    
    return this;
};

PlayerSprite.prototype.resetPlayer = function(){
    
    this.destination = undefined;
    this.startValue = undefined;
    this.distance = undefined;
    this.currentIteration = 0;
    this.spriteSpeedCurrentTime = 0; 
    this.goingLeft = false;
    this.goingRight = false
    this.jump = false;
    this.falling = true;
    this.jumping = false;
};

PlayerSprite.prototype.calculateBoundingBox = function(){
    this.left = this.x;
    this.right = this.left + this.drawnWidth;
    this.top = this.y;
    this.bottom = this.top + this.drawnHeight;
};

PlayerSprite.prototype.initialState = function(x, y, ctx){
  
    this.x = x;
    this.y = y;
    this.calculateBoundingBox();
    this.drawSprite(0, 0, x, y, ctx);
    this.currentColumn = 0;
    this.currentRow = 0;
    !this.isLoaded ? this.isLoaded = true : null;
};

PlayerSprite.prototype.drawSprite = function(column, row, x, y, ctx){
    this.clearSprite(ctx);
    ctx.drawImage(this.img, column * this.singleSpriteWidth, row * this.singleSpriteHeight, this.singleSpriteWidth, this.singleSpriteHeight, x, y, this.drawnWidth, this.drawnHeight);
};

PlayerSprite.prototype.clearSprite = function(ctx){
    ctx.clearRect(0, 0, 800, 800);
};

PlayerSprite.prototype.move = function(ctx){
//    
//    if(debugCounter > debugFPS){
//        console.log("***********************START*************************");
//    }
//     
//    console.log("***********************Iteration ", debugCounter, " START*************************");
    this.checkKeys();
    
    if(this.goingLeft && !this.goingRight){
        this.goLeft();
        this.toggleSpriteImage(ctx);
    }
    else if(this.goingRight && !this.goingLeft){
        this.goRight();
        this.toggleSpriteImage(ctx);
    }
    
    var isOnLand = onLand(this.x, this.y);
    
    // to cut down on the amount of calls to onLand(x, y), use isJumping() and isFalling() with a parameter isOnLand, which is stored in a variable
    if(this.isJumping(isOnLand)){
        this.organizeValues();
        this.jumpUp();
        playJumpSound();
    }
    else if(this.isFalling(isOnLand)){
        this.organizeValues(isOnLand);
        this.fallDown();
    }
    else if((!this.goingLeft || !this.goingRight) || (this.goingLeft && this.goingRight)){
        this.moveWithLand();
        this.toggleSpriteImage(ctx);
    }
//  console.log("***********************Iteration ", debugCounter, " END*************************");
//    
//    if(++debugCounter > debugFPS){
//        debugCounter = 0;
//        console.log("***********************END*************************");
//    }
};

PlayerSprite.prototype.organizeValues = function(isOnLand){
    this.checkDestination(isOnLand);
    this.checkStartValue();
    this.checkDistance();
}

PlayerSprite.prototype.checkDestination = function(isOnLand){
    
    if(this.jumping && isOnLand){
        this.destination = Math.abs(this.y - (this.distance = (this.run ? 240 : 200)));
    }
    else if(this.falling){
        this.destination = 801;
    }

};

PlayerSprite.prototype.setFallingStop = function(){
    
    // check for null because isNan(null) returns false ie. null is a number
    if(!isNaN(this.landY) && this.landY !== null){
        
        if(this.y >= this.landY){
            this.y = this.landY;
            this.calculateBoundingBox();
            return true;
        } 
    }
    return false;
};

PlayerSprite.prototype.checkStartValue = function(){ 
    (this.startValue === undefined || this.startValue === 0) ? this.startValue = this.y : null;
};

PlayerSprite.prototype.checkDistance = function(){ 
    
    if(this.falling){
        (this.distance === undefined || this.distance === 0) ? this.distance = Math.abs(this.destination - this.y) : null;
    }
    else if(this.jumping){
        (this.distance === undefined || this.distance === 0) ? this.distance = (this.run ? 240 : 200) : null;
    }
    else{
        this.distance = undefined
    }
    
};

PlayerSprite.prototype.jumpUp = function(){
   
    this.y = animator.cubicEaseOut(this.currentIteration++, this.startValue, -this.distance, this.totalIteration);
    
    this.calculateBoundingBox();
    
    if(this.currentIteration > this.totalIteration || this.playerOverJumpLimit()){
        this.endJumpUp();
    }
};

PlayerSprite.prototype.playerOverJumpLimit = function(){
    
    if(this.top <= jumpHeightLimit){
        this.y = jumpHeightLimit;
        this.calculateBoundingBox();
        return true;
    }
    return false;
};

PlayerSprite.prototype.endJumpUp = function(){
    this.currentIteration = 0;
    this.jumping = false;
    this.falling = true;
    this.destination = 0;
    this.startValue = 0;
    this.distance = 0;
};

PlayerSprite.prototype.fallDown = function(){
    
    this.landY = getLandY(this.x, this. y);
    
    this.y = animator.cubicEaseIn(this.currentIteration++, this.startValue, this.distance, this.totalIteration);
    
    this.calculateBoundingBox();
    
    if(this.top > 800){
        gameOver(false);
    }
    
    if(this.setFallingStop() || this.currentIteration > this.totalIteration){
        this.endFallDown();
    }
};

PlayerSprite.prototype.endFallDown = function(){
    this.currentIteration = 0;
    this.falling = false;
    this.destination = 0;
    this.startValue = 0;
    this.distance = 0;
};

PlayerSprite.prototype.moveWithLand = function(){
    
    if(!this.isGoneOffLeft()){
        this.x -= getLandSpeed();
        this.calculateBoundingBox();
    }  
};

PlayerSprite.prototype.isGoneOffLeft = function(){
    return (this.left <= 0);
};

PlayerSprite.prototype.isGoneOffRight = function(){
    return (this.right >= 800);
};

PlayerSprite.prototype.goLeft = function(){
    this.isGoneOffLeft() ? this.x = 0 : this.x -= (this.run ? RUN_SPEED : DEFAULT_PLAYER_SPEED);
    this.calculateBoundingBox();
};

PlayerSprite.prototype.goRight = function(){
    this.isGoneOffRight() ? this.x = 800 - this.drawnWidth : this.x += (this.run ? RUN_SPEED : DEFAULT_PLAYER_SPEED);   
    this.calculateBoundingBox();
};

PlayerSprite.prototype.isJumping = function(isOnLand){
    
    if(isOnLand !== undefined){
        return (!this.jumping ? this.jumping = (this.jump && isOnLand) : this.jumping);
    }
    return (!this.jumping ? this.jumping = (this.jump && onLand(this.x, this.y)) : this.jumping);
};

// falling is ALWAYS true unless the player is on land or jumping
PlayerSprite.prototype.isFalling = function(isOnLand){
    
    if(isOnLand !== undefined){
        return (this.jumping || isOnLand) ? this.falling = false : this.falling = (this.y < 800);
    }
    return (this.jumping || onLand(this.x, this.y)) ? this.falling = false : this.falling = (this.y < 800);
};

PlayerSprite.prototype.checkKeys = function(){
    
    KEY.isDown(KEY.LEFT) || KEY.isDown(KEY.LEFT_Z_BUTTON) ? this.goingLeft = true : this.goingLeft = false;
    KEY.isDown(KEY.RIGHT) || KEY.isDown(KEY.RIGHT_X_BUTTON) ? this.goingRight = true : this.goingRight = false;
    KEY.isDown(KEY.JUMP) || KEY.isDown(KEY.JUMP_UP) ? this.jump = true : this.jump = false;        
    KEY.isDown(KEY.RUN) ? this.run = true : this.run = false;
};

PlayerSprite.prototype.toggleSpriteImage = function(ctx){
    
    if(this.spriteSpeedCurrentTime++ >= this.spriteSpeedChangeTime / (this.run ? 2 : 1)){
        this.switchImage();
        this.spriteSpeedCurrentTime = 0;
    }

};

PlayerSprite.prototype.switchImage = function(){
    
    if(this.goingLeft){
        this.leftSwitch();
    }
    if(this.goingRight){
        this.rightSwitch();
    }
    if((this.goingLeft && this.goingRight) || (!this.goingLeft && !this.goingRight)){
        this.currentRow = 0;
    }
};

PlayerSprite.prototype.leftSwitch = function(){
    
    switch(this.currentRow){
        
        case 3:
            this.currentRow = 4;
            break;
            
        case 4:
            this.currentRow = 3;
            break;
            
        default:
            this.currentRow = 3;
    }
};

PlayerSprite.prototype.rightSwitch = function(){
    
    switch(this.currentRow){
        
        case 1:
            this.currentRow = 2;
            break;
            
        case 2:
            this.currentRow = 1;
            break;
            
        default:
            this.currentRow = 1;
    }
};

PlayerSprite.prototype.jumpSwicth = function(){
    
    switch(this.currentRow){
        
        default:
            this.currentRow = 5;
    }
};
