window.addEventListener("load", function (){
    const canvas=document.getElementById("canvas1");
    const ctx=canvas.getContext('2d');
    canvas.width=800;
    canvas.height=720;
    let enemies=[];



// apply eventlistners to keyboard events & hold array of currently active keys
class InputHandler{
    constructor() {
        this.keys=[];
        window.addEventListener('keydown',e=>{
            // check array down and the key is already in the array or not
            if (e.key=="ArrowDown" ||
                e.key=='ArrowUp' ||
                e.key=='ArrowLeft' ||
                e.key=='ArrowRight' 
                && this.keys.indexOf(e.key)==-1){
                this.keys.push(e.key);
            }

        });
        window.addEventListener('keyup',e=>{
            // check array down and the key is already in the array or not
            if (e.key=="ArrowDown" || e.key=='ArrowUp' ||
            e.key=='ArrowLeft' ||
            e.key=='ArrowRight' ){
                this.keys.splice(this.keys.indexOf(e.key),1);
            }
        });
    }
}



// draw update players according to key reactions
class Player{
    constructor(gameWidth,gameHeight) {
        this.gameWidth=gameWidth;
        this.gameHeight=gameHeight;
        this.width=200;
        this.height=200;
        this.x=0;
        this.y=this.gameHeight-this.height;
        this.image=document.getElementById("playerImage");
        this.frameX=0;
        this.frameY=0;
        this.speed=0;
        this.vy=0;
        // to get to opposite when jumping
        this.weight=1;
    }
    draw(context){
        context.fillStyle='white';
        // context.fillRect(this.x,this.y,this.width,this.height);
        //image,(source x,source y,source w,source height)-to get image from sheet,
        // (x,y,width,height)where to place crop out canvas
        context.drawImage(this.image,this.frameX*this.width,this.frameY*this.height,this.width,this.height,this.x,this.y,this.width,this.height);
    }
    update(input){
        //horizontal movement

        if (input.keys.indexOf('ArrowRight')>-1) {
            this.speed = 5;
        }else if (input.keys.indexOf('ArrowLeft')>-1){
            this.speed=-5;
        }else if (input.keys.indexOf('ArrowUp')>-1 && this.onGround()){
            //velocity y to jump
            this.vy -=32;

        }else{
            this.speed=0;

        }
        //to stop moving from corners to out
        // horizontal
        this.x+=this.speed;
        if (this.x<0){
            this.x=0;
        }else if (this.x>this.gameWidth-this.width){
            this.x=this.gameWidth-this.width;
        }
        //vertical
        this.y+=this.vy;
        if (!this.onGround()){
            this.vy+=this.weight;
            this.frameY=1;
        }else{
            // after landing
            this.vy=0;
            this.frameY=0;
        }
        // check jumped or not reset to bottom
        if (this.y>this.gameHeight-this.height){
            this.y=this.gameHeight-this.height;
        }
    }
    // to check whether jumped or not
    onGround(){
        return this.y>=this.gameHeight-this.height;
    }

}

// handle endless scrolling backgrounds
class Background{
    constructor(gameWidth,gameHeight) {
        this.gameWidth=gameWidth;
        this.gameHeight=gameHeight;
        this.image=document.getElementById("backgroundImage");
        this.x=0;
        this.y=0;
        this.width=2400;
        this.height=720;
        this.speed=7;
    }

    draw(context){
        context.drawImage(this.image,this.x,this.y,this.width,this.height);
        // to make it looks like endless add image again
        context.drawImage(this.image,this.x+this.width-this.speed,this.y,this.width,this.height);
    }

    update(){
        //to scroll to left
        this.x-=this.speed;
        // to check x to image width
        if (this.x<0-this.width){
            this.x=0;
        }

    }

}

class Enemy {
    constructor(gameWidth,gameHeight) {
        this.gameWidth=gameWidth;
        this.gameHeight=gameHeight;
        this.width=160;
        this.height=119;
        this.image=document.getElementById("enemyImage");
        this.x=this.gameWidth;
        this.y=this.gameHeight-this.height;
        // for horizontal navigation of image sheet
        this.frameX=0;
        this.speed=8;
    }
    draw(context){
        // (image,(sx,sy,sw,sh)-to get from image sheet,(x,y,width,height)-image positioning)
        context.drawImage(this.image,this.frameX*this.width,0,this.width,this.height,this.x,this.y,this.width,this.height);
    }

    update(){
        this.x-=this.speed;
    }
}
// add remove animate enemies
function handleEnemies(deltaTime){
    if (enemyTimer>enemyInterval+randomEnemyInterval){
        enemies.push(new Enemy(canvas.width,canvas.height));
        randomEnemyInterval=Math.random() * 1000 +500;
        enemyTimer=0;
    }else{
        enemyTimer+=deltaTime;
    }
    // call draw and update method on each enemy added to list
    enemies.forEach(enemy=>{
        enemy.draw(ctx);
        enemy.update();
    })
}



// display score,messages
function displayStatusText(){

}


    const input=new InputHandler();
    const player=new Player(canvas.width,canvas.height);
    const background=new Background(canvas.width,canvas.height);


    let lastTime=0;
    let enemyTimer=0;
    let enemyInterval=2000;
    let randomEnemyInterval=Math.random() * 1000 +500;

    function animate(timeStamp){
        // to get difference from this loop and last loop
        const deltaTime=timeStamp-lastTime
        lastTime=timeStamp;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        background.draw(ctx);
        // background.update();
        player.draw(ctx);
        //pass keyboard input
        player.update(input);
        handleEnemies(deltaTime);
        // built in method to loop
        requestAnimationFrame(animate);
    }

    animate(0);

});