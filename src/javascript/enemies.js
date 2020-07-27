/**************************General Values********************************/
var heightLimit = 200;
var animator = new Animator();

var debugCounter = 0;
var debugFPS = 60;

/**************************FLY MAN********************************/
function FlyMan(heightScale, widthScale){
    
    this.scaleY = heightScale;
    this.scaleX = widthScale;
    this.spriteSpeedChangeTime = Math.round(60 * 0.015);  
};

FlyMan.prototype.drawSprite = function(column, row, x, y, ctx){
    
    ctx.drawImage(this.img, column * this.singleSpriteWidth, row * this.singleSpriteHeight, this.singleSpriteWidth, this.singleSpriteHeight, x, y, this.drawnWidth, this.drawnHeight);
};

FlyMan.prototype.switchImage = function(){
    
    if(this.spriteSpeedCurrentTime++ === this.spriteSpeedChangeTime){
        this.toggleSpriteImage();
        this.spriteSpeedCurrentTime = 0;
    }

};

FlyMan.prototype.createSprite = function(img, path, singleSpriteWidth, singleSpriteHeight, entireSpriteWidth, entireSpriteHeight){
    
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
    this.baseLimit = 800 - 100 - this.drawnHeight;
    
    this.goingUp = false;
    this.goingDown = false;
    this.goingHorizontal = (Math.random() > 0.5 ? true : false);
    
    this.animationFinished = true;
    this.destination = undefined;
    this.startValue = undefined;
    this.distance = undefined;
    this.currentIteration = 0;
    this.totalIterationTime = undefined;
    this.isLoaded = false;  
    
    this.left;
    this.right;
    this.top;
    this.bottom;
    
    return this;//allow chaining
};

FlyMan.prototype.calculateBoundingBox = function(){
    
    this.left = this.x;
    this.right = this.left + this.drawnWidth;
    this.top = this.y;
    this.bottom = this.top + this.drawnHeight;
};


FlyMan.prototype.initialState = function(ctx){
  
    this.x = 800;// always start at the end of the screen
    this.y = getRandomInt(heightLimit, this.baseLimit);
    this.calculateBoundingBox();
    this.xDelta = getRandomArbitrary(0.5, 2);
    this.drawSprite(0, 0, this.x, this.y, ctx);
    this.currentColumn = 0;
    this.currentRow = 0;
    !this.isLoaded ? this.isLoaded = true : null;
    this.animationFinished ? this.animationFinished = false : true;
//    var val = (Math.random() > 0.5 ? true : false);
//    !this.goingHorizontal ? (this.goingHorizontal = this.goingHorizontal) : val;
    if(!this.goingHorizontal){
        var va = Math.random() > 0.5 ? true : false;
        this.goingHorizontal = va;
    }
};

FlyMan.prototype.checkDestination = function(){
    
    if(this.destination === undefined){
        //this goes up and down
        if(!this.goingHorizontal){
           
             if(this.y <= heightLimit){
                this.destination = this.baseLimit;
             }
             else if(this.y >= this.baseLimit){
                 this.destination = heightLimit;
             }
             else if(this.goingDown){
                 this.destination = this.baseLimit;
             }
             else if(this.goingUp){
                 this.destination = heightLimit;
             }
             else{
                 // 50-50 chance
                 Math.random() > 0.5 ? this.destination = heightLimit : this.destination = this.baseLimit;          
             }
        }
        else{
            this.destination = 0 - this.drawnWidth;
        }
    }
};

FlyMan.prototype.checkStartValue = function(){
    
    if(!this.goingHorizontal){
        this.startValue === undefined ? this.startValue = this.y : null;
    }
    else{
        this.startValue === undefined ? this.startValue = this.x : null;
    }
};

FlyMan.prototype.checkMoveDirection = function(){
    
    if(!this.goingDown && !this.goingUp && !this.goingHorizontal){
        
        if(this.destination > this.startValue){
            this.goingDown = true;
        }
        else{
            this.goingUp = true;
        }
    }
};

