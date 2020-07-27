function Animator(){}Animator.prototype.cubicEaseIn=function(t,n,o,r){return o*(t/=r)*t*t+n},Animator.prototype.cubicEaseOut=function(t,n,o,r){return t/=r,o*(--t*t*t+1)+n},Animator.prototype.cubicEaseInOut=function(t,n,o,r){return(t/=r/2)<1?o/2*t*t*t+n:o/2*((t-=2)*t*t+2)+n};
//# sourceMappingURL=animator.js.map
