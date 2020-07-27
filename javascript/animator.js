function Animator(){
    
};

Animator.prototype.cubicEaseIn = function (currentTime, startValue, distance, totalTime) {
	currentTime /= totalTime;
	return distance * currentTime * currentTime * currentTime + startValue;
};

Animator.prototype.cubicEaseOut = function (currentTime, startValue, distance, totalTime){
	
    currentTime /= totalTime;
	currentTime--;
	return distance * (currentTime * currentTime * currentTime + 1) + startValue;
};

Animator.prototype.cubicEaseInOut = function (currentTime, startValue, distance, totalTime){
    
   currentTime /= totalTime/2;
    
	if (currentTime < 1) return distance / 2 * currentTime*currentTime * currentTime + startValue;
	currentTime -= 2;
	return distance / 2 * (currentTime * currentTime * currentTime + 2) + startValue;
};