FlyMan.prototype.move = function(){
    
    this.checkDestination();    
    this.checkStartValue();
    this.distance === undefined ? this.distance = Math.abs(this.destination - this.startValue) : null;
    this.totalIterationTime === undefined ? this.totalIterationTime = this.getIterationTime(): null;
    this.checkMoveDirection();
    
    if(this.goingDown || this.goingUp){
        
        if(this.goingUp){
            this.goingDown ? this.goingDown = false : null;
            this.goUp();
        }
        else{
            this.goingUp ? this.goingUp = false : null;
            this.goDown();
        }  
    }
    else{
        this.goingDown ? this.goingDown = false : null;
        this.goingUp ? this.goingUp = false : null;
        this.goHorizontal();
    }
};

FlyMan.prototype.getIterationTime = function(){
    
    var maxDistance = this.baseLimit - heightLimit;
    var timeForMaxDistance = 5 * 60;// 5 seconds.ie. 60 iterations a second
    return (this.distance / maxDistance) * timeForMaxDistance;
};

FlyMan.prototype.goUp = function(){
    
    this.y = animator.cubicEaseInOut(this.currentIteration++, this.startValue, -this.distance, this.totalIterationTime);
    this.x -= this.xDelta;
    
    this.calculateBoundingBox();
    
    if(this.top <= heightLimit || this.currentIteration > this.totalIterationTime){
        
        this.goingDown = true;
        this.goingUp = false;
        this.resetState();
    }
    this.isGoneOffLeft();
};

FlyMan.prototype.goDown = function(){
    
    this.y = animator.cubicEaseInOut(this.currentIteration++, this.startValue, this.distance, this.totalIterationTime);
    this.x -= this.xDelta;
    
    this.calculateBoundingBox();
    
    if(this.top >= this.baseLimit || this.currentIteration > this.totalIterationTime){
        
        this.goingDown = false;
        this.goingUp = true;
        this.resetState();
    }
    this.isGoneOffLeft();
};

FlyMan.prototype.goHorizontal = function(){
    
    this.x = animator.cubicEaseIn(this.currentIteration++, this.startValue, -this.distance, this.totalIterationTime);
    
    this.calculateBoundingBox();
    
    if(this.left <= this.destination || this.currentIteration > this.totalIterationTime){
        this.goingHorizontal = undefined;
        this.resetState();
    }
    this.isGoneOffLeft();
};

FlyMan.prototype.isGoneOffLeft = function(){
    
    if(this.right <= 0){
        this.goingDown = false;
        this.goingUp = false;
        this.resetState();
        return true;
    }
    return false;
};

FlyMan.prototype.resetState = function(){ 
    this.currentIteration = 0;
    this.distance = undefined;
    this.destination = undefined;
    this.startValue = undefined;
    this.totalIterationTime = undefined
    
    // if it is a horizontal fly man, then the below code is the same as saying
    // this.x <= this.destination, however, since this method is called by both
    // horizontal and vertical fly men, if it was called by a vertical fly man,
    // then this.destination would be a value on the y axis, therefor, we need to make       // this check.
    // Vertical fly men continue to go up and down until their x values goes off 
    // the left of the screen, while horizontal fly men finish their movement in one
    // horizontal move to the left
    if(this.x <= 0 - this.drawnWidth){
        this.animationFinished = true;
    }
    addToScore(150 / this.scaleX);
};

FlyMan.prototype.toggleSpriteImage = function(){
    
//    // baseLimit - heightLimit is max distance
//    var spriteChangeDistance = (1/3) * (baseLimit - heightLimit);
//    var areaOfSprite = baseLimit - (spriteChangeDistance);
//    
//    if(this.y <= baseLimit 
//       && this.y > baseLimit - areaOfSprite){
//        this.toggleSprite("first set");
//    }
//    else if(this.y <= baseLimit - areaOfSprite
//           && this.y > baseLimit - (areaOfSprite * 2)){
//        this.toggleSprite("second set");
//    }
//    else if(this.y <= baseLimit - (areaOfSprite * 2)
//           && this.y >= heightLimit){
//        this.toggleSprite("third set");
//    }
//    else if(this.y > baseLimit){
//        this.toggleSprite("first set");
//    }
//    else{
//        this.toggleSprite("third set");
//    }
    this.currentColumn === 0 ? this.currentColumn = 1 : this.currentColumn = 0;
};

