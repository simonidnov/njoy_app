var forbans = function() {
    this.iterations = 0;
    this.charArray  = [];
    this.animated   = false;
    this.duration   = 0;
    this.charSet    = [];
    this.charMax    = 0;
    this.target     = null;
    this.value      = "";
    this.delta      = 0;
}
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
forbans.prototype.init = function(target, options, callback){
    if(typeof target === "undefined" || target === null){
        callback({status:"error", msg:"your target is undefined"});
        return false;
    } 
    this.target = target;

    if(typeof options.charMax === "undefined"){
        callback({status:"error", msg:"you need a charMax param to create grid"}); 
        return false;
    } 
    this.charMax = options.charMax;
    
    if(typeof options.value === "undefined") options.value = target.innerHTML; 
    
    if(typeof options.delta !== "undefined") this.delta = options.delta;
    if(typeof options.duration !== "undefined") this.duration = options.duration;
    if(typeof options.iterations !== "undefined") this.iterations = options.iterations;

    this.createGrid();
    //this.setValue(options.value);
}
forbans.prototype.createGrid = function(){
    if(this.target.classList.value.indexOf('forbans') === -1) this.target.classList.add("forbans");
    //<div class="flip"></div><div class="flap"></div>
    var flapTemplate = '<div class="flipflap" data-value=""></div>';
    this.target.innerHTML = flapTemplate.repeat(this.charMax);
    this.charSet = this.target.getElementsByClassName('flipflap');
}
forbans.prototype.setChar = function(letter, value, delay){
    var possibility = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; 
    letter.setAttribute('data-value', value);
    setTimeout(function(){
        letter.innerHTML = value;
        /*
        letter.getElementsByClassName('flip')[0].innerHTML = value;
        letter.getElementsByClassName('flap')[0].innerHTML = value;
        if(letter.classList.value.indexOf('turn') !== -1){
            letter.classList.remove('turn');
        }else{
            letter.classList.add('turn');
        }
        */
    }.bind(this), 20+(50*delay));
}

forbans.prototype.setValue = function(value){
    var space = " ";
        
    this.value = value;
    
    this.target = document.getElementById(this.target.getAttribute('id'));
    this.charSet = this.target.getElementsByClassName('flipflap');

    (value.length < this.charMax)? this.value += space.repeat(this.charMax - value.length) : this.value = value.substring(0, this.charMax);
    this.charArray = this.value.split('');

    this.charArray.forEach(function(char, index){ 
        var character = this.charSet[index];
        //character.getElementsByClassName('flip')[0].innerHTML;
        if(character.innerHTML !== char){
            this.setChar(character, char, index);
        }
    }.bind(this));

    var title1 = new TimelineMax();
    //title1.to(".button", 0, {visibility: 'hidden', opacity: 0})
    title1.staggerFromTo(
        this.charSet, 
        0.3,
        {ease: Power4.easeOut, scaleY:-1},
        {ease: Power4.easeOut, scaleY:1}, 
        0.05
    );
}