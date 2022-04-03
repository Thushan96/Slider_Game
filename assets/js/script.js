$(document).ready(function (){
canvas.style.display='none';
});

function startGame(){
    const element=document.getElementById("loader_container");
    element.remove();
    canvas.style.display='block';
    startAnimations();

}
const canvas=document.getElementById("canvas1");

function startAnimations(){
    const ctx=canvas.getContext('2d');
    canvas.width=1600;
    canvas.height=720;
    let enemies=[];
    let score=0;
    let gameOver=false;
    const fullScreenButton=document.getElementById("btnFullScreen")

    const numOfEnemies=3;
    let enemiesArray=[];
    let cutterArray=[];
    let gameFrame=0;

    let cutterY=+300;
    let level=1;




// apply eventlistners to keyboard events & hold array of currently active keys
class InputHandler{
    constructor() {
        this.keys=[];
        this.touchY='';
        this.touchTreshhold=30;
        window.addEventListener('keydown',e=>{
            // check array down and the key is already in the array or not
            if (e.key==='ArrowDown' ||
                e.key==='ArrowUp' ||
                e.key==='ArrowLeft' ||
                e.key==='ArrowRight' &&
                this.keys.indexOf(e.key)===-1){
                this.keys.push(e.key);
            }else if (e.key==='Enter' && gameOver) restartGame();

        });
        window.addEventListener('keyup',e=>{
            // check array down and the key is already in the array or not
            if (e.key==='ArrowDown' ||
                e.key==='ArrowUp' ||
                e.key==='ArrowLeft' ||
                e.key==='ArrowRight' ){
                this.keys.splice(this.keys.indexOf(e.key),1);
            }
        });
        window.addEventListener('touchstart',e=>{
            //changedTouches-read only list that store touch objects-pageY,pageX
            this.touchY=e.changedTouches[0].pageY;
        });
        window.addEventListener('touchmove',e=>{
            const swipeDistance=e.changedTouches[0].pageY-this.touchY;
            if (swipeDistance<-this.touchTreshhold && this.keys.indexOf('swipe up')==-1){
                this.keys.push('swipe up');
            }else if (swipeDistance>this.touchTreshhold && this.keys.indexOf('swipe down')==-1){
                this.keys.push('swipe down');
                if (gameOver){
                    restartGame();
                }
            }

        });
        window.addEventListener('touchend',e=>{
           this.keys.splice(this.keys.indexOf('swipe up'),1);
           this.keys.splice(this.keys.indexOf('swipe down'),1);
        });
    }
}

function toggleFullScreen(){
    console.log(document.fullscreenElement);//returns full screen element-(null)not full screen
    if (!document.fullscreenElement){
        canvas.requestFullscreen().catch(err=>{//asynchronous return promise
           alert("error can't enable fullscreen mode :"+err.message)
        });
    }else{
        document.exitFullscreen();
    }
}

fullScreenButton.addEventListener('click',toggleFullScreen);



// draw update players according to key reactions
class Player{
    constructor(gameWidth,gameHeight) {
        this.gameWidth=gameWidth;
        this.gameHeight=gameHeight;
        this.width=200;
        this.height=200;
        this.x=100;
        this.y=this.gameHeight-this.height;
        this.image=document.getElementById("playerImage");
        this.frameX=0;
        this.maxFrame=5;
        this.fps=20;//frames per second-to slow down animation of image sheet
        this.frameTimer=0;//count from 0 to frameInterval
        this.frameInterval=1000/this.fps;//count how many milliseconds each frame last
        this.frameY=0;
        this.speed=0;
        this.vy=0;
        // to get to opposite when jumping
        this.weight=1;
    }
    restart(){
        this.x=100;
        this.y=this.gameHeight-this.height;
        this.frameX=0;
        this.maxFrame=5;
    }
    draw(context){
        // context.strokeStyle='white';
        // context.strokeRect(this.x,this.y,this.width,this.height);
        // context.beginPath();
        // context.arc(this.x+this.width/2,this.y+this.height/2+20,this.width/3,0,Math.PI*2);//X,Y,radius,startAngle,EndAngle
        // context.stroke();
        // context.strokeStyle='blue';
        // context.beginPath();
        // context.arc(this.x,this.y,this.width/2,0,Math.PI*2);//X,Y,radius,startAngle,EndAngle
        // context.stroke();

        // context.fillStyle='white';
        // context.fillRect(this.x,this.y,this.width,this.height);
        //image,(source x,source y,source w,source height)-to get image from sheet,
        // (x,y,width,height)where to place crop out canvas
        context.drawImage(this.image,this.frameX*this.width,this.frameY*this.height,this.width,this.height,this.x,this.y,this.width,this.height);
    }
    update(input,deltaTime,enemies,flyingEnemy,cutterEnemy){
        //check collapsing
        enemies.forEach(enemy=>{
           const dx=(enemy.x+enemy.width/2-20)-(this.x+this.width/2);
           const dy=(enemy.y+enemy.height/2)-(this.y+this.height/2+20);
           const distance=Math.sqrt(dx*dx+dy*dy);
           if (distance<enemy.width/3+this.width/3){
               gameOver=true;
           }
        });

        if(score>2){
            cutterEnemy.forEach(cutterEnemy=>{
                const dx=(cutterEnemy.x+cutterEnemy.width/2-20)-(this.x+this.width/2);
                const dy=(cutterEnemy.y+cutterEnemy.height/2)-(this.y+this.height/2+50);
                const distance=Math.sqrt(dx*dx+dy*dy);
                if (distance<cutterEnemy.width/3+this.width/3){
                    gameOver=true;
                }
            });
        }

        if(score>5){
            flyingEnemy.forEach(flyingEnemy=>{
                const dx=(flyingEnemy.x+flyingEnemy.width/2-20)-(this.x+this.width/2);
                const dy=(flyingEnemy.y+flyingEnemy.height/2)-(this.y+this.height/2+50);
                const distance=Math.sqrt(dx*dx+dy*dy);
                if (distance<flyingEnemy.width/3+this.width/3){
                    gameOver=true;
                }
            });
        }


        //image(sprite) sheet animation
        if (this.frameTimer>this.frameInterval){
            if (this.frameX>this.maxFrame){
                this.frameX=0;
            }else{
                this.frameX++;
            }
            this.frameTimer=0;
        }else {
            this.frameTimer+=deltaTime;
        }
        //horizontal movement- controls
        if (input.keys.indexOf('ArrowRight')>-1) {
            this.speed = 5;
        }else if (input.keys.indexOf('ArrowLeft')>-1){
            this.speed=-5;
        }else if ((input.keys.indexOf('ArrowUp')>-1 || input.keys.indexOf('swipe up')>-1) && this.onGround()){
            //velocity y to jump
            this.vy -=28;

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

    restart(){
        this.x=0;
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

 let enemyWidth=0;

class Enemy {
    constructor(gameWidth,gameHeight) {
        this.gameWidth=gameWidth;
        this.gameHeight=gameHeight;
        this.width=160;
        enemyWidth=this.width;
        this.height=119;
        this.image=document.getElementById("enemyImage");
        this.x=this.gameWidth;
        this.y=this.gameHeight-this.height;
        // for horizontal navigation of image sheet
        this.frameX=0;
        this.maxFrame=5;
        this.fps=20;//frames per second-to slow down animation of image sheet
        this.frameTimer=0;//count from 0 to frameInterval
        this.frameInterval=1000/this.fps;//count how many milliseconds each frame last
        this.speed=8;
        this.markedForDeletion=false;
    }
    draw(context){
        // context.strokeStyle='white';
        // context.strokeRect(this.x,this.y,this.width,this.height);
        // context.beginPath();
        // context.arc(this.x+this.width/3,this.y+this.height/2,this.width/2-20,0,Math.PI*2);//X,Y,radius,startAngle,EndAngle
        // context.stroke();
        // context.strokeStyle='blue';
        // context.beginPath();
        // context.arc(this.x,this.y,this.width/2,0,Math.PI*2);//X,Y,radius,startAngle,EndAngle
        // context.stroke();
        // (image,(sx,sy,sw,sh)-to get from image sheet,(x,y,width,height)-image positioning)
        context.drawImage(this.image,this.frameX*this.width,0,this.width,this.height,
            this.x,this.y,this.width,this.height);
    }

    update(deltaTime){
        if (this.frameTimer>this.frameInterval){//to slow down the image frame rate
            if(this.frameX>=this.maxFrame){ //cycle between frames
                this.frameX=0;
            }else{
                this.frameX++;
            }
            this.frameTimer=0;
        }else{
            this.frameTimer+=deltaTime;
        }
        this.x-=this.speed;
        if (this.x<0-this.width){//to delete passed enemies
            this.markedForDeletion=true;
            score++;
        }
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
        enemy.update(deltaTime);
    });
    enemies=enemies.filter(enemy=>!enemy.markedForDeletion);//passed enemy deleted

    if(score>2){
        level=2;
        cutterArray.forEach(enemy=>{//    new Flying Enemy
            enemy.draw();
            enemy.update();
        });
    }
    if(score>5){
        level=3;
        cutterArray=[];
        enemiesArray.forEach(enemy=>{//    new Flying Enemy
            enemy.draw();
            enemy.update();
        });
    }


}

class FlyingEnemy{
    constructor() {
        this.image=new Image();
        this.image.src='assets/images/enemy2.png';
        this.speed=Math.random()*4+1;
        this.spriteWidth=293;
        this.spriteHeight=155
        this.width=this.spriteWidth/2.5;
        this.height=this.spriteHeight/2.5;
        this.x=Math.random()*(canvas.width-this.width);
        this.y=Math.random()*(canvas.height-this.height);
        this.frame=0;
        this.flapSpeed=Math.floor(Math.random()*3+1);//get integers between 1 and 4


    }

    update(){
        this.x+=this.speed;
        this.y+=Math.random() * 5 - 2.5;
        if (this.x+this.width>canvas.width-this.width){
            this.x=(this.width-canvas.width);
        }

        if (gameFrame%this.flapSpeed===0){
            this.frame>4 ? this.frame=0 :this.frame++;//if frame more than 4 set back to zero else frame++
        }
    }

    draw(){
        ctx.drawImage(this.image,this.frame*this.spriteWidth,0,this.spriteWidth,this.spriteHeight,this.x,this.y,this.width,this.height);
    }
}

    function createFlyingEnemy(){
        for (let i=0;i<numOfEnemies;i++){
            enemiesArray.push(new FlyingEnemy());
        }
    };
    createFlyingEnemy();



    class Cutter{
        constructor() {
            this.image=new Image();
            this.image.src='assets/images/enemy4.png';
            this.speed=Math.random()*4+1;
            this.spriteWidth=213;
            this.spriteHeight=212;
            this.width=this.spriteWidth/2.5;//make relative width relative to sprite sheet
            this.height=this.spriteHeight/2.5;
            this.x=Math.random()*(canvas.width-this.width);
            this.y=cutterY;
            this.frame=0;
            this.flapSpeed=Math.floor(Math.random()*3+1);//get integers between 1 and 4


        }

        update(){
            this.x -=this.speed;
            // this.y+=Math.random() * 5 - 2.5;
            if (this.x+this.width<0){
                this.x=canvas.width;
            }

            if (gameFrame%this.flapSpeed===0){
                this.frame>7 ? this.frame=0 :this.frame++;//if frame more than 4 set back to zero else frame++
            }
        }

        draw(){
            ctx.drawImage(this.image,this.frame*this.spriteWidth,0,this.spriteWidth,this.spriteHeight,this.x,this.y,this.width,this.height);
        }
    }

    function createCutterEnemy(){
        for (let i=0;i<numOfEnemies;i++){
            cutterArray.push(new Cutter());
        }
    };
    createCutterEnemy();




// display score,messages
function displayStatusText(context){
    context.textAlign='left';
    context.font='40px Helvetica';
    context.fillStyle='black';
    context.fillText('Score :'+ score,20,50);//text we want to draw +x and y coordinates
    context.fillStyle='white';
    context.fillText('Score :'+ score,20,52);//2 times to get shadow
    context.fillStyle='white';
    context.fillText('Level - '+ level,20,88);//2 times to get shadow
    context.fillStyle='black';



    if (gameOver){
        context.textAlign='center';
        context.fillStyle='black';
        context.fillText('Game Over Press Enter or Swipe down to Restart!',canvas.width/2,200);
        context.fillStyle='white';
        context.fillText('Game Over Press Enter or Swipe down to Restart!',canvas.width/2+2,200);
    }
}

    function restartGame(){
        player.restart();
        background.restart();
        enemies=[];
        enemiesArray=[];
        cutterArray=[];
        score=0;
        level=1;
        gameOver=false;
        createFlyingEnemy();
        createCutterEnemy();
        animate(0);
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
        background.update();
        player.draw(ctx);
        //pass keyboard input
        player.update(input,deltaTime,enemies, enemiesArray,cutterArray);
        handleEnemies(deltaTime);
        displayStatusText(ctx);
        gameFrame++;
        // built in method to loop
        if(!gameOver){
            requestAnimationFrame(animate)
        }
    }

    animate(0);

}