//FlyMan.prototype.toggleSprite = function(str){
//    
//    switch(str){
//        
//        case "first set": 
//            this.currentColumn === 0 ? this.currentColumn = 1 : this.currentColumn = 0;
//            break;
//        case "second set":
//            this.currentColumn === 2 ? this.currentColumn = 3 : this.currentColumn = 2;
//            break;
//        case "third set":
//            this.currentColumn === 4 ? this.currentColumn = 5 : this.currentColumn = 4;
//            break;
//    }
//};


/**************************WING MAN********************************/
function WingMan(heightScale, widthScale){
    
    this.scaleY = heightScale;
    this.scaleX = widthScale;
    this.totalFlyingTime = 60 * 10;
    this.xCurrentPathCounter = 0;
    this.yCurrentPathCounter = 0;
};

WingMan.prototype.createSprite = function(img, path, singleSpriteWidth, singleSpriteHeight, entireSpriteWidth, entireSpriteHeight){
    
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
    this.baseLimit = 800 - 100 - this.drawnHeight;
    this.rightLimit = 800 - this.drawnWidth;
    this.spriteSpeedChangeTime = Math.round(60 * 0.05);
    
    this.destination = undefined;
    this.xStartValue = undefined;
    this.yStartValue = undefined;
    this.xDistance = undefined;
    this.yDistance = undefined;
    this.xCurrentIteration = 0;
    this.yCurrentIteration = 0;
    this.xTotalIterationTime = undefined;
    this.yTotalIterationTime = undefined;
    this.entireFlyingTime = 0;
    this.finalTransition = false;
    this.animationFinished = true;
    this.isLoaded = false; 
    
    this.goingUp = undefined;
    this.goingDown = undefined;
    this.goingLeft = undefined;
    this.goingRight = undefined;
    
    this.spriteImageGoingDown = true;
    
    // paths for movement
    this.xPaths = [];
    this.yPaths = [];
    
    this.left;
    this.right;
    this.top;
    this.bottom;
    
    return this;//allow chaining
};

WingMan.prototype.calculateBoundingBox = function(){
    
    this.left = this.x;
    this.right = this.left + this.drawnWidth;
    this.top = this.y;
    this.bottom = this.top + this.drawnHeight;
};

WingMan.prototype.initialState = function(ctx){
    
    this.x = 800;
    this.y = getRandomInt(heightLimit, this.baseLimit);
    this.calculateBoundingBox();
    this.drawSprite(0, 0, this.x, this.y, ctx);
    this.currentColumn = 0;
    this.currentRow = 0;
    !this.isLoaded ? this.isLoaded = true : null;
    this.animationFinished ? this.animationFinished = false : null;
    this.finalTransition ? this.finalTransition = false : null;
    this.entireFlyingTime = 0;   
    this.createPaths(true, true);
};

WingMan.prototype.drawSprite = function(column, row, x, y, ctx){
    
    ctx.drawImage(this.img, column * this.singleSpriteWidth, row * this.singleSpriteHeight, this.singleSpriteWidth, this.singleSpriteHeight, x, y, this.drawnWidth, this.drawnHeight);
};

WingMan.prototype.move = function(){
    
//    if(debugCounter > debugFPS || debugCounter === 0){
//        console.log("\n***********************START*************************");
//    }
//     
//    console.log("***********************Iteration ", debugCounter, " START*************************");
//    
//    console.log("X before ", this.x, " Y before ", this.y);
    
    this.checkDestination();
    this.checkStartValue();
    this.checkDistance();
    this.checkTotalIterationTime();
    this.checkMoveDirection();
    
    if(this.goingDown){
        this.goDown();      
    }
    else{
        this.goUp();
    }
    
    if(this.goingLeft){
        this.goLeft();
    }
    else{
        this.goRight();
    }
    
    if(++this.entireFlyingTime === this.totalFlyingTime){
        this.finalAnimation();
    }
    
//    console.log("X after ", this.x, " Y after ", this.y);
//    
//    console.log("***********************Iteration ", debugCounter, " END*************************");
//    
//    if(++debugCounter > debugFPS){
//        debugCounter = 0;
//        console.log("***********************END*************************");
//    }
};

WingMan.prototype.goDown = function(){
    
    this.y = animator.cubicEaseInOut(this.yCurrentIteration++, this.yStartValue, this.yDistance, this.yTotalIterationTime);
    
    this.calculateBoundingBox();
    
    if(this.top >= this.baseLimit || this.yCurrentIteration > this.yTotalIterationTime){
        this.resetYState();     
        this.createPaths(false, true);
    }
};

WingMan.prototype.goUp = function(){
    
    this.y = animator.cubicEaseInOut(this.yCurrentIteration++, this.yStartValue, -this.yDistance, this.yTotalIterationTime);
    
    this.calculateBoundingBox();
    
    if(this.top <= heightLimit || this.yCurrentIteration > this.yTotalIterationTime){
        this.resetYState(); 
        this.createPaths(false, true);
    }
};

WingMan.prototype.goLeft = function(){
    
    this.x = animator.cubicEaseInOut(this.xCurrentIteration++, this.xStartValue, -this.xDistance, this.xTotalIterationTime);
    
    this.calculateBoundingBox();
    
    // make this check inside this method because the final transition always goes to the left
    if(this.finalTransition){
        
        this.entireFlyingTime > (this.totalFlyingTime + 1) ? this.entireFlyingTime = (this.totalFlyingTime + 1) : null;
        
        if(this.xCurrentIteration > this.xTotalIterationTime){
            this.animationFinished = true;
            this.finalTransition = false;
            this.resetXState();
            this.resetYState();
            addToScore(150 / this.scaleX);
        }
    }
    else if(this.right <= 0 || (this.xCurrentIteration > this.xTotalIterationTime)){
        this.resetXState(); 
        this.createPaths(true, false);
    }
};

WingMan.prototype.goRight = function(){
    
    this.x = animator.cubicEaseInOut(this.xCurrentIteration++, this.xStartValue, this.xDistance, this.xTotalIterationTime);
    
    this.calculateBoundingBox();
    
    if(this.right >= 800 || this.xCurrentIteration > this.xTotalIterationTime){
        this.resetXState(); 
        this.createPaths(true, false);
    }
};

WingMan.prototype.finalAnimation = function(){
    
    this.resetXState();
    this.resetYState();
    this.createFinalPaths();
    this.finalTransition = true;
};

WingMan.prototype.resetYState = function(){ 
    this.yCurrentIteration = 0;
    this.yDistance = undefined;
    this.destination[1] = undefined;
    this.yStartValue = undefined;
    this.yTotalIterationTime = undefined
    this.yCurrentPathCounter = 0;
};

WingMan.prototype.resetXState = function(){ 
    this.xCurrentIteration = 0;
    this.xDistance = undefined;
    this.destination[0] = undefined;
    this.xStartValue = undefined;
    this.xTotalIterationTime = undefined
    this.xCurrentPathCounter = 0;
};

WingMan.prototype.checkDestination = function(){
    
    if(this.destination === undefined){
        
        this.destination = [];
        this.destination[0] = this.xPaths[this.xCurrentPathCounter++]
        this.destination[1] = this.yPaths[this.yCurrentPathCounter++];
    }
    else{
        
        if(this.destination[0] === undefined){
            this.destination[0] = this.xPaths[this.xCurrentPathCounter++]
        }
        if(this.destination[1] === undefined){
            this.destination[1] = this.yPaths[this.yCurrentPathCounter++];
        }
    }
};

WingMan.prototype.checkStartValue = function(){
    
    if(!this.xStartValue){
        this.xStartValue = this.x;
    }
    if(!this.yStartValue){
        this.yStartValue = this.y;
    }
};

WingMan.prototype.checkDistance = function(){
    
    if(this.xDistance === undefined){
        this.xDistance = Math.abs(this.destination[0] - this.xStartValue);
    }
    
    if(this.yDistance === undefined){
        this.yDistance = Math.abs(this.destination[1] - this.yStartValue);
    }
};

WingMan.prototype.checkTotalIterationTime = function(){
     
    if(this.xTotalIterationTime === undefined){
        
        var maxDistance = this.rightLimit - 0;
        var timeForMaxDistance = 10 * 60;// 8 seconds.ie. 60 iterations a second
        this.xTotalIterationTime = (this.xDistance / maxDistance) * timeForMaxDistance;
        
    }
    if(this.yTotalIterationTime === undefined){
        
        var maxDistance = this.baseLimit - heightLimit;
        var timeForMaxDistance = 5 * 60;// 5 seconds.ie. 60 iterations a second
        this.yTotalIterationTime = (this.yDistance / maxDistance) * timeForMaxDistance;
    }
};

WingMan.prototype.checkMoveDirection = function(){
     
    if(!this.goingDown || !this.goingUp){
        
        if(this.destination[1] > this.yStartValue){
            this.goingUp = false;
            this.goingDown = true;
        }
        else{
            this.goingUp = true;
            this.goingDown = false;
        }
    }
    
    if(!this.goingLeft || !this.goingRight){
        
        if(this.destination[0] < this.xStartValue){
            this.goingLeft = true;
            this.goingRight = false;
        }
        else{
            this.goingLeft = false;
            this.goingRight = true;
        }
    }
    
};

WingMan.prototype.toggleSpriteImage = function(){
    
    
    switch(this.currentRow){
            
        case 0: 
            this.currentRow = 1;
            this.spriteImageGoingDown = true;
            break;
            
        case 1:
            this.spriteImageGoingDown === true ? this.currentRow = 2 : this.currentRow = 0;
            break;
        
        case 2:
            this.spriteImageGoingDown === true ? this.currentRow = 3 : this.currentRow = 1;
            break;
            
        case 3:
            this.spriteImageGoingDown === true ? this.currentRow = 4 : this.currentRow = 2;
            break;
        
        case 4:
            this.currentRow = 3;
            this.spriteImageGoingDown = false;
            break;
                
    }
};

WingMan.prototype.switchImage = function(){
    
    if(this.spriteSpeedCurrentTime++ === this.spriteSpeedChangeTime){
        this.toggleSpriteImage();
        this.spriteSpeedCurrentTime = 0;
    }

};

WingMan.prototype.createPaths = function(newX, newY){
    
    for(var i = 0; i < 8; i++){   
            
        if(newX){
            this.xPaths[i] = getRandomInt(0, this.rightLimit);
        }
        if(newY){    
            this.yPaths[i] = getRandomInt(heightLimit, this.baseLimit);
        }
    }
};

WingMan.prototype.createFinalPaths = function(){
    
    var dest = 0 - this.singleSpriteWidth + 1; 
    for(var i = 0; i < 8; i++){  
        this.xPaths[i] = dest;
        this.yPaths[i] = getRandomInt(heightLimit, this.baseLimit);
    }
};


/**************************SPIKE MAN********************************/
function SpikeMan(heightScale, widthScale){
    
    this.scaleY = heightScale;
    this.scaleX = widthScale;
};

SpikeMan.prototype.createSprite = function(img, path, singleSpriteWidth, singleSpriteHeight, entireSpriteWidth, entireSpriteHeight){
    
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
    this.spriteSpeedChangeTime = Math.round(60 * 0.2);
    
    this.destination = undefined;
    this.startValue = undefined;
    this.distance = undefined;
    this.currentIteration = 0;
    this.totalIterationTime = undefined;
    this.animationFinished = true;
    this.isLoaded = false; 
    
    this.goingUp = undefined;
    this.goingDown = undefined;
    this.goingLeft = undefined;
    this.goingRight = undefined;
    
    this.left;
    this.right;
    this.top;
    this.bottom;
    
    return this;//allow chaining
};

SpikeMan.prototype.calculateBoundingBox = function(){
    
    this.left = this.x;
    this.right = this.left + this.drawnWidth;
    this.top = this.y;
    this.bottom = this.top + this.drawnHeight;
};

SpikeMan.prototype.initialState = function(ctx){
    
    this.x = 200;
    this.y = 200;
    this.calculateBoundingBox();
    this.drawSprite(0, 0, this.x, this.y, ctx);
    this.currentColumn = 0;
    this.currentRow = 0;
    !this.isLoaded ? this.isLoaded = true : null;
    this.animationFinished ? this.animationFinished = false : true;
};

SpikeMan.prototype.drawSprite = function(column, row, x, y, ctx){
    
    ctx.drawImage(this.img, column * this.singleSpriteWidth, row * this.singleSpriteHeight, this.singleSpriteWidth, this.singleSpriteHeight, x, y, this.drawnWidth, this.drawnHeight);
};

SpikeMan.prototype.move = function(){
    this.calculateBoundingBox();
};

SpikeMan.prototype.toggleSpriteImage = function(){
    
};

SpikeMan.prototype.switchImage = function(){
    
    if(this.spriteSpeedCurrentTime++ === this.spriteSpeedChangeTime){
        this.toggleSpriteImage();
        this.spriteSpeedCurrentTime = 0;
    }

};

/***********************Ground********************************************/
function Ground(heightScale, widthScale){
    
    this.scaleY = heightScale;
    this.scaleX = widthScale;
};

Ground.prototype.createSprite = function(img, path, singleSpriteWidth, singleSpriteHeight, entireSpriteWidth, entireSpriteHeight){
    
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
   
    this.speed = 1;
    this.singleSpriteWidth = singleSpriteWidth;
    this.singleSpriteHeight = singleSpriteHeight;
    this.entireSpriteWidth = entireSpriteWidth;
    this.entireSpriteHeight = entireSpriteHeight;
    this.coloumnCount = Math.floor(this.entireSpriteWidth / this.singleSpriteWidth);
    this.rowCount = Math.floor(this.entireSpriteHeight / this.singleSpriteHeight);
    this.currentColumn;//keeps track of the column drawn
    this.currentRow;//keeps track of current row to be drawn
    this.drawnWidth = this.singleSpriteWidth / this.scaleX;
    this.drawnHeight = this.singleSpriteHeight / this.scaleY;
    this.baseLimit = 800 - this.drawnHeight;
    
    this.animationFinished = true;
    this.isLoaded = false;     
    
    this.left;
    this.right;
    this.top;
    this.bottom;
    
    return this;//allow chaining
};

Ground.prototype.calculateBoundingBox = function(){
    
    this.left = this.x;
    this.right = this.left + this.drawnWidth;
    this.top = this.y;
    this.bottom = this.top + this.drawnHeight;
};

Ground.prototype.initialState = function(ctx, column, row, x, y){
    
    this.x = x;
    this.y = y;
    this.calculateBoundingBox();
    this.drawSprite(column, row, this.x, this.y, ctx);
    this.currentColumn = column;
    this.currentRow = row;
    !this.isLoaded ? this.isLoaded = true : null;
    this.animationFinished ? this.animationFinished = false : true;
};

Ground.prototype.drawSprite = function(column, row, x, y, ctx){
    
    ctx.drawImage(this.img, column * this.singleSpriteWidth, row * this.singleSpriteHeight, this.singleSpriteWidth, this.singleSpriteHeight, x, y, this.drawnWidth, this.drawnHeight);
};

Ground.prototype.move = function(ctx){
    this.x -= this.speed;
    this.calculateBoundingBox();
    this.checkPosition();
    this.drawSprite(this.currentColumn, this.currentRow, this.x, this.y, ctx);
};

Ground.prototype.checkPosition = function(){
    
    if(this.right <= 0){
        this.animationFinished = true;
    }
};

Ground.prototype.reCalculateWidthScale = function(newScale){
    this.drawnWidth = this.singleSpriteWidth / newScale;
    this.scaleX = newScale
};

Ground.prototype.reCalculateHeightScale = function(newScale){
    this.drawnHeight = this.singleSpriteHeight / newScale;
    this.scaleY = newScale
    this.baseLimit = 800 - this.drawnHeight;
};